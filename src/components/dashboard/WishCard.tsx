import { useState } from 'react';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { Database } from '../../lib/supabase-types';
import { useProfile } from '../../hooks/useProfile';
import ConfirmDialog from '../shared/ConfirmDialog';
import { formatCurrency } from '../../lib/currency';

type Item = Database['public']['Tables']['items']['Row'];
type Occasion = Database['public']['Tables']['occasions']['Row'];

interface WishCardProps {
  item: Item;
  occasion?: Occasion;
  onEdit: (item: Item) => void;
  onDelete: (itemId: string) => void;
  showThumbnail?: boolean;
}

export default function WishCard({ 
  item, 
  occasion, 
  onEdit, 
  onDelete,
  showThumbnail = true
}: WishCardProps) {
  const { profile } = useProfile();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    onDelete(item.id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div
        className={`bg-white dark:bg-gray-700 shadow rounded-lg overflow-hidden ${
          item.purchased ? 'border-2 border-green-500' : ''
        }`}
      >
        {showThumbnail && item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
            {item.description}
          </p>
          {item.price && (
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-2">
              {formatCurrency(item.price, profile?.country || 'US')}
            </p>
          )}
          {occasion && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Occasion: {occasion.name}
            </p>
          )}
          {item.purchased && (
            <p className="text-green-600 text-sm mt-2">
              ✓ Purchased
            </p>
          )}
          <div className="mt-4 flex justify-between items-center">
            <div>
              {item.item_url ? (
                <a
                  href={item.item_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="View item"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              ) : (
                <div /> /* Spacer div */
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onEdit(item)}
                className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title="Edit item"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}