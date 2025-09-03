import {
  DailySalesReport,
  MonthlySalesReport,
  ReportSummary,
  ReportFilters,
} from '../types';
import { reportService } from './reportService';
import { useOfflineStore } from '../store/offlineStore';
import { useNotificationStore } from '../store/notificationStore';

interface ReportSyncOperation {
  id: string;
  type: 'GENERATE' | 'REGENERATE' | 'EXPORT';
  reportType: 'daily' | 'monthly';
  period: string;
  filters: ReportFilters;
  data?: DailySalesReport | MonthlySalesReport;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retryCount: number;
  error?: string;
  timestamp: number;
}

interface ReportSyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: string[];
}

export class ReportSyncService {
  private syncQueue: ReportSyncOperation[] = [];
  private isSyncing = false;
  private readonly STORAGE_KEY = 'report_sync_queue';
  private readonly MAX_RETRIES = 3;
  private readonly SYNC_INTERVAL = 30000; // 30 seconds
  private syncTimer?: number;

  constructor() {
    this.loadSyncQueue();
    this.startAutoSync();

    // Listen for online status changes
    window.addEventListener('online', () =>
      this.handleOnlineStatusChange(true)
    );
    window.addEventListener('offline', () =>
      this.handleOnlineStatusChange(false)
    );
  }

  // Load sync queue from localStorage
  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.syncQueue = JSON.parse(stored);
        console.log(
          `📊 Loaded ${this.syncQueue.length} report sync operations from storage`
        );
      }
    } catch (error) {
      console.error('Failed to load report sync queue:', error);
      this.syncQueue = [];
    }
  }

  // Save sync queue to localStorage
  private saveSyncQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save report sync queue:', error);
    }
  }

  // Start automatic sync
  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = window.setInterval(async () => {
      if (navigator.onLine && this.syncQueue.length > 0 && !this.isSyncing) {
        console.log('🔄 Auto-syncing reports...');
        await this.performSync();
      }
    }, this.SYNC_INTERVAL);
  }

  // Handle online status changes
  private handleOnlineStatusChange(isOnline: boolean): void {
    console.log(
      `📊 Report sync: Network status changed - ${isOnline ? 'Online' : 'Offline'}`
    );

    if (isOnline && this.syncQueue.length > 0 && !this.isSyncing) {
      // Delay sync to allow network to stabilize
      setTimeout(() => {
        if (navigator.onLine) {
          this.performSync();
        }
      }, 2000);
    }
  }

  // Add operation to sync queue
  addToSyncQueue(
    type: 'GENERATE' | 'REGENERATE' | 'EXPORT',
    reportType: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters = {},
    data?: DailySalesReport | MonthlySalesReport
  ): void {
    const operation: ReportSyncOperation = {
      id: `${type}_${reportType}_${period}_${Date.now()}`,
      type,
      reportType,
      period,
      filters,
      data,
      status: 'pending',
      retryCount: 0,
      timestamp: Date.now(),
    };

    this.syncQueue.push(operation);
    this.saveSyncQueue();

    console.log(`📊 Added report sync operation: ${operation.id}`);

    // Update offline store
    useOfflineStore.getState().setPendingOperations(this.syncQueue.length);

    // Try to sync immediately if online
    if (navigator.onLine && !this.isSyncing) {
      setTimeout(() => this.performSync(), 1000);
    }
  }

  // Perform sync
  async performSync(): Promise<ReportSyncResult> {
    if (this.isSyncing) {
      console.log('📊 Report sync already in progress, skipping...');
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    if (!navigator.onLine) {
      console.log('📊 Device offline, skipping report sync');
      return {
        success: false,
        synced: 0,
        failed: 0,
        errors: ['Device offline'],
      };
    }

    if (this.syncQueue.length === 0) {
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    this.isSyncing = true;
    useOfflineStore.getState().setSyncStatus(true);

    const result: ReportSyncResult = {
      success: true,
      synced: 0,
      failed: 0,
      errors: [],
    };

    console.log(
      `📊 Starting report sync for ${this.syncQueue.length} operations`
    );

    try {
      // Process operations in order
      for (const operation of this.syncQueue) {
        if (operation.status === 'completed') {
          continue;
        }

        operation.status = 'syncing';

        try {
          await this.syncSingleOperation(operation);
          operation.status = 'completed';
          result.synced++;

          console.log(
            `✅ Synced report: ${operation.type} ${operation.reportType} ${operation.period}`
          );
        } catch (error: any) {
          operation.status = 'failed';
          operation.retryCount++;
          operation.error = error.message;
          result.failed++;
          result.errors.push(
            `${operation.type} ${operation.reportType} ${operation.period}: ${error.message}`
          );

          console.error(
            `❌ Report sync failed: ${operation.type} ${operation.reportType} ${operation.period}`,
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
          `🗑️ Removing ${failedOperations.length} report operations that exceeded max retries`
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
          title: 'Reports Synced',
          message: `${result.synced} report operations synced successfully`,
        });
      }

      if (result.failed > 0) {
        useNotificationStore.getState().addNotification({
          type: 'warning',
          title: 'Report Sync Issues',
          message: `${result.failed} report operations failed to sync`,
        });
      }
    } catch (error: any) {
      console.error('🚨 Report sync process failed:', error);
      result.success = false;
      result.errors.push(`Report sync process failed: ${error.message}`);

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Report Sync Failed',
        message: 'Failed to sync report changes',
      });
    } finally {
      this.isSyncing = false;
      useOfflineStore.getState().setSyncStatus(false);
      useOfflineStore.getState().setPendingOperations(this.syncQueue.length);
    }

    return result;
  }

  // Sync a single operation
  private async syncSingleOperation(
    operation: ReportSyncOperation
  ): Promise<void> {
    const { type, reportType, period, filters, data } = operation;

    switch (type) {
      case 'GENERATE':
        await this.syncGenerateReport(reportType, period, filters);
        break;
      case 'REGENERATE':
        await this.syncRegenerateReport(reportType, period, filters);
        break;
      case 'EXPORT':
        await this.syncExportReport(reportType, period, data);
        break;
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Sync generate report operation
  private async syncGenerateReport(
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters
  ): Promise<void> {
    await reportService.generateReport(type, period, filters);
  }

  // Sync regenerate report operation
  private async syncRegenerateReport(
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters
  ): Promise<void> {
    await reportService.regenerateReport(type, period, filters);
  }

  // Sync export report operation
  private async syncExportReport(
    type: 'daily' | 'monthly',
    period: string,
    data: DailySalesReport | MonthlySalesReport | undefined
  ): Promise<void> {
    if (data) {
      // Store the report data online
      await reportService.storeReportOffline(type, period, data);
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
  async forceSyncNow(): Promise<ReportSyncResult> {
    console.log('🔴 Force report sync requested');
    return await this.performSync();
  }

  // Clear sync queue (admin only)
  clearSyncQueue() {
    this.syncQueue = [];
    this.saveSyncQueue();
    useOfflineStore.getState().setPendingOperations(0);

    console.log('🗑️ Report sync queue cleared');

    useNotificationStore.getState().addNotification({
      type: 'info',
      title: 'Report Sync Queue Cleared',
      message: 'All pending report sync operations have been removed',
    });
  }

  // Get sync queue for debugging
  getSyncQueue(): ReportSyncOperation[] {
    return [...this.syncQueue];
  }

  // Retry failed operations
  async retryFailedOperations(): Promise<ReportSyncResult> {
    const failedOps = this.syncQueue.filter(op => op.status === 'failed');

    if (failedOps.length === 0) {
      return { success: true, synced: 0, failed: 0, errors: [] };
    }

    console.log(`🔄 Retrying ${failedOps.length} failed report operations`);

    // Reset failed operations to pending
    failedOps.forEach(op => {
      op.status = 'pending';
      op.retryCount = 0;
      op.error = undefined;
    });

    this.saveSyncQueue();

    return await this.performSync();
  }

  // Sync specific report by type and period
  async syncReportByPeriod(
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters = {}
  ): Promise<void> {
    this.addToSyncQueue('GENERATE', type, period, filters);
  }

  // Bulk sync multiple reports
  async bulkSyncReports(
    reports: Array<{
      type: 'daily' | 'monthly';
      period: string;
      filters?: ReportFilters;
    }>
  ): Promise<void> {
    for (const report of reports) {
      this.addToSyncQueue(
        'GENERATE',
        report.type,
        report.period,
        report.filters || {}
      );
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
      byReportType: {} as Record<string, number>,
      oldestOperation: operations.length > 0 ? operations[0].timestamp : null,
      newestOperation:
        operations.length > 0
          ? operations[operations.length - 1].timestamp
          : null,
    };

    operations.forEach(op => {
      stats.byType[op.type] = (stats.byType[op.type] || 0) + 1;
      stats.byReportType[op.reportType] =
        (stats.byReportType[op.reportType] || 0) + 1;
    });

    return stats;
  }

  // Clean up old completed operations from storage
  cleanupOldOperations(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    const before = this.syncQueue.length;

    this.syncQueue = this.syncQueue.filter(
      op => op.timestamp > cutoff || op.status !== 'completed'
    );

    if (this.syncQueue.length !== before) {
      this.saveSyncQueue();
      console.log(
        `🧹 Cleaned up ${before - this.syncQueue.length} old report sync operations`
      );
    }
  }

  // Cleanup when service is destroyed
  destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    window.removeEventListener('online', () =>
      this.handleOnlineStatusChange(true)
    );
    window.removeEventListener('offline', () =>
      this.handleOnlineStatusChange(false)
    );
  }
}

// Export singleton instance
export const reportSyncService = new ReportSyncService();
