import { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import emailjs from '@emailjs/browser';

type EmailForm = {
  subject: string;
  message: string;
  recipients: 'all' | 'verified' | 'premium';
};

export default function AdminEmails() {
  const supabase = useSupabaseClient<Database>();
  const [form, setForm] = useState<EmailForm>({
    subject: '',
    message: '',
    recipients: 'all'
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      // Get recipients based on filter
      const query = supabase
        .from('profiles')
        .select('email')
        .eq('email_notifications', true);

      if (form.recipients === 'verified') {
        query.eq('verified', true);
      } else if (form.recipients === 'premium') {
        query.eq('premium_member', true);
      }

      const { data: recipients, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Send emails in batches of 10
      const batchSize = 10;
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        await Promise.all(
          batch.map(recipient =>
            emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
              {
                to_email: recipient.email,
                subject: form.subject,
                message: form.message
              },
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            )
          )
        );
      }

      setSuccess(true);
      setForm({ subject: '', message: '', recipients: 'all' });
    } catch (err) {
      console.error('Error sending emails:', err);
      setError('Failed to send emails. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Send Marketing Emails</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Recipients
          </label>
          <select
            value={form.recipients}
            onChange={e => setForm({ ...form, recipients: e.target.value as EmailForm['recipients'] })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Users</option>
            <option value="verified">Verified Users Only</option>
            <option value="premium">Premium Users Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            required
            value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-600">
            Emails sent successfully!
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={sending}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {sending ? 'Sending...' : 'Send Emails'}
          </button>
        </div>
      </form>
    </div>
  );
}