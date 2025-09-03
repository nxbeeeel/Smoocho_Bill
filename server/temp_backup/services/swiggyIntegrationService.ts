import axios, { AxiosInstance } from 'axios';
import { SwiggyOrder, IntegrationConfig, ExternalOrderMapping, Order, OrderItem } from '../types';
import { integrationConfigService } from './integrationConfigService';

/**
 * Swiggy Integration Service
 * 
 * Handles Swiggy API integration for:
 * - Fetching new orders
 * - Updating order status
 * - Managing restaurant menu sync
 * - Handling webhooks
 */
export class SwiggyIntegrationService {
  private apiClient: AxiosInstance;
  private config: IntegrationConfig | null = null;
  private readonly SWIGGY_BASE_URL = 'https://partner-api.swiggy.com/v1';
  private syncTimer?: NodeJS.Timeout;

  constructor() {
    this.apiClient = axios.create({
      baseURL: this.SWIGGY_BASE_URL,
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
    this.config = integrationConfigService.getConfig('swiggy');
    if (this.config && this.config.is_enabled) {
      this.setupApiCredentials();
      this.startAutoSync();
    }
  }

  // Setup API credentials
  private setupApiCredentials(): void {
    if (!this.config?.api_credentials) {
      throw new Error('Swiggy API credentials not configured');
    }

    this.apiClient.defaults.headers['Authorization'] = `Bearer ${this.config.api_credentials.api_key}`;
    this.apiClient.defaults.headers['X-Partner-ID'] = this.config.api_credentials.partner_id;
  }

  // Setup axios interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🟡 Swiggy API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🔴 Swiggy API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`🟢 Swiggy API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('🔴 Swiggy API Response Error:', error.response?.status, error.response?.data);
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Handle API errors
  private handleApiError(error: any): void {
    const errorMessage = error.response?.data?.message || error.message;
    integrationConfigService.incrementErrorCount('swiggy', errorMessage);
    
    // Disable integration if too many auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🚨 Swiggy authentication failed - disabling integration');
      integrationConfigService.disableIntegration('swiggy');
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
        console.error('🔴 Swiggy auto-sync failed:', error);
      }
    }, syncFrequency);

    console.log(`🟢 Swiggy auto-sync started (${this.config.sync_frequency} minutes)`);
  }

  // Stop automatic sync
  private stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = undefined;
      console.log('🟡 Swiggy auto-sync stopped');
    }
  }

  // Fetch new orders from Swiggy
  async fetchNewOrders(): Promise<SwiggyOrder[]> {
    if (!this.isConfigured()) {
      throw new Error('Swiggy integration not configured');
    }

    try {
      console.log('📥 Fetching new orders from Swiggy...');
      
      // Get orders from last sync time or last 1 hour
      const sinceTime = this.config?.last_sync 
        ? new Date(this.config.last_sync).toISOString()
        : new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const response = await this.apiClient.get('/orders', {
        params: {
          from_time: sinceTime,
          status: 'ORDER_PLACED,ORDER_ACCEPTED', // Only fetch new and accepted orders
          limit: 50
        }
      });

      const orders: SwiggyOrder[] = response.data.data || [];
      console.log(`📦 Found ${orders.length} new orders from Swiggy`);

      // Process each order
      for (const order of orders) {
        await this.processNewOrder(order);
      }

      // Update last sync time
      integrationConfigService.updateLastSync('swiggy');
      
      return orders;
    } catch (error) {
      console.error('🔴 Failed to fetch Swiggy orders:', error);
      throw error;
    }
  }

  // Process a new order from Swiggy
  private async processNewOrder(swiggyOrder: SwiggyOrder): Promise<void> {
    try {
      // Check if order already exists
      const existingMapping = await this.findOrderMapping(swiggyOrder.order_id);
      if (existingMapping) {
        console.log(`⚠️ Order ${swiggyOrder.order_id} already processed`);
        return;
      }

      // Convert Swiggy order to local order format
      const localOrder = this.convertSwiggyOrderToLocal(swiggyOrder);
      
      // Save order to local database
      const savedOrder = await this.saveOrderToDatabase(localOrder);
      
      // Create order mapping
      await this.createOrderMapping({
        external_order_id: swiggyOrder.order_id,
        platform: 'swiggy',
        local_order_id: savedOrder.id,
        sync_status: 'synced',
        sync_attempts: 1,
        created_at: new Date(),
        updated_at: new Date()
      } as ExternalOrderMapping);

      // Auto-accept order if configured
      if (this.config?.settings?.auto_accept_orders) {
        await this.acceptOrder(swiggyOrder.order_id);
      }

      console.log(`✅ Swiggy order ${swiggyOrder.order_id} processed successfully`);
      
    } catch (error) {
      console.error(`🔴 Failed to process Swiggy order ${swiggyOrder.order_id}:`, error);
      
      // Create failed mapping for retry
      await this.createOrderMapping({
        external_order_id: swiggyOrder.order_id,
        platform: 'swiggy',
        local_order_id: '',
        sync_status: 'failed',
        sync_attempts: 1,
        error_message: error.message,
        created_at: new Date(),
        updated_at: new Date()
      } as ExternalOrderMapping);
    }
  }

  // Convert Swiggy order to local order format
  private convertSwiggyOrderToLocal(swiggyOrder: SwiggyOrder): Partial<Order> {
    const orderItems: Partial<OrderItem>[] = swiggyOrder.order_items.map(item => {
      // Calculate item total including addons
      const addonTotal = (item.addons || []).reduce((sum, addon) => sum + addon.addon_price, 0);
      const itemTotal = item.item_total + addonTotal;
      
      return {
        product_id: item.item_id,
        product_name: item.item_name,
        product_price: item.item_price,
        quantity: item.quantity,
        item_total: itemTotal,
        special_instructions: item.special_instructions
      };
    });

    // Calculate delivery address string
    const deliveryAddress = swiggyOrder.customer_details.delivery_address
      ? swiggyOrder.customer_details.delivery_address.complete_address
      : undefined;

    return {
      order_number: `SWG-${swiggyOrder.order_id}`,
      order_type: 'swiggy',
      customer_name: swiggyOrder.customer_details.customer_name,
      customer_phone: swiggyOrder.customer_details.customer_phone,
      subtotal: swiggyOrder.order_total.item_total,
      tax_amount: swiggyOrder.order_total.total_taxes,
      total_amount: swiggyOrder.order_total.grand_total,
      status: this.mapSwiggyStatusToLocal(swiggyOrder.order_state),
      payment_status: swiggyOrder.payment_mode === 'PREPAID' ? 'paid' : 'pending',
      external_order_id: swiggyOrder.order_id,
      external_platform: 'swiggy',
      order_date: new Date(swiggyOrder.placed_time),
      estimated_ready_time: swiggyOrder.estimated_delivery_time 
        ? new Date(swiggyOrder.estimated_delivery_time)
        : new Date(Date.now() + (this.config?.settings?.max_prep_time || 30) * 60 * 1000),
      discount_amount: 0,
      is_synced: false
    };
  }

  // Map Swiggy order status to local status
  private mapSwiggyStatusToLocal(swiggyStatus: string): Order['status'] {
    const statusMap: Record<string, Order['status']> = {
      'ORDER_PLACED': 'pending',
      'ORDER_ACCEPTED': 'confirmed',
      'FOOD_PREP_STARTED': 'preparing',
      'FOOD_READY': 'ready',
      'ORDER_DISPATCHED': 'completed',
      'ORDER_DELIVERED': 'completed',
      'ORDER_CANCELLED': 'cancelled'
    };

    return statusMap[swiggyStatus] || 'pending';
  }

  // Accept order on Swiggy
  async acceptOrder(orderId: string, prepTime?: number): Promise<boolean> {
    try {
      const preparationTime = prepTime || this.config?.settings?.max_prep_time || 30;
      
      await this.apiClient.post(`/orders/${orderId}/accept`, {
        preparation_time_in_seconds: preparationTime * 60
      });

      console.log(`✅ Swiggy order ${orderId} accepted with ${preparationTime}min prep time`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to accept Swiggy order ${orderId}:`, error);
      throw error;
    }
  }

  // Update order status on Swiggy
  async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/orders/${orderId}/status`, {
        order_state: status
      });

      console.log(`✅ Swiggy order ${orderId} status updated to ${status}`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to update Swiggy order ${orderId} status:`, error);
      throw error;
    }
  }

  // Reject order on Swiggy
  async rejectOrder(orderId: string, reason: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/orders/${orderId}/reject`, {
        rejection_reason: reason
      });

      console.log(`❌ Swiggy order ${orderId} rejected: ${reason}`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to reject Swiggy order ${orderId}:`, error);
      throw error;
    }
  }

  // Mark food ready on Swiggy
  async markFoodReady(orderId: string): Promise<boolean> {
    try {
      await this.apiClient.post(`/orders/${orderId}/food-ready`);
      console.log(`🍽️ Swiggy order ${orderId} marked as food ready`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to mark Swiggy order ${orderId} as ready:`, error);
      throw error;
    }
  }

  // Handle Swiggy webhook
  async handleWebhook(payload: any): Promise<void> {
    try {
      console.log('📨 Received Swiggy webhook:', payload.event_type);
      
      switch (payload.event_type) {
        case 'ORDER_PLACED':
          await this.processNewOrder(payload.order);
          break;
        case 'ORDER_CANCELLED':
          await this.handleOrderCancellation(payload.order);
          break;
        case 'ORDER_STATE_CHANGED':
          await this.handleStatusUpdate(payload.order);
          break;
        case 'DELIVERY_PARTNER_ASSIGNED':
          await this.handleDeliveryPartnerAssignment(payload);
          break;
        default:
          console.log(`⚠️ Unhandled Swiggy webhook event: ${payload.event_type}`);
      }
    } catch (error) {
      console.error('🔴 Failed to handle Swiggy webhook:', error);
      throw error;
    }
  }

  // Handle order cancellation
  private async handleOrderCancellation(order: any): Promise<void> {
    const mapping = await this.findOrderMapping(order.order_id);
    if (mapping && mapping.local_order_id) {
      await this.updateLocalOrderStatus(mapping.local_order_id, 'cancelled');
      console.log(`❌ Local order ${mapping.local_order_id} cancelled due to Swiggy cancellation`);
    }
  }

  // Handle status update
  private async handleStatusUpdate(order: any): Promise<void> {
    const mapping = await this.findOrderMapping(order.order_id);
    if (mapping && mapping.local_order_id) {
      const localStatus = this.mapSwiggyStatusToLocal(order.order_state);
      await this.updateLocalOrderStatus(mapping.local_order_id, localStatus);
      console.log(`🔄 Local order ${mapping.local_order_id} status updated to ${localStatus}`);
    }
  }

  // Handle delivery partner assignment
  private async handleDeliveryPartnerAssignment(payload: any): Promise<void> {
    const { order_id, delivery_partner } = payload;
    console.log(`🚴 Delivery partner assigned to order ${order_id}:`, delivery_partner.partner_name);
    
    // Update local order with delivery partner info if needed
    const mapping = await this.findOrderMapping(order_id);
    if (mapping && mapping.local_order_id) {
      // Could store delivery partner info in order notes or custom field
      console.log(`📝 Delivery info updated for local order ${mapping.local_order_id}`);
    }
  }

  // Get restaurant menu from Swiggy
  async getRestaurantMenu(): Promise<any> {
    try {
      const response = await this.apiClient.get('/restaurants/menu');
      return response.data;
    } catch (error) {
      console.error('🔴 Failed to fetch Swiggy menu:', error);
      throw error;
    }
  }

  // Update menu item availability
  async updateMenuItemAvailability(itemId: string, isAvailable: boolean): Promise<boolean> {
    try {
      await this.apiClient.post(`/menu/items/${itemId}/availability`, {
        is_available: isAvailable
      });

      console.log(`✅ Swiggy menu item ${itemId} availability updated: ${isAvailable}`);
      return true;
    } catch (error) {
      console.error(`🔴 Failed to update Swiggy menu item ${itemId} availability:`, error);
      throw error;
    }
  }

  // Get integration status
  getStatus(): any {
    return {
      platform: 'swiggy',
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
    await integrationConfigService.enableIntegration('swiggy');
    await this.initializeConfig();
  }

  // Disable integration
  async disable(): Promise<void> {
    this.stopAutoSync();
    await integrationConfigService.disableIntegration('swiggy');
    this.config = integrationConfigService.getConfig('swiggy');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.apiClient.get('/restaurants/profile');
      console.log('✅ Swiggy connection test successful');
      integrationConfigService.resetErrorCount('swiggy');
      return true;
    } catch (error) {
      console.error('❌ Swiggy connection test failed:', error);
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
export const swiggyIntegrationService = new SwiggyIntegrationService();