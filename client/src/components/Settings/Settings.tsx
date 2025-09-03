import React, { useState } from 'react';
import {
  Cog6ToothIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  PrinterIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  DeviceTabletIcon
} from '@heroicons/react/24/outline';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  isPage?: boolean; // New prop to determine if it's a page or modal
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, isPage = false }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    business: {
      name: 'Smoocho Dessert Shop',
      address: '123 Sweet Street, Dessert City',
      phone: '+1 (555) 123-4567',
      email: 'info@smoocho.com',
      taxRate: 8.5,
      currency: 'USD'
    },
    printer: {
      enabled: true,
      model: 'Star TSP100',
      paperSize: '80mm'
    },
    security: {
      requirePin: true,
      sessionTimeout: 30,
      maxLoginAttempts: 3
    },
    notifications: {
      email: true,
      whatsapp: false,
      lowStock: true
    }
  });

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'business', name: 'Business', icon: CurrencyDollarIcon },
    { id: 'printer', name: 'Printer', icon: PrinterIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Appearance', icon: GlobeAltIcon },
    { id: 'system', name: 'System', icon: DeviceTabletIcon }
  ];

  // If it's a page, don't render the modal wrapper
  if (isPage) {
    return (
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5 inline mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'general' && <GeneralSettings settings={settings} updateSetting={updateSetting} />}
          {activeTab === 'business' && <BusinessSettings settings={settings} updateSetting={updateSetting} />}
          {activeTab === 'printer' && <PrinterSettings settings={settings} updateSetting={updateSetting} />}
          {activeTab === 'security' && <SecuritySettings settings={settings} updateSetting={updateSetting} />}
          {activeTab === 'notifications' && <NotificationSettings settings={settings} updateSetting={updateSetting} />}
          {activeTab === 'appearance' && <AppearanceSettings settings={settings} updateSetting={updateSetting} />}
          {activeTab === 'system' && <SystemSettings settings={settings} updateSetting={updateSetting} />}
        </div>
      </div>
    );
  }

  // Modal version
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'general' && <GeneralSettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'business' && <BusinessSettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'printer' && <PrinterSettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'security' && <SecuritySettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'notifications' && <NotificationSettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'appearance' && <AppearanceSettings settings={settings} updateSetting={updateSetting} />}
            {activeTab === 'system' && <SystemSettings settings={settings} updateSetting={updateSetting} />}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Save settings logic here
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const GeneralSettings: React.FC<any> = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Language</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Timezone</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
          <option>UTC</option>
          <option>EST</option>
          <option>PST</option>
        </select>
      </div>
    </div>
  </div>
);

const BusinessSettings: React.FC<any> = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Business Settings</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Business Name</label>
        <input
          type="text"
          value={settings.business.name}
          onChange={(e) => updateSetting('business', 'name', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
        <input
          type="number"
          value={settings.business.taxRate}
          onChange={(e) => updateSetting('business', 'taxRate', parseFloat(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
    </div>
  </div>
);

const PrinterSettings: React.FC<any> = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Printer Settings</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.printer.enabled}
            onChange={(e) => updateSetting('printer', 'enabled', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Enable Printer</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Paper Size</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
          <option>80mm</option>
          <option>58mm</option>
        </select>
      </div>
    </div>
  </div>
);

const SecuritySettings: React.FC<any> = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.security.requirePin}
            onChange={(e) => updateSetting('security', 'requirePin', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Require PIN for sensitive operations</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
        <input
          type="number"
          value={settings.security.sessionTimeout}
          onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
    </div>
  </div>
);

const NotificationSettings: React.FC<any> = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.notifications.email}
            onChange={(e) => updateSetting('notifications', 'email', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Email notifications</span>
        </label>
      </div>
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={settings.notifications.lowStock}
            onChange={(e) => updateSetting('notifications', 'lowStock', e.target.checked)}
            className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-700">Low stock alerts</span>
        </label>
      </div>
    </div>
  </div>
);

const AppearanceSettings: React.FC<any> = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Theme</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
          <option>Light</option>
          <option>Dark</option>
          <option>Auto</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Font Size</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
          <option>Small</option>
          <option>Medium</option>
          <option>Large</option>
        </select>
      </div>
    </div>
  </div>
);

const SystemSettings: React.FC<any> = ({ settings, updateSetting }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Auto-sync Interval</label>
        <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
          <option>5 minutes</option>
          <option>15 minutes</option>
          <option>30 minutes</option>
          <option>1 hour</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Data Retention (days)</label>
        <input
          type="number"
          defaultValue={30}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
    </div>
  </div>
);

export default Settings;

