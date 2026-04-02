import { NextRequest } from 'next/server';
import { generateObject, generateText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import {
  backfillRewriteVersionFromLegacy,
  createApplicationPackage,
  createChatMessage,
  createRewriteVersion,
  getApplicationPackageHistory,
  getChatMessagesBySession,
  getCoachProfile,
  getOrCreateChatSession,
  getRewriteVersionHistory,
  upsertCoachProfile,
} from '@/lib/supabase/queries';
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiting';
import {
  buildApplicationPackagePrompt,
  buildCoachConversationPrompt,
  buildRewriteGenerationPrompt,
  getApplicationPackageJsonShape,
} from '@/lib/coachPrompts';

export const runtime = 'nodejs';
export const maxDuration = 60;

const QuerySchema = z.object({
  analysisId: z.string().uuid('A valid analysisId is required.'),
});

const CoachProfileSchema = z.object({
  targetRole: z.string().trim().max(160).optional(),
  targetSeniority: z.string().trim().max(120).optional(),
  tone: z.string().trim().max(120).optional(),
  focusArea: z.string().trim().max(180).optional(),
  targetCompanies: z.array(z.string().trim().min(1).max(120)).max(10).optional(),
  mustKeep: z.array(z.string().trim().min(1).max(180)).max(10).optional(),
  topAchievements: z.array(z.string().trim().min(1).max(240)).max(12).optional(),
  careerStory: z.string().trim().max(3000).optional(),
  constraints: z.string().trim().max(3000).optional(),
  jobSearchPriorities: z.array(z.string().trim().min(1).max(180)).max(10).optional(),
  missingDetails: z.array(z.string().trim().min(1).max(180)).max(12).optional(),
  intakeStatus: z.enum(['draft', 'ready']).optional(),
});

const PostSchema = z.object({
  analysisId: z.string().uuid('A valid analysisId is required.'),
  message: z.string().trim().min(1, 'Message is required.').max(5000).optional(),
  action: z.enum(['chat', 'regenerate', 'save_profile', 'generate_package']).default('chat'),
  preferences: z.object({
    tone: z.string().trim().min(1).optional(),
    focusArea: z.string().trim().min(1).optional(),
    seniority: z.string().trim().min(1).optional(),
  }).optional(),
  profile: CoachProfileSchema.optional(),
});

const RewriteSectionSchema = z.object({
  sections: z.array(z.object({
    title: z.string(),
    original: z.string(),
    improved: z.string(),
  })),
});

const ApplicationPackageSchema = z.object({
  package_name: z.string(),
  positioning_summary: z.string(),
  recruiter_pitch: z.string(),
  cover_letter: z.string(),
  linkedin_headline: z.string(),
  linkedin_about: z.string(),
  interview_story: z.string(),
  ats_keywords: z.array(z.string()),
  truth_guardrails: z.array(z.string()),
  follow_up_questions: z.array(z.string()),
  evidence_map: z.array(z.object({
    claim: z.string(),
    source: z.enum(['resume', 'analysis', 'chat', 'intake']),
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

function normalizeList(values?: string[]) {
  return (values || []).map((value) => value.trim()).filter(Boolean);
}

function buildIntakeChecklist(profile: Awaited<ReturnType<typeof getCoachProfile>>) {
  const checklist: string[] = [];

  if (!profile?.target_role) checklist.push('Set the target role you want this resume to win.');
  if (!profile?.target_seniority) checklist.push('Choose the seniority level you want the resume to signal.');
  if (!profile?.focus_area) checklist.push('Pick the primary focus area for rewriting.');
  if (!profile?.top_achievements?.length) checklist.push('Add 2-3 achievements you most want recruiters to notice.');
  if (!profile?.career_story) checklist.push('Describe the career story or positioning you want the resume to tell.');
  if (!profile?.job_search_priorities?.length) checklist.push('State what matters most in this search, like remote roles, startups, or senior growth.');

  return checklist;
}

async function loadCoachPayload(analysisId: string, userId: string) {
  const session = await getOrCreateChatSession(analysisId, userId);
  const [messages, coachProfile, rewriteVersions, packageVersions] = await Promise.all([
    getChatMessagesBySession(session.id, userId),
    getCoachProfile(analysisId, userId),
    getRewriteVersionHistory(analysisId, userId, 20),
    getApplicationPackageHistory(analysisId, userId, 10),
  ]);

  return {
    session,
    messages,
    coachProfile,
    intakeChecklist: buildIntakeChecklist(coachProfile),
    versions: rewriteVersions,
    packageVersions,
    latestPackage: packageVersions[0] || null,
  };
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
    await backfillRewriteVersionFromLegacy(parseResult.data.analysisId, user.id);
    const payload = await loadCoachPayload(parseResult.data.analysisId, user.id);

    return new Response(JSON.stringify(payload), {
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

  const { analysisId, action, message, preferences, profile } = parseResult.data;

  try {
    const { analysis, resumeText } = await getAnalysisContext(analysisId, user.id);
    const session = await getOrCreateChatSession(analysisId, user.id);

    let coachProfile = await getCoachProfile(analysisId, user.id);

    if (profile || preferences) {
      coachProfile = await upsertCoachProfile(analysisId, user.id, {
        targetRole: profile?.targetRole ?? coachProfile?.target_role ?? analysis.job_title ?? undefined,
        targetSeniority: profile?.targetSeniority ?? preferences?.seniority ?? coachProfile?.target_seniority ?? undefined,
        tone: profile?.tone ?? preferences?.tone ?? coachProfile?.tone ?? undefined,
        focusArea: profile?.focusArea ?? preferences?.focusArea ?? coachProfile?.focus_area ?? undefined,
        targetCompanies: normalizeList(profile?.targetCompanies ?? coachProfile?.target_companies),
        mustKeep: normalizeList(profile?.mustKeep ?? coachProfile?.must_keep),
        topAchievements: normalizeList(profile?.topAchievements ?? coachProfile?.top_achievements),
        careerStory: profile?.careerStory ?? coachProfile?.career_story ?? undefined,
        constraints: profile?.constraints ?? coachProfile?.constraints ?? undefined,
        jobSearchPriorities: normalizeList(profile?.jobSearchPriorities ?? coachProfile?.job_search_priorities),
        missingDetails: normalizeList(profile?.missingDetails ?? coachProfile?.missing_details),
        intakeStatus: profile?.intakeStatus ?? coachProfile?.intake_status ?? 'draft',
      });
    }

    if (action === 'save_profile') {
      if (!coachProfile) {
        coachProfile = await upsertCoachProfile(analysisId, user.id, {
          targetRole: analysis.job_title ?? undefined,
          intakeStatus: 'draft',
        });
      }

      const payload = await loadCoachPayload(analysisId, user.id);
      return new Response(JSON.stringify({ saved: true, ...payload }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (message) {
      await createChatMessage(session.id, analysisId, user.id, 'user', message);
    }

    const existingMessages = await getChatMessagesBySession(session.id, user.id);
    const recentConversation = existingMessages
      .slice(-12)
      .map((entry) => `${entry.role}: ${entry.content}`)
      .join('\n');

    if (action === 'generate_package') {
      const prompt = `${buildApplicationPackagePrompt({
        jobTitle: analysis.job_title,
        jobDescription: analysis.job_description,
        resumeText,
        enhancedAnalysis: analysis.enhanced_analysis,
        recentConversation,
        profile: coachProfile,
      })}

${getApplicationPackageJsonShape()}`;

      const { object } = await generateObject({
        model: getGoogleModel(),
        schema: ApplicationPackageSchema,
        prompt,
        temperature: 0.35,
        abortSignal: AbortSignal.timeout(60000),
      });

      const applicationPackage = await createApplicationPackage(
        analysisId,
        user.id,
        coachProfile?.id || null,
        object.package_name,
        object,
        {
          action: 'generate-package',
          targetRole: coachProfile?.target_role || analysis.job_title || null,
          tone: coachProfile?.tone || preferences?.tone || null,
          focusArea: coachProfile?.focus_area || preferences?.focusArea || null,
        },
      );

      const assistantMessage = await createChatMessage(
        session.id,
        analysisId,
        user.id,
        'assistant',
        `I generated application package version ${applicationPackage.version_number}. Review the recruiter pitch, cover letter, LinkedIn copy, and interview story in the coach workspace.`,
        {
          action: 'generate_package',
          packageVersionId: applicationPackage.id,
          versionNumber: applicationPackage.version_number,
        },
      );

      const payload = await loadCoachPayload(analysisId, user.id);
      return new Response(JSON.stringify({
        assistant: assistantMessage,
        generatedPackage: applicationPackage,
        ...payload,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'regenerate') {
      const tone = coachProfile?.tone || preferences?.tone;
      const focusArea = coachProfile?.focus_area || preferences?.focusArea;
      const seniority = coachProfile?.target_seniority || preferences?.seniority;

      if (!tone || !focusArea || !seniority) {
        const clarification = 'Before I generate the full resume, save your target seniority, tone, and focus area in the coach intake so I can tailor the rewrite properly.';
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

        const payload = await loadCoachPayload(analysisId, user.id);
        return new Response(JSON.stringify({
          assistant: assistantMessage,
          requiresClarification: true,
          ...payload,
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const rewritePrompt = `${buildRewriteGenerationPrompt({
        jobTitle: analysis.job_title,
        jobDescription: analysis.job_description,
        resumeText,
        enhancedAnalysis: analysis.enhanced_analysis,
        recentConversation,
        profile: coachProfile,
        userGuidance: message,
      })}

Return JSON in this shape:
{
  "sections": [
    { "title": "Professional Summary", "original": "...", "improved": "..." },
    { "title": "Experience", "original": "...", "improved": "..." }
  ]
}`;

      const { object } = await generateObject({
        model: getGoogleModel(),
        schema: RewriteSectionSchema,
        prompt: rewritePrompt,
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
          targetRole: coachProfile?.target_role || analysis.job_title || null,
          instruction: message || null,
        },
      );

      const assistantMessage = await createChatMessage(
        session.id,
        analysisId,
        user.id,
        'assistant',
        `Done. I generated rewrite version ${version.version_number} with a ${tone} tone, ${focusArea} focus, and ${seniority} positioning.`,
        {
          action: 'regenerate',
          rewriteVersionId: version.id,
          versionNumber: version.version_number,
        },
      );

      const payload = await loadCoachPayload(analysisId, user.id);
      return new Response(JSON.stringify({
        assistant: assistantMessage,
        regenerated: true,
        latestVersion: version,
        ...payload,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const coachPrompt = buildCoachConversationPrompt({
      jobTitle: analysis.job_title,
      jobDescription: analysis.job_description,
      resumeText,
      enhancedAnalysis: analysis.enhanced_analysis,
      recentConversation,
      profile: coachProfile,
      userMessage: message || 'Coach me on how to improve this resume for the target role.',
    });

    const { text } = await generateText({
      model: getGoogleModel(),
      prompt: coachPrompt,
      temperature: 0.45,
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

    const payload = await loadCoachPayload(analysisId, user.id);
    return new Response(JSON.stringify({ assistant: assistantMessage, ...payload }), {
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
