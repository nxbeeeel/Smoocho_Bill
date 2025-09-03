import { create } from 'zustand';
import { OfflineState } from '../types';

interface OfflineStore extends OfflineState {
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncStatus: (syncInProgress: boolean) => void;
  updateLastSyncTime: (timestamp?: string) => void;
  setPendingOperations: (count: number) => void;
  incrementPendingOperations: () => void;
  decrementPendingOperations: () => void;
}

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  isOnline: navigator.onLine,
  lastSyncTime: null,
  pendingOperations: 0,
  syncInProgress: false,

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },

  setSyncStatus: (syncInProgress: boolean) => {
    set({ syncInProgress });
  },

  updateLastSyncTime: (timestamp?: string) => {
    set({ lastSyncTime: timestamp || new Date().toISOString() });
  },

  setPendingOperations: (count: number) => {
    set({ pendingOperations: Math.max(0, count) });
  },

  incrementPendingOperations: () => {
    const { pendingOperations } = get();
    set({ pendingOperations: pendingOperations + 1 });
  },

  decrementPendingOperations: () => {
    const { pendingOperations } = get();
    set({ pendingOperations: Math.max(0, pendingOperations - 1) });
  },
}));

// Listen for online/offline events
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnlineStatus(true);
  });

  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnlineStatus(false);
  });
}
