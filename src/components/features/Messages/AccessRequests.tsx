import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { formatDistanceToNow } from 'date-fns';
import { sendAccessApprovedEmail, sendAccessRejectedEmail } from '../../../lib/email/wishlist';
import LoadingIndicator from '../../shared/LoadingIndicator';

type AccessRequest = Database['public']['Tables']['access_requests']['Row'] & {
  requester: {
    username: string;
    profile_image_url?: string | null;
    email: string;
  };
  target: {
    username: string;
  };
};

export default function AccessRequests() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from('access_requests')
          .select(`
            *,
            requester:profiles!access_requests_requester_id_fkey (
              username, 
              profile_image_url,
              email
            ),
            target:profiles!access_requests_target_id_fkey (
              username
            )
          `)
          .eq('target_id', session.user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (error) {
        console.error('Error fetching access requests:', error);
        setError('Failed to load access requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [session, supabase]);

  const handleRequest = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!session?.user.id) return;

    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) throw new Error('Request not found');

      // Update request status
      const { error: updateError } = await supabase
        .from('access_requests')
        .update({ status })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Create a message for the requester
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: session.user.id,
          recipient_id: request.requester_id,
          subject: `Wishlist Access ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          content: status === 'approved'
            ? `Great news! ${request.target.username} has approved your request to view their wishlist. You can now search for their username to view their items.`
            : `${request.target.username} has rejected your request to view their wishlist.`,
          read: false
        });

      if (messageError) throw messageError;

      // Send email notification
      if (status === 'approved') {
        await sendAccessApprovedEmail(request.requester.email, request.target.username);
      } else {
        await sendAccessRejectedEmail(request.requester.email, request.target.username);
      }

      // Update local state
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error updating access request:', error);
      setError('Failed to process request');
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading access requests..." />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No pending access requests
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {requests.map(request => (
        <div key={request.id} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {request.requester.profile_image_url ? (
                <img
                  src={request.requester.profile_image_url}
                  alt={request.requester.username}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-lg">
                    {request.requester.username[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.requester.username}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleRequest(request.id, 'approved')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => handleRequest(request.id, 'rejected')}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}