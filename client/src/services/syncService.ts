import { offlineStorage } from './offlineStorageService';
import { useOfflineStore } from '../store/offlineStore';
import { useNotificationStore } from '../store/notificationStore';
import { ApiResponse, SyncOperation } from '../types';

export class SyncService {
  private apiBaseUrl: string;
  private isRunning: boolean = false;
  private syncInterval: number = 5 * 60 * 1000; // 5 minutes
  private maxRetries: number = 3;

  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  // Start automatic sync service
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.scheduleNextSync();
    console.log('🔄 Sync service started');
  }

  // Stop automatic sync service
  stop(): void {
    this.isRunning = false;
    console.log('⏸️ Sync service stopped');
  }

  // Schedule the next sync
  private scheduleNextSync(): void {
    if (!this.isRunning) return;

    setTimeout(() => {
      if (this.isRunning && navigator.onLine) {
        this.performSync().finally(() => {
          this.scheduleNextSync();
        });
      } else {
        this.scheduleNextSync();
      }
    }, this.syncInterval);
  }

  // Perform full sync operation
  async performSync(): Promise<void> {
    const {
      isOnline,
      setSyncStatus,
      updateLastSyncTime,
      setPendingOperations,
    } = useOfflineStore.getState();
    const { addNotification } = useNotificationStore.getState();

    if (!isOnline) {
      console.log('⚠️ Cannot sync: offline');
      return;
    }

    try {
      setSyncStatus(true);
      console.log('🔄 Starting sync...');

      // Get pending operations
      const pendingOps = await offlineStorage.getPendingSyncOperations();
      setPendingOperations(pendingOps.length);

      if (pendingOps.length === 0) {
        console.log('✅ No pending operations to sync');
        updateLastSyncTime();
        setSyncStatus(false);
        return;
      }

      // Process operations in batches
      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < pendingOps.length; i += batchSize) {
        const batch = pendingOps.slice(i, i + batchSize);
        const results = await this.processSyncBatch(batch);

        successCount += results.successCount;
        errorCount += results.errorCount;
      }

      // Update sync status
      const remainingOps = await offlineStorage.getSyncQueueCount();
      setPendingOperations(remainingOps);

      if (errorCount === 0) {
        updateLastSyncTime();
        addNotification({
          type: 'success',
          title: 'Sync Complete',
          message: `Successfully synced ${successCount} operations`,
        });
      } else {
        addNotification({
          type: 'warning',
          title: 'Sync Partial',
          message: `Synced ${successCount} operations, ${errorCount} failed`,
        });
      }

      console.log(
        `✅ Sync completed: ${successCount} success, ${errorCount} errors`
      );
    } catch (error) {
      console.error('❌ Sync failed:', error);
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Failed to sync data with server',
      });
    } finally {
      setSyncStatus(false);
    }
  }

  // Process a batch of sync operations
  private async processSyncBatch(operations: SyncOperation[]): Promise<{
    successCount: number;
    errorCount: number;
  }> {
    let successCount = 0;
    let errorCount = 0;

    for (const operation of operations) {
      try {
        await this.processSyncOperation(operation);
        await offlineStorage.markSyncOperationCompleted(operation.id);
        successCount++;
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
        await offlineStorage.markSyncOperationFailed(
          operation.id,
          error instanceof Error ? error.message : 'Unknown error'
        );
        errorCount++;
      }
    }

    return { successCount, errorCount };
  }

  // Process individual sync operation
  private async processSyncOperation(operation: SyncOperation): Promise<void> {
    const { type, entity, entityId, data } = operation;

    let endpoint = this.getEndpointForTable(entity);
    let method: string;
    let url: string;
    let body: any;

    switch (type) {
      case 'upload':
        method = 'POST';
        url = `${this.apiBaseUrl}/api/${endpoint}`;
        body = data;
        break;

      case 'download':
        method = 'GET';
        url = `${this.apiBaseUrl}/api/${endpoint}`;
        body = null;
        break;

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    const response = await this.makeApiRequest(method, url, body);

    if (!response.success) {
      throw new Error(response.error || 'API request failed');
    }

    // Update local record with server response if needed
    if (type === 'upload' && response.data?.id) {
      await this.updateLocalRecordId(entity, entityId, response.data.id);
    }
  }

  // Get API endpoint for table name
  private getEndpointForTable(tableName: string): string {
    const endpointMap: Record<string, string> = {
      orders: 'orders',
      order_items: 'orders', // Order items are handled with orders
      products: 'products',
      categories: 'products/categories',
      inventory_items: 'inventory',
      payments: 'payments',
      settings: 'settings',
    };

    return endpointMap[tableName] || tableName;
  }

  // Make API request with authentication
  private async makeApiRequest(
    method: string,
    url: string,
    body?: any
  ): Promise<ApiResponse> {
    const token = localStorage.getItem('auth-token'); // Adjust based on your auth storage

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Update local record with server-generated ID
  private async updateLocalRecordId(
    tableName: string,
    localId: string,
    serverId: string
  ): Promise<void> {
    // This is a simplified implementation
    // In a real app, you'd need more sophisticated ID mapping
    console.log(`Updated ${tableName} record ${localId} -> ${serverId}`);
  }

  // Download fresh data from server
  async downloadFreshData(): Promise<void> {
    const { setSyncStatus } = useOfflineStore.getState();
    const { addNotification } = useNotificationStore.getState();

    try {
      setSyncStatus(true);
      console.log('📥 Downloading fresh data...');

      // Download data in parallel
      const [
        productsResponse,
        categoriesResponse,
        inventoryResponse,
        settingsResponse,
      ] = await Promise.all([
        this.makeApiRequest('GET', `${this.apiBaseUrl}/api/products`),
        this.makeApiRequest(
          'GET',
          `${this.apiBaseUrl}/api/products/categories`
        ),
        this.makeApiRequest('GET', `${this.apiBaseUrl}/api/inventory`),
        this.makeApiRequest('GET', `${this.apiBaseUrl}/api/settings`),
      ]);

      // Update offline storage
      if (productsResponse.success && productsResponse.data) {
        await offlineStorage.syncProducts(productsResponse.data);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        await offlineStorage.syncCategories(categoriesResponse.data);
      }

      if (inventoryResponse.success && inventoryResponse.data) {
        await offlineStorage.syncInventoryItems(inventoryResponse.data);
      }

      if (settingsResponse.success && settingsResponse.data) {
        await offlineStorage.syncSettings(settingsResponse.data);
      }

      addNotification({
        type: 'success',
        title: 'Data Updated',
        message: 'Fresh data downloaded from server',
      });

      console.log('✅ Fresh data download completed');
    } catch (error) {
      console.error('❌ Failed to download fresh data:', error);
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download fresh data from server',
      });
    } finally {
      setSyncStatus(false);
    }
  }

  // Force immediate sync
  async forcSync(): Promise<void> {
    if (!navigator.onLine) {
      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'warning',
        title: 'Offline',
        message: 'Cannot sync while offline',
      });
      return;
    }

    await this.performSync();
  }

  // Check server connectivity
  async checkServerConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/health`, {
        method: 'GET',
        cache: 'no-cache',
      });
      return response.ok;
    } catch (error) {
      console.warn('Server connectivity check failed:', error);
      return false;
    }
  }

  // Get sync statistics
  async getSyncStats(): Promise<{
    pendingOperations: number;
    lastSyncTime: string | null;
    queueSize: number;
  }> {
    const pendingOperations = await offlineStorage.getSyncQueueCount();
    const { lastSyncTime } = useOfflineStore.getState();

    return {
      pendingOperations,
      lastSyncTime,
      queueSize: pendingOperations,
    };
  }

  // Retry failed operations
  async retryFailedOperations(): Promise<void> {
    const failedOps = await offlineStorage.getFailedSyncOperations(
      this.maxRetries
    );

    if (failedOps.length === 0) {
      console.log('No failed operations to retry');
      return;
    }

    console.log(`🔄 Retrying ${failedOps.length} failed operations...`);

    // Reset status to pending for retry
    for (const op of failedOps) {
      await offlineStorage.updateSyncOperationStatus(op.id, {
        status: 'pending',
        error_message: undefined,
      });
    }

    // Trigger sync
    await this.performSync();
  }

  // Clean up old completed operations
  async cleanupOldOperations(olderThanDays = 7): Promise<void> {
    await offlineStorage.cleanupCompletedSyncOperations(olderThanDays);
    console.log(
      `🧹 Cleaned up sync operations older than ${olderThanDays} days`
    );
  }
}

// Export singleton instance
export const syncService = new SyncService();

// Auto-start sync service when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Back online - starting sync service');
    syncService.start();
    syncService.forcSync();
  });

  window.addEventListener('offline', () => {
    console.log('📵 Gone offline - stopping sync service');
    syncService.stop();
  });

  // Start immediately if online
  if (navigator.onLine) {
    syncService.start();
  }
}
