import { useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { 
  Sun, 
  Moon, 
  Share2, 
  UserCog, 
  Search, 
  LogOut,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

interface MenuBarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  unreadMessages: number;
  onContactClick: () => void;
  onShareClick: () => void;
  onSearchClick: () => void;
  onSignOut: () => void;
}

export default function MenuBar({
  theme,
  toggleTheme,
  unreadMessages,
  onContactClick,
  onShareClick,
  onSearchClick,
  onSignOut
}: MenuBarProps) {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center bg-purple-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
      {/* Edit Profile Button - Now separated and on the left */}
      <button
        onClick={() => navigate('/profile/edit')}
        className="p-2 hover:bg-purple-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        aria-label="Edit profile"
      >
        <UserCog className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Divider */}
      <div className="mx-4 h-6 w-px bg-purple-300 dark:bg-gray-700" />

      {/* Other Menu Items */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md bg-purple-100 dark:bg-gray-700 hover:bg-purple-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>

        <button
          onClick={onContactClick}
          className="p-2 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          aria-label="Contact us"
        >
          <HelpCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={onShareClick}
          className="p-2 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          aria-label="Share wishlist"
        >
          <Share2 className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <button
          onClick={() => navigate('/messages')}
          className="relative p-2 hover:bg-purple-100 dark:hover:bg-gray-700 rounded-md transition-colors"
          aria-label="Messages"
        >
          <MessageCircle className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </button>

        <button
          onClick={onSearchClick}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search Users</span>
        </button>

        <button
          onClick={handleSignOut}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </div>
  );
}