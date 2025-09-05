// Firebase Bridge for Existing Database
// This connects your existing SQLite/Dexie database to Firebase

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "beloop-pos",
  "private_key_id": "YOUR_PRIVATE_KEY_ID", // You need to get this from Firebase Console
  "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n", // You need to get this from Firebase Console
  "client_email": "firebase-adminsdk-xxxxx@beloop-pos.iam.gserviceaccount.com", // You need to get this from Firebase Console
  "client_id": "YOUR_CLIENT_ID", // You need to get this from Firebase Console
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40beloop-pos.iam.gserviceaccount.com"
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://beloop-pos-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();
const auth = admin.auth();

// Database Bridge Class
class DatabaseBridge {
  constructor() {
    this.db = db;
    this.auth = auth;
  }

  // Convert your existing database structure to Firebase
  async syncExistingDataToFirebase() {
    console.log('🔄 Starting database sync to Firebase...');
    
    try {
      // Sync products
      await this.syncProducts();
      
      // Sync orders
      await this.syncOrders();
      
      // Sync users
      await this.syncUsers();
      
      // Sync settings
      await this.syncSettings();
      
      console.log('✅ Database sync to Firebase completed successfully!');
      
    } catch (error) {
      console.error('❌ Database sync failed:', error);
      throw error;
    }
  }

  // Sync products from your existing database to Firebase
  async syncProducts() {
    console.log('📦 Syncing products to Firebase...');
    
    // Your existing product structure
    const existingProducts = [
      // Kunafa Bowls
      { name: 'Hazelnut Kunafa', price: 219, category: 'Kunafa Bowls', description: 'Traditional kunafa with hazelnut topping', isActive: true },
      { name: 'White Chocolate Kunafa', price: 219, category: 'Kunafa Bowls', description: 'Kunafa with white chocolate', isActive: true },
      { name: 'Pista Kunafa', price: 249, category: 'Kunafa Bowls', description: 'Kunafa with pistachio topping', isActive: true },
      { name: 'Biscoff Kunafa', price: 249, category: 'Kunafa Bowls', description: 'Kunafa with Biscoff topping', isActive: true },
      { name: 'Hazelnut White Kunafa', price: 249, category: 'Kunafa Bowls', description: 'White kunafa with hazelnut', isActive: true },
      
      // Signatures
      { name: 'Choco Tsunami', price: 189, category: 'Signatures', description: 'Signature chocolate dessert', isActive: true },
      { name: 'Mango Tsunami', price: 199, category: 'Signatures', description: 'Signature mango dessert', isActive: true },
      { name: 'Hazelnut Mango Cyclone', price: 209, category: 'Signatures', description: 'Mango cyclone with hazelnut', isActive: true },
      
      // Choco Desserts
      { name: 'Choco Sponge Classic', price: 69, category: 'Choco Desserts', description: 'Classic chocolate sponge', isActive: true },
      { name: 'Choco Sponge Premium', price: 99, category: 'Choco Desserts', description: 'Premium chocolate sponge', isActive: true },
      { name: 'Choco Brownie Classic', price: 79, category: 'Choco Desserts', description: 'Classic chocolate brownie', isActive: true },
      { name: 'Choco Brownie Premium', price: 109, category: 'Choco Desserts', description: 'Premium chocolate brownie', isActive: true },
      
      // Drinks
      { name: 'Milo Dinauser', price: 79, category: 'Drinks', description: 'Milo chocolate drink', isActive: true },
      { name: 'Malaysian Mango Milk', price: 79, category: 'Drinks', description: 'Malaysian style mango milk', isActive: true },
      { name: 'Korean Strawberry Milk', price: 89, category: 'Drinks', description: 'Korean style strawberry milk', isActive: true },
      { name: 'Vietnamese Iced Coffee', price: 79, category: 'Drinks', description: 'Traditional Vietnamese iced coffee', isActive: true },
      
      // Toppings
      { name: 'Fresh Robust Banana', price: 20, category: 'Toppings', description: 'Fresh banana topping', isActive: true },
      { name: 'Diced Mango', price: 30, category: 'Toppings', description: 'Fresh diced mango topping', isActive: true },
      { name: 'Sliced Strawberry', price: 30, category: 'Toppings', description: 'Fresh sliced strawberry topping', isActive: true },
      { name: 'Sliced Kiwi', price: 30, category: 'Toppings', description: 'Fresh sliced kiwi topping', isActive: true }
    ];

    const batch = db.batch();
    
    for (const product of existingProducts) {
      const productRef = db.collection('products').doc();
      batch.set(productRef, {
        ...product,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        syncStatus: 'SYNCED'
      });
    }
    
    await batch.commit();
    console.log(`✅ Synced ${existingProducts.length} products to Firebase`);
  }

  // Sync orders from your existing database to Firebase
  async syncOrders() {
    console.log('📋 Syncing orders to Firebase...');
    
    // This would typically read from your existing database
    // For now, we'll create a sample order structure
    const sampleOrder = {
      orderNumber: 'ORD-001',
      items: [
        { productId: '1', productName: 'Hazelnut Kunafa', quantity: 2, price: 219, total: 438 },
        { productId: '2', productName: 'Milo Dinauser', quantity: 1, price: 79, total: 79 }
      ],
      subtotal: 517,
      tax: 51.7,
      discount: 0,
      discountType: 'flat',
      total: 568.7,
      paymentMethod: 'cash',
      paymentStatus: 'completed',
      cashierId: 'admin',
      customerName: 'Sample Customer',
      orderType: 'dine_in',
      notes: 'Sample order for testing',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncStatus: 'SYNCED'
    };

    await db.collection('orders').add(sampleOrder);
    console.log('✅ Synced sample order to Firebase');
  }

  // Sync users from your existing database to Firebase
  async syncUsers() {
    console.log('👥 Syncing users to Firebase...');
    
    const existingUsers = [
      {
        username: 'admin',
        password: 'admin123', // In production, this should be hashed
        role: 'admin',
        name: 'Administrator',
        email: 'admin@smoocho.com',
        isActive: true
      },
      {
        username: 'cashier',
        password: 'cashier123',
        role: 'cashier',
        name: 'Cashier',
        isActive: true
      }
    ];

    const batch = db.batch();
    
    for (const user of existingUsers) {
      const userRef = db.collection('users').doc();
      batch.set(userRef, {
        ...user,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        syncStatus: 'SYNCED'
      });
    }
    
    await batch.commit();
    console.log(`✅ Synced ${existingUsers.length} users to Firebase`);
  }

  // Sync settings from your existing database to Firebase
  async syncSettings() {
    console.log('⚙️ Syncing settings to Firebase...');
    
    const existingSettings = [
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
      { key: 'printerEnabled', value: 'true' },
      { key: 'soundEnabled', value: 'true' },
      { key: 'theme', value: 'light' },
      { key: 'language', value: 'en' },
      { key: 'timezone', value: 'Asia/Kolkata' }
    ];

    const batch = db.batch();
    
    for (const setting of existingSettings) {
      const settingRef = db.collection('settings').doc();
      batch.set(settingRef, {
        ...setting,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        syncStatus: 'SYNCED'
      });
    }
    
    await batch.commit();
    console.log(`✅ Synced ${existingSettings.length} settings to Firebase`);
  }

  // Get data from Firebase
  async getProducts() {
    const snapshot = await db.collection('products').orderBy('name').get();
    const products = [];
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return products;
  }

  async getOrders() {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    const orders = [];
    snapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return orders;
  }

  async getUsers() {
    const snapshot = await db.collection('users').get();
    const users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return users;
  }

  async getSettings() {
    const snapshot = await db.collection('settings').get();
    const settings = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      settings[data.key] = data.value;
    });
    return settings;
  }

  // Create new product in Firebase
  async createProduct(productData) {
    const docRef = await db.collection('products').add({
      ...productData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncStatus: 'SYNCED'
    });
    return { id: docRef.id, ...productData };
  }

  // Create new order in Firebase
  async createOrder(orderData) {
    const docRef = await db.collection('orders').add({
      ...orderData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncStatus: 'SYNCED'
    });
    return { id: docRef.id, ...orderData };
  }

  // Update product in Firebase
  async updateProduct(productId, productData) {
    await db.collection('products').doc(productId).update({
      ...productData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncStatus: 'SYNCED'
    });
    return { id: productId, ...productData };
  }

  // Update order in Firebase
  async updateOrder(orderId, orderData) {
    await db.collection('orders').doc(orderId).update({
      ...orderData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      syncStatus: 'SYNCED'
    });
    return { id: orderId, ...orderData };
  }

  // Delete product from Firebase
  async deleteProduct(productId) {
    await db.collection('products').doc(productId).delete();
    return { id: productId, deleted: true };
  }

  // Delete order from Firebase
  async deleteOrder(orderId) {
    await db.collection('orders').doc(orderId).delete();
    return { id: orderId, deleted: true };
  }
}

module.exports = {
  DatabaseBridge,
  db,
  auth
};
