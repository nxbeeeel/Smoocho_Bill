// Vercel API route: /api/sync-existing
// File: vercel-api-routes/sync-existing.js

const { DatabaseBridge } = require('../firebase-bridge');

export default async function handler(req, res) {
  const { method } = req;
  const bridge = new DatabaseBridge();

  try {
    switch (method) {
      case 'GET':
        return await syncExistingData(req, res, bridge);
      case 'POST':
        return await syncFromExistingDB(req, res, bridge);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Sync existing API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function syncExistingData(req, res, bridge) {
  try {
    console.log('🔄 Starting sync of existing data to Firebase...');
    
    // Sync all existing data to Firebase
    await bridge.syncExistingDataToFirebase();
    
    res.status(200).json({
      success: true,
      message: 'Existing data synced to Firebase successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync existing data error:', error);
    res.status(500).json({ 
      error: 'Failed to sync existing data',
      details: error.message 
    });
  }
}

async function syncFromExistingDB(req, res, bridge) {
  try {
    const { dataType, data } = req.body;
    
    if (!dataType || !data) {
      return res.status(400).json({ error: 'dataType and data are required' });
    }

    let result;
    
    switch (dataType) {
      case 'products':
        if (Array.isArray(data)) {
          // Bulk sync products
          for (const product of data) {
            await bridge.createProduct(product);
          }
          result = { synced: data.length, type: 'products' };
        } else {
          result = await bridge.createProduct(data);
        }
        break;
        
      case 'orders':
        if (Array.isArray(data)) {
          // Bulk sync orders
          for (const order of data) {
            await bridge.createOrder(order);
          }
          result = { synced: data.length, type: 'orders' };
        } else {
          result = await bridge.createOrder(data);
        }
        break;
        
      case 'users':
        if (Array.isArray(data)) {
          // Bulk sync users
          for (const user of data) {
            await bridge.createUser(user);
          }
          result = { synced: data.length, type: 'users' };
        } else {
          result = await bridge.createUser(data);
        }
        break;
        
      case 'settings':
        if (Array.isArray(data)) {
          // Bulk sync settings
          for (const setting of data) {
            await bridge.createSetting(setting);
          }
          result = { synced: data.length, type: 'settings' };
        } else {
          result = await bridge.createSetting(data);
        }
        break;
        
      default:
        return res.status(400).json({ error: 'Invalid dataType. Must be products, orders, users, or settings' });
    }

    res.status(200).json({
      success: true,
      message: `Successfully synced ${dataType} to Firebase`,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Sync from existing DB error:', error);
    res.status(500).json({ 
      error: 'Failed to sync data from existing database',
      details: error.message 
    });
  }
}
