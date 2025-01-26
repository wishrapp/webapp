import { useEffect, useState } from 'react';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Database } from './lib/supabase-types';
import Dashboard from './components/dashboard/Dashboard';
import LoadingIndicator from './components/shared/LoadingIndicator';
import ConnectionError from './components/shared/ConnectionError';

export default function App() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);

  const createBasicProfile = async () => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: session!.user.id,
          email: session!.user.email!,
          username: session!.user.email!.split('@')[0],
          email_notifications: true,
          terms_accepted: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError && profileError.code !== '23505') { // Ignore unique constraint violations
        throw profileError;
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  };

  const checkUserStatus = async () => {
    if (!session?.user?.id) {
      navigate('/signin', { replace: true });
      return;
    }

    try {
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        if (profileError.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw profileError;
      }

      // Create basic profile if it doesn't exist
      if (!profile) {
        await createBasicProfile();
      }

      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      if (adminError) {
        if (adminError.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw adminError;
      }

      // Redirect to admin dashboard if admin
      if (isAdmin) {
        navigate('/admin', { replace: true });
        return;
      }

      setLoading(false);
      setIsConnectionError(false);
    } catch (error) {
      console.error('Error checking user status:', error);
      setError('Failed to load user data');
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserStatus();
  }, [session, supabase, navigate]);

  if (!session) {
    return <Navigate to="/signin" replace />;
  }

  if (isConnectionError) {
    return (
      <ConnectionError 
        message="Unable to connect to the server. Please check your internet connection."
        onRetry={checkUserStatus}
      />
    );
  }

  if (loading) {
    return <LoadingIndicator message="Loading..." />;
  }

  if (error) {
    return <LoadingIndicator message={error} error={error} />;
  }

  return <Dashboard />;
}