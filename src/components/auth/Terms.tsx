import { Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
            <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              wishr
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Last updated: January 26, 2024
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 sm:p-8 space-y-6">
          <button
            onClick={() => navigate('/signup')}
            className="mb-6 text-[#9333ea] hover:text-[#7e22ce] font-medium flex items-center"
          >
            ← Back to Sign Up
          </button>

          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to Wishr. By using our service, you agree to these terms. Please read them carefully.
            </p>

            <h2 className="text-xl font-semibold mb-4">2. Using our Services</h2>
            <p className="mb-4">
              You must follow any policies made available to you within the Services. You may use our
              Services only as permitted by law. We may suspend or stop providing our Services to you if
              you do not comply with our terms or policies or if we are investigating suspected misconduct.
            </p>

            <h2 className="text-xl font-semibold mb-4">3. Privacy and Copyright Protection</h2>
            <p className="mb-4">
              Our privacy policies explain how we treat your personal data and protect your privacy when
              you use our Services. By using our Services, you agree that Wishr can use such data in
              accordance with our privacy policies.
            </p>

            <h2 className="text-xl font-semibold mb-4">4. Your Content in our Services</h2>
            <p className="mb-4">
              Our Services allow you to upload, submit, store, send or receive content. You retain
              ownership of any intellectual property rights that you hold in that content.
            </p>

            <h2 className="text-xl font-semibold mb-4">5. Account Security</h2>
            <p className="mb-4">
              You are responsible for safeguarding the password that you use to access the Services and
              for any activities or actions under your password. We encourage you to use "strong"
              passwords (passwords that use a combination of upper and lower case letters, numbers, and
              symbols) with your account.
            </p>

            <h2 className="text-xl font-semibold mb-4">6. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend access to our Services immediately, without prior notice or
              liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2 className="text-xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
              What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-xl font-semibold mb-4">8. Contact Information</h2>
            <p className="mb-4">
              If you have any questions about these Terms, please contact us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}