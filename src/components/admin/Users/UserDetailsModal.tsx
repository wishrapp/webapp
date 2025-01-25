import { User } from 'lucide-react';
import { Database } from '../../../lib/supabase-types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserDetailsModalProps {
  user: Profile;
  onClose: () => void;
  itemCount: number;
  pendingRequestsCount: number;
}

export default function UserDetailsModal({
  user,
  onClose,
  itemCount,
  pendingRequestsCount
}: UserDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {user.profile_image_url ? (
                <img
                  src={user.profile_image_url}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user.username}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {user.last_name}, {user.first_name}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Contact Information</h4>
                <p className="text-gray-600 dark:text-gray-400">Email: {user.email}</p>
                <p className="text-gray-600 dark:text-gray-400">Phone: {user.telephone}</p>
                <p className="text-gray-600 dark:text-gray-400">Country: {user.country}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300">Account Status</h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Verified: {user.verified ? 'Yes' : 'No'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Suspended: {user.suspended ? 'Yes' : 'No'}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  Premium: {user.premium_member ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Activity</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Wishlist Items: {itemCount}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Pending Requests: {pendingRequestsCount}
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 dark:text-gray-300">Preferences</h4>
              <p className="text-gray-600 dark:text-gray-400">
                Email Notifications: {user.email_notifications ? 'Enabled' : 'Disabled'}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Terms Accepted: {user.terms_accepted ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}