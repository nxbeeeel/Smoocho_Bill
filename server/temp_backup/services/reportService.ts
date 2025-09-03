import { 
  DailySalesReport, 
  MonthlySalesReport, 
  ReportFilters,
  Order,
  OrderItem,
  Payment,
  Product,
  InventoryItem 
} from '../types';

export class ReportService {
  
  // Generate daily sales report
  async generateDailySalesReport(
    date: string, 
    filters: ReportFilters = {}
  ): Promise<DailySalesReport> {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      // This would be replaced with actual database queries
      const orders = await this.getOrdersInDateRange(startDate, endDate, filters);
      const payments = await this.getPaymentsForOrders(orders.map(o => o.id));
      
      // Calculate totals
      const totalOrders = orders.length;
      const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Payment method breakdown
      const paymentBreakdown = this.calculatePaymentBreakdown(payments, filters);
      
      // Get sales by payment method
      const cashSales = paymentBreakdown.cash.amount;
      const cardSales = paymentBreakdown.card.amount;
      const upiSales = paymentBreakdown.upi.amount;
      const onlineSales = paymentBreakdown.online.amount;

      // Top selling items
      const topSellingItems = await this.calculateTopSellingItems(orders);
      
      // Hourly sales breakdown
      const hourlySales = this.calculateHourlySales(orders);

      const report: DailySalesReport = {
        date,
        total_sales: totalSales,
        total_orders: totalOrders,
        cash_sales: cashSales,
        card_sales: cardSales,
        upi_sales: upiSales,
        online_sales: onlineSales,
        average_order_value: averageOrderValue,
        top_selling_items: topSellingItems,
        payment_method_breakdown: paymentBreakdown,
        hourly_sales: hourlySales
      };

      return report;

    } catch (error) {
      console.error('Failed to generate daily sales report:', error);
      throw new Error('Failed to generate daily sales report');
    }
  }

  // Generate monthly sales report
  async generateMonthlySalesReport(
    month: string, 
    year: number, 
    filters: ReportFilters = {}
  ): Promise<MonthlySalesReport> {
    try {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0, 23, 59, 59, 999);

      const orders = await this.getOrdersInDateRange(startDate, endDate, filters);
      const payments = await this.getPaymentsForOrders(orders.map(o => o.id));
      
      // Calculate totals
      const totalOrders = orders.length;
      const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0);
      
      // Calculate profit (requires product cost data)
      const totalProfit = await this.calculateTotalProfit(orders);
      
      // Daily breakdown
      const dailyBreakdown = this.calculateDailyBreakdown(orders);
      
      // Top selling items with profit
      const topSellingItems = await this.calculateTopSellingItemsWithProfit(orders);
      
      // Payment trends
      const paymentTrends = this.calculatePaymentTrends(payments);
      
      // Stock usage for the month
      const stockUsage = await this.calculateStockUsage(startDate, endDate);

      const report: MonthlySalesReport = {
        month,
        year,
        total_sales: totalSales,
        total_orders: totalOrders,
        total_profit: totalProfit,
        daily_breakdown: dailyBreakdown,
        top_selling_items: topSellingItems,
        payment_trends: paymentTrends,
        stock_usage: stockUsage
      };

      return report;

    } catch (error) {
      console.error('Failed to generate monthly sales report:', error);
      throw new Error('Failed to generate monthly sales report');
    }
  }

  // Helper method to get orders in date range
  private async getOrdersInDateRange(
    startDate: Date, 
    endDate: Date, 
    filters: ReportFilters
  ): Promise<Order[]> {
    // This would be replaced with actual database query
    // For now, returning mock data structure
    const mockOrders: Order[] = [];
    
    // Apply filters
    let filteredOrders = mockOrders.filter(order => {
      const orderDate = new Date(order.order_date);
      return orderDate >= startDate && orderDate <= endDate;
    });

    if (filters.payment_method && filters.payment_method !== 'all') {
      // Filter by payment method would require joining with payments table
    }

    if (filters.order_type && filters.order_type !== 'all') {
      filteredOrders = filteredOrders.filter(order => 
        order.order_type === filters.order_type
      );
    }

    if (filters.cashier_id) {
      filteredOrders = filteredOrders.filter(order => 
        order.cashier_id === filters.cashier_id
      );
    }

    return filteredOrders;
  }

  // Helper method to get payments for orders
  private async getPaymentsForOrders(orderIds: string[]): Promise<Payment[]> {
    // This would be replaced with actual database query
    return [];
  }

  // Calculate payment method breakdown
  private calculatePaymentBreakdown(payments: Payment[], filters: ReportFilters) {
    const breakdown = {
      cash: { count: 0, amount: 0 },
      card: { count: 0, amount: 0 },
      upi: { count: 0, amount: 0 },
      online: { count: 0, amount: 0 }
    };

    payments.forEach(payment => {
      if (payment.payment_status === 'completed') {
        switch (payment.payment_method) {
          case 'cash':
            breakdown.cash.count++;
            breakdown.cash.amount += payment.amount;
            break;
          case 'card':
            breakdown.card.count++;
            breakdown.card.amount += payment.amount;
            break;
          case 'upi':
            breakdown.upi.count++;
            breakdown.upi.amount += payment.amount;
            break;
          case 'zomato':
          case 'swiggy':
            breakdown.online.count++;
            breakdown.online.amount += payment.amount;
            break;
        }
      }
    });

    return breakdown;
  }

  // Calculate top selling items
  private async calculateTopSellingItems(orders: Order[]) {
    const itemSales = new Map<string, {
      product_id: string;
      product_name: string;
      quantity_sold: number;
      revenue: number;
    }>();

    orders.forEach(order => {
      order.order_items?.forEach((item: OrderItem) => {
        const key = item.product_id;
        const existing = itemSales.get(key);
        
        if (existing) {
          existing.quantity_sold += item.quantity;
          existing.revenue += item.item_total;
        } else {
          itemSales.set(key, {
            product_id: item.product_id,
            product_name: item.product_name,
            quantity_sold: item.quantity,
            revenue: item.item_total
          });
        }
      });
    });

    return Array.from(itemSales.values())
      .sort((a, b) => b.quantity_sold - a.quantity_sold)
      .slice(0, 10);
  }

  // Calculate top selling items with profit
  private async calculateTopSellingItemsWithProfit(orders: Order[]) {
    const itemSales = new Map<string, {
      product_id: string;
      product_name: string;
      quantity_sold: number;
      revenue: number;
      profit: number;
    }>();

    orders.forEach(order => {
      order.order_items?.forEach((item: OrderItem) => {
        const key = item.product_id;
        const existing = itemSales.get(key);
        
        // Calculate profit (revenue - cost)
        // This would require product cost data
        const profit = item.item_total * 0.3; // Mock 30% profit margin
        
        if (existing) {
          existing.quantity_sold += item.quantity;
          existing.revenue += item.item_total;
          existing.profit += profit;
        } else {
          itemSales.set(key, {
            product_id: item.product_id,
            product_name: item.product_name,
            quantity_sold: item.quantity,
            revenue: item.item_total,
            profit: profit
          });
        }
      });
    });

    return Array.from(itemSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  // Calculate hourly sales
  private calculateHourlySales(orders: Order[]) {
    const hourlySales = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      sales: 0,
      orders: 0
    }));

    orders.forEach(order => {
      const hour = new Date(order.order_date).getHours();
      hourlySales[hour].sales += order.total_amount;
      hourlySales[hour].orders += 1;
    });

    return hourlySales;
  }

  // Calculate daily breakdown for monthly report
  private calculateDailyBreakdown(orders: Order[]) {
    const dailyMap = new Map<string, {
      date: string;
      sales: number;
      orders: number;
      profit: number;
    }>();

    orders.forEach(order => {
      const date = new Date(order.order_date).toISOString().split('T')[0];
      const existing = dailyMap.get(date);
      const profit = order.total_amount * 0.3; // Mock profit calculation
      
      if (existing) {
        existing.sales += order.total_amount;
        existing.orders += 1;
        existing.profit += profit;
      } else {
        dailyMap.set(date, {
          date,
          sales: order.total_amount,
          orders: 1,
          profit: profit
        });
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  // Calculate payment trends
  private calculatePaymentTrends(payments: Payment[]) {
    const total = payments.reduce((sum, p) => 
      p.payment_status === 'completed' ? sum + p.amount : sum, 0
    );
    
    if (total === 0) {
      return {
        cash_percentage: 0,
        card_percentage: 0,
        upi_percentage: 0,
        online_percentage: 0
      };
    }

    const breakdown = this.calculatePaymentBreakdown(payments, {});
    
    return {
      cash_percentage: (breakdown.cash.amount / total) * 100,
      card_percentage: (breakdown.card.amount / total) * 100,
      upi_percentage: (breakdown.upi.amount / total) * 100,
      online_percentage: (breakdown.online.amount / total) * 100
    };
  }

  // Calculate total profit
  private async calculateTotalProfit(orders: Order[]): Promise<number> {
    // This would require actual cost data from products and inventory
    // For now, returning mock calculation
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    return totalRevenue * 0.3; // Mock 30% profit margin
  }

  // Calculate stock usage
  private async calculateStockUsage(startDate: Date, endDate: Date) {
    // This would query the stock_transactions table
    // For now, returning mock data
    return [
      {
        inventory_item_id: '1',
        item_name: 'Coffee Beans',
        total_used: 50,
        cost: 2500
      }
    ];
  }

  // Get cached report or generate new one
  async getCachedReport(
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters = {}
  ): Promise<DailySalesReport | MonthlySalesReport> {
    // Check if report exists in cache/database
    // If not, generate new report
    
    if (type === 'daily') {
      return this.generateDailySalesReport(period, filters);
    } else {
      const [month, year] = period.split('-');
      return this.generateMonthlySalesReport(month, parseInt(year), filters);
    }
  }

  // Store report for future retrieval
  async storeReport(
    type: 'daily' | 'monthly',
    period: string,
    data: DailySalesReport | MonthlySalesReport
  ): Promise<void> {
    // Store report in database for offline access
    // This would be implemented with actual database operations
    console.log(`Storing ${type} report for ${period}`);
  }
}

export const reportService = new ReportService();