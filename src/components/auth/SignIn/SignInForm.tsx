import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  formData: SignInFormData;
  onChange: (field: keyof SignInFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
  error: string | null;
  isLoading: boolean;
}

export default function SignInForm({
  formData,
  onChange,
  onSubmit,
  onForgotPassword,
  error,
  isLoading
}: SignInFormProps) {
  return (
    <form className="mt-8 space-y-6" onSubmit={onSubmit}>
      <div className="rounded-md shadow-sm space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] dark:bg-gray-700 dark:border-gray-600 text-base sm:text-lg"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#9333ea] focus:ring-[#9333ea] dark:bg-gray-700 dark:border-gray-600 text-base sm:text-lg"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm sm:text-base text-[#9333ea] hover:text-[#7e22ce]"
        >
          Forgot your password?
        </button>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base sm:text-lg font-medium text-white bg-[#9333ea] hover:bg-[#7e22ce] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9333ea] disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}