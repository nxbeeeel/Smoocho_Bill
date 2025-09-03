import React, { useState, useEffect } from 'react';
import { useInventoryStore } from '../store/inventoryStore';
import { InventoryItem } from '../types';
import InventoryDashboard from '../components/Inventory/InventoryDashboard';
import InventoryFilters from '../components/Inventory/InventoryFilters';
import InventoryItemCard from '../components/Inventory/InventoryItemCard';
import AddStockModal from '../components/Inventory/AddStockModal';
import StockUsageReport from '../components/Inventory/StockUsageReport';
import StockTransactionHistory from '../components/Inventory/StockTransactionHistory';
import ItemFormModal from '../components/Inventory/ItemFormModal';
import PremiumLayout from '../components/Layout/PremiumLayout';

const InventoryPage: React.FC = () => {
  const {
    items,
    selectedItem,
    lowStockAlerts,
    expiringItems,

    isLoading,
    error,
    loadItems,
    loadLowStockAlerts,
    loadExpiringItems,
    loadStockSummary,
    setSelectedItem,
    refreshData,
    syncToCloud,
    getSyncStatus,
  } = useInventoryStore();

  const [currentView, setCurrentView] = useState<
    'dashboard' | 'items' | 'report' | 'history'
  >('dashboard');
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all' as
      | 'all'
      | 'in_stock'
      | 'low_stock'
      | 'out_of_stock'
      | 'expiring',
    sortBy: 'name' as 'name' | 'stock' | 'updated' | 'expiry',
    sortOrder: 'asc' as 'asc' | 'desc',
  });

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadItems();
      await loadLowStockAlerts();
      await loadExpiringItems();
      await loadStockSummary();
    };

    initializeData();
  }, []);

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    let filtered = items;

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.name.toLowerCase().includes(search) ||
          (item.supplier_name &&
            item.supplier_name.toLowerCase().includes(search))
      );
    }

    // Status filter
    switch (filters.status) {
      case 'in_stock':
        filtered = filtered.filter(
          item => (item.current_stock || 0) > (item.minimum_stock || 0)
        );
        break;
      case 'low_stock':
        filtered = filtered.filter(item => {
          const current = item.current_stock || 0;
          const minimum = item.minimum_stock || 0;
          return current <= minimum && current > 0;
        });
        break;
      case 'out_of_stock':
        filtered = filtered.filter(item => (item.current_stock || 0) <= 0);
        break;
      case 'expiring':
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        filtered = filtered.filter(item => {
          if (!item.expiry_date) return false;
          return new Date(item.expiry_date) <= nextWeek;
        });
        break;
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'stock':
          aValue = a.current_stock || 0;
          bValue = b.current_stock || 0;
          break;
        case 'updated':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case 'expiry':
          aValue = a.expiry_date
            ? new Date(a.expiry_date)
            : new Date('9999-12-31');
          bValue = b.expiry_date
            ? new Date(b.expiry_date)
            : new Date('9999-12-31');
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [items, filters]);

  // Alert counts for filters
  const alertCounts = {
    total: items.length,
    lowStock: lowStockAlerts.length,
    outOfStock: items.filter(item => (item.current_stock || 0) <= 0).length,
    expiring: expiringItems.length,
  };

  // Handle view details from dashboard
  const handleViewDetails = (type: string) => {
    switch (type) {
      case 'low-stock':
        setFilters(prev => ({ ...prev, status: 'low_stock' }));
        setCurrentView('items');
        break;
      case 'out-of-stock':
        setFilters(prev => ({ ...prev, status: 'out_of_stock' }));
        setCurrentView('items');
        break;
      case 'expiring':
        setFilters(prev => ({ ...prev, status: 'expiring' }));
        setCurrentView('items');
        break;
      default:
        setCurrentView('items');
    }
  };

  // Handle item actions
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleAddStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAddStockModal(true);
  };

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedItem(item);
    setCurrentView('history');
  };

  // Sync status
  const syncStatus = getSyncStatus();

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-secondary-900">
            Inventory Management
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Inventory
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Inventory Management
          </h1>
          <p className="text-sm text-secondary-500 mt-1">
            Track stock levels, manage inventory, and monitor alerts
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sync Status */}
          <div className="flex items-center space-x-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus.isSyncing
                  ? 'bg-blue-500 animate-pulse'
                  : syncStatus.isOnline
                    ? 'bg-green-500'
                    : 'bg-red-500'
              }`}
            />
            <span className="text-secondary-600">
              {syncStatus.isSyncing
                ? 'Syncing...'
                : syncStatus.isOnline
                  ? 'Online'
                  : 'Offline'}
            </span>
            {syncStatus.pendingOperations > 0 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {syncStatus.pendingOperations} pending
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded hover:bg-secondary-50 disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>

          <button
            onClick={syncToCloud}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            className="px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 border border-blue-300 rounded hover:bg-blue-200 disabled:opacity-50"
          >
            Sync to Cloud
          </button>

          <button
            onClick={() => setShowItemForm(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
          >
            Add Item
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'items', label: 'Items', icon: '📦' },
            { id: 'report', label: 'Usage Report', icon: '📈' },
            { id: 'history', label: 'History', icon: '📜' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentView === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {currentView === 'dashboard' && (
        <div className="space-y-6">
          <InventoryDashboard onViewDetails={handleViewDetails} />

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setCurrentView('report')}
              className="p-4 bg-white border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-secondary-900 mb-2">
                📈 Usage Report
              </h3>
              <p className="text-sm text-secondary-600">
                View detailed stock usage analytics
              </p>
            </button>

            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, status: 'low_stock' }));
                setCurrentView('items');
              }}
              className="p-4 bg-white border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-secondary-900 mb-2">
                ⚠️ Low Stock Items
              </h3>
              <p className="text-sm text-secondary-600">
                Manage items below minimum threshold
              </p>
            </button>

            <button
              onClick={() => {
                setFilters(prev => ({ ...prev, status: 'expiring' }));
                setCurrentView('items');
              }}
              className="p-4 bg-white border border-secondary-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-secondary-900 mb-2">
                ⏰ Expiring Items
              </h3>
              <p className="text-sm text-secondary-600">
                Items expiring within 7 days
              </p>
            </button>
          </div>
        </div>
      )}

      {currentView === 'items' && (
        <div className="space-y-6">
          <InventoryFilters
            filters={filters}
            onFiltersChange={setFilters}
            alertCounts={alertCounts}
          />

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-secondary-200 p-4 animate-pulse"
                >
                  <div className="h-4 bg-secondary-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-secondary-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-secondary-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                No items found
              </h3>
              <p className="text-secondary-500 mb-4">
                {filters.search || filters.status !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by adding your first inventory item'}
              </p>
              <button
                onClick={() => setShowItemForm(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map(item => (
                <InventoryItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => handleEditItem(item)}
                  onAddStock={() => handleAddStock(item)}
                  onViewHistory={() => handleViewHistory(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {currentView === 'report' && <StockUsageReport />}

      {currentView === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-secondary-900">
              {selectedItem
                ? `Transaction History: ${selectedItem.name}`
                : 'Transaction History'}
            </h2>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded hover:bg-secondary-50"
            >
              Back to Dashboard
            </button>
          </div>

          {selectedItem && (
            <StockTransactionHistory transactions={[]} isLoading={isLoading} />
          )}
        </div>
      )}

      {/* Modals */}
      {showAddStockModal && selectedItem && (
        <AddStockModal
          isOpen={showAddStockModal}
          onClose={() => {
            setShowAddStockModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
        />
      )}

      {showItemForm && (
        <ItemFormModal
          isOpen={showItemForm}
          onClose={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
          item={editingItem}
        />
      )}
    </PremiumLayout>
  );
};

export default InventoryPage;
