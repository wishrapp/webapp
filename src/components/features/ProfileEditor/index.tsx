import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { useNavigate } from 'react-router-dom';
import LoadingIndicator from '../../shared/LoadingIndicator';
import ConnectionError from '../../shared/ConnectionError';
import EditEmailPassword from '../EditEmailPassword';
import ProfileImage from './ProfileImage';
import ProfileForm from './ProfileForm';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileEditor() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      if (!session?.user.id) {
        navigate('/signin');
        return;
      }

      try {
        setIsConnectionError(false);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          if (error.message.includes('Failed to fetch')) {
            setIsConnectionError(true);
            return;
          }
          throw error;
        }
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [session, supabase, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id || !profile) return;

    setSaving(true);
    setError(null);

    try {
      // Start a transaction to update both profile and birthday occasion
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          username: profile.username,
          country: profile.country,
          date_of_birth: profile.date_of_birth,
          email_notifications: profile.email_notifications,
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      // Format the birthday date for display
      const birthdayDate = new Date(profile.date_of_birth);
      const formattedDate = birthdayDate.toLocaleString('en-US', { month: 'long', day: 'numeric' });

      // Update the birthday occasion
      const { error: occasionError } = await supabase
        .from('occasions')
        .update({
          name: `Birthday (${formattedDate})`,
          date: profile.date_of_birth
        })
        .eq('user_id', session.user.id)
        .eq('is_default', false)
        .ilike('name', 'Birthday%');

      if (occasionError) throw occasionError;

      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isConnectionError) {
    return (
      <ConnectionError 
        message="Unable to connect to the server. Please check your internet connection."
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (loading) {
    return <LoadingIndicator message="Loading profile..." />;
  }

  if (!profile || !session?.user?.id) {
    return <LoadingIndicator message="Profile not found" error="Failed to load profile" />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <button
              onClick={() => setShowEmailPassword(true)}
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              Change Email/Password
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              {error}
            </div>
          )}

          <ProfileImage
            userId={session.user.id}
            imageUrl={profile.profile_image_url}
            onImageUpdate={(url) => setProfile({ ...profile, profile_image_url: url })}
          />

          <ProfileForm
            profile={profile}
            onProfileChange={setProfile}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/')}
            saving={saving}
          />
        </div>
      </div>

      {showEmailPassword && (
        <EditEmailPassword
          onClose={() => setShowEmailPassword(false)}
          currentEmail={profile.email}
        />
      )}
    </div>
  );
}