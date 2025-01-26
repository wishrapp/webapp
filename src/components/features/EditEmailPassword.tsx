import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';

interface EditEmailPasswordProps {
  onClose: () => void;
  currentEmail: string;
}

export default function EditEmailPassword({ onClose, currentEmail }: EditEmailPasswordProps) {
  const supabase = useSupabaseClient<Database>();
  const [email, setEmail] = useState(currentEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validate inputs
      if (password && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (password && password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // If changing email, require current password
      if (email !== currentEmail && !currentPassword) {
        throw new Error('Please enter your current password to change email');
      }

      // First verify current password if changing email
      if (email !== currentEmail) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: currentEmail,
          password: currentPassword
        });

        if (signInError) {
          throw new Error('Current password is incorrect');
        }
      }

      // Update password if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: password
        });

        if (passwordError) throw passwordError;
        setSuccess('Password updated successfully.');
      }

      // Update email if changed
      if (email !== currentEmail) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email
        });

        if (emailError) throw emailError;
        setSuccess(prev => 
          prev 
            ? `${prev} A verification email has been sent to ${email}. Please check your new email inbox to confirm the change.`
            : `A verification email has been sent to ${email}. Please check your new email inbox to confirm the change.`
        );
      }

      // If neither email nor password was changed
      if (!password && email === currentEmail) {
        setError('No changes were made');
        return;
      }

      // Clear sensitive fields after successful update
      setPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err) {
      console.error('Error updating credentials:', err);
      setError(err instanceof Error ? err.message : 'Failed to update credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Update Email & Password
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {email !== currentEmail && (
                <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                  You'll need to verify your new email address before the change takes effect
                </p>
              )}
            </div>

            {email !== currentEmail && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required={email !== currentEmail}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Required to change email address
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password (optional)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Leave blank to keep current password"
              />
            </div>

            {password && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-3 rounded-md">
                {success}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}