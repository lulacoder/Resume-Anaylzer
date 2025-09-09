import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import {
  EnhancedAnalysisSchema,
  EnhancedAnalysisResult,
  createComprehensiveAnalysisPrompt,
  detectIndustry,
  INDUSTRY_TEMPLATES
} from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

/**
 * Enhanced JSON cleaning function to handle common AI response issues
 */
function cleanAndRepairJSON(text: string): string {
  let cleaned = text;

  // Remove markdown code blocks
  cleaned = cleaned.replace(/```json/g, '').replace(/```/g, '');

  // Remove any text before the first { and after the last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Remove common trailing issues
  cleaned = cleaned.replace(/,\s*}/g, '}'); // Remove trailing commas before }
  cleaned = cleaned.replace(/,\s*]/g, ']'); // Remove trailing commas before ]

  return cleaned.trim();
}

/**
 * Clean and normalize analysis data before validation
 */
function cleanAnalysisData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  // Helper function to normalize enum values
  const normalizeCategory = (value: string, allowedValues: string[], defaultValue: string) => {
    if (!value || typeof value !== 'string') return defaultValue;
    const normalized = value.toLowerCase().trim();
    return allowedValues.includes(normalized) ? normalized : defaultValue;
  };

  // Clean skill categories
  if (data.present_skills && Array.isArray(data.present_skills)) {
    data.present_skills = data.present_skills.map((skill: any) => ({
      ...skill,
      category: normalizeCategory(skill.category, ['technical', 'soft', 'industry', 'language', 'certification'], 'technical'),
      proficiency: skill.proficiency ? normalizeCategory(skill.proficiency, ['beginner', 'intermediate', 'advanced', 'expert'], 'intermediate') : undefined,
    }));
  }

  if (data.missing_skills && Array.isArray(data.missing_skills)) {
    data.missing_skills = data.missing_skills.map((skill: any) => ({
      ...skill,
      category: normalizeCategory(skill.category, ['technical', 'soft', 'industry', 'language', 'certification'], 'technical'),
      priority: normalizeCategory(skill.priority, ['high', 'medium', 'low'], 'medium'),
    }));
  }

  // Clean experience analysis
  if (data.experience_analysis) {
    data.experience_analysis.career_progression = normalizeCategory(
      data.experience_analysis.career_progression,
      ['excellent', 'good', 'average', 'needs_improvement'],
      'average'
    );
  }

  // Clean strengths and improvements
  if (data.strengths && Array.isArray(data.strengths)) {
    data.strengths = data.strengths.map((item: any) => ({
      ...item,
      category: normalizeCategory(item.category, ['skills', 'experience', 'education', 'achievements', 'format'], 'skills'),
      impact: normalizeCategory(item.impact, ['high', 'medium', 'low'], 'medium'),
    }));
  }

  if (data.improvements && Array.isArray(data.improvements)) {
    data.improvements = data.improvements.map((item: any) => ({
      ...item,
      category: normalizeCategory(item.category, ['skills', 'experience', 'education', 'achievements', 'format'], 'skills'),
      impact: normalizeCategory(item.impact, ['high', 'medium', 'low'], 'medium'),
      difficulty: normalizeCategory(item.difficulty, ['easy', 'medium', 'hard'], 'medium'),
    }));
  }

  // Clean priority actions
  if (data.priority_actions && Array.isArray(data.priority_actions)) {
    data.priority_actions = data.priority_actions.map((action: any) => ({
      ...action,
      time_investment: normalizeCategory(action.time_investment, ['low', 'medium', 'high'], 'medium'),
      category: normalizeCategory(action.category, ['immediate', 'short_term', 'long_term'], 'short_term'),
    }));
  }

  // Clean metadata
  if (data.analysis_metadata) {
    data.analysis_metadata.job_level_detected = data.analysis_metadata.job_level_detected
      ? normalizeCategory(data.analysis_metadata.job_level_detected, ['entry', 'mid', 'senior', 'executive'], 'mid')
      : undefined;
  }

  return data;
}

/**
 * Attempt to repair common JSON syntax issues
 */
function attemptJSONRepair(jsonText: string): string | null {
  try {
    let repaired = jsonText;

    // Fix common issues with array elements
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    repaired = repaired.replace(/([}\]])(\s*)([{\[])/g, '$1,$2$3'); // Add missing commas between objects/arrays

    // Fix missing quotes around property names
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');

    // Fix incomplete strings at the end
    const openQuotes = (repaired.match(/"/g) || []).length;
    if (openQuotes % 2 !== 0) {
      // Odd number of quotes, likely incomplete string
      repaired += '"';
    }

    // Ensure proper closing of objects/arrays
    const openBraces = (repaired.match(/{/g) || []).length;
    const closeBraces = (repaired.match(/}/g) || []).length;
    const openBrackets = (repaired.match(/\[/g) || []).length;
    const closeBrackets = (repaired.match(/]/g) || []).length;

    // Add missing closing braces/brackets
    for (let i = 0; i < openBraces - closeBraces; i++) {
      repaired += '}';
    }
    for (let i = 0; i < openBrackets - closeBrackets; i++) {
      repaired += ']';
    }

    return repaired;
  } catch (error) {
    console.error("JSON repair attempt failed:", error);
    return null;
  }
}

// Use Gemini 2.5 Flash for better and faster responses
export const geminiClient = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  // Configure generation parameters for better structured output
  generationConfig: {
    temperature: 0.1, // Even lower temperature for more consistent JSON output
    topP: 0.9,
    topK: 20,
    maxOutputTokens: 8192, // Ensure we have enough tokens for detailed analysis
    responseMimeType: "application/json", // Force JSON output format
  }
});

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

    // Add timeout handling for the API call
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI analysis timed out after 60 seconds')), 60000);
    });

    // Race the API call against the timeout
    const result = await Promise.race([
      geminiClient.generateContent(prompt),
      timeoutPromise
    ]);

    // Type guard to ensure result has the expected structure
    if (!result || typeof result !== 'object' || !('response' in result)) {
      throw new Error('Invalid response from AI service');
    }

    const response = result.response;

    // Check if response has the text method
    if (!response || typeof response.text !== 'function') {
      throw new Error('Invalid response format from AI service');
    }

    let jsonText = response.text();

    // Enhanced JSON cleaning and repair
    jsonText = cleanAndRepairJSON(jsonText);

    try {
      // Parse and validate the JSON response
      const parsedJson = JSON.parse(jsonText);

      // Transform and clean the data before validation
      const cleanedData = cleanAnalysisData(parsedJson);
      const validatedResult = EnhancedAnalysisSchema.parse(cleanedData);

      console.log(`Enhanced analysis completed with confidence score: ${validatedResult.analysis_metadata.confidence_score}`);

      return validatedResult;
    } catch (error) {
      console.error("Error parsing AI response:", error);

      // Type guard for the error
      const parseError = error as Error;
      let errorMessage = 'Unknown parsing error';

      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.issues);

        // Log detailed validation errors for debugging
        error.issues.forEach(issue => {
          console.error(`Validation error at path ${issue.path.join('.')}: ${issue.message}`);
          if ('received' in issue) {
            console.error(`Received value: ${issue.received}`);
          }
        });

        errorMessage = 'Schema validation error';
      } else if (error instanceof SyntaxError) {
        console.error("JSON parsing error:", error.message);
        console.error("Received text length:", jsonText.length);
        console.error("First 500 chars:", jsonText.substring(0, 500));
        console.error("Last 500 chars:", jsonText.substring(Math.max(0, jsonText.length - 500)));

        // Try to repair common JSON issues
        const repairedJson = attemptJSONRepair(jsonText);
        if (repairedJson) {
          try {
            const parsedRepaired = JSON.parse(repairedJson);
            const validatedRepaired = EnhancedAnalysisSchema.parse(parsedRepaired);
            console.log("Successfully repaired and parsed JSON");
            return validatedRepaired;
          } catch (repairError) {
            console.error("JSON repair also failed:", repairError);
          }
        }

        errorMessage = `JSON syntax error: ${error.message}`;
      } else if (parseError.message) {
        errorMessage = parseError.message;
      }

      // Re-throw with more context
      throw new Error(`Failed to parse AI response: ${errorMessage}`);
    }
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
  const prompt = `
    You are an expert technical recruiter and career coach. Analyze the following resume against the provided job description.
    Provide a detailed analysis strictly in JSON format. The JSON object must have the following keys:
    - "summary": A brief professional summary of the candidate.
    - "strengths": An array of strings, where each string is a key strength or accomplishment from the resume.
    - "areasForImprovement": An array of strings, suggesting areas where the resume could be improved (e.g., quantifying achievements, adding a specific section).
    - "extractedSkills": An array of strings listing all the technical and soft skills found in the resume.
    - "matchScore": A number between 0 and 100 representing how well the resume matches the job description.

    Do not include any introductory text, explanations, or markdown formatting like \`\`\`json. Only output the raw JSON object.

    Job Title: ${jobTitle}
    Job Description: ${jobDescription}
    Resume Text:
    ---
    ${resumeText}
    ---
  `;

  try {
    const result = await geminiClient.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text().replace(/```json/g, '').replace(/```/g, '').trim(); // Clean up markdown
    const parsedJson = JSON.parse(jsonText);

    // Validate the parsed JSON against our schema
    return ResumeAnalysisSchema.parse(parsedJson);
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
