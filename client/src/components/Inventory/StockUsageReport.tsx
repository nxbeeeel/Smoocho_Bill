import React, { useState, useEffect } from 'react';
import { inventoryService } from '../../services/inventoryService';

interface StockUsageItem {
  inventory_item: {
    id: string;
    name: string;
    unit: string;
  };
  total_used: number;
  transaction_count: number;
  transactions: any[];
}

interface StockUsageReportProps {
  onClose?: () => void;
}

const StockUsageReport: React.FC<StockUsageReportProps> = ({ onClose }) => {
  const [reportData, setReportData] = useState<StockUsageItem[]>([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 7 days ago
    endDate: new Date().toISOString().split('T')[0], // today
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await inventoryService.getStockUsageReport(
        dateRange.startDate,
        dateRange.endDate
      );
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stock usage report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [dateRange]);

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const getTotalUsageValue = () => {
    return reportData.reduce((total, item) => total + item.total_used, 0);
  };

  const getAverageUsagePerDay = (item: StockUsageItem) => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysDiff =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 1;
    return (item.total_used / daysDiff).toFixed(2);
  };

  const exportToCSV = () => {
    const headers = [
      'Item Name',
      'Unit',
      'Total Used',
      'Transaction Count',
      'Avg Daily Usage',
    ];
    const csvData = [
      headers.join(','),
      ...reportData.map(item =>
        [
          item.inventory_item.name,
          item.inventory_item.unit,
          item.total_used,
          item.transaction_count,
          getAverageUsagePerDay(item),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-usage-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-secondary-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">
            Stock Usage Report
          </h2>
          <p className="text-sm text-secondary-500 mt-1">
            View inventory consumption patterns and trends
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-secondary-500 hover:text-secondary-700 text-2xl"
          >
            ×
          </button>
        )}
      </div>

      {/* Date Range Controls */}
      <div className="mb-6 p-4 bg-secondary-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={e => handleDateChange('startDate', e.target.value)}
              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={e => handleDateChange('endDate', e.target.value)}
              className="w-full p-2 border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadReport}
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Loading...' : 'Generate Report'}
            </button>
            <button
              onClick={exportToCSV}
              disabled={isLoading || reportData.length === 0}
              className="px-4 py-2 bg-secondary-600 text-white rounded hover:bg-secondary-700 disabled:opacity-50 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      {reportData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Total Items Tracked
            </h3>
            <p className="text-2xl font-bold text-blue-900">
              {reportData.length}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-1">
              Total Transactions
            </h3>
            <p className="text-2xl font-bold text-green-900">
              {reportData.reduce(
                (sum, item) => sum + item.transaction_count,
                0
              )}
            </p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-800 mb-1">
              Total Usage Volume
            </h3>
            <p className="text-2xl font-bold text-purple-900">
              {getTotalUsageValue().toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-secondary-600">Generating report...</p>
        </div>
      )}

      {/* Report Data */}
      {!isLoading && reportData.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-secondary-400 text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-secondary-900 mb-2">
            No Usage Data Found
          </h3>
          <p className="text-secondary-500">
            No stock usage recorded for the selected date range.
          </p>
        </div>
      )}

      {!isLoading && reportData.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-secondary-50">
                <th className="border border-secondary-200 px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Item Name
                </th>
                <th className="border border-secondary-200 px-4 py-3 text-left text-sm font-semibold text-secondary-900">
                  Unit
                </th>
                <th className="border border-secondary-200 px-4 py-3 text-right text-sm font-semibold text-secondary-900">
                  Total Used
                </th>
                <th className="border border-secondary-200 px-4 py-3 text-right text-sm font-semibold text-secondary-900">
                  Transactions
                </th>
                <th className="border border-secondary-200 px-4 py-3 text-right text-sm font-semibold text-secondary-900">
                  Avg Daily Usage
                </th>
                <th className="border border-secondary-200 px-4 py-3 text-center text-sm font-semibold text-secondary-900">
                  Usage Pattern
                </th>
              </tr>
            </thead>
            <tbody>
              {reportData
                .sort((a, b) => b.total_used - a.total_used)
                .map((item, index) => (
                  <tr
                    key={item.inventory_item.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-secondary-50'}
                  >
                    <td className="border border-secondary-200 px-4 py-3">
                      <div className="font-medium text-secondary-900">
                        {item.inventory_item.name}
                      </div>
                    </td>
                    <td className="border border-secondary-200 px-4 py-3 text-secondary-600">
                      {item.inventory_item.unit}
                    </td>
                    <td className="border border-secondary-200 px-4 py-3 text-right font-semibold">
                      {item.total_used.toFixed(2)}
                    </td>
                    <td className="border border-secondary-200 px-4 py-3 text-right">
                      {item.transaction_count}
                    </td>
                    <td className="border border-secondary-200 px-4 py-3 text-right">
                      {getAverageUsagePerDay(item)}
                    </td>
                    <td className="border border-secondary-200 px-4 py-3 text-center">
                      {/* Simple usage pattern indicator */}
                      <div className="flex justify-center">
                        {Array.from({ length: 5 }, (_, i) => {
                          const intensity = Math.min(
                            1,
                            item.total_used /
                              Math.max(...reportData.map(d => d.total_used))
                          );
                          return (
                            <div
                              key={i}
                              className={`w-2 h-8 mx-0.5 rounded-sm ${
                                i < intensity * 5
                                  ? 'bg-primary-500'
                                  : 'bg-secondary-200'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Date Range Buttons */}
      <div className="mt-6 pt-4 border-t border-secondary-200">
        <p className="text-sm font-medium text-secondary-700 mb-2">
          Quick Date Ranges:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Today', days: 0 },
            { label: 'Last 7 days', days: 7 },
            { label: 'Last 30 days', days: 30 },
            { label: 'Last 3 months', days: 90 },
          ].map(({ label, days }) => (
            <button
              key={label}
              onClick={() => {
                const endDate = new Date().toISOString().split('T')[0];
                const startDate = new Date(
                  Date.now() - days * 24 * 60 * 60 * 1000
                )
                  .toISOString()
                  .split('T')[0];
                setDateRange({ startDate, endDate });
              }}
              className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-700 rounded hover:bg-secondary-200 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockUsageReport;
