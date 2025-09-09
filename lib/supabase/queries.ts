import { createClient } from './server';
import { cache } from 'react';
import { measurePerformance } from '../performance';

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
        match_score
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
        resume_id
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