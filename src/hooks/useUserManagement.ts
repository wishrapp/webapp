import { useState, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';
import { useSupabaseConnection } from './useSupabaseConnection';

type Profile = Database['public']['Tables']['profiles']['Row'];
type SortField = 'username' | 'last_name' | 'created_at' | 'verified' | 'suspended';
type SortDirection = 'asc' | 'desc';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export function useUserManagement() {
  const supabase = useSupabaseClient<Database>();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [pendingRequestCounts, setPendingRequestCounts] = useState<Record<string, number>>({});
  const { isConnected, checkConnection } = useSupabaseConnection();

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async <T,>(
    operation: () => Promise<{ data: T | null; error: any; count?: number | null }>,
    retries = MAX_RETRIES
  ): Promise<{ data: T | null; error: any; count?: number | null }> => {
    for (let i = 0; i < retries; i++) {
      try {
        const result = await operation();
        if (!result.error) return result;
        
        // If it's not a connection error, don't retry
        if (!result.error.message?.includes('Failed to fetch') && 
            !result.error.message?.includes('connection timeout') &&
            !result.error.message?.includes('upstream connect error')) {
          return result;
        }

        // Check connection before retrying
        const connected = await checkConnection();
        if (!connected) {
          await sleep(RETRY_DELAY * Math.pow(2, i)); // Exponential backoff
          continue;
        }

        return result;
      } catch (error) {
        if (i === retries - 1) throw error;
        await sleep(RETRY_DELAY * Math.pow(2, i));
      }
    }
    return { data: null, error: new Error('Max retries reached') };
  };

  const fetchUsers = useCallback(async (sortField: SortField, sortDirection: SortDirection) => {
    if (!isConnected) {
      setError('Unable to connect to the server. Please check your internet connection.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Build the sort query carefully to avoid SQL injection
      let query = supabase.from('profiles').select('*');

      // Handle special sort cases
      switch (sortField) {
        case 'last_name':
          query = query.order('last_name', { ascending: sortDirection === 'asc', nullsFirst: false })
                      .order('first_name', { ascending: sortDirection === 'asc', nullsFirst: false });
          break;
        case 'verified':
          query = query.order('verified', { ascending: sortDirection === 'asc', nullsFirst: false })
                      .order('suspended', { ascending: sortDirection === 'asc', nullsFirst: false });
          break;
        default:
          query = query.order(sortField, { ascending: sortDirection === 'asc', nullsFirst: false });
      }

      // Fetch users with retry
      const { data: userData, error: userError } = await fetchWithRetry(async () => query);

      if (userError) throw userError;
      setUsers(userData || []);

      // Fetch counts in smaller batches to avoid timeouts
      const batchSize = 5;
      const userBatches = [];
      for (let i = 0; i < (userData?.length || 0); i += batchSize) {
        userBatches.push(userData?.slice(i, i + batchSize) || []);
      }

      const itemCountsMap = new Map<string, number>();
      const requestCountsMap = new Map<string, number>();

      // Process batches sequentially to avoid overwhelming the server
      for (const batch of userBatches) {
        await Promise.all(
          batch.map(async (user) => {
            // Use type assertions to handle the count property
            const [itemCountResult, requestCountResult] = await Promise.all([
              fetchWithRetry(async () => 
                supabase.from('items')
                       .select('*', { count: 'exact', head: true })
                       .eq('user_id', user.id)
              ),
              fetchWithRetry(async () => 
                supabase.from('access_requests')
                       .select('*', { count: 'exact', head: true })
                       .eq('target_id', user.id)
                       .eq('status', 'pending')
              )
            ]);

            itemCountsMap.set(user.id, itemCountResult.count || 0);
            requestCountsMap.set(user.id, requestCountResult.count || 0);
          })
        );

        // Small delay between batches
        await sleep(100);
      }

      setItemCounts(Object.fromEntries(itemCountsMap));
      setPendingRequestCounts(Object.fromEntries(requestCountsMap));

    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [supabase, isConnected, checkConnection]);

  return {
    users,
    loading,
    error,
    itemCounts,
    pendingRequestCounts,
    fetchUsers,
  };
}