import { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../../hooks/useWishlist';
import LoadingIndicator from '../shared/LoadingIndicator';

export default function WishlistManager() {
  const session = useSession();
  const navigate = useNavigate();
  const { items, occasions, loading, error } = useWishlist();
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');

  useEffect(() => {
    if (!session) {
      navigate('/signin');
    }
  }, [session, navigate]);

  if (loading) {
    return <LoadingIndicator message="Loading wishlist..." />;
  }

  if (error) {
    return <LoadingIndicator message={error} error={error} />;
  }

  const filteredItems = selectedOccasion === 'all'
    ? items
    : items.filter(item => item.occasion_id === selectedOccasion);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Occasion Filter */}
        <div className="mb-6">
          <select
            value={selectedOccasion}
            onChange={(e) => setSelectedOccasion(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="all">All Occasions</option>
            {occasions.map(occasion => (
              <option key={occasion.id} value={occasion.id}>
                {occasion.name}
              </option>
            ))}
          </select>
        </div>

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No items found for this occasion.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                  {item.price && (
                    <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
                      ${item.price.toFixed(2)}
                    </p>
                  )}
                  {item.purchased && (
                    <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                      ✓ Purchased
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}