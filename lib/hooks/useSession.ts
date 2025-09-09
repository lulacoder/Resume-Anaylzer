'use client';

import { useEffect, useState } from 'react';
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

  const handleSignOut = async () => {
    setLoading(true);
    const result = await signOutCompletely();
    
    if (result.success) {
      setUser(null);
      setSession(null);
      router.push('/auth/login');
    } else {
      setError(result.error || 'Failed to sign out');
    }
    setLoading(false);
  };

  const handleRefreshSession = async () => {
    const result = await validateAndRefreshSession();
    
    if (result.valid && result.session) {
      setSession(result.session);
      setUser(result.session.user);
      setError(null);
    } else {
      setError(result.error || 'Session validation failed');
      if (!result.valid) {
        // Session is invalid, redirect to login
        setUser(null);
        setSession(null);
        router.push('/auth/login');
      }
    }
  };

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Initial session error:', error);
          setError(error.message);
        } else if (session) {
          setSession(session);
          setUser(session.user);
        }
      } catch (err) {
        console.error('Failed to get initial session:', err);
        setError('Failed to initialize session');
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        setSession(session);
        setUser(session?.user ?? null);
        setError(null);
        
        if (event === 'SIGNED_OUT') {
          router.push('/auth/login');
        } else if (event === 'SIGNED_IN' && session) {
          // Only redirect to dashboard if we're on auth pages or root
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.startsWith('/auth');
          const isRootPage = currentPath === '/';
          
          if (isAuthPage || isRootPage) {
            router.push('/dashboard');
          }
          // Otherwise, stay on the current page
        }
      }
    );

    // Set up automatic session refresh
    const refreshInterval = setInterval(async () => {
      if (session) {
        await handleRefreshSession();
      }
    }, 4 * 60 * 1000); // Check every 4 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [router, session]);

  return {
    user,
    session,
    loading,
    error,
    signOut: handleSignOut,
    refreshSession: handleRefreshSession,
  };
}