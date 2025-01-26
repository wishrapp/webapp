import { useState } from 'react';
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
  MessageCircle,
  Menu,
  X
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      // First clear any stored session data
      localStorage.removeItem('sb-eawuqfqcrhwqdujwiorf-auth-token');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Finally call the onSignOut callback
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, try to navigate to sign in
      navigate('/signin', { replace: true });
    }
  };

  const menuItems = [
    {
      icon: UserCog,
      label: 'Edit Profile',
      onClick: () => navigate('/profile/edit'),
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      icon: theme === 'light' ? Moon : Sun,
      label: theme === 'light' ? 'Dark Mode' : 'Light Mode',
      onClick: toggleTheme,
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      icon: HelpCircle,
      label: 'Contact Us',
      onClick: onContactClick,
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      icon: Share2,
      label: 'Share Wishlist',
      onClick: onShareClick,
      className: 'text-gray-700 dark:text-gray-300'
    },
    {
      icon: MessageCircle,
      label: 'Messages',
      onClick: () => navigate('/messages'),
      className: 'text-gray-700 dark:text-gray-300',
      badge: unreadMessages > 0 ? unreadMessages : undefined
    },
    {
      icon: Search,
      label: 'Search Users',
      onClick: onSearchClick,
      className: 'text-white bg-[#9333ea] hover:bg-[#7e22ce]'
    },
    {
      icon: LogOut,
      label: 'Sign Out',
      onClick: handleSignOut,
      className: 'text-white bg-red-600 hover:bg-red-700'
    }
  ];

  return (
    <nav className="bg-purple-50 dark:bg-gray-800 px-4 py-2 rounded-lg">
      {/* Desktop Menu */}
      <div className="hidden md:flex items-center justify-between">
        <button
          onClick={() => navigate('/profile/edit')}
          className="p-2 hover:bg-purple-200 dark:hover:bg-gray-700 rounded-md transition-colors"
          aria-label="Edit profile"
        >
          <UserCog className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <div className="mx-4 h-6 w-px bg-purple-300 dark:bg-gray-700" />

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
            className="flex items-center space-x-2 bg-[#9333ea] text-white px-4 py-2 rounded-md hover:bg-[#7e22ce] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search Users</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/profile/edit')}
            className="p-2 hover:bg-purple-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Edit profile"
          >
            <UserCog className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-purple-200 dark:hover:bg-gray-700 rounded-md transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="absolute left-0 right-0 mt-2 mx-4 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 space-y-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${item.className}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}