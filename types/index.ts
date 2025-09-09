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

// UI component types
export * from './ui';
