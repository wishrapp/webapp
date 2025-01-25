import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

type SignUpForm = z.infer<typeof signUpSchema>;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const getRedirectUrl = () => {
  // Use environment variable if available, fallback to current origin
  return import.meta.env.VITE_SITE_URL 
    ? `${import.meta.env.VITE_SITE_URL}/verify`
    : `${window.location.origin}/verify`;
};

export default function SignUp() {
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> => {
    try {
      return await operation();
    } catch (err) {
      if (retries > 0 && (err instanceof Error) && err.message.includes('Failed to fetch')) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryOperation(operation, retries - 1);
      }
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = signUpSchema.parse(formData);

      // Check if email already exists with retry
      const checkExistingUser = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', validatedData.email)
          .maybeSingle();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      };

      const existingUser = await retryOperation(checkExistingUser);

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Sign up with Supabase Auth with retry
      const signUp = async () => {
        const { data, error } = await supabase.auth.signUp({
          email: validatedData.email,
          password: validatedData.password,
          options: {
            emailRedirectTo: getRedirectUrl(),
            data: {
              email: validatedData.email
            }
          }
        });

        if (error) throw error;
        return data;
      };

      const authData = await retryOperation(signUp);

      if (!authData.user) {
        throw new Error('Failed to create account');
      }

      // Show success message
      setIsSuccess(true);
      
      // Clear form
      setFormData({ email: '', password: '' });

      // Redirect to sign in page after 5 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 5000);

    } catch (err) {
      console.error('Signup error:', err);
      
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else if (err.message.includes('Database error')) {
          setError('An error occurred creating your account. Please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }

      // Ensure user is signed out if there was an error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null); // Clear error when user types
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Check your email
          </h2>
          <p className="text-gray-600 mb-4">
            We've sent a verification link to {formData.email}. Please click the link to verify your account.
          </p>
          <p className="text-gray-500 mb-4">
            After verifying your email, you'll be able to sign in and complete your profile.
          </p>
          <button
            onClick={() => navigate('/signin')}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Wishr to create and share your wishlists
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                Password must be at least 8 characters and include uppercase, lowercase, and numbers
              </p>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-md">
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
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/signin" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}