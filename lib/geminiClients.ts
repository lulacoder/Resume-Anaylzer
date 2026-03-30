import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import {
  EnhancedAnalysisSchema,
  EnhancedAnalysisResult,
  createComprehensiveAnalysisPrompt,
  detectIndustry,
  INDUSTRY_TEMPLATES
} from './prompts';

const googleApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const google = createGoogleGenerativeAI({
  apiKey: googleApiKey,
});

function getEnhancedModel() {
  return google('gemini-2.5-flash');
}

/**
 * Legacy schema for backward compatibility
 */
const ResumeAnalysisSchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  extractedSkills: z.array(z.string()),
  matchScore: z.number().min(0).max(100),
});

/**
 * Legacy interface for backward compatibility
 */
export interface ResumeAnalysis {
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  extractedSkills: string[];
  matchScore: number; // A percentage from 0 to 100
}

// Export the enhanced types
export type { EnhancedAnalysisResult };
export { INDUSTRY_TEMPLATES };

/**
 * Enhanced comprehensive resume analysis using the new AI prompts system.
 * @param resumeText The plain text content of the resume.
 * @param jobTitle The title of the job to compare against.
 * @param jobDescription The description of the job to compare against.
 * @returns A promise that resolves to an enhanced analysis object, or null if an error occurs.
 */
export async function analyzeResumeEnhanced(
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): Promise<EnhancedAnalysisResult | null> {
  try {
    if (!googleApiKey) {
      throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.');
    }

    // Detect industry for specialized analysis
    const detectedIndustry = detectIndustry(jobTitle, jobDescription);

    // Create comprehensive analysis prompt
    const prompt = createComprehensiveAnalysisPrompt(
      resumeText,
      jobTitle,
      jobDescription,
      detectedIndustry || undefined
    );

    console.log(`Starting enhanced analysis for ${jobTitle}${detectedIndustry ? ` (${detectedIndustry} industry)` : ''}`);

    const { object } = await generateObject({
      model: getEnhancedModel(),
      schema: EnhancedAnalysisSchema,
      prompt,
      temperature: 0.1,
      abortSignal: AbortSignal.timeout(60000),
    });

    const validatedResult = EnhancedAnalysisSchema.parse(object);
    console.log(`Enhanced analysis completed with confidence score: ${validatedResult.analysis_metadata.confidence_score}`);

    return validatedResult;
  } catch (error) {
    console.error("Error in enhanced resume analysis:", error);

    // Re-throw the error to be handled by the caller
    throw error;
  }
}

/**
 * Legacy resume analysis function for backward compatibility.
 * @param resumeText The plain text content of the resume.
 * @param jobTitle The title of the job to compare against.
 * @param jobDescription The description of the job to compare against.
 * @returns A promise that resolves to a structured analysis object, or null if an error occurs.
 */
export async function analyzeResume(
  resumeText: string,
  jobTitle: string,
  jobDescription: string
): Promise<ResumeAnalysis | null> {
  try {
    const enhanced = await analyzeResumeEnhanced(resumeText, jobTitle, jobDescription);
    if (!enhanced) {
      return null;
    }

    const converted = convertToLegacyFormat(enhanced);
    return ResumeAnalysisSchema.parse(converted);
  } catch (error) {
    console.error("Error analyzing or parsing resume with Gemini:", error);
    // The error could be from the API call or from Zod validation
    return null;
  }
}

/**
 * Converts enhanced analysis result to legacy format for backward compatibility.
 */
export function convertToLegacyFormat(enhanced: EnhancedAnalysisResult): ResumeAnalysis {
  return {
    summary: enhanced.summary,
    strengths: enhanced.strengths.map(s => s.title),
    areasForImprovement: enhanced.improvements.map(i => i.title),
    extractedSkills: enhanced.present_skills.map(s => s.name),
    matchScore: enhanced.overall_score,
  };
}
