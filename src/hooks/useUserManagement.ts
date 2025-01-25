import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type SortField = 'username' | 'last_name' | 'created_at' | 'verified' | 'suspended';
type SortDirection = 'asc' | 'desc';

export function useUserManagement() {
  const supabase = useSupabaseClient<Database>();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [pendingRequestCounts, setPendingRequestCounts] = useState<Record<string, number>>({});

  const fetchUsers = async (sortField: SortField, sortDirection: SortDirection) => {
    try {
      let query = supabase.from('profiles').select('*');

      // Special handling for different sort fields
      if (sortField === 'last_name') {
        query = query.order('last_name', { ascending: sortDirection === 'asc' })
                    .order('first_name', { ascending: sortDirection === 'asc' });
      } else if (sortField === 'verified') {
        // For status sorting, we'll sort by verified first, then by suspended
        query = query.order('verified', { ascending: sortDirection === 'asc' })
                    .order('suspended', { ascending: sortDirection === 'asc' });
      } else {
        query = query.order(sortField, { ascending: sortDirection === 'asc' });
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);

      // Fetch item counts for each user
      const itemCountsPromises = data.map(async (user) => {
        const { count } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        return [user.id, count || 0];
      });

      // Fetch pending request counts for each user
      const requestCountsPromises = data.map(async (user) => {
        const { count } = await supabase
          .from('access_requests')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', user.id)
          .eq('status', 'pending');
        return [user.id, count || 0];
      });

      const [itemCountsResults, requestCountsResults] = await Promise.all([
        Promise.all(itemCountsPromises),
        Promise.all(requestCountsPromises)
      ]);

      setItemCounts(Object.fromEntries(itemCountsResults));
      setPendingRequestCounts(Object.fromEntries(requestCountsResults));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    itemCounts,
    pendingRequestCounts,
    fetchUsers,
  };
}