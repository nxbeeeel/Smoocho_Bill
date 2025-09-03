import { recipeService, StockConsumption } from './recipeService';

export interface OrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  orderId: string;
  customerId?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  tableNumber?: number;
  isTakeaway: boolean;
}

export interface OrderProcessingResult {
  success: boolean;
  order: Order;
  errors: string[];
}

export class OrderService {
  private orders: Map<string, Order> = new Map();

  // Create a new order
  async createOrder(orderData: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const order: Order = {
      ...orderData,
      orderId: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.orders.set(order.orderId, order);
    return order;
  }

  // Process order (without consuming inventory)
  async processOrder(orderId: string): Promise<OrderProcessingResult> {
    const order = this.orders.get(orderId);
    if (!order) {
      return {
        success: false,
        order: {} as Order,
        errors: ['Order not found']
      };
    }

    if (order.status !== 'pending') {
      return {
        success: false,
        order,
        errors: ['Order is not in pending status']
      };
    }

    const errors: string[] = [];

    // Update order status to confirmed
    order.status = 'confirmed';
    order.updatedAt = new Date();
    this.orders.set(orderId, order);

    return {
      success: true,
      order,
      errors
    };
  }

  // Complete order (when customer receives the food)
  async completeOrder(orderId: string): Promise<Order | null> {
    const order = this.orders.get(orderId);
    if (!order) return null;

    order.status = 'completed';
    order.updatedAt = new Date();
    this.orders.set(orderId, order);
    
    return order;
  }

  // Cancel order
  async cancelOrder(orderId: string, reason: string): Promise<{
    success: boolean;
    order: Order | null;
    errors: string[];
  }> {
    const order = this.orders.get(orderId);
    if (!order) {
      return { success: false, order: null, errors: ['Order not found'] };
    }

    if (order.status === 'completed') {
      return { success: false, order, errors: ['Cannot cancel completed order'] };
    }

    order.status = 'cancelled';
    order.notes = `Cancelled: ${reason}`;
    order.updatedAt = new Date();
    
    this.orders.set(orderId, order);

    return {
      success: true,
      order,
      errors: []
    };
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  // Get all orders with optional filters
  async getOrders(filters: {
    status?: string;
    customerId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}): Promise<Order[]> {
    let orders = Array.from(this.orders.values());

    if (filters.status) {
      orders = orders.filter(order => order.status === filters.status);
    }

    if (filters.customerId) {
      orders = orders.filter(order => order.customerId === filters.customerId);
    }

    if (filters.startDate) {
      orders = orders.filter(order => order.createdAt >= filters.startDate!);
    }

    if (filters.endDate) {
      orders = orders.filter(order => order.createdAt <= filters.endDate!);
    }

    // Sort by creation date (newest first)
    orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (filters.limit) {
      orders = orders.slice(0, filters.limit);
    }

    return orders;
  }

  // Get order statistics
  async getOrderStatistics(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topSellingItems: Array<{ menuItemId: string; name: string; quantity: number; revenue: number }>;
    orderStatusBreakdown: Record<string, number>;
  }> {
    const orders = await this.getOrders();
    
    // Filter by timeframe
    const now = new Date();
    let filteredOrders = orders;
    
    if (timeframe === 'daily') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filteredOrders = orders.filter(order => order.createdAt >= startOfDay);
    } else if (timeframe === 'weekly') {
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredOrders = orders.filter(order => order.createdAt >= startOfWeek);
    } else if (timeframe === 'monthly') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredOrders = orders.filter(order => order.createdAt >= startOfMonth);
    }

    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate top selling items
    const itemSales = new Map<string, { menuItemId: string; name: string; quantity: number; revenue: number }>();
    
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = itemSales.get(item.menuItemId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.totalPrice;
        } else {
          itemSales.set(item.menuItemId, {
            menuItemId: item.menuItemId,
            name: item.menuItemName,
            quantity: item.quantity,
            revenue: item.totalPrice
          });
        }
      });
    });

    const topSellingItems = Array.from(itemSales.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Calculate order status breakdown
    const orderStatusBreakdown: Record<string, number> = {};
    filteredOrders.forEach(order => {
      orderStatusBreakdown[order.status] = (orderStatusBreakdown[order.status] || 0) + 1;
    });

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      topSellingItems,
      orderStatusBreakdown
    };
  }

  // Get low stock alerts for all menu items (from inventory service)
  async getLowStockAlerts(): Promise<{
    critical: Array<{ menuItem: string; ingredient: string; currentStock: number; minimumStock: number }>;
    warning: Array<{ menuItem: string; ingredient: string; currentStock: number; minimumStock: number }>;
  }> {
    return await recipeService.getLowStockAlerts();
  }
}

export const orderService = new OrderService();
