import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { Database } from '../lib/supabase-types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function useProfile() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user.id) {
        setLoading(false);
        navigate('/signin');
        return;
      }

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle(); // Use maybeSingle() instead of single()

        // Handle profile not found case
        if (!profileData && (!profileError || profileError.code === 'PGRST116')) {
          navigate('/complete-profile');
          return;
        }

        // Handle other errors
        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        setProfile(profileData);
        setError(null);

        // Fetch unread messages count
        const { count, error: messageError } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', session.user.id)
          .eq('read', false);

        if (messageError) throw messageError;
        setUnreadMessages(count || 0);

      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError('Failed to load profile data');
        
        // If there's a connection error, redirect to sign in
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          navigate('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, supabase, navigate]);

  return {
    profile,
    unreadMessages,
    loading,
    error
  };
}