import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';

type AffiliateSettings = Database['public']['Tables']['affiliate_settings']['Row'];

export default function AdminAffiliates() {
  const supabase = useSupabaseClient<Database>();
  const [settings, setSettings] = useState<AffiliateSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [amazonId, setAmazonId] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_settings')
        .select('*')
        .order('platform');

      if (error) throw error;
      setSettings(data);

      // Set Amazon ID if it exists
      const amazonSettings = data.find(s => s.platform === 'amazon');
      if (amazonSettings?.settings) {
        setAmazonId((amazonSettings.settings as any).associateId || '');
      }
    } catch (error) {
      console.error('Error fetching affiliate settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAmazon = async () => {
    try {
      setError(null);

      const existingSettings = settings.find(s => s.platform === 'amazon');
      const newSettings = {
        platform: 'amazon',
        settings: { associateId: amazonId },
        active: true
      };

      if (existingSettings) {
        const { error } = await supabase
          .from('affiliate_settings')
          .update(newSettings)
          .eq('platform', 'amazon');

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('affiliate_settings')
          .insert([newSettings]);

        if (error) throw error;
      }

      await fetchSettings();
    } catch (err) {
      console.error('Error saving Amazon settings:', err);
      setError('Failed to save settings');
    }
  };

  if (loading) {
    return <div>Loading affiliate settings...</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Affiliate Settings</h2>

      <div className="space-y-8">
        {/* Amazon Settings */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Amazon Associates</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Associate ID
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={amazonId}
                  onChange={(e) => setAmazonId(e.target.value)}
                  placeholder="e.g., wishr-21"
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={handleSaveAmazon}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Save Amazon Settings
            </button>
          </div>
        </div>

        {/* Coming Soon Sections */}
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg opacity-50">
            <h3 className="text-lg font-semibold mb-2">CJ.com</h3>
            <p className="text-sm text-gray-600">Coming Soon</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg opacity-50">
            <h3 className="text-lg font-semibold mb-2">AWin.com</h3>
            <p className="text-sm text-gray-600">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}