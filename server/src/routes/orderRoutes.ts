import express, { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { recipeService } from '../services/recipeService';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Create new order
router.post('/create', catchAsync(async (req: Request, res: Response) => {
  const orderData = req.body;
  const order = await orderService.createOrder(orderData);
  
  res.json({
    success: true,
    data: order,
    message: 'Order created successfully'
  });
}));

// Process order (without consuming inventory)
router.post('/:orderId/process', catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const result = await orderService.processOrder(orderId);
  
  if (result.success) {
    res.json({
      success: true,
      data: {
        order: result.order
      },
      message: 'Order processed successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      data: {
        order: result.order,
        errors: result.errors
      },
      message: 'Failed to process order'
    });
  }
}));

// Complete order
router.post('/:orderId/complete', catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await orderService.completeOrder(orderId);
  
  if (order) {
    res.json({
      success: true,
      data: order,
      message: 'Order completed successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
}));

// Cancel order
router.post('/:orderId/cancel', catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  
  const result = await orderService.cancelOrder(orderId, reason);
  
  if (result.success) {
    res.json({
      success: true,
      data: result.order,
      message: 'Order cancelled successfully'
    });
  } else {
    res.status(400).json({
      success: false,
      message: result.errors.join(', ')
    });
  }
}));

// Get order by ID
router.get('/:orderId', catchAsync(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const order = await orderService.getOrder(orderId);
  
  if (order) {
    res.json({
      success: true,
      data: order,
      message: 'Order retrieved successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }
}));

// Get all orders with filters
router.get('/', catchAsync(async (req: Request, res: Response) => {
  const { status, customerId, startDate, endDate, limit } = req.query;
  
  const filters: any = {};
  if (status) filters.status = status;
  if (customerId) filters.customerId = customerId;
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (limit) filters.limit = parseInt(limit as string);
  
  const orders = await orderService.getOrders(filters);
  
  res.json({
    success: true,
    data: orders,
    message: 'Orders retrieved successfully'
  });
}));

// Get order statistics
router.get('/statistics/:timeframe', catchAsync(async (req: Request, res: Response) => {
  const { timeframe } = req.params;
  
  if (!['daily', 'weekly', 'monthly'].includes(timeframe)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timeframe. Use daily, weekly, or monthly'
    });
  }
  
  const stats = await orderService.getOrderStatistics(timeframe as 'daily' | 'weekly' | 'monthly');
  
  res.json({
    success: true,
    data: stats,
    message: `${timeframe} order statistics retrieved successfully`
  });
}));

// Get low stock alerts
router.get('/low-stock-alerts', catchAsync(async (req: Request, res: Response) => {
  const alerts = await orderService.getLowStockAlerts();
  
  res.json({
    success: true,
    data: alerts,
    message: 'Low stock alerts retrieved successfully'
  });
}));

// Recipe management routes
router.get('/recipes', catchAsync(async (req: Request, res: Response) => {
  const recipes = await recipeService.getAllRecipes();
  
  res.json({
    success: true,
    data: recipes,
    message: 'Recipes retrieved successfully'
  });
}));

router.get('/recipes/:menuItemId', catchAsync(async (req: Request, res: Response) => {
  const { menuItemId } = req.params;
  const recipe = await recipeService.getRecipe(menuItemId);
  
  if (recipe) {
    res.json({
      success: true,
      data: recipe,
      message: 'Recipe retrieved successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Recipe not found'
    });
  }
}));

// Check ingredients availability for a menu item
router.get('/recipes/:menuItemId/availability', catchAsync(async (req: Request, res: Response) => {
  const { menuItemId } = req.params;
  const { quantity } = req.query;
  
  const availability = await recipeService.checkIngredientsAvailability(
    menuItemId, 
    parseInt(quantity as string) || 1
  );
  
  res.json({
    success: true,
    data: availability,
    message: 'Ingredients availability checked successfully'
  });
}));

// Get cost analysis for a menu item
router.get('/recipes/:menuItemId/cost-analysis', catchAsync(async (req: Request, res: Response) => {
  const { menuItemId } = req.params;
  const analysis = await recipeService.getCostAnalysis(menuItemId);
  
  if (analysis) {
    res.json({
      success: true,
      data: analysis,
      message: 'Cost analysis retrieved successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Recipe not found for cost analysis'
    });
  }
}));

// Add new recipe
router.post('/recipes', catchAsync(async (req: Request, res: Response) => {
  const recipeData = req.body;
  const recipe = await recipeService.addRecipe(recipeData);
  
  res.json({
    success: true,
    data: recipe,
    message: 'Recipe added successfully'
  });
}));

// Update recipe
router.put('/recipes/:menuItemId', catchAsync(async (req: Request, res: Response) => {
  const { menuItemId } = req.params;
  const updates = req.body;
  
  const recipe = await recipeService.updateRecipe(menuItemId, updates);
  
  if (recipe) {
    res.json({
      success: true,
      data: recipe,
      message: 'Recipe updated successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Recipe not found'
    });
  }
}));

// Delete recipe
router.delete('/recipes/:menuItemId', catchAsync(async (req: Request, res: Response) => {
  const { menuItemId } = req.params;
  const deleted = await recipeService.deleteRecipe(menuItemId);
  
  if (deleted) {
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Recipe not found'
    });
  }
}));

export { router as orderRoutes };
