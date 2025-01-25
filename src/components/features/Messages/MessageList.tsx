import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { format } from 'date-fns';
import { Trash2, CheckSquare, Square } from 'lucide-react';
import LoadingIndicator from '../../shared/LoadingIndicator';
import ConfirmDialog from '../../shared/ConfirmDialog';

type Message = Database['public']['Tables']['messages']['Row'];

export default function MessageList() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('recipient_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [session, supabase]);

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSelectMessage = (messageId: string) => {
    const newSelected = new Set(selectedMessages);
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId);
    } else {
      newSelected.add(messageId);
    }
    setSelectedMessages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedMessages.size === messages.length) {
      setSelectedMessages(new Set());
    } else {
      setSelectedMessages(new Set(messages.map(msg => msg.id)));
    }
  };

  const handleDeleteMessages = async () => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .in('id', Array.from(selectedMessages));

      if (error) throw error;

      setMessages(messages.filter(msg => !selectedMessages.has(msg.id)));
      setSelectedMessages(new Set());
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting messages:', error);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading messages..." />;
  }

  if (messages.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        No messages to display
      </div>
    );
  }

  return (
    <div>
      {/* Message Actions */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSelectAll}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          >
            {selectedMessages.size === messages.length ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            <span className="text-sm">Select All</span>
          </button>
          {selectedMessages.size > 0 && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
              <span>Delete Selected ({selectedMessages.size})</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-6 ${!message.read ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
          >
            <div className="flex items-start space-x-4">
              <button
                onClick={() => handleSelectMessage(message.id)}
                className="mt-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {selectedMessages.has(message.id) ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <div className="flex-1" onClick={() => !message.read && markAsRead(message.id)}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {message.subject}
                    </h3>
                    <p className="mt-1 text-gray-600 dark:text-gray-400">
                      {message.content}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                      {format(new Date(message.created_at), 'PPPp')}
                    </p>
                  </div>
                  {!message.read && (
                    <span className="flex-shrink-0 w-2.5 h-2.5 bg-indigo-600 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteMessages}
        title="Delete Messages"
        message={`Are you sure you want to delete ${selectedMessages.size} message${selectedMessages.size === 1 ? '' : 's'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}