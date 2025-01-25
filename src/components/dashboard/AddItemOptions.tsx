import { Pencil, QrCode, Sparkles, Gift } from 'lucide-react';

interface AddItemOptionsProps {
  onClose: () => void;
  onOptionSelect: (option: 'manual' | 'barcode' | 'ai' | 'recommend') => void;
}

export default function AddItemOptions({ onClose, onOptionSelect }: AddItemOptionsProps) {
  const options = [
    {
      id: 'manual',
      icon: Pencil,
      title: 'Manually add an item',
      description: 'Add a new item to your wishlist by filling out a form',
      available: true
    },
    {
      id: 'barcode',
      icon: QrCode,
      title: 'Scan a barcode',
      description: 'Coming soon - Scan a product barcode to add it to your wishlist',
      available: false
    },
    {
      id: 'ai',
      icon: Sparkles,
      title: 'Use AI to identify an Item',
      description: 'Coming soon - Let AI help you identify and add items',
      available: false
    },
    {
      id: 'recommend',
      icon: Gift,
      title: 'Recommend something I might like',
      description: 'Coming soon - Get personalized recommendations based on your preferences',
      available: false
    }
  ];

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Item</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map(option => (
              <button
                key={option.id}
                onClick={() => option.available && onOptionSelect(option.id as any)}
                disabled={!option.available}
                className={`p-4 rounded-lg text-left transition-colors ${
                  option.available
                    ? 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2 border-transparent hover:border-indigo-500'
                    : 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${
                    option.available
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}