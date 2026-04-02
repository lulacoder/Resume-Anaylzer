import type { AnalysisCoachProfile, ApplicationPackageContent } from '@/types/index';

type PromptContext = {
  jobTitle: string | null;
  jobDescription: string | null;
  resumeText: string;
  enhancedAnalysis: unknown;
  recentConversation: string;
  profile: AnalysisCoachProfile | null;
};

function stringifyAnalysis(enhancedAnalysis: unknown) {
  return enhancedAnalysis ? JSON.stringify(enhancedAnalysis) : 'No enhanced analysis available.';
}

function profileSummary(profile: AnalysisCoachProfile | null) {
  if (!profile) {
    return 'No intake profile saved yet.';
  }

  return JSON.stringify({
    targetRole: profile.target_role,
    targetSeniority: profile.target_seniority,
    tone: profile.tone,
    focusArea: profile.focus_area,
    targetCompanies: profile.target_companies,
    mustKeep: profile.must_keep,
    topAchievements: profile.top_achievements,
    careerStory: profile.career_story,
    constraints: profile.constraints,
    jobSearchPriorities: profile.job_search_priorities,
    missingDetails: profile.missing_details,
    intakeStatus: profile.intake_status,
  });
}

export function getCoachSystemPrompt() {
  return `You are Resume Analyzer's flagship AI Resume Coach.

Your job is to help the user turn a rough resume into a job-winning, truthful application package.

Operating principles:
1. Be specific, practical, and warm.
2. Never fabricate skills, titles, employers, dates, metrics, or credentials.
3. Prefer asking 1-3 high-leverage follow-up questions when key evidence is missing.
4. Extract hidden value from the user's real experience, then sharpen it.
5. Tie advice to outcomes: recruiter clarity, ATS match, seniority signal, credibility, and interview readiness.
6. When possible, distinguish what came from the resume, the analysis, and the user's intake.
7. Keep recommendations ambitious but believable.

Response style:
- Use short sections when helpful.
- Favor direct coaching over generic resume tips.
- If details are missing, ask focused questions instead of guessing.
- If the user asks for rewriting help, give wording they can use immediately.`;
}

export function buildCoachConversationPrompt({
  jobTitle,
  jobDescription,
  resumeText,
  enhancedAnalysis,
  recentConversation,
  profile,
  userMessage,
}: PromptContext & { userMessage: string }) {
  const trimmedResume = resumeText.length > 14000
    ? `${resumeText.slice(0, 14000)}\n\n[Resume text truncated for context length]`
    : resumeText;

  return `${getCoachSystemPrompt()}

Target role: ${jobTitle || 'Not provided'}
Job description:
${jobDescription || 'Not provided'}

Resume text:
${trimmedResume}

Enhanced analysis:
${stringifyAnalysis(enhancedAnalysis)}

Saved intake profile:
${profileSummary(profile)}

Recent conversation:
${recentConversation || 'No previous messages'}

User message:
${userMessage}

Deliver one of these depending on what the user needs most right now:
- coaching advice tied to this resume and role
- a sharper rewrite for a specific section
- a short set of follow-up questions that unlock stronger achievements
- an explanation of what to improve next and why`;
}

export function buildRewriteGenerationPrompt({
  jobTitle,
  jobDescription,
  resumeText,
  enhancedAnalysis,
  recentConversation,
  profile,
  userGuidance,
}: PromptContext & { userGuidance?: string }) {
  return `${getCoachSystemPrompt()}

You are generating a complete rewritten resume draft for PDF export.

Target role: ${profile?.target_role || jobTitle || 'Not provided'}
Target seniority: ${profile?.target_seniority || 'Not provided'}
Desired tone: ${profile?.tone || 'Professional and concise'}
Focus area: ${profile?.focus_area || 'Impactful bullet points and quantified achievements'}
Target companies: ${profile?.target_companies.join(', ') || 'Not specified'}
Must keep: ${profile?.must_keep.join('; ') || 'None specified'}
Top achievements to emphasize: ${profile?.top_achievements.join('; ') || 'None specified'}
Career story: ${profile?.career_story || 'Not provided'}
Constraints: ${profile?.constraints || 'None provided'}
Job search priorities: ${profile?.job_search_priorities.join('; ') || 'Not specified'}

Job description:
${jobDescription || 'Not provided'}

Enhanced analysis:
${stringifyAnalysis(enhancedAnalysis)}

Recent coaching conversation:
${recentConversation || 'No previous conversation'}

Additional user guidance:
${userGuidance || 'No additional guidance'}

Original resume text:
---
${resumeText}
---

Rules:
1. Break the resume into logical sections.
2. For each section, return the ORIGINAL text and the IMPROVED text.
3. Make the improved version polished, ATS-friendly, and targeted to the role.
4. Use stronger verbs and clearer outcomes only when supported by evidence.
5. Preserve truthfulness. Do not invent metrics or experience.
6. Reflect the saved intake priorities and coaching context.
7. Return valid JSON only.`;
}

export function buildApplicationPackagePrompt({
  jobTitle,
  jobDescription,
  resumeText,
  enhancedAnalysis,
  recentConversation,
  profile,
}: PromptContext) {
  return `${getCoachSystemPrompt()}

You are generating a complete application package around the user's resume.

Target role: ${profile?.target_role || jobTitle || 'Not provided'}
Target seniority: ${profile?.target_seniority || 'Not provided'}
Desired tone: ${profile?.tone || 'Professional and concise'}
Focus area: ${profile?.focus_area || 'Impactful bullet points and quantified achievements'}
Target companies: ${profile?.target_companies.join(', ') || 'Not specified'}
Must keep: ${profile?.must_keep.join('; ') || 'None specified'}
Top achievements to emphasize: ${profile?.top_achievements.join('; ') || 'None specified'}
Career story: ${profile?.career_story || 'Not provided'}
Constraints: ${profile?.constraints || 'None provided'}
Job search priorities: ${profile?.job_search_priorities.join('; ') || 'Not specified'}
Missing details to ask about later: ${profile?.missing_details.join('; ') || 'None specified'}

Job description:
${jobDescription || 'Not provided'}

Resume text:
${resumeText}

Enhanced analysis:
${stringifyAnalysis(enhancedAnalysis)}

Recent coaching conversation:
${recentConversation || 'No previous conversation'}

Return a structured application package that helps the user apply confidently and consistently.
Every artifact must stay faithful to the user's real background.
If some evidence is thin, make the language more careful rather than making things up.`;
}

export function getApplicationPackageJsonShape() {
  return `Return JSON in this shape:
{
  "package_name": "Frontend Engineer application kit",
  "positioning_summary": "...",
  "recruiter_pitch": "...",
  "cover_letter": "...",
  "linkedin_headline": "...",
  "linkedin_about": "...",
  "interview_story": "...",
  "ats_keywords": ["..."],
  "truth_guardrails": ["..."],
  "follow_up_questions": ["..."],
  "evidence_map": [
    { "claim": "...", "source": "resume" }
  ]
}`;
}

export function getDefaultApplicationPackageContent(): ApplicationPackageContent {
  return {
    package_name: 'Application kit',
    positioning_summary: '',
    recruiter_pitch: '',
    cover_letter: '',
    linkedin_headline: '',
    linkedin_about: '',
    interview_story: '',
    ats_keywords: [],
    truth_guardrails: [],
    follow_up_questions: [],
    evidence_map: [],
  };
}
