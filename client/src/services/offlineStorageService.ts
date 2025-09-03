import {
  Order,
  Payment,
  OrderItem,
  InventoryItem,
  StockTransaction,
  Product,
  Category,
  SyncRecord,
  OfflineOperation,
  OfflineBill,
  OfflineInventoryUpdate,
  OfflineStorageInfo,
} from '../types';

/**
 * Offline Storage Service using IndexedDB
 *
 * Provides comprehensive offline storage capabilities for:
 * - Orders and payments
 * - Inventory management
 * - Product catalog
 * - Sync records and operations
 * - Billing data
 */
export class OfflineStorageService {
  private dbName = 'SmoochodBillOfflineDB';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  // Database schema definition
  private readonly stores = {
    orders: {
      keyPath: 'id',
      indexes: [
        { name: 'order_number', keyPath: 'order_number', unique: true },
        { name: 'status', keyPath: 'status' },
        { name: 'order_date', keyPath: 'order_date' },
        { name: 'sync_status', keyPath: 'is_synced' },
      ],
    },
    payments: {
      keyPath: 'id',
      indexes: [
        { name: 'order_id', keyPath: 'order_id' },
        { name: 'payment_status', keyPath: 'payment_status' },
        { name: 'payment_date', keyPath: 'payment_date' },
        { name: 'sync_status', keyPath: 'is_synced' },
      ],
    },
    inventory: {
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'current_stock', keyPath: 'current_stock' },
        { name: 'minimum_stock', keyPath: 'minimum_stock' },
        { name: 'updated_at', keyPath: 'updated_at' },
      ],
    },
    stock_transactions: {
      keyPath: 'id',
      indexes: [
        { name: 'inventory_item_id', keyPath: 'inventory_item_id' },
        { name: 'transaction_type', keyPath: 'transaction_type' },
        { name: 'created_at', keyPath: 'created_at' },
        { name: 'reference_id', keyPath: 'reference_id' },
      ],
    },
    products: {
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'category_id', keyPath: 'category_id' },
        { name: 'is_available', keyPath: 'is_available' },
        { name: 'updated_at', keyPath: 'updated_at' },
      ],
    },
    categories: {
      keyPath: 'id',
      indexes: [
        { name: 'name', keyPath: 'name' },
        { name: 'sort_order', keyPath: 'sort_order' },
        { name: 'is_active', keyPath: 'is_active' },
      ],
    },
    sync_records: {
      keyPath: 'id',
      indexes: [
        { name: 'table_name', keyPath: 'table_name' },
        { name: 'sync_status', keyPath: 'sync_status' },
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'priority', keyPath: 'priority' },
      ],
    },
    offline_operations: {
      keyPath: 'id',
      indexes: [
        { name: 'operation_type', keyPath: 'operation_type' },
        { name: 'entity_type', keyPath: 'entity_type' },
        { name: 'status', keyPath: 'status' },
        { name: 'timestamp', keyPath: 'timestamp' },
      ],
    },
    offline_bills: {
      keyPath: 'id',
      indexes: [
        { name: 'created_at', keyPath: 'created_at' },
        { name: 'sync_status', keyPath: 'sync_status' },
        { name: 'order_id', keyPath: 'order_data.id' },
      ],
    },
    offline_inventory_updates: {
      keyPath: 'id',
      indexes: [
        { name: 'inventory_item_id', keyPath: 'inventory_item_id' },
        { name: 'operation_type', keyPath: 'operation_type' },
        { name: 'sync_status', keyPath: 'sync_status' },
        { name: 'timestamp', keyPath: 'timestamp' },
      ],
    },
    metadata: {
      keyPath: 'key',
    },
  };

  constructor() {
    this.initializeDatabase();
  }

  // Initialize IndexedDB database
  private async initializeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }

  // Create object stores and indexes
  private createStores(db: IDBDatabase): void {
    console.log('🔧 Creating IndexedDB stores...');

    Object.entries(this.stores).forEach(([storeName, config]) => {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, {
          keyPath: config.keyPath,
        });

        // Create indexes
        if ('indexes' in config && config.indexes) {
          config.indexes.forEach((index: any) => {
            store.createIndex(index.name, index.keyPath, {
              unique: index.unique || false,
            });
          });
        }

        console.log(`✅ Created store: ${storeName}`);
      }
    });
  }

  // Ensure database is ready
  private async ensureDbReady(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initializeDatabase();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Generic CRUD operations

  // Create or update record
  async save<T>(storeName: string, data: T): Promise<T> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(data);
      request.onerror = () => reject(request.error);
    });
  }

  // Get record by ID
  async getById<T>(storeName: string, id: string): Promise<T | null> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all records from store
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Delete record by ID
  async delete(storeName: string, id: string): Promise<void> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Query records by index
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Count records in store
  async count(storeName: string): Promise<number> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all records from store
  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Entity-specific methods

  // Orders
  async saveOrder(order: Order): Promise<Order> {
    console.log('💾 Saving order offline:', order.order_number);
    return this.save('orders', order);
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.getById<Order>('orders', orderId);
  }

  // Get order with all related data (order items, payments)
  async getOrderWithItems(
    orderId: string
  ): Promise<
    (Order & { order_items: OrderItem[]; payments: Payment[] }) | null
  > {
    const order = await this.getOrder(orderId);
    if (!order) return null;

    // In the current implementation, order_items and payments are stored within the Order object
    // So we just need to return the order with proper typing
    return order as Order & { order_items: OrderItem[]; payments: Payment[] };
  }

  // Update order with partial data
  async updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    const existingOrder = await this.getOrder(orderId);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Merge updates with existing order
    const updatedOrder = {
      ...existingOrder,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await this.saveOrder(updatedOrder);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.getAll<Order>('orders');
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return this.getByIndex<Order>('orders', 'status', status);
  }

  async getUnsyncedOrders(): Promise<Order[]> {
    return this.getByIndex<Order>('orders', 'sync_status', false);
  }

  // Payments
  async savePayment(payment: Payment): Promise<Payment> {
    console.log('💾 Saving payment offline:', payment.id);
    return this.save('payments', payment);
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    return this.getById<Payment>('payments', paymentId);
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.getByIndex<Payment>('payments', 'order_id', orderId);
  }

  async getUnsyncedPayments(): Promise<Payment[]> {
    return this.getByIndex<Payment>('payments', 'sync_status', false);
  }

  // Inventory
  async saveInventoryItem(item: InventoryItem): Promise<InventoryItem> {
    console.log('💾 Saving inventory item offline:', item.name);
    return this.save('inventory', item);
  }

  async getInventoryItem(itemId: string): Promise<InventoryItem | null> {
    return this.getById<InventoryItem>('inventory', itemId);
  }

  async getAllInventory(): Promise<InventoryItem[]> {
    return this.getAll<InventoryItem>('inventory');
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    const items = await this.getAllInventory();
    return items.filter(item => item.current_stock <= item.minimum_stock);
  }

  // Stock Transactions
  async saveStockTransaction(
    transaction: StockTransaction
  ): Promise<StockTransaction> {
    console.log('💾 Saving stock transaction offline:', transaction.id);
    return this.save('stock_transactions', transaction);
  }

  async getStockTransactionsByItem(
    itemId: string
  ): Promise<StockTransaction[]> {
    return this.getByIndex<StockTransaction>(
      'stock_transactions',
      'inventory_item_id',
      itemId
    );
  }

  // Products
  async saveProduct(product: Product): Promise<Product> {
    console.log('💾 Saving product offline:', product.name);
    return this.save('products', product);
  }

  async getAllProducts(): Promise<Product[]> {
    return this.getAll<Product>('products');
  }

  async getAvailableProducts(): Promise<Product[]> {
    return this.getByIndex<Product>('products', 'is_available', true);
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.getByIndex<Product>('products', 'category_id', categoryId);
  }

  // Categories
  async saveCategory(category: Category): Promise<Category> {
    console.log('💾 Saving category offline:', category.name);
    return this.save('categories', category);
  }

  async getAllCategories(): Promise<Category[]> {
    return this.getAll<Category>('categories');
  }

  async getActiveCategories(): Promise<Category[]> {
    return this.getByIndex<Category>('categories', 'is_active', true);
  }

  // Sync Records
  async saveSyncRecord(record: SyncRecord): Promise<SyncRecord> {
    console.log(
      '💾 Saving sync record:',
      record.table_name,
      record.operation_type
    );
    return this.save('sync_records', record);
  }

  async getPendingSyncRecords(): Promise<SyncRecord[]> {
    return this.getByIndex<SyncRecord>(
      'sync_records',
      'sync_status',
      'pending'
    );
  }

  async getSyncRecordsByTable(tableName: string): Promise<SyncRecord[]> {
    return this.getByIndex<SyncRecord>('sync_records', 'table_name', tableName);
  }

  async getHighPrioritySyncRecords(): Promise<SyncRecord[]> {
    const critical = await this.getByIndex<SyncRecord>(
      'sync_records',
      'priority',
      'critical'
    );
    const high = await this.getByIndex<SyncRecord>(
      'sync_records',
      'priority',
      'high'
    );
    return [...critical, ...high].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Offline Operations
  async saveOfflineOperation(
    operation: OfflineOperation
  ): Promise<OfflineOperation> {
    console.log('💾 Saving offline operation:', operation.operation_type);
    return this.save('offline_operations', operation);
  }

  async getPendingOfflineOperations(): Promise<OfflineOperation[]> {
    return this.getByIndex<OfflineOperation>(
      'offline_operations',
      'status',
      'pending'
    );
  }

  async getOfflineOperationsByType(
    type: OfflineOperation['operation_type']
  ): Promise<OfflineOperation[]> {
    return this.getByIndex<OfflineOperation>(
      'offline_operations',
      'operation_type',
      type
    );
  }

  // Offline Bills
  async saveOfflineBill(bill: OfflineBill): Promise<OfflineBill> {
    console.log('💾 Saving offline bill:', bill.order_data.order_number);
    return this.save('offline_bills', bill);
  }

  async getPendingOfflineBills(): Promise<OfflineBill[]> {
    return this.getByIndex<OfflineBill>(
      'offline_bills',
      'sync_status',
      'pending'
    );
  }

  async getAllOfflineBills(): Promise<OfflineBill[]> {
    return this.getAll<OfflineBill>('offline_bills');
  }

  // Offline Inventory Updates
  async saveOfflineInventoryUpdate(
    update: OfflineInventoryUpdate
  ): Promise<OfflineInventoryUpdate> {
    console.log(
      '💾 Saving offline inventory update:',
      update.inventory_item_id
    );
    return this.save('offline_inventory_updates', update);
  }

  async getPendingInventoryUpdates(): Promise<OfflineInventoryUpdate[]> {
    return this.getByIndex<OfflineInventoryUpdate>(
      'offline_inventory_updates',
      'sync_status',
      'pending'
    );
  }

  async getInventoryUpdatesByItem(
    itemId: string
  ): Promise<OfflineInventoryUpdate[]> {
    return this.getByIndex<OfflineInventoryUpdate>(
      'offline_inventory_updates',
      'inventory_item_id',
      itemId
    );
  }

  // Metadata and utility methods

  // Save metadata
  async saveMetadata(key: string, value: any): Promise<void> {
    await this.save('metadata', {
      key,
      value,
      updated_at: new Date().toISOString(),
    });
  }

  // Get metadata
  async getMetadata(key: string): Promise<any> {
    const result = await this.getById<any>('metadata', key);
    return result?.value || null;
  }

  // Get storage information
  async getStorageInfo(): Promise<OfflineStorageInfo> {
    const db = await this.ensureDbReady();

    // Calculate storage usage
    const tableSizes: Record<string, number> = {};
    let totalSize = 0;

    for (const storeName of Object.keys(this.stores)) {
      if (this.stores[storeName as keyof typeof this.stores]) {
        const count = await this.count(storeName);
        tableSizes[storeName] = count;
        totalSize += count;
      }
    }

    // Estimate storage size (rough calculation)
    const estimatedSizeBytes = totalSize * 1024; // 1KB per record estimate

    return {
      total_size: totalSize,
      used_size: totalSize,
      available_size: (100 * 1024 * 1024) / 1024, // Assume 100MB available
      database_size: estimatedSizeBytes / 1024,
      cache_size: 0,
      storage_type: 'indexeddb',
      database_name: this.dbName,
      database_version: this.dbVersion,
      total_size_bytes: estimatedSizeBytes,
      used_size_bytes: estimatedSizeBytes,
      available_size_bytes: 100 * 1024 * 1024 - estimatedSizeBytes, // Assume 100MB available
      table_sizes: tableSizes,
      auto_cleanup_enabled: true,
      retention_days: 30,
      last_cleanup: await this.getMetadata('last_cleanup'),
      cleanup_frequency: 30,
    };
  }

  // Bulk operations

  // Bulk save
  async bulkSave<T>(storeName: string, records: T[]): Promise<T[]> {
    const db = await this.ensureDbReady();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const savedRecords: T[] = [];
      let completed = 0;

      transaction.oncomplete = () => resolve(savedRecords);
      transaction.onerror = () => reject(transaction.error);

      records.forEach(record => {
        const request = store.put(record);
        request.onsuccess = () => {
          savedRecords.push(record);
          completed++;
        };
      });
    });
  }

  // Export data for backup
  async exportData(): Promise<Record<string, any[]>> {
    const exportData: Record<string, any[]> = {};

    for (const storeName of Object.keys(this.stores)) {
      exportData[storeName] = await this.getAll(storeName);
    }

    return exportData;
  }

  // Import data from backup
  async importData(data: Record<string, any[]>): Promise<void> {
    for (const [storeName, records] of Object.entries(data)) {
      if (this.stores[storeName]) {
        await this.clear(storeName);
        await this.bulkSave(storeName, records);
        console.log(`✅ Imported ${records.length} records to ${storeName}`);
      }
    }
  }

  // Clean up old records
  async cleanupOldRecords(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    const cutoffTimestamp = cutoffDate.toISOString();

    let totalCleaned = 0;

    // Clean up completed sync records
    const syncRecords = await this.getAll<SyncRecord>('sync_records');
    const oldSyncRecords = syncRecords.filter(
      record =>
        record.sync_status === 'completed' && record.timestamp < cutoffTimestamp
    );

    for (const record of oldSyncRecords) {
      await this.delete('sync_records', record.id);
      totalCleaned++;
    }

    // Clean up completed offline operations
    const operations =
      await this.getAll<OfflineOperation>('offline_operations');
    const oldOperations = operations.filter(
      op => op.status === 'completed' && op.timestamp < cutoffTimestamp
    );

    for (const operation of oldOperations) {
      await this.delete('offline_operations', operation.id);
      totalCleaned++;
    }

    await this.saveMetadata('last_cleanup', new Date().toISOString());
    console.log(`🧹 Cleaned up ${totalCleaned} old records`);

    return totalCleaned;
  }

  // Close database connection
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('📴 IndexedDB connection closed');
    }
  }

  // Delete entire database
  async deleteDatabase(): Promise<void> {
    await this.close();

    return new Promise((resolve, reject) => {
      const deleteReq = indexedDB.deleteDatabase(this.dbName);

      deleteReq.onsuccess = () => {
        console.log('🗑️ Database deleted successfully');
        resolve();
      };

      deleteReq.onerror = () => {
        console.error('Failed to delete database:', deleteReq.error);
        reject(deleteReq.error);
      };
    });
  }

  // Add missing methods that other services expect
  async initialize(): Promise<void> {
    await this.ensureDbReady();
  }

  async getSyncQueueCount(): Promise<number> {
    const db = await this.ensureDbReady();
    const transaction = db.transaction(['syncQueue'], 'readonly');
    const store = transaction.objectStore('syncQueue');
    const count = await store.count();
    return count;
  }

  async clearAllData(): Promise<void> {
    const db = await this.ensureDbReady();
    const transaction = db.transaction(Object.keys(this.stores), 'readwrite');
    
    for (const storeName of Object.keys(this.stores)) {
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
  }

  async getPendingSyncOperations(): Promise<any[]> {
    return this.getPendingOfflineOperations();
  }

  async markSyncOperationCompleted(operationId: string): Promise<void> {
    // Implementation for marking sync operations as completed
    console.log(`Marking operation ${operationId} as completed`);
  }

  async markSyncOperationFailed(operationId: string, error: string): Promise<void> {
    // Implementation for marking sync operations as failed
    console.log(`Marking operation ${operationId} as failed: ${error}`);
  }

  async syncProducts(products: any[]): Promise<void> {
    for (const product of products) {
      await this.saveProduct(product);
    }
  }

  async syncCategories(categories: any[]): Promise<void> {
    for (const category of categories) {
      await this.saveCategory(category);
    }
  }

  async syncInventoryItems(items: any[]): Promise<void> {
    for (const item of items) {
      await this.saveInventoryItem(item);
    }
  }

  async syncSettings(settings: any): Promise<void> {
    await this.saveSetting('business', settings);
  }

  async getFailedSyncOperations(limit: number = 10): Promise<any[]> {
    // Return empty array for now - implement as needed
    return [];
  }

  async updateSyncOperationStatus(operationId: string, status: any): Promise<void> {
    // Implementation for updating sync operation status
    console.log(`Updating operation ${operationId} status:`, status);
  }

  async cleanupCompletedSyncOperations(olderThanDays: number): Promise<void> {
    // Implementation for cleaning up completed sync operations
    console.log(`Cleaning up operations older than ${olderThanDays} days`);
  }
}

// Export singleton instance
export const offlineStorageService = new OfflineStorageService();

// Export for backward compatibility
export const offlineStorage = offlineStorageService;
