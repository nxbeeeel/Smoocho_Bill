-- Smoocho Bill POS - Database Schema
-- PostgreSQL Database Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS TABLE ====================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'cashier')),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== SHOPS TABLE ====================
CREATE TABLE shops (
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
);

-- ==================== PRODUCTS TABLE ====================
CREATE TABLE products (
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
);

-- ==================== INVENTORY TABLE ====================
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    threshold DECIMAL(10,2) DEFAULT 10.00,
    category VARCHAR(100),
    expiry_date DATE,
    supplier VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==================== ORDERS TABLE ====================
CREATE TABLE orders (
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
);

-- ==================== RECIPES TABLE (for inventory management) ====================
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    quantity_required DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== AUDIT LOGS TABLE ====================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shop_id UUID REFERENCES shops(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==================== INDEXES ====================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_shop_id ON users(shop_id);
CREATE INDEX idx_users_role ON users(role);

-- Shops indexes
CREATE INDEX idx_shops_owner_id ON shops(owner_id);
CREATE INDEX idx_shops_name ON shops(name);

-- Products indexes
CREATE INDEX idx_products_shop_id ON products(shop_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_products_name ON products(name);

-- Inventory indexes
CREATE INDEX idx_inventory_shop_id ON inventory(shop_id);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_expiry_date ON inventory(expiry_date);

-- Orders indexes
CREATE INDEX idx_orders_shop_id ON orders(shop_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_cashier_id ON orders(cashier_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_type ON orders(order_type);

-- Recipes indexes
CREATE INDEX idx_recipes_product_id ON recipes(product_id);
CREATE INDEX idx_recipes_inventory_item_id ON recipes(inventory_item_id);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_shop_id ON audit_logs(shop_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ==================== TRIGGERS ====================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_shops_updated_at BEFORE UPDATE ON shops FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA ====================

-- Insert sample shop
INSERT INTO shops (id, name, settings) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Smoocho Bill', '{
    "storeName": "Smoocho Bill",
    "storeAddress": "123 Main Street, City",
    "storePhone": "+91 9876543210",
    "storeEmail": "info@smoochobill.com",
    "storeWebsite": "www.smoochobill.com",
    "storeGST": "22ABCDE1234F1Z5",
    "upiId": "smoocho@paytm",
    "taxRate": 18,
    "currency": "INR",
    "theme": "light",
    "language": "en",
    "timezone": "Asia/Kolkata",
    "printerEnabled": true,
    "soundEnabled": true,
    "autoBackup": true
}');

-- Insert sample owner user
INSERT INTO users (id, email, password_hash, name, role, shop_id) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'owner@smoochobill.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K.', 'Shop Owner', 'owner', '550e8400-e29b-41d4-a716-446655440000');

-- Update shop owner
UPDATE shops SET owner_id = '550e8400-e29b-41d4-a716-446655440001' WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert sample products
INSERT INTO products (shop_id, name, price, category, description, is_active) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Hazelnut Kunafa', 299.00, 'Kunafa Bowls', 'Delicious kunafa with hazelnut flavor', true),
('550e8400-e29b-41d4-a716-446655440000', 'White Chocolate Kunafa', 329.00, 'Kunafa Bowls', 'Rich white chocolate kunafa', true),
('550e8400-e29b-41d4-a716-446655440000', 'Pista Kunafa', 279.00, 'Kunafa Bowls', 'Traditional pistachio kunafa', true),
('550e8400-e29b-41d4-a716-446655440000', 'Choco Tsunami', 399.00, 'Signatures', 'Signature chocolate dessert', true),
('550e8400-e29b-41d4-a716-446655440000', 'Mango Tsunami', 379.00, 'Signatures', 'Signature mango dessert', true),
('550e8400-e29b-41d4-a716-446655440000', 'Choco Sponge Classic', 199.00, 'Choco Desserts', 'Classic chocolate sponge cake', true),
('550e8400-e29b-41d4-a716-446655440000', 'Milo Dinauser', 149.00, 'Drinks', 'Refreshing milo drink', true),
('550e8400-e29b-41d4-a716-446655440000', 'Malaysian Mango Milk', 129.00, 'Drinks', 'Creamy mango milk', true);

-- ==================== VIEWS ====================

-- Sales summary view
CREATE VIEW sales_summary AS
SELECT 
    s.id as shop_id,
    s.name as shop_name,
    DATE(o.created_at) as sale_date,
    COUNT(o.id) as total_orders,
    SUM(o.total) as total_revenue,
    AVG(o.total) as average_order_value,
    SUM(CASE WHEN o.payment_method = 'cash' THEN o.total ELSE 0 END) as cash_sales,
    SUM(CASE WHEN o.payment_method = 'card' THEN o.total ELSE 0 END) as card_sales,
    SUM(CASE WHEN o.payment_method = 'upi' THEN o.total ELSE 0 END) as upi_sales
FROM shops s
LEFT JOIN orders o ON s.id = o.shop_id
GROUP BY s.id, s.name, DATE(o.created_at);

-- Product performance view
CREATE VIEW product_performance AS
SELECT 
    p.id,
    p.name,
    p.category,
    p.price,
    COUNT(oi.value->>'id') as times_ordered,
    SUM((oi.value->>'quantity')::int) as total_quantity_sold,
    SUM((oi.value->>'quantity')::int * p.price) as total_revenue
FROM products p
LEFT JOIN orders o ON p.shop_id = o.shop_id
LEFT JOIN jsonb_array_elements(o.items) as oi ON (oi.value->>'id')::uuid = p.id
GROUP BY p.id, p.name, p.category, p.price;

-- ==================== FUNCTIONS ====================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number(shop_id_param UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
    order_count INTEGER;
    order_number VARCHAR(50);
BEGIN
    SELECT COUNT(*) + 1 INTO order_count 
    FROM orders 
    WHERE shop_id = shop_id_param 
    AND DATE(created_at) = CURRENT_DATE;
    
    order_number := 'ORD-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(order_count::text, 4, '0');
    
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- Function to check low stock
CREATE OR REPLACE FUNCTION check_low_stock(shop_id_param UUID)
RETURNS TABLE(product_id UUID, product_name VARCHAR, current_stock INTEGER, threshold INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.stock_quantity, p.low_stock_threshold
    FROM products p
    WHERE p.shop_id = shop_id_param 
    AND p.is_active = true
    AND p.stock_quantity <= p.low_stock_threshold;
END;
$$ LANGUAGE plpgsql;

-- ==================== PERMISSIONS ====================

-- Create application user (for production)
-- CREATE USER smoocho_pos WITH PASSWORD 'your_secure_password';
-- GRANT CONNECT ON DATABASE smoocho_pos TO smoocho_pos;
-- GRANT USAGE ON SCHEMA public TO smoocho_pos;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO smoocho_pos;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO smoocho_pos;

-- ==================== COMMENTS ====================

COMMENT ON TABLE users IS 'System users with role-based access';
COMMENT ON TABLE shops IS 'Shop/business information and settings';
COMMENT ON TABLE products IS 'Menu items and products';
COMMENT ON TABLE inventory IS 'Raw materials and ingredients';
COMMENT ON TABLE orders IS 'Customer orders and transactions';
COMMENT ON TABLE recipes IS 'Product recipes and ingredient requirements';
COMMENT ON TABLE audit_logs IS 'System audit trail for all changes';

COMMENT ON COLUMN users.role IS 'User role: owner, manager, or cashier';
COMMENT ON COLUMN shops.settings IS 'JSON configuration for shop settings';
COMMENT ON COLUMN products.image_url IS 'URL to product image';
COMMENT ON COLUMN orders.items IS 'JSON array of order items';
COMMENT ON COLUMN orders.payment_method IS 'Payment method used';
COMMENT ON COLUMN orders.order_type IS 'Type of order: dine_in, takeaway, or delivery';
