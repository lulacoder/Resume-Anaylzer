import { createClient } from './supabase/server';

/**
 * Server-side function to get user profile information
 */
export async function getUserProfileServer() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { user: null, error: error?.message };
  }

  return {
    user: {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown User',
      avatar: user.user_metadata?.avatar_url,
      provider: 'email',
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    },
    error: null,
  };
}