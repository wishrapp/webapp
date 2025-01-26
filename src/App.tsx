import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Database } from './lib/supabase-types';
import Dashboard from './components/dashboard/Dashboard';
import LoadingIndicator from './components/shared/LoadingIndicator';

export default function App() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileReminder, setShowProfileReminder] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      if (!session?.user?.id) {
        navigate('/signin', { replace: true });
        return;
      }

      try {
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // If profile is incomplete, show reminder
        if (!profile || !profile.username) {
          setShowProfileReminder(true);
        }

        // Check if user is admin
        const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
        if (adminError) throw adminError;

        // Redirect to admin dashboard if admin
        if (isAdmin) {
          navigate('/admin', { replace: true });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking user status:', error);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    checkUserStatus();
  }, [session, supabase, navigate]);

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (loading) {
    return <LoadingIndicator message="Loading..." />;
  }

  if (error) {
    return <LoadingIndicator message={error} error={error} />;
  }

  return (
    <>
      <Dashboard />
    </>
  );
}
