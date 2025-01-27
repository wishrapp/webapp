import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { 
  LayoutDashboard, 
  Users, 
  Mail,
  MessageSquare,
  Store, 
  LogOut,
  Gift
} from 'lucide-react';

export default function AdminLayout() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!session?.user.id) {
        navigate('/signin');
        return;
      }

      try {
        const { data: isAdmin, error } = await supabase.rpc('is_admin');
        
        if (error || !isAdmin) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        navigate('/');
      }
    };

    checkAdminAccess();
  }, [session, supabase, navigate]);

  const handleExitAdmin = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!session) {
    return null;
  }

  const isActivePath = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex items-center space-x-3">
                  <Gift className="w-8 h-8 text-[#9333ea]" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    wishr
                  </span>
                  <span className="text-gray-400 dark:text-gray-500 px-3">|</span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Admin Panel
                  </span>
                </div>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/admin"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                    ${isActivePath('/admin') && location.pathname === '/admin'
                      ? 'border-[#9333ea] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </a>
                <a
                  href="/admin/users"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                    ${isActivePath('/admin/users')
                      ? 'border-[#9333ea] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </a>
                <a
                  href="/admin/messages"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                    ${isActivePath('/admin/messages')
                      ? 'border-[#9333ea] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </a>
                <a
                  href="/admin/emails"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                    ${isActivePath('/admin/emails')
                      ? 'border-[#9333ea] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Emails
                </a>
                <a
                  href="/admin/affiliates"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors
                    ${isActivePath('/admin/affiliates')
                      ? 'border-[#9333ea] text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                >
                  <Store className="w-4 h-4 mr-2" />
                  Affiliates
                </a>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleExitAdmin}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Exit Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}