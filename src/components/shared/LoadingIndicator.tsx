import { Loader2, AlertCircle } from 'lucide-react';

interface LoadingIndicatorProps {
  message: string;
  error?: string | null;
  onRetry?: () => void;
}

export default function LoadingIndicator({ message = 'Loading...', error, onRetry }: LoadingIndicatorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        {error ? (
          <>
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error}
            </h2>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-4 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Try Again
              </button>
            )}
          </>
        ) : (
          <>
            <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {message}
            </p>
          </>
        )}
      </div>
    </div>
  );
}