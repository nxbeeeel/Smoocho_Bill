import { inventoryService } from './inventoryService';
import { useOfflineStore } from '../store/offlineStore';
import { useNotificationStore } from '../store/notificationStore';

interface SyncOperation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'STOCK_TRANSACTION';
  entity: 'inventory_item' | 'stock_transaction';
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  error?: string;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export class InventorySyncService {
  private syncQueue: SyncOperation[] = [];
  private isSyncing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.loadSyncQueue();
    this.startAutoSync();

    // Listen for online/offline changes
    window.addEventListener('online', () => {
      console.log('📶 Connection restored - starting sync');
      this.performSync();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Connection lost - sync paused');
    });
  }

  // Load sync queue from localStorage
  private loadSyncQueue() {
    try {
      const saved = localStorage.getItem('inventory_sync_queue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Save sync queue to localStorage
  private saveSyncQueue() {
    try {
      localStorage.setItem(
        'inventory_sync_queue',
        JSON.stringify(this.syncQueue)
      );
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  // Start automatic sync
  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.performSync();
      }
    }, this.SYNC_INTERVAL);
  }

  // Stop automatic sync
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Add operation to sync queue
  addToSyncQueue(
    type: SyncOperation['type'],
    entity: SyncOperation['entity'],
    data: any
  ) {
    const operation: SyncOperation = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      entity,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };

    this.syncQueue.push(operation);
    this.saveSyncQueue();

    console.log(`📝 Added to sync queue: ${type} ${entity}`, operation);

    // Try to sync immediately if online
    if (navigator.onLine && !this.isSyncing) {
      setTimeout(() => this.performSync(), 1000);
    }
  }

  // Perform synchronization
  async performSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('⏳ Sync already in progress');
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Sync already in progress'],
      };
    }

    if (!navigator.onLine) {
      console.log('📵 Offline - skipping sync');
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Device is offline'],
      };
    }

    this.isSyncing = true;
    useOfflineStore.getState().setSyncStatus(true);

    const result: SyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    console.log(
      `🔄 Starting sync - ${this.syncQueue.length} operations in queue`
    );

    try {
      const pendingOperations = this.syncQueue.filter(
        op =>
          op.status === 'pending' ||
          (op.status === 'failed' && op.retryCount < this.MAX_RETRIES)
      );

      for (const operation of pendingOperations) {
        try {
          operation.status = 'syncing';
          await this.syncSingleOperation(operation);
          operation.status = 'completed';
          result.synced++;

          console.log(`✅ Synced: ${operation.type} ${operation.entity}`);
        } catch (error: any) {
          operation.status = 'failed';
          operation.retryCount++;
          operation.error = error.message;
          result.failed++;
          result.errors.push(
            `${operation.type} ${operation.entity}: ${error.message}`
          );

          console.error(
            `❌ Sync failed: ${operation.type} ${operation.entity}`,
            error
          );
        }
      }

      // Remove completed operations
      this.syncQueue = this.syncQueue.filter(op => op.status !== 'completed');

      // Remove operations that have exceeded max retries
      const failedOperations = this.syncQueue.filter(
        op => op.status === 'failed' && op.retryCount >= this.MAX_RETRIES
      );

      if (failedOperations.length > 0) {
        console.warn(
          `🗑️ Removing ${failedOperations.length} operations that exceeded max retries`
        );
        this.syncQueue = this.syncQueue.filter(
          op => !(op.status === 'failed' && op.retryCount >= this.MAX_RETRIES)
        );
      }

      this.saveSyncQueue();

      // Update last sync time
      useOfflineStore.getState().updateLastSyncTime();

      if (result.synced > 0) {
        useNotificationStore.getState().addNotification({
          type: 'success',
          title: 'Sync Complete',
          message: `${result.synced} inventory changes synced successfully`,
        });
      }

      if (result.failed > 0) {
        useNotificationStore.getState().addNotification({
          type: 'warning',
          title: 'Sync Issues',
          message: `${result.failed} operations failed to sync`,
        });
      }
    } catch (error: any) {
      console.error('🚨 Sync process failed:', error);
      result.success = false;
      result.errors.push(`Sync process failed: ${error.message}`);

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Failed to sync inventory changes',
      });
    } finally {
      this.isSyncing = false;
      useOfflineStore.getState().setSyncStatus(false);
      useOfflineStore.getState().setPendingOperations(this.syncQueue.length);
    }

    return result;
  }

  // Sync a single operation
  private async syncSingleOperation(operation: SyncOperation): Promise<void> {
    switch (operation.entity) {
      case 'inventory_item':
        await this.syncInventoryItem(operation);
        break;
      case 'stock_transaction':
        await this.syncStockTransaction(operation);
        break;
      default:
        throw new Error(`Unknown entity type: ${operation.entity}`);
    }
  }

  // Sync inventory item operations
  private async syncInventoryItem(operation: SyncOperation): Promise<void> {
    const { type, data } = operation;

    switch (type) {
      case 'CREATE':
        await inventoryService.createItem(data);
        break;
      case 'UPDATE':
        await inventoryService.updateItem(data.id, data);
        break;
      case 'DELETE':
        await inventoryService.deleteItem(data.id);
        break;
      default:
        throw new Error(`Unknown operation type for inventory item: ${type}`);
    }
  }

  // Sync stock transaction operations
  private async syncStockTransaction(operation: SyncOperation): Promise<void> {
    const { type, data } = operation;

    switch (type) {
      case 'STOCK_TRANSACTION':
        await inventoryService.addStockTransaction(data);
        break;
      default:
        throw new Error(
          `Unknown operation type for stock transaction: ${type}`
        );
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      pendingOperations: this.syncQueue.length,
      failedOperations: this.syncQueue.filter(op => op.status === 'failed')
        .length,
      lastSyncTime: useOfflineStore.getState().lastSyncTime,
      isOnline: navigator.onLine,
    };
  }

  // Force sync now
  async forceSyncNow(): Promise<SyncResult> {
    console.log('🔴 Force sync requested');
    return await this.performSync();
  }

  // Clear sync queue (admin only)
  clearSyncQueue() {
    this.syncQueue = [];
    this.saveSyncQueue();
    useOfflineStore.getState().setPendingOperations(0);

    console.log('🗑️ Sync queue cleared');

    useNotificationStore.getState().addNotification({
      type: 'info',
      title: 'Sync Queue Cleared',
      message: 'All pending sync operations have been removed',
    });
  }

  // Get sync queue for debugging
  getSyncQueue(): SyncOperation[] {
    return [...this.syncQueue];
  }

  // Retry failed operations
  async retryFailedOperations(): Promise<SyncResult> {
    const failedOps = this.syncQueue.filter(op => op.status === 'failed');

    if (failedOps.length === 0) {
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    console.log(`🔄 Retrying ${failedOps.length} failed operations`);

    // Reset failed operations to pending
    failedOps.forEach(op => {
      op.status = 'pending';
      op.retryCount = 0;
      op.error = undefined;
    });

    this.saveSyncQueue();

    return await this.performSync();
  }

  // Sync specific inventory item by ID
  async syncInventoryItemById(itemId: string): Promise<void> {
    try {
      const item = await inventoryService.getItemById(itemId);
      this.addToSyncQueue('UPDATE', 'inventory_item', item);
    } catch (error) {
      console.error('Failed to sync inventory item:', error);
      throw error;
    }
  }

  // Bulk sync multiple items
  async bulkSyncInventoryItems(itemIds: string[]): Promise<void> {
    for (const itemId of itemIds) {
      try {
        await this.syncInventoryItemById(itemId);
      } catch (error) {
        console.error(`Failed to queue sync for item ${itemId}:`, error);
      }
    }
  }

  // Get sync statistics
  getSyncStatistics() {
    const operations = this.syncQueue;
    const stats = {
      total: operations.length,
      pending: operations.filter(op => op.status === 'pending').length,
      syncing: operations.filter(op => op.status === 'syncing').length,
      failed: operations.filter(op => op.status === 'failed').length,
      byType: {} as Record<string, number>,
      byEntity: {} as Record<string, number>,
      oldestOperation: operations.length > 0 ? operations[0].timestamp : null,
      newestOperation:
        operations.length > 0
          ? operations[operations.length - 1].timestamp
          : null,
    };

    operations.forEach(op => {
      stats.byType[op.type] = (stats.byType[op.type] || 0) + 1;
      stats.byEntity[op.entity] = (stats.byEntity[op.entity] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const inventorySyncService = new InventorySyncService();
