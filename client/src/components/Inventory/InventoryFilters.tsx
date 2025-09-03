import React from 'react';

interface InventoryFiltersProps {
  filters: {
    search: string;
    status: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'expiring';
    sortBy: 'name' | 'stock' | 'updated' | 'expiry';
    sortOrder: 'asc' | 'desc';
  };
  onFiltersChange: (filters: any) => void;
  alertCounts: {
    total: number;
    lowStock: number;
    outOfStock: number;
    expiring: number;
  };
}

const InventoryFilters: React.FC<InventoryFiltersProps> = ({
  filters,
  onFiltersChange,
  alertCounts,
}) => {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const statusOptions = [
    { value: 'all', label: 'All Items', count: alertCounts.total },
    { value: 'in_stock', label: 'In Stock', count: null },
    { value: 'low_stock', label: 'Low Stock', count: alertCounts.lowStock },
    {
      value: 'out_of_stock',
      label: 'Out of Stock',
      count: alertCounts.outOfStock,
    },
    { value: 'expiring', label: 'Expiring Soon', count: alertCounts.expiring },
  ];

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'stock', label: 'Stock Level' },
    { value: 'updated', label: 'Last Updated' },
    { value: 'expiry', label: 'Expiry Date' },
  ];

  return (
    <div className="bg-white rounded-lg border border-secondary-200 p-4 mb-6">
      {/* Search */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Search Items
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-secondary-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name or supplier..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Status
          </label>
          <div className="space-y-2">
            {statusOptions.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={filters.status === option.value}
                  onChange={e => updateFilter('status', e.target.value)}
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-secondary-700">
                  {option.label}
                  {option.count !== null && option.count > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                      {option.count}
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={e => updateFilter('sortBy', e.target.value)}
            className="w-full p-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Order
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => updateFilter('sortOrder', 'asc')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.sortOrder === 'asc'
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-secondary-100 text-secondary-700 border-2 border-secondary-200 hover:bg-secondary-200'
              }`}
            >
              ↑ Ascending
            </button>
            <button
              onClick={() => updateFilter('sortOrder', 'desc')}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                filters.sortOrder === 'desc'
                  ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                  : 'bg-secondary-100 text-secondary-700 border-2 border-secondary-200 hover:bg-secondary-200'
              }`}
            >
              ↓ Descending
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <p className="text-sm font-medium text-secondary-700 mb-2">
          Quick Filters
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('status', 'low_stock')}
            className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full hover:bg-orange-200 transition-colors"
          >
            Low Stock ({alertCounts.lowStock})
          </button>
          <button
            onClick={() => updateFilter('status', 'out_of_stock')}
            className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full hover:bg-red-200 transition-colors"
          >
            Out of Stock ({alertCounts.outOfStock})
          </button>
          <button
            onClick={() => updateFilter('status', 'expiring')}
            className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
          >
            Expiring Soon ({alertCounts.expiring})
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryFilters;
