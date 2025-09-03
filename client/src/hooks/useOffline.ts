import { useEffect, useCallback } from 'react';
import { useOfflineStore } from '../store/offlineStore';
import { syncService } from '../services/syncService';
import { offlineStorage } from '../services/offlineStorageService';
import { useNotificationStore } from '../store/notificationStore';

export interface OfflineHookReturn {
  isOnline: boolean;
  isInitialized: boolean;
  syncStatus: {
    inProgress: boolean;
    lastSyncTime: string | null;
    pendingOperations: number;
  };
  actions: {
    forceSync: () => Promise<void>;
    downloadFreshData: () => Promise<void>;
    clearOfflineData: () => Promise<void>;
    retryFailedOperations: () => Promise<void>;
  };
}

export const useOffline = (): OfflineHookReturn => {
  const {
    isOnline,
    syncInProgress,
    lastSyncTime,
    pendingOperations,
    setOnlineStatus,
    setSyncStatus,
    updateLastSyncTime,
    setPendingOperations,
  } = useOfflineStore();

  const { addNotification } = useNotificationStore();

  // Initialize offline storage and sync service
  useEffect(() => {
    const initializeOfflineCapabilities = async () => {
      try {
        // Initialize IndexedDB
        await offlineStorage.initialize();
        console.log('✅ Offline storage initialized');

        // Start sync service if online
        if (navigator.onLine) {
          syncService.start();
        }

        // Update pending operations count
        const pendingCount = await offlineStorage.getSyncQueueCount();
        setPendingOperations(pendingCount);
      } catch (error) {
        console.error('❌ Failed to initialize offline capabilities:', error);
        addNotification({
          type: 'error',
          title: 'Offline Setup Failed',
          message: 'Could not initialize offline capabilities',
        });
      }
    };

    initializeOfflineCapabilities();
  }, [setPendingOperations, addNotification]);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online');
      setOnlineStatus(true);
      syncService.start();

      // Auto-sync when coming back online
      setTimeout(() => {
        syncService.forcSync();
      }, 1000);
    };

    const handleOffline = () => {
      console.log('📵 Gone offline');
      setOnlineStatus(false);
      syncService.stop();

      addNotification({
        type: 'warning',
        title: 'Offline Mode',
        message:
          'You are now working offline. Changes will sync when reconnected.',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial online status
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, addNotification]);

  // Periodic sync status check
  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        const pendingCount = await offlineStorage.getSyncQueueCount();
        setPendingOperations(pendingCount);
      } catch (error) {
        console.warn('Failed to check sync status:', error);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkSyncStatus, 30000);

    // Initial check
    checkSyncStatus();

    return () => clearInterval(interval);
  }, [setPendingOperations]);

  // Action handlers
  const forceSync = useCallback(async () => {
    if (!isOnline) {
      addNotification({
        type: 'warning',
        title: 'Offline',
        message: 'Cannot sync while offline',
      });
      return;
    }

    try {
      setSyncStatus(true);
      await syncService.forcSync();

      // Update pending count
      const pendingCount = await offlineStorage.getSyncQueueCount();
      setPendingOperations(pendingCount);

      if (pendingCount === 0) {
        updateLastSyncTime();
      }
    } catch (error) {
      console.error('Force sync failed:', error);
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: 'Failed to sync data with server',
      });
    } finally {
      setSyncStatus(false);
    }
  }, [
    isOnline,
    setSyncStatus,
    setPendingOperations,
    updateLastSyncTime,
    addNotification,
  ]);

  const downloadFreshData = useCallback(async () => {
    if (!isOnline) {
      addNotification({
        type: 'warning',
        title: 'Offline',
        message: 'Cannot download data while offline',
      });
      return;
    }

    try {
      setSyncStatus(true);
      await syncService.downloadFreshData();
      updateLastSyncTime();
    } catch (error) {
      console.error('Download fresh data failed:', error);
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: 'Failed to download fresh data from server',
      });
    } finally {
      setSyncStatus(false);
    }
  }, [isOnline, setSyncStatus, updateLastSyncTime, addNotification]);

  const clearOfflineData = useCallback(async () => {
    try {
      await offlineStorage.clearAllData();
      setPendingOperations(0);

      addNotification({
        type: 'success',
        title: 'Data Cleared',
        message: 'All offline data has been cleared',
      });
    } catch (error) {
      console.error('Clear offline data failed:', error);
      addNotification({
        type: 'error',
        title: 'Clear Failed',
        message: 'Failed to clear offline data',
      });
    }
  }, [setPendingOperations, addNotification]);

  const retryFailedOperations = useCallback(async () => {
    if (!isOnline) {
      addNotification({
        type: 'warning',
        title: 'Offline',
        message: 'Cannot retry operations while offline',
      });
      return;
    }

    try {
      setSyncStatus(true);
      await syncService.retryFailedOperations();

      // Update pending count
      const pendingCount = await offlineStorage.getSyncQueueCount();
      setPendingOperations(pendingCount);

      addNotification({
        type: 'info',
        title: 'Retry Complete',
        message: 'Failed operations have been retried',
      });
    } catch (error) {
      console.error('Retry failed operations failed:', error);
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: 'Failed to retry operations',
      });
    } finally {
      setSyncStatus(false);
    }
  }, [isOnline, setSyncStatus, setPendingOperations, addNotification]);

  return {
    isOnline,
    isInitialized: true, // Could be enhanced with proper initialization state
    syncStatus: {
      inProgress: syncInProgress,
      lastSyncTime,
      pendingOperations,
    },
    actions: {
      forceSync,
      downloadFreshData,
      clearOfflineData,
      retryFailedOperations,
    },
  };
};
