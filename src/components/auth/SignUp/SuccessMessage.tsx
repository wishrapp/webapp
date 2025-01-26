import { Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SuccessMessageProps {
  email: string;
}

export default function SuccessMessage({ email }: SuccessMessageProps) {
  const navigate = useNavigate();

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
            We've sent a verification link to {email}. Please click the link to verify your account.
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