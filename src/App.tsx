import { useEffect } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Database } from './lib/supabase-types';
import Dashboard from './components/dashboard/Dashboard';

export default function App() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate('/signin', { replace: true });
      return;
    }

    // Check if user has a profile
    const checkProfile = async () => {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        // If no profile exists, redirect to complete profile
        if (!profile) {
          navigate('/complete-profile', { replace: true });
          return;
        }

        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
        if (adminError) throw adminError;

        // Redirect to appropriate dashboard
        if (isAdmin) {
          navigate('/admin', { replace: true });
        }
      } catch (error) {
        console.error('Error checking profile:', error);
        navigate('/signin', { replace: true });
      }
    };

    checkProfile();
  }, [session, supabase, navigate]);

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  return <Dashboard />;
}