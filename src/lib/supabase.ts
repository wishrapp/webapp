import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error(
    `Invalid Supabase URL format. Please ensure VITE_SUPABASE_URL is a valid URL. Current value: ${supabaseUrl}`
  );
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      autoRefreshToken: true,
      flowType: 'pkce'
    }
  }
);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // Store session in localStorage
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  } else if (event === 'SIGNED_OUT') {
    // Clear session from localStorage
    localStorage.removeItem('supabase.auth.token');
  }
});