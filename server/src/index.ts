import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { inventoryRoutes } from './routes/inventoryRoutes';
import { orderRoutes } from './routes/orderRoutes';
import { stockManagementRoutes } from './routes/stockManagementRoutes';
import { menuRoutes } from './routes/menuRoutes';
import { settingsRoutes } from './routes/settingsRoutes';
import { aiRoutes } from './routes/aiRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Basic Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      baseUri: ["'self'"],
      fontSrc: ["'self'", "https:", "data:"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      objectSrc: ["'none'"],
      scriptSrcAttr: ["'none'"],
      upgradeInsecureRequests: []
    }
  }
}));

app.use(cors({
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
}));

app.use(compression());
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving
app.use('/uploads', express.static('uploads'));

// API Routes
app.use('/inventory', inventoryRoutes);
app.use('/orders', orderRoutes);
app.use('/stock-management', stockManagementRoutes);
app.use('/menu', menuRoutes);
app.use('/settings', settingsRoutes);
app.use('/ai', aiRoutes);

// Error handling middleware
app.use(errorHandler);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Basic API endpoints for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()

  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: '1',
        username: 'admin',
        role: 'admin'
      },
      token: 'demo_token_' + Date.now()
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Integration endpoints
app.get('/api/integrations', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'paytm',
        name: 'Paytm',
        type: 'payment',
        status: 'active',
        api_credentials: {
          merchant_id: 'demo_merchant',
          api_key: 'demo_api_key'
        }
      },
      {
        id: 'zomato',
        name: 'Zomato',
        type: 'delivery',
        status: 'inactive',
        api_credentials: {}
      },
      {
        id: 'swiggy',
        name: 'Swiggy',
        type: 'delivery',
        status: 'inactive',
        api_credentials: {}
      }
    ]
  });
});

app.get('/api/integrations/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      type: 'payment',
      status: 'active',
      api_credentials: {
        merchant_id: 'demo_merchant',
        api_key: 'demo_api_key'
      }
    }
  });
});

app.post('/api/integrations/:id/enable', (req, res) => {
  res.json({
    success: true,
    message: 'Integration enabled successfully'
  });
});

app.post('/api/integrations/:id/disable', (req, res) => {
  res.json({
    success: true,
    message: 'Integration disabled successfully'
  });
});

app.post('/api/integrations/:id/test', (req, res) => {
  res.json({
    success: true,
    data: {
      connected: true,
      tested_at: new Date().toISOString()
    }
  });
});

// Order endpoints
app.post('/api/orders', (req, res) => {
  const { items, customer_info, payment_method } = req.body;
  
  // Simulate order creation
  const order = {
    id: 'order_' + Date.now(),
    order_number: 'SMO' + Date.now(),
    items,
    customer_info,
    payment_method,
    total_amount: items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 0)), 0),
    status: 'completed',
    created_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Order completed successfully',
    data: order
  });
});

app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// Payment endpoints
app.post('/api/payments/process', (req, res) => {
  const { amount, method, order_id } = req.body;
  
  // Simulate payment processing
  const payment = {
    id: 'payment_' + Date.now(),
    order_id,
    amount,
    method,
    status: 'completed',
    transaction_id: 'txn_' + Date.now(),
    processed_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Payment processed successfully',
    data: payment
  });
});

// Basic Inventory endpoint (legacy)
app.get('/api/inventory', (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Use /api/inventory/items for detailed inventory data'
  });
});

// Enhanced Inventory Management endpoints
app.get('/api/inventory/items', (req, res) => {
  const { isActive, lowStock, expiringSoon, search } = req.query;
  
  // Mock inventory items
  const items = [
    {
      id: 'inv_1',
      name: 'Chicken Breast',
      unit: 'kg',
      current_stock: 25.5,
      minimum_stock: 10,
      cost_per_unit: 180.00,
      supplier_name: 'Fresh Foods Ltd',
      supplier_contact: '+91-9876543210',
      expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      last_restocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      low_stock_warning: false
    },
    {
      id: 'inv_2',
      name: 'Rice Basmati',
      unit: 'kg',
      current_stock: 8.0,
      minimum_stock: 15,
      cost_per_unit: 120.00,
      supplier_name: 'Grain Suppliers',
      supplier_contact: '+91-9876543211',
      expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      last_restocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      low_stock_warning: true
    },
    {
      id: 'inv_3',
      name: 'Tomatoes',
      unit: 'kg',
      current_stock: 0,
      minimum_stock: 5,
      cost_per_unit: 40.00,
      supplier_name: 'Vegetable Market',
      supplier_contact: '+91-9876543212',
      expiry_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      last_restocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true,
      created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
      low_stock_warning: true
    }
  ];

  // Apply filters
  let filteredItems = items;
  
  if (isActive !== undefined) {
    filteredItems = filteredItems.filter(item => item.is_active === (isActive === 'true'));
  }
  
  if (lowStock === 'true') {
    filteredItems = filteredItems.filter(item => item.current_stock <= item.minimum_stock);
  }
  
  if (expiringSoon === 'true') {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    filteredItems = filteredItems.filter(item => new Date(item.expiry_date) <= sevenDaysFromNow);
  }
  
  if (search) {
    filteredItems = filteredItems.filter(item => 
      item.name.toLowerCase().includes(search.toString().toLowerCase()) ||
      item.supplier_name?.toLowerCase().includes(search.toString().toLowerCase())
    );
  }

  res.json({
    success: true,
    data: filteredItems
  });
});

app.get('/api/inventory/items/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock item data
  const item = {
    id,
    name: 'Sample Inventory Item',
    unit: 'kg',
    current_stock: 50.0,
    minimum_stock: 10,
    cost_per_unit: 100.00,
    supplier_name: 'Sample Supplier',
    supplier_contact: '+91-9876543210',
    expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_restocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    low_stock_warning: false
  };
  
  res.json({
    success: true,
    data: item
  });
});

app.post('/api/inventory/items', (req, res) => {
  const { 
    name, 
    unit, 
    current_stock, 
    minimum_stock, 
    cost_per_unit, 
    supplier_name, 
    supplier_contact, 
    expiry_date 
  } = req.body;
  
  const item = {
    id: 'inv_' + Date.now(),
    name,
    unit,
    current_stock: parseFloat(current_stock) || 0,
    minimum_stock: parseFloat(minimum_stock) || 0,
    cost_per_unit: parseFloat(cost_per_unit) || 0,
    supplier_name: supplier_name || '',
    supplier_contact: supplier_contact || '',
    expiry_date: expiry_date || null,
    last_restocked: new Date().toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    low_stock_warning: false
  };
  
  res.json({
    success: true,
    message: 'Inventory item created successfully',
    data: item
  });
});

app.put('/api/inventory/items/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  const item = {
    id,
    ...updateData,
    updated_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Inventory item updated successfully',
    data: item
  });
});

app.delete('/api/inventory/items/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Inventory item deleted successfully',
    data: { id }
  });
});

// Stock transactions endpoints
app.get('/api/inventory/transactions', (req, res) => {
  const { item_id, transaction_type, start_date, end_date } = req.query;
  
  // Mock transactions
  const transactions = [
    {
      id: 'txn_1',
      inventory_item_id: 'inv_1',
      transaction_type: 'IN',
      quantity: 50.0,
      cost_per_unit: 180.00,
      total_cost: 9000.00,
      reference_type: 'RESTOCK',
      reference_id: 'restock_1',
      notes: 'Monthly restock',
      user_id: 'user_1',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'txn_2',
      inventory_item_id: 'inv_1',
      transaction_type: 'OUT',
      quantity: 5.0,
      cost_per_unit: 180.00,
      total_cost: 900.00,
      reference_type: 'RECIPE_DEDUCTION',
      reference_id: 'order_1',
      notes: 'Used in cooking',
      user_id: 'user_1',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
  
  res.json({
    success: true,
    data: transactions
  });
});

app.post('/api/inventory/transactions', (req, res) => {
  const { 
    inventory_item_id, 
    transaction_type, 
    quantity, 
    cost_per_unit, 
    reference_type, 
    reference_id, 
    notes 
  } = req.body;
  
  const transaction = {
    id: 'txn_' + Date.now(),
    inventory_item_id,
    transaction_type,
    quantity: parseFloat(quantity) || 0,
    cost_per_unit: parseFloat(cost_per_unit) || 0,
    total_cost: (parseFloat(quantity) || 0) * (parseFloat(cost_per_unit) || 0),
    reference_type,
    reference_id,
    notes,
    user_id: 'user_1', // This would come from auth
    created_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Stock transaction created successfully',
    data: transaction
  });
});

// Stock summary and analytics
app.get('/api/inventory/summary', (req, res) => {
  const summary = {
    totalItems: 3,
    lowStockItems: 2,
    outOfStockItems: 1,
    expiringItemsCount: 1,
    totalStockValue: 12500.00,
    lowStockAlerts: [
      {
        id: 'inv_2',
        name: 'Rice Basmati',
        current_stock: 8.0,
        minimum_stock: 15,
        days_until_out: 3
      },
      {
        id: 'inv_3',
        name: 'Tomatoes',
        current_stock: 0,
        minimum_stock: 5,
        days_until_out: 0
      }
    ],
    expiringItems: [
      {
        id: 'inv_1',
        name: 'Chicken Breast',
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        days_until_expiry: 7
      }
    ]
  };
  
  res.json({
    success: true,
    data: summary
  });
});

// Stock usage reports
app.get('/api/inventory/reports/usage', (req, res) => {
  const { start_date, end_date, item_id } = req.query;
  
  const report = {
    period: {
      start: start_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      end: end_date || new Date().toISOString()
    },
    items: [
      {
        inventory_item: {
          id: 'inv_1',
          name: 'Chicken Breast',
          unit: 'kg'
        },
        total_used: 25.5,
        transaction_count: 15,
        average_daily_usage: 0.85
      }
    ],
    summary: {
      total_items_used: 1,
      total_quantity_used: 25.5,
      total_transactions: 15
    }
  };
  
  res.json({
    success: true,
    data: report
  });
});

// Bulk operations
app.post('/api/inventory/bulk-update', (req, res) => {
  const { updates } = req.body;
  
  res.json({
    success: true,
    message: 'Bulk update completed successfully',
    data: {
      updated_count: updates?.length || 0,
      updates: updates || []
    }
  });
});

app.post('/api/inventory/import', (req, res) => {
  const { items, format } = req.body;
  
  res.json({
    success: true,
    message: 'Inventory imported successfully',
    data: {
      imported_count: items?.length || 0,
      format: format || 'json'
    }
  });
});

app.get('/api/inventory/export', (req, res) => {
  const { format } = req.query;
  
  res.json({
    success: true,
    message: 'Inventory exported successfully',
    data: {
      format: format || 'json',
      download_url: `/api/inventory/download/export.${format || 'json'}`
    }
  });
});

// Reports endpoints
app.get('/api/reports/sales', (req, res) => {
  res.json({
    success: true,
    data: {
      total_sales: 0,
      total_orders: 0,
      period: 'today'
    }
  });
});

// Menu Categories endpoints
app.get('/api/menu/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'cat_1',
        name: 'Starters',
        description: 'Appetizers and small plates',
        display_order: 1,
        is_active: true,
        image_url: null,
        created_at: new Date().toISOString()
      },
      {
        id: 'cat_2',
        name: 'Main Course',
        description: 'Primary dishes',
        display_order: 2,
        is_active: true,
        image_url: null,
        created_at: new Date().toISOString()
      },
      {
        id: 'cat_3',
        name: 'Desserts',
        description: 'Sweet treats',
        display_order: 3,
        is_active: true,
        image_url: null,
        created_at: new Date().toISOString()
      },
      {
        id: 'cat_4',
        name: 'Beverages',
        description: 'Drinks and refreshments',
        display_order: 4,
        is_active: true,
        image_url: null,
        created_at: new Date().toISOString()
      }
    ]
  });
});

app.post('/api/menu/categories', (req, res) => {
  const { name, description, display_order, is_active } = req.body;
  
  const category = {
    id: 'cat_' + Date.now(),
    name,
    description: description || '',
    display_order: display_order || 1,
    is_active: is_active !== undefined ? is_active : true,
    image_url: null,
    created_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Category created successfully',
    data: category
  });
});

app.put('/api/menu/categories/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, display_order, is_active } = req.body;
  
  const category = {
    id,
    name: name || 'Updated Category',
    description: description || '',
    display_order: display_order || 1,
    is_active: is_active !== undefined ? is_active : true,
    image_url: null,
    updated_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Category updated successfully',
    data: category
  });
});

app.delete('/api/menu/categories/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Category deleted successfully',
    data: { id }
  });
});

// Menu Items endpoints
app.get('/api/menu/items', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'item_1',
        name: 'Chicken Tikka',
        description: 'Grilled chicken with Indian spices',
        category_id: 'cat_1',
        category_name: 'Starters',
        price: 250.00,
        cost_price: 150.00,
        is_vegetarian: false,
        is_available: true,
        preparation_time: 15,
        image_url: null,
        allergens: ['dairy'],
        nutritional_info: {
          calories: 180,
          protein: 25,
          carbs: 5,
          fat: 8
        },
        created_at: new Date().toISOString()
      },
      {
        id: 'item_2',
        name: 'Paneer Butter Masala',
        description: 'Cottage cheese in rich tomato gravy',
        category_id: 'cat_2',
        category_name: 'Main Course',
        price: 180.00,
        cost_price: 100.00,
        is_vegetarian: true,
        is_available: true,
        preparation_time: 20,
        image_url: null,
        allergens: ['dairy'],
        nutritional_info: {
          calories: 220,
          protein: 12,
          carbs: 15,
          fat: 12
        },
        created_at: new Date().toISOString()
      },
      {
        id: 'item_3',
        name: 'Gulab Jamun',
        description: 'Sweet milk dumplings in sugar syrup',
        category_id: 'cat_3',
        category_name: 'Desserts',
        price: 80.00,
        cost_price: 40.00,
        is_vegetarian: true,
        is_available: true,
        preparation_time: 5,
        image_url: null,
        allergens: ['dairy', 'nuts'],
        nutritional_info: {
          calories: 150,
          protein: 3,
          carbs: 25,
          fat: 5
        },
        created_at: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/menu/items/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: {
      id,
      name: 'Sample Menu Item',
      description: 'This is a sample menu item description',
      category_id: 'cat_1',
      category_name: 'Starters',
      price: 150.00,
      cost_price: 80.00,
      is_vegetarian: true,
      is_available: true,
      preparation_time: 10,
      image_url: null,
      allergens: [],
      nutritional_info: {
        calories: 120,
        protein: 8,
        carbs: 12,
        fat: 6
      }
    }
  });
});

app.post('/api/menu/items', (req, res) => {
  const { 
    name, 
    description, 
    category_id, 
    price, 
    cost_price, 
    is_vegetarian, 
    is_available,
    preparation_time,
    allergens,
    nutritional_info
  } = req.body;
  
  const menuItem = {
    id: 'item_' + Date.now(),
    name,
    description: description || '',
    category_id,
    category_name: 'New Category',
    price: parseFloat(price) || 0.00,
    cost_price: parseFloat(cost_price) || 0.00,
    is_vegetarian: is_vegetarian || false,
    is_available: is_available !== undefined ? is_available : true,
    preparation_time: preparation_time || 15,
    image_url: null,
    allergens: allergens || [],
    nutritional_info: nutritional_info || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    created_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Menu item created successfully',
    data: menuItem
  });
});

app.put('/api/menu/items/:id', (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    category_id, 
    price, 
    cost_price, 
    is_vegetarian, 
    is_available,
    preparation_time,
    allergens,
    nutritional_info
  } = req.body;
  
  const menuItem = {
    id,
    name: name || 'Updated Item',
    description: description || '',
    category_id: category_id || 'cat_1',
    category_name: 'Updated Category',
    price: parseFloat(price) || 0.00,
    cost_price: parseFloat(cost_price) || 0.00,
    is_vegetarian: is_vegetarian || false,
    is_available: is_available !== undefined ? is_available : true,
    preparation_time: preparation_time || 15,
    image_url: null,
    allergens: allergens || [],
    nutritional_info: nutritional_info || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    updated_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Menu item updated successfully',
    data: menuItem
  });
});

app.delete('/api/menu/items/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: 'Menu item deleted successfully',
    data: { id }
  });
});

// Price Management endpoints
app.post('/api/menu/items/:id/price', (req, res) => {
  const { id } = req.params;
  const { price, cost_price, effective_date } = req.body;
  
  const priceUpdate = {
    item_id: id,
    old_price: 150.00, // This would come from current item
    new_price: parseFloat(price) || 0.00,
    old_cost_price: 80.00, // This would come from current item
    new_cost_price: parseFloat(cost_price) || 0.00,
    effective_date: effective_date || new Date().toISOString(),
    reason: 'Price update',
    updated_by: 'admin',
    created_at: new Date().toISOString()
  };
  
  res.json({
    success: true,
    message: 'Price updated successfully',
    data: priceUpdate
  });
});

app.get('/api/menu/items/:id/price-history', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: [
      {
        id: 'price_1',
        item_id: id,
        old_price: 150.00,
        new_price: 180.00,
        old_cost_price: 80.00,
        new_cost_price: 95.00,
        effective_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Cost increase',
        updated_by: 'admin'
      },
      {
        id: 'price_2',
        item_id: id,
        old_price: 180.00,
        new_price: 200.00,
        old_cost_price: 95.00,
        new_cost_price: 110.00,
        effective_date: new Date().toISOString(),
        reason: 'Market adjustment',
        updated_by: 'admin'
      }
    ]
  });
});

// Menu Search and Filter endpoints
app.get('/api/menu/search', (req, res) => {
  const { q, category_id, is_vegetarian, min_price, max_price } = req.query;
  
  res.json({
    success: true,
    data: [
      {
        id: 'item_1',
        name: 'Chicken Tikka',
        description: 'Grilled chicken with Indian spices',
        category_id: 'cat_1',
        category_name: 'Starters',
        price: 250.00,
        is_vegetarian: false,
        is_available: true
      }
    ],
    filters: {
      query: q || '',
      category_id: category_id || '',
      is_vegetarian: is_vegetarian || '',
      min_price: min_price || '',
      max_price: max_price || ''
    }
  });
});

// Menu Import/Export endpoints
app.post('/api/menu/import', (req, res) => {
  const { items, categories, format } = req.body;
  
  res.json({
    success: true,
    message: 'Menu imported successfully',
    data: {
      imported_items: items?.length || 0,
      imported_categories: categories?.length || 0,
      format: format || 'json'
    }
  });
});

app.get('/api/menu/export', (req, res) => {
  const { format } = req.query;
  
  res.json({
    success: true,
    message: 'Menu exported successfully',
    data: {
      format: format || 'json',
      download_url: `/api/menu/download/export.${format || 'json'}`
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Smoocho Bill Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
  console.log(`⚡ Socket.IO: ws://localhost:${PORT}`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    console.log(`🔐 Test Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   Username: admin, Password: admin123`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

export { app, io };