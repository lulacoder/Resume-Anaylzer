import { NextRequest } from 'next/server';
import { streamObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { EnhancedAnalysisSchema, createComprehensiveAnalysisPrompt, detectIndustry } from '@/lib/prompts';
import { convertToLegacyFormat } from '@/lib/geminiClients';
import { rateLimiter, RATE_LIMITS } from '@/lib/rate-limiting';
import { parsePdf } from '@/lib/parsePdf';

export const runtime = 'nodejs';
export const maxDuration = 60;

const RequestSchema = z.object({
  jobTitle: z.string().trim().max(160, 'Job title is too long.').optional().default('Target Role'),
  jobDescription: z
    .string()
    .trim()
    .min(1, 'Job description is required.')
    .max(20000, 'Job description is too long.'),
});

type StreamEvent =
  | { type: 'stage'; stage: 'validating' | 'uploading' | 'saving' | 'analyzing' | 'finalizing' }
  | { type: 'partial'; data: unknown }
  | { type: 'complete'; analysis: unknown }
  | { type: 'error'; error: string };

const encoder = new TextEncoder();
const MAX_RESUME_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_RESUME_TEXT_CHARS = 80_000;

function isPdfUpload(file: File): boolean {
  const type = (file.type || '').toLowerCase();
  const hasValidMime = type === 'application/pdf' || type === 'application/x-pdf';
  const hasPdfExtension = file.name.toLowerCase().endsWith('.pdf');

  return hasValidMime || hasPdfExtension;
}

function hasPdfMagicHeader(fileBuffer: ArrayBuffer): boolean {
  try {
    const bytes = new Uint8Array(fileBuffer.slice(0, 5));
    return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  } catch {
    return false;
  }
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('429')) {
      return 'Too many requests to the AI service. Please try again in a few minutes.';
    }
    if (error.message.includes('403')) {
      return 'AI provider access denied. Please verify your API key and quota.';
    }
    if (error.message.includes('timeout') || error.message.includes('aborted')) {
      return 'The analysis timed out. Please try again with a shorter job description.';
    }

    return error.message;
  }

  return 'Unexpected analysis error. Please try again.';
}

function streamLine(controller: ReadableStreamDefaultController<Uint8Array>, event: StreamEvent) {
  controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
}

function getGoogleModel() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY.');
  }

  const google = createGoogleGenerativeAI({ apiKey });
  return google('gemini-2.5-flash');
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rateLimit = rateLimiter.check(user.id, RATE_LIMITS.ANALYSIS.limit, RATE_LIMITS.ANALYSIS.windowMs);
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

  const formData = await request.formData();
  const parseResult = RequestSchema.safeParse({
    jobTitle: formData.get('jobTitle')?.toString(),
    jobDescription: formData.get('jobDescription')?.toString(),
  });

  if (!parseResult.success) {
    return new Response(
      JSON.stringify({
        error: parseResult.error.issues.map((issue) => issue.message).join(', '),
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const resumeFile = formData.get('resume');
  if (!(resumeFile instanceof File)) {
    return new Response(JSON.stringify({ error: 'Resume file is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!isPdfUpload(resumeFile)) {
    return new Response(JSON.stringify({ error: 'Please upload a PDF file.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (resumeFile.size < 1) {
    return new Response(JSON.stringify({ error: 'Resume file is empty.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (resumeFile.size > MAX_RESUME_FILE_BYTES) {
    return new Response(JSON.stringify({ error: 'File size must be less than 5MB.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { jobTitle, jobDescription } = parseResult.data;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let uploadedFilePath: string | null = null;
      let resumeRecordId: string | null = null;
      let analysisRecordId: string | null = null;

      const cleanupOnFailure = async () => {
        if (!analysisRecordId && resumeRecordId) {
          const { error: cleanupResumeError } = await supabase
            .from('resumes')
            .delete()
            .eq('id', resumeRecordId)
            .eq('user_id', user.id);

          if (cleanupResumeError) {
            console.error('Failed to clean up resume record after analyze failure:', cleanupResumeError);
          }
        }

        if (!analysisRecordId && uploadedFilePath) {
          const { error: cleanupStorageError } = await supabase.storage.from('resumes').remove([uploadedFilePath]);
          if (cleanupStorageError) {
            console.error('Failed to clean up uploaded file after analyze failure:', cleanupStorageError);
          }
        }
      };

      try {
        streamLine(controller, { type: 'stage', stage: 'validating' });

        const fileBuffer = await resumeFile.arrayBuffer();
        if (!hasPdfMagicHeader(fileBuffer)) {
          throw new Error('The uploaded file is not a valid PDF.');
        }

        let resumeText = await parsePdf(fileBuffer);
        if (!resumeText || resumeText.trim().length < 10) {
          throw new Error('Could not extract meaningful text from PDF. Please ensure the file contains selectable text.');
        }

        if (resumeText.length > MAX_RESUME_TEXT_CHARS) {
          resumeText = resumeText.slice(0, MAX_RESUME_TEXT_CHARS);
        }

        const originalFileName = resumeFile.name.trim() || 'resume.pdf';
        const safeFileName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_') || 'resume.pdf';
        const filePath = `${user.id}/${Date.now()}_${crypto.randomUUID()}_${safeFileName}`;

        streamLine(controller, { type: 'stage', stage: 'uploading' });
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(filePath, resumeFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Storage upload failed: ${uploadError.message}`);
        }
        uploadedFilePath = filePath;

        streamLine(controller, { type: 'stage', stage: 'saving' });
        const { data: resumeRecord, error: resumeInsertError } = await supabase
          .from('resumes')
          .insert({
            user_id: user.id,
            file_path: filePath,
            file_name: safeFileName,
            parsed_text: resumeText,
          })
          .select('id')
          .single();

        if (resumeInsertError || !resumeRecord) {
          throw new Error(`Failed to save resume record: ${resumeInsertError?.message || 'Unknown error'}`);
        }
        resumeRecordId = resumeRecord.id;

        streamLine(controller, { type: 'stage', stage: 'analyzing' });

        const detectedIndustry = detectIndustry(jobTitle, jobDescription);
        const prompt = createComprehensiveAnalysisPrompt(
          resumeText,
          jobTitle,
          jobDescription,
          detectedIndustry || undefined
        );

        const objectResult = streamObject({
          model: getGoogleModel(),
          schema: EnhancedAnalysisSchema,
          prompt,
          temperature: 0.1,
          abortSignal: AbortSignal.timeout(60000),
        });

        for await (const partial of objectResult.partialObjectStream) {
          streamLine(controller, { type: 'partial', data: partial });
        }

        const enhancedAnalysis = await objectResult.object;
        const legacyAnalysis = convertToLegacyFormat(enhancedAnalysis);

        streamLine(controller, { type: 'stage', stage: 'finalizing' });

        const { data: analysisRecord, error: analysisInsertError } = await supabase
          .from('analyses')
          .insert({
            user_id: user.id,
            resume_id: resumeRecord.id,
            job_title: jobTitle,
            job_description: jobDescription,
            analysis_result: legacyAnalysis,
            enhanced_analysis: enhancedAnalysis,
            match_score: legacyAnalysis.matchScore,
            created_at: new Date().toISOString(),
          })
          .select(`
            id,
            created_at,
            job_title,
            match_score,
            analysis_result,
            enhanced_analysis
          `)
          .single();

        if (analysisInsertError || !analysisRecord) {
          throw new Error(`Failed to save analysis: ${analysisInsertError?.message || 'Unknown error'}`);
        }
        analysisRecordId = analysisRecord.id;

        streamLine(controller, { type: 'complete', analysis: analysisRecord });
      } catch (error) {
        await cleanupOnFailure();
        streamLine(controller, { type: 'error', error: toErrorMessage(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/x-ndjson; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
