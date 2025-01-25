import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../../lib/supabase-types';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import ConfirmDialog from '../../shared/ConfirmDialog';
import AddOccasionModal from './AddOccasionModal';
import LoadingIndicator from '../../shared/LoadingIndicator';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteOccasionId, setDeleteOccasionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchOccasions = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from('occasions')
          .select('*')
          .eq('user_id', session.user.id)
          .order('date', { ascending: true });

        if (error) throw error;
        setOccasions(data);
      } catch (error) {
        console.error('Error fetching occasions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOccasions();
  }, [session, supabase]);

  const handleAddOccasion = useCallback(async (formData: OccasionForm) => {
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

      // Refresh occasions list
      const { data, error: fetchError } = await supabase
        .from('occasions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('date', { ascending: true });

      if (fetchError) throw fetchError;
      setOccasions(data || []);

      // Close modal
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding occasion:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [session?.user.id, supabase, isSubmitting]);

  const handleDeleteOccasion = async (occasionId: string) => {
    try {
      const { error } = await supabase
        .from('occasions')
        .delete()
        .eq('id', occasionId);

      if (error) throw error;

      setOccasions(occasions.filter(occasion => occasion.id !== occasionId));
      setDeleteOccasionId(null);
    } catch (error) {
      console.error('Error deleting occasion:', error);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Loading occasions..." />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Occasions</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Occasion</span>
            </button>
          </div>
        </div>

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