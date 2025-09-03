import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService';
import { catchAsync } from '../middleware/errorHandler';

export const inventoryController = {
  // Get all inventory items
  getAllItems: catchAsync(async (req: Request, res: Response) => {
    const { isActive, lowStock, expiringSoon, search } = req.query;
    const filters: any = {};
    
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    if (lowStock === 'true') {
      filters.lowStock = true;
    }
    if (expiringSoon === 'true') {
      filters.expiringSoon = true;
    }
    if (search) {
      filters.search = search;
    }

    const items = await inventoryService.getAllInventoryItems(filters);
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  }),

  // Get single inventory item
  getItemById: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await inventoryService.getInventoryItemById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  }),

  // Create new inventory item
  createItem: catchAsync(async (req: Request, res: Response) => {
    const item = await inventoryService.createInventoryItem(req.body);
    
    res.status(201).json({
      success: true,
      data: item,
      message: 'Inventory item created successfully'
    });
  }),

  // Update inventory item
  updateItem: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await inventoryService.updateInventoryItem(id, req.body);
    
    res.json({
      success: true,
      data: item,
      message: 'Inventory item updated successfully'
    });
  }),

  // Delete inventory item
  deleteItem: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    await inventoryService.deleteInventoryItem(id);
    
    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  }),

  // Add stock transaction
  addStockTransaction: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transaction = await inventoryService.addStockTransaction({
      ...req.body,
      inventory_item_id: id
    });
    
    res.json({
      success: true,
      data: transaction,
      message: 'Stock transaction added successfully'
    });
  }),

  // Get stock history
  getStockHistory: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { startDate, endDate, limit } = req.query;
    
    const history = await inventoryService.getStockHistory(id, {
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      limit: limit ? parseInt(limit as string) : 50
    });
    
    res.json({
      success: true,
      data: history
    });
  }),

  // Get low stock items
  getLowStockItems: catchAsync(async (req: Request, res: Response) => {
    const { threshold } = req.query;
    const items = await inventoryService.getLowStockItems(
      threshold ? parseInt(threshold as string) : undefined
    );
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  }),

  // Get expiring soon items
  getExpiringSoonItems: catchAsync(async (req: Request, res: Response) => {
    const { days } = req.query;
    const items = await inventoryService.getExpiringSoonItems(
      days ? parseInt(days as string) : 30
    );
    
    res.json({
      success: true,
      data: items,
      count: items.length
    });
  }),

  // Get stock summary
  getStockSummary: catchAsync(async (req: Request, res: Response) => {
    const summary = await inventoryService.getStockSummary();
    
    res.json({
      success: true,
      data: summary
    });
  }),

  // Get stock usage report
  getStockUsageReport: catchAsync(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    const report = await inventoryService.getStockUsageReport(start, end);
    
    res.json({
      success: true,
      data: report,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  }),

  // Check stock availability for products
  checkStockAvailability: catchAsync(async (req: Request, res: Response) => {
    const { productIds } = req.body;
    
    if (!productIds || !Array.isArray(productIds)) {
      return res.status(400).json({
        success: false,
        message: 'Product IDs array is required'
      });
    }

    const availability = await inventoryService.checkStockAvailability(productIds);
    
    res.json({
      success: true,
      data: availability
    });
  }),

  // Import inventory from CSV/Excel
  importInventory: catchAsync(async (req: Request, res: Response) => {
    const { file, options } = req.body;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    const result = await inventoryService.importInventory(file, options);
    
    res.json({
      success: true,
      data: result,
      message: 'Inventory imported successfully'
    });
  }),

  // Export inventory to CSV/Excel
  exportInventory: catchAsync(async (req: Request, res: Response) => {
    const { format, filters } = req.query;
    
    const result = await inventoryService.exportInventory({
      format: format as string || 'csv',
      filters: filters ? JSON.parse(filters as string) : {}
    });
    
    res.json({
      success: true,
      data: result,
      message: 'Inventory exported successfully'
    });
  })
};
