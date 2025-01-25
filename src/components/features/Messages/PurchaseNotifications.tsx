import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { formatDistanceToNow } from 'date-fns';
import LoadingIndicator from '../../../components/shared/LoadingIndicator';

type PurchaseNotification = Database['public']['Tables']['purchase_notifications']['Row'] & {
  item: {
    name: string;
    price: number | null;
  };
  purchaser: {
    username: string;
    profile_image_url?: string | null;
  };
};

export default function PurchaseNotifications() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [notifications, setNotifications] = useState<PurchaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from('purchase_notifications')
          .select(`
            *,
            item:items (name, price),
            purchaser:profiles (username, profile_image_url)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error('Error fetching purchase notifications:', error);
        setError('Failed to load purchase notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session, supabase]);

  if (loading) {
    return <LoadingIndicator message="Loading purchase notifications..." />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No purchase notifications
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {notifications.map(notification => (
        <div key={notification.id} className="p-6">
          <div className="flex items-center space-x-4">
            {notification.reveal_identity && notification.purchaser.profile_image_url ? (
              <img
                src={notification.purchaser.profile_image_url}
                alt={notification.purchaser.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  {notification.reveal_identity
                    ? notification.purchaser.username[0].toUpperCase()
                    : '?'}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {notification.reveal_identity
                  ? `${notification.purchaser.username} purchased "${notification.item.name}"`
                  : `Someone purchased "${notification.item.name}"`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}