// Smoocho Bill POS - Quick Setup Script
const fs = require('fs')
const path = require('path')
const Database = require('better-sqlite3')
const bcrypt = require('bcryptjs')

console.log('🚀 Smoocho Bill POS - Quick Setup')
console.log('=====================================\n')

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function initializeSQLiteDatabase() {
  try {
    console.log('🚀 Initializing SQLite database...')
    
    // Create database file
    const dbPath = path.join(__dirname, '..', 'smoocho_pos.db')
    const db = new Database(dbPath)
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON')
    
    // Create tables
    createTables(db)
    
    // Insert sample data
    insertSampleData(db)
    
    console.log('✅ SQLite database initialized successfully!')
    console.log(`📁 Database file: ${dbPath}`)
    
    db.close()
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

function createTables(db) {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'cashier')),
      shop_id TEXT,
      is_active INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `)

  // Shops table
  db.exec(`
    CREATE TABLE IF NOT EXISTS shops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT,
      settings TEXT DEFAULT '{}',
      address TEXT,
      phone TEXT,
      email TEXT,
      website TEXT,
      gst_number TEXT,
      upi_id TEXT,
      tax_rate REAL DEFAULT 18.00,
      currency TEXT DEFAULT 'INR',
      timezone TEXT DEFAULT 'Asia/Kolkata',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT,
      description TEXT,
      image_url TEXT,
      is_active INTEGER DEFAULT 1,
      stock_quantity INTEGER DEFAULT 0,
      low_stock_threshold INTEGER DEFAULT 10,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
    )
  `)

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      shop_id TEXT NOT NULL,
      order_number TEXT UNIQUE NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      discount_type TEXT DEFAULT 'flat' CHECK (discount_type IN ('flat', 'percentage')),
      total REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'upi', 'wallet')),
      payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      cashier_id TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      order_type TEXT DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
      delivery_address TEXT,
      delivery_charge REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
      FOREIGN KEY (cashier_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `)

  // Create indexes
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_users_shop_id ON users(shop_id)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_products_shop_id ON products(shop_id)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_orders_shop_id ON orders(shop_id)')
  db.exec('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)')
}

function insertSampleData(db) {
  // Check if sample data already exists
  const shopCount = db.prepare('SELECT COUNT(*) as count FROM shops').get()
  if (shopCount.count > 0) {
    console.log('📋 Sample data already exists, skipping...')
    return
  }

  // Generate UUIDs
  const shopId = generateUUID()
  const userId = generateUUID()

  // Insert sample shop
  db.prepare(`
    INSERT INTO shops (id, name, settings) 
    VALUES (?, ?, ?)
  `).run(shopId, 'Smoocho Bill', JSON.stringify({
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
  }))

  // Insert sample owner user (password: 'admin123')
  const passwordHash = bcrypt.hashSync('admin123', 12)
  
  db.prepare(`
    INSERT INTO users (id, email, password_hash, name, role, shop_id) 
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, 'admin@smoochobill.com', passwordHash, 'Shop Owner', 'owner', shopId)

  // Update shop owner
  db.prepare('UPDATE shops SET owner_id = ? WHERE id = ?').run(userId, shopId)

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

  const insertProduct = db.prepare(`
    INSERT INTO products (id, shop_id, name, price, category, description, is_active) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  for (const [name, price, category, description] of products) {
    insertProduct.run(generateUUID(), shopId, name, price, category, description, 1)
  }

  console.log('📊 Sample data inserted:')
  console.log('   - Shop: Smoocho Bill')
  console.log('   - User: admin@smoochobill.com (password: admin123)')
  console.log('   - Products: 8 sample products')
}

async function quickSetup() {
  try {
    // 1. Create .env.local if it doesn't exist
    const envPath = path.join(__dirname, '..', '.env.local')
    if (!fs.existsSync(envPath)) {
      console.log('📝 Creating .env.local file...')
      
      const envContent = `# Smoocho Bill POS - Environment Configuration

# Database Configuration (Using SQLite for quick setup)
DATABASE_URL=sqlite://./smoocho_pos.db

# JWT Configuration
JWT_SECRET=smoocho-bill-pos-secret-key-2024
JWT_EXPIRES_IN=7d

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=smoocho-nextauth-secret-2024

# Development/Production flags
NODE_ENV=development`

      fs.writeFileSync(envPath, envContent)
      console.log('✅ .env.local created successfully')
    } else {
      console.log('✅ .env.local already exists')
    }

    // 2. Initialize SQLite database
    console.log('\n🗄️ Setting up database...')
    initializeSQLiteDatabase()

    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📋 Next Steps:')
    console.log('1. Run: npm run dev')
    console.log('2. Open: http://localhost:3000')
    console.log('3. Login with: admin@smoochobill.com / admin123')
    console.log('\n✨ Your POS system is ready to use!')
    console.log('\n💡 Note: This uses SQLite for quick setup.')
    console.log('   For production, consider upgrading to PostgreSQL.')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    process.exit(1)
  }
}

quickSetup()