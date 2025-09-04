# Smoocho Bill POS - Backend API

## Production-Ready Backend Architecture

### **Technology Stack:**
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (primary) + Redis (caching/sessions)
- **Real-time**: Socket.io for live updates
- **Authentication**: JWT tokens
- **File Storage**: AWS S3 or Cloudinary for images
- **Deployment**: Docker + AWS/GCP/Azure

### **API Endpoints:**

#### **Authentication & Users**
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/profile
PUT  /api/auth/profile
```

#### **Shop Management**
```
GET    /api/shops/:shopId
PUT    /api/shops/:shopId
GET    /api/shops/:shopId/settings
PUT    /api/shops/:shopId/settings
```

#### **Products & Inventory**
```
GET    /api/shops/:shopId/products
POST   /api/shops/:shopId/products
PUT    /api/shops/:shopId/products/:productId
DELETE /api/shops/:shopId/products/:productId
GET    /api/shops/:shopId/inventory
PUT    /api/shops/:shopId/inventory/:itemId
```

#### **Orders & Sales**
```
GET    /api/shops/:shopId/orders
POST   /api/shops/:shopId/orders
GET    /api/shops/:shopId/orders/:orderId
PUT    /api/shops/:shopId/orders/:orderId
DELETE /api/shops/:shopId/orders/:orderId
GET    /api/shops/:shopId/reports/sales
```

#### **Real-time Sync**
```
WebSocket: /socket.io
Events: order_created, order_updated, product_updated, settings_changed
```

### **Database Schema:**

#### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'cashier',
  shop_id UUID REFERENCES shops(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Shops Table**
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Products Table**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Orders Table**
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES shops(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'completed',
  cashier_id UUID REFERENCES users(id),
  customer_name VARCHAR(255),
  order_type VARCHAR(50) DEFAULT 'dine_in',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Real-time Features:**
1. **Live Order Updates**: When one device creates an order, all devices see it instantly
2. **Inventory Sync**: Stock levels update in real-time across all devices
3. **Settings Sync**: Configuration changes apply immediately to all devices
4. **User Activity**: Track which user is logged in on which device

### **Security Features:**
1. **JWT Authentication**: Secure token-based authentication
2. **Role-based Access**: Owner, Manager, Cashier roles
3. **Data Encryption**: All sensitive data encrypted
4. **Rate Limiting**: Prevent abuse and attacks
5. **Audit Logs**: Track all changes and user actions

### **Deployment Options:**

#### **Option 1: Cloud Hosting (Recommended)**
- **AWS**: EC2 + RDS + S3 + CloudFront
- **Google Cloud**: Compute Engine + Cloud SQL + Cloud Storage
- **Azure**: Virtual Machines + SQL Database + Blob Storage

#### **Option 2: VPS Hosting**
- **DigitalOcean**: Droplet + Managed Database
- **Linode**: VPS + Managed Database
- **Vultr**: VPS + Managed Database

#### **Option 3: Self-Hosted**
- **Raspberry Pi**: For small shops
- **Local Server**: For larger operations
- **Docker**: Easy deployment and management

### **Cost Estimation:**
- **Small Shop (1-3 devices)**: $20-50/month
- **Medium Shop (3-10 devices)**: $50-100/month
- **Large Shop (10+ devices)**: $100-200/month

### **Benefits:**
1. **Real-time Sync**: All devices always have latest data
2. **Backup & Recovery**: Automatic backups and disaster recovery
3. **Scalability**: Easy to add more devices and features
4. **Security**: Professional-grade security and data protection
5. **Analytics**: Advanced reporting and business insights
6. **Support**: Professional support and maintenance
