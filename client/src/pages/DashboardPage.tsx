import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useOfflineStore } from '../store/offlineStore';
import MenuEditor from '../components/MenuEditor/MenuEditor';
import Settings from '../components/Settings/Settings';
import PremiumLayout from '../components/Layout/PremiumLayout';
import {
  ShoppingCartIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ClockIcon,
  Cog6ToothIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { isOnline, pendingOperations } = useOfflineStore();
  const navigate = useNavigate();
  const [showMenuEditor, setShowMenuEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const stats = [
    {
      name: "Today's Sales",
      value: '₹12,485',
      change: '+12%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Orders Today',
      value: '47',
      change: '+8%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
    },
    {
      name: 'Low Stock Items',
      value: '3',
      change: 'Alert',
      changeType: 'negative',
      icon: ArchiveBoxIcon,
    },
    {
      name: 'Active Items',
      value: '124',
      change: '2 new',
      changeType: 'neutral',
      icon: UsersIcon,
    },
  ];

  const quickActions = [
    {
      name: 'New Order',
      description: 'Start a new POS order',
      icon: ShoppingCartIcon,
      color: 'bg-green-500',
      action: () => navigate('/pos'),
    },
    {
      name: 'Manage Inventory',
      description: 'Update stock levels',
      icon: ArchiveBoxIcon,
      color: 'bg-blue-500',
      action: () => navigate('/inventory'),
    },
    {
      name: 'Edit Menu',
      description: 'Manage menu items & prices',
      icon: PencilIcon,
      color: 'bg-purple-500',
      action: () => setShowMenuEditor(true),
    },
    {
      name: 'Settings',
      description: 'Configure system preferences',
      icon: Cog6ToothIcon,
      color: 'bg-gray-500',
      action: () => setShowSettings(true),
    },
    {
      name: 'View Reports',
      description: 'Sales and analytics',
      icon: ChartBarIcon,
      color: 'bg-indigo-500',
      action: () => navigate('/reports'),
    },
    {
      name: 'Recent Orders',
      description: 'View order history',
      icon: ClockIcon,
      color: 'bg-orange-500',
      action: () => navigate('/orders'),
    },
  ];

  return (
    <PremiumLayout title="Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">
              Welcome back, {user?.username || 'Admin'}!
            </h1>
            <p className="mt-1 text-sm text-secondary-600">
              Here's what's happening at your dessert shop today.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className={`
              flex items-center px-3 py-2 rounded-lg text-sm font-medium
              ${isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
            `}>
              <div className={`
                w-2 h-2 rounded-full mr-2
                ${isOnline ? 'bg-green-500' : 'bg-red-500'}
              `}></div>
              {isOnline ? 'Online' : 'Offline'}
            </div>
            {pendingOperations > 0 && (
              <div className="flex items-center px-3 py-2 rounded-lg text-sm font-medium bg-amber-100 text-amber-800">
                <ClockIcon className="w-4 h-4 mr-2" />
                {pendingOperations} pending
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(stat => (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-secondary-500">{stat.name}</p>
                  <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    <span className={`
                      text-sm font-medium
                      ${stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-secondary-600'}
                    `}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-medium text-secondary-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map(action => (
              <button
                key={action.name}
                onClick={action.action}
                className="card hover:shadow-lg transition-shadow duration-200 text-left touch-feedback"
              >
                <div className="flex items-center">
                  <div
                    className={`
                    flex-shrink-0 w-12 h-12 ${action.color} rounded-lg 
                    flex items-center justify-center
                  `}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-secondary-900">
                      {action.name}
                    </h3>
                    <p className="text-xs text-secondary-500 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-medium text-secondary-900 mb-4">
            Recent Activity
          </h2>
          <div className="card">
            <div className="space-y-4">
              {[
                {
                  time: '2 min ago',
                  action: 'Order #1234 completed',
                  amount: '₹450',
                },
                {
                  time: '15 min ago',
                  action: 'Stock updated: Chocolate Cake',
                  amount: '+5 units',
                },
                {
                  time: '1 hour ago',
                  action: 'Order #1233 completed',
                  amount: '₹320',
                },
                {
                  time: '2 hours ago',
                  action: 'Low stock alert: Vanilla Extract',
                  amount: '2 units left',
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-secondary-100 last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium text-secondary-900">
                      {activity.action}
                    </p>
                    <p className="text-xs text-secondary-500">{activity.time}</p>
                  </div>
                  <div className="text-sm font-medium text-secondary-600">
                    {activity.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Editor Modal */}
        {showMenuEditor && (
          <MenuEditor />
        )}

        {/* Settings Modal */}
        {showSettings && (
          <Settings 
            isOpen={showSettings} 
            onClose={() => setShowSettings(false)} 
          />
        )}
      </div>
    </PremiumLayout>
  );
};

export default DashboardPage;
