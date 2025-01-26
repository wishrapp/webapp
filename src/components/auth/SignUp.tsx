import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Gift } from 'lucide-react';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  emailNotifications: z.boolean(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
});

type SignUpForm = z.infer<typeof signUpSchema>;

const getRedirectUrl = () => {
  return import.meta.env.VITE_SITE_URL 
    ? `${import.meta.env.VITE_SITE_URL}/verify`
    : `${window.location.origin}/verify`;
};

const generateDefaultUsername = (email: string): string => {
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${baseUsername}${randomNum}`;
};

export default function SignUp() {
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    emailNotifications: true,
    termsAccepted: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = signUpSchema.parse(formData);

      // Generate default username from email
      const defaultUsername = generateDefaultUsername(validatedData.email);

      // Get default country using geolocation API
      let defaultCountry = 'GB'; // Default to UK
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch country');
        const data = await response.json();
        if (data.country) {
          defaultCountry = data.country;
        }
      } catch (error) {
        console.error('Error fetching country:', error);
      }

      // Set default date of birth to January 1, 2000
      const defaultDateOfBirth = '2000-01-01';

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            username: defaultUsername,
            first_name: '',
            last_name: '',
            date_of_birth: defaultDateOfBirth,
            country: defaultCountry,
            email_notifications: validatedData.emailNotifications,
            terms_accepted: validatedData.termsAccepted
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Show success message
      setIsSuccess(true);
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        emailNotifications: true,
        termsAccepted: false
      });

      // Redirect to sign in page after 5 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 5000);

    } catch (err) {
      console.error('Error signing up:', err);
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        if (err.message.includes('User already registered')) {
          setError('An account with this email already exists');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }

      // Sign out if there was an error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
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
              Check your email
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 text-center mb-6">
              We've sent a verification link to {formData.email}. Please click the link to verify your account.
            </p>
            <button
              onClick={() => navigate('/signin')}
              className="w-full text-[#9333ea] hover:text-[#7e22ce] font-medium text-base sm:text-lg"
            >
              Go to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
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
                      checked={formData.emailNotifications}
                      onChange={e => setFormData({ ...formData, emailNotifications: e.target.checked })}
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
                      checked={formData.termsAccepted}
                      onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
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
                  disabled={isLoading || !formData.termsAccepted}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white transition-colors
                    ${formData.termsAccepted 
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