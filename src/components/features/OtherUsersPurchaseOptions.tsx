import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { Database } from '../../lib/supabase-types';
import { formatCurrency } from '../../lib/currency';
import { useProfile } from '../../hooks/useProfile';

type Item = Database['public']['Tables']['items']['Row'];

interface PurchaseOptions {
  purchaseType: 'mark-purchased' | 'group-purchase';
  informOwner: boolean;
  revealIdentity: boolean;
  contribution: string;
  showEmail: boolean;
  showPhone: boolean;
}

interface OtherUsersPurchaseOptionsProps {
  item: Item;
  onClose: () => void;
  onPurchase: (options: PurchaseOptions) => Promise<void>;
}

export default function OtherUsersPurchaseOptions({
  item,
  onClose,
  onPurchase
}: OtherUsersPurchaseOptionsProps) {
  const session = useSession();
  const { profile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [options, setOptions] = useState<PurchaseOptions>({
    purchaseType: 'mark-purchased',
    informOwner: false,
    revealIdentity: false,
    contribution: '',
    showEmail: false,
    showPhone: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user.id || isSubmitting) return;

    // Show confirmation dialog instead of submitting directly
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onPurchase(options);
      onClose();
    } catch (error) {
      console.error('Error processing purchase:', error);
      alert('Failed to process purchase. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Purchase Options</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
            {item.price && (
              <p className="text-indigo-600 dark:text-indigo-400">
                {formatCurrency(item.price, profile?.country || 'US')}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Purchase Type Selection */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="purchaseType"
                  checked={options.purchaseType === 'mark-purchased'}
                  onChange={() => setOptions({ ...options, purchaseType: 'mark-purchased' })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-gray-900 dark:text-white">Mark this item as purchased</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="purchaseType"
                  checked={options.purchaseType === 'group-purchase'}
                  onChange={() => setOptions({ ...options, purchaseType: 'group-purchase' })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-gray-900 dark:text-white">Willing to help group-purchase this item</span>
              </label>
            </div>

            {/* Options for Mark as Purchased */}
            {options.purchaseType === 'mark-purchased' && (
              <div className="space-y-4 pl-7">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.informOwner}
                    onChange={(e) => setOptions({ ...options, informOwner: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-900 dark:text-white">Inform the wishlist owner</span>
                </label>

                {options.informOwner && (
                  <label className="flex items-center space-x-3 pl-6">
                    <input
                      type="checkbox"
                      checked={options.revealIdentity}
                      onChange={(e) => setOptions({ ...options, revealIdentity: e.target.checked })}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-900 dark:text-white">Reveal my identity</span>
                  </label>
                )}
              </div>
            )}

            {/* Options for Group Purchase */}
            {options.purchaseType === 'group-purchase' && (
              <div className="space-y-4 pl-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount you're willing to contribute
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={options.contribution}
                    onChange={(e) => setOptions({ ...options, contribution: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.showEmail}
                    onChange={(e) => setOptions({ ...options, showEmail: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-900 dark:text-white">Show my email address to other users</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={options.showPhone}
                    onChange={(e) => setOptions({ ...options, showPhone: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="text-gray-900 dark:text-white">Show my phone number to other users</span>
                </label>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {options.purchaseType === 'mark-purchased' ? 'Finalize and Update' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Confirm Purchase
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {options.purchaseType === 'mark-purchased' ? 'mark this item as purchased' : 'contribute to this item'}?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}