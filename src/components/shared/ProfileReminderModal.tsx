import { useNavigate } from 'react-router-dom';

interface ProfileReminderModalProps {
  onClose: () => void;
}

export default function ProfileReminderModal({ onClose }: ProfileReminderModalProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Complete Your Profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Your profile is incomplete. Adding more information helps others find and connect with you.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => {
                onClose();
                navigate('/profile/edit');
              }}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Complete Profile Now
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-500"
            >
              Remind Me Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}