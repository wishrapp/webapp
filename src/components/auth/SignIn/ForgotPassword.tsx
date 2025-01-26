import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Gift } from 'lucide-react';

interface ForgotPasswordProps {
  onClose: () => void;
}

export default function ForgotPassword({ onClose }: ForgotPasswordProps) {
  const supabase = useSupabaseClient();
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6 sm:p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
              <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                wishr
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check your email for password reset instructions.
              </p>
              <button
                onClick={onClose}
                className="mt-4 text-[#9333ea] hover:text-[#7e22ce]"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              wishr
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Reset Password
          </h2>
          <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <input
                id="reset-email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] dark:bg-gray-700 dark:border-gray-600 text-base sm:text-lg"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="text-[#9333ea] hover:text-[#7e22ce] text-base sm:text-lg"
              >
                Back to Sign In
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#9333ea] text-white px-6 py-3 rounded-lg hover:bg-[#7e22ce] disabled:opacity-50 text-base sm:text-lg"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}