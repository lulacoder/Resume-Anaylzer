'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { validateAndRefreshSession, signOutCompletely } from '@/lib/auth-utils';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface UseSessionReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Track if we've done the initial load to prevent flashing
  const initializedRef = useRef(false);
  const previousSessionIdRef = useRef<string | null>(null);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    const result = await signOutCompletely();
    
    if (result.success) {
      setUser(null);
      setSession(null);
      previousSessionIdRef.current = null;
      // Use router.push for smoother navigation
      router.push('/auth/login');
    } else {
      setError(result.error || 'Failed to sign out');
    }
    setLoading(false);
  }, [router]);

  const handleRefreshSession = useCallback(async () => {
    const result = await validateAndRefreshSession();
    
    if (result.valid && result.session) {
      // Only update state if session actually changed
      if (result.session.access_token !== session?.access_token) {
        setSession(result.session);
        setUser(result.session.user);
      }
      setError(null);
    } else {
      setError(result.error || 'Session validation failed');
      if (!result.valid) {
        // Session is invalid, redirect to login
        setUser(null);
        setSession(null);
        previousSessionIdRef.current = null;
        router.push('/auth/login');
      }
    }
  }, [session?.access_token, router]);

  useEffect(() => {
    const supabase = createClient();
    let refreshInterval: NodeJS.Timeout | null = null;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Initial session error:', sessionError);
          setError(sessionError.message);
        } else if (initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
          previousSessionIdRef.current = initialSession.access_token;
        }
      } catch (err) {
        console.error('Failed to get initial session:', err);
        setError('Failed to initialize session');
      } finally {
        setLoading(false);
        initializedRef.current = true;
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Only process after initial load to prevent flash
        if (!initializedRef.current) return;
        
        // Check if session actually changed (not just a re-emit)
        const newSessionId = newSession?.access_token || null;
        if (newSessionId === previousSessionIdRef.current && event !== 'SIGNED_OUT') {
          // Session hasn't actually changed, skip update
          return;
        }
        
        previousSessionIdRef.current = newSessionId;
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setError(null);
        
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login');
        } else if (event === 'SIGNED_IN' && newSession) {
          // Only redirect to dashboard if we're on auth pages or root
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.startsWith('/auth');
          const isRootPage = currentPath === '/';
          
          if (isAuthPage || isRootPage) {
            router.push('/dashboard');
          }
        }
      }
    );

    // Set up automatic session refresh (only if we have a session)
    refreshInterval = setInterval(async () => {
      if (previousSessionIdRef.current) {
        await handleRefreshSession();
      }
    }, 4 * 60 * 1000); // Check every 4 minutes

    return () => {
      subscription.unsubscribe();
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [router, handleRefreshSession]);

  return {
    user,
    session,
    loading,
    error,
    signOut: handleSignOut,
    refreshSession: handleRefreshSession,
  };
}
