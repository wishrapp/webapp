import { User, Star } from 'lucide-react';
import { Database } from '../../lib/supabase-types';
import LoadingIndicator from '../shared/LoadingIndicator';
import { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

type SearchResult = Pick<Database['public']['Tables']['profiles']['Row'], 
  'id' | 'username' | 'first_name' | 'last_name' | 'profile_image_url'
>;

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  searchQuery: string;
  onRequestAccess: (targetId: string, username: string) => Promise<void>;
}

export default function SearchResults({ 
  results, 
  loading, 
  searchQuery,
  onRequestAccess 
}: SearchResultsProps) {
  const navigate = useNavigate();
  const { 
    pendingRequests, 
    approvedRequests, 
    favorites,
    toggleFavorite 
  } = useSearch();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);

  const handleRequestClick = (user: { id: string; username: string }) => {
    setSelectedUser(user);
    setShowConfirmation(true);
  };

  const handleConfirmRequest = async () => {
    if (!selectedUser) return;
    await onRequestAccess(selectedUser.id, selectedUser.username);
    setShowConfirmation(false);
  };

  const handleViewWishlist = (userId: string) => {
    navigate(`/wishlists/${userId}`);
  };

  if (loading) {
    return <LoadingIndicator message="Searching users..." />;
  }

  if (results.length === 0 && searchQuery) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400">No users found</p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {results.map(user => (
          <div 
            key={user.id} 
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {user.username}
                  </p>
                  <button
                    onClick={() => toggleFavorite(user.id, user.username)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                    title={favorites.has(user.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        favorites.has(user.id)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
            {approvedRequests.has(user.id) ? (
              <button
                onClick={() => handleViewWishlist(user.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                View Wishlist
              </button>
            ) : (
              <button
                onClick={() => handleRequestClick(user)}
                disabled={pendingRequests.has(user.id)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pendingRequests.has(user.id) ? 'Request Pending' : 'Request Access'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Request Access
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to request access to {selectedUser.username}'s wishlist?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRequest}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}