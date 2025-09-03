import React from 'react';
import { InventoryItem } from '../../types';

interface InventoryItemCardProps {
  item: InventoryItem;
  onClick?: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onAddStock?: () => void;
  onViewHistory?: () => void;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onClick,
  showActions = true,
  onEdit,
  onAddStock,
  onViewHistory,
}) => {
  const getStockStatus = () => {
    const current = item.current_stock || 0;
    const minimum = item.minimum_stock || 0;

    if (current <= 0) return 'out-of-stock';
    if (current <= minimum) return 'low-stock';
    if (current <= minimum * 1.5) return 'warning';
    return 'good';
  };

  const getStatusColor = () => {
    const status = getStockStatus();
    switch (status) {
      case 'out-of-stock':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'low-stock':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'warning':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default:
        return 'bg-green-100 border-green-300 text-green-800';
    }
  };

  const getStatusText = () => {
    const status = getStockStatus();
    switch (status) {
      case 'out-of-stock':
        return 'Out of Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'warning':
        return 'Warning';
      default:
        return 'In Stock';
    }
  };

  const isExpiringSoon = () => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return expiryDate <= nextWeek;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div
      className={`bg-white rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-primary-300' : ''
      } ${getStockStatus() === 'out-of-stock' ? 'opacity-75' : ''}`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-secondary-900 text-lg truncate">
            {item.name}
          </h3>
          {item.supplier_name && (
            <p className="text-sm text-secondary-500 mt-1">
              Supplier: {item.supplier_name}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
        >
          {getStatusText()}
        </div>
      </div>

      {/* Stock Information */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-secondary-500 uppercase tracking-wide">
            Current Stock
          </p>
          <p className="text-xl font-bold text-secondary-900">
            {item.current_stock || 0}{' '}
            <span className="text-sm font-normal">{item.unit}</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-secondary-500 uppercase tracking-wide">
            Minimum Stock
          </p>
          <p className="text-lg font-semibold text-secondary-700">
            {item.minimum_stock || 0}{' '}
            <span className="text-sm font-normal">{item.unit}</span>
          </p>
        </div>
      </div>

      {/* Cost Information */}
      {item.cost_per_unit && (
        <div className="mb-3">
          <p className="text-xs text-secondary-500 uppercase tracking-wide">
            Cost per {item.unit}
          </p>
          <p className="text-lg font-semibold text-secondary-700">
            ₹{item.cost_per_unit.toFixed(2)}
          </p>
          <p className="text-xs text-secondary-500">
            Total Value: ₹
            {((item.cost_per_unit || 0) * (item.current_stock || 0)).toFixed(2)}
          </p>
        </div>
      )}

      {/* Expiry Warning */}
      {isExpiringSoon() && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800 font-medium">
            ⚠️ Expires: {formatDate(item.expiry_date!)}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-secondary-200">
          <button
            onClick={e => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 rounded hover:bg-secondary-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onAddStock?.();
            }}
            className="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded hover:bg-primary-200 transition-colors"
          >
            Add Stock
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              onViewHistory?.();
            }}
            className="px-3 py-2 text-sm font-medium text-secondary-600 border border-secondary-300 rounded hover:bg-secondary-50 transition-colors"
          >
            History
          </button>
        </div>
      )}
    </div>
  );
};

export default InventoryItemCard;
