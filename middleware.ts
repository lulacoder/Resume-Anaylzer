import { NextResponse } from 'next/server';
import { createClient } from './lib/supabase/server';
import { createRateLimitMiddleware, RATE_LIMITS, getClientIP } from './lib/rate-limiting';

import type { NextRequest } from 'next/server';

// Rate limiting middleware for different endpoints
const authRateLimit = createRateLimitMiddleware(
  RATE_LIMITS.AUTH,
  (request) => getClientIP(request)
);

const apiRateLimit = createRateLimitMiddleware(
  RATE_LIMITS.API,
  (request) => {
    // Try to get user ID from session, fallback to IP
    const authHeader = request.headers.get('authorization');
    return authHeader || getClientIP(request);
  }
);

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Add security headers
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  
  // CSP header for additional security
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval and unsafe-inline
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
  
  res.headers.set('Content-Security-Policy', cspHeader);

  // Apply rate limiting
  if (req.nextUrl.pathname.startsWith('/auth/')) {
    const rateLimitResponse = await authRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  }

  if (req.nextUrl.pathname.startsWith('/api/')) {
    const rateLimitResponse = await apiRateLimit(req);
    if (rateLimitResponse) return rateLimitResponse;
  }



  // Only check auth for protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/profile') ||
    req.nextUrl.pathname.startsWith('/analyze') ||
    req.nextUrl.pathname.startsWith('/analysis')) {
    try {
      const supabase = await createClient();
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth session error:', error);
        // Don't redirect on session errors, let the client handle it
        return res;
      }

      if (!session) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Middleware auth check failed:', error);
      // Don't redirect on middleware errors, let the client handle auth
      return res;
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json, robots.txt, sitemap.xml (SEO files)
     * - auth callback (to avoid rate limiting OAuth)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|robots.txt|sitemap.xml|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
