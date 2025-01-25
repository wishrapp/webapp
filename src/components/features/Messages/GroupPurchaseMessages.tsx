import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { formatDistanceToNow } from 'date-fns';
import { formatCurrency } from '../../../lib/currency';
import LoadingIndicator from '../../../components/shared/LoadingIndicator';

type GroupPurchaseContribution = Database['public']['Tables']['group_purchase_contributions']['Row'] & {
  item: {
    name: string;
    price: number | null;
  };
  contributor: {
    username: string;
    profile_image_url?: string | null;
    email: string;
    telephone: string;
  };
};

export default function GroupPurchaseMessages() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [contributions, setContributions] = useState<GroupPurchaseContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from('group_purchase_contributions')
          .select(`
            *,
            item:items (name, price),
            contributor:profiles (
              username,
              profile_image_url,
              email,
              telephone
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setContributions(data || []);
      } catch (error) {
        console.error('Error fetching group purchase contributions:', error);
        setError('Failed to load group purchase messages');
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [session, supabase]);

  if (loading) {
    return <LoadingIndicator message="Loading group purchase messages..." />;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No group purchase messages
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {contributions.map(contribution => (
        <div key={contribution.id} className="p-6">
          <div className="flex items-center space-x-4">
            {contribution.contributor.profile_image_url ? (
              <img
                src={contribution.contributor.profile_image_url}
                alt={contribution.contributor.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  {contribution.contributor.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {contribution.contributor.username} wants to contribute{' '}
                {formatCurrency(contribution.amount, 'US')} to "{contribution.item.name}"
              </p>
              {contribution.show_email && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email: {contribution.contributor.email}
                </p>
              )}
              {contribution.show_phone && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Phone: {contribution.contributor.telephone}
                </p>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(contribution.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}