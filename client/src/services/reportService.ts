import {
  DailySalesReport,
  MonthlySalesReport,
  ReportFilters,
  ReportSummary,
} from '../types';
import { API_BASE_URL } from '../config';

interface SalesSummaryResponse {
  date_from: string;
  date_to: string;
  total_sales: number;
  total_orders: number;
  total_cash: number;
  total_card: number;
  total_upi: number;
  total_online: number;
  daily_reports: DailySalesReport[];
}

interface TopSellingItem {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

interface PaymentAnalytics {
  cash: { count: number; amount: number; percentage: number };
  card: { count: number; amount: number; percentage: number };
  upi: { count: number; amount: number; percentage: number };
  online: { count: number; amount: number; percentage: number };
}

export class ReportService {
  private baseUrl = `${API_BASE_URL}/reports`;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get cached data or fetch from API
  private async getCachedOrFetch<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  }

  // Generate daily sales report
  async getDailySalesReport(
    date: string,
    filters: ReportFilters = {}
  ): Promise<DailySalesReport> {
    const params = new URLSearchParams();

    if (filters.payment_method && filters.payment_method !== 'all') {
      params.append('payment_method', filters.payment_method);
    }
    if (filters.order_type && filters.order_type !== 'all') {
      params.append('order_type', filters.order_type);
    }
    if (filters.cashier_id) {
      params.append('cashier_id', filters.cashier_id);
    }

    const url = `${this.baseUrl}/daily/${date}${params.toString() ? `?${params.toString()}` : ''}`;
    const cacheKey = `daily_${date}_${params.toString()}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await this.fetchWithAuth(url);
      return response.data;
    });
  }

  // Generate monthly sales report
  async getMonthlySalesReport(
    month: string,
    year: number,
    filters: ReportFilters = {}
  ): Promise<MonthlySalesReport> {
    const params = new URLSearchParams();

    if (filters.payment_method && filters.payment_method !== 'all') {
      params.append('payment_method', filters.payment_method);
    }
    if (filters.order_type && filters.order_type !== 'all') {
      params.append('order_type', filters.order_type);
    }
    if (filters.cashier_id) {
      params.append('cashier_id', filters.cashier_id);
    }

    const url = `${this.baseUrl}/monthly/${month}/${year}${params.toString() ? `?${params.toString()}` : ''}`;
    const cacheKey = `monthly_${month}_${year}_${params.toString()}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await this.fetchWithAuth(url);
      return response.data;
    });
  }

  // Get cached report
  async getCachedReport(
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters = {}
  ): Promise<DailySalesReport | MonthlySalesReport> {
    const params = new URLSearchParams();

    if (filters.payment_method && filters.payment_method !== 'all') {
      params.append('payment_method', filters.payment_method);
    }
    if (filters.order_type && filters.order_type !== 'all') {
      params.append('order_type', filters.order_type);
    }
    if (filters.cashier_id) {
      params.append('cashier_id', filters.cashier_id);
    }

    const url = `${this.baseUrl}/cached/${type}/${period}${params.toString() ? `?${params.toString()}` : ''}`;
    const cacheKey = `cached_${type}_${period}_${params.toString()}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await this.fetchWithAuth(url);
      return response.data;
    });
  }

  // Generate and store report
  async generateReport(
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters = {}
  ): Promise<DailySalesReport | MonthlySalesReport> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/generate`, {
      method: 'POST',
      body: JSON.stringify({ type, period, filters }),
    });

    // Clear cache for this report
    const cacheKey = `${type}_${period}_${new URLSearchParams(filters as any).toString()}`;
    this.cache.delete(cacheKey);

    return response.data;
  }

  // Get sales summary for date range
  async getSalesSummary(
    dateFrom: string,
    dateTo: string,
    filters: ReportFilters = {}
  ): Promise<SalesSummaryResponse> {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
    });

    if (filters.payment_method && filters.payment_method !== 'all') {
      params.append('payment_method', filters.payment_method);
    }
    if (filters.order_type && filters.order_type !== 'all') {
      params.append('order_type', filters.order_type);
    }
    if (filters.cashier_id) {
      params.append('cashier_id', filters.cashier_id);
    }

    const url = `${this.baseUrl}/summary?${params.toString()}`;
    const cacheKey = `summary_${dateFrom}_${dateTo}_${params.toString()}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await this.fetchWithAuth(url);
      return response.data;
    });
  }

  // Get top selling items
  async getTopSellingItems(
    dateFrom: string,
    dateTo: string,
    limit: number = 10,
    filters: ReportFilters = {}
  ): Promise<TopSellingItem[]> {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      limit: limit.toString(),
    });

    if (filters.payment_method && filters.payment_method !== 'all') {
      params.append('payment_method', filters.payment_method);
    }
    if (filters.order_type && filters.order_type !== 'all') {
      params.append('order_type', filters.order_type);
    }
    if (filters.cashier_id) {
      params.append('cashier_id', filters.cashier_id);
    }

    const url = `${this.baseUrl}/top-items?${params.toString()}`;
    const cacheKey = `top_items_${dateFrom}_${dateTo}_${limit}_${params.toString()}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await this.fetchWithAuth(url);
      return response.data;
    });
  }

  // Get payment analytics
  async getPaymentAnalytics(
    dateFrom: string,
    dateTo: string,
    filters: ReportFilters = {}
  ): Promise<PaymentAnalytics> {
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
    });

    if (filters.order_type && filters.order_type !== 'all') {
      params.append('order_type', filters.order_type);
    }
    if (filters.cashier_id) {
      params.append('cashier_id', filters.cashier_id);
    }

    const url = `${this.baseUrl}/payment-analytics?${params.toString()}`;
    const cacheKey = `payment_analytics_${dateFrom}_${dateTo}_${params.toString()}`;

    return this.getCachedOrFetch(cacheKey, async () => {
      const response = await this.fetchWithAuth(url);
      return response.data;
    });
  }

  // Regenerate report (for reprinting)
  async regenerateReport(
    type: 'daily' | 'monthly',
    period: string,
    filters: ReportFilters = {}
  ): Promise<DailySalesReport | MonthlySalesReport> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/regenerate/${type}/${period}`,
      {
        method: 'POST',
        body: JSON.stringify({ filters }),
      }
    );

    // Clear all related cache entries
    const cachePrefix = `${type}_${period}`;
    for (const [key] of this.cache) {
      if (key.startsWith(cachePrefix)) {
        this.cache.delete(key);
      }
    }

    return response.data;
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear();
  }

  // Clear specific cache entry
  clearCacheEntry(key: string): void {
    this.cache.delete(key);
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  // Store report offline (for local access)
  async storeReportOffline(
    type: 'daily' | 'monthly',
    period: string,
    data: DailySalesReport | MonthlySalesReport
  ): Promise<void> {
    try {
      const key = `offline_report_${type}_${period}`;
      const reportSummary: ReportSummary = {
        id: `${type}_${period}_${Date.now()}`,
        report_type: type,
        period,
        period_start: period,
        period_end: period,
        total_sales: 0,
        total_orders: 0,
        total_profit: 0,
        generated_at: new Date().toISOString(),
        generated_by: 'system',
        is_synced: false,
        export_formats: ['pdf', 'csv'],
        data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem(key, JSON.stringify(reportSummary));
    } catch (error) {
      console.error('Failed to store report offline:', error);
    }
  }

  // Get offline stored report
  async getOfflineReport(
    type: 'daily' | 'monthly',
    period: string
  ): Promise<ReportSummary | null> {
    try {
      const key = `offline_report_${type}_${period}`;
      const stored = localStorage.getItem(key);

      if (stored) {
        return JSON.parse(stored);
      }

      return null;
    } catch (error) {
      console.error('Failed to get offline report:', error);
      return null;
    }
  }

  // Get all offline reports
  async getAllOfflineReports(): Promise<ReportSummary[]> {
    try {
      const reports: ReportSummary[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('offline_report_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            reports.push(JSON.parse(stored));
          }
        }
      }

      return reports.sort(
        (a, b) =>
          new Date(b.generated_at).getTime() -
          new Date(a.generated_at).getTime()
      );
    } catch (error) {
      console.error('Failed to get offline reports:', error);
      return [];
    }
  }
}

export const reportService = new ReportService();
