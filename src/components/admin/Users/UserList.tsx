import { ChevronUp, ChevronDown, User } from 'lucide-react';
import { Database } from '../../../lib/supabase-types';
import { useUserActions } from '../../../hooks/useUserActions';
import { SortField, SortDirection } from './index';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UserListProps {
  users: Profile[];
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectUser: (user: Profile) => void;
}

export default function UserList({
  users,
  sortField,
  sortDirection,
  onSort,
  onSelectUser
}: UserListProps) {
  const { handleVerify, handleSuspend, handleDelete } = useUserActions();

  const SortIcon = ({ field }: { field: SortField }) => {
    if (field !== sortField) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <button
                onClick={() => onSort('username')}
                className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>Username</span>
                <SortIcon field="username" />
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <button
                onClick={() => onSort('last_name')}
                className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>Name</span>
                <SortIcon field="last_name" />
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <button
                onClick={() => onSort('verified')}
                className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <span>Status</span>
                <SortIcon field="verified" />
              </button>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <button
                onClick={() => onSort('created_at')}
                className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-200"
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
          {users.map(user => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => onSelectUser(user)}
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
  );
}