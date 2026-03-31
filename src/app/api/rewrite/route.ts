import { NextRequest } from 'next/server';
import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

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

function buildRewritePrompt(
  resumeText: string,
  jobTitle: string | null,
  jobDescription: string | null,
  improvements: Array<{ title: string; description: string; specific_actions: string[] }>,
  missingSkills: Array<{ name: string; priority: string }>,
): string {
  const improvementContext = improvements.length > 0
    ? `\nAnalysis-identified improvements:\n${improvements.map(i => `- ${i.title}: ${i.description}${i.specific_actions.length ? ` (Actions: ${i.specific_actions.join('; ')})` : ''}`).join('\n')}`
    : '';

  const missingSkillsContext = missingSkills.length > 0
    ? `\nMissing skills to incorporate where relevant:\n${missingSkills.map(s => `- ${s.name} (${s.priority} priority)`).join('\n')}`
    : '';

  return `You are an expert resume writer. Rewrite the following resume to be more impactful, ATS-friendly, and aligned with the target job.

${jobTitle ? `Target role: ${jobTitle}` : ''}
${jobDescription ? `Job description:\n${jobDescription}` : ''}
${improvementContext}
${missingSkillsContext}

Rules:
1. Break the resume into logical sections (Professional Summary, Experience, Skills, Education, etc.)
2. For each section, provide the ORIGINAL text (exactly as it appears) and the IMPROVED text (your rewrite)
3. Use strong action verbs, quantify achievements where possible, and incorporate relevant keywords
4. Keep the improved text realistic — do not fabricate experience or credentials
5. Return valid JSON only

Original resume text:
---
${resumeText}
---

Return JSON in this exact shape:
{
  "sections": [
    { "title": "Professional Summary", "original": "...", "improved": "..." },
    { "title": "Experience", "original": "...", "improved": "..." },
    { "title": "Skills", "original": "...", "improved": "..." },
    { "title": "Education", "original": "...", "improved": "..." }
  ]
}

Include ALL content from the resume across sections. Do not omit any jobs, skills, or education entries.`;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.analysisId) {
    return new Response(JSON.stringify({ error: 'analysisId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const analysisId: string = body.analysisId;

  // Fetch the analysis — also checks for existing improved_sections
  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .select('id, job_title, job_description, enhanced_analysis, resume_id, user_id, improved_sections')
    .eq('id', analysisId)
    .eq('user_id', user.id)
    .single();

  if (analysisError || !analysis) {
    return new Response(JSON.stringify({ error: 'Analysis not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // If improved sections already exist, return them immediately
  if (analysis.improved_sections) {
    return new Response(JSON.stringify(analysis.improved_sections), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Fetch the original resume text
  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('parsed_text')
    .eq('id', analysis.resume_id)
    .eq('user_id', user.id)
    .single();

  if (resumeError || !resume || !resume.parsed_text) {
    return new Response(JSON.stringify({ error: 'Resume text not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Extract improvement context from enhanced analysis
  const enhanced = analysis.enhanced_analysis as Record<string, unknown> | null;
  const improvements = Array.isArray(enhanced?.improvements)
    ? (enhanced.improvements as Array<{ title: string; description: string; specific_actions: string[] }>)
    : [];
  const missingSkills = Array.isArray(enhanced?.missing_skills)
    ? (enhanced.missing_skills as Array<{ name: string; priority: string }>)
    : [];

  const prompt = buildRewritePrompt(
    resume.parsed_text,
    analysis.job_title,
    analysis.job_description,
    improvements,
    missingSkills,
  );

  try {
    const { object } = await generateObject({
      model: getGoogleModel(),
      schema: RewriteSectionSchema,
      prompt,
      temperature: 0.3,
      abortSignal: AbortSignal.timeout(60000),
    });

    // Persist the improved sections to the database
    await supabase
      .from('analyses')
      .update({ improved_sections: object as unknown as never })
      .eq('id', analysisId)
      .eq('user_id', user.id);

    return new Response(JSON.stringify(object), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Rewrite error:', error);
    const message = error instanceof Error ? error.message : 'Rewrite failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
