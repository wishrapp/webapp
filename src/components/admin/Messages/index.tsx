import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { useSearch } from '../../../hooks/useSearch';
import { User } from 'lucide-react';

type SearchResult = {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string | null;
  email: string;
};

export default function AdminMessages() {
  const supabase = useSupabaseClient<Database>();
  const { searchUsers, searchResults } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchUsers(query);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !message.trim() || !subject.trim()) return;

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: '00000000-0000-0000-0000-000000000000', // System user UUID
          recipient_id: selectedUser.id,
          subject: subject.trim(),
          content: message.trim(),
          read: false
        });

      if (messageError) throw messageError;

      // Clear form
      setMessage('');
      setSubject('');
      setSelectedUser(null);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Send Message to User</h2>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md">
          Message sent successfully!
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md">
          {error}
        </div>
      )}

      {/* User Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Search User
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
        />

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && !selectedUser && (
          <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {user.profile_image_url ? (
                  <img
                    src={user.profile_image_url}
                    alt={user.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="text-left">
                  <div className="font-medium">{user.username}</div>
                  {user.first_name && user.last_name && (
                    <div className="text-sm text-gray-500">
                      {user.first_name} {user.last_name}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected User */}
      {selectedUser && (
        <div className="mb-6 flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
          <div className="flex items-center space-x-3">
            {selectedUser.profile_image_url ? (
              <img
                src={selectedUser.profile_image_url}
                alt={selectedUser.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div>
              <div className="font-medium">{selectedUser.username}</div>
              {selectedUser.first_name && selectedUser.last_name && (
                <div className="text-sm text-gray-500">
                  {selectedUser.first_name} {selectedUser.last_name}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedUser(null)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Change User
          </button>
        </div>
      )}

      {/* Message Form */}
      {selectedUser && (
        <form onSubmit={handleSendMessage} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}