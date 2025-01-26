import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { countries } from '../../lib/countries';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  emailNotifications: z.boolean(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
});

type SignUpForm = z.infer<typeof signUpSchema>;

const getRedirectUrl = () => {
  return import.meta.env.VITE_SITE_URL 
    ? `${import.meta.env.VITE_SITE_URL}/verify`
    : `${window.location.origin}/verify`;
};

export default function SignUp() {
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    country: '',
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

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            username: validatedData.username,
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            date_of_birth: validatedData.dateOfBirth,
            country: validatedData.country,
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
        username: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        country: '',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Check your email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We've sent a verification link to {formData.email}. Please click the link to verify your account.
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            After verifying your email, you'll be able to sign in.
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Join Wishr to create and share your wishlists
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Only letters, numbers, underscores, and hyphens allowed
              </p>
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.emailNotifications}
                  onChange={e => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to receive email notifications from Wishr
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  required
                  checked={formData.termsAccepted}
                  onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <a href="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Terms and Conditions
                  </a>
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}