import { create } from 'zustand';
import { InventoryItem } from '../types';
import { inventoryService } from '../services/inventoryService';
import { useNotificationStore } from './notificationStore';
import { inventorySyncService } from '../services/inventorySyncService';

interface InventoryState {
  // State
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  lowStockAlerts: InventoryItem[];
  expiringItems: InventoryItem[];
  stockSummary: {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItemsCount: number;
    totalStockValue: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;

  // Actions
  loadItems: (filters?: any) => Promise<void>;
  loadItemById: (id: string) => Promise<void>;
  createItem: (data: any) => Promise<void>;
  updateItem: (id: string, data: any) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addStockTransaction: (data: any) => Promise<void>;
  bulkUpdateStock: (updates: any[]) => Promise<void>;
  loadLowStockAlerts: () => Promise<void>;
  loadExpiringItems: (daysAhead?: number) => Promise<void>;
  loadStockSummary: () => Promise<void>;
  checkStockAvailability: (productIds: string[]) => Promise<any>;
  clearError: () => void;
  setSelectedItem: (item: InventoryItem | null) => void;
  filterItems: (filters: any) => InventoryItem[];
  searchItems: (searchTerm: string) => InventoryItem[];
  getItemById: (id: string) => InventoryItem | undefined;
  refreshData: () => Promise<void>;
  syncToCloud: () => Promise<any>;
  getSyncStatus: () => any;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  // Initial state
  items: [],
  selectedItem: null,
  lowStockAlerts: [],
  expiringItems: [],
  stockSummary: null,
  isLoading: false,
  error: null,
  lastSyncTime: null,

  // Load all inventory items
  loadItems: async (filters = {}) => {
    set({ isLoading: true, error: null });

    try {
      const items = await inventoryService.getAllItems(filters);
      set({
        items,
        isLoading: false,
        lastSyncTime: new Date().toISOString(),
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Load Inventory',
        message: error.message,
      });
    }
  },

  // Load single item by ID
  loadItemById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const item = await inventoryService.getItemById(id);
      set({
        selectedItem: item,
        isLoading: false,
      });

      // Update item in items array if it exists
      const { items } = get();
      const updatedItems = items.map(i => (i.id === id ? item : i));
      set({ items: updatedItems });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Create new inventory item
  createItem: async data => {
    set({ isLoading: true, error: null });

    try {
      const newItem = await inventoryService.createItem(data);
      const { items } = get();
      set({
        items: [...items, newItem],
        isLoading: false,
      });

      // Add to sync queue for cloud sync
      inventorySyncService.addToSyncQueue('CREATE', 'inventory_item', newItem);

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Item Created',
        message: `${newItem.name} has been added to inventory`,
      });

      // Refresh summary
      get().loadStockSummary();
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Create Item',
        message: error.message,
      });
    }
  },

  // Update inventory item
  updateItem: async (id: string, data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedItem = await inventoryService.updateItem(id, data);
      const { items } = get();
      const updatedItems = items.map(item =>
        item.id === id ? updatedItem : item
      );

      set({
        items: updatedItems,
        selectedItem:
          get().selectedItem?.id === id ? updatedItem : get().selectedItem,
        isLoading: false,
      });

      // Add to sync queue for cloud sync
      inventorySyncService.addToSyncQueue(
        'UPDATE',
        'inventory_item',
        updatedItem
      );

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Item Updated',
        message: `${updatedItem.name} has been updated`,
      });

      // Refresh related data
      get().loadStockSummary();
      get().loadLowStockAlerts();
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Update Item',
        message: error.message,
      });
    }
  },

  // Delete inventory item
  deleteItem: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      await inventoryService.deleteItem(id);
      const { items } = get();
      const filteredItems = items.filter(item => item.id !== id);

      set({
        items: filteredItems,
        selectedItem: get().selectedItem?.id === id ? null : get().selectedItem,
        isLoading: false,
      });

      // Add to sync queue for cloud sync
      inventorySyncService.addToSyncQueue('DELETE', 'inventory_item', { id });

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Item Deleted',
        message: 'Item has been removed from inventory',
      });

      // Refresh summary
      get().loadStockSummary();
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Delete Item',
        message: error.message,
      });
    }
  },

  // Add stock transaction
  addStockTransaction: async data => {
    set({ isLoading: true, error: null });

    try {
      await inventoryService.addStockTransaction(data);

      // Add to sync queue for cloud sync
      inventorySyncService.addToSyncQueue(
        'STOCK_TRANSACTION',
        'stock_transaction',
        data
      );

      // Reload the affected item to get updated stock levels
      await get().loadItemById(data.inventory_item_id);

      // Refresh items list to reflect changes
      await get().loadItems();

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Stock Updated',
        message: 'Stock transaction has been recorded',
      });

      // Refresh related data
      get().loadStockSummary();
      get().loadLowStockAlerts();
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Update Stock',
        message: error.message,
      });
    }
  },

  // Bulk update stock levels
  bulkUpdateStock: async updates => {
    set({ isLoading: true, error: null });

    try {
      await inventoryService.bulkUpdateStock(updates);

      // Refresh all items
      await get().loadItems();

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Bulk Update Complete',
        message: `${updates.length} items updated successfully`,
      });

      // Refresh related data
      get().loadStockSummary();
      get().loadLowStockAlerts();
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Bulk Update Failed',
        message: error.message,
      });
    }
  },

  // Load low stock alerts
  loadLowStockAlerts: async () => {
    try {
      const alerts = await inventoryService.getLowStockAlerts();
      set({ lowStockAlerts: alerts });
    } catch (error: any) {
      console.error('Failed to load low stock alerts:', error);
    }
  },

  // Load expiring items
  loadExpiringItems: async (daysAhead = 7) => {
    try {
      const items = await inventoryService.getExpiringItems(daysAhead);
      set({ expiringItems: items });
    } catch (error: any) {
      console.error('Failed to load expiring items:', error);
    }
  },

  // Load stock summary
  loadStockSummary: async () => {
    try {
      const summary = await inventoryService.getStockSummary();
      set({ stockSummary: summary });
    } catch (error: any) {
      console.error('Failed to load stock summary:', error);
    }
  },

  // Check stock availability for products
  checkStockAvailability: async (productIds: string[]) => {
    try {
      return await inventoryService.checkStockAvailability(productIds);
    } catch (error: any) {
      console.error('Failed to check stock availability:', error);
      return [];
    }
  },

  // Utility actions
  clearError: () => {
    set({ error: null });
  },

  setSelectedItem: (item: InventoryItem | null) => {
    set({ selectedItem: item });
  },

  // Filter items based on criteria
  filterItems: filters => {
    const { items } = get();

    return items.filter(item => {
      if (
        filters.isActive !== undefined &&
        item.is_active !== filters.isActive
      ) {
        return false;
      }

      if (
        filters.lowStock &&
        (item.current_stock || 0) > (item.minimum_stock || 0)
      ) {
        return false;
      }

      if (filters.outOfStock && (item.current_stock || 0) > 0) {
        return false;
      }

      if (filters.expiringSoon && item.expiry_date) {
        const expiryDate = new Date(item.expiry_date);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (expiryDate > nextWeek) {
          return false;
        }
      }

      return true;
    });
  },

  // Search items by name or supplier
  searchItems: (searchTerm: string) => {
    const { items } = get();
    const term = searchTerm.toLowerCase();

    return items.filter(
      item =>
        item.name.toLowerCase().includes(term) ||
        (item.supplier_name && item.supplier_name.toLowerCase().includes(term))
    );
  },

  // Get item by ID
  getItemById: (id: string) => {
    const { items } = get();
    return items.find(item => item.id === id);
  },

  // Refresh all data
  refreshData: async () => {
    const promises = [
      get().loadItems(),
      get().loadLowStockAlerts(),
      get().loadExpiringItems(),
      get().loadStockSummary(),
    ];

    await Promise.all(promises);

    useNotificationStore.getState().addNotification({
      type: 'success',
      title: 'Data Refreshed',
      message: 'Inventory data has been updated',
    });
  },

  // Sync operations
  syncToCloud: async () => {
    try {
      const result = await inventorySyncService.forceSyncNow();

      if (result.success) {
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Sync Complete',
          message: `${result.synced} changes synced to cloud`,
        });
      } else {
        useNotificationStore.getState().addNotification({
          type: 'error',
          title: 'Sync Failed',
          message: 'Failed to sync changes to cloud',
        });
      }

      return result;
    } catch (error: any) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Sync Error',
        message: error.message,
      });
      throw error;
    }
  },

  getSyncStatus: () => {
    return inventorySyncService.getSyncStatus();
  },
}));
