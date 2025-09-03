import { 
  Order, 
  ExternalOrderMapping, 
  IntegrationSyncLog, 
  ZomatoOrder, 
  SwiggyOrder 
} from '../types';
import { zomatoIntegrationService } from './zomatoIntegrationService';
import { swiggyIntegrationService } from './swiggyIntegrationService';
import { integrationConfigService } from './integrationConfigService';

/**
 * Order Synchronization Service
 * 
 * Coordinates order synchronization between external platforms (Zomato, Swiggy)
 * and the local POS system. Handles:
 * - Automatic order fetching from all platforms
 * - Status updates to external platforms
 * - Conflict resolution
 * - Sync monitoring and logging
 */
export class OrderSyncService {
  private syncTimer?: NodeJS.Timeout;
  private readonly SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes
  private isSyncing = false;
  private syncStats = {
    total_synced: 0,
    today_synced: 0,
    failed_syncs: 0,
    last_sync_time: null as Date | null
  };

  constructor() {
    this.startAutoSync();
    this.loadSyncStats();
  }

  // Start automatic synchronization
  private startAutoSync(): void {
    console.log('🔄 Starting order sync service...');
    
    this.syncTimer = setInterval(async () => {
      if (!this.isSyncing) {
        await this.performFullSync();
      }
    }, this.SYNC_INTERVAL);

    // Initial sync
    setTimeout(() => this.performFullSync(), 5000);
  }

  // Perform full synchronization from all enabled platforms
  async performFullSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('⚠️ Sync already in progress, skipping...');
      return;
    }

    this.isSyncing = true;
    const syncStartTime = new Date();
    let totalProcessed = 0;
    let totalFailed = 0;

    try {
      console.log('🚀 Starting full order synchronization...');

      // Get enabled integrations
      const enabledConfigs = integrationConfigService.getEnabledConfigs()
        .filter(config => config.type === 'order_platform');

      if (enabledConfigs.length === 0) {
        console.log('ℹ️ No order platform integrations enabled');
        return;
      }

      // Sync from each platform
      for (const config of enabledConfigs) {
        try {
          let orders: any[] = [];
          
          switch (config.id) {
            case 'zomato':
              orders = await zomatoIntegrationService.fetchNewOrders();
              break;
            case 'swiggy':
              orders = await swiggyIntegrationService.fetchNewOrders();
              break;
          }

          totalProcessed += orders.length;
          
          // Log sync result
          await this.logSyncOperation({
            integration_id: config.id,
            sync_type: 'orders',
            status: 'success',
            records_processed: orders.length,
            records_failed: 0,
            start_time: syncStartTime,
            end_time: new Date()
          });

        } catch (error) {
          console.error(`🔴 Failed to sync orders from ${config.id}:`, error);
          totalFailed++;
          
          // Log failed sync
          await this.logSyncOperation({
            integration_id: config.id,
            sync_type: 'orders',
            status: 'error',
            records_processed: 0,
            records_failed: 1,
            start_time: syncStartTime,
            end_time: new Date(),
            error_details: error.message
          });
        }
      }

      // Update sync statistics
      this.updateSyncStats(totalProcessed, totalFailed);
      
      console.log(`✅ Sync completed: ${totalProcessed} orders processed, ${totalFailed} failed`);

    } catch (error) {
      console.error('🚨 Full sync operation failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  // Sync orders from specific platform
  async syncFromPlatform(platform: 'zomato' | 'swiggy'): Promise<number> {
    console.log(`📥 Syncing orders from ${platform}...`);
    
    try {
      let orders: any[] = [];
      
      switch (platform) {
        case 'zomato':
          orders = await zomatoIntegrationService.fetchNewOrders();
          break;
        case 'swiggy':
          orders = await swiggyIntegrationService.fetchNewOrders();
          break;
      }

      console.log(`✅ Synced ${orders.length} orders from ${platform}`);
      return orders.length;
      
    } catch (error) {
      console.error(`🔴 Failed to sync from ${platform}:`, error);
      throw error;
    }
  }

  // Update order status on external platform
  async updateExternalOrderStatus(
    localOrderId: string, 
    status: string, 
    platform?: 'zomato' | 'swiggy'
  ): Promise<boolean> {
    try {
      // Find order mapping
      const mapping = await this.findOrderMapping(localOrderId, platform);
      if (!mapping) {
        console.log(`⚠️ No external mapping found for order ${localOrderId}`);
        return false;
      }

      // Map local status to external platform status
      const externalStatus = this.mapLocalStatusToExternal(status, mapping.platform);
      
      // Update status on external platform
      switch (mapping.platform) {
        case 'zomato':
          await zomatoIntegrationService.updateOrderStatus(mapping.external_order_id, externalStatus);
          break;
        case 'swiggy':
          await swiggyIntegrationService.updateOrderStatus(mapping.external_order_id, externalStatus);
          break;
      }

      console.log(`✅ Order ${localOrderId} status updated to ${externalStatus} on ${mapping.platform}`);
      return true;
      
    } catch (error) {
      console.error(`🔴 Failed to update external order status for ${localOrderId}:`, error);
      return false;
    }
  }

  // Accept order on external platform
  async acceptExternalOrder(localOrderId: string, prepTime?: number): Promise<boolean> {
    try {
      const mapping = await this.findOrderMapping(localOrderId);
      if (!mapping) {
        console.log(`⚠️ No external mapping found for order ${localOrderId}`);
        return false;
      }

      switch (mapping.platform) {
        case 'zomato':
          await zomatoIntegrationService.acceptOrder(mapping.external_order_id, prepTime);
          break;
        case 'swiggy':
          await swiggyIntegrationService.acceptOrder(mapping.external_order_id, prepTime);
          break;
      }

      console.log(`✅ Order ${localOrderId} accepted on ${mapping.platform}`);
      return true;
      
    } catch (error) {
      console.error(`🔴 Failed to accept external order ${localOrderId}:`, error);
      return false;
    }
  }

  // Reject order on external platform
  async rejectExternalOrder(localOrderId: string, reason: string): Promise<boolean> {
    try {
      const mapping = await this.findOrderMapping(localOrderId);
      if (!mapping) {
        console.log(`⚠️ No external mapping found for order ${localOrderId}`);
        return false;
      }

      switch (mapping.platform) {
        case 'zomato':
          await zomatoIntegrationService.rejectOrder(mapping.external_order_id, reason);
          break;
        case 'swiggy':
          await swiggyIntegrationService.rejectOrder(mapping.external_order_id, reason);
          break;
      }

      console.log(`❌ Order ${localOrderId} rejected on ${mapping.platform}: ${reason}`);
      return true;
      
    } catch (error) {
      console.error(`🔴 Failed to reject external order ${localOrderId}:`, error);
      return false;
    }
  }

  // Mark food ready on external platform
  async markFoodReady(localOrderId: string): Promise<boolean> {
    try {
      const mapping = await this.findOrderMapping(localOrderId);
      if (!mapping) {
        console.log(`⚠️ No external mapping found for order ${localOrderId}`);
        return false;
      }

      switch (mapping.platform) {
        case 'zomato':
          await zomatoIntegrationService.updateOrderStatus(mapping.external_order_id, 'ready');
          break;
        case 'swiggy':
          await swiggyIntegrationService.markFoodReady(mapping.external_order_id);
          break;
      }

      console.log(`🍽️ Order ${localOrderId} marked as ready on ${mapping.platform}`);
      return true;
      
    } catch (error) {
      console.error(`🔴 Failed to mark food ready for ${localOrderId}:`, error);
      return false;
    }
  }

  // Get all external orders for a date range
  async getExternalOrders(
    startDate: Date, 
    endDate: Date, 
    platform?: 'zomato' | 'swiggy'
  ): Promise<ExternalOrderMapping[]> {
    try {
      // This would query the database for external order mappings
      // Placeholder implementation
      console.log(`📊 Getting external orders from ${startDate} to ${endDate}`);
      return [];
    } catch (error) {
      console.error('🔴 Failed to get external orders:', error);
      throw error;
    }
  }

  // Get sync statistics
  getSyncStatistics(): any {
    return {
      ...this.syncStats,
      is_syncing: this.isSyncing,
      enabled_platforms: integrationConfigService.getEnabledConfigs()
        .filter(config => config.type === 'order_platform')
        .map(config => config.id),
      next_sync_in: this.SYNC_INTERVAL / 1000 // seconds
    };
  }

  // Get integration health status
  getHealthStatus(): any {
    const enabledConfigs = integrationConfigService.getEnabledConfigs()
      .filter(config => config.type === 'order_platform');
    
    const status: any = {
      overall_health: 'healthy',
      platforms: {},
      sync_status: {
        is_syncing: this.isSyncing,
        last_sync: this.syncStats.last_sync_time,
        total_synced_today: this.syncStats.today_synced,
        failed_syncs: this.syncStats.failed_syncs
      }
    };

    // Check each platform health
    for (const config of enabledConfigs) {
      let platformStatus;
      
      switch (config.id) {
        case 'zomato':
          platformStatus = zomatoIntegrationService.getStatus();
          break;
        case 'swiggy':
          platformStatus = swiggyIntegrationService.getStatus();
          break;
        default:
          continue;
      }

      status.platforms[config.id] = platformStatus;
      
      // Update overall health
      if (!platformStatus.is_configured || platformStatus.error_count > 5) {
        status.overall_health = 'warning';
      }
    }

    return status;
  }

  // Retry failed order syncs
  async retryFailedSyncs(): Promise<number> {
    try {
      console.log('🔄 Retrying failed order syncs...');
      
      const failedMappings = await this.getFailedOrderMappings();
      let retryCount = 0;

      for (const mapping of failedMappings) {
        try {
          // Increment attempt count
          mapping.sync_attempts = (mapping.sync_attempts || 0) + 1;
          
          // Skip if too many attempts
          if (mapping.sync_attempts > 5) {
            console.log(`⚠️ Skipping order ${mapping.external_order_id} - too many attempts`);
            continue;
          }

          // Retry sync based on platform
          switch (mapping.platform) {
            case 'zomato':
              // Re-fetch and process the order
              break;
            case 'swiggy':
              // Re-fetch and process the order
              break;
          }

          // Update mapping status
          mapping.sync_status = 'synced';
          mapping.error_message = undefined;
          mapping.updated_at = new Date();
          
          await this.updateOrderMapping(mapping);
          retryCount++;
          
        } catch (error) {
          console.error(`🔴 Failed to retry sync for ${mapping.external_order_id}:`, error);
          mapping.error_message = error.message;
          mapping.updated_at = new Date();
          await this.updateOrderMapping(mapping);
        }
      }

      console.log(`✅ Retried ${retryCount} failed syncs`);
      return retryCount;
      
    } catch (error) {
      console.error('🔴 Failed to retry failed syncs:', error);
      throw error;
    }
  }

  // Map local order status to external platform status
  private mapLocalStatusToExternal(localStatus: string, platform: 'zomato' | 'swiggy'): string {
    if (platform === 'zomato') {
      const zomatoStatusMap: Record<string, string> = {
        'pending': 'placed',
        'confirmed': 'accepted',
        'preparing': 'preparing',
        'ready': 'ready',
        'completed': 'dispatched',
        'cancelled': 'cancelled'
      };
      return zomatoStatusMap[localStatus] || localStatus;
    } else {
      const swiggyStatusMap: Record<string, string> = {
        'pending': 'ORDER_PLACED',
        'confirmed': 'ORDER_ACCEPTED',
        'preparing': 'FOOD_PREP_STARTED',
        'ready': 'FOOD_READY',
        'completed': 'ORDER_DISPATCHED',
        'cancelled': 'ORDER_CANCELLED'
      };
      return swiggyStatusMap[localStatus] || localStatus;
    }
  }

  // Update sync statistics
  private updateSyncStats(processed: number, failed: number): void {
    this.syncStats.total_synced += processed;
    this.syncStats.today_synced += processed;
    this.syncStats.failed_syncs += failed;
    this.syncStats.last_sync_time = new Date();
    
    // Reset daily count at midnight
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() < 5) {
      this.syncStats.today_synced = 0;
    }
    
    this.saveSyncStats();
  }

  // Load sync statistics from storage
  private loadSyncStats(): void {
    try {
      // In production, this would load from database
      // For now, keeping in memory
      console.log('📊 Sync stats loaded');
    } catch (error) {
      console.error('🔴 Failed to load sync stats:', error);
    }
  }

  // Save sync statistics to storage
  private saveSyncStats(): void {
    try {
      // In production, this would save to database
      console.log('💾 Sync stats saved');
    } catch (error) {
      console.error('🔴 Failed to save sync stats:', error);
    }
  }

  // Enable sync for specific platform
  async enablePlatformSync(platform: 'zomato' | 'swiggy'): Promise<void> {
    switch (platform) {
      case 'zomato':
        await zomatoIntegrationService.enable();
        break;
      case 'swiggy':
        await swiggyIntegrationService.enable();
        break;
    }
    console.log(`✅ ${platform} sync enabled`);
  }

  // Disable sync for specific platform
  async disablePlatformSync(platform: 'zomato' | 'swiggy'): Promise<void> {
    switch (platform) {
      case 'zomato':
        await zomatoIntegrationService.disable();
        break;
      case 'swiggy':
        await swiggyIntegrationService.disable();
        break;
    }
    console.log(`❌ ${platform} sync disabled`);
  }

  // Stop all sync operations
  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
    }
    console.log('🛑 Order sync service stopped');
  }

  // Placeholder database methods (to be implemented with actual DB)
  private async findOrderMapping(
    localOrderId: string, 
    platform?: 'zomato' | 'swiggy'
  ): Promise<ExternalOrderMapping | null> {
    // Query database for order mapping
    return null;
  }

  private async updateOrderMapping(mapping: ExternalOrderMapping): Promise<void> {
    // Update order mapping in database
    console.log('💾 Order mapping updated:', mapping.id);
  }

  private async getFailedOrderMappings(): Promise<ExternalOrderMapping[]> {
    // Query database for failed order mappings
    return [];
  }

  private async logSyncOperation(log: Partial<IntegrationSyncLog>): Promise<void> {
    // Save sync log to database
    const syncLog = {
      id: `sync_${Date.now()}`,
      ...log
    } as IntegrationSyncLog;
    
    console.log('📝 Sync operation logged:', syncLog.integration_id, syncLog.status);
  }
}

// Export singleton instance
export const orderSyncService = new OrderSyncService();