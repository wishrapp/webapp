import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { formatDistanceToNow } from 'date-fns';
import LoadingIndicator from '../../shared/LoadingIndicator';

type Message = Database['public']['Tables']['messages']['Row'];

export default function SystemMessages() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_id', session.user.id)
          .eq('sender_id', '00000000-0000-0000-0000-000000000000') // System user UUID
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching system messages:', error);
        setError('Failed to load system messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [session, supabase]);

  if (loading) {
    return <LoadingIndicator message="Loading system messages..." />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No system messages
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {messages.map(message => (
        <div key={message.id} className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {message.subject}
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      ))}
    </div>
  );
}