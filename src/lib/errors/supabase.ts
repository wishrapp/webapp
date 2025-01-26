import { AuthError } from '@supabase/supabase-js';

export type SupabaseErrorCode = 
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'user_suspended'
  | 'network_error'
  | 'unknown_error';

export interface MappedError {
  code: SupabaseErrorCode;
  message: string;
}

export function mapAuthError(error: AuthError | Error | null): MappedError {
  if (!error) {
    return {
      code: 'unknown_error',
      message: 'An unexpected error occurred. Please try again.'
    };
  }

  // Handle network errors
  if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
    return {
      code: 'network_error',
      message: 'Unable to connect to the server. Please check your internet connection.'
    };
  }

  // Check for Supabase error code first
  if (error instanceof Error && 'code' in error) {
    const supabaseError = error as AuthError & { code: string };
    
    switch (supabaseError.code) {
      case 'invalid_credentials':
        return {
          code: 'invalid_credentials',
          message: 'Invalid email or password. Please try again.'
        };
      // Add other specific error codes as needed
    }
  }

  // Fallback to message-based checks
  if (error.message.includes('Invalid login credentials')) {
    return {
      code: 'invalid_credentials',
      message: 'Invalid email or password. Please try again.'
    };
  }

  if (error.message.includes('Email not confirmed')) {
    return {
      code: 'email_not_confirmed',
      message: 'Please verify your email address before signing in. Check your inbox for the verification link.'
    };
  }

  // Default error
  return {
    code: 'unknown_error',
    message: 'An unexpected error occurred. Please try again.'
  };
}

export function mapProfileError(error: string): MappedError {
  if (error.includes('suspended')) {
    return {
      code: 'user_suspended',
      message: 'Your account has been suspended. Please contact support@wishr.com if you require further assistance.'
    };
  }

  return {
    code: 'unknown_error',
    message: 'An unexpected error occurred. Please try again.'
  };
}