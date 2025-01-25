import { createClient } from '@supabase/supabase-js';
import { Database } from './supabase-types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storage: localStorage,
      storageKey: 'sb-eawuqfqcrhwqdujwiorf-auth-token',
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    localStorage.setItem('sb-eawuqfqcrhwqdujwiorf-auth-token', JSON.stringify(session));
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('sb-eawuqfqcrhwqdujwiorf-auth-token');
  }
});