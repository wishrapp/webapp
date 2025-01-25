import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import LoadingIndicator from '../shared/LoadingIndicator';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  const retryOperation = async <T,>(
    operation: () => Promise<T>,
    retries = MAX_RETRIES
  ): Promise<T> => {
    try {
      return await operation();
    } catch (err) {
      if (retries > 0 && err instanceof Error && err.message.includes('Failed to fetch')) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryOperation(operation, retries - 1);
      }
      throw err;
    }
  };

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        const email = searchParams.get('email');

        if (!token || !type || !email) {
          setError('Invalid verification link');
          setIsVerifying(false);
          return;
        }

        // Get the current session
        const getSession = async () => {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          return session;
        };

        const session = await retryOperation(getSession);

        if (!session) {
          // If no session, verify the token
          const verifyToken = async () => {
            const { error } = await supabase.auth.verifyOtp({
              token_hash: token,
              type: 'signup',
              email
            });
            if (error) throw error;
          };

          await retryOperation(verifyToken);
        }

        // Check if profile exists
        const checkProfile = async () => {
          const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .maybeSingle();

          if (error && error.code !== 'PGRST116') throw error;
          return data;
        };

        const profile = await retryOperation(checkProfile);

        // Redirect based on profile existence
        setTimeout(() => {
          if (!profile) {
            navigate('/complete-profile');
          } else {
            navigate('/dashboard');
          }
        }, 3000);

      } catch (error) {
        console.error('Verification error:', error);
        setError(error instanceof Error ? error.message : 'Failed to verify email');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, supabase, navigate]);

  if (isVerifying) {
    return <LoadingIndicator message="Verifying your email..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-4">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Verification Failed
            </h2>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Return to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-4">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verified!
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your email has been successfully verified. You will be redirected to complete your profile...
          </p>
        </div>
      </div>
    </div>
  );
}