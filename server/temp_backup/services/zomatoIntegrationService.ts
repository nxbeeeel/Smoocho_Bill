import axios, { AxiosInstance } from 'axios';
import { ZomatoOrder, IntegrationConfig, ExternalOrderMapping, Order, OrderItem } from '../types';
import { integrationConfigService } from './integrationConfigService';

/**
 * Zomato Integration Service
 * 
 * Handles Zomato API integration for:
 * - Fetching new orders
 * - Updating order status
 * - Managing restaurant menu sync
 * - Handling webhooks
 */
export class ZomatoIntegrationService {
  private apiClient: AxiosInstance;
  private config: IntegrationConfig | null = null;
  private readonly ZOMATO_BASE_URL = 'https://partner-api.zomato.com/v1';
  private syncTimer?: NodeJS.Timeout;

  constructor() {
    this.apiClient = axios.create({
      baseURL: this.ZOMATO_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.initializeConfig();
    this.setupInterceptors();
  }

  // Initialize configuration
  private async initializeConfig(): Promise<void> {
    this.config = integrationConfigService.getConfig('zomato');
    if (this.config && this.config.is_enabled) {
      this.setupApiCredentials();
      this.startAutoSync();
    }
  }

  // Setup API credentials
  private setupApiCredentials(): void {
    if (!this.config?.api_credentials) {
      throw new Error('Zomato API credentials not configured');
    }

    this.apiClient.defaults.headers['Authorization'] = `Bearer ${this.config.api_credentials.api_key}`;
    this.apiClient.defaults.headers['X-Partner-ID'] = this.config.api_credentials.partner_id;
  }

  // Setup axios interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🟡 Zomato API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🔴 Zomato API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`🟢 Zomato API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('🔴 Zomato API Response Error:', error.response?.status, error.response?.data);
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Handle API errors
  private handleApiError(error: any): void {
    const errorMessage = error.response?.data?.message || error.message;
    integrationConfigService.incrementErrorCount('zomato', errorMessage);
    
    // Disable integration if too many auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🚨 Zomato authentication failed - disabling integration');
      integrationConfigService.disableIntegration('zomato');
    }
  }

  // Start automatic order sync
  private startAutoSync(): void {
    if (!this.config?.is_enabled) return;

    const syncFrequency = (this.config.sync_frequency || 2) * 60 * 1000; // Convert to milliseconds
    
    this.syncTimer = setInterval(async () => {
      try {
        await this.fetchNewOrders();
      } catch (error) {
        console.error('🔴 Zomato auto-sync failed:', error);
      }
    }, syncFrequency);

    console.log(`🟢 Zomato auto-sync started (${this.config.sync_frequency} minutes)`);
  }

  // Stop automatic sync
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
      console.log('🟡 Zomato auto-sync stopped');
    }
  }

  // Fetch new orders from Zomato
  async fetchNewOrders(): Promise<ZomatoOrder[]> {
    if (!this.isConfigured()) {
      throw new Error('Zomato integration not configured');
    }

    try {
      console.log('📥 Fetching new orders from Zomato...');
      
      // Get orders from last sync time or last 1 hour
      const sinceTime = this.config?.last_sync 
        ? new Date(this.config.last_sync).toISOString()
        : new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const response = await this.apiClient.get('/orders', {
        params: {
          since: sinceTime,
          status: 'placed,accepted', // Only fetch new and accepted orders
          limit: 50
        }
      });

      const orders: ZomatoOrder[] = response.data.orders || [];
      console.log(`📦 Found ${orders.length} new orders from Zomato`);

      // Process each order
      for (const order of orders) {
        await this.processNewOrder(order);
      }

      // Update last sync time
      integrationConfigService.updateLastSync('zomato');
      
      return orders;
    } catch (error) {
      console.error('🔴 Failed to fetch Zomato orders:', error);
      throw error;
    }
  }

  // Process a new order from Zomato
  private async processNewOrder(zomatoOrder: ZomatoOrder): Promise<void> {
    try {
      // Check if order already exists
      const existingMapping = await this.findOrderMapping(zomatoOrder.order_id);
      if (existingMapping) {
        console.log(`⚠️ Order ${zomatoOrder.order_id} already processed`);
        return;
      }

      // Convert Zomato order to local order format
      const localOrder = this.convertZomatoOrderToLocal(zomatoOrder);
      
      // Save order to local database
      const savedOrder = await this.saveOrderToDatabase(localOrder);
      
      // Create order mapping
      await this.createOrderMapping({
        external_order_id: zomatoOrder.order_id,
        platform: 'zomato',
        local_order_id: savedOrder.id,
        sync_status: 'synced',
        sync_attempts: 1,
        created_at: new Date(),
        updated_at: new Date()
      } as ExternalOrderMapping);

      // Auto-accept order if configured
      if (this.config?.settings?.auto_accept_orders) {
        await this.acceptOrder(zomatoOrder.order_id);
      }

      console.log(`✅ Zomato order ${zomatoOrder.order_id} processed successfully`);
      
    } catch (error) {
      console.error(`🔴 Failed to process Zomato order ${zomatoOrder.order_id}:`, error);
      
      // Create failed mapping for retry
      await this.createOrderMapping({
        external_order_id: zomatoOrder.order_id,
        platform: 'zomato',
        local_order_id: '',
        sync_status: 'failed',
        sync_attempts: 1,
        error_message: error.message,
        created_at: new Date(),
        updated_at: new Date()
      } as ExternalOrderMapping);
    }
  }

  // Convert Zomato order to local order format
  private convertZomatoOrderToLocal(zomatoOrder: ZomatoOrder): Partial<Order> {
    const orderItems: Partial<OrderItem>[] = zomatoOrder.items.map(item => ({
      product_id: item.item_id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      item_total: item.price * item.quantity,
      special_instructions: item.instructions
    }));

    return {
      order_number: `ZOM-${zomatoOrder.order_id}`,
      order_type: 'zomato',
      customer_name: zomatoOrder.customer.name,
      customer_phone: zomatoOrder.customer.phone,
      subtotal: zomatoOrder.order_value.subtotal,
      tax_amount: zomatoOrder.order_value.taxes,
      total_amount: zomatoOrder.order_value.total,
      status: this.mapZomatoStatusToLocal(zomatoOrder.order_status),
      payment_status: zomatoOrder.payment_method === 'prepaid' ? 'paid' : 'pending',
      external_order_id: zomatoOrder.order_id,
      external_platform: 'zomato',
      order_date: new Date(zomatoOrder.order_time),
      estimated_ready_time: zomatoOrder.preparation_time 
        ? new Date(Date.now() + zomatoOrder.preparation_time * 60 * 1000)
        : undefined,
      discount_amount: 0,
      is_synced: false
    };
  }

  // Map Zomato order status to local status
  private mapZomatoStatusToLocal(zomatoStatus: string): Order['status'] {
    const statusMap: Record<string, Order['status']> = {
      'placed': 'pending',
      'accepted': 'confirmed',
      'preparing': 'preparing',
      'ready': 'ready',
      'dispatched': 'completed',
      'delivered': 'completed',
      'cancelled': 'cancelled'
    };

    return statusMap[zomatoStatus] || 'pending';
  }

  // Accept order on Zomato
  async acceptOrder(orderId: string, prepTime?: number): Promise<boolean> {
    try {
      const preparationTime = prepTime || this.config?.settings?.max_prep_time || 30;
      
      await this.apiClient.post(`/orders/${orderId}/accept`, {
        preparation_time: preparationTime
      });

      console.log(`✅ Zomato order ${orderId} accepted with ${preparationTime}min prep time`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to accept Zomato order ${orderId}:`, error);
      throw error;
    }
  }

  // Update order status on Zomato
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/orders/${orderId}/status`, {
        status: status
      });

      console.log(`✅ Zomato order ${orderId} status updated to ${status}`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to update Zomato order ${orderId} status:`, error);
      throw error;
    }
  }

  // Reject order on Zomato
  async rejectOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/orders/${orderId}/reject`, {
        reason: reason
      });

      console.log(`❌ Zomato order ${orderId} rejected: ${reason}`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to reject Zomato order ${orderId}:`, error);
      throw error;
    }
  }

  // Handle Zomato webhook
  async handleWebhook(payload: any): Promise<void> {
    try {
      console.log('📨 Received Zomato webhook:', payload.event_type);
      
      switch (payload.event_type) {
        case 'order.placed':
          await this.processNewOrder(payload.order);
          break;
        case 'order.cancelled':
          await this.handleOrderCancellation(payload.order);
          break;
        case 'order.status_updated':
          await this.handleStatusUpdate(payload.order);
          break;
        default:
          console.log(`⚠️ Unhandled Zomato webhook event: ${payload.event_type}`);
      }
    } catch (error) {
      console.error('🔴 Failed to handle Zomato webhook:', error);
      throw error;
    }
  }

  // Handle order cancellation
  private async handleOrderCancellation(order: any): Promise<void> {
    const mapping = await this.findOrderMapping(order.order_id);
    if (mapping && mapping.local_order_id) {
      await this.updateLocalOrderStatus(mapping.local_order_id, 'cancelled');
      console.log(`❌ Local order ${mapping.local_order_id} cancelled due to Zomato cancellation`);
    }
  }

  // Handle status update
  private async handleStatusUpdate(order: any): Promise<void> {
    const mapping = await this.findOrderMapping(order.order_id);
    if (mapping && mapping.local_order_id) {
      const localStatus = this.mapZomatoStatusToLocal(order.order_status);
      await this.updateLocalOrderStatus(mapping.local_order_id, localStatus);
      console.log(`🔄 Local order ${mapping.local_order_id} status updated to ${localStatus}`);
    }
  }

  // Get integration status
  getStatus(): any {
    return {
      platform: 'zomato',
      is_enabled: this.config?.is_enabled || false,
      is_configured: this.isConfigured(),
      last_sync: this.config?.last_sync,
      error_count: this.config?.error_count || 0,
      auto_sync_active: !!this.syncTimer
    };
  }

  // Check if integration is properly configured
  private isConfigured(): boolean {
    return !!(this.config?.is_enabled && 
             this.config?.api_credentials?.api_key && 
             this.config?.api_credentials?.partner_id);
  }

  // Enable integration
  async enable(): Promise<void> {
    await integrationConfigService.enableIntegration('zomato');
    await this.initializeConfig();
  }

  // Disable integration
  async disable(): Promise<void> {
    this.stopAutoSync();
    await integrationConfigService.disableIntegration('zomato');
    this.config = integrationConfigService.getConfig('zomato');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/restaurants/self');
      console.log('✅ Zomato connection test successful');
      integrationConfigService.resetErrorCount('zomato');
      return true;
    } catch (error) {
      console.error('❌ Zomato connection test failed:', error);
      return false;
    }
  }

  // Placeholder methods for database operations (to be implemented with actual DB)
  private async findOrderMapping(externalOrderId: string): Promise<ExternalOrderMapping | null> {
    // This would query the database for existing mapping
    return null;
  }

  private async createOrderMapping(mapping: ExternalOrderMapping): Promise<ExternalOrderMapping> {
    // This would save the mapping to database
    console.log('💾 Order mapping created:', mapping);
    return mapping;
  }

  private async saveOrderToDatabase(order: Partial<Order>): Promise<Order> {
    // This would save the order to database
    const savedOrder = {
      ...order,
      id: `order_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as Order;
    
    console.log('💾 Order saved to database:', savedOrder.id);
    return savedOrder;
  }

  private async updateLocalOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    // This would update the order status in database
    console.log(`💾 Order ${orderId} status updated to ${status}`);
  }

  // Cleanup
  destroy(): void {
    this.stopAutoSync();
  }
}

// Export singleton instance
export const zomatoIntegrationService = new ZomatoIntegrationService();