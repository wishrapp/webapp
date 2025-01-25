import { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import UserList from './UserList';
import UserDetailsModal from './UserDetailsModal';
import SearchBar from './SearchBar';
import LoadingIndicator from '../../shared/LoadingIndicator';
import { useUserManagement } from '../../../hooks/useUserManagement';
import type { Database } from '../../../lib/supabase-types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export type SortField = 'username' | 'last_name' | 'created_at' | 'verified' | 'suspended';
export type SortDirection = 'asc' | 'desc';

export default function AdminUsers() {
  const session = useSession();
  const navigate = useNavigate();
  const { users, loading, itemCounts, pendingRequestCounts, fetchUsers } = useUserManagement();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  useEffect(() => {
    if (!session) {
      navigate('/signin');
      return;
    }
    fetchUsers(sortField, sortDirection);
  }, [sortField, sortDirection, fetchUsers, session, navigate]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(current => current === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    `${user.last_name}, ${user.first_name}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <LoadingIndicator message="Loading users..." />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <UserList
        users={filteredUsers}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onSelectUser={setSelectedUser}
      />

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