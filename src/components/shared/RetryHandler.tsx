import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

interface RetryHandlerProps {
  error: Error;
  onRetry: () => void;
  children: React.ReactNode;
}

export default function RetryHandler({ error, onRetry, children }: RetryHandlerProps) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    if (error && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        onRetry();
      }, Math.min(1000 * Math.pow(2, retryCount), 5000)); // Exponential backoff with 5s max

      return () => clearTimeout(timer);
    }
  }, [error, retryCount, onRetry]);

  if (error) {
    if (retryCount >= maxRetries) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Operation Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error.message}
            </p>
            <button
              onClick={() => {
                setRetryCount(0);
                onRetry();
              }}
              className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Retrying... (Attempt {retryCount + 1} of {maxRetries})
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}