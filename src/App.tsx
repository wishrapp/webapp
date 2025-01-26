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
    if (!session?.user?.id || !session?.user?.email) {
      throw new Error('User session is invalid');
    }

    try {
      // Generate a unique username from email
      const baseUsername = session.user.email.split('@')[0];
      let username = baseUsername;
      let counter = 1;

      // Keep trying until we find a unique username
      while (true) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', username)
          .maybeSingle();

        if (checkError) throw checkError;
        if (!existingUser) break;
        username = `${baseUsername}${counter++}`;
      }

      // Create the profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          username: username,
          first_name: '',
          last_name: '',
          country: 'US',
          date_of_birth: new Date().toISOString(),
          email_notifications: true,
          terms_accepted: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
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
      setIsConnectionError(false);
      setError(null);

      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
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
    } catch (error) {
      console.error('Error checking user status:', error);
      setError('Failed to load user data. Please try again.');
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
    return (
      <LoadingIndicator 
        message="Error" 
        error={error}
        onRetry={checkUserStatus}
      />
    );
  }

  return <Dashboard />;
}