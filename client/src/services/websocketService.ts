import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useOfflineStore } from '../store/offlineStore';

export interface WebSocketEventData {
  type: string;
  data: any;
  timestamp: string;
  updatedBy?: string;
}

export class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private isConnecting = false;

  constructor() {
    this.setupConnectionListeners();
  }

  // Initialize WebSocket connection
  connect(): void {
    if (this.socket?.connected || this.isConnecting) {
      console.log('🔌 WebSocket already connected or connecting');
      return;
    }

    const { token, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !token) {
      console.log('⚠️ Cannot connect WebSocket: not authenticated');
      return;
    }

    this.isConnecting = true;
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

    console.log('🔌 Connecting to WebSocket server...');

    this.socket = io(wsUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: 5000,
    });

    this.setupEventListeners();
  }

  // Disconnect WebSocket
  disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket...');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Setup connection event listeners
  private setupConnectionListeners(): void {
    // Listen for auth state changes
    useAuthStore.subscribe(state => {
      if (state.isAuthenticated && state.token) {
        this.connect();
      } else {
        this.disconnect();
      }
    });

    // Listen for online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        const { isAuthenticated } = useAuthStore.getState();
        if (isAuthenticated && !this.isConnected()) {
          setTimeout(() => this.connect(), 1000); // Small delay to ensure network stability
        }
      });

      window.addEventListener('offline', () => {
        this.disconnect();
      });
    }
  }

  // Setup WebSocket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'success',
        title: 'Connected',
        message: 'Real-time updates enabled',
      });
    });

    this.socket.on('disconnect', reason => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnecting = false;

      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', error => {
      console.error('❌ WebSocket connection error:', error);
      this.isConnecting = false;
      this.handleReconnection();
    });

    // Welcome message
    this.socket.on('connected', data => {
      console.log('👋 WebSocket welcome:', data);
    });

    // System heartbeat
    this.socket.on('system:heartbeat', data => {
      console.log('💓 System heartbeat:', data);
    });

    // Order events
    this.socket.on('order:updated', this.handleOrderUpdate.bind(this));
    this.socket.on('order:newOrder', this.handleNewOrder.bind(this));

    // Inventory events
    this.socket.on('inventory:updated', this.handleInventoryUpdate.bind(this));
    this.socket.on(
      'inventory:lowStockAlert',
      this.handleLowStockAlert.bind(this)
    );

    // Payment events
    this.socket.on('payment:updated', this.handlePaymentUpdate.bind(this));

    // Sync events
    this.socket.on(
      'sync:statusUpdated',
      this.handleSyncStatusUpdate.bind(this)
    );

    // Error handling
    this.socket.on('error', error => {
      console.error('❌ WebSocket error:', error);
    });
  }

  // Handle reconnection logic
  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached');

      const { addNotification } = useNotificationStore.getState();
      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Unable to connect to server. Please refresh the page.',
        action: {
          label: 'Refresh',
          onClick: () => window.location.reload(),
        },
      });

      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      30000
    );

    console.log(
      `🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
    );

    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect();
      }
    }, delay);
  }

  // Event handlers
  private handleOrderUpdate(data: WebSocketEventData): void {
    console.log('📋 Order updated:', data);

    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'info',
      title: 'Order Updated',
      message: `Order ${data.data.order_number} has been updated`,
    });

    // Emit custom event for components to listen
    window.dispatchEvent(new CustomEvent('orderUpdated', { detail: data }));
  }

  private handleNewOrder(data: WebSocketEventData): void {
    console.log('🆕 New order:', data);

    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'info',
      title: 'New Order',
      message: `New ${data.data.order_type} order received`,
    });

    // Play notification sound (if enabled)
    this.playNotificationSound();

    // Emit custom event
    window.dispatchEvent(new CustomEvent('newOrder', { detail: data }));
  }

  private handleInventoryUpdate(data: WebSocketEventData): void {
    console.log('📦 Inventory updated:', data);

    // Emit custom event
    window.dispatchEvent(new CustomEvent('inventoryUpdated', { detail: data }));
  }

  private handleLowStockAlert(data: WebSocketEventData): void {
    console.log('⚠️ Low stock alert:', data);

    const { addNotification } = useNotificationStore.getState();
    addNotification({
      type: 'warning',
      title: 'Low Stock Alert',
      message: `${data.data.item_name} is running low (${data.data.current_stock} left)`,
      action: {
        label: 'View Inventory',
        onClick: () => (window.location.href = '/inventory'),
      },
    });

    // Play alert sound
    this.playAlertSound();

    // Emit custom event
    window.dispatchEvent(new CustomEvent('lowStockAlert', { detail: data }));
  }

  private handlePaymentUpdate(data: WebSocketEventData): void {
    console.log('💳 Payment updated:', data);

    // Emit custom event
    window.dispatchEvent(new CustomEvent('paymentUpdated', { detail: data }));
  }

  private handleSyncStatusUpdate(data: WebSocketEventData): void {
    console.log('🔄 Sync status updated:', data);

    const { setSyncStatus, setPendingOperations } = useOfflineStore.getState();

    if (data.data.syncInProgress !== undefined) {
      setSyncStatus(data.data.syncInProgress);
    }

    if (data.data.pendingOperations !== undefined) {
      setPendingOperations(data.data.pendingOperations);
    }
  }

  // Emit events to server
  emitOrderUpdate(orderData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('order:update', orderData);
    }
  }

  emitInventoryUpdate(inventoryData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('inventory:update', inventoryData);
    }
  }

  emitPaymentUpdate(paymentData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('payment:update', paymentData);
    }
  }

  emitSyncStatus(syncData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('sync:status', syncData);
    }
  }

  emitLowStockAlert(stockData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('inventory:lowStock', stockData);
    }
  }

  emitNewOrder(orderData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('order:new', orderData);
    }
  }

  // Ping server for connection health
  ping(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected'));
        return;
      }

      this.socket.emit('ping', (response: any) => {
        resolve(response);
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        reject(new Error('Ping timeout'));
      }, 5000);
    });
  }

  // Sound notifications
  private playNotificationSound(): void {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio
        .play()
        .catch(e => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available:', error);
    }
  }

  private playAlertSound(): void {
    try {
      const audio = new Audio('/sounds/alert.mp3');
      audio.volume = 0.7;
      audio.play().catch(e => console.log('Could not play alert sound:', e));
    } catch (error) {
      console.log('Alert sound not available:', error);
    }
  }

  // Get connection status
  getConnectionStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    isConnecting: boolean;
  } {
    return {
      connected: this.isConnected(),
      reconnectAttempts: this.reconnectAttempts,
      isConnecting: this.isConnecting,
    };
  }

  // Manual reconnection
  reconnect(): void {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Auto-connect when the service is imported
if (typeof window !== 'undefined') {
  // Connect when page loads if authenticated
  window.addEventListener('load', () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      websocketService.connect();
    }
  });
}
