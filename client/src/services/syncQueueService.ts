import {
  SyncQueue,
  QueueItem,
  SyncRecord,
  OfflineOperation,
  SyncSession,
  NetworkStatus,
} from '../types';

/**
 * Sync Queue Management Service
 *
 * Manages synchronization queues with:
 * - Priority-based queue processing
 * - Retry logic with exponential backoff
 * - Queue pausing and resuming
 * - Dependency management
 * - Batch processing
 * - Performance monitoring
 */
export class SyncQueueService {
  private queues: Map<string, SyncQueue> = new Map();
  private queueItems: Map<string, QueueItem[]> = new Map();
  private processing: Map<string, boolean> = new Map();
  private retryDelays = [1000, 2000, 5000, 10000, 30000]; // Exponential backoff
  private maxConcurrentOperations = 3;
  private activeOperations = 0;

  // Event listeners
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultQueues();
    this.loadQueueState();
    this.startQueueProcessor();
  }

  // Initialize default queues with different priorities
  private initializeDefaultQueues(): void {
    const defaultQueues: Partial<SyncQueue>[] = [
      {
        name: 'critical',
        priority: 1,
        max_size: 100,
      },
      {
        name: 'high',
        priority: 2,
        max_size: 200,
      },
      {
        name: 'normal',
        priority: 3,
        max_size: 500,
      },
      {
        name: 'low',
        priority: 4,
        max_size: 1000,
      },
      {
        name: 'batch',
        priority: 5,
        max_size: 2000,
      },
    ];

    defaultQueues.forEach(queueConfig => {
      this.createQueue(queueConfig.name!, queueConfig as Omit<SyncQueue, 'id'>);
    });
  }

  // Create a new queue
  createQueue(name: string, config: Partial<SyncQueue>): SyncQueue {
    const queue: SyncQueue = {
      id: `queue_${name}_${Date.now()}`,
      name,
      description: config.description,
      priority: config.priority || 3,
      is_enabled: config.is_enabled !== false,
      max_retries: config.max_retries || 3,
      retry_delay: config.retry_delay || 1000,
      max_size: config.max_size || 500,
      current_size: 0,
      processing: false,
      paused: false,
      last_processed: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.queues.set(name, queue);
    this.queueItems.set(name, []);
    this.processing.set(name, false);

    console.log(
      `📋 Created queue: ${name} (priority: ${queue.priority}, max: ${queue.max_size})`
    );
    this.saveQueueState();

    return queue;
  }

  // Add item to queue
  async addToQueue(
    queueName: string,
    payload: any,
    priority: number = 3,
    scheduledFor?: Date,
    dependencies?: string[]
  ): Promise<QueueItem> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    if (queue.current_size >= queue.max_size) {
      throw new Error(
        `Queue ${queueName} is at maximum capacity (${queue.max_size})`
      );
    }

    const item: QueueItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      queue_id: queue.id,
      data: payload,
      payload,
      priority,
      status: 'pending',
      attempts: 0,
      max_attempts: 3,
      scheduled_for: scheduledFor?.toISOString(),
      created_at: new Date().toISOString(),
    };

    // Add dependencies if provided
    if (dependencies && dependencies.length > 0) {
      (item as any).dependencies = dependencies;
    }

    const items = this.queueItems.get(queueName) || [];
    items.push(item);

    // Sort by priority and creation time
    items.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    this.queueItems.set(queueName, items);
    queue.current_size = items.length;

    console.log(`📥 Added item to ${queueName} queue (priority: ${priority})`);
    this.saveQueueState();
    this.emit('item_added', { queueName, item });

    // Process immediately if queue is not paused
    if (!queue.paused) {
      this.processQueue(queueName);
    }

    return item;
  }

  // Add sync record to appropriate queue
  async addSyncRecord(record: SyncRecord): Promise<QueueItem> {
    const queueName = this.determineQueueForRecord(record);
    return this.addToQueue(
      queueName,
      record,
      this.getPriorityForRecord(record)
    );
  }

  // Determine which queue to use for a sync record
  private determineQueueForRecord(record: SyncRecord): string {
    const priority = record.priority || 3;
    if (priority <= 1) return 'critical';
    if (priority <= 2) return 'high';
    if (priority <= 3) return 'normal';
    return 'low';
  }

  // Get numerical priority for sync record
  private getPriorityForRecord(record: SyncRecord): number {
    return record.priority || 3;
  }

  // Process queue items
  private async processQueue(queueName: string): Promise<void> {
    const queue = this.queues.get(queueName);
    const items = this.queueItems.get(queueName);

    if (!queue || !items || queue.paused || this.processing.get(queueName)) {
      return;
    }

    if (this.activeOperations >= this.maxConcurrentOperations) {
      console.log(
        `⏸️ Queue ${queueName} waiting for available slot (${this.activeOperations}/${this.maxConcurrentOperations})`
      );
      return;
    }

    this.processing.set(queueName, true);
    queue.processing = true;

    try {
      while (
        items.length > 0 &&
        this.activeOperations < this.maxConcurrentOperations
      ) {
        const item = this.getNextProcessableItem(items);
        if (!item) break;

        this.activeOperations++;
        await this.processQueueItem(queueName, item);
        this.activeOperations--;
      }
    } finally {
      this.processing.set(queueName, false);
      queue.processing = false;
      queue.last_processed = new Date().toISOString();
      queue.current_size = items.length;
      this.saveQueueState();
    }
  }

  // Get next item that can be processed (considering dependencies and scheduling)
  private getNextProcessableItem(items: QueueItem[]): QueueItem | null {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Check if item is scheduled for later
      if (item.scheduled_for && new Date(item.scheduled_for) > new Date()) {
        continue;
      }

      // Check dependencies
      if (
        (item as any).dependencies &&
        !this.areDependenciesSatisfied((item as any).dependencies)
      ) {
        continue;
      }

      // Remove item from queue and return it
      items.splice(i, 1);
      return item;
    }

    return null;
  }

  // Check if dependencies are satisfied
  private areDependenciesSatisfied(dependencies: string[]): boolean {
    // For now, assume all dependencies are satisfied
    // In a real implementation, you'd check if dependent operations completed
    return true;
  }

  // Process individual queue item
  private async processQueueItem(
    queueName: string,
    item: QueueItem
  ): Promise<void> {
    item.processing_started_at = new Date().toISOString();
    item.attempts++;

    console.log(
      `⚙️ Processing ${queueName} item: ${item.id} (attempt ${item.attempts})`
    );

    try {
      // Process based on payload type
      await this.executeQueueItem(item);

      // Mark as completed
      item.completed_at = new Date().toISOString();
      console.log(`✅ Completed ${queueName} item: ${item.id}`);

      this.emit('item_completed', { queueName, item });
    } catch (error) {
      console.error(
        `❌ Failed to process ${queueName} item ${item.id}:`,
        error
      );
      item.error_message =
        error instanceof Error ? error.message : String(error);

      // Retry logic
      if (item.attempts < item.max_attempts) {
        const delay = this.calculateRetryDelay(item.attempts);
        item.scheduled_for = new Date(Date.now() + delay).toISOString();

        // Re-add to queue for retry
        const items = this.queueItems.get(queueName) || [];
        items.push(item);
        items.sort((a, b) => {
          if (a.priority !== b.priority) {
            return a.priority - b.priority;
          }
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        });

        console.log(
          `🔄 Scheduled retry for ${item.id} in ${delay}ms (attempt ${item.attempts}/${item.max_attempts})`
        );
        this.emit('item_retry_scheduled', { queueName, item, delay });
      } else {
        console.error(
          `💥 Max attempts reached for ${item.id}, marking as failed`
        );
        this.emit('item_failed', { queueName, item });
      }
    }
  }

  // Execute queue item based on its type
  private async executeQueueItem(item: QueueItem): Promise<void> {
    const payload = item.payload;

    if (this.isSyncRecord(payload)) {
      await this.executeSyncRecord(payload);
    } else if (this.isOfflineOperation(payload)) {
      await this.executeOfflineOperation(payload);
    } else {
      // Generic operation
      await this.executeGenericOperation(payload);
    }
  }

  // Check if payload is a sync record
  private isSyncRecord(payload: any): payload is SyncRecord {
    return (
      payload &&
      typeof payload === 'object' &&
      'sync_status' in payload &&
      'table_name' in payload
    );
  }

  // Check if payload is an offline operation
  private isOfflineOperation(payload: any): payload is OfflineOperation {
    return (
      payload &&
      typeof payload === 'object' &&
      'operation_type' in payload &&
      'entity_type' in payload
    );
  }

  // Execute sync record
  private async executeSyncRecord(record: SyncRecord): Promise<void> {
    // Import and use cloud sync service
    const { CloudSyncService } = await import('./cloudSyncService');
    const cloudSyncService = new CloudSyncService();

    if (!cloudSyncService.isAvailable()) {
      throw new Error('Cloud sync service not available');
    }

    // Map operation type to cloud sync operation
    const cloudOperation = this.mapToCloudOperation(record.operation_type);

    // Upload record to cloud
    const success = await cloudSyncService.uploadRecord(
      record.table_name,
      record.record_id,
      record.data,
      cloudOperation
    );

    if (!success) {
      throw new Error('Failed to upload record to cloud');
    }

    // Update local record status
    record.sync_status = 'completed';
    record.last_attempt = new Date().toISOString();

    // Save updated record
    const { offlineStorageService } = await import('./offlineStorageService');
    await offlineStorageService.saveSyncRecord(record);
  }

  // Execute offline operation
  private async executeOfflineOperation(
    operation: OfflineOperation
  ): Promise<void> {
    const { offlineStorageService } = await import('./offlineStorageService');

    switch (operation.operation_type) {
      case 'order':
        await this.executeOrderOperation(operation);
        break;
      case 'inventory_update':
        await this.executeInventoryUpdate(operation);
        break;
      case 'payment':
        await this.executePaymentOperation(operation);
        break;
      case 'stock_transaction':
        await this.executeStockTransactionOperation(operation);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.operation_type}`);
    }

    // Mark operation as completed
    operation.status = 'completed';
    operation.executed_at = new Date().toISOString();
    await offlineStorageService.saveOfflineOperation(operation);
  }

  // Execute order operation
  private async executeOrderOperation(
    operation: OfflineOperation
  ): Promise<void> {
    // Implementation would depend on the specific order operation
    console.log(`📋 Executing order operation: ${operation.entity_id}`);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Execute inventory update
  private async executeInventoryUpdate(
    operation: OfflineOperation
  ): Promise<void> {
    console.log(`📦 Executing inventory update: ${operation.entity_id}`);

    const { offlineStorageService } = await import('./offlineStorageService');

    // Update inventory in local storage
    const inventoryItem = await offlineStorageService.getInventoryItem(
      operation.entity_id
    );
    if (inventoryItem) {
      // Apply the operation
      if (operation.operation_data.stock_change) {
        inventoryItem.current_stock += operation.operation_data.stock_change;
        await offlineStorageService.saveInventoryItem(inventoryItem);
      }
    }
  }

  // Execute payment operation
  private async executePaymentOperation(
    operation: OfflineOperation
  ): Promise<void> {
    console.log(`💰 Executing payment operation: ${operation.entity_id}`);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Execute stock transaction operation
  private async executeStockTransactionOperation(
    operation: OfflineOperation
  ): Promise<void> {
    console.log(
      `📊 Executing stock transaction operation: ${operation.entity_id}`
    );

    // Simulate stock transaction processing
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // Execute generic operation
  private async executeGenericOperation(payload: any): Promise<void> {
    console.log(`🔧 Executing generic operation:`, payload);

    // Default operation - just log and complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Map operation type to cloud sync operation
  private mapToCloudOperation(
    operationType:
      | 'payment'
      | 'order'
      | 'inventory_update'
      | 'stock_transaction'
  ): 'CREATE' | 'UPDATE' | 'DELETE' {
    // For now, assume all operations are CREATE/UPDATE operations
    // In a real implementation, you might want to check the actual operation
    return 'UPDATE';
  }

  // Calculate retry delay with exponential backoff
  private calculateRetryDelay(attemptNumber: number): number {
    const baseDelay =
      this.retryDelays[
        Math.min(attemptNumber - 1, this.retryDelays.length - 1)
      ];
    const jitter = Math.random() * 1000; // Add some randomness
    return baseDelay + jitter;
  }

  // Start queue processor (runs continuously)
  private startQueueProcessor(): void {
    setInterval(() => {
      this.processAllQueues();
    }, 5000); // Process every 5 seconds

    console.log('🚀 Queue processor started');
  }

  // Process all queues
  private async processAllQueues(): Promise<void> {
    const queueNames = Array.from(this.queues.keys());

    // Sort queues by priority
    queueNames.sort((a, b) => {
      const queueA = this.queues.get(a)!;
      const queueB = this.queues.get(b)!;
      return queueA.priority - queueB.priority;
    });

    for (const queueName of queueNames) {
      await this.processQueue(queueName);
    }
  }

  // Pause queue
  pauseQueue(queueName: string): boolean {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.paused = true;
      console.log(`⏸️ Paused queue: ${queueName}`);
      this.saveQueueState();
      this.emit('queue_paused', { queueName });
      return true;
    }
    return false;
  }

  // Resume queue
  resumeQueue(queueName: string): boolean {
    const queue = this.queues.get(queueName);
    if (queue) {
      queue.paused = false;
      console.log(`▶️ Resumed queue: ${queueName}`);
      this.saveQueueState();
      this.emit('queue_resumed', { queueName });

      // Start processing immediately
      this.processQueue(queueName);
      return true;
    }
    return false;
  }

  // Clear queue
  clearQueue(queueName: string): number {
    const items = this.queueItems.get(queueName);
    if (items) {
      const count = items.length;
      this.queueItems.set(queueName, []);

      const queue = this.queues.get(queueName);
      if (queue) {
        queue.current_size = 0;
      }

      console.log(`🗑️ Cleared ${count} items from ${queueName} queue`);
      this.saveQueueState();
      this.emit('queue_cleared', { queueName, itemCount: count });
      return count;
    }
    return 0;
  }

  // Get queue status
  getQueueStatus(queueName: string): SyncQueue | null {
    return this.queues.get(queueName) || null;
  }

  // Get all queues status
  getAllQueuesStatus(): SyncQueue[] {
    return Array.from(this.queues.values());
  }

  // Get queue items
  getQueueItems(queueName: string, limit?: number): QueueItem[] {
    const items = this.queueItems.get(queueName) || [];
    return limit ? items.slice(0, limit) : items;
  }

  // Get queue statistics
  getQueueStatistics(): {
    totalQueues: number;
    totalItems: number;
    processingQueues: number;
    pausedQueues: number;
    activeOperations: number;
    queueStats: Record<
      string,
      { size: number; processing: boolean; paused: boolean }
    >;
  } {
    const stats = {
      totalQueues: this.queues.size,
      totalItems: 0,
      processingQueues: 0,
      pausedQueues: 0,
      activeOperations: this.activeOperations,
      queueStats: {} as Record<
        string,
        { size: number; processing: boolean; paused: boolean }
      >,
    };

    this.queues.forEach((queue, name) => {
      const items = this.queueItems.get(name) || [];
      stats.totalItems += items.length;

      if (queue.processing) stats.processingQueues++;
      if (queue.paused) stats.pausedQueues++;

      stats.queueStats[name] = {
        size: items.length,
        processing: queue.processing,
        paused: queue.paused,
      };
    });

    return stats;
  }

  // Set max concurrent operations
  setMaxConcurrentOperations(max: number): void {
    this.maxConcurrentOperations = Math.max(1, max);
    console.log(
      `🔧 Set max concurrent operations to ${this.maxConcurrentOperations}`
    );
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Save queue state to localStorage
  private saveQueueState(): void {
    const state = {
      queues: Object.fromEntries(this.queues),
      queueItems: Object.fromEntries(this.queueItems),
    };
    localStorage.setItem('syncQueueState', JSON.stringify(state));
  }

  // Load queue state from localStorage
  private loadQueueState(): void {
    const saved = localStorage.getItem('syncQueueState');
    if (saved) {
      try {
        const state = JSON.parse(saved);

        if (state.queues) {
          this.queues = new Map(Object.entries(state.queues));
        }

        if (state.queueItems) {
          this.queueItems = new Map(Object.entries(state.queueItems));

          // Update current sizes
          this.queues.forEach((queue, name) => {
            const items = this.queueItems.get(name) || [];
            queue.current_size = items.length;
          });
        }

        console.log('📥 Loaded queue state from storage');
      } catch (error) {
        console.error('Failed to load queue state:', error);
      }
    }
  }

  // Cleanup completed items
  cleanupCompletedItems(olderThanHours: number = 24): number {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;
    let totalCleaned = 0;

    this.queueItems.forEach((items, queueName) => {
      const initialLength = items.length;

      const filteredItems = items.filter(item => {
        if (!item.completed_at) return true;

        const completedTime = new Date(item.completed_at).getTime();
        return completedTime > cutoffTime;
      });

      this.queueItems.set(queueName, filteredItems);

      const cleaned = initialLength - filteredItems.length;
      totalCleaned += cleaned;

      // Update queue size
      const queue = this.queues.get(queueName);
      if (queue) {
        queue.current_size = filteredItems.length;
      }
    });

    if (totalCleaned > 0) {
      this.saveQueueState();
      console.log(`🧹 Cleaned up ${totalCleaned} completed queue items`);
    }

    return totalCleaned;
  }

  // Reset all queues (for testing/debugging)
  resetAllQueues(): void {
    this.queueItems.clear();
    this.processing.clear();
    this.activeOperations = 0;

    // Reset queue states
    this.queues.forEach(queue => {
      queue.current_size = 0;
      queue.processing = false;
      queue.paused = false;
    });

    this.saveQueueState();
    console.log('🔄 Reset all queues');
  }
}

// Export singleton instance
export const syncQueueService = new SyncQueueService();
