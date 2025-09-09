import { z } from 'zod';

// Enhanced analysis result schema with detailed structure
export const EnhancedAnalysisSchema = z.object({
  // Overall assessment
  overall_score: z.number().min(0).max(100),
  summary: z.string(),
  
  // Detailed scoring breakdown
  detailed_scores: z.object({
    skills_match: z.number().min(0).max(100),
    experience_relevance: z.number().min(0).max(100),
    education_fit: z.number().min(0).max(100),
    keyword_optimization: z.number().min(0).max(100),
  }),
  
  // Skills analysis
  present_skills: z.array(z.object({
    name: z.string(),
    category: z.enum(['technical', 'soft', 'industry', 'language', 'certification']).catch('technical'),
    proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
    importance: z.number().min(1).max(10),
    evidence: z.string().optional(),
  })),
  
  missing_skills: z.array(z.object({
    name: z.string(),
    category: z.enum(['technical', 'soft', 'industry', 'language', 'certification']).catch('technical'),
    importance: z.number().min(1).max(10),
    priority: z.enum(['high', 'medium', 'low']).catch('medium'),
    learning_resources: z.string().optional(),
  })),
  
  // Experience analysis
  experience_analysis: z.object({
    total_years: z.number().optional(),
    relevant_years: z.number().optional(),
    career_progression: z.enum(['excellent', 'good', 'average', 'needs_improvement']).catch('average'),
    role_alignment: z.number().min(0).max(100),
    achievements: z.array(z.string()),
    gaps: z.array(z.string()),
  }),
  
  // Detailed feedback
  strengths: z.array(z.object({
    category: z.enum(['skills', 'experience', 'education', 'achievements', 'format']).catch('skills'),
    title: z.string(),
    description: z.string(),
    impact: z.enum(['high', 'medium', 'low']).catch('medium'),
    examples: z.array(z.string()).optional(),
  })),
  
  improvements: z.array(z.object({
    category: z.enum(['skills', 'experience', 'education', 'achievements', 'format']).catch('skills'),
    title: z.string(),
    description: z.string(),
    priority: z.number().min(1).max(10),
    impact: z.enum(['high', 'medium', 'low']).catch('medium'),
    difficulty: z.enum(['easy', 'medium', 'hard']).catch('medium'),
    specific_actions: z.array(z.string()),
  })),
  
  // Industry insights
  industry_insights: z.object({
    market_trends: z.array(z.string()),
    salary_expectations: z.string().optional(),
    growth_opportunities: z.array(z.string()),
    competitive_analysis: z.string(),
  }),
  
  // Actionable recommendations
  priority_actions: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.number().min(1).max(10),
    estimated_impact: z.number().min(1).max(10),
    time_investment: z.enum(['low', 'medium', 'high']).catch('medium'),
    category: z.enum(['immediate', 'short_term', 'long_term']).catch('short_term'),
  })),
  
  // Metadata
  analysis_metadata: z.object({
    confidence_score: z.number().min(0).max(100),
    processing_notes: z.array(z.string()).optional(),
    industry_detected: z.string().optional(),
    job_level_detected: z.enum(['entry', 'mid', 'senior', 'executive']).catch('mid').optional(),
  }),
});

export type EnhancedAnalysisResult = z.infer<typeof EnhancedAnalysisSchema>;

// Industry-specific analysis templates
export const INDUSTRY_TEMPLATES = {
  technology: {
    key_skills: ['programming', 'system_design', 'problem_solving', 'collaboration'],
    important_sections: ['technical_skills', 'projects', 'experience'],
    common_tools: ['git', 'cloud_platforms', 'databases', 'frameworks'],
    career_progression: ['junior', 'mid_level', 'senior', 'lead', 'architect'],
  },
  healthcare: {
    key_skills: ['patient_care', 'medical_knowledge', 'compliance', 'communication'],
    important_sections: ['certifications', 'clinical_experience', 'education'],
    common_tools: ['ehr_systems', 'medical_devices', 'healthcare_software'],
    career_progression: ['entry_level', 'experienced', 'specialist', 'supervisor', 'director'],
  },
  finance: {
    key_skills: ['financial_analysis', 'risk_management', 'compliance', 'quantitative_skills'],
    important_sections: ['certifications', 'financial_experience', 'education'],
    common_tools: ['excel', 'financial_software', 'bloomberg', 'sql'],
    career_progression: ['analyst', 'associate', 'vice_president', 'director', 'managing_director'],
  },
  marketing: {
    key_skills: ['digital_marketing', 'analytics', 'creativity', 'communication'],
    important_sections: ['campaigns', 'metrics', 'creative_work'],
    common_tools: ['google_analytics', 'social_media', 'crm', 'design_tools'],
    career_progression: ['coordinator', 'specialist', 'manager', 'director', 'vp_marketing'],
  },
  sales: {
    key_skills: ['relationship_building', 'negotiation', 'target_achievement', 'communication'],
    important_sections: ['sales_metrics', 'client_relationships', 'achievements'],
    common_tools: ['crm', 'sales_tools', 'presentation_software'],
    career_progression: ['representative', 'account_manager', 'senior_manager', 'director', 'vp_sales'],
  },
} as const;

// Base prompt template for comprehensive analysis
export function createComprehensiveAnalysisPrompt(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  industry?: keyof typeof INDUSTRY_TEMPLATES
): string {
  const industryContext = industry ? INDUSTRY_TEMPLATES[industry] : null;
  
  return `You are an expert career coach and technical recruiter with 15+ years of experience across multiple industries. You have deep knowledge of current market trends, hiring practices, and what makes candidates successful. Analyze the following resume against the provided job description and provide a comprehensive, structured analysis.

ANALYSIS REQUIREMENTS:
1. Provide detailed skill mapping with specific evidence from the resume text
2. Analyze experience relevance, career progression, and role alignment
3. Include current industry-specific insights and market context
4. Generate actionable, prioritized recommendations with clear implementation steps
5. Ensure all scores are evidence-based with clear justification
6. Consider both explicit and implicit requirements from the job description
7. Evaluate the candidate's potential for growth and adaptability

${industryContext ? `
INDUSTRY CONTEXT (${industry?.toUpperCase()}):
- Key Skills Focus: ${industryContext.key_skills.join(', ')}
- Important Resume Sections: ${industryContext.important_sections.join(', ')}
- Common Tools/Technologies: ${industryContext.common_tools.join(', ')}
- Career Progression: ${industryContext.career_progression.join(' → ')}

INDUSTRY-SPECIFIC ANALYSIS FOCUS:
- Evaluate skills against current ${industry} market demands
- Consider industry-standard tools and methodologies
- Assess career progression within ${industry} context
- Provide ${industry}-specific improvement recommendations
` : ''}

OUTPUT FORMAT:
CRITICAL: You must respond with ONLY a valid JSON object. No markdown, no explanations, no additional text before or after the JSON. The response must be parseable by JSON.parse(). Ensure all strings are properly quoted, arrays are properly formatted, and there are no trailing commas. The JSON structure must be:

{
  "overall_score": <number 0-100>,
  "summary": "<professional summary of candidate>",
  "detailed_scores": {
    "skills_match": <number 0-100>,
    "experience_relevance": <number 0-100>,
    "education_fit": <number 0-100>,
    "keyword_optimization": <number 0-100>
  },
  "present_skills": [
    {
      "name": "<skill name>",
      "category": "<technical|soft|industry|language|certification>",
      "proficiency": "<beginner|intermediate|advanced|expert>",
      "importance": <number 1-10>,
      "evidence": "<specific evidence from resume>"
    }
  ],
  "missing_skills": [
    {
      "name": "<skill name>",
      "category": "<technical|soft|industry|language|certification>",
      "importance": <number 1-10>,
      "priority": "<high|medium|low>",
      "learning_resources": "<suggested learning approach>"
    }
  ],
  "experience_analysis": {
    "total_years": <number>,
    "relevant_years": <number>,
    "career_progression": "<excellent|good|average|needs_improvement>",
    "role_alignment": <number 0-100>,
    "achievements": ["<achievement 1>", "<achievement 2>"],
    "gaps": ["<gap 1>", "<gap 2>"]
  },
  "strengths": [
    {
      "category": "<skills|experience|education|achievements|format>",
      "title": "<strength title>",
      "description": "<detailed description>",
      "impact": "<high|medium|low>",
      "examples": ["<example 1>", "<example 2>"]
    }
  ],
  "improvements": [
    {
      "category": "<skills|experience|education|achievements|format>",
      "title": "<improvement title>",
      "description": "<detailed description>",
      "priority": <number 1-10>,
      "impact": "<high|medium|low>",
      "difficulty": "<easy|medium|hard>",
      "specific_actions": ["<action 1>", "<action 2>"]
    }
  ],
  "industry_insights": {
    "market_trends": ["<trend 1>", "<trend 2>"],
    "salary_expectations": "<salary range and factors>",
    "growth_opportunities": ["<opportunity 1>", "<opportunity 2>"],
    "competitive_analysis": "<how candidate compares to market>"
  },
  "priority_actions": [
    {
      "title": "<action title>",
      "description": "<detailed description>",
      "priority": <number 1-10>,
      "estimated_impact": <number 1-10>,
      "time_investment": "<low|medium|high>",
      "category": "<immediate|short_term|long_term>"
    }
  ],
  "analysis_metadata": {
    "confidence_score": <number 0-100>,
    "processing_notes": ["<note 1>", "<note 2>"],
    "industry_detected": "<detected industry>",
    "job_level_detected": "<entry|mid|senior|executive>"
  }
}

ANALYSIS GUIDELINES:
1. Skills Analysis: 
   - Identify technical, soft, and industry-specific skills with evidence
   - Assess proficiency levels based on context, years of experience, and project complexity
   - Categorize skills by importance to the target role
   - Note transferable skills from different industries or roles

2. Experience Relevance: 
   - Evaluate direct experience alignment with job requirements
   - Assess transferable experience and its applicability
   - Analyze career progression trajectory and growth patterns
   - Consider role complexity, team size, and impact scope

3. Achievement Focus: 
   - Look for quantified accomplishments (metrics, percentages, dollar amounts)
   - Identify leadership examples and team collaboration
   - Note problem-solving instances and innovative solutions
   - Assess impact on business outcomes and organizational goals

4. Gap Analysis: 
   - Identify critical missing skills that could impact job performance
   - Assess experience gaps and their significance
   - Consider certification or education requirements
   - Evaluate cultural fit and soft skill alignment

5. Industry Context: 
   - Consider current market trends and emerging technologies
   - Assess salary expectations and growth opportunities
   - Evaluate competitive landscape and candidate positioning
   - Include industry-specific best practices and standards

6. Actionable Advice: 
   - Provide specific, implementable recommendations with timelines
   - Prioritize actions by impact and feasibility
   - Include learning resources and development paths
   - Suggest networking and professional development opportunities

Job Title: ${jobTitle}

Job Description:
${jobDescription}

Resume Text:
${resumeText}`;
}

// Specialized prompt for skill gap analysis
export function createSkillGapAnalysisPrompt(
  resumeText: string,
  jobDescription: string,
  industry?: keyof typeof INDUSTRY_TEMPLATES
): string {
  return `Perform a detailed skill gap analysis between the resume and job requirements.

Focus on:
1. Technical skills explicitly mentioned in job description
2. Soft skills implied by role responsibilities
3. Industry-standard tools and technologies
4. Certifications and qualifications
5. Experience level requirements

${industry ? `Industry Context: ${industry}` : ''}

Resume: ${resumeText}
Job Description: ${jobDescription}

Provide detailed skill mapping with specific evidence and recommendations.`;
}

// Prompt for industry-specific insights
export function createIndustryInsightsPrompt(
  jobTitle: string,
  industry: keyof typeof INDUSTRY_TEMPLATES
): string {
  const template = INDUSTRY_TEMPLATES[industry];
  
  return `Provide current industry insights for ${jobTitle} in the ${industry} sector.

Include:
1. Current market trends affecting this role
2. Emerging skills and technologies
3. Typical career progression paths
4. Salary expectations and factors
5. Growth opportunities and challenges

Industry Context:
- Key Skills: ${template.key_skills.join(', ')}
- Career Path: ${template.career_progression.join(' → ')}
- Common Tools: ${template.common_tools.join(', ')}

Focus on actionable insights that can help candidates position themselves effectively.`;
}

// Utility function to detect industry from job description
export function detectIndustry(jobTitle: string, jobDescription: string): keyof typeof INDUSTRY_TEMPLATES | null {
  const text = `${jobTitle} ${jobDescription}`.toLowerCase();
  
  // Technology keywords
  if (text.match(/\b(software|developer|engineer|programming|code|tech|it|data|cloud|api|database)\b/)) {
    return 'technology';
  }
  
  // Healthcare keywords
  if (text.match(/\b(medical|healthcare|nurse|doctor|patient|clinical|hospital|health)\b/)) {
    return 'healthcare';
  }
  
  // Finance keywords
  if (text.match(/\b(finance|financial|banking|investment|accounting|analyst|trading|risk)\b/)) {
    return 'finance';
  }
  
  // Marketing keywords
  if (text.match(/\b(marketing|digital|campaign|brand|social media|advertising|seo|content)\b/)) {
    return 'marketing';
  }
  
  // Sales keywords
  if (text.match(/\b(sales|account|client|customer|revenue|quota|business development)\b/)) {
    return 'sales';
  }
  
  return null;
}