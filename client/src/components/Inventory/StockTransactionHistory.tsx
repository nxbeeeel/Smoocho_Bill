import React from 'react';
import { StockTransaction } from '../../types';

interface StockTransactionHistoryProps {
  transactions: StockTransaction[];
  isLoading?: boolean;
}

const StockTransactionHistory: React.FC<StockTransactionHistoryProps> = ({
  transactions,
  isLoading = false,
}) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return '⬆️';
      case 'OUT':
        return '⬇️';
      case 'ADJUSTMENT':
        return '⚖️';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'OUT':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'ADJUSTMENT':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-secondary-700 bg-secondary-50 border-secondary-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getTransactionDescription = (transaction: StockTransaction) => {
    switch (transaction.transaction_type) {
      case 'IN':
        return 'Stock added';
      case 'OUT':
        return 'Stock removed';
      case 'ADJUSTMENT':
        return 'Stock adjusted';
      default:
        return 'Stock transaction';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-secondary-200 rounded-lg p-4 animate-pulse"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-secondary-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-secondary-200 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-secondary-400 text-4xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-secondary-900 mb-2">
          No Transactions Found
        </h3>
        <p className="text-secondary-500">
          No stock transactions have been recorded for this item yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map(transaction => {
        const dateInfo = formatDate(transaction.created_at);

        return (
          <div
            key={transaction.id}
            className={`border-2 rounded-lg p-4 ${getTransactionColor(transaction.transaction_type)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getTransactionIcon(transaction.transaction_type)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-sm">
                      {getTransactionDescription(transaction)}
                    </h4>
                    <span className="px-2 py-1 text-xs font-medium bg-white rounded-full opacity-75">
                      {transaction.transaction_type}
                    </span>
                  </div>

                  <div className="text-sm opacity-80">
                    <p>
                      <strong>Quantity:</strong> {transaction.quantity}
                      {transaction.inventory_item?.unit &&
                        ` ${transaction.inventory_item.unit}`}
                    </p>

                    {transaction.cost_per_unit && (
                      <p>
                        <strong>Cost per unit:</strong> ₹
                        {transaction.cost_per_unit.toFixed(2)}
                      </p>
                    )}

                    {transaction.total_cost && (
                      <p>
                        <strong>Total cost:</strong> ₹
                        {transaction.total_cost.toFixed(2)}
                      </p>
                    )}

                    {transaction.reference_type && (
                      <p>
                        <strong>Reference:</strong> {transaction.reference_type}
                        {transaction.reference_id &&
                          ` (${transaction.reference_id})`}
                      </p>
                    )}

                    {transaction.user?.username && (
                      <p>
                        <strong>By:</strong> {transaction.user.username}
                      </p>
                    )}
                  </div>

                  {transaction.notes && (
                    <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-sm">
                      <strong>Notes:</strong> {transaction.notes}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right text-xs opacity-75">
                <p className="font-medium">{dateInfo.date}</p>
                <p>{dateInfo.time}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockTransactionHistory;
