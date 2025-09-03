import { create } from 'zustand';
import { DailySalesReport, MonthlySalesReport, ReportFilters } from '../types';
import { useNotificationStore } from './notificationStore';

interface ReportState {
  // State
  dailyReport: DailySalesReport | null;
  monthlyReport: MonthlySalesReport | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDailyReport: (date: string, filters: ReportFilters) => Promise<void>;
  fetchMonthlyReport: (
    month: string,
    year: number,
    filters: ReportFilters
  ) => Promise<void>;
  generateReport: (
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters
  ) => Promise<void>;
  regenerateReport: (
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters
  ) => Promise<void>;
  exportToPDF: (reportType?: 'daily' | 'monthly') => Promise<void>;
  printReport: (reportType?: 'daily' | 'monthly') => Promise<void>;
  clearCache: () => void;
}

export const useReportStore = create<ReportState>((set, get) => ({
  // Initial state
  dailyReport: null,
  monthlyReport: null,
  isLoading: false,
  error: null,

  // Fetch daily report
  fetchDailyReport: async (date: string) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API call - replace with actual service call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockDailyReport: DailySalesReport = {
        date,
        total_sales: 12500,
        total_orders: 45,
        cash_sales: 8000,
        card_sales: 3500,
        upi_sales: 1000,
        online_sales: 0,
        average_order_value: 277.78,
        top_selling_items: [
          {
            product_id: '1',
            product_name: 'Chocolate Cake',
            quantity_sold: 12,
            revenue: 2400,
          },
          {
            product_id: '2',
            product_name: 'Vanilla Ice Cream',
            quantity_sold: 18,
            revenue: 1800,
          },
          {
            product_id: '3',
            product_name: 'Brownie',
            quantity_sold: 15,
            revenue: 1500,
          },
        ],
        payment_method_breakdown: {
          cash: { count: 32, amount: 8000 },
          card: { count: 8, amount: 3500 },
          upi: { count: 5, amount: 1000 },
          online: { count: 0, amount: 0 },
        },
        hourly_sales: [
          { hour: 10, sales: 1200, orders: 4 },
          { hour: 11, sales: 1800, orders: 6 },
          { hour: 12, sales: 2200, orders: 8 },
          { hour: 13, sales: 1900, orders: 7 },
          { hour: 14, sales: 1600, orders: 6 },
          { hour: 15, sales: 1400, orders: 5 },
          { hour: 16, sales: 1200, orders: 4 },
          { hour: 17, sales: 1200, orders: 5 },
        ],
      };

      set({ dailyReport: mockDailyReport, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Load Daily Report',
        message: error.message,
      });
    }
  },

  // Fetch monthly report
  fetchMonthlyReport: async (month: string, year: number) => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API call - replace with actual service call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMonthlyReport: MonthlySalesReport = {
        month,
        year,
        total_sales: 285000,
        total_orders: 1020,
        total_profit: 85500,
        daily_breakdown: [
          { date: '2024-01-01', sales: 8500, orders: 32, profit: 2550 },
          { date: '2024-01-02', sales: 9200, orders: 35, profit: 2760 },
          { date: '2024-01-03', sales: 8800, orders: 33, profit: 2640 },
        ],
        top_selling_items: [
          {
            product_id: '1',
            product_name: 'Chocolate Cake',
            quantity_sold: 280,
            revenue: 56000,
            profit: 16800,
          },
          {
            product_id: '2',
            product_name: 'Vanilla Ice Cream',
            quantity_sold: 320,
            revenue: 32000,
            profit: 9600,
          },
          {
            product_id: '3',
            product_name: 'Brownie',
            quantity_sold: 250,
            revenue: 25000,
            profit: 7500,
          },
        ],
        payment_trends: {
          cash_percentage: 65,
          card_percentage: 25,
          upi_percentage: 8,
          online_percentage: 2,
        },
        stock_usage: [
          {
            inventory_item_id: '1',
            item_name: 'Flour',
            total_used: 150,
            cost: 3000,
          },
          {
            inventory_item_id: '2',
            item_name: 'Sugar',
            total_used: 120,
            cost: 2400,
          },
          {
            inventory_item_id: '3',
            item_name: 'Chocolate',
            total_used: 80,
            cost: 4000,
          },
        ],
      };

      set({ monthlyReport: mockMonthlyReport, isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Load Monthly Report',
        message: error.message,
      });
    }
  },

  // Generate report
  generateReport: async (
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters
  ) => {
    set({ isLoading: true, error: null });

    try {
      if (type === 'daily') {
        await get().fetchDailyReport(period, filters);
      } else {
        const [month, year] = period.split('-');
        await get().fetchMonthlyReport(month, parseInt(year), filters);
      }
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Regenerate report
  regenerateReport: async (
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters
  ) => {
    set({ isLoading: true, error: null });

    try {
      if (type === 'daily') {
        await get().fetchDailyReport(period, filters);
      } else {
        const [month, year] = period.split('-');
        await get().fetchMonthlyReport(month, parseInt(year), filters);
      }
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  // Export to PDF
  exportToPDF: async (reportType: 'daily' | 'monthly' = 'daily') => {
    try {
      // Simulate PDF export - replace with actual service call
      await new Promise(resolve => setTimeout(resolve, 2000));

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'PDF Exported',
        message: `${reportType} report exported successfully`,
      });
    } catch (error: any) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Export Failed',
        message: error.message,
      });
    }
  },

  // Print report
  printReport: async (reportType: 'daily' | 'monthly' = 'daily') => {
    try {
      // Simulate printing - replace with actual service call
      await new Promise(resolve => setTimeout(resolve, 1500));

      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Report Printed',
        message: `${reportType} report sent to printer`,
      });
    } catch (error: any) {
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Print Failed',
        message: error.message,
      });
    }
  },

  // Clear cache
  clearCache: () => {
    set({ dailyReport: null, monthlyReport: null });
  },
}));
