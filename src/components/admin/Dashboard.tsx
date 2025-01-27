import { useState, useEffect } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import emailjs from '@emailjs/browser';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import LoadingIndicator from '../shared/LoadingIndicator';
import ConnectionError from '../shared/ConnectionError';

type DailySignup = {
  date: string;
  count: number;
};

export default function AdminDashboard() {
  const supabase = useSupabaseClient<Database>();
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [dailySignups, setDailySignups] = useState<DailySignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const fetchStats = async () => {
    try {
      setIsConnectionError(false);
      setError(null);

      // Get total users count
      const { count: userCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        if (countError.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw countError;
      }

      setTotalUsers(userCount || 0);

      // Get daily signups for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: signupsData, error: signupsError } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (signupsError) {
        if (signupsError.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw signupsError;
      }

      // Process daily signups
      const dailyCounts: { [key: string]: number } = {};
      signupsData?.forEach(profile => {
        const date = new Date(profile.created_at).toISOString().split('T')[0];
        dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });

      // Fill in missing dates with zero counts
      const signupData: DailySignup[] = [];
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        signupData.unshift({
          date: dateStr,
          count: dailyCounts[dateStr] || 0
        });
      }

      setDailySignups(signupData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [supabase]);

  const sendTestEmail = async () => {
    setSendingTestEmail(true);
    try {
      const templateParams = {
        to_email: 'jpowell79@ymail.com',
        subject: 'wishr.com EmailJS test',
        message: 'a simple test to confirm EmailJS is setup correctly',
        template_id: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        user_name: 'Admin Test',
        user_email: 'jpowell79@ymail.com',
        // Add any other variables your template might require
        from_name: 'Wishr Admin',
        reply_to: 'no-reply@wishr.com'
      };

      console.log('Sending test email with params:', templateParams);
      
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log('EmailJS Response:', response);
      alert('Test email sent successfully! Check console for details.');
    } catch (error) {
      console.error('Error sending test email:', error);
      alert(`Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSendingTestEmail(false);
    }
  };

  if (isConnectionError) {
    return (
      <ConnectionError 
        message="Unable to connect to the server. Please check your internet connection."
        onRetry={fetchStats}
      />
    );
  }

  if (loading) {
    return <LoadingIndicator message="Loading statistics..." />;
  }

  if (error) {
    return <LoadingIndicator message="Error" error={error} onRetry={fetchStats} />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button
          onClick={sendTestEmail}
          disabled={sendingTestEmail}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {sendingTestEmail ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-200">Total Users</h3>
          <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{totalUsers}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Daily Signups (Last 30 Days)</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailySignups}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <YAxis allowDecimals={false} />
              <Tooltip
                labelFormatter={(date) => new Date(date).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#9333ea"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}