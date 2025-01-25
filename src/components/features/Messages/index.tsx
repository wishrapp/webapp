import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageList from './MessageList';
import AccessRequests from './AccessRequests';
import AccessResponses from './AccessResponses';
import PurchaseNotifications from './PurchaseNotifications';
import GroupPurchaseMessages from './GroupPurchaseMessages';
import SystemMessages from './SystemMessages';
import { MessageCircle, UserPlus, Gift, Users, Bell } from 'lucide-react';

type MessageTab = 'all' | 'access-requests' | 'access-responses' | 'purchases' | 'group' | 'system';

export default function Messages() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MessageTab>('all');

  const tabs = [
    { id: 'all', label: 'All Messages', icon: MessageCircle },
    { id: 'access-requests', label: 'Access Requests', icon: UserPlus },
    { id: 'access-responses', label: 'Access Responses', icon: UserPlus },
    { id: 'purchases', label: 'Purchase Notifications', icon: Gift },
    { id: 'group', label: 'Group Purchases', icon: Users },
    { id: 'system', label: 'System Messages', icon: Bell }
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Messages</h1>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-500"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as MessageTab)}
                  className={`
                    flex items-center space-x-2 pb-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {activeTab === 'all' && <MessageList />}
          {activeTab === 'access-requests' && <AccessRequests />}
          {activeTab === 'access-responses' && <AccessResponses />}
          {activeTab === 'purchases' && <PurchaseNotifications />}
          {activeTab === 'group' && <GroupPurchaseMessages />}
          {activeTab === 'system' && <SystemMessages />}
        </div>
      </div>
    </div>
  );
}