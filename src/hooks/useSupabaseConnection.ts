import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';

export function useSupabaseConnection() {
  const supabase = useSupabaseClient<Database>();
  const [isConnected, setIsConnected] = useState(true);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  const checkConnection = useCallback(async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      
      if (error) {
        if (error.message.includes('Failed to fetch')) {
          setIsConnected(false);
          return false;
        }
        throw error;
      }

      setIsConnected(true);
      return true;
    } catch (error) {
      console.error('Connection check error:', error);
      setIsConnected(false);
      return false;
    } finally {
      setIsInitialCheck(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Initial connection check
    checkConnection();

    // Set up periodic connection checks
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [checkConnection]);

  // Don't show connection error during initial check
  return {
    isConnected: isInitialCheck ? true : isConnected,
    checkConnection
  };
}