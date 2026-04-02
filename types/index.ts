// Legacy application types for backward compatibility
export type AnalysisResult = {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type AnalysisRecord = {
  id: string;
  created_at: string;
  job_title: string | null;
  match_score: number | null;
  analysis_result: AnalysisResult | null;
};

// Enhanced analysis types
export type EnhancedAnalysisResult = {
  overall_score: number;
  summary: string;
  detailed_scores: {
    skills_match: number;
    experience_relevance: number;
    education_fit: number;
    keyword_optimization: number;
  };
  present_skills: Array<{
    name: string;
    category: 'technical' | 'soft' | 'industry' | 'language' | 'certification';
    proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    importance: number;
    evidence?: string;
  }>;
  missing_skills: Array<{
    name: string;
    category: 'technical' | 'soft' | 'industry' | 'language' | 'certification';
    importance: number;
    priority: 'high' | 'medium' | 'low';
    learning_resources?: string;
  }>;
  experience_analysis: {
    total_years?: number;
    relevant_years?: number;
    career_progression: 'excellent' | 'good' | 'average' | 'needs_improvement';
    role_alignment: number;
    achievements: string[];
    gaps: string[];
  };
  strengths: Array<{
    category: 'skills' | 'experience' | 'education' | 'achievements' | 'format';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    examples?: string[];
  }>;
  improvements: Array<{
    category: 'skills' | 'experience' | 'education' | 'achievements' | 'format';
    title: string;
    description: string;
    priority: number;
    impact: 'high' | 'medium' | 'low';
    difficulty: 'easy' | 'medium' | 'hard';
    specific_actions: string[];
  }>;
  industry_insights: {
    market_trends: string[];
    salary_expectations?: string;
    growth_opportunities: string[];
    competitive_analysis: string;
  };
  priority_actions: Array<{
    title: string;
    description: string;
    priority: number;
    estimated_impact: number;
    time_investment: 'low' | 'medium' | 'high';
    category: 'immediate' | 'short_term' | 'long_term';
  }>;
  analysis_metadata: {
    confidence_score: number;
    processing_notes?: string[];
    industry_detected?: string;
    job_level_detected?: 'entry' | 'mid' | 'senior' | 'executive';
  };
};

export type EnhancedAnalysisRecord = {
  id: string;
  created_at: string;
  job_title: string | null;
  job_description?: string | null;
  match_score: number | null;
  analysis_result: EnhancedAnalysisResult | null;
  enhanced_analysis?: EnhancedAnalysisResult | null;
};

export type AnalysisChatRole = 'user' | 'assistant' | 'system';

export type AnalysisChatMessage = {
  id: string;
  session_id: string;
  analysis_id: string;
  user_id: string;
  role: AnalysisChatRole;
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
};

export type AnalysisChatSession = {
  id: string;
  analysis_id: string;
  user_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type AnalysisCoachProfile = {
  id: string;
  analysis_id: string;
  user_id: string;
  target_role: string | null;
  target_seniority: string | null;
  tone: string | null;
  focus_area: string | null;
  target_companies: string[];
  must_keep: string[];
  top_achievements: string[];
  career_story: string | null;
  constraints: string | null;
  job_search_priorities: string[];
  missing_details: string[];
  intake_status: 'draft' | 'ready';
  created_at: string;
  updated_at: string;
};

export type AnalysisCoachProfileInput = {
  targetRole?: string;
  targetSeniority?: string;
  tone?: string;
  focusArea?: string;
  targetCompanies?: string[];
  mustKeep?: string[];
  topAchievements?: string[];
  careerStory?: string;
  constraints?: string;
  jobSearchPriorities?: string[];
  missingDetails?: string[];
  intakeStatus?: 'draft' | 'ready';
};

export type ApplicationPackageContent = {
  package_name: string;
  positioning_summary: string;
  recruiter_pitch: string;
  cover_letter: string;
  linkedin_headline: string;
  linkedin_about: string;
  interview_story: string;
  ats_keywords: string[];
  truth_guardrails: string[];
  follow_up_questions: string[];
  evidence_map: Array<{
    claim: string;
    source: 'resume' | 'analysis' | 'chat' | 'intake';
  }>;
};

export type AnalysisApplicationPackage = {
  id: string;
  analysis_id: string;
  user_id: string;
  coach_profile_id: string | null;
  version_number: number;
  package_name: string;
  content: ApplicationPackageContent;
  generation_context?: Record<string, unknown>;
  created_at: string;
};

export type RewriteSection = {
  title: string;
  original: string;
  improved: string;
};

export type AnalysisRewriteVersion = {
  id: string;
  analysis_id: string;
  user_id: string;
  version_number: number;
  sections: RewriteSection[];
  generation_context?: Record<string, unknown>;
  created_at: string;
};

// UI component types
export * from './ui';
