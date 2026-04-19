import { createClient } from './server';
import { cache } from 'react';
import { measurePerformance } from '../performance';
import type {
  AnalysisApplicationPackage,
  AnalysisChatRole,
  AnalysisCoachProfile,
  AnalysisCoachProfileInput,
  ApplicationPackageContent,
  RewriteSection,
} from '@/types/index';

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  return (error as { code?: string }).code === '23505';
}

/**
 * Get user's analysis history with optimized query and caching
 * This function is cached for 1 minute to reduce database load
 */
export const getUserAnalysisHistory = cache(async (userId: string, limit: number = 10) => {
  return measurePerformance('getUserAnalysisHistory', async () => {
    const supabase = await createClient();
    
    // Use the composite index (user_id, created_at) for efficient filtering and sorting
    // Select only necessary fields to reduce data transfer
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        id,
        created_at,
        job_title,
        match_score,
        enhanced_analysis
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching analysis history:', error);
      throw new Error(`Failed to fetch analysis history: ${error.message}`);
    }
    
    return data;
  });
});

/**
 * Get a specific analysis with full details
 * This is a separate query to avoid fetching large analysis_result JSON 
 * when only summary data is needed
 */
export const getAnalysisById = cache(async (analysisId: string, userId: string) => {
  return measurePerformance('getAnalysisById', async () => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        id,
        created_at,
        job_title,
        job_description,
        match_score,
        analysis_result,
        enhanced_analysis,
        resume_id,
        improved_sections
      `)
      .eq('id', analysisId)
      .eq('user_id', userId) // Security: ensure user can only access their own analyses
      .single();
    
    if (error) {
      console.error('Error fetching analysis details:', error);
      throw new Error(`Failed to fetch analysis details: ${error.message}`);
    }
    
    return data;
  });
});

/**
 * Get recent analyses with match scores for a specific user
 * Used for dashboard statistics and visualizations
 */
export const getUserAnalyticsData = cache(async (userId: string) => {
  return measurePerformance('getUserAnalyticsData', async () => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        id,
        created_at,
        job_title,
        match_score
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching user analytics data:', error);
      throw new Error(`Failed to fetch analytics data: ${error.message}`);
    }
    
    return data;
  });
});

/**
 * Get analysis count by job title for a specific user
 * Used for dashboard statistics and visualizations
 * This query benefits from the job_title index
 */
export const getAnalysisByJobTitle = cache(async (userId: string) => {
  return measurePerformance('getAnalysisByJobTitle', async () => {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('analyses')
      .select(`
        job_title,
        count
      `)
      .eq('user_id', userId)
      .order('count', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching job title analytics:', error);
      throw new Error(`Failed to fetch job title analytics: ${error.message}`);
    }
    
    return data;
  });
});

/**
 * Get average match score for a specific user
 * Used for dashboard statistics
 */
export const getUserAverageScore = cache(async (userId: string) => {
  return measurePerformance('getUserAverageScore', async () => {
    const supabase = await createClient();
    
    // Using the match_score index for efficient aggregation
    const { data, error } = await supabase
      .rpc('get_user_average_score', { user_id_param: userId });
    
    if (error) {
      console.error('Error fetching average score:', error);
      throw new Error(`Failed to fetch average score: ${error.message}`);
    }
    
    return data;
  });
});

/**
 * Get recent analyses with pagination
 * This function uses the optimized composite index
 */
export const getPaginatedAnalysisHistory = cache(async (
  userId: string, 
  page: number = 1, 
  pageSize: number = 10
) => {
  return measurePerformance('getPaginatedAnalysisHistory', async () => {
    const supabase = await createClient();
    const offset = (page - 1) * pageSize;
    
    // Use the composite index (user_id, created_at) for efficient filtering, sorting and pagination
    const { data, error, count } = await supabase
      .from('analyses')
      .select(`
        id,
        created_at,
        job_title,
        match_score
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);
    
    if (error) {
      console.error('Error fetching paginated analysis history:', error);
      throw new Error(`Failed to fetch paginated analysis history: ${error.message}`);
    }
    
    return { data, count, page, pageSize };
  });
});

export async function getOrCreateChatSession(analysisId: string, userId: string) {
  const supabase = await createClient();

  const { data: existingSession, error: existingError } = await supabase
    .from('analysis_chat_sessions')
    .select('id, analysis_id, user_id, title, created_at, updated_at')
    .eq('analysis_id', analysisId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Failed to load chat session: ${existingError.message}`);
  }

  if (existingSession) {
    return existingSession;
  }

  const { data: createdSession, error: createError } = await supabase
    .from('analysis_chat_sessions')
    .insert({
      analysis_id: analysisId,
      user_id: userId,
      title: 'Resume Coach',
    })
    .select('id, analysis_id, user_id, title, created_at, updated_at')
    .single();

  if (createError && isUniqueViolation(createError)) {
    const { data: concurrentSession, error: concurrentError } = await supabase
      .from('analysis_chat_sessions')
      .select('id, analysis_id, user_id, title, created_at, updated_at')
      .eq('analysis_id', analysisId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (concurrentError || !concurrentSession) {
      throw new Error(`Failed to resolve chat session after concurrent creation: ${concurrentError?.message || 'Unknown error'}`);
    }

    return concurrentSession;
  }

  if (createError || !createdSession) {
    throw new Error(`Failed to create chat session: ${createError?.message || 'Unknown error'}`);
  }

  return createdSession;
}

export async function getCoachProfile(analysisId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analysis_coach_profiles')
    .select(`
      id,
      analysis_id,
      user_id,
      target_role,
      target_seniority,
      tone,
      focus_area,
      target_companies,
      must_keep,
      top_achievements,
      career_story,
      constraints,
      job_search_priorities,
      missing_details,
      intake_status,
      created_at,
      updated_at
    `)
    .eq('analysis_id', analysisId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch coach profile: ${error.message}`);
  }

  return (data as AnalysisCoachProfile | null) || null;
}

export async function upsertCoachProfile(
  analysisId: string,
  userId: string,
  input: AnalysisCoachProfileInput,
) {
  const supabase = await createClient();

  const payload = {
    analysis_id: analysisId,
    user_id: userId,
    target_role: input.targetRole?.trim() || null,
    target_seniority: input.targetSeniority?.trim() || null,
    tone: input.tone?.trim() || null,
    focus_area: input.focusArea?.trim() || null,
    target_companies: input.targetCompanies || [],
    must_keep: input.mustKeep || [],
    top_achievements: input.topAchievements || [],
    career_story: input.careerStory?.trim() || null,
    constraints: input.constraints?.trim() || null,
    job_search_priorities: input.jobSearchPriorities || [],
    missing_details: input.missingDetails || [],
    intake_status: input.intakeStatus || 'draft',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('analysis_coach_profiles')
    .upsert(payload, { onConflict: 'analysis_id,user_id' })
    .select(`
      id,
      analysis_id,
      user_id,
      target_role,
      target_seniority,
      tone,
      focus_area,
      target_companies,
      must_keep,
      top_achievements,
      career_story,
      constraints,
      job_search_priorities,
      missing_details,
      intake_status,
      created_at,
      updated_at
    `)
    .single();

  if (error || !data) {
    throw new Error(`Failed to save coach profile: ${error?.message || 'Unknown error'}`);
  }

  return data as AnalysisCoachProfile;
}

export async function getChatMessagesBySession(sessionId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analysis_chat_messages')
    .select('id, session_id, analysis_id, user_id, role, content, metadata, created_at')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch chat messages: ${error.message}`);
  }

  return data || [];
}

export async function createChatMessage(
  sessionId: string,
  analysisId: string,
  userId: string,
  role: AnalysisChatRole,
  content: string,
  metadata: Record<string, unknown> = {},
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analysis_chat_messages')
    .insert({
      session_id: sessionId,
      analysis_id: analysisId,
      user_id: userId,
      role,
      content,
      metadata,
    })
    .select('id, session_id, analysis_id, user_id, role, content, metadata, created_at')
    .single();

  if (error || !data) {
    throw new Error(`Failed to save chat message: ${error?.message || 'Unknown error'}`);
  }

  await supabase
    .from('analysis_chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', userId);

  return data;
}

export async function getLatestRewriteVersion(analysisId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analysis_rewrite_versions')
    .select('id, analysis_id, user_id, version_number, sections, generation_context, created_at')
    .eq('analysis_id', analysisId)
    .eq('user_id', userId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest rewrite version: ${error.message}`);
  }

  return data || null;
}

export async function getLatestApplicationPackage(analysisId: string, userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analysis_application_packages')
    .select('id, analysis_id, user_id, coach_profile_id, version_number, package_name, content, generation_context, created_at')
    .eq('analysis_id', analysisId)
    .eq('user_id', userId)
    .order('version_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest application package: ${error.message}`);
  }

  return (data as AnalysisApplicationPackage | null) || null;
}

export async function getApplicationPackageHistory(analysisId: string, userId: string, limit: number = 10) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analysis_application_packages')
    .select('id, analysis_id, user_id, coach_profile_id, version_number, package_name, content, generation_context, created_at')
    .eq('analysis_id', analysisId)
    .eq('user_id', userId)
    .order('version_number', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch application package history: ${error.message}`);
  }

  return (data as AnalysisApplicationPackage[] | null) || [];
}

export async function getRewriteVersionHistory(analysisId: string, userId: string, limit: number = 20) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('analysis_rewrite_versions')
    .select('id, analysis_id, user_id, version_number, sections, generation_context, created_at')
    .eq('analysis_id', analysisId)
    .eq('user_id', userId)
    .order('version_number', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch rewrite version history: ${error.message}`);
  }

  return data || [];
}

export async function createRewriteVersion(
  analysisId: string,
  userId: string,
  sections: RewriteSection[],
  generationContext: Record<string, unknown> = {},
) {
  const supabase = await createClient();
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: latestVersion, error: latestError } = await supabase
      .from('analysis_rewrite_versions')
      .select('version_number')
      .eq('analysis_id', analysisId)
      .eq('user_id', userId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      throw new Error(`Failed to resolve next rewrite version: ${latestError.message}`);
    }

    const nextVersion = (latestVersion?.version_number || 0) + 1;

    const { data: createdVersion, error: createError } = await supabase
      .from('analysis_rewrite_versions')
      .insert({
        analysis_id: analysisId,
        user_id: userId,
        version_number: nextVersion,
        sections,
        generation_context: generationContext,
      })
      .select('id, analysis_id, user_id, version_number, sections, generation_context, created_at')
      .single();

    if (createError && isUniqueViolation(createError)) {
      continue;
    }

    if (createError || !createdVersion) {
      throw new Error(`Failed to create rewrite version: ${createError?.message || 'Unknown error'}`);
    }

    const { error: legacyUpdateError } = await supabase
      .from('analyses')
      .update({
        improved_sections: { sections } as unknown as never,
      })
      .eq('id', analysisId)
      .eq('user_id', userId);

    if (legacyUpdateError) {
      throw new Error(`Failed to update legacy improved sections: ${legacyUpdateError.message}`);
    }

    return createdVersion;
  }

  throw new Error('Failed to allocate rewrite version after repeated concurrent attempts');
}

export async function createApplicationPackage(
  analysisId: string,
  userId: string,
  coachProfileId: string | null,
  packageName: string,
  content: ApplicationPackageContent,
  generationContext: Record<string, unknown> = {},
) {
  const supabase = await createClient();
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: latestVersion, error: latestError } = await supabase
      .from('analysis_application_packages')
      .select('version_number')
      .eq('analysis_id', analysisId)
      .eq('user_id', userId)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) {
      throw new Error(`Failed to resolve next application package version: ${latestError.message}`);
    }

    const nextVersion = (latestVersion?.version_number || 0) + 1;

    const { data, error } = await supabase
      .from('analysis_application_packages')
      .insert({
        analysis_id: analysisId,
        user_id: userId,
        coach_profile_id: coachProfileId,
        version_number: nextVersion,
        package_name: packageName,
        content,
        generation_context: generationContext,
      })
      .select('id, analysis_id, user_id, coach_profile_id, version_number, package_name, content, generation_context, created_at')
      .single();

    if (error && isUniqueViolation(error)) {
      continue;
    }

    if (error || !data) {
      throw new Error(`Failed to create application package: ${error?.message || 'Unknown error'}`);
    }

    return data as AnalysisApplicationPackage;
  }

  throw new Error('Failed to allocate application package version after repeated concurrent attempts');
}

export async function backfillRewriteVersionFromLegacy(analysisId: string, userId: string) {
  const supabase = await createClient();
  const latestVersion = await getLatestRewriteVersion(analysisId, userId);
  if (latestVersion) {
    return latestVersion;
  }

  const { data: analysis, error: analysisError } = await supabase
    .from('analyses')
    .select('improved_sections')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .maybeSingle();

  if (analysisError) {
    throw new Error(`Failed to inspect legacy improved sections: ${analysisError.message}`);
  }

  const rawSections = (analysis?.improved_sections as { sections?: RewriteSection[] } | null)?.sections;
  if (!Array.isArray(rawSections) || rawSections.length === 0) {
    return null;
  }

  return createRewriteVersion(
    analysisId,
    userId,
    rawSections,
    { source: 'legacy-improved-sections-backfill' },
  );
}
