import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import LoadingIndicator from '../shared/LoadingIndicator';
import { Gift } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the code from URL
        const code = searchParams.get('code');
        const next = searchParams.get('next') || '/dashboard';

        if (!code) {
          throw new Error('No verification code found');
        }

        // Exchange the code for a session
        const { error: verifyError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (verifyError) {
          if (verifyError.message.includes('code challenge')) {
            throw new Error('Invalid verification link. Please request a new one.');
          }
          throw verifyError;
        }

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          throw new Error('No session found after verification');
        }

        // Redirect after a short delay
        setTimeout(() => {
          navigate(next);
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

    verifyEmail();
  }, [searchParams, supabase, navigate]);

  if (isVerifying) {
    return <LoadingIndicator message="Verifying your email..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="w-full max-w-md mx-auto p-6 sm:p-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
              <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                wishr
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
              Verification Failed
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-lg text-white bg-[#9333ea] hover:bg-[#7e22ce]"
            >
              Return to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-6 sm:p-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              wishr
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
            Email Verified!
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your email has been successfully verified. You will be redirected to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
}