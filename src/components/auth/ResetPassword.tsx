import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Gift } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ResetPasswordForm>({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have a valid session with access token
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('Invalid or expired reset link. Please request a new password reset.');
        return;
      }
    };

    checkSession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = resetPasswordSchema.parse(formData);

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: validatedData.password
      });

      if (updateError) throw updateError;

      // Show success message
      setSuccess(true);

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);

    } catch (err) {
      console.error('Error resetting password:', err);
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
              <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                wishr
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-4">
              Password Reset Successful
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center">
              Your password has been reset successfully. You will be redirected to the sign in page shortly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              wishr
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white text-center mb-4">
            Reset Your Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] dark:bg-gray-700 dark:border-gray-600 text-base"
              />
              <p className="mt-1 text-xs sm:text-sm text-gray-500">
                Must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] dark:bg-gray-700 dark:border-gray-600 text-base"
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base sm:text-lg font-medium text-white bg-[#9333ea] hover:bg-[#7e22ce] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9333ea] disabled:opacity-50"
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}