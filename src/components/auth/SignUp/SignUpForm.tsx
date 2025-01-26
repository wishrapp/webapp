import { Gift } from 'lucide-react';

interface SignUpFormProps {
  email: string;
  password: string;
  emailNotifications: boolean;
  termsAccepted: boolean;
  error: string | null;
  isLoading: boolean;
  onChange: (field: string, value: string | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SignUpForm({
  email,
  password,
  emailNotifications,
  termsAccepted,
  error,
  isLoading,
  onChange,
  onSubmit
}: SignUpFormProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="p-6 sm:p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  wishr
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
                Create your account
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Join Wishr to create and share your wishlists
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => onChange('email', e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] dark:bg-gray-700 dark:border-gray-600 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => onChange('password', e.target.value)}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] dark:bg-gray-700 dark:border-gray-600 text-base"
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Must be at least 8 characters and include uppercase, lowercase, and numbers
                  </p>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={e => onChange('emailNotifications', e.target.checked)}
                      className="rounded-lg border-gray-300 text-[#9333ea] shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] w-5 h-5"
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      I agree to receive email notifications from Wishr
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={e => onChange('termsAccepted', e.target.checked)}
                      className="rounded-lg border-gray-300 text-[#9333ea] shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] w-5 h-5"
                    />
                    <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                      I agree to the{' '}
                      <a href="/terms" className="text-[#9333ea] hover:text-[#7e22ce]">
                        Terms and Conditions
                      </a>
                    </span>
                  </label>
                </div>

                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 p-4 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !termsAccepted}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-colors
                    ${termsAccepted 
                      ? 'bg-[#9333ea] hover:bg-[#7e22ce] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9333ea]' 
                      : 'bg-purple-200 cursor-not-allowed'
                    } disabled:opacity-50`}
                >
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </button>
              </div>
            </form>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <a href="/signin" className="font-medium text-[#9333ea] hover:text-[#7e22ce]">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}