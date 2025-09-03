import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '../../store/inventoryStore';

interface InventoryDashboardProps {
  onViewDetails: (type: string) => void;
}

const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  onViewDetails,
}) => {
  const { stockSummary, loadStockSummary, lowStockAlerts, expiringItems } =
    useInventoryStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await loadStockSummary();
      setIsLoading(false);
    };

    loadData();
  }, [loadStockSummary]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg border border-secondary-200 p-6 animate-pulse"
          >
            <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-secondary-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-secondary-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Total Items',
      value: stockSummary?.totalItems || 0,
      subtitle: 'Active inventory items',
      icon: '📦',
      color: 'blue',
      action: () => onViewDetails('all'),
    },
    {
      title: 'Low Stock Alerts',
      value: stockSummary?.lowStockItems || 0,
      subtitle: 'Items below minimum',
      icon: '⚠️',
      color: lowStockAlerts.length > 0 ? 'orange' : 'green',
      action: () => onViewDetails('low-stock'),
    },
    {
      title: 'Out of Stock',
      value: stockSummary?.outOfStockItems || 0,
      subtitle: 'Items completely out',
      icon: '🚫',
      color: (stockSummary?.outOfStockItems || 0) > 0 ? 'red' : 'green',
      action: () => onViewDetails('out-of-stock'),
    },
    {
      title: 'Expiring Soon',
      value: stockSummary?.expiringItemsCount || 0,
      subtitle: 'Items expiring in 7 days',
      icon: '⏰',
      color: expiringItems.length > 0 ? 'yellow' : 'green',
      action: () => onViewDetails('expiring'),
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {dashboardCards.map((card, index) => (
        <div
          key={index}
          onClick={card.action}
          className={`${getColorClasses(card.color)} rounded-lg border-2 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl">{card.icon}</span>
            <button className="text-xs font-medium px-2 py-1 bg-white rounded-full opacity-75 hover:opacity-100">
              View Details
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium opacity-75 mb-1">
              {card.title}
            </h3>
            <p className="text-3xl font-bold mb-1">
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs opacity-75">{card.subtitle}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryDashboard;
