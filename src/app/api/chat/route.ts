import { NextRequest } from 'next/server';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  backfillRewriteVersionFromLegacy,
  createChatMessage,
  createRewriteVersion,
  getChatMessagesBySession,
  getOrCreateChatSession,
  getRewriteVersionHistory,
} from '@/lib/supabase/queries';
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiting';

export const runtime = 'nodejs';
export const maxDuration = 60;

const QuerySchema = z.object({
  analysisId: z.string().uuid('A valid analysisId is required.'),
});

const PostSchema = z.object({
  analysisId: z.string().uuid('A valid analysisId is required.'),
  message: z.string().trim().min(1, 'Message is required.').max(5000).optional(),
  action: z.enum(['chat', 'regenerate']).default('chat'),
  preferences: z.object({
    tone: z.string().trim().min(1).optional(),
    focusArea: z.string().trim().min(1).optional(),
    seniority: z.string().trim().min(1).optional(),
  }).optional(),
});

const RewriteSectionSchema = z.object({
  sections: z.array(z.object({
    title: z.string(),
    original: z.string(),
    improved: z.string(),
  })),
});

function getGoogleModel() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.');
  }
  const google = createGoogleGenerativeAI({ apiKey });
  return google('gemini-2.5-flash');
}

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, supabase };
  }

  return { user, supabase };
}

async function getAnalysisContext(analysisId: string, userId: string) {
  const supabase = await createClient();

  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .select('id, job_title, job_description, enhanced_analysis, resume_id')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .single();

  if (analysisError || !analysis) {
    throw new Error('Analysis not found');
  }

  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('parsed_text')
    .eq('id', analysis.resume_id)
    .eq('user_id', userId)
    .single();

  if (resumeError || !resume?.parsed_text) {
    throw new Error('Resume text not found');
  }

  return {
    analysis,
    resumeText: resume.parsed_text,
  };
}

function buildCoachPrompt(
  jobTitle: string | null,
  jobDescription: string | null,
  resumeText: string,
  enhancedAnalysis: unknown,
  userMessage: string,
  recentConversation: string,
) {
  const MAX_RESUME_CHARS = 14000;
  const resumeContext = resumeText.length > MAX_RESUME_CHARS
    ? `${resumeText.slice(0, MAX_RESUME_CHARS)}\n\n[Resume text truncated for context length]`
    : resumeText;

  const analysisContext = enhancedAnalysis
    ? JSON.stringify(enhancedAnalysis)
    : 'No enhanced analysis available.';

  return `You are an expert resume coach. Keep responses concise, practical, and encouraging.

Rules:
1. Give specific improvement advice tied to resume outcomes.
2. Never suggest fabricating achievements, skills, or credentials.
3. If user asks to regenerate full resume, ask clarifying questions first if tone/focus/seniority are missing.
4. Prefer bullet points for action steps.
5. Base your advice on the actual resume content provided below.

Target role: ${jobTitle || 'Not provided'}
Job description:\n${jobDescription || 'Not provided'}

Current resume text:\n${resumeContext}

Current analysis context:\n${analysisContext}

Recent conversation:\n${recentConversation || 'No previous messages'}

User message:\n${userMessage}`;
}

function buildRewritePrompt({
  resumeText,
  jobTitle,
  jobDescription,
  userGuidance,
  tone,
  focusArea,
  seniority,
}: {
  resumeText: string;
  jobTitle: string | null;
  jobDescription: string | null;
  userGuidance?: string;
  tone: string;
  focusArea: string;
  seniority: string;
}) {
  return `You are an expert resume writer. Rewrite the following resume to be ATS-friendly and aligned with the target job.

Target role: ${jobTitle || 'Not provided'}
Target seniority: ${seniority}
Tone/style: ${tone}
Primary focus area: ${focusArea}
${jobDescription ? `Job description:\n${jobDescription}` : ''}
${userGuidance ? `User guidance:\n${userGuidance}` : ''}

Rules:
1. Break the resume into logical sections (Professional Summary, Experience, Skills, Education, etc.)
2. For each section, provide the ORIGINAL text and IMPROVED text.
3. Use strong action verbs and quantified outcomes when evidence exists.
4. Keep the improved text realistic. Do not fabricate credentials, companies, roles, dates, or metrics.
5. Return valid JSON only.

Original resume text:
---
${resumeText}
---

Return JSON in this shape:
{
  "sections": [
    { "title": "Professional Summary", "original": "...", "improved": "..." },
    { "title": "Experience", "original": "...", "improved": "..." }
  ]
}`;
}

export async function GET(request: NextRequest) {
  const { user } = await requireUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parseResult = QuerySchema.safeParse({
    analysisId: request.nextUrl.searchParams.get('analysisId') || undefined,
  });

  if (!parseResult.success) {
    return new Response(JSON.stringify({ error: parseResult.error.issues[0]?.message || 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await getAnalysisContext(parseResult.data.analysisId, user.id);
    const session = await getOrCreateChatSession(parseResult.data.analysisId, user.id);
    const messages = await getChatMessagesBySession(session.id, user.id);

    // Backfill rewrite versions from legacy improved_sections if needed.
    await backfillRewriteVersionFromLegacy(parseResult.data.analysisId, user.id);
    const versions = await getRewriteVersionHistory(parseResult.data.analysisId, user.id, 20);

    return new Response(JSON.stringify({ session, messages, versions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load chat context';
    const status = message === 'Analysis not found' ? 404 : 500;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(request: NextRequest) {
  const { user } = await requireUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rateLimit = rateLimiter.check(user.id, RATE_LIMITS.CHAT.limit, RATE_LIMITS.CHAT.windowMs);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parseResult = PostSchema.safeParse(rawBody);

  if (!parseResult.success) {
    return new Response(JSON.stringify({ error: parseResult.error.issues[0]?.message || 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { analysisId, action, message, preferences } = parseResult.data;

  try {
    const { analysis, resumeText } = await getAnalysisContext(analysisId, user.id);
    const session = await getOrCreateChatSession(analysisId, user.id);

    if (message) {
      await createChatMessage(session.id, analysisId, user.id, 'user', message);
    }

    if (action === 'regenerate') {
      const tone = preferences?.tone;
      const focusArea = preferences?.focusArea;
      const seniority = preferences?.seniority;

      if (!tone || !focusArea || !seniority) {
        const clarification = 'Before I regenerate, please provide your preferred tone, focus area, and target seniority so I can tailor the rewrite correctly.';
        const assistantMessage = await createChatMessage(
          session.id,
          analysisId,
          user.id,
          'assistant',
          clarification,
          {
            requiresClarification: true,
            missingFields: {
              tone: !tone,
              focusArea: !focusArea,
              seniority: !seniority,
            },
          },
        );

        const messages = await getChatMessagesBySession(session.id, user.id);
        return new Response(JSON.stringify({
          assistant: assistantMessage,
          messages,
          requiresClarification: true,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const prompt = buildRewritePrompt({
        resumeText,
        jobTitle: analysis.job_title,
        jobDescription: analysis.job_description,
        userGuidance: message,
        tone,
        focusArea,
        seniority,
      });

      const { object } = await generateObject({
        model: getGoogleModel(),
        schema: RewriteSectionSchema,
        prompt,
        temperature: 0.25,
        abortSignal: AbortSignal.timeout(60000),
      });

      const version = await createRewriteVersion(
        analysisId,
        user.id,
        object.sections,
        {
          action: 'chat-regenerate',
          tone,
          focusArea,
          seniority,
          instruction: message || null,
        },
      );

      const summary = `Done. I generated version ${version.version_number} with a ${tone} tone focused on ${focusArea} for ${seniority} level targeting.`;
      const assistantMessage = await createChatMessage(
        session.id,
        analysisId,
        user.id,
        'assistant',
        summary,
        {
          action: 'regenerate',
          versionNumber: version.version_number,
          rewriteVersionId: version.id,
        },
      );

      const messages = await getChatMessagesBySession(session.id, user.id);
      const versions = await getRewriteVersionHistory(analysisId, user.id, 20);

      return new Response(JSON.stringify({
        assistant: assistantMessage,
        messages,
        versions,
        regenerated: true,
        latestVersion: version,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const existingMessages = await getChatMessagesBySession(session.id, user.id);
    const recentConversation = existingMessages
      .slice(-8)
      .map((entry) => `${entry.role}: ${entry.content}`)
      .join('\n');

    const coachPrompt = buildCoachPrompt(
      analysis.job_title,
      analysis.job_description,
      resumeText,
      analysis.enhanced_analysis,
      message || 'Give me actionable resume advice based on this analysis.',
      recentConversation,
    );

    const { text } = await generateText({
      model: getGoogleModel(),
      prompt: coachPrompt,
      temperature: 0.4,
      abortSignal: AbortSignal.timeout(60000),
    });

    const assistantMessage = await createChatMessage(
      session.id,
      analysisId,
      user.id,
      'assistant',
      text,
      { action: 'chat' },
    );

    const messages = await getChatMessagesBySession(session.id, user.id);

    return new Response(JSON.stringify({ assistant: assistantMessage, messages }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Request failed';
    const status = message === 'Analysis not found' || message === 'Resume text not found' ? 404 : 500;

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
