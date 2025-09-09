/**
 * Enhanced authentication error handling for OAuth connection timeouts
 */

export interface AuthError {
  message: string;
  code?: string;
  isRetryable: boolean;
  userMessage: string;
}

export function handleAuthError(error: any): AuthError {
  console.error('Auth error:', error);

  // Handle connection timeout errors
  if (error?.code === 'UND_ERR_CONNECT_TIMEOUT' || 
      error?.message?.includes('Connect Timeout Error') ||
      error?.message?.includes('fetch failed')) {
    return {
      message: 'Connection timeout to authentication service',
      code: 'CONNECTION_TIMEOUT',
      isRetryable: true,
      userMessage: 'Connection timed out. Please check your internet connection and try again.',
    };
  }

  // Handle OAuth specific errors
  if (error?.message?.includes('oauth_error') || 
      error?.__isAuthError) {
    return {
      message: 'OAuth authentication failed',
      code: 'OAUTH_ERROR',
      isRetryable: true,
      userMessage: 'Authentication failed. Please try signing in again.',
    };
  }

  // Handle network errors
  if (error?.message?.includes('NetworkError') || 
      error?.message?.includes('Failed to fetch')) {
    return {
      message: 'Network error during authentication',
      code: 'NETWORK_ERROR',
      isRetryable: true,
      userMessage: 'Network error. Please check your connection and try again.',
    };
  }

  // Handle invalid credentials
  if (error?.message?.includes('Invalid login credentials') ||
      error?.message?.includes('Email not confirmed')) {
    return {
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
      isRetryable: false,
      userMessage: 'Invalid email or password. Please check your credentials.',
    };
  }

  // Handle rate limiting
  if (error?.message?.includes('rate limit') || 
      error?.status === 429) {
    return {
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT',
      isRetryable: true,
      userMessage: 'Too many attempts. Please wait a moment and try again.',
    };
  }

  // Generic error fallback
  return {
    message: error?.message || 'Unknown authentication error',
    code: 'UNKNOWN_ERROR',
    isRetryable: true,
    userMessage: 'An unexpected error occurred. Please try again.',
  };
}

/**
 * Retry mechanism for authentication operations
 */
export async function retryAuthOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const authError = handleAuthError(error);
      
      console.log(`Auth attempt ${attempt}/${maxRetries} failed:`, authError.message);
      
      // Don't retry if error is not retryable
      if (!authError.isRetryable) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }

  throw lastError;
}

/**
 * Enhanced sign in with retry logic
 */
export async function signInWithRetry(
  supabase: any,
  credentials: { email: string; password: string }
) {
  return retryAuthOperation(async () => {
    const { data, error } = await supabase.auth.signInWithPassword(credentials);
    if (error) throw error;
    return data;
  });
}

/**
 * Enhanced OAuth sign in with retry logic
 */
export async function signInWithOAuthRetry(
  supabase: any,
  provider: 'google' | 'github' | 'discord',
  options?: any
) {
  return retryAuthOperation(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        ...options,
      },
    });
    if (error) throw error;
    return data;
  }, 2, 2000); // Fewer retries for OAuth, longer delay
}