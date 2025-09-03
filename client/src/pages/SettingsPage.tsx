import React from 'react';
import Settings from '../components/Settings/Settings';
import PremiumLayout from '../components/Layout/PremiumLayout';

const SettingsPage: React.FC = () => {
  return (
    <PremiumLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="mt-2 text-gray-600">
              Configure your system preferences and business settings
            </p>
          </div>
        </div>
        
        <Settings isOpen={true} onClose={() => {}} isPage={true} />
      </div>
    </PremiumLayout>
  );
};

export default SettingsPage;
