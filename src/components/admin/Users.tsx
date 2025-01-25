import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { ChevronUp, ChevronDown, User } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];

type SortField = 'username' | 'last_name' | 'created_at' | 'verified' | 'suspended';
type SortDirection = 'asc' | 'desc';

interface UserDetailsModalProps {
  user: Profile;
  onClose: () => void;
  itemCount: number;
  pendingRequestsCount: number;
}

function UserDetailsModal({ user, onClose, itemCount, pendingRequestsCount }: UserDetailsModalProps) {
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

export default function AdminUsers() {
  const supabase = useSupabaseClient<Database>();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});
  const [pendingRequestCounts, setPendingRequestCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchUsers();
  }, [sortField, sortDirection]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      setUsers(data);

      // Fetch item counts for each user
      const itemCountsPromises = data.map(async (user) => {
        const { count } = await supabase
          .from('items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        return [user.id, count || 0];
      });

      // Fetch pending request counts for each user
      const requestCountsPromises = data.map(async (user) => {
        const { count } = await supabase
          .from('access_requests')
          .select('*', { count: 'exact', head: true })
          .eq('target_id', user.id)
          .eq('status', 'pending');
        return [user.id, count || 0];
      });

      const itemCountsResults = await Promise.all(itemCountsPromises);
      const requestCountsResults = await Promise.all(requestCountsPromises);

      setItemCounts(Object.fromEntries(itemCountsResults));
      setPendingRequestCounts(Object.fromEntries(requestCountsResults));
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSuspend = async (userId: string, suspended: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ suspended })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user =>
        user.id === userId ? { ...user, suspended } : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleVerify = async (userId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ verified })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user =>
        user.id === userId ? { ...user, verified } : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.last_name}, ${user.first_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('username')}
                  className="flex items-center space-x-1"
                >
                  <span>Username</span>
                  <SortIcon field="username" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('last_name')}
                  className="flex items-center space-x-1"
                >
                  <span>Name</span>
                  <SortIcon field="last_name" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center space-x-1"
                >
                  <span>Joined</span>
                  <SortIcon field="created_at" />
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredUsers.map(user => (
              <tr 
                key={user.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedUser(user)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt=""
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {user.last_name}, {user.first_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.verified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {user.verified ? 'Verified' : 'Unverified'}
                    </span>
                    {user.suspended && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        Suspended
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerify(user.id, !user.verified);
                    }}
                    className={`${
                      user.verified ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {user.verified ? 'Unverify' : 'Verify'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuspend(user.id, !user.suspended);
                    }}
                    className={`${
                      user.suspended ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'
                    }`}
                  >
                    {user.suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(user.id);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          itemCount={itemCounts[selectedUser.id] || 0}
          pendingRequestsCount={pendingRequestCounts[selectedUser.id] || 0}
        />
      )}
    </div>
  );
}