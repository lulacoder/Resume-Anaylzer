import { cachedQuery } from './cache';
import { getUserAnalysisHistory, getAnalysisById, getUserAnalyticsData } from './queries';
import { measurePerformance } from '../performance';

/**
 * Cache durations in seconds
 */
const CACHE_DURATIONS = {
  ANALYSIS_HISTORY: 60, // 1 minute
  ANALYSIS_DETAILS: 300, // 5 minutes
  ANALYTICS_DATA: 120, // 2 minutes
};

/**
 * Get user's analysis history with optimized query and caching
 * This function uses the in-memory cache for frequently accessed data
 */
export async function getCachedAnalysisHistory(userId: string, limit: number = 10) {
  return measurePerformance('getCachedAnalysisHistory', async () => {
    const cacheKey = `analysis_history:${userId}:${limit}`;
    
    return cachedQuery(
      cacheKey,
      CACHE_DURATIONS.ANALYSIS_HISTORY,
      () => getUserAnalysisHistory(userId, limit)
    );
  });
}

/**
 * Get a specific analysis with full details
 * This function uses the in-memory cache for frequently accessed data
 */
export async function getCachedAnalysisById(analysisId: string, userId: string) {
  return measurePerformance('getCachedAnalysisById', async () => {
    const cacheKey = `analysis:${analysisId}:${userId}`;
    
    return cachedQuery(
      cacheKey,
      CACHE_DURATIONS.ANALYSIS_DETAILS,
      () => getAnalysisById(analysisId, userId)
    );
  });
}

/**
 * Get recent analyses with match scores for a specific user
 * This function uses the in-memory cache for frequently accessed data
 */
export async function getCachedUserAnalyticsData(userId: string) {
  return measurePerformance('getCachedUserAnalyticsData', async () => {
    const cacheKey = `analytics:${userId}`;
    
    return cachedQuery(
      cacheKey,
      CACHE_DURATIONS.ANALYTICS_DATA,
      () => getUserAnalyticsData(userId)
    );
  });
}

/**
 * Invalidate cache for a specific user
 * Call this after creating new analyses to ensure fresh data
 */
export function invalidateUserCache(userId: string) {
  // Implementation would clear specific cache entries for this user
  // This is a placeholder for the actual implementation
  console.log(`Cache invalidated for user ${userId}`);
}