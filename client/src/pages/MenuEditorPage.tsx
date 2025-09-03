import React from 'react';
import MenuEditor from '../components/MenuEditor/MenuEditor';
import PremiumLayout from '../components/Layout/PremiumLayout';

const MenuEditorPage: React.FC = () => {
  return (
    <PremiumLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Menu Editor</h1>
            <p className="mt-2 text-gray-600">
              Manage your menu categories, items, pricing, and past orders
            </p>
          </div>
        </div>
        
        <MenuEditor />
      </div>
    </PremiumLayout>
  );
};

export default MenuEditorPage;
