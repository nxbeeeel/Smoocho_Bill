// Smoocho Bill POS - Server-side Database Configuration
import { Pool } from 'pg'
import { query as sqliteQuery, transaction as sqliteTransaction } from './database-sqlite'

// Check if using SQLite or PostgreSQL
const isSQLite = process.env.DATABASE_URL?.startsWith('sqlite:')

// PostgreSQL connection configuration (only if not using SQLite)
const pool = !isSQLite ? new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/smoocho_pos',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}) : null

// Database initialization
export async function initializeDatabase() {
  try {
    // Test connection
    if (!pool) {
      throw new Error('Database pool not initialized')
    }
    const client = await pool.connect()
    console.log('✅ Database connected successfully')
    client.release()

    // Create tables if they don't exist
    await createTables()
    console.log('✅ Database tables initialized')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Create database tables
async function createTables() {
  if (!pool) {
    throw new Error('Database pool not initialized')
  }
  const client = await pool.connect()
  
  try {
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'cashier')),
        shop_id UUID,
        is_active BOOLEAN DEFAULT true,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Shops table
    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
        settings JSONB DEFAULT '{}',
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        website VARCHAR(255),
        gst_number VARCHAR(50),
        upi_id VARCHAR(255),
        tax_rate DECIMAL(5,2) DEFAULT 18.00,
        currency VARCHAR(10) DEFAULT 'INR',
        timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Add foreign key constraint for users.shop_id
    await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS fk_users_shop_id 
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    `)

    // Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        image_url VARCHAR(500),
        is_active BOOLEAN DEFAULT true,
        stock_quantity INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        items JSONB NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        tax DECIMAL(10,2) DEFAULT 0,
        discount DECIMAL(10,2) DEFAULT 0,
        discount_type VARCHAR(20) DEFAULT 'flat' CHECK (discount_type IN ('flat', 'percentage')),
        total DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet')),
        payment_status VARCHAR(50) DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
        cashier_id UUID REFERENCES users(id) ON DELETE SET NULL,
        customer_name VARCHAR(255),
        customer_phone VARCHAR(50),
        order_type VARCHAR(50) DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
        delivery_address TEXT,
        delivery_charge DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_shop_id ON users(shop_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id)
    `)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)
    `)

    // Create update timestamp trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `)

    // Apply update triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS update_shops_updated_at ON shops;
      CREATE TRIGGER update_shops_updated_at 
      BEFORE UPDATE ON shops 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS update_products_updated_at ON products;
      CREATE TRIGGER update_products_updated_at 
      BEFORE UPDATE ON products 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

    await client.query(`
      DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
      CREATE TRIGGER update_orders_updated_at 
      BEFORE UPDATE ON orders 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
    `)

  } finally {
    client.release()
  }
}

// Database query helper
export async function query(text: string, params?: any[]) {
  if (isSQLite) {
    return sqliteQuery(text, params || [])
  } else {
    const client = await pool!.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }
}

// Transaction helper
export async function transaction(callback: (client: any) => Promise<any>) {
  if (isSQLite) {
    return sqliteTransaction(callback)
  } else {
    const client = await pool!.connect()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}

// Close database connection
export async function closeDatabase() {
  if (!isSQLite && pool) {
    await pool.end()
  }
}

export default pool
