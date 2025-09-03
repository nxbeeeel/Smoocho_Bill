import { useEffect, useState, useCallback } from 'react';
import {
  websocketService,
  WebSocketEventData,
} from '../services/websocketService';
import { useAuthStore } from '../store/authStore';

export interface WebSocketHookReturn {
  isConnected: boolean;
  connectionStatus: {
    connected: boolean;
    reconnectAttempts: number;
    isConnecting: boolean;
  };
  actions: {
    connect: () => void;
    disconnect: () => void;
    reconnect: () => void;
    ping: () => Promise<any>;
    emit: {
      orderUpdate: (data: any) => void;
      inventoryUpdate: (data: any) => void;
      paymentUpdate: (data: any) => void;
      syncStatus: (data: any) => void;
      lowStockAlert: (data: any) => void;
      newOrder: (data: any) => void;
    };
  };
  events: {
    onOrderUpdate: (callback: (data: WebSocketEventData) => void) => () => void;
    onNewOrder: (callback: (data: WebSocketEventData) => void) => () => void;
    onInventoryUpdate: (
      callback: (data: WebSocketEventData) => void
    ) => () => void;
    onLowStockAlert: (
      callback: (data: WebSocketEventData) => void
    ) => () => void;
    onPaymentUpdate: (
      callback: (data: WebSocketEventData) => void
    ) => () => void;
    onSyncStatusUpdate: (
      callback: (data: WebSocketEventData) => void
    ) => () => void;
  };
}

export const useWebSocket = (): WebSocketHookReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    reconnectAttempts: 0,
    isConnecting: false,
  });

  const { isAuthenticated } = useAuthStore();

  // Update connection status
  useEffect(() => {
    const updateStatus = () => {
      const status = websocketService.getConnectionStatus();
      setIsConnected(status.connected);
      setConnectionStatus(status);
    };

    // Initial status
    updateStatus();

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  // Connect/disconnect based on auth status
  useEffect(() => {
    if (isAuthenticated) {
      websocketService.connect();
    } else {
      websocketService.disconnect();
    }
  }, [isAuthenticated]);

  // Action handlers
  const connect = useCallback(() => {
    websocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    websocketService.reconnect();
  }, []);

  const ping = useCallback(() => {
    return websocketService.ping();
  }, []);

  // Emit events
  const emit = {
    orderUpdate: useCallback((data: any) => {
      websocketService.emitOrderUpdate(data);
    }, []),

    inventoryUpdate: useCallback((data: any) => {
      websocketService.emitInventoryUpdate(data);
    }, []),

    paymentUpdate: useCallback((data: any) => {
      websocketService.emitPaymentUpdate(data);
    }, []),

    syncStatus: useCallback((data: any) => {
      websocketService.emitSyncStatus(data);
    }, []),

    lowStockAlert: useCallback((data: any) => {
      websocketService.emitLowStockAlert(data);
    }, []),

    newOrder: useCallback((data: any) => {
      websocketService.emitNewOrder(data);
    }, []),
  };

  // Event listeners
  const events = {
    onOrderUpdate: useCallback(
      (callback: (data: WebSocketEventData) => void) => {
        const handler = (event: Event) => {
          const customEvent = event as CustomEvent;
          callback(customEvent.detail);
        };

        window.addEventListener('orderUpdated', handler as EventListener);
        return () =>
          window.removeEventListener('orderUpdated', handler as EventListener);
      },
      []
    ),

    onNewOrder: useCallback((callback: (data: WebSocketEventData) => void) => {
      const handler = (event: Event) => {
        const customEvent = event as CustomEvent;
        callback(customEvent.detail);
      };

      window.addEventListener('newOrder', handler as EventListener);
      return () =>
        window.removeEventListener('newOrder', handler as EventListener);
    }, []),

    onInventoryUpdate: useCallback(
      (callback: (data: WebSocketEventData) => void) => {
        const handler = (event: Event) => {
          const customEvent = event as CustomEvent;
          callback(customEvent.detail);
        };

        window.addEventListener('inventoryUpdated', handler as EventListener);
        return () =>
          window.removeEventListener(
            'inventoryUpdated',
            handler as EventListener
          );
      },
      []
    ),

    onLowStockAlert: useCallback(
      (callback: (data: WebSocketEventData) => void) => {
        const handler = (event: Event) => {
          const customEvent = event as CustomEvent;
          callback(customEvent.detail);
        };

        window.addEventListener('lowStockAlert', handler as EventListener);
        return () =>
          window.removeEventListener('lowStockAlert', handler as EventListener);
      },
      []
    ),

    onPaymentUpdate: useCallback(
      (callback: (data: WebSocketEventData) => void) => {
        const handler = (event: Event) => {
          const customEvent = event as CustomEvent;
          callback(customEvent.detail);
        };

        window.addEventListener('paymentUpdated', handler as EventListener);
        return () =>
          window.removeEventListener(
            'paymentUpdated',
            handler as EventListener
          );
      },
      []
    ),

    onSyncStatusUpdate: useCallback(
      (callback: (data: WebSocketEventData) => void) => {
        const handler = (event: Event) => {
          const customEvent = event as CustomEvent;
          callback(customEvent.detail);
        };

        window.addEventListener('syncStatusUpdated', handler as EventListener);
        return () =>
          window.removeEventListener(
            'syncStatusUpdated',
            handler as EventListener
          );
      },
      []
    ),
  };

  return {
    isConnected,
    connectionStatus,
    actions: {
      connect,
      disconnect,
      reconnect,
      ping,
      emit,
    },
    events,
  };
};
