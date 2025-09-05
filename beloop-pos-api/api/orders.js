// Vercel API route: /api/orders
// File: vercel-api-routes/orders.js

const { DatabaseBridge } = require('../firebase-bridge');

export default async function handler(req, res) {
  const { method } = req;
  const bridge = new DatabaseBridge();

  try {
    switch (method) {
      case 'GET':
        return await getOrders(req, res, bridge);
      case 'POST':
        return await createOrder(req, res, bridge);
      case 'PUT':
        return await updateOrder(req, res, bridge);
      case 'DELETE':
        return await deleteOrder(req, res, bridge);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Orders API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getOrders(req, res, bridge) {
  try {
    const { limit = 50, status, startDate, endDate } = req.query;
    
    let orders = await bridge.getOrders();
    
    // Apply filters
    if (status) {
      orders = orders.filter(order => order.paymentStatus === status);
    }
    
    if (startDate) {
      const start = new Date(startDate);
      orders = orders.filter(order => new Date(order.createdAt) >= start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      orders = orders.filter(order => new Date(order.createdAt) <= end);
    }
    
    // Apply limit
    orders = orders.slice(0, parseInt(limit));

    res.status(200).json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function createOrder(req, res, bridge) {
  try {
    const orderData = req.body;
    
    // Validate required fields
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return res.status(400).json({ error: 'Order must have at least one item' });
    }

    // Calculate totals if not provided
    if (!orderData.subtotal || !orderData.total) {
      const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.18; // 18% tax (GST)
      const total = subtotal + tax - (orderData.discount || 0);

      orderData.subtotal = subtotal;
      orderData.tax = tax;
      orderData.total = total;
    }

    // Set default values
    orderData.orderNumber = orderData.orderNumber || `ORD-${Date.now()}`;
    orderData.paymentStatus = orderData.paymentStatus || 'completed';
    orderData.paymentMethod = orderData.paymentMethod || 'cash';
    orderData.orderType = orderData.orderType || 'dine_in';
    orderData.discount = orderData.discount || 0;
    orderData.discountType = orderData.discountType || 'flat';
    orderData.deliveryCharge = orderData.deliveryCharge || 0;
    orderData.syncStatus = 'SYNCED';

    const order = await bridge.createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}

async function updateOrder(req, res, bridge) {
  try {
    const { id } = req.query;
    const orderData = req.body;
    
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const order = await bridge.updateOrder(id, orderData);
    res.status(200).json(order);
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
}

async function deleteOrder(req, res, bridge) {
  try {
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ error: 'Order ID is required' });
    }

    const result = await bridge.deleteOrder(id);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
}
