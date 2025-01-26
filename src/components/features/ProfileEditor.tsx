import { useState, useEffect, useRef } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { useNavigate } from 'react-router-dom';
import { countries } from '../../lib/countries';
import { uploadProfileImage } from '../../lib/image';
import LoadingIndicator from '../shared/LoadingIndicator';
import ConnectionError from '../shared/ConnectionError';
import EditEmailPassword from './EditEmailPassword';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ProfileEditor() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user.id || !profile) return;

    try {
      setUploadProgress(0);
      setUploadError(null);

      setUploadProgress(10);
      const publicUrl = await uploadProfileImage(session.user.id, file);
      setUploadProgress(90);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_image_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, profile_image_url: publicUrl });
      setUploadProgress(100);

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id || !profile) return;

    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
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

      if (error) throw error;

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

  if (!profile) {
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

          {uploadError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
              {uploadError}
            </div>
          )}

          <div className="mb-6">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={profile.profile_image_url || 'https://via.placeholder.com/150'}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
                {uploadProgress > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <span className="text-white font-semibold">{uploadProgress}%</span>
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white dark:bg-gray-700 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  Change Photo
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  value={profile.first_name || ''}
                  onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profile.last_name || ''}
                  onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={profile.username}
                  onChange={e => setProfile({ ...profile, username: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country
                </label>
                <select
                  value={profile.country || ''}
                  onChange={e => setProfile({ ...profile, country: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a country</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.date_of_birth?.split('T')[0] || ''}
                  onChange={e => setProfile({ ...profile, date_of_birth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={profile.email_notifications}
                    onChange={e => setProfile({ ...profile, email_notifications: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Receive email notifications
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
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