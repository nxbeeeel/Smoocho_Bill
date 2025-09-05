import Dexie, { Table } from 'dexie';

// Database Schema Types
export interface Product {
  id?: number;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id?: number;
  name: string;
  quantity: number;
  unit: string; // kg, pieces, liters, etc.
  costPerUnit: number;
  threshold: number; // low stock alert threshold
  category: string;
  expiryDate?: Date;
  supplier?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id?: number;
  productId: number;
  inventoryItemId: number;
  quantityRequired: number; // how much inventory item is needed for 1 product
  createdAt: Date;
}

export interface Order {
  id?: number;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  discountType: 'flat' | 'percentage';
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi';
  paymentStatus: 'pending' | 'completed' | 'failed';
  cashierId: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  syncedAt?: Date;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface User {
  id?: number;
  username: string;
  password: string; // hashed
  role: 'admin' | 'cashier';
  name: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Settings {
  id?: number;
  key: string;
  value: string;
  updatedAt: Date;
}

export interface SyncLog {
  id?: number;
  tableName: string;
  recordId: number;
  action: 'create' | 'update' | 'delete';
  synced: boolean;
  createdAt: Date;
  syncedAt?: Date;
}

// Database Class
export class SmoochoDB extends Dexie {
  products!: Table<Product>;
  inventory!: Table<InventoryItem>;
  recipes!: Table<Recipe>;
  orders!: Table<Order>;
  users!: Table<User>;
  settings!: Table<Settings>;
  syncLogs!: Table<SyncLog>;

  constructor() {
    super('SmoochoDB');
    
    this.version(1).stores({
      products: '++id, name, category, isActive, createdAt',
      inventory: '++id, name, quantity, threshold, expiryDate, createdAt',
      recipes: '++id, productId, inventoryItemId',
      orders: '++id, orderNumber, paymentMethod, paymentStatus, cashierId, createdAt',
      users: '++id, username, role, isActive',
      settings: '++id, key',
      syncLogs: '++id, tableName, recordId, synced, createdAt'
    });

    // Hooks for automatic timestamps and sync logging
    this.products.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.products.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as Record<string, unknown>).updatedAt = new Date();
    });

    this.inventory.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.inventory.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as Record<string, unknown>).updatedAt = new Date();
    });

    this.orders.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date();
      obj.updatedAt = new Date();
    });

    this.orders.hook('updating', (modifications, _primKey, _obj, _trans) => {
      (modifications as Record<string, unknown>).updatedAt = new Date();
    });

    this.users.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date();
    });

    this.recipes.hook('creating', (_primKey, obj, _trans) => {
      obj.createdAt = new Date();
    });
  }

  // Clear and reload menu data (preserves settings)
  async reloadMenuData() {
    console.log('Reloading menu data...');
    await this.products.clear();
    await this.loadSmoochoMenu();
    console.log('Menu data reloaded successfully');
  }

  // Load menu data if products table is empty
  async ensureMenuData() {
    const productCount = await this.products.count();
    if (productCount === 0) {
      console.log('No products found - Loading default menu...');
      await this.loadSmoochoMenu();
      console.log('Default menu loaded successfully');
    }
  }

  // Load complete Smoocho menu
  async loadSmoochoMenu() {
    const smoochoMenu = [
      // Kunafa Bowls
      { name: 'Hazelnut Kunafa', price: 219, category: 'Kunafa Bowls', description: 'Traditional kunafa with hazelnut topping', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'White Chocolate Kunafa', price: 219, category: 'Kunafa Bowls', description: 'Kunafa with white chocolate', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Kunafa', price: 249, category: 'Kunafa Bowls', description: 'Kunafa with pistachio topping', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biscoff Kunafa', price: 249, category: 'Kunafa Bowls', description: 'Kunafa with Biscoff topping', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hazelnut White Kunafa', price: 249, category: 'Kunafa Bowls', description: 'White kunafa with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biscoff Hazelnut Kunafa', price: 259, category: 'Kunafa Bowls', description: 'Kunafa with Biscoff and hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista White Kunafa', price: 259, category: 'Kunafa Bowls', description: 'White kunafa with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hazelnut Pista Kunafa', price: 259, category: 'Kunafa Bowls', description: 'Kunafa with hazelnut and pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biscoff White Kunafa', price: 259, category: 'Kunafa Bowls', description: 'White kunafa with Biscoff', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Biscoff Kunafa', price: 259, category: 'Kunafa Bowls', description: 'Kunafa with pistachio and Biscoff', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Hazelnut Kunafa', price: 249, category: 'Kunafa Bowls', description: 'Coffee flavored kunafa with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Coffee Kunafa', price: 259, category: 'Kunafa Bowls', description: 'Coffee kunafa with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Smoocho Signatures
      { name: 'Choco Tsunami', price: 189, category: 'Signatures', description: 'Signature chocolate dessert', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mango Tsunami', price: 199, category: 'Signatures', description: 'Signature mango dessert', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hazelnut Mango Cyclone', price: 209, category: 'Signatures', description: 'Mango cyclone with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Mango Thunderstorm', price: 209, category: 'Signatures', description: 'Mango thunderstorm with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biscoff Mango Hurricane', price: 209, category: 'Signatures', description: 'Mango hurricane with Biscoff', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Hazelnut Earthquake', price: 209, category: 'Signatures', description: 'Hazelnut earthquake with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Biscoff Tsunami', price: 249, category: 'Signatures', description: 'Biscoff tsunami with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Mango Cyclone', price: 209, category: 'Signatures', description: 'Coffee mango cyclone', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Coffee Earthquake', price: 209, category: 'Signatures', description: 'Coffee earthquake with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Choco Desserts
      { name: 'Choco Sponge Classic', price: 69, category: 'Choco Desserts', description: 'Classic chocolate sponge', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Sponge Premium', price: 99, category: 'Choco Desserts', description: 'Premium chocolate sponge', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Brownie Classic', price: 79, category: 'Choco Desserts', description: 'Classic chocolate brownie', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Brownie Premium', price: 109, category: 'Choco Desserts', description: 'Premium chocolate brownie', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Sponge Classic', price: 69, category: 'Choco Desserts', description: 'Classic coffee sponge', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Sponge Premium', price: 99, category: 'Choco Desserts', description: 'Premium coffee sponge', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Brownie Classic', price: 89, category: 'Choco Desserts', description: 'Classic coffee brownie', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Brownie Premium', price: 119, category: 'Choco Desserts', description: 'Premium coffee brownie', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Crispy Rice Tubs
      { name: 'Hazelnut White Crispy Rice', price: 239, category: 'Crispy Rice Tubs', description: 'White crispy rice with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hazelnut Biscoff Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Biscoff crispy rice with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mango Hazelnut Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Mango crispy rice with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Hazelnut Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Pistachio crispy rice with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mango Pista Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Mango crispy rice with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biscoff White Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'White crispy rice with Biscoff', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Pista Biscoff Crispy Rice', price: 259, category: 'Crispy Rice Tubs', description: 'Biscoff crispy rice with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mango Biscoff Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Biscoff crispy rice with mango', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Hazelnut Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Coffee crispy rice with hazelnut', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Mango Coffee Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Coffee crispy rice with mango', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Biscoff Coffee Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Coffee crispy rice with Biscoff', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Coffee Pista Crispy Rice', price: 249, category: 'Crispy Rice Tubs', description: 'Coffee crispy rice with pistachio', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Fruits Choco Mix (APM = As Per Market)
      { name: 'Choco Strawberry', price: 0, category: 'Fruits Choco Mix', description: 'Fresh strawberry with chocolate - Price as per market', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Kiwi', price: 0, category: 'Fruits Choco Mix', description: 'Fresh kiwi with chocolate - Price as per market', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Mixed Fruits Classic', price: 160, category: 'Fruits Choco Mix', description: 'Mixed fruits with chocolate - Classic', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Mixed Fruits Premium', price: 189, category: 'Fruits Choco Mix', description: 'Mixed fruits with chocolate - Premium', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Mango Classic', price: 99, category: 'Fruits Choco Mix', description: 'Mango with chocolate - Classic', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Mango Premium', price: 129, category: 'Fruits Choco Mix', description: 'Mango with chocolate - Premium', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Robusto Classic', price: 79, category: 'Fruits Choco Mix', description: 'Robusto with chocolate - Classic', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Robusto Premium', price: 109, category: 'Fruits Choco Mix', description: 'Robusto with chocolate - Premium', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Choco Ice Creams
      { name: 'Choco Vanilla Scoop', price: 69, category: 'Ice Creams', description: 'Chocolate vanilla ice cream scoop', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Chocolate Scoop', price: 69, category: 'Ice Creams', description: 'Double chocolate ice cream scoop', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Strawberry Scoop', price: 69, category: 'Ice Creams', description: 'Chocolate strawberry ice cream scoop', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Choco Mango Scoop', price: 69, category: 'Ice Creams', description: 'Chocolate mango ice cream scoop', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Drinks
      { name: 'Milo Dinauser', price: 79, category: 'Drinks', description: 'Milo chocolate drink', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Malaysian Mango Milk', price: 79, category: 'Drinks', description: 'Malaysian style mango milk', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Korean Strawberry Milk', price: 89, category: 'Drinks', description: 'Korean style strawberry milk', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Vietnamese Iced Coffee', price: 79, category: 'Drinks', description: 'Traditional Vietnamese iced coffee', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Premium Iced Coffee', price: 99, category: 'Drinks', description: 'Premium blend iced coffee', isActive: true, createdAt: new Date(), updatedAt: new Date() },

      // Fruit Toppings
      { name: 'Fresh Robust Banana', price: 20, category: 'Toppings', description: 'Fresh banana topping', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Diced Mango', price: 30, category: 'Toppings', description: 'Fresh diced mango topping', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sliced Strawberry', price: 30, category: 'Toppings', description: 'Fresh sliced strawberry topping', isActive: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Sliced Kiwi', price: 30, category: 'Toppings', description: 'Fresh sliced kiwi topping', isActive: true, createdAt: new Date(), updatedAt: new Date() }
    ];

    for (const product of smoochoMenu) {
      await this.products.add(product);
    }
  }

  // Initialize database with default data - SIMPLIFIED
  async initializeData() {
    console.log('Initializing database with default data...');
    
    // Create default admin user
    await this.users.add({
      username: 'admin',
      password: 'admin123', // In production, this should be hashed
      role: 'admin',
      name: 'Administrator',
      email: 'admin@smoocho.com',
      isActive: true,
      createdAt: new Date()
    });

    // Create default cashier
    await this.users.add({
      username: 'cashier',
      password: 'cashier123',
      role: 'cashier',
      name: 'Cashier',
      isActive: true,
      createdAt: new Date()
    });

    // Add default settings - SINGLE INITIALIZATION
    const defaultSettings = [
      { key: 'storeName', value: 'Smoocho Bill' },
      { key: 'storeAddress', value: '123 Main Street, City' },
      { key: 'storePhone', value: '+91 9876543210' },
      { key: 'storeEmail', value: 'info@smoochobill.com' },
      { key: 'storeWebsite', value: 'www.smoochobill.com' },
      { key: 'storeGST', value: '22ABCDE1234F1Z5' },
      { key: 'taxRate', value: '18' },
      { key: 'currency', value: 'INR' },
      { key: 'upiId', value: 'smoocho@paytm' },
      { key: 'paymentMethods', value: JSON.stringify(['cash', 'card', 'upi', 'wallet']) },
      { key: 'minOrderAmount', value: '0' },
      { key: 'deliveryCharge', value: '0' },
      { key: 'printerEnabled', value: 'true' },
      { key: 'soundEnabled', value: 'true' },
      { key: 'notifications', value: 'true' },
      { key: 'autoBackup', value: 'false' },
      { key: 'theme', value: 'light' },
      { key: 'language', value: 'en' },
      { key: 'timezone', value: 'Asia/Kolkata' },
      { key: 'dateFormat', value: 'DD/MM/YYYY' },
      { key: 'timeFormat', value: '12h' },
      { key: 'requirePassword', value: 'false' },
      { key: 'sessionTimeout', value: '30' },
      { key: 'twoFactorAuth', value: 'false' },
      { key: 'showImages', value: 'true' },
      { key: 'showPrices', value: 'true' },
      { key: 'showStock', value: 'true' },
      { key: 'compactMode', value: 'false' },
      { key: 'emailNotifications', value: 'true' },
      { key: 'smsNotifications', value: 'false' },
      { key: 'pushNotifications', value: 'true' },
      { key: 'lowStockAlert', value: 'true' },
      { key: 'dailyReport', value: 'false' },
      { key: 'backupFrequency', value: 'daily' },
      { key: 'cloudBackup', value: 'false' },
      { key: 'localBackup', value: 'true' },
      { key: 'backupRetention', value: '30' }
    ];

    for (const setting of defaultSettings) {
      await this.settings.add({
        ...setting,
        updatedAt: new Date()
      });
    }

    // Note: loadSmoochoMenu is already being called, no need to call it again

    // Add sample inventory items
    const sampleInventory = [
      {
        name: 'Flour',
        quantity: 50,
        unit: 'kg',
        costPerUnit: 40,
        threshold: 10,
        category: 'Baking',
        supplier: 'Local Supplier',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sugar',
        quantity: 25,
        unit: 'kg',
        costPerUnit: 45,
        threshold: 5,
        category: 'Baking',
        supplier: 'Local Supplier',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Milk',
        quantity: 20,
        unit: 'liters',
        costPerUnit: 60,
        threshold: 5,
        category: 'Dairy',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        supplier: 'Dairy Farm',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    for (const item of sampleInventory) {
      await this.inventory.add(item);
    }
    
    console.log('Database initialization completed successfully');
  }

  // Manual initialization function - only call this when needed
  async manualInitialize() {
    console.log('Manual initialization started...');
    await this.initializeData();
    console.log('Manual initialization completed');
  }
}

// Export singleton instance
export const db = new SmoochoDB();

// Initialize database when imported - Smart initialization
let isInitialized = false;
db.open().then(async () => {
  if (!isInitialized) {
    isInitialized = true;
    console.log('Database opened successfully - Checking for initialization...');
    
    // Check what data exists
    const userCount = await db.users.count();
    const settingsCount = await db.settings.count();
    const productCount = await db.products.count();
    const inventoryCount = await db.inventory.count();
    
    console.log('Database status:', { userCount, settingsCount, productCount, inventoryCount });
    
    // Auto-initialize if database is completely empty (first time setup)
    if (userCount === 0 && settingsCount === 0 && productCount === 0 && inventoryCount === 0) {
      console.log('Database is empty - Auto-initializing with default data...');
      await db.initializeData();
      console.log('Auto-initialization completed successfully');
    } else {
      console.log('Database has existing data - Checking for missing menu data...');
      // Ensure menu data is loaded even if other data exists
      await db.ensureMenuData();
    }
  }
});
