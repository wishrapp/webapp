import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { useNavigate, useParams } from 'react-router-dom';
import OtherUsersItemGrid from './OtherUsersItemGrid';
import LoadingIndicator from '../shared/LoadingIndicator';
import { usePurchase } from '../../hooks/usePurchase';

type Item = Database['public']['Tables']['items']['Row'];
type Occasion = Database['public']['Tables']['occasions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function WishlistViewer() {
  const { userId } = useParams();
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const { markItemAsPurchased, unmarkItemAsPurchased } = usePurchase();
  
  const [items, setItems] = useState<Item[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user.id || !userId) {
        navigate('/signin');
        return;
      }

      try {
        // Check access permission
        const { data: accessData, error: accessError } = await supabase
          .from('access_requests')
          .select('status')
          .eq('requester_id', session.user.id)
          .eq('target_id', userId)
          .single();

        // If no access request exists or it's not approved, deny access
        if (accessError || !accessData || accessData.status !== 'approved') {
          setError('You do not have permission to view this wishlist');
          setLoading(false);
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch items and occasions in parallel
        const [itemsResponse, occasionsResponse] = await Promise.all([
          supabase
            .from('items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false }),
          supabase
            .from('occasions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: true })
        ]);

        if (itemsResponse.error) throw itemsResponse.error;
        if (occasionsResponse.error) throw occasionsResponse.error;

        setItems(itemsResponse.data);
        setOccasions(occasionsResponse.data);
      } catch (error) {
        console.error('Error fetching wishlist data:', error);
        setError('Failed to load wishlist');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, supabase, userId, navigate]);

  const handlePurchaseItem = async (itemId: string) => {
    if (!session?.user.id) return;

    const success = await markItemAsPurchased(itemId, {
      purchaseType: 'mark-purchased',
      informOwner: true,
      revealIdentity: false,
      contribution: '',
      showEmail: false,
      showPhone: false
    });

    if (success) {
      // Update local state
      setItems(items.map(item =>
        item.id === itemId
          ? { ...item, purchased: true, purchased_by: session.user.id, purchased_at: new Date().toISOString() }
          : item
      ));
    }
  };

  const handleUnpurchaseItem = async (itemId: string) => {
    const success = await unmarkItemAsPurchased(itemId);
    
    if (success) {
      // Update local state
      setItems(items.map(item =>
        item.id === itemId
          ? { ...item, purchased: false, purchased_by: null, purchased_at: null }
          : item
      ));
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading wishlist..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {error}
            </h2>
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <LoadingIndicator message="User not found" />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 text-lg">
                  {profile.first_name[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.username}'s Wishlist
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {profile.first_name} {profile.last_name}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
          >
            Back to Dashboard
          </button>
        </div>

        <OtherUsersItemGrid
          items={items}
          occasions={occasions}
          username={profile.username}
          onPurchaseItem={handlePurchaseItem}
          onUnpurchaseItem={handleUnpurchaseItem}
        />
      </div>
    </div>
  );
}