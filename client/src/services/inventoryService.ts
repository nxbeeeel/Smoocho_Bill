import { InventoryItem, StockTransaction } from '../types';
import { API_BASE_URL } from '../config';

interface StockUsageReport {
  inventory_item: {
    id: string;
    name: string;
    unit: string;
  };
  total_used: number;
  transaction_count: number;
  transactions: StockTransaction[];
}

interface StockSummary {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiringItemsCount: number;
  totalStockValue: number;
}

interface StockAvailability {
  product_id: string;
  product_name: string;
  is_available: boolean;
  insufficient_items: string[];
}

export class InventoryService {
  private baseUrl = `${API_BASE_URL}/inventory`;

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

  // Get all inventory items with optional filters
  async getAllItems(filters?: {
    isActive?: boolean;
    lowStock?: boolean;
    expiringSoon?: boolean;
    search?: string;
  }): Promise<InventoryItem[]> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${this.baseUrl}/items${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.fetchWithAuth(url);
    return response.data;
  }

  // Get single inventory item by ID
  async getItemById(id: string): Promise<InventoryItem> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/items/${id}`);
    return response.data;
  }

  // Create new inventory item
  async createItem(data: {
    name: string;
    unit: string;
    current_stock?: number;
    minimum_stock?: number;
    cost_per_unit?: number;
    supplier_name?: string;
    supplier_contact?: string;
    expiry_date?: string;
  }): Promise<InventoryItem> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Update inventory item
  async updateItem(
    id: string,
    data: Partial<InventoryItem>
  ): Promise<InventoryItem> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Delete inventory item
  async deleteItem(id: string): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Add stock transaction
  async addStockTransaction(data: {
    inventory_item_id: string;
    transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    cost_per_unit?: number;
    reference_type?: 'ORDER' | 'RESTOCK' | 'MANUAL' | 'WASTAGE';
    reference_id?: string;
    notes?: string;
  }): Promise<StockTransaction> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  // Get low stock alerts
  async getLowStockAlerts(): Promise<InventoryItem[]> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/alerts/low-stock`
    );
    return response.data;
  }

  // Get expiring items
  async getExpiringItems(daysAhead: number = 7): Promise<InventoryItem[]> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/alerts/expiring?days=${daysAhead}`
    );
    return response.data;
  }

  // Get stock usage report
  async getStockUsageReport(
    startDate: string,
    endDate: string
  ): Promise<StockUsageReport[]> {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });

    const response = await this.fetchWithAuth(
      `${this.baseUrl}/reports/usage?${params.toString()}`
    );
    return response.data;
  }

  // Get stock summary
  async getStockSummary(): Promise<StockSummary> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/summary`);
    return response.data;
  }

  // Check stock availability for products
  async checkStockAvailability(
    productIds: string[]
  ): Promise<StockAvailability[]> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/check-availability`,
      {
        method: 'POST',
        body: JSON.stringify({ productIds }),
      }
    );
    return response.data;
  }

  // Bulk update stock levels
  async bulkUpdateStock(
    updates: Array<{
      inventory_item_id: string;
      new_stock: number;
      notes?: string;
    }>
  ): Promise<StockTransaction[]> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/bulk-update`, {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
    return response.data;
  }

  // Import inventory from data
  async importInventory(
    items: Array<{
      name: string;
      unit: string;
      current_stock?: number;
      minimum_stock?: number;
      cost_per_unit?: number;
      supplier_name?: string;
    }>
  ): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/import`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
    return response.data;
  }

  // Helper methods for offline functionality
  async syncPendingChanges(): Promise<void> {
    // This will be implemented with the sync service
    console.log('Syncing pending inventory changes...');
  }

  // Get items that need restocking (below minimum threshold)
  async getItemsNeedingRestock(): Promise<InventoryItem[]> {
    return this.getAllItems({ lowStock: true });
  }

  // Get total inventory value
  async getInventoryValue(): Promise<number> {
    const items = await this.getAllItems();
    return items.reduce((total, item) => {
      const cost = item.cost_per_unit || 0;
      const stock = item.current_stock || 0;
      return total + cost * stock;
    }, 0);
  }

  // Get items by category (if categories are needed)
  async getItemsByCategory(categoryName: string): Promise<InventoryItem[]> {
    return this.getAllItems({ search: categoryName });
  }

  // Check if an item is in stock for a specific quantity
  async checkItemStock(
    itemId: string,
    requiredQuantity: number
  ): Promise<boolean> {
    try {
      const item = await this.getItemById(itemId);
      return (item.current_stock || 0) >= requiredQuantity;
    } catch {
      return false;
    }
  }

  // Get daily usage for an item
  async getDailyUsage(itemId: string, days: number = 7): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const report = await this.getStockUsageReport(
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    const itemUsage = report.find(r => r.inventory_item.id === itemId);
    return itemUsage ? itemUsage.total_used / days : 0;
  }

  // Calculate reorder point based on usage
  async calculateReorderPoint(
    itemId: string,
    leadTimeDays: number = 3
  ): Promise<number> {
    const dailyUsage = await this.getDailyUsage(itemId);
    return Math.ceil(dailyUsage * leadTimeDays * 1.2); // 20% safety buffer
  }

  // Generate restock suggestions
  async getRestockSuggestions(): Promise<
    Array<{
      item: InventoryItem;
      suggested_order_quantity: number;
      reason: string;
    }>
  > {
    const lowStockItems = await this.getLowStockAlerts();
    const suggestions = [];

    for (const item of lowStockItems) {
      const reorderPoint = await this.calculateReorderPoint(item.id);
      const orderQuantity = Math.max(
        reorderPoint - (item.current_stock || 0),
        item.minimum_stock || 0
      );

      suggestions.push({
        item,
        suggested_order_quantity: orderQuantity,
        reason:
          (item.current_stock || 0) <= 0
            ? 'Out of stock'
            : 'Below minimum threshold',
      });
    }

    return suggestions;
  }
}

// Export singleton instance
export const inventoryService = new InventoryService();
