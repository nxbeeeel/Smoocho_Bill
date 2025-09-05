// Vercel API route: /api/sync
// File: vercel-api-routes/sync.js

const { db } = require('../firebase-vercel-config');

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return await downloadData(req, res);
      case 'POST':
        return await uploadData(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Sync API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function downloadData(req, res) {
  try {
    const { lastSync = 0, deviceId } = req.query;
    const lastSyncDate = new Date(parseInt(lastSync));

    // Get products updated since last sync
    const productsSnapshot = await db.collection('products')
      .where('updatedAt', '>', lastSyncDate)
      .get();

    // Get orders updated since last sync
    const ordersSnapshot = await db.collection('orders')
      .where('updatedAt', '>', lastSyncDate)
      .get();

    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const orders = [];
    ordersSnapshot.forEach(doc => {
      orders.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      products,
      orders,
      lastSync: Date.now(),
      deviceId: deviceId || 'unknown'
    });
  } catch (error) {
    console.error('Download data error:', error);
    res.status(500).json({ error: 'Failed to download data' });
  }
}

async function uploadData(req, res) {
  try {
    const { products, orders, deviceId } = req.body;
    const conflicts = [];

    // Process products
    if (products && Array.isArray(products)) {
      for (const product of products) {
        try {
          if (product.id) {
            // Update existing product
            await db.collection('products').doc(product.id).update({
              ...product,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              lastSyncedBy: deviceId
            });
          } else {
            // Create new product
            await db.collection('products').add({
              ...product,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              lastSyncedBy: deviceId
            });
          }
        } catch (error) {
          conflicts.push({
            type: 'product',
            id: product.id,
            error: error.message
          });
        }
      }
    }

    // Process orders
    if (orders && Array.isArray(orders)) {
      for (const order of orders) {
        try {
          if (order.id) {
            // Update existing order
            await db.collection('orders').doc(order.id).update({
              ...order,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              lastSyncedBy: deviceId
            });
          } else {
            // Create new order
            await db.collection('orders').add({
              ...order,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
              lastSyncedBy: deviceId
            });
          }
        } catch (error) {
          conflicts.push({
            type: 'order',
            id: order.id,
            error: error.message
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${products?.length || 0} products and ${orders?.length || 0} orders`,
      conflicts
    });
  } catch (error) {
    console.error('Upload data error:', error);
    res.status(500).json({ error: 'Failed to upload data' });
  }
}
