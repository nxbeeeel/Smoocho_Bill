import React from 'react';
import { ReportFilters as ReportFiltersType } from '../../types';

interface ReportFiltersProps {
  filters: ReportFiltersType;
  onFiltersChange: (filters: ReportFiltersType) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (key: keyof ReportFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Payment Method Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={filters.payment_method || 'all'}
            onChange={e => handleFilterChange('payment_method', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Payment Methods</option>
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="online">Online</option>
          </select>
        </div>

        {/* Order Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Type
          </label>
          <select
            value={filters.order_type || 'all'}
            onChange={e => handleFilterChange('order_type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Order Types</option>
            <option value="dine_in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="zomato">Zomato</option>
            <option value="swiggy">Swiggy</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <div className="flex space-x-2">
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={e => handleFilterChange('date_from', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="From"
            />
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={e => handleFilterChange('date_to', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() =>
            onFiltersChange({
              payment_method: 'all',
              order_type: 'all',
            })
          }
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
