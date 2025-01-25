import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import AddItemOptions from './AddItemOptions';

interface QuickLinksProps {
  onAddItem: () => void;
}

export default function QuickLinks({ onAddItem }: QuickLinksProps) {
  const navigate = useNavigate();
  const [showAddOptions, setShowAddOptions] = useState(false);

  const handleOptionSelect = (option: 'manual' | 'barcode' | 'ai' | 'recommend') => {
    setShowAddOptions(false);
    if (option === 'manual') {
      onAddItem();
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setShowAddOptions(true)}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-800 transition-colors">
              <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">Add Item</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add a new item to your wishlist
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/occasions')}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">Occasions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your special occasions
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/messages')}
          className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all group"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg group-hover:bg-pink-200 dark:group-hover:bg-pink-800 transition-colors">
              <MessageSquare className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold">Messages</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View messages and requests
              </p>
            </div>
          </div>
        </button>
      </div>

      {showAddOptions && (
        <AddItemOptions
          onClose={() => setShowAddOptions(false)}
          onOptionSelect={handleOptionSelect}
        />
      )}
    </>
  );
}