import { useState, useEffect } from 'react';
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
import ProfileCompletion from './ProfileCompletion';
import { Database } from '../../lib/supabase-types';
import LoadingIndicator from '../shared/LoadingIndicator';
import { useContext } from 'react';

type Item = Database['public']['Tables']['items']['Row'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme, setTheme } = useContext(ThemeContext);
  const { profile, unreadMessages, loading: profileLoading, error: profileError } = useProfile();
  const { items, occasions, loading: wishlistLoading, addItem, updateItem, deleteItem } = useWishlist();

  // State for modals
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // State for item display options
  const [showPurchased, setShowPurchased] = useState(true);
  const [sortBy, setSortBy] = useState<string>('newest');

  useEffect(() => {
    // Show profile completion modal if profile is incomplete
    if (profile && (!profile.username || !profile.first_name || !profile.last_name)) {
      setShowProfileCompletion(true);
    }
  }, [profile]);

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setShowEditItemModal(true);
  };

  if (profileLoading || wishlistLoading) {
    return <LoadingIndicator message="Loading..." />;
  }

  if (profileError) {
    return <LoadingIndicator message="Error loading profile" error={profileError} />;
  }

  if (!profile) {
    return <LoadingIndicator message="Profile not found" />;
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
        {showProfileCompletion && (
          <ProfileCompletion
            onComplete={() => setShowProfileCompletion(false)}
            onClose={() => setShowProfileCompletion(false)}
          />
        )}
      </div>
    </div>
  );
}