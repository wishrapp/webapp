import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { mapAuthError, mapProfileError } from '../../../lib/errors/supabase';
import SignInForm, { SignInFormData } from './SignInForm';
import ForgotPassword from './ForgotPassword';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function SignIn() {
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  const handleChange = (field: keyof SignInFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = signInSchema.parse(formData);

      // First check if a profile exists with this email
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, suspended')
        .eq('email', validatedData.email)
        .maybeSingle();

      if (profileError) {
        const mappedError = mapAuthError(profileError);
        setError(mappedError.message);
        return;
      }

      // If no profile exists, show invalid credentials
      if (!profileData) {
        setError('Invalid email or password. Please try again.');
        return;
      }

      // Check if user is suspended
      if (profileData.suspended) {
        const mappedError = mapProfileError('suspended');
        setError(mappedError.message);
        return;
      }

      // Now attempt sign in since we know the profile exists
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (signInError) {
        setError('Invalid email or password. Please try again.');
        return;
      }

      if (!authData?.user) {
        setError('Unable to sign in. Please try again.');
        return;
      }

      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      if (adminError) {
        const mappedError = mapAuthError(adminError);
        setError(mappedError.message);
        return;
      }

      // Redirect to appropriate dashboard
      navigate(isAdmin ? '/admin' : '/dashboard');

    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        const mappedError = mapAuthError(err as Error);
        setError(mappedError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onClose={() => setShowForgotPassword(false)} />;
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Welcome back to Wishr
          </p>
        </div>

        <SignInForm
          formData={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onForgotPassword={() => setShowForgotPassword(true)}
          error={error}
          isLoading={isLoading}
        />

        <div className="text-center mt-8">
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a href="/signup" className="font-medium text-[#9333ea] hover:text-[#7e22ce]">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}