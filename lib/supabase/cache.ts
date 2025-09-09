/**
 * Simple in-memory cache implementation for database queries
 * This reduces database load for frequently accessed data
 */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

class QueryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if entry has expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set a value in cache with expiration
   * @param key Cache key
   * @param value Value to cache
   * @param ttlSeconds Time to live in seconds
   */
  set<T>(key: string, value: T, ttlSeconds: number): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data: value, expiry });
  }
  
  /**
   * Delete a value from cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache stats
   */
  stats(): { size: number } {
    return {
      size: this.cache.size
    };
  }
}

// Create singleton instance
export const queryCache = new QueryCache();

// Run cache cleanup every minute (only in browser environment)
if (typeof window !== 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    queryCache.cleanup();
  }, 60000);
}

/**
 * Wrapper function to cache query results
 * @param key Cache key
 * @param ttlSeconds Time to live in seconds
 * @param fetchFn Function to fetch data if not in cache
 * @returns Query result (from cache or freshly fetched)
 */
export async function cachedQuery<T>(
  key: string,
  ttlSeconds: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache first
  const cached = queryCache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }
  
  // Not in cache, fetch fresh data
  const data = await fetchFn();
  
  // Store in cache
  queryCache.set(key, data, ttlSeconds);
  
  return data;
}