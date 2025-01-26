import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import LoadingIndicator from '../shared/LoadingIndicator';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('Invalid verification link');
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        // If no session, try to exchange the code
        if (!session) {
          const { error: verifyError } = await supabase.auth.exchangeCodeForSession(code);
          if (verifyError) throw verifyError;
        }

        // Get the session again after verification
        const { data: { session: newSession }, error: newSessionError } = await supabase.auth.getSession();
        if (newSessionError) throw newSessionError;

        if (!newSession?.user) {
          throw new Error('Verification successful but session not found');
        }

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', newSession.user.id)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Redirect based on profile existence
        setTimeout(() => {
          if (!profile) {
            navigate('/complete-profile');
          } else {
            navigate('/dashboard');
          }
        }, 2000);

      } catch (error) {
        console.error('Verification error:', error);
        if (error instanceof Error) {
          if (error.message.includes('JWT expired')) {
            setError('Verification link has expired. Please request a new one.');
          } else if (error.message.includes('Invalid token')) {
            setError('Invalid verification link. Please try signing up again.');
          } else {
            setError(error.message);
          }
        } else {
          setError('Failed to verify email');
        }
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmailToken();
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