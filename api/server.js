// Smoocho Bill POS - Production Backend Server
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/smoocho_pos',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Shop access middleware
const checkShopAccess = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const userId = req.user.id;

    // Check if user has access to this shop
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND shop_id = $2',
      [userId, shopId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this shop' });
    }

    req.shopId = shopId;
    next();
  } catch (error) {
    console.error('Shop access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==================== AUTHENTICATION ROUTES ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, shopName } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create shop first
    const shopResult = await pool.query(
      'INSERT INTO shops (name, owner_id) VALUES ($1, $2) RETURNING id',
      [shopName, null] // Will update after user creation
    );
    const shopId = shopResult.rows[0].id;

    // Create user
    const userResult = await pool.query(
      'INSERT INTO users (email, password_hash, name, role, shop_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role, shop_id',
      [email, passwordHash, name, 'owner', shopId]
    );

    // Update shop owner
    await pool.query('UPDATE shops SET owner_id = $1 WHERE id = $2', [userResult.rows[0].id, shopId]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: userResult.rows[0].id, 
        email: userResult.rows[0].email,
        shopId: shopId,
        role: userResult.rows[0].role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userResult.rows[0].id,
        email: userResult.rows[0].email,
        name: userResult.rows[0].name,
        role: userResult.rows[0].role,
        shopId: shopId
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT u.*, s.name as shop_name FROM users u LEFT JOIN shops s ON u.shop_id = s.id WHERE u.email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        shopId: user.shop_id,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        shopId: user.shop_id,
        shopName: user.shop_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.*, s.name as shop_name FROM users u LEFT JOIN shops s ON u.shop_id = s.id WHERE u.id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      shopId: user.shop_id,
      shopName: user.shop_name
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SHOP ROUTES ====================

// Get shop settings
app.get('/api/shops/:shopId/settings', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const result = await pool.query('SELECT settings FROM shops WHERE id = $1', [req.shopId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    res.json(result.rows[0].settings || {});
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update shop settings
app.put('/api/shops/:shopId/settings', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { settings } = req.body;

    await pool.query(
      'UPDATE shops SET settings = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(settings), req.shopId]
    );

    // Emit real-time update
    io.to(`shop_${req.shopId}`).emit('settings_updated', settings);

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PRODUCT ROUTES ====================

// Get all products for a shop
app.get('/api/shops/:shopId/products', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE shop_id = $1 ORDER BY created_at DESC',
      [req.shopId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product
app.post('/api/shops/:shopId/products', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { name, price, category, description, image_url, is_active } = req.body;

    const result = await pool.query(
      'INSERT INTO products (shop_id, name, price, category, description, image_url, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.shopId, name, price, category, description, image_url, is_active !== false]
    );

    // Emit real-time update
    io.to(`shop_${req.shopId}`).emit('product_created', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
app.put('/api/shops/:shopId/products/:productId', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, category, description, image_url, is_active } = req.body;

    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, category = $3, description = $4, image_url = $5, is_active = $6, updated_at = NOW() WHERE id = $7 AND shop_id = $8 RETURNING *',
      [name, price, category, description, image_url, is_active !== false, productId, req.shopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Emit real-time update
    io.to(`shop_${req.shopId}`).emit('product_updated', result.rows[0]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
app.delete('/api/shops/:shopId/products/:productId', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 AND shop_id = $2 RETURNING id',
      [productId, req.shopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Emit real-time update
    io.to(`shop_${req.shopId}`).emit('product_deleted', { id: productId });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== ORDER ROUTES ====================

// Get all orders for a shop
app.get('/api/shops/:shopId/orders', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { page = 1, limit = 50, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM orders WHERE shop_id = $1';
    let params = [req.shopId];

    if (startDate && endDate) {
      query += ' AND created_at BETWEEN $2 AND $3';
      params.push(startDate, endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new order
app.post('/api/shops/:shopId/orders', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { 
      order_number, 
      items, 
      subtotal, 
      tax, 
      discount, 
      total, 
      payment_method, 
      payment_status, 
      customer_name, 
      order_type 
    } = req.body;

    const result = await pool.query(
      'INSERT INTO orders (shop_id, order_number, items, subtotal, tax, discount, total, payment_method, payment_status, cashier_id, customer_name, order_type) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
      [req.shopId, order_number, JSON.stringify(items), subtotal, tax, discount, total, payment_method, payment_status, req.user.id, customer_name, order_type]
    );

    // Emit real-time update
    io.to(`shop_${req.shopId}`).emit('order_created', result.rows[0]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update order
app.put('/api/shops/:shopId/orders/:orderId', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body;

    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (key === 'items') {
        fields.push(`${key} = $${paramCount}`);
        values.push(JSON.stringify(updateData[key]));
      } else {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
      }
      paramCount++;
    });

    values.push(orderId, req.shopId);

    const query = `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} AND shop_id = $${paramCount + 1} RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit real-time update
    io.to(`shop_${req.shopId}`).emit('order_updated', result.rows[0]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete order
app.delete('/api/shops/:shopId/orders/:orderId', authenticateToken, checkShopAccess, async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      'DELETE FROM orders WHERE id = $1 AND shop_id = $2 RETURNING id',
      [orderId, req.shopId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit real-time update
    io.to(`shop_${req.shopId}`).emit('order_deleted', { id: orderId });

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SOCKET.IO REAL-TIME CONNECTIONS ====================

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join shop room for real-time updates
  socket.on('join_shop', (shopId) => {
    socket.join(`shop_${shopId}`);
    console.log(`User ${socket.id} joined shop ${shopId}`);
  });

  // Leave shop room
  socket.on('leave_shop', (shopId) => {
    socket.leave(`shop_${shopId}`);
    console.log(`User ${socket.id} left shop ${shopId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Smoocho Bill POS Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`⚡ Socket.IO: http://localhost:${PORT}`);
});

module.exports = { app, server, io };
