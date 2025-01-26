import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../../lib/theme';
import { useProfile } from '../../hooks/useProfile';
import { useWishlist } from '../../hooks/useWishlist';
import MenuBar from './MenuBar';
import QuickLinks from './QuickLinks';
import ItemGrid from './ItemGrid';
import AddItemForm from './AddItemForm';
import EditItemForm from './EditItemForm';
import ContactForm from '../shared/ContactForm';
import ShareWishlist from '../shared/ShareWishlist';
import SearchModal from '../search/SearchModal';
import { Database } from '../../lib/supabase-types';
import LoadingIndicator from '../shared/LoadingIndicator';
import ConnectionError from '../shared/ConnectionError';

type Item = Database['public']['Tables']['items']['Row'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  const { profile, unreadMessages, loading: profileLoading, error: profileError, isConnectionError: profileConnectionError, retry: retryProfile } = useProfile();
  const { items, occasions, loading: wishlistLoading, error: wishlistError, isConnectionError: wishlistConnectionError, retry: retryWishlist, addItem, updateItem, deleteItem } = useWishlist();

  // State for modals
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // State for item display options
  const [showPurchased, setShowPurchased] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  if (profileConnectionError || wishlistConnectionError) {
    return (
      <ConnectionError 
        message="Unable to connect to the server. Please check your internet connection."
        onRetry={() => {
          retryProfile();
          retryWishlist();
        }}
      />
    );
  }

  if (profileLoading || wishlistLoading) {
    return <LoadingIndicator message="Loading..." />;
  }

  if (profileError || wishlistError) {
    const errorMessage = profileError || wishlistError || 'An error occurred';
    return <LoadingIndicator message="Error" error={errorMessage} />;
  }

  if (!profile) {
    return <LoadingIndicator message="Error" error="Profile not found" />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            {profile.profile_image_url ? (
              <img
                src={profile.profile_image_url}
                alt={profile.username}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg">
                  {profile.first_name?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">Welcome{profile.first_name ? `, ${profile.first_name}` : ''}!</h1>
              {profile.username && (
                <p className="text-gray-600 dark:text-gray-400">
                  {profile.username}
                </p>
              )}
            </div>
          </div>

          <MenuBar
            theme={theme}
            toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            unreadMessages={unreadMessages}
            onContactClick={() => setShowContactForm(true)}
            onShareClick={() => setShowShareModal(true)}
            onSearchClick={() => setShowSearchModal(true)}
            onSignOut={() => navigate('/signin')}
          />
        </div>

        {/* Quick Links */}
        <QuickLinks onAddItem={() => setShowAddItemModal(true)} />

        {/* Items Grid */}
        <ItemGrid
          items={items}
          occasions={occasions}
          showPurchased={showPurchased}
          sortBy={sortBy}
          onEditItem={handleEditItem}
          onDeleteItem={deleteItem}
          onShowPurchasedChange={setShowPurchased}
          onSortChange={setSortBy}
        />

        {/* Modals */}
        {showAddItemModal && (
          <AddItemForm
            occasions={occasions}
            onSubmit={addItem}
            onClose={() => setShowAddItemModal(false)}
          />
        )}
        {showEditItemModal && editingItem && (
          <EditItemForm
            item={editingItem}
            occasions={occasions}
            onSubmit={updateItem}
            onClose={() => {
              setShowEditItemModal(false);
              setEditingItem(null);
            }}
          />
        )}
        {showContactForm && (
          <ContactForm onClose={() => setShowContactForm(false)} />
        )}
        {showShareModal && (
          <ShareWishlist onClose={() => setShowShareModal(false)} />
        )}
        {showSearchModal && (
          <SearchModal
            onClose={() => setShowSearchModal(false)}
            onRequestSent={() => setShowSearchModal(false)}
          />
        )}
      </div>
    </div>
  );
}