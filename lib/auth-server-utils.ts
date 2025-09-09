import { createClient } from './supabase/server';

/**
 * Server-side utility function to test Google OAuth configuration
 * This function helps verify that the OAuth flow is properly configured
 */
export async function testGoogleOAuthConfigServer() {
  try {
    const supabase = await createClient();
    
    // Test if we can get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return { success: false, error: sessionError.message };
    }

    // If we have a session, verify user data mapping
    if (session?.user) {
      const user = session.user;
      
      // Check if user has Google provider data
      const hasGoogleProvider = user.app_metadata?.providers?.includes('google');
      const hasGoogleIdentity = user.identities?.some(identity => identity.provider === 'google');
      
      console.log('User data verification:', {
        id: user.id,
        email: user.email,
        providers: user.app_metadata?.providers,
        hasGoogleProvider,
        hasGoogleIdentity,
        userMetadata: user.user_metadata,
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          provider: hasGoogleProvider ? 'google' : 'email',
        }
      };
    }

    return { success: true, message: 'No active session' };
  } catch (error) {
    console.error('OAuth config test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Server-side function to get user profile information including Google data
 */
export async function getUserProfileServer() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error?.message };
  }

  // Extract Google profile data if available
  const googleIdentity = user.identities?.find(identity => identity.provider === 'google');
  
  return {
    user: {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
      avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      provider: googleIdentity ? 'google' : 'email',
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
      googleData: googleIdentity ? {
        id: googleIdentity.id,
        email: googleIdentity.identity_data?.email || '',
        name: googleIdentity.identity_data?.full_name || '',
        picture: googleIdentity.identity_data?.picture,
      } : undefined,
    },
    error: null,
  };
}