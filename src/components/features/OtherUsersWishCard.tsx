import { useState, useEffect } from 'react';
import { ExternalLink, Check, X, Users } from 'lucide-react';
import { Database } from '../../lib/supabase-types';
import { useProfile } from '../../hooks/useProfile';
import { usePurchase } from '../../hooks/usePurchase';
import { useAffiliateUrl } from '../../hooks/useAffiliateUrl';
import { formatCurrency } from '../../lib/currency';
import OtherUsersPurchaseOptions from './OtherUsersPurchaseOptions';

type Item = Database['public']['Tables']['items']['Row'];
type Occasion = Database['public']['Tables']['occasions']['Row'];

interface OtherUsersWishCardProps {
  item: Item;
  occasion?: Occasion;
  onPurchase: () => void;
  onUnpurchase: () => void;
  showThumbnail?: boolean;
}

export default function OtherUsersWishCard({ 
  item, 
  occasion, 
  onPurchase,
  onUnpurchase,
  showThumbnail = true
}: OtherUsersWishCardProps) {
  const { profile } = useProfile();
  const { 
    markItemAsPurchased, 
    addGroupPurchaseContribution,
    removeGroupPurchaseContribution,
    getGroupPurchaseContributions,
    hasGroupPurchaseContribution
  } = usePurchase();
  const [showPurchaseOptions, setShowPurchaseOptions] = useState(false);
  const [groupPurchaseCount, setGroupPurchaseCount] = useState(0);
  const [isGroupContributor, setIsGroupContributor] = useState(false);

  // Transform the URL for affiliate linking
  const affiliateUrl = useAffiliateUrl(item.item_url);

  // Fetch group purchase info when component mounts
  useEffect(() => {
    const fetchGroupPurchases = async () => {
      const contributions = await getGroupPurchaseContributions(item.id);
      setGroupPurchaseCount(contributions.length);
      const hasContribution = await hasGroupPurchaseContribution(item.id);
      setIsGroupContributor(hasContribution);
    };
    fetchGroupPurchases();
  }, [item.id, getGroupPurchaseContributions, hasGroupPurchaseContribution]);

  const handlePurchaseOptions = async (options: any) => {
    let success = false;

    if (options.purchaseType === 'mark-purchased') {
      success = await markItemAsPurchased(item.id, options);
      if (success) {
        onPurchase();
      }
    } else {
      success = await addGroupPurchaseContribution(item.id, options);
      if (success) {
        setGroupPurchaseCount(prev => prev + 1);
        setIsGroupContributor(true);
      }
    }

    if (success) {
      setShowPurchaseOptions(false);
    }
  };

  const handleUnpurchase = async () => {
    if (isGroupContributor) {
      const success = await removeGroupPurchaseContribution(item.id);
      if (success) {
        setGroupPurchaseCount(prev => prev - 1);
        setIsGroupContributor(false);
        onUnpurchase();
      }
    }
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
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
            <p className="text-green-600 dark:text-green-400 text-sm mt-2 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Purchased
            </p>
          )}
          {groupPurchaseCount > 0 && !item.purchased && (
            <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-2 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {groupPurchaseCount} {groupPurchaseCount === 1 ? 'person is' : 'people are'} willing to contribute
            </p>
          )}
          <div className="mt-4 flex justify-between items-center">
            <div>
              {affiliateUrl && (
                <a
                  href={affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                  title="View item"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
            <div>
              {isGroupContributor && !item.purchased ? (
                <button
                  onClick={handleUnpurchase}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  title="Remove contribution"
                >
                  <X className="w-5 h-5" />
                  <span>Remove Contribution</span>
                </button>
              ) : !item.purchased && (
                <button
                  onClick={() => setShowPurchaseOptions(true)}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                  title="Purchase options"
                >
                  <Check className="w-5 h-5" />
                  <span>Purchase</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPurchaseOptions && (
        <OtherUsersPurchaseOptions
          item={item}
          onClose={() => setShowPurchaseOptions(false)}
          onPurchase={handlePurchaseOptions}
        />
      )}
    </>
  );
}