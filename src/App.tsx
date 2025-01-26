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
      // Get user metadata from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const metadata = user?.user_metadata;
      if (!metadata) throw new Error('User metadata not found');

      // Get country using geolocation API
      let country = 'US'; // Default to United States
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch country');
        const data = await response.json();
        if (data.country) {
          country = data.country;
        }
      } catch (error) {
        console.error('Error fetching country:', error);
        // Keep default US if API fails
      }

      // Create the profile with metadata values
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          email: session.user.email,
          username: metadata.username || session.user.email.split('@')[0],
          first_name: metadata.first_name || '',
          last_name: metadata.last_name || '',
          country: metadata.country || country,
          date_of_birth: metadata.date_of_birth || '2000-01-01',
          email_notifications: metadata.email_notifications || true,
          terms_accepted: metadata.terms_accepted || true,
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

      // Check if user has a profile and is not suspended
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

      // If user is suspended, sign them out
      if (profile?.suspended) {
        await supabase.auth.signOut();
        setError('Your account has been suspended. Please contact support@wishr.com if you require further assistance.');
        navigate('/signin', { replace: true });
        return;
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