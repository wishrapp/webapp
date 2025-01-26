import { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { z } from 'zod';
import { countries } from '../../lib/countries';
import { isValidPhoneNumber } from 'libphonenumber-js';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  dateOfBirth: z.string().refine(val => {
    const date = new Date(val);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 13, now.getMonth(), now.getDate());
    return date <= minAge;
  }, 'You must be at least 13 years old'),
  country: z.string().min(1, 'Country is required'),
  telephone: z.string().refine(
    (val) => isValidPhoneNumber(val),
    'Invalid phone number'
  ),
  emailNotifications: z.boolean(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
});

type ProfileForm = z.infer<typeof profileSchema>;

interface ProfileCompletionModalProps {
  onComplete: () => void;
}

export default function ProfileCompletionModal({ onComplete }: ProfileCompletionModalProps) {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const [formData, setFormData] = useState<ProfileForm>({
    firstName: '',
    lastName: '',
    username: '',
    dateOfBirth: '',
    country: '',
    telephone: '',
    emailNotifications: true,
    termsAccepted: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const validatedData = profileSchema.parse(formData);

      // Check if username is available
      const { data: existingUser, error: usernameError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', validatedData.username)
        .single();

      if (usernameError && usernameError.code !== 'PGRST116') {
        throw usernameError;
      }

      if (existingUser) {
        throw new Error('Username is already taken');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          username: validatedData.username,
          email: session.user.email!,
          date_of_birth: validatedData.dateOfBirth,
          country: validatedData.country,
          telephone: validatedData.telephone,
          email_notifications: validatedData.emailNotifications,
          terms_accepted: validatedData.termsAccepted,
          verified: true
        });

      if (profileError) {
        throw profileError;
      }

      onComplete();
    } catch (err) {
      console.error('Error creating profile:', err);
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create profile');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Please complete your profile information to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                required
              />
            </div>

            {/* Add other form fields similarly */}
            {/* ... */}

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}