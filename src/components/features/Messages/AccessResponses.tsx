import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { formatDistanceToNow } from 'date-fns';
import LoadingIndicator from '../../shared/LoadingIndicator';

type AccessRequest = Database['public']['Tables']['access_requests']['Row'] & {
  target: {
    username: string;
    profile_image_url?: string | null;
  };
};

export default function AccessResponses() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [responses, setResponses] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from('access_requests')
          .select(`
            *,
            target:profiles!access_requests_target_id_fkey (
              username, 
              profile_image_url
            )
          `)
          .eq('requester_id', session.user.id)
          .not('status', 'eq', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setResponses(data || []);
      } catch (error) {
        console.error('Error fetching access responses:', error);
        setError('Failed to load access responses');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [session, supabase]);

  if (loading) {
    return <LoadingIndicator message="Loading access responses..." />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (responses.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No access responses yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {responses.map(response => (
        <div key={response.id} className="p-6">
          <div className="flex items-center space-x-4">
            {response.target.profile_image_url ? (
              <img
                src={response.target.profile_image_url}
                alt={response.target.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  {response.target.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {response.target.username}
                </p>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  response.status === 'approved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {response.status === 'approved' ? 'Approved' : 'Rejected'}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Responded {formatDistanceToNow(new Date(response.updated_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}