// Simple in-memory rate limiting for production
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store.entries()) {
        if (now > entry.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  check(identifier: string, limit: number, windowMs: number): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const resetTime = now + windowMs;
    
    const entry = this.store.get(identifier);
    
    if (!entry || now > entry.resetTime) {
      // First request or window expired
      this.store.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: limit - 1, resetTime };
    }
    
    if (entry.count >= limit) {
      // Rate limit exceeded
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }
    
    // Increment count
    entry.count++;
    this.store.set(identifier, entry);
    
    return { allowed: true, remaining: limit - entry.count, resetTime: entry.resetTime };
  }

  reset(identifier: string): void {
    this.store.delete(identifier);
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Rate limiting configurations
export const RATE_LIMITS = {
  // Analysis endpoint - 5 requests per 10 minutes per user
  ANALYSIS: { limit: 5, windowMs: 10 * 60 * 1000 },
  
  // Auth endpoints - 10 requests per 15 minutes per IP
  AUTH: { limit: 10, windowMs: 15 * 60 * 1000 },
  
  // General API - 100 requests per hour per user
  API: { limit: 100, windowMs: 60 * 60 * 1000 },
  
  // File upload - 3 uploads per 5 minutes per user
  UPLOAD: { limit: 3, windowMs: 5 * 60 * 1000 },
};

export function createRateLimitMiddleware(
  config: { limit: number; windowMs: number },
  getIdentifier: (request: Request) => string
) {
  return async (request: Request): Promise<Response | null> => {
    const identifier = getIdentifier(request);
    const result = rateLimiter.check(identifier, config.limit, config.windowMs);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': config.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
          },
        }
      );
    }
    
    return null; // Allow request to proceed
  };
}

// Helper to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}