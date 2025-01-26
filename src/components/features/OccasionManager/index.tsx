import { useState, useEffect } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2, ArrowLeft } from 'lucide-react';
import ConfirmDialog from '../../shared/ConfirmDialog';
import AddOccasionModal from './AddOccasionModal';
import LoadingIndicator from '../../shared/LoadingIndicator';
import ConnectionError from '../../shared/ConnectionError';

type Occasion = Database['public']['Tables']['occasions']['Row'];

type OccasionForm = {
  name: string;
  date: string;
  is_default: boolean;
};

export default function OccasionManager() {
  const session = useSession();
  const supabase = useSupabaseClient<Database>();
  const navigate = useNavigate();
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOccasionId, setDeleteOccasionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnectionError, setIsConnectionError] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const sortOccasions = (data: Occasion[]) => {
    return [...data].sort((a, b) => {
      // "No occasion" should always be first
      if (a.name === 'No occasion') return -1;
      if (b.name === 'No occasion') return 1;

      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  };

  const fetchOccasions = async () => {
    if (!session?.user.id) return;

    try {
      setIsConnectionError(false);
      const { data, error } = await supabase
        .from('occasions')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        if (error.message.includes('Failed to fetch')) {
          setIsConnectionError(true);
          return;
        }
        throw error;
      }

      const sortedOccasions = sortOccasions(data || []);
      setOccasions(sortedOccasions);
      setError(null);
    } catch (error) {
      console.error('Error fetching occasions:', error);
      setError('Failed to load occasions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOccasions();
  }, [session, supabase]);

  const handleAddOccasion = async (formData: OccasionForm) => {
    if (!session?.user.id || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('occasions').insert({
        user_id: session.user.id,
        name: formData.name,
        date: formData.date || null,
        is_default: formData.is_default,
      });

      if (error) throw error;
      await fetchOccasions();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding occasion:', error);
      setError('Failed to add occasion');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOccasion = async (occasionId: string) => {
    try {
      const { error } = await supabase
        .from('occasions')
        .delete()
        .eq('id', occasionId);

      if (error) throw error;
      await fetchOccasions();
      setDeleteOccasionId(null);
    } catch (error) {
      console.error('Error deleting occasion:', error);
      setError('Failed to delete occasion');
    }
  };

  if (isConnectionError) {
    return (
      <ConnectionError 
        message="Unable to connect to the server. Please check your internet connection."
        onRetry={fetchOccasions}
      />
    );
  }

  if (loading) {
    return <LoadingIndicator message="Loading occasions..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
            <h1 className="text-2xl font-bold">My Occasions</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#9333ea] text-white px-4 py-2 rounded-md hover:bg-[#7e22ce] flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Occasion</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {showAddModal && (
          <AddOccasionModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAddOccasion}
            isSubmitting={isSubmitting}
          />
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {occasions.map(occasion => (
            <div key={occasion.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{occasion.name}</h3>
                    {occasion.date && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {new Date(occasion.date).toLocaleDateString()}
                      </p>
                    )}
                    {occasion.is_default && (
                      <span className="inline-block bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs px-2 py-1 rounded mt-2">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                {!occasion.is_default && (
                  <button
                    onClick={() => setDeleteOccasionId(occasion.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <ConfirmDialog
          isOpen={!!deleteOccasionId}
          onClose={() => setDeleteOccasionId(null)}
          onConfirm={() => deleteOccasionId && handleDeleteOccasion(deleteOccasionId)}
          title="Delete Occasion"
          message="Are you sure you want to delete this occasion? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />
      </div>
    </div>
  );
}