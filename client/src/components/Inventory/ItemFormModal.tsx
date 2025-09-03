import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { useInventoryStore } from '../../store/inventoryStore';

interface ItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    unit: '',
    current_stock: '',
    minimum_stock: '',
    cost_per_unit: '',
    supplier_name: '',
    supplier_contact: '',
    expiry_date: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { createItem, updateItem } = useInventoryStore();

  // Initialize form with item data if editing
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        unit: item.unit || '',
        current_stock: item.current_stock?.toString() || '',
        minimum_stock: item.minimum_stock?.toString() || '',
        cost_per_unit: item.cost_per_unit?.toString() || '',
        supplier_name: item.supplier_name || '',
        supplier_contact: item.supplier_contact || '',
        expiry_date: item.expiry_date
          ? new Date(item.expiry_date).toISOString().split('T')[0]
          : '',
      });
    } else {
      setFormData({
        name: '',
        unit: '',
        current_stock: '',
        minimum_stock: '',
        cost_per_unit: '',
        supplier_name: '',
        supplier_contact: '',
        expiry_date: '',
      });
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.unit.trim()) {
      alert('Name and unit are required');
      return;
    }

    setIsLoading(true);

    try {
      const itemData: any = {
        name: formData.name.trim(),
        unit: formData.unit.trim(),
        current_stock: formData.current_stock
          ? parseFloat(formData.current_stock)
          : 0,
        minimum_stock: formData.minimum_stock
          ? parseFloat(formData.minimum_stock)
          : 0,
      };

      if (formData.cost_per_unit) {
        itemData.cost_per_unit = parseFloat(formData.cost_per_unit);
      }

      if (formData.supplier_name) {
        itemData.supplier_name = formData.supplier_name.trim();
      }

      if (formData.supplier_contact) {
        itemData.supplier_contact = formData.supplier_contact.trim();
      }

      if (formData.expiry_date) {
        itemData.expiry_date = formData.expiry_date;
      }

      if (item) {
        await updateItem(item.id, itemData);
      } else {
        await createItem(itemData);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save item:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter item name"
              required
            />
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Unit *
            </label>
            <select
              value={formData.unit}
              onChange={e => handleChange('unit', e.target.value)}
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="">Select unit</option>
              <option value="grams">Grams (g)</option>
              <option value="kilograms">Kilograms (kg)</option>
              <option value="liters">Liters (L)</option>
              <option value="milliliters">Milliliters (mL)</option>
              <option value="pieces">Pieces (pcs)</option>
              <option value="packets">Packets</option>
              <option value="boxes">Boxes</option>
              <option value="bottles">Bottles</option>
            </select>
          </div>

          {/* Stock Levels */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                value={formData.current_stock}
                onChange={e => handleChange('current_stock', e.target.value)}
                step="0.001"
                min="0"
                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Minimum Stock
              </label>
              <input
                type="number"
                value={formData.minimum_stock}
                onChange={e => handleChange('minimum_stock', e.target.value)}
                step="0.001"
                min="0"
                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Cost */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Cost per Unit (₹)
            </label>
            <input
              type="number"
              value={formData.cost_per_unit}
              onChange={e => handleChange('cost_per_unit', e.target.value)}
              step="0.01"
              min="0"
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0.00"
            />
          </div>

          {/* Supplier Information */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Supplier Name
            </label>
            <input
              type="text"
              value={formData.supplier_name}
              onChange={e => handleChange('supplier_name', e.target.value)}
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter supplier name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Supplier Contact
            </label>
            <input
              type="text"
              value={formData.supplier_contact}
              onChange={e => handleChange('supplier_contact', e.target.value)}
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Phone number or email"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              value={formData.expiry_date}
              onChange={e => handleChange('expiry_date', e.target.value)}
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isLoading || !formData.name.trim() || !formData.unit.trim()
              }
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal;
