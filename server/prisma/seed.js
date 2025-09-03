"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // Create admin user
    const adminPasswordHash = await bcryptjs_1.default.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@smoocho.com',
            password_hash: adminPasswordHash,
            role: 'ADMIN',
            is_active: true,
        },
    });
    // Create cashier user
    const cashierPasswordHash = await bcryptjs_1.default.hash('cashier123', 12);
    const cashierUser = await prisma.user.upsert({
        where: { username: 'cashier' },
        update: {},
        create: {
            username: 'cashier',
            email: 'cashier@smoocho.com',
            password_hash: cashierPasswordHash,
            role: 'CASHIER',
            is_active: true,
        },
    });
    // Create categories
    const kunafaCategory = await prisma.category.upsert({
        where: { id: 'kunafa-cat-1' },
        update: {},
        create: {
            id: 'kunafa-cat-1',
            name: 'Kunafa Bowls',
            description: 'Introducing Kunafa - Premium dessert bowls',
            sort_order: 1,
            is_active: true,
        },
    });
    const signaturesCategory = await prisma.category.upsert({
        where: { id: 'signatures-cat-1' },
        update: {},
        create: {
            id: 'signatures-cat-1',
            name: 'Smoocho Signatures',
            description: 'Our signature dessert collection',
            sort_order: 2,
            is_active: true,
        },
    });
    const crispyRiceCategory = await prisma.category.upsert({
        where: { id: 'crispy-rice-cat-1' },
        update: {},
        create: {
            id: 'crispy-rice-cat-1',
            name: 'Crispy Rice Tubs',
            description: 'Introducing Crispy Rice Tubs',
            sort_order: 3,
            is_active: true,
        },
    });
    const chocoDessertsCategory = await prisma.category.upsert({
        where: { id: 'choco-desserts-cat-1' },
        update: {},
        create: {
            id: 'choco-desserts-cat-1',
            name: 'Choco Desserts',
            description: 'Classic and premium chocolate desserts',
            sort_order: 4,
            is_active: true,
        },
    });
    const fruitsChocoCategory = await prisma.category.upsert({
        where: { id: 'fruits-choco-cat-1' },
        update: {},
        create: {
            id: 'fruits-choco-cat-1',
            name: 'Fruits Choco Mix',
            description: 'Farm fresh fruits mixed with premium chocolates',
            sort_order: 5,
            is_active: true,
        },
    });
    const icecreamCategory = await prisma.category.upsert({
        where: { id: 'icecream-cat-1' },
        update: {},
        create: {
            id: 'icecream-cat-1',
            name: 'Choco Ice Creams',
            description: 'Premium ice cream scoops',
            sort_order: 6,
            is_active: true,
        },
    });
    const drinksCategory = await prisma.category.upsert({
        where: { id: 'drinks-cat-1' },
        update: {},
        create: {
            id: 'drinks-cat-1',
            name: 'Drinks',
            description: 'Refreshing beverages and specialty drinks',
            sort_order: 7,
            is_active: true,
        },
    });
    const toppingsCategory = await prisma.category.upsert({
        where: { id: 'toppings-cat-1' },
        update: {},
        create: {
            id: 'toppings-cat-1',
            name: 'Add-ons & Toppings',
            description: 'Fresh fruit cuts and extra toppings',
            sort_order: 8,
            is_active: true,
        },
    });
    // Create sample products based on Smoocho menu
    const products = [
        // KUNAFA BOWLS
        {
            id: 'kunafa-hazelnut',
            name: 'Hazelnut Kunafa',
            description: 'Premium hazelnut kunafa bowl',
            category_id: kunafaCategory.id,
            price: 219.00,
            cost_price: 120.00,
            sku: 'KUNAFA-HAZ-001',
            preparation_time: 5,
        },
        {
            id: 'kunafa-white-chocolate',
            name: 'White Chocolate Kunafa',
            description: 'Rich white chocolate kunafa bowl',
            category_id: kunafaCategory.id,
            price: 219.00,
            cost_price: 125.00,
            sku: 'KUNAFA-WHT-001',
            preparation_time: 5,
        },
        {
            id: 'kunafa-pistachio',
            name: 'Pistachio Kunafa',
            description: 'Premium pistachio kunafa bowl',
            category_id: kunafaCategory.id,
            price: 249.00,
            cost_price: 140.00,
            sku: 'KUNAFA-PIS-001',
            preparation_time: 5,
        },
        {
            id: 'kunafa-biscoff',
            name: 'Biscoff Kunafa',
            description: 'Delicious biscoff kunafa bowl',
            category_id: kunafaCategory.id,
            price: 249.00,
            cost_price: 135.00,
            sku: 'KUNAFA-BIS-001',
            preparation_time: 5,
        },
        // SMOOCHO SIGNATURES
        {
            id: 'choco-tsunami',
            name: 'Choco Tsunami',
            description: 'Signature chocolate tsunami dessert',
            category_id: signaturesCategory.id,
            price: 189.00,
            cost_price: 95.00,
            sku: 'SIG-CHO-TSU-001',
            preparation_time: 7,
        },
        {
            id: 'mango-tsunami',
            name: 'Mango Tsunami',
            description: 'Fresh mango tsunami delight',
            category_id: signaturesCategory.id,
            price: 199.00,
            cost_price: 100.00,
            sku: 'SIG-MAN-TSU-001',
            preparation_time: 7,
        },
        // CRISPY RICE TUBS
        {
            id: 'crispy-hazelnut-white',
            name: 'Hazelnut White Crispy Rice',
            description: 'Crispy rice with hazelnut and white chocolate',
            category_id: crispyRiceCategory.id,
            price: 239.00,
            cost_price: 130.00,
            sku: 'CRISPY-HAZ-WHT-001',
            preparation_time: 4,
        },
        {
            id: 'crispy-mango-hazelnut',
            name: 'Mango Hazelnut Crispy Rice',
            description: 'Crispy rice with mango and hazelnut',
            category_id: crispyRiceCategory.id,
            price: 249.00,
            cost_price: 130.00,
            sku: 'CRISPY-MAN-HAZ-001',
            preparation_time: 4,
        },
        // CHOCO DESSERTS
        {
            id: 'choco-sponge-classic',
            name: 'Choco Sponge (Classic)',
            description: 'Classic chocolate sponge dessert',
            category_id: chocoDessertsCategory.id,
            price: 69.00,
            cost_price: 35.00,
            sku: 'CHOCO-SPO-CLA-001',
            preparation_time: 3,
        },
        {
            id: 'choco-brownie-premium',
            name: 'Choco Brownie (Premium)',
            description: 'Premium chocolate brownie',
            category_id: chocoDessertsCategory.id,
            price: 109.00,
            cost_price: 55.00,
            sku: 'CHOCO-BRO-PRE-001',
            preparation_time: 4,
        },
        // FRUITS CHOCO MIX
        {
            id: 'choco-mixed-fruits',
            name: 'Choco Mixed Fruits',
            description: 'Mixed fresh fruits with chocolate',
            category_id: fruitsChocoCategory.id,
            price: 160.00,
            cost_price: 90.00,
            sku: 'CHOCO-MIX-001',
            preparation_time: 6,
        },
        {
            id: 'choco-mango-classic',
            name: 'Choco Mango',
            description: 'Fresh mango with chocolate',
            category_id: fruitsChocoCategory.id,
            price: 99.00,
            cost_price: 55.00,
            sku: 'CHOCO-MAN-001',
            preparation_time: 5,
        },
        // ICE CREAMS
        {
            id: 'choco-vanilla-scoop',
            name: 'Choco Vanilla Scoop',
            description: 'Premium vanilla ice cream scoop',
            category_id: icecreamCategory.id,
            price: 69.00,
            cost_price: 35.00,
            sku: 'ICE-VAN-001',
            preparation_time: 2,
        },
        {
            id: 'choco-chocolate-scoop',
            name: 'Choco Chocolate Scoop',
            description: 'Rich chocolate ice cream scoop',
            category_id: icecreamCategory.id,
            price: 69.00,
            cost_price: 35.00,
            sku: 'ICE-CHO-001',
            preparation_time: 2,
        },
        // DRINKS
        {
            id: 'vietnamese-iced-coffee',
            name: 'Vietnamese Iced Coffee',
            description: 'Traditional Vietnamese iced coffee',
            category_id: drinksCategory.id,
            price: 79.00,
            cost_price: 35.00,
            sku: 'DRINK-VIE-ICE-001',
            preparation_time: 4,
        },
        {
            id: 'korean-strawberry-milk',
            name: 'Korean Strawberry Milk',
            description: 'Sweet Korean strawberry milk',
            category_id: drinksCategory.id,
            price: 89.00,
            cost_price: 40.00,
            sku: 'DRINK-KOR-STR-001',
            preparation_time: 3,
        },
        // ADD-ONS
        {
            id: 'extra-ice-cream-scoop',
            name: 'Extra Ice Cream Scoop',
            description: 'Add an extra scoop for sharing (₹29)',
            category_id: toppingsCategory.id,
            price: 29.00,
            cost_price: 15.00,
            sku: 'ADD-ICE-SCOOP-001',
            preparation_time: 1,
        },
        {
            id: 'fresh-banana',
            name: 'Fresh Robust Banana',
            description: 'Fresh banana cuts as topping',
            category_id: toppingsCategory.id,
            price: 20.00,
            cost_price: 10.00,
            sku: 'ADD-BANANA-001',
            preparation_time: 1,
        },
    ];
    for (const product of products) {
        await prisma.product.upsert({
            where: { id: product.id },
            update: {},
            create: product,
        });
    }
    // Create inventory items for Smoocho ingredients
    const inventoryItems = [
        {
            id: 'inv-kunafa-base',
            name: 'Kunafa Base',
            unit: 'grams',
            current_stock: 5000,
            minimum_stock: 1000,
            cost_per_unit: 1.2,
            supplier_name: 'Premium Dessert Supplies',
        },
        {
            id: 'inv-hazelnut',
            name: 'Hazelnut Topping',
            unit: 'grams',
            current_stock: 2000,
            minimum_stock: 300,
            cost_per_unit: 3.5,
            supplier_name: 'Nuts & More',
        },
        {
            id: 'inv-white-chocolate',
            name: 'White Chocolate',
            unit: 'grams',
            current_stock: 3000,
            minimum_stock: 500,
            cost_per_unit: 2.8,
            supplier_name: 'Chocolate Delights',
        },
        {
            id: 'inv-pistachio',
            name: 'Pistachio Topping',
            unit: 'grams',
            current_stock: 1500,
            minimum_stock: 200,
            cost_per_unit: 4.2,
            supplier_name: 'Premium Nuts Co.',
        },
        {
            id: 'inv-biscoff',
            name: 'Biscoff Spread',
            unit: 'grams',
            current_stock: 2500,
            minimum_stock: 400,
            cost_per_unit: 2.5,
            supplier_name: 'Biscoff India',
        },
        {
            id: 'inv-crispy-rice',
            name: 'Crispy Rice Base',
            unit: 'grams',
            current_stock: 4000,
            minimum_stock: 800,
            cost_per_unit: 1.8,
            supplier_name: 'Rice Products Ltd.',
        },
        {
            id: 'inv-mango-pieces',
            name: 'Fresh Mango Pieces',
            unit: 'grams',
            current_stock: 3000,
            minimum_stock: 500,
            cost_per_unit: 1.5,
            supplier_name: 'Fresh Fruits Market',
        },
        {
            id: 'inv-chocolate-sponge',
            name: 'Chocolate Sponge Base',
            unit: 'pieces',
            current_stock: 200,
            minimum_stock: 30,
            cost_per_unit: 15.0,
            supplier_name: 'Bakery Supplies',
        },
        {
            id: 'inv-coffee-powder',
            name: 'Premium Coffee Powder',
            unit: 'grams',
            current_stock: 2000,
            minimum_stock: 300,
            cost_per_unit: 2.0,
            supplier_name: 'Coffee Roasters',
        },
        {
            id: 'inv-vanilla-icecream',
            name: 'Vanilla Ice Cream',
            unit: 'scoops',
            current_stock: 150,
            minimum_stock: 25,
            cost_per_unit: 25.0,
            supplier_name: 'Frozen Delights',
        },
        {
            id: 'inv-chocolate-icecream',
            name: 'Chocolate Ice Cream',
            unit: 'scoops',
            current_stock: 150,
            minimum_stock: 25,
            cost_per_unit: 25.0,
            supplier_name: 'Frozen Delights',
        },
        {
            id: 'inv-strawberry-icecream',
            name: 'Strawberry Ice Cream',
            unit: 'scoops',
            current_stock: 120,
            minimum_stock: 20,
            cost_per_unit: 25.0,
            supplier_name: 'Frozen Delights',
        },
        {
            id: 'inv-mango-icecream',
            name: 'Mango Ice Cream',
            unit: 'scoops',
            current_stock: 120,
            minimum_stock: 20,
            cost_per_unit: 25.0,
            supplier_name: 'Frozen Delights',
        },
        {
            id: 'inv-milk',
            name: 'Fresh Milk',
            unit: 'ml',
            current_stock: 10000,
            minimum_stock: 2000,
            cost_per_unit: 0.08,
            supplier_name: 'Local Dairy',
        },
        {
            id: 'inv-fresh-fruits',
            name: 'Mixed Fresh Fruits',
            unit: 'grams',
            current_stock: 2000,
            minimum_stock: 300,
            cost_per_unit: 2.2,
            supplier_name: 'Fresh Fruits Market',
        },
        {
            id: 'inv-banana',
            name: 'Fresh Banana',
            unit: 'pieces',
            current_stock: 100,
            minimum_stock: 15,
            cost_per_unit: 8.0,
            supplier_name: 'Fruit Vendors',
        },
    ];
    for (const item of inventoryItems) {
        await prisma.inventoryItem.upsert({
            where: { id: item.id },
            update: {},
            create: item,
        });
    }
    // Create default settings
    const settings = [
        { key: 'store_name', value: 'Smoocho Dessert Shop', data_type: 'STRING', description: 'Name of the store' },
        { key: 'tax_rate', value: '0.05', data_type: 'NUMBER', description: 'Tax rate (5%)' },
        { key: 'currency', value: 'INR', data_type: 'STRING', description: 'Currency code' },
        { key: 'currency_symbol', value: '₹', data_type: 'STRING', description: 'Currency symbol' },
        { key: 'auto_print_receipt', value: 'true', data_type: 'BOOLEAN', description: 'Auto print receipt after payment' },
        { key: 'low_stock_alert_enabled', value: 'true', data_type: 'BOOLEAN', description: 'Enable low stock alerts' },
        { key: 'sync_interval_minutes', value: '5', data_type: 'NUMBER', description: 'Sync interval in minutes' },
    ];
    for (const setting of settings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting,
        });
    }
    console.log('✅ Database seeded successfully!');
    console.log('👤 Admin user: admin / admin123');
    console.log('👤 Cashier user: cashier / cashier123');
    console.log(`📦 Created ${products.length} products`);
    console.log(`📋 Created ${inventoryItems.length} inventory items`);
    console.log(`⚙️  Created ${settings.length} settings`);
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map