import { useState } from 'react';
import AmazonAffiliate from './Amazon';
import { AlertCircle } from 'lucide-react';

export default function AffiliateSettings() {
  const [activeTab, setActiveTab] = useState('amazon');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Affiliate Settings</h2>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('amazon')}
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none ${
                activeTab === 'amazon'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Amazon Associates
            </button>
            <button
              disabled
              className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              CJ Affiliate (Coming Soon)
            </button>
            <button
              disabled
              className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              AWin (Coming Soon)
            </button>
            <button
              disabled
              className="py-4 px-6 text-sm font-medium border-b-2 border-transparent text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Etsy (Coming Soon)
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Info Alert */}
          <div className="mb-6 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 p-4 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Affiliate Link Processing</h4>
              <p className="mt-1 text-sm">
                When users view wishlists, item URLs will be automatically processed to include your affiliate IDs.
                The original URLs are preserved for wishlist owners, while viewers see the affiliate versions.
              </p>
            </div>
          </div>

          {activeTab === 'amazon' && <AmazonAffiliate />}
        </div>
      </div>
    </div>
  );
}