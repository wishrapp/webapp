import { useState } from 'react';
import { useSearch } from '../../hooks/useSearch';
import SearchResults from './SearchResults';
import { ChevronDown, Star } from 'lucide-react';
import LoadingIndicator from '../shared/LoadingIndicator';

interface SearchModalProps {
  onClose: () => void;
  onRequestSent: () => void;
}

export default function SearchModal({ onClose, onRequestSent }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const { searchResults, searchUsers, sendAccessRequest, favorites } = useSearch();

  const handleSearch = async (query: string) => {
    setLoading(true);
    setSearchQuery(query);
    await searchUsers(query);
    setLoading(false);
  };

  const handleAccessRequest = async (targetId: string, username: string) => {
    const result = await sendAccessRequest(targetId, username);
    if (result.success) {
      alert('Access has been requested. You will be notified when the owner of the list approves or rejects your request.');
      onRequestSent();
      onClose();
    } else {
      alert(result.message);
    }
  };

  // Get favorite usernames from the database
  const favoriteUsernames = Array.from(favorites.values());

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Users</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="mb-6 space-y-4">
            {/* Favorites Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFavorites(!showFavorites)}
                className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-left"
              >
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Your Favorites {favoriteUsernames.length > 0 && `(${favoriteUsernames.length})`}
                  </span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showFavorites ? 'transform rotate-180' : ''}`} />
              </button>

              {showFavorites && favoriteUsernames.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
                  <div className="py-1">
                    {favoriteUsernames.map(username => (
                      <button
                        key={username}
                        onClick={() => {
                          handleSearch(username);
                          setShowFavorites(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        {username}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by username..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {loading ? (
            <LoadingIndicator message="Searching..." />
          ) : (
            <SearchResults
              results={searchResults}
              loading={loading}
              onRequestAccess={handleAccessRequest}
              searchQuery={searchQuery}
            />
          )}
        </div>
      </div>
    </div>
  );
}