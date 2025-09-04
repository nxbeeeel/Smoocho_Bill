// Smoocho Bill POS - Database Initialization Script
const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/smoocho_pos',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

async function initializeDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('🚀 Initializing Smoocho Bill POS Database...')
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
    console.log('✅ UUID extension enabled')

    // Create tables
    await createTables(client)
    console.log('✅ Database tables created')

    // Insert sample data
    await insertSampleData(client)
    console.log('✅ Sample data inserted')

    console.log('🎉 Database initialization completed successfully!')
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

async function createTables(client) {
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

  // Create indexes
  await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
  await client.query('CREATE INDEX IF NOT EXISTS idx_users_shop_id ON users(shop_id)')
  await client.query('CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id)')
  await client.query('CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id)')
  await client.query('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)')

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
}

async function insertSampleData(client) {
  // Check if sample data already exists
  const shopCheck = await client.query('SELECT COUNT(*) FROM shops')
  if (parseInt(shopCheck.rows[0].count) > 0) {
    console.log('📋 Sample data already exists, skipping...')
    return
  }

  // Insert sample shop
  const shopResult = await client.query(`
    INSERT INTO shops (name, settings) 
    VALUES ($1, $2) 
    RETURNING id`,
    [
      'Smoocho Bill',
      JSON.stringify({
        storeName: 'Smoocho Bill',
        storeAddress: '123 Main Street, City',
        storePhone: '+91 9876543210',
        storeEmail: 'info@smoochobill.com',
        storeWebsite: 'www.smoochobill.com',
        storeGST: '22ABCDE1234F1Z5',
        upiId: 'smoocho@paytm',
        taxRate: 18,
        currency: 'INR',
        theme: 'light',
        language: 'en',
        timezone: 'Asia/Kolkata',
        printerEnabled: true,
        soundEnabled: true,
        autoBackup: true
      })
    ]
  )
  const shopId = shopResult.rows[0].id

  // Insert sample owner user (password: 'admin123')
  const bcrypt = require('bcryptjs')
  const passwordHash = await bcrypt.hash('admin123', 12)
  
  const userResult = await client.query(`
    INSERT INTO users (email, password_hash, name, role, shop_id) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id`,
    ['admin@smoochobill.com', passwordHash, 'Shop Owner', 'owner', shopId]
  )
  const userId = userResult.rows[0].id

  // Update shop owner
  await client.query('UPDATE shops SET owner_id = $1 WHERE id = $2', [userId, shopId])

  // Insert sample products
  const products = [
    ['Hazelnut Kunafa', 299.00, 'Kunafa Bowls', 'Delicious kunafa with hazelnut flavor'],
    ['White Chocolate Kunafa', 329.00, 'Kunafa Bowls', 'Rich white chocolate kunafa'],
    ['Pista Kunafa', 279.00, 'Kunafa Bowls', 'Traditional pistachio kunafa'],
    ['Choco Tsunami', 399.00, 'Signatures', 'Signature chocolate dessert'],
    ['Mango Tsunami', 379.00, 'Signatures', 'Signature mango dessert'],
    ['Choco Sponge Classic', 199.00, 'Choco Desserts', 'Classic chocolate sponge cake'],
    ['Milo Dinauser', 149.00, 'Drinks', 'Refreshing milo drink'],
    ['Malaysian Mango Milk', 129.00, 'Drinks', 'Creamy mango milk']
  ]

  for (const [name, price, category, description] of products) {
    await client.query(`
      INSERT INTO products (shop_id, name, price, category, description, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [shopId, name, price, category, description, true]
    )
  }

  console.log('📊 Sample data inserted:')
  console.log('   - Shop: Smoocho Bill')
  console.log('   - User: admin@smoochobill.com (password: admin123)')
  console.log('   - Products: 8 sample products')
}

// Run initialization
if (require.main === module) {
  initializeDatabase().catch(console.error)
}

module.exports = { initializeDatabase }
