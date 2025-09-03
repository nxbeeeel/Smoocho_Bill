// Mock implementation for development - no database required
// const prisma = new PrismaClient(); // Uncomment when database is ready

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock: number;
  cost_per_unit: number;
  supplier_name?: string;
  supplier_contact?: string;
  expiry_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface StockTransaction {
  id: string;
  inventory_item_id: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  cost_per_unit?: number;
  reference_type?: 'ORDER' | 'RESTOCK' | 'MANUAL' | 'WASTAGE' | 'DAILY_COUNT' | 'NIGHTLY_COUNT' | 'MANUAL_ADJUSTMENT';
  reference_id?: string;
  notes?: string;
  user_id?: string;
  created_at: Date;
}

export interface StockAvailability {
  product_id: string;
  product_name: string;
  is_available: boolean;
  insufficient_items: string[];
}

export interface StockSummary {
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  expiringSoonItems: number;
  totalStockValue: number;
}

export class InventoryService {
  // Get all inventory items with optional filters
  async getAllInventoryItems(filters: any = {}): Promise<InventoryItem[]> {
    // Mock data for development
    const mockItems: InventoryItem[] = [
      {
        id: 'inv-1',
        name: 'Milk',
        unit: 'liters',
        current_stock: 50,
        minimum_stock: 10,
        maximum_stock: 100,
        cost_per_unit: 2.5,
        supplier_name: 'Dairy Farm',
        supplier_contact: '+1234567890',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'inv-2',
        name: 'Sugar',
        unit: 'kg',
        current_stock: 25,
        minimum_stock: 5,
        maximum_stock: 50,
        cost_per_unit: 1.2,
        supplier_name: 'Sweet Supplies',
        supplier_contact: '+1234567891',
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Apply filters
    let filteredItems = mockItems;
    
    if (filters.isActive !== undefined) {
      filteredItems = filteredItems.filter(item => item.is_active === filters.isActive);
    }
    
    if (filters.lowStock) {
      filteredItems = filteredItems.filter(item => item.current_stock <= item.minimum_stock);
    }
    
    if (filters.expiringSoon) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filteredItems = filteredItems.filter(item => 
        item.expiry_date && item.expiry_date <= thirtyDaysFromNow
      );
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(search) ||
        (item.supplier_name && item.supplier_name.toLowerCase().includes(search))
      );
    }

    return filteredItems;
  }

  // Get single inventory item by ID
  async getInventoryItemById(id: string): Promise<InventoryItem | null> {
    // Mock implementation for development
    const mockItems = await this.getAllInventoryItems();
    return mockItems.find(item => item.id === id) || null;
  }

  // Create new inventory item
  async createInventoryItem(data: Partial<InventoryItem>): Promise<InventoryItem> {
    // Mock implementation for development
    return {
      id: `inv-${Date.now()}`,
      name: data.name || 'New Item',
      unit: data.unit || 'pieces',
      current_stock: data.current_stock || 0,
      minimum_stock: data.minimum_stock || 0,
      maximum_stock: data.maximum_stock || 100,
      cost_per_unit: data.cost_per_unit || 0,
      supplier_name: data.supplier_name,
      supplier_contact: data.supplier_contact,
      expiry_date: data.expiry_date,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Update inventory item
  async updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
    const item = await this.getInventoryItemById(id);
    if (!item) throw new Error('Item not found');
    
    return { ...item, ...data, updated_at: new Date() };
  }

  // Delete inventory item
  async deleteInventoryItem(id: string): Promise<void> {
    // Mock implementation
    console.log(`Deleting inventory item: ${id}`);
  }

  // Add stock transaction
  async addStockTransaction(data: {
    inventory_item_id: string;
    transaction_type: 'IN' | 'OUT' | 'ADJUSTMENT';
    quantity: number;
    cost_per_unit?: number;
    reference_type?: 'ORDER' | 'RESTOCK' | 'MANUAL' | 'WASTAGE' | 'DAILY_COUNT' | 'NIGHTLY_COUNT' | 'MANUAL_ADJUSTMENT';
    reference_id?: string;
    notes?: string;
    user_id?: string;
  }): Promise<StockTransaction> {
    // Mock implementation for development
    return {
      id: `txn-${Date.now()}`,
      inventory_item_id: data.inventory_item_id,
      transaction_type: data.transaction_type,
      quantity: data.quantity,
      cost_per_unit: data.cost_per_unit,
      reference_type: data.reference_type,
      reference_id: data.reference_id,
      notes: data.notes,
      user_id: data.user_id,
      created_at: new Date()
    };
  }

  // Get stock history
  async getStockHistory(
    inventoryItemId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ): Promise<StockTransaction[]> {
    // Mock implementation for development
    return [];
  }

  // Get low stock items
  async getLowStockItems(threshold?: number): Promise<InventoryItem[]> {
    const items = await this.getAllInventoryItems();
    return items.filter(item => item.current_stock <= (threshold || item.minimum_stock));
  }

  // Get expiring soon items
  async getExpiringSoonItems(days: number = 30): Promise<InventoryItem[]> {
    const items = await this.getAllInventoryItems();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);
    
    return items.filter(item => 
      item.expiry_date && item.expiry_date <= expiryDate
    );
  }

  // Get stock summary
  async getStockSummary(): Promise<StockSummary> {
    // Mock implementation for development
    return {
      totalItems: 2,
      activeItems: 2,
      lowStockItems: 0,
      expiringSoonItems: 1,
      totalStockValue: 75
    };
  }

  // Get stock usage report
  async getStockUsageReport(startDate: Date, endDate: Date): Promise<any[]> {
    // Mock implementation
    return [];
  }

  // Check stock availability for products
  async checkStockAvailability(productIds: string[]): Promise<StockAvailability[]> {
    // Mock implementation for development
    // In a real implementation, you would check recipe ingredients against inventory
    
    return productIds.map(productId => ({
      product_id: productId,
      product_name: `Product ${productId}`,
      is_available: true, // Mock: always available for now
      insufficient_items: []
    }));
  }

  // Import inventory from CSV/Excel
  async importInventory(file: any, options: any = {}): Promise<any> {
    // Mock implementation - in real app, parse CSV/Excel and import data
    return {
      imported: 0,
      errors: [],
      message: 'Import functionality not implemented yet'
    };
  }

  // Export inventory to CSV/Excel
  async exportInventory(options: { format: string; filters: any }): Promise<any> {
    // Mock implementation - in real app, generate CSV/Excel file
    return {
      format: options.format,
      download_url: '/api/inventory/download/export.csv',
      message: 'Export functionality not implemented yet'
    };
  }


}

export const inventoryService = new InventoryService();
