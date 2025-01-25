import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../lib/supabase-types';
import { createAffiliateUrl } from '../lib/affiliates/amazon';

export function useAffiliateUrl(originalUrl: string | null): string | null {
  const supabase = useSupabaseClient<Database>();
  const [affiliateUrl, setAffiliateUrl] = useState<string | null>(originalUrl);

  useEffect(() => {
    const transformUrl = async () => {
      if (!originalUrl) {
        setAffiliateUrl(null);
        return;
      }

      try {
        // Check if it's an Amazon URL
        if (!originalUrl.includes('amazon')) {
          setAffiliateUrl(originalUrl);
          return;
        }

        // Get Amazon affiliate settings
        const { data, error } = await supabase
          .from('affiliate_settings')
          .select('settings')
          .eq('platform', 'amazon')
          .single();

        if (error) throw error;

        // Safely access settings object
        const settings = data?.settings;
        if (!settings || typeof settings !== 'object' || !('associateId' in settings)) {
          setAffiliateUrl(originalUrl);
          return;
        }

        const associateId = settings.associateId;
        if (typeof associateId !== 'string' || !associateId) {
          setAffiliateUrl(originalUrl);
          return;
        }

        // Transform the URL
        const transformedUrl = createAffiliateUrl(originalUrl, associateId);
        setAffiliateUrl(transformedUrl || originalUrl);
      } catch (error) {
        console.error('Error transforming affiliate URL:', error);
        setAffiliateUrl(originalUrl);
      }
    };

    transformUrl();
  }, [originalUrl, supabase]);

  return affiliateUrl;
}