import { offlineStorageService } from './offlineStorageService';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { Order, CartItem, OrderItem, Payment } from '../types';
import { recipeService } from './recipeService';
import { inventoryService } from './inventoryService';

export class OrderService {
  // Generate order number
  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const timestamp = now.getTime().toString().slice(-6);

    return `ORD${year}${month}${day}${timestamp}`;
  }

  // Create order from cart
  async createOrder(
    cartItems: CartItem[],
    orderType: 'dine_in' | 'takeaway' | 'zomato' | 'swiggy',
    paymentMethod: 'cash' | 'card' | 'upi' | 'zomato' | 'swiggy',
    customerInfo?: {
      name?: string;
      phone?: string;
      email?: string;
      tableNumber?: string;
    }
  ): Promise<string> {
    const { user } = useAuthStore.getState();
    const { addNotification } = useNotificationStore.getState();

    if (!user) {
      throw new Error('User not authenticated');
    }

    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    try {
      // Step 1: Validate stock availability before processing
      const orderItems = cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
      }));

      const stockValidation =
        await recipeService.validateOrderStock(orderItems);

      if (!stockValidation.isValid) {
        const insufficientItems = stockValidation.insufficientItems
          .map(
            item =>
              `${item.item_name}: need ${item.required} ${item.unit}, have ${item.available} ${item.unit}`
          )
          .join(', ');

        throw new Error(`Insufficient stock: ${insufficientItems}`);
      }

      // Show warnings if any
      if (stockValidation.warnings.length > 0) {
        for (const warning of stockValidation.warnings) {
          addNotification({
            type: 'warning',
            title: 'Stock Warning',
            message: `${warning.item_name}: ${warning.message}`,
          });
        }
      }

      // Calculate totals
      const subtotal = cartItems.reduce(
        (sum, item) => sum + item.item_total,
        0
      );
      const discount_amount = 0; // Will be added from cart state
      const tax_amount = subtotal * 0.05; // 5% tax
      const total_amount = subtotal - discount_amount + tax_amount;

      // Generate order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create order items
      const orderItemsList: OrderItem[] = cartItems.map((cartItem, index) => ({
        id: `order_item_${orderId}_${index}`,
        order_id: orderId,
        product_id: cartItem.product.id,
        product_name: cartItem.product.name,
        product_price: cartItem.product.price,
        quantity: cartItem.quantity,
        item_total: cartItem.item_total,
        special_instructions: cartItem.special_instructions,
        created_at: new Date().toISOString(),
      }));

      // Create order
      const orderData: Order = {
        id: orderId,
        order_number: this.generateOrderNumber(),
        order_type: orderType,
        customer_name: customerInfo?.name,
        customer_phone: customerInfo?.phone,
        customer_email: customerInfo?.email,
        table_number: customerInfo?.tableNumber,
        subtotal,
        discount_amount,
        tax_amount,
        total_amount,
        status: 'pending',
        payment_status: 'pending',
        order_date: new Date().toISOString(),
        cashier_id: user.id,
        order_items: orderItemsList,
        payments: [],
        is_synced: false,
        can_edit: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save order in local storage
      await offlineStorageService.saveOrder(orderData);

      // Step 2: Process stock deduction
      try {
        const stockDeduction = await recipeService.processStockDeduction(
          orderId,
          orderItems,
          user.id
        );

        if (!stockDeduction.success) {
          // If stock deduction fails, we should cancel the order
          await offlineStorageService.updateOrder(orderId, {
            status: 'cancelled',
          });

          throw new Error(
            `Stock deduction failed: ${stockDeduction.errors.join(', ')}`
          );
        }

        // Log successful deductions
        console.log(
          '✅ Stock deducted successfully:',
          stockDeduction.deductedItems
        );

        addNotification({
          type: 'info',
          title: 'Stock Updated',
          message: `Stock deducted for ${stockDeduction.deductedItems.length} ingredients`,
        });
      } catch (stockError: any) {
        console.error('❌ Stock deduction failed:', stockError);

        // Cancel the order if stock deduction fails
        await offlineStorageService.updateOrder(orderId, {
          status: 'cancelled',
        });

        addNotification({
          type: 'error',
          title: 'Order Cancelled',
          message: 'Order cancelled due to stock deduction failure',
        });

        throw new Error(`Order cancelled: ${stockError.message}`);
      }

      // Create payment record
      const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const payment: Payment = {
        id: paymentId,
        order_id: orderId,
        payment_method: paymentMethod,
        amount: total_amount,
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        is_synced: false,
        created_at: new Date().toISOString(),
      };

      await offlineStorageService.savePayment(payment);

      // Update order with payment
      const updatedOrder = await offlineStorageService.getOrder(orderId);
      if (updatedOrder) {
        updatedOrder.payments = [payment];
        updatedOrder.status = 'confirmed';
        updatedOrder.payment_status = 'paid';
        updatedOrder.completed_at = new Date().toISOString();
        updatedOrder.updated_at = new Date().toISOString();
        await offlineStorageService.saveOrder(updatedOrder);
      }

      addNotification({
        type: 'success',
        title: 'Order Created',
        message: `Order ${orderData.order_number} created successfully`,
      });

      return orderId;
    } catch (error) {
      console.error('Failed to create order:', error);
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to create order. Please try again.',
      });
      throw error;
    }
  }

  // Get order with items
  async getOrderWithItems(
    orderId: string
  ): Promise<(Order & { order_items: OrderItem[] }) | null> {
    try {
      const result = await offlineStorageService.getOrderWithItems(orderId);
      return result || null;
    } catch (error) {
      console.error('Failed to get order:', error);
      return null;
    }
  }

  // Get recent orders
  async getRecentOrders(limit = 50): Promise<Order[]> {
    try {
      return await offlineStorageService.getAllOrders();
    } catch (error) {
      console.error('Failed to get recent orders:', error);
      return [];
    }
  }

  // Update order (admin only)
  async updateOrder(
    orderId: string,
    updates: Partial<Order>,
    adminApproval = false
  ): Promise<void> {
    const { user } = useAuthStore.getState();
    const { addNotification } = useNotificationStore.getState();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if user has permission to edit orders
    if (user.role !== 'admin' && user.role !== 'manager') {
      if (!adminApproval) {
        throw new Error('Admin approval required to edit orders');
      }
    }

    try {
      await offlineStorageService.updateOrder(orderId, updates);

      addNotification({
        type: 'success',
        title: 'Order Updated',
        message: 'Order has been updated successfully',
      });
    } catch (error) {
      console.error('Failed to update order:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update order. Please try again.',
      });
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<void> {
    const { user } = useAuthStore.getState();
    const { addNotification } = useNotificationStore.getState();

    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      // Get order details first
      const orderWithItems =
        await offlineStorageService.getOrderWithItems(orderId);

      if (!orderWithItems) {
        throw new Error('Order not found');
      }

      // Check if order can be cancelled
      if (orderWithItems.status === 'cancelled') {
        throw new Error('Order is already cancelled');
      }

      if (orderWithItems.status === 'completed') {
        throw new Error('Cannot cancel completed order');
      }

      // Reverse stock deductions if order was confirmed
      if (
        orderWithItems.status === 'confirmed' ||
        orderWithItems.status === 'preparing'
      ) {
        try {
          const orderItems = orderWithItems.order_items.map(
            (item: OrderItem) => ({
              product: {
                id: item.product_id,
                name: item.product_name,
                recipe_items: (item as any).product?.recipe_items || [],
              } as any,
              quantity: item.quantity,
            })
          );

          // Add back the stock that was deducted
          for (const orderItem of orderItems) {
            if (
              orderItem.product.recipe_items &&
              Array.isArray(orderItem.product.recipe_items)
            ) {
              for (const recipeItem of orderItem.product.recipe_items) {
                const totalToRestore = recipeItem.quantity * orderItem.quantity;

                await inventoryService.addStockTransaction({
                  inventory_item_id: recipeItem.inventory_id,
                  transaction_type: 'IN',
                  quantity: totalToRestore,
                  reference_type: 'ORDER',
                  reference_id: orderId,
                  notes: `Stock restored from cancelled order ${orderWithItems.order_number}`,
                });
              }
            }
          }

          addNotification({
            type: 'info',
            title: 'Stock Restored',
            message: 'Inventory has been restored for cancelled order',
          });
        } catch (stockError) {
          console.error('Failed to restore stock:', stockError);
          addNotification({
            type: 'warning',
            title: 'Stock Restoration Failed',
            message:
              'Order cancelled but stock could not be restored automatically',
          });
        }
      }

      await offlineStorageService.updateOrder(orderId, {
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      });

      addNotification({
        type: 'info',
        title: 'Order Cancelled',
        message: `Order ${orderWithItems.order_number} has been cancelled`,
      });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      addNotification({
        type: 'error',
        title: 'Cancel Failed',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to cancel order. Please try again.',
      });
      throw error;
    }
  }

  // Search orders
  async searchOrders(searchTerm: string): Promise<Order[]> {
    try {
      const orders = await offlineStorageService.getAllOrders();

      return orders.filter(
        order =>
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customer_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer_phone?.includes(searchTerm) ||
          order.table_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Failed to search orders:', error);
      return [];
    }
  }

  // Get orders by date range
  async getOrdersByDateRange(
    startDate: string,
    endDate: string,
    status?: string
  ): Promise<Order[]> {
    try {
      const filters: any = {};
      if (status) {
        filters.status = status;
      }

      const orders = await offlineStorageService.getAllOrders();

      return orders.filter(order => {
        const orderDate = new Date(order.order_date);
        const start = new Date(startDate);
        const end = new Date(endDate);

        return orderDate >= start && orderDate <= end;
      });
    } catch (error) {
      console.error('Failed to get orders by date range:', error);
      return [];
    }
  }

  // Get order statistics
  async getOrderStats(dateRange?: { start: string; end: string }): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByType: Record<string, number>;
    ordersByStatus: Record<string, number>;
  }> {
    try {
      let orders = await offlineStorageService.getAllOrders();

      if (dateRange) {
        orders = orders.filter(order => {
          const orderDate = new Date(order.order_date);
          const start = new Date(dateRange.start);
          const end = new Date(dateRange.end);

          return orderDate >= start && orderDate <= end;
        });
      }

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum: number, order: Order) => sum + order.total_amount,
        0
      );
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const ordersByType = orders.reduce(
        (acc: Record<string, number>, order: Order) => {
          acc[order.order_type] = (acc[order.order_type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const ordersByStatus = orders.reduce(
        (acc: Record<string, number>, order: Order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        ordersByType,
        ordersByStatus,
      };
    } catch (error) {
      console.error('Failed to get order stats:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        ordersByType: {},
        ordersByStatus: {},
      };
    }
  }

  // Check if items can be added to cart (stock validation)
  async validateCartItems(cartItems: CartItem[]): Promise<{
    isValid: boolean;
    warnings: string[];
    errors: string[];
  }> {
    const result = {
      isValid: true,
      warnings: [] as string[],
      errors: [] as string[],
    };

    if (cartItems.length === 0) {
      return result;
    }

    try {
      const orderItems = cartItems.map(item => ({
        product: item.product,
        quantity: item.quantity,
      }));

      const stockValidation =
        await recipeService.validateOrderStock(orderItems);

      if (!stockValidation.isValid) {
        result.isValid = false;
        result.errors = stockValidation.insufficientItems.map(
          item =>
            `${item.item_name}: need ${item.required} ${item.unit}, have ${item.available} ${item.unit}`
        );
      }

      if (stockValidation.warnings.length > 0) {
        result.warnings = stockValidation.warnings.map(
          warning => `${warning.item_name}: ${warning.message}`
        );
      }
    } catch (error) {
      console.error('Failed to validate cart items:', error);
      result.isValid = false;
      result.errors.push('Failed to validate stock availability');
    }

    return result;
  }
}

// Export singleton instance
export const orderService = new OrderService();
