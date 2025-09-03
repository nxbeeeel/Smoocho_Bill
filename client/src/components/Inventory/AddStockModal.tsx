import React, { useState } from 'react';
import { InventoryItem } from '../../types';
import { useInventoryStore } from '../../store/inventoryStore';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
}

const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  item,
}) => {
  const [transactionType, setTransactionType] = useState<
    'IN' | 'OUT' | 'ADJUSTMENT'
  >('IN');
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState(
    item.cost_per_unit?.toString() || ''
  );
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { addStockTransaction } = useInventoryStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setIsLoading(true);

    try {
      await addStockTransaction({
        inventory_item_id: item.id,
        transaction_type: transactionType,
        quantity: parseFloat(quantity),
        cost_per_unit: costPerUnit ? parseFloat(costPerUnit) : undefined,
        reference_type: 'MANUAL',
        notes: notes || `Manual ${transactionType.toLowerCase()} transaction`,
      });

      // Reset form
      setQuantity('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Failed to add stock transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNewStock = () => {
    const current = item.current_stock || 0;
    const qty = parseFloat(quantity) || 0;

    switch (transactionType) {
      case 'IN':
        return current + qty;
      case 'OUT':
        return Math.max(0, current - qty);
      case 'ADJUSTMENT':
        return qty;
      default:
        return current;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary-900">
            Update Stock: {item.name}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Current Stock Info */}
        <div className="bg-secondary-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-500">Current Stock</p>
              <p className="font-semibold text-lg">
                {item.current_stock || 0} {item.unit}
              </p>
            </div>
            <div>
              <p className="text-secondary-500">Minimum Stock</p>
              <p className="font-semibold text-lg">
                {item.minimum_stock || 0} {item.unit}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'IN', label: 'Add Stock', color: 'green' },
                { value: 'OUT', label: 'Remove Stock', color: 'red' },
                { value: 'ADJUSTMENT', label: 'Adjust Total', color: 'blue' },
              ].map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTransactionType(value as any)}
                  className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                    transactionType === value
                      ? `border-${color}-500 bg-${color}-50 text-${color}-700`
                      : 'border-secondary-200 bg-white text-secondary-600 hover:border-secondary-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              {transactionType === 'ADJUSTMENT'
                ? 'New Total Quantity'
                : 'Quantity'}{' '}
              ({item.unit})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              step="0.001"
              min="0"
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder={`Enter quantity in ${item.unit}`}
              required
            />
          </div>

          {/* Cost per Unit */}
          {transactionType === 'IN' && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Cost per {item.unit} (Optional)
              </label>
              <input
                type="number"
                value={costPerUnit}
                onChange={e => setCostPerUnit(e.target.value)}
                step="0.01"
                min="0"
                className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter cost per unit"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add notes about this transaction..."
            />
          </div>

          {/* Preview */}
          {quantity && (
            <div className="bg-primary-50 rounded-lg p-4">
              <p className="text-sm text-primary-700">
                <strong>Preview:</strong> Stock will{' '}
                {transactionType === 'ADJUSTMENT' ? 'be set to' : 'change to'}{' '}
                <span className="font-bold">
                  {calculateNewStock()} {item.unit}
                </span>
              </p>
              {costPerUnit && transactionType === 'IN' && (
                <p className="text-sm text-primary-600 mt-1">
                  Total Cost: ₹
                  {(parseFloat(quantity) * parseFloat(costPerUnit)).toFixed(2)}
                </p>
              )}
            </div>
          )}

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
              disabled={isLoading || !quantity}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processing...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;
