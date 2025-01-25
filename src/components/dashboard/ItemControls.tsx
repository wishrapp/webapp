import { LayoutGrid, List } from 'lucide-react';
import { Database } from '../../lib/supabase-types';

type Occasion = Database['public']['Tables']['occasions']['Row'];

interface ItemControlsProps {
  occasions: Occasion[];
  sortBy: string;
  onSortChange: (value: string) => void;
  showPurchased: boolean;
  onShowPurchasedChange: (value: boolean) => void;
  selectedOccasion: string;
  onOccasionChange: (value: string) => void;
  showThumbnails: boolean;
  onShowThumbnailsChange: (value: boolean) => void;
}

export default function ItemControls({
  occasions,
  sortBy,
  onSortChange,
  showPurchased,
  onShowPurchasedChange,
  selectedOccasion,
  onOccasionChange,
  showThumbnails,
  onShowThumbnailsChange,
}: ItemControlsProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      {/* Sort Control */}
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="price-asc">Price (Low to High)</option>
        <option value="price-desc">Price (High to Low)</option>
      </select>

      {/* Occasion Filter */}
      <select
        value={selectedOccasion}
        onChange={(e) => onOccasionChange(e.target.value)}
        className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
      >
        <option value="all">All Occasions</option>
        {occasions.map(occasion => (
          <option key={occasion.id} value={occasion.id}>
            {occasion.name}
          </option>
        ))}
      </select>

      {/* Show/Hide Purchased Toggle */}
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={showPurchased}
          onChange={(e) => onShowPurchasedChange(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Show Purchased
        </span>
      </label>

      {/* Show/Hide Thumbnails Toggle */}
      <button
        onClick={() => onShowThumbnailsChange(!showThumbnails)}
        className="flex items-center space-x-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      >
        {showThumbnails ? (
          <LayoutGrid className="w-4 h-4" />
        ) : (
          <List className="w-4 h-4" />
        )}
        <span className="text-sm">
          {showThumbnails ? 'Hide Thumbnails' : 'Show Thumbnails'}
        </span>
      </button>
    </div>
  );
}