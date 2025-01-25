import { WifiOff } from 'lucide-react';

interface ConnectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function ConnectionError({ 
  message = 'Connection lost. Please check your internet connection.',
  onRetry 
}: ConnectionErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <WifiOff className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {message}
        </h2>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
}