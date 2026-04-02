import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Cookies can only be modified in Server Actions or Route Handlers.
            // This error is expected when called from Server Components or middleware
            // during token refresh. Silently ignore it.
          }
        },
        remove(name: string) {
          try {
            cookieStore.delete(name);
          } catch {
            // Same as above - ignore if called outside a mutable context.
          }
        },
      },
      auth: {
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'X-Client-Info': 'resume-analyzer-server',
        },
      },
    }
  );
};

// Reset client singleton (useful for testing)
export const resetClient = () => {
  // Placeholder for client reset functionality
  console.log('Client reset requested');
};