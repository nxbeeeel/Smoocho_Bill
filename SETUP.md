# Smoocho Bill POS - Complete Setup Guide

## 🚀 Production-Ready Next.js POS System

This guide will help you set up the complete Smoocho Bill POS system with real-time synchronization across all devices using Next.js API routes and PostgreSQL.

## 📋 Prerequisites

- **Node.js 16+** and **npm 8+**
- **PostgreSQL 13+** database
- **Git** for version control

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React)     │  API Routes (Backend)              │
│  - POS Interface      │  - Authentication                  │
│  - Settings           │  - Products Management             │
│  - Order History      │  - Orders Management               │
│  - Menu Editor        │  - Real-time Sync                  │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                        │
│  - Users & Authentication                                   │
│  - Shops & Settings                                         │
│  - Products & Inventory                                     │
│  - Orders & Transactions                                    │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Installation Steps

### **Step 1: Clone and Install Dependencies**

```bash
# Clone the repository (if not already done)
git clone https://github.com/your-username/smoocho-bill-pos.git
cd smoocho-bill-pos

# Install dependencies
npm install
```

### **Step 2: Setup PostgreSQL Database**

#### **Option A: Local PostgreSQL Installation**

1. **Install PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib

   # macOS (with Homebrew)
   brew install postgresql
   brew services start postgresql

   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database:**
   ```bash
   # Connect to PostgreSQL
   sudo -u postgres psql

   # Create database and user
   CREATE DATABASE smoocho_pos;
   CREATE USER smoocho_user WITH PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE smoocho_pos TO smoocho_user;
   \q
   ```

#### **Option B: Cloud Database (Recommended for Production)**

1. **Neon (Free PostgreSQL):**
   - Go to [neon.tech](https://neon.tech)
   - Create account and new project
   - Copy the connection string

2. **Supabase (Free PostgreSQL):**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Copy the connection string from Settings > Database

3. **Railway (Free PostgreSQL):**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Add PostgreSQL service
   - Copy the connection string

### **Step 3: Environment Configuration**

1. **Create Environment File:**
   ```bash
   cp env.local.example .env.local
   ```

2. **Edit `.env.local`:**
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://smoocho_user:your_secure_password@localhost:5432/smoocho_pos
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   
   # Next.js Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   
   # Development/Production flags
   NODE_ENV=development
   ```

### **Step 4: Initialize Database**

```bash
# Initialize database with tables and sample data
npm run db:init
```

This will:
- Create all necessary tables
- Set up indexes for performance
- Insert sample shop and products
- Create default admin user

### **Step 5: Start Development Server**

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`

## 🔐 Default Login Credentials

After running `npm run db:init`, you can login with:

- **Email:** `admin@smoochobill.com`
- **Password:** `admin123`

**⚠️ Important:** Change these credentials immediately in production!

## 📱 Features Overview

### **🔐 Authentication System**
- User registration and login
- JWT-based authentication
- Role-based access control (Owner, Manager, Cashier)
- Secure password hashing

### **🏪 Shop Management**
- Multi-shop support
- Shop settings and configuration
- Real-time settings synchronization
- Custom branding and details

### **📦 Product Management**
- Add, edit, delete products
- Category organization
- Image upload and management
- Stock tracking
- Price management

### **🛒 Point of Sale**
- Modern POS interface
- Real-time cart management
- Multiple payment methods
- Tax calculation
- Discount management
- Receipt generation

### **📊 Order Management**
- Complete order history
- Order editing and deletion
- Print receipts
- Customer information
- Order types (Dine-in, Takeaway, Delivery)

### **📈 Real-time Synchronization**
- All devices sync automatically
- Live updates across devices
- No manual export/import needed
- Professional multi-device support

## 🚀 Production Deployment

### **Option 1: Vercel (Recommended)**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Environment Variables in Vercel:**
   ```
   DATABASE_URL=your_production_database_url
   JWT_SECRET=your_production_jwt_secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_production_nextauth_secret
   NODE_ENV=production
   ```

### **Option 2: Railway**

1. **Connect GitHub:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Deploy from repository

2. **Add PostgreSQL:**
   - Add PostgreSQL service
   - Copy connection string to environment variables

### **Option 3: DigitalOcean App Platform**

1. **Create App:**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Create new app from GitHub
   - Configure build settings

2. **Add Database:**
   - Add managed PostgreSQL database
   - Configure environment variables

## 🔧 API Endpoints

### **Authentication**
```
POST /api/auth/login          - User login
POST /api/auth/register       - User registration
GET  /api/auth/profile        - Get user profile
```

### **Shop Settings**
```
GET  /api/shops/[shopId]/settings     - Get shop settings
PUT  /api/shops/[shopId]/settings     - Update shop settings
```

### **Products**
```
GET    /api/shops/[shopId]/products           - Get all products
POST   /api/shops/[shopId]/products           - Create product
PUT    /api/shops/[shopId]/products/[id]      - Update product
DELETE /api/shops/[shopId]/products/[id]      - Delete product
```

### **Orders**
```
GET    /api/shops/[shopId]/orders            - Get all orders
POST   /api/shops/[shopId]/orders            - Create order
PUT    /api/shops/[shopId]/orders/[id]       - Update order
DELETE /api/shops/[shopId]/orders/[id]       - Delete order
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:init         # Initialize database
npm run db:reset        # Reset database (reinitialize)
```

## 📊 Database Schema

### **Users Table**
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique email
- `password_hash` (VARCHAR) - Hashed password
- `name` (VARCHAR) - User name
- `role` (VARCHAR) - User role (owner/manager/cashier)
- `shop_id` (UUID) - Foreign key to shops
- `is_active` (BOOLEAN) - Account status
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time

### **Shops Table**
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Shop name
- `owner_id` (UUID) - Foreign key to users
- `settings` (JSONB) - Shop configuration
- `address` (TEXT) - Shop address
- `phone` (VARCHAR) - Contact phone
- `email` (VARCHAR) - Contact email
- `gst_number` (VARCHAR) - GST number
- `upi_id` (VARCHAR) - UPI ID for payments
- `tax_rate` (DECIMAL) - Tax rate percentage
- `currency` (VARCHAR) - Currency code
- `timezone` (VARCHAR) - Shop timezone

### **Products Table**
- `id` (UUID) - Primary key
- `shop_id` (UUID) - Foreign key to shops
- `name` (VARCHAR) - Product name
- `price` (DECIMAL) - Product price
- `category` (VARCHAR) - Product category
- `description` (TEXT) - Product description
- `image_url` (VARCHAR) - Product image URL
- `is_active` (BOOLEAN) - Product status
- `stock_quantity` (INTEGER) - Stock quantity
- `low_stock_threshold` (INTEGER) - Low stock alert

### **Orders Table**
- `id` (UUID) - Primary key
- `shop_id` (UUID) - Foreign key to shops
- `order_number` (VARCHAR) - Unique order number
- `items` (JSONB) - Order items
- `subtotal` (DECIMAL) - Subtotal amount
- `tax` (DECIMAL) - Tax amount
- `discount` (DECIMAL) - Discount amount
- `total` (DECIMAL) - Total amount
- `payment_method` (VARCHAR) - Payment method
- `payment_status` (VARCHAR) - Payment status
- `cashier_id` (UUID) - Foreign key to users
- `customer_name` (VARCHAR) - Customer name
- `order_type` (VARCHAR) - Order type (dine_in/takeaway/delivery)
- `created_at` (TIMESTAMP) - Order time

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Role-based Access** - Different permission levels
- **Input Validation** - Server-side validation
- **SQL Injection Protection** - Parameterized queries
- **CORS Configuration** - Cross-origin request security

## 📱 Mobile Responsiveness

- **Responsive Design** - Works on all device sizes
- **Touch-friendly Interface** - Optimized for tablets
- **Mobile Navigation** - Collapsible sidebar
- **Floating Cart** - Mobile-optimized cart interface
- **Adaptive Layouts** - Automatic layout adjustment

## 🎯 Performance Optimizations

- **Database Indexing** - Optimized queries
- **Connection Pooling** - Efficient database connections
- **Image Optimization** - Automatic image compression
- **Caching Strategy** - Smart caching implementation
- **Lazy Loading** - On-demand component loading

## 🆘 Troubleshooting

### **Database Connection Issues**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U smoocho_user -d smoocho_pos

# Reset database
npm run db:reset
```

### **Build Issues**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### **Environment Issues**
```bash
# Check environment variables
cat .env.local

# Verify database URL format
echo $DATABASE_URL
```

## 📞 Support

For support and questions:
- **GitHub Issues:** Create an issue in the repository
- **Documentation:** Check this README and code comments
- **Community:** Join our Discord server (if available)

## 🎉 Congratulations!

You now have a production-ready POS system with:
- ✅ Real-time multi-device synchronization
- ✅ Professional authentication system
- ✅ Complete product and order management
- ✅ Mobile-responsive interface
- ✅ Secure database architecture
- ✅ Scalable API design

Your Smoocho Bill POS system is ready for your shop! 🚀
