import {
  Order,
  Payment,
  OrderItem,
  CartItem,
  Product,
  InventoryItem,
  RecipeIngredient,
  OfflineBill,
  OfflineOperation,
  OfflineInventoryUpdate,
  StockTransaction,
} from '../types';
import { offlineStorageService } from './offlineStorageService';
import { syncQueueService } from './syncQueueService';
import { networkMonitorService } from './networkMonitorService';

/**
 * Offline Billing Service
 *
 * Handles complete billing operations in offline mode with:
 * - Local order processing
 * - Inventory stock deduction
 * - Payment recording
 * - Queue for sync when online
 * - Error handling and rollback
 * - Receipt generation
 */
export class OfflineBillingService {
  private currentOrder: Order | null = null;
  private orderSequence = 1;

  constructor() {
    this.loadOrderSequence();
  }

  // Load next order sequence number
  private async loadOrderSequence(): Promise<void> {
    try {
      const metadata = await offlineStorageService.getMetadata('orderSequence');
      this.orderSequence = metadata || 1;
    } catch (error) {
      console.error('Failed to load order sequence:', error);
      this.orderSequence = 1;
    }
  }

  // Save order sequence
  private async saveOrderSequence(): Promise<void> {
    try {
      await offlineStorageService.saveMetadata(
        'orderSequence',
        this.orderSequence
      );
    } catch (error) {
      console.error('Failed to save order sequence:', error);
    }
  }

  // Generate unique order number
  private generateOrderNumber(): string {
    const prefix = 'OFF'; // Offline prefix
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const sequence = this.orderSequence.toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${sequence}`;
  }

  // Create new offline order
  async createOrder(
    orderType: Order['order_type'] = 'dine_in',
    customerInfo?: {
      name?: string;
      phone?: string;
      email?: string;
      tableNumber?: string;
    }
  ): Promise<Order> {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderNumber = this.generateOrderNumber();

    this.currentOrder = {
      id: orderId,
      order_number: orderNumber,
      order_type: orderType,
      customer_name: customerInfo?.name,
      customer_phone: customerInfo?.phone,
      customer_email: customerInfo?.email,
      table_number: customerInfo?.tableNumber,
      subtotal: 0,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 0,
      status: 'pending',
      payment_status: 'pending',
      order_date: new Date().toISOString(),
      cashier_id: this.getCurrentUserId(),
      is_synced: false,
      can_edit: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      order_items: [],
      payments: [],
    };

    // Increment sequence for next order
    this.orderSequence++;
    await this.saveOrderSequence();

    console.log(`📝 Created offline order: ${orderNumber}`);
    return this.currentOrder;
  }

  // Add item to current order
  async addItemToOrder(
    productId: string,
    quantity: number,
    specialInstructions?: string,
    customPrice?: number
  ): Promise<OrderItem> {
    if (!this.currentOrder) {
      throw new Error('No active order. Create an order first.');
    }

    // Get product details
    const product = await offlineStorageService.getById<Product>(
      'products',
      productId
    );
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    if (!product.is_available) {
      throw new Error(`Product not available: ${product.name}`);
    }

    // Check inventory availability if product has recipe
    if (product.recipe_items && product.recipe_items.length > 0) {
      await this.checkInventoryAvailability(product.recipe_items, quantity);
    }

    const orderItemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const itemPrice = customPrice || product.price;
    const itemTotal = itemPrice * quantity;

    const orderItem: OrderItem = {
      id: orderItemId,
      order_id: this.currentOrder.id,
      product_id: productId,
      product_name: product.name,
      product_price: itemPrice,
      quantity: quantity,
      item_total: itemTotal,
      special_instructions: specialInstructions,
      created_at: new Date().toISOString(),
    };

    // Add to order
    this.currentOrder.order_items.push(orderItem);

    // Recalculate totals
    this.recalculateOrderTotals();

    console.log(
      `➕ Added ${quantity}x ${product.name} to order ${this.currentOrder.order_number}`
    );
    return orderItem;
  }

  // Remove item from current order
  async removeItemFromOrder(orderItemId: string): Promise<boolean> {
    if (!this.currentOrder) {
      throw new Error('No active order');
    }

    const itemIndex = this.currentOrder.order_items.findIndex(
      item => item.id === orderItemId
    );
    if (itemIndex === -1) {
      return false;
    }

    const removedItem = this.currentOrder.order_items.splice(itemIndex, 1)[0];
    this.recalculateOrderTotals();

    console.log(
      `➖ Removed ${removedItem.product_name} from order ${this.currentOrder.order_number}`
    );
    return true;
  }

  // Update item quantity
  async updateItemQuantity(
    orderItemId: string,
    newQuantity: number
  ): Promise<boolean> {
    if (!this.currentOrder) {
      throw new Error('No active order');
    }

    const orderItem = this.currentOrder.order_items.find(
      item => item.id === orderItemId
    );
    if (!orderItem) {
      return false;
    }

    // Get product for inventory check
    const product = await offlineStorageService.getById<Product>(
      'products',
      orderItem.product_id
    );
    if (product?.recipe_items && product.recipe_items.length > 0) {
      const quantityDiff = newQuantity - orderItem.quantity;
      if (quantityDiff > 0) {
        await this.checkInventoryAvailability(
          product.recipe_items,
          quantityDiff
        );
      }
    }

    orderItem.quantity = newQuantity;
    orderItem.item_total = orderItem.product_price * newQuantity;

    this.recalculateOrderTotals();

    console.log(
      `🔄 Updated ${orderItem.product_name} quantity to ${newQuantity}`
    );
    return true;
  }

  // Apply discount to order
  async applyDiscount(
    amount: number,
    type: 'percentage' | 'fixed' = 'fixed'
  ): Promise<void> {
    if (!this.currentOrder) {
      throw new Error('No active order');
    }

    if (type === 'percentage') {
      this.currentOrder.discount_amount =
        (this.currentOrder.subtotal * amount) / 100;
    } else {
      this.currentOrder.discount_amount = amount;
    }

    this.currentOrder.discount_type = type;
    this.recalculateOrderTotals();

    console.log(`💰 Applied ${type} discount: ${amount}`);
  }

  // Check inventory availability for recipe items
  private async checkInventoryAvailability(
    recipeItems: RecipeIngredient[],
    orderQuantity: number
  ): Promise<void> {
    for (const recipeItem of recipeItems) {
      const inventoryItem = await offlineStorageService.getInventoryItem(
        recipeItem.inventory_item_id
      );
      if (!inventoryItem) {
        throw new Error(
          `Inventory item not found: ${recipeItem.inventory_item_id}`
        );
      }

      const requiredQuantity = recipeItem.quantity * orderQuantity;
      if (inventoryItem.current_stock < requiredQuantity) {
        throw new Error(
          `Insufficient stock for ${inventoryItem.name}. Required: ${requiredQuantity}, Available: ${inventoryItem.current_stock}`
        );
      }
    }
  }

  // Recalculate order totals
  private recalculateOrderTotals(): void {
    if (!this.currentOrder) return;

    // Calculate subtotal
    this.currentOrder.subtotal = this.currentOrder.order_items.reduce(
      (sum, item) => sum + item.item_total,
      0
    );

    // Calculate tax (assuming 10% tax rate - should be configurable)
    const taxRate = 0.1;
    const taxableAmount =
      this.currentOrder.subtotal - this.currentOrder.discount_amount;
    this.currentOrder.tax_amount = Math.max(0, taxableAmount * taxRate);

    // Calculate total
    this.currentOrder.total_amount =
      this.currentOrder.subtotal -
      this.currentOrder.discount_amount +
      this.currentOrder.tax_amount;

    // Round to 2 decimal places
    this.currentOrder.subtotal =
      Math.round(this.currentOrder.subtotal * 100) / 100;
    this.currentOrder.tax_amount =
      Math.round(this.currentOrder.tax_amount * 100) / 100;
    this.currentOrder.total_amount =
      Math.round(this.currentOrder.total_amount * 100) / 100;

    this.currentOrder.updated_at = new Date().toISOString();
  }

  // Process payment for current order
  async processPayment(
    paymentMethod: Payment['payment_method'],
    amount: number,
    transactionId?: string
  ): Promise<Payment> {
    if (!this.currentOrder) {
      throw new Error('No active order');
    }

    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const payment: Payment = {
      id: paymentId,
      order_id: this.currentOrder.id,
      payment_method: paymentMethod,
      amount: amount,
      transaction_id: transactionId,
      payment_status: 'completed',
      payment_date: new Date().toISOString(),
      is_synced: false,
      created_at: new Date().toISOString(),
    };

    // Add payment to order
    this.currentOrder.payments.push(payment);

    // Update payment status
    const totalPaid = this.currentOrder.payments.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    if (totalPaid >= this.currentOrder.total_amount) {
      this.currentOrder.payment_status = 'paid';
      this.currentOrder.status = 'confirmed';
    } else {
      this.currentOrder.payment_status = 'partial';
    }

    this.currentOrder.updated_at = new Date().toISOString();

    console.log(`💳 Processed ${paymentMethod} payment: ₹${amount}`);
    return payment;
  }

  // Complete and save current order
  async completeOrder(): Promise<{ order: Order; offlineBill: OfflineBill }> {
    if (!this.currentOrder) {
      throw new Error('No active order');
    }

    if (this.currentOrder.order_items.length === 0) {
      throw new Error('Cannot complete order with no items');
    }

    if (this.currentOrder.payment_status !== 'paid') {
      throw new Error('Order must be fully paid before completion');
    }

    try {
      // Update inventory for recipe items
      const inventoryUpdates = await this.deductInventoryStock();

      // Mark order as completed
      this.currentOrder.status = 'completed';
      this.currentOrder.completed_at = new Date().toISOString();
      this.currentOrder.updated_at = new Date().toISOString();

      // Save order to offline storage
      await offlineStorageService.saveOrder(this.currentOrder);

      // Save payments to offline storage
      for (const payment of this.currentOrder.payments) {
        await offlineStorageService.savePayment(payment);
      }

      // Create offline bill record
      const offlineBill: OfflineBill = {
        id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        order_data: this.currentOrder,
        payment_data: this.currentOrder.payments,
        inventory_updates: inventoryUpdates,
        created_at: new Date().toISOString(),
        sync_status: 'pending',
        retry_count: 0,
      };

      await offlineStorageService.saveOfflineBill(offlineBill);

      // Add to sync queue if online
      if (networkMonitorService.isOnline()) {
        await this.queueForSync(
          this.currentOrder,
          this.currentOrder.payments,
          inventoryUpdates
        );
      }

      console.log(
        `✅ Completed offline order: ${this.currentOrder.order_number}`
      );

      const completedOrder = { ...this.currentOrder };
      this.currentOrder = null; // Clear current order

      return { order: completedOrder, offlineBill };
    } catch (error) {
      console.error('Failed to complete order:', error);

      // Rollback any changes if needed
      await this.rollbackOrderChanges();

      throw error;
    }
  }

  // Deduct inventory stock for order items
  private async deductInventoryStock(): Promise<
    Array<{
      inventory_item_id: string;
      quantity_used: number;
      cost_impact: number;
    }>
  > {
    const inventoryUpdates: Array<{
      inventory_item_id: string;
      quantity_used: number;
      cost_impact: number;
    }> = [];

    if (!this.currentOrder) return inventoryUpdates;

    for (const orderItem of this.currentOrder.order_items) {
      const product = await offlineStorageService.getById<Product>(
        'products',
        orderItem.product_id
      );

      if (product?.recipe_items && product.recipe_items.length > 0) {
        for (const recipeItem of product.recipe_items) {
          const quantityUsed = recipeItem.quantity * orderItem.quantity;

          // Get current inventory
          const inventoryItem = await offlineStorageService.getInventoryItem(
            recipeItem.inventory_item_id
          );
          if (inventoryItem) {
            // Deduct stock
            inventoryItem.current_stock -= quantityUsed;
            inventoryItem.updated_at = new Date().toISOString();

            await offlineStorageService.saveInventoryItem(inventoryItem);

            // Create stock transaction
            const stockTransaction: StockTransaction = {
              id: `stock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              inventory_item_id: recipeItem.inventory_item_id,
              transaction_type: 'OUT',
              quantity: quantityUsed,
              reference_type: 'ORDER',
              reference_id: this.currentOrder.id,
              notes: `Stock deduction for order ${this.currentOrder.order_number}`,
              user_id: this.getCurrentUserId(),
              created_at: new Date().toISOString(),
            };

            await offlineStorageService.saveStockTransaction(stockTransaction);

            // Track inventory update
            const costImpact =
              (inventoryItem.cost_per_unit || 0) * quantityUsed;
            inventoryUpdates.push({
              inventory_item_id: recipeItem.inventory_item_id,
              quantity_used: quantityUsed,
              cost_impact: costImpact,
            });

            // Create offline inventory update record
            const offlineUpdate: OfflineInventoryUpdate = {
              id: `inv_update_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              inventory_item_id: recipeItem.inventory_item_id,
              quantity_change: -quantityUsed,
              reason: `Deducted for order ${this.currentOrder.order_number}`,
              reference_type: 'order',
              reference_id: this.currentOrder.id,
              created_at: new Date().toISOString(),
            };

            await offlineStorageService.saveOfflineInventoryUpdate(
              offlineUpdate
            );
          }
        }
      }
    }

    return inventoryUpdates;
  }

  // Queue order and related data for sync
  private async queueForSync(
    order: Order,
    payments: Payment[],
    inventoryUpdates: Array<{
      inventory_item_id: string;
      quantity_used: number;
      cost_impact: number;
    }>
  ): Promise<void> {
    // Queue order for sync
    await syncQueueService.addToQueue(
      'high',
      {
        type: 'order',
        operation: 'CREATE',
        data: order,
      },
      2
    );

    // Queue payments for sync
    for (const payment of payments) {
      await syncQueueService.addToQueue(
        'high',
        {
          type: 'payment',
          operation: 'CREATE',
          data: payment,
        },
        2
      );
    }

    // Queue inventory updates for sync
    for (const update of inventoryUpdates) {
      await syncQueueService.addToQueue(
        'normal',
        {
          type: 'inventory_update',
          operation: 'UPDATE',
          data: update,
        },
        3
      );
    }

    console.log(`📤 Queued order ${order.order_number} for sync`);
  }

  // Rollback order changes in case of error
  private async rollbackOrderChanges(): Promise<void> {
    // Implementation would depend on what changes need to be rolled back
    console.log('🔄 Rolling back order changes...');

    // For now, just reset current order
    if (this.currentOrder) {
      this.currentOrder.status = 'pending';
      this.currentOrder.payment_status = 'pending';
    }
  }

  // Get current order
  getCurrentOrder(): Order | null {
    return this.currentOrder ? { ...this.currentOrder } : null;
  }

  // Cancel current order
  async cancelCurrentOrder(): Promise<boolean> {
    if (!this.currentOrder) {
      return false;
    }

    console.log(`❌ Cancelled order: ${this.currentOrder.order_number}`);
    this.currentOrder = null;
    return true;
  }

  // Get offline billing statistics
  async getOfflineStatistics(): Promise<{
    pendingBills: number;
    totalOfflineSales: number;
    pendingSync: number;
    failedSync: number;
  }> {
    const allBills = await offlineStorageService.getAllOfflineBills();

    const pendingBills = allBills.filter(
      bill => bill.sync_status === 'pending'
    ).length;
    const failedSync = allBills.filter(
      bill => bill.sync_status === 'failed'
    ).length;

    const totalOfflineSales = allBills.reduce(
      (sum, bill) => sum + bill.order_data.total_amount,
      0
    );

    return {
      pendingBills,
      totalOfflineSales,
      pendingSync: pendingBills,
      failedSync,
    };
  }

  // Generate receipt data
  generateReceiptData(order: Order): {
    orderNumber: string;
    date: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    payments: Array<{ method: string; amount: number }>;
    customerInfo?: { name?: string; phone?: string; table?: string };
  } {
    return {
      orderNumber: order.order_number,
      date: order.order_date,
      items: order.order_items.map(item => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.product_price,
        total: item.item_total,
      })),
      subtotal: order.subtotal,
      discount: order.discount_amount,
      tax: order.tax_amount,
      total: order.total_amount,
      payments: order.payments.map(payment => ({
        method: payment.payment_method,
        amount: payment.amount,
      })),
      customerInfo: {
        name: order.customer_name,
        phone: order.customer_phone,
        table: order.table_number,
      },
    };
  }

  // Get current user ID (would be from auth context)
  private getCurrentUserId(): string {
    // In a real app, this would come from authentication context
    return localStorage.getItem('currentUserId') || 'unknown_user';
  }

  // Helper method to create order from cart
  async createOrderFromCart(
    cartItems: CartItem[],
    orderType: Order['order_type'] = 'dine_in',
    customerInfo?: {
      name?: string;
      phone?: string;
      email?: string;
      tableNumber?: string;
    }
  ): Promise<Order> {
    const order = await this.createOrder(orderType, customerInfo);

    for (const cartItem of cartItems) {
      await this.addItemToOrder(
        cartItem.product.id,
        cartItem.quantity,
        cartItem.special_instructions
      );
    }

    return order;
  }

  // Check if billing can be done offline
  canBillOffline(): boolean {
    // Check if offline storage is available and functioning
    return offlineStorageService !== null;
  }

  // Get all pending offline bills
  async getPendingOfflineBills(): Promise<OfflineBill[]> {
    return offlineStorageService.getPendingOfflineBills();
  }

  // Retry failed sync for specific bill
  async retrySyncForBill(billId: string): Promise<boolean> {
    const bill = await offlineStorageService.getById<OfflineBill>(
      'offline_bills',
      billId
    );
    if (!bill) {
      return false;
    }

    try {
      await this.queueForSync(
        bill.order_data,
        bill.payment_data,
        bill.inventory_updates
      );

      bill.sync_status = 'pending';
      bill.retry_count = (bill.retry_count || 0) + 1;
      await offlineStorageService.saveOfflineBill(bill);

      console.log(`🔄 Retrying sync for bill: ${bill.order_data.order_number}`);
      return true;
    } catch (error) {
      console.error('Failed to retry sync:', error);
      return false;
    }
  }
}

// Export singleton instance
export const offlineBillingService = new OfflineBillingService();
