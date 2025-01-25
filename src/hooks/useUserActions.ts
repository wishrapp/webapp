import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';

export function useUserActions() {
  const supabase = useSupabaseClient<Database>();

  const handleVerify = async (userId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const handleSuspend = async (userId: string, suspended: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ suspended })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  return {
    handleVerify,
    handleSuspend,
    handleDelete
  };
}