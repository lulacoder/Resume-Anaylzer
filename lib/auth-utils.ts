import { createClient as createBrowserClient } from './supabase/client';

/**
 * Enhanced session management utilities
 */
export async function refreshSession() {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Session refresh error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session };
  } catch (error) {
    console.error('Session refresh failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Enhanced logout function that clears app sessions
 */
export async function signOutCompletely() {
  try {
    const supabase = createBrowserClient();
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }

    // Clear any local storage items
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-' + process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0] + '-auth-token');
    }

    return { success: true };
  } catch (error) {
    console.error('Complete sign out failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Check if session is valid and refresh if needed
 */
export async function validateAndRefreshSession() {
  try {
    const supabase = createBrowserClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session validation error:', error);
      return { valid: false, error: error.message };
    }

    if (!session) {
      return { valid: false, error: 'No session found' };
    }

    // Check if session is close to expiring (within 5 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      console.log('Session expiring soon, refreshing...');
      const refreshResult = await refreshSession();
      
      if (!refreshResult.success) {
        return { valid: false, error: 'Failed to refresh session' };
      }
      
      return { valid: true, refreshed: true, session: refreshResult.session };
    }

    return { valid: true, session };
  } catch (error) {
    console.error('Session validation failed:', error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}



/**
 * Get user profile information (client-side)
 */
export async function getUserProfile() {
  const supabase = createBrowserClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error?.message };
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      avatar: user.user_metadata?.avatar_url,
      provider: 'email',
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    },
    error: null,
  };
}