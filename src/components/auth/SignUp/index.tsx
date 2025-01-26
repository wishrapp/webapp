import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import SignUpForm from './SignUpForm';
import SuccessMessage from './SuccessMessage';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  emailNotifications: z.boolean(),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms')
});

type SignUpForm = z.infer<typeof signUpSchema>;

const getRedirectUrl = () => {
  return import.meta.env.VITE_SITE_URL 
    ? `${import.meta.env.VITE_SITE_URL}/verify`
    : `${window.location.origin}/verify`;
};

const generateDefaultUsername = (email: string): string => {
  const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${baseUsername}${randomNum}`;
};

export default function SignUp() {
  const navigate = useNavigate();
  const supabase = useSupabaseClient<Database>();
  const [formData, setFormData] = useState<SignUpForm>({
    email: '',
    password: '',
    emailNotifications: true,
    termsAccepted: false
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      const validatedData = signUpSchema.parse(formData);

      // Generate default username from email
      const defaultUsername = generateDefaultUsername(validatedData.email);

      // Get default country using geolocation API
      let defaultCountry = 'GB'; // Default to UK
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch country');
        const data = await response.json();
        if (data.country) {
          defaultCountry = data.country;
        }
      } catch (error) {
        console.error('Error fetching country:', error);
      }

      // Set default date of birth to January 1, 2000
      const defaultDateOfBirth = '2000-01-01';

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: getRedirectUrl(),
          data: {
            username: defaultUsername,
            first_name: '',
            last_name: '',
            date_of_birth: defaultDateOfBirth,
            country: defaultCountry,
            email_notifications: validatedData.emailNotifications,
            terms_accepted: validatedData.termsAccepted
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create account');

      // Show success message
      setIsSuccess(true);
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        emailNotifications: true,
        termsAccepted: false
      });

      // Redirect to sign in page after 5 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 5000);

    } catch (err) {
      console.error('Error signing up:', err);
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err instanceof Error) {
        if (err.message.includes('User already registered')) {
          setError('An account with this email already exists');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred');
      }

      // Sign out if there was an error
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        console.error('Error signing out:', signOutError);
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return <SuccessMessage email={formData.email} />;
  }

  return (
    <SignUpForm
      email={formData.email}
      password={formData.password}
      emailNotifications={formData.emailNotifications}
      termsAccepted={formData.termsAccepted}
      error={error}
      isLoading={isLoading}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}