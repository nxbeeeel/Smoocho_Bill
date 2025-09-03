import express, { Request, Response } from 'express';
import { menuService } from '../services/menuService';
import { authenticate } from '../middleware/auth';
import { catchAsync } from '../middleware/errorHandler';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Get all menu items
router.get('/items', catchAsync(async (req: Request, res: Response) => {
  const items = await menuService.getAllMenuItems();
  
  res.json({
    success: true,
    data: items,
    message: 'Menu items retrieved successfully'
  });
}));

// Get menu item by ID
router.get('/items/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const item = await menuService.getMenuItemById(id);
  
  if (!item) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }
  
  res.json({
    success: true,
    data: item,
    message: 'Menu item retrieved successfully'
  });
}));

// Create new menu item
router.post('/items', catchAsync(async (req: Request, res: Response) => {
  const itemData = req.body;
  const newItem = await menuService.createMenuItem(itemData);
  
  res.status(201).json({
    success: true,
    data: newItem,
    message: 'Menu item created successfully'
  });
}));

// Update menu item
router.put('/items/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const updatedItem = await menuService.updateMenuItem(id, updates);
  
  if (!updatedItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }
  
  res.json({
    success: true,
    data: updatedItem,
    message: 'Menu item updated successfully'
  });
}));

// Delete menu item
router.delete('/items/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await menuService.deleteMenuItem(id);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Menu item deleted successfully'
  });
}));

// Toggle item availability
router.patch('/items/:id/toggle-availability', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedItem = await menuService.toggleItemAvailability(id);
  
  if (!updatedItem) {
    return res.status(404).json({
      success: false,
      message: 'Menu item not found'
    });
  }
  
  res.json({
    success: true,
    data: updatedItem,
    message: `Item availability ${updatedItem.is_available ? 'enabled' : 'disabled'} successfully`
  });
}));

// Get all categories
router.get('/categories', catchAsync(async (req: Request, res: Response) => {
  const categories = await menuService.getAllCategories();
  
  res.json({
    success: true,
    data: categories,
    message: 'Categories retrieved successfully'
  });
}));

// Get category by ID
router.get('/categories/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const category = await menuService.getCategoryById(id);
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  res.json({
    success: true,
    data: category,
    message: 'Category retrieved successfully'
  });
}));

// Create new category
router.post('/categories', catchAsync(async (req: Request, res: Response) => {
  const categoryData = req.body;
  const newCategory = await menuService.createCategory(categoryData);
  
  res.status(201).json({
    success: true,
    data: newCategory,
    message: 'Category created successfully'
  });
}));

// Update category
router.put('/categories/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  
  const updatedCategory = await menuService.updateCategory(id, updates);
  
  if (!updatedCategory) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  res.json({
    success: true,
    data: updatedCategory,
    message: 'Category updated successfully'
  });
}));

// Delete category
router.delete('/categories/:id', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await menuService.deleteCategory(id);
  
  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
}));

// Get menu items by category
router.get('/categories/:id/items', catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const items = await menuService.getMenuItemsByCategory(id);
  
  res.json({
    success: true,
    data: items,
    message: 'Menu items by category retrieved successfully'
  });
}));

// Search menu items
router.get('/search', catchAsync(async (req: Request, res: Response) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }
  
  const results = await menuService.searchMenuItems(q);
  
  res.json({
    success: true,
    data: results,
    message: `Search results for "${q}"`
  });
}));

// Get menu statistics
router.get('/statistics', catchAsync(async (req: Request, res: Response) => {
  const stats = await menuService.getMenuStatistics();
  
  res.json({
    success: true,
    data: stats,
    message: 'Menu statistics retrieved successfully'
  });
}));

export { router as menuRoutes };
