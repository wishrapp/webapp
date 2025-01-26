import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database } from '../../lib/supabase-types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileCompletionProps {
  profile: Profile;
}

export default function ProfileCompletion({ profile }: ProfileCompletionProps) {
  const navigate = useNavigate();
  const [showReminder, setShowReminder] = useState(false);

  // Calculate completion percentage
  const requiredFields = [
    'first_name',
    'last_name',
    'username',
    'date_of_birth',
    'country'
  ];

  const completedFields = requiredFields.filter(field => {
    const value = profile[field as keyof Profile];
    return value !== null && value !== undefined && value !== '';
  });

  const completionPercentage = Math.round((completedFields.length / requiredFields.length) * 100);

  // Format missing fields for display
  const missingFields = requiredFields
    .filter(field => {
      const value = profile[field as keyof Profile];
      return !value;
    })
    .map(field => field.replace(/_/g, ' '))
    .map(field => field.charAt(0).toUpperCase() + field.slice(1));

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Profile Completion</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completionPercentage}% Complete
        </span>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
        <div
          className="bg-indigo-600 h-2.5 rounded-full"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {missingFields.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Missing information:
          </p>
          <ul className="mt-2 space-y-1">
            {missingFields.map(field => (
              <li key={field} className="text-sm text-gray-500 dark:text-gray-400">
                • {field}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate('/profile/edit')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Complete Profile
          </button>
        </div>
      )}
    </div>
  );
}