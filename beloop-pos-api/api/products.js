// Vercel API route: /api/products
// File: vercel-api-routes/products.js

const { DatabaseBridge } = require('../firebase-bridge');

export default async function handler(req, res) {
  const { method } = req;
  const bridge = new DatabaseBridge();

  try {
    switch (method) {
      case 'GET':
        return await getProducts(req, res, bridge);
      case 'POST':
        return await createProduct(req, res, bridge);
      case 'PUT':
        return await updateProduct(req, res, bridge);
      case 'DELETE':
        return await deleteProduct(req, res, bridge);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Products API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getProducts(req, res, bridge) {
  try {
    const products = await bridge.getProducts();
    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

async function createProduct(req, res, bridge) {
  try {
    const productData = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    // Set default values
    productData.isActive = productData.isActive !== false;
    productData.syncStatus = 'SYNCED';

    const product = await bridge.createProduct(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function updateProduct(req, res, bridge) {
  try {
    const { id } = req.query;
    const productData = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const product = await bridge.updateProduct(id, productData);
    res.status(200).json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function deleteProduct(req, res, bridge) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const result = await bridge.deleteProduct(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}
