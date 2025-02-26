import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import LoadingIndicator from '../../shared/LoadingIndicator';
import ConnectionError from '../../shared/ConnectionError';

export default function AmazonAffiliate() {
  const supabase = useSupabaseClient<Database>();
  const [associateId, setAssociateId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isConnectionError, setIsConnectionError] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsConnectionError(false);
      setError(null);
      
      const { data, error } = await supabase
        .from('affiliate_settings')
        .select('settings')
        .eq('platform', 'amazon')
        .maybeSingle();

      if (error) {
        if (error.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        // PGRST116 means no rows found - this is expected for first-time setup
        if (error.code !== 'PGRST116') throw error;
      }

      if (data?.settings) {
        setAssociateId((data.settings as any).associateId || '');
      }
    } catch (error) {
      console.error('Error fetching Amazon settings:', error);
      setError('Failed to load Amazon settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [supabase]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (success) {
      timeout = setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [success]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate Associate ID format
      if (!associateId.match(/^[a-z0-9-]+$/)) {
        throw new Error('Invalid Associate ID format');
      }

      const { error } = await supabase
        .from('affiliate_settings')
        .upsert({
          platform: 'amazon',
          settings: { 
            associateId,
            resolveShortUrls: true // Enable short URL resolution
          },
          active: true
        }, {
          onConflict: 'platform'
        });

      if (error) {
        if (error.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw error;
      }
      
      setSuccess(true);
    } catch (error) {
      console.error('Error saving Amazon settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isConnectionError) {
    return (
      <ConnectionError 
        message="Unable to connect to the server. Please check your internet connection."
        onRetry={fetchSettings}
      />
    );
  }

  if (isLoading) {
    return <LoadingIndicator message="Loading Amazon settings..." />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Amazon Associates</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Associate ID
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              value={associateId}
              onChange={(e) => setAssociateId(e.target.value)}
              placeholder="e.g., wishr-21"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:border-[#9333ea] focus:ring-[#9333ea]"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Enter your Amazon Associate ID to enable affiliate links. Both standard Amazon URLs and shortened URLs (amzn.eu) will be processed.
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/30 p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-4">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-sm text-green-600 dark:text-green-400">
                Settings saved successfully
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#9333ea] hover:bg-[#7e22ce] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9333ea] disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Amazon Settings'}
        </button>
      </div>
    </div>
  );
}