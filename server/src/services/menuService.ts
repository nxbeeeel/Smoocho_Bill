export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category_id: string;
  price: number;
  cost_price: number;
  sku: string;
  is_available: boolean;
  is_active: boolean;
  sort_order: number;
  preparation_time: number;
  image_url?: string;
  allergens?: string[];
  nutritional_info?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  created_at: Date;
  updated_at: Date;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class MenuService {
  private menuItems: Map<string, MenuItem> = new Map();
  private categories: Map<string, MenuCategory> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with some mock categories
    const mockCategories: MenuCategory[] = [
      {
        id: 'cat-1',
        name: 'Kunafa Bowls',
        description: 'Traditional Middle Eastern desserts',
        sort_order: 1,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'cat-2',
        name: 'Ice Cream',
        description: 'Premium ice cream flavors',
        sort_order: 2,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockCategories.forEach(cat => this.categories.set(cat.id, cat));

    // Initialize with some mock menu items
    const mockItems: MenuItem[] = [
      {
        id: 'prod-1',
        name: 'Hazelnut Kunafa',
        description: 'Premium kunafa with hazelnut toppings',
        category_id: 'cat-1',
        price: 219,
        cost_price: 110,
        sku: 'KUN001',
        is_available: true,
        is_active: true,
        sort_order: 1,
        preparation_time: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'prod-2',
        name: 'White Chocolate Kunafa',
        description: 'Kunafa topped with white chocolate',
        category_id: 'cat-1',
        price: 219,
        cost_price: 110,
        sku: 'KUN002',
        is_available: true,
        is_active: true,
        sort_order: 2,
        preparation_time: 10,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    mockItems.forEach(item => this.menuItems.set(item.id, item));
  }

  // Get all menu items
  async getAllMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).sort((a, b) => a.sort_order - b.sort_order);
  }

  // Get menu item by ID
  async getMenuItemById(id: string): Promise<MenuItem | null> {
    return this.menuItems.get(id) || null;
  }

  // Create new menu item
  async createMenuItem(data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const newItem: MenuItem = {
      ...data,
      id: `prod-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.menuItems.set(newItem.id, newItem);
    return newItem;
  }

  // Update menu item
  async updateMenuItem(id: string, data: Partial<MenuItem>): Promise<MenuItem | null> {
    const item = this.menuItems.get(id);
    if (!item) return null;

    const updatedItem: MenuItem = {
      ...item,
      ...data,
      updated_at: new Date()
    };

    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  // Delete menu item
  async deleteMenuItem(id: string): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // Get all categories
  async getAllCategories(): Promise<MenuCategory[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.sort_order - b.sort_order);
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<MenuCategory | null> {
    return this.categories.get(id) || null;
  }

  // Create new category
  async createCategory(data: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): Promise<MenuCategory> {
    const newCategory: MenuCategory = {
      ...data,
      id: `cat-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    this.categories.set(newCategory.id, newCategory);
    return newCategory;
  }

  // Update category
  async updateCategory(id: string, data: Partial<MenuCategory>): Promise<MenuCategory | null> {
    const category = this.categories.get(id);
    if (!category) return null;

    const updatedCategory: MenuCategory = {
      ...category,
      ...data,
      updated_at: new Date()
    };

    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  // Delete category
  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Get menu items by category
  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.category_id === categoryId && item.is_active)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  // Search menu items
  async searchMenuItems(query: string): Promise<MenuItem[]> {
    const searchTerm = query.toLowerCase();
    return Array.from(this.menuItems.values())
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description.toLowerCase().includes(searchTerm) ||
        item.sku.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  // Toggle item availability
  async toggleItemAvailability(id: string): Promise<MenuItem | null> {
    const item = this.menuItems.get(id);
    if (!item) return null;

    const updatedItem: MenuItem = {
      ...item,
      is_available: !item.is_available,
      updated_at: new Date()
    };

    this.menuItems.set(id, updatedItem);
    return updatedItem;
  }

  // Get menu statistics
  async getMenuStatistics(): Promise<{
    totalItems: number;
    activeItems: number;
    availableItems: number;
    totalCategories: number;
    averagePrice: number;
  }> {
    const items = Array.from(this.menuItems.values());
    const totalItems = items.length;
    const activeItems = items.filter(item => item.is_active).length;
    const availableItems = items.filter(item => item.is_available).length;
    const totalCategories = this.categories.size;
    const averagePrice = totalItems > 0 ? items.reduce((sum, item) => sum + item.price, 0) / totalItems : 0;

    return {
      totalItems,
      activeItems,
      availableItems,
      totalCategories,
      averagePrice: Math.round(averagePrice * 100) / 100
    };
  }
}

export const menuService = new MenuService();
