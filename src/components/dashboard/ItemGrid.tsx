import { useState } from 'react';
import { Database } from '../../lib/supabase-types';
import WishCard from './WishCard';
import ItemControls from './ItemControls';

type Item = Database['public']['Tables']['items']['Row'];
type Occasion = Database['public']['Tables']['occasions']['Row'];

type SortOption = {
  value: string;
  label: string;
  sortFn: (a: Item, b: Item) => number;
};

const sortOptions: SortOption[] = [
  {
    value: 'newest',
    label: 'Newest First',
    sortFn: (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  },
  {
    value: 'oldest',
    label: 'Oldest First',
    sortFn: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  },
  {
    value: 'name-asc',
    label: 'Name (A-Z)',
    sortFn: (a, b) => a.name.localeCompare(b.name)
  },
  {
    value: 'name-desc',
    label: 'Name (Z-A)',
    sortFn: (a, b) => b.name.localeCompare(a.name)
  },
  {
    value: 'price-asc',
    label: 'Price (Low to High)',
    sortFn: (a, b) => (a.price || 0) - (b.price || 0)
  },
  {
    value: 'price-desc',
    label: 'Price (High to Low)',
    sortFn: (a, b) => (b.price || 0) - (a.price || 0)
  }
];

interface ItemGridProps {
  items: Item[];
  occasions: Occasion[];
  showPurchased: boolean;
  sortBy: string;
  onEditItem: (item: Item) => void;
  onDeleteItem: (itemId: string) => void;
  onShowPurchasedChange: (value: boolean) => void;
  onSortChange: (value: string) => void;
}

export default function ItemGrid({
  items,
  occasions,
  showPurchased,
  sortBy,
  onEditItem,
  onDeleteItem,
  onShowPurchasedChange,
  onSortChange,
}: ItemGridProps) {
  const [selectedOccasion, setSelectedOccasion] = useState<string>('all');
  const [showThumbnails, setShowThumbnails] = useState(true);

  const filteredItems = items
    .filter(item => {
      // First apply purchase filter
      if (!showPurchased && item.purchased) {
        return false;
      }
      
      // Then apply occasion filter
      if (selectedOccasion === 'all') {
        return true;
      }
      return item.occasion_id === selectedOccasion;
    })
    .sort((a, b) => {
      const sortOption = sortOptions.find(option => option.value === sortBy);
      return sortOption ? sortOption.sortFn(a, b) : 0;
    });

  if (items.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
        No items in your wishlist yet. Click "Add New Item" to get started!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <ItemControls
        occasions={occasions}
        sortBy={sortBy}
        onSortChange={onSortChange}
        showPurchased={showPurchased}
        onShowPurchasedChange={onShowPurchasedChange}
        selectedOccasion={selectedOccasion}
        onOccasionChange={setSelectedOccasion}
        showThumbnails={showThumbnails}
        onShowThumbnailsChange={setShowThumbnails}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <WishCard
              key={item.id}
              item={item}
              occasion={occasions.find(o => o.id === item.occasion_id)}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
              showThumbnail={showThumbnails}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          No items found for the selected filters.
        </p>
      )}
    </div>
  );
}