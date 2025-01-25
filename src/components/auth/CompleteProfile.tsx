import { useState } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
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

export default function CompleteProfile() {
  const session = useSession();
  const navigate = useNavigate();
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id) {
      navigate('/signin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
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

      // Get user's email from session
      const userEmail = session.user.email;
      if (!userEmail) {
        throw new Error('User email not found');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: session.user.id,
          first_name: validatedData.firstName,
          last_name: validatedData.lastName,
          username: validatedData.username,
          email: userEmail,
          date_of_birth: validatedData.dateOfBirth,
          country: validatedData.country,
          telephone: validatedData.telephone,
          email_notifications: validatedData.emailNotifications,
          terms_accepted: validatedData.termsAccepted,
          verified: true // User is already verified at this point
        });

      if (profileError) {
        if (profileError.code === '23505') { // Unique constraint violation
          throw new Error('Username is already taken');
        }
        throw profileError;
      }

      // Check if user is admin
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      if (adminError) throw adminError;

      // Redirect to appropriate dashboard
      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Error creating profile:', err);
      if (err instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof ProfileForm, string>> = {};
        err.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof ProfileForm] = err.message;
          }
        });
        setError(Object.values(fieldErrors)[0] || 'Invalid form data');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to create profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Tell us a bit more about yourself
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Only letters, numbers, underscores, and hyphens allowed
              </p>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country
              </label>
              <select
                id="country"
                name="country"
                required
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Select a country</option>
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                id="telephone"
                name="telephone"
                type="tel"
                required
                value={formData.telephone}
                onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="+1234567890"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Include country code (e.g., +1 for US)
              </p>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={e => setFormData({ ...formData, emailNotifications: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to receive email notifications from Wishr
                </span>
              </label>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  required
                  checked={formData.termsAccepted}
                  onChange={e => setFormData({ ...formData, termsAccepted: e.target.checked })}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <a href="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Terms and Conditions
                  </a>
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Profile...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}