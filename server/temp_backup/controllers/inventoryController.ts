import { Request, Response } from 'express';
import { inventoryService } from '../services/inventoryService';
import { catchAsync } from '../middleware/errorHandler';

export const inventoryController = {
  // Get all inventory items
  getAllItems: catchAsync(async (req: Request, res: Response) => {
    const { 
      isActive, 
      lowStock, 
      expiringSoon, 
      search 
    } = req.query;

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
      filters.search = search as string;
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
    const {
      name,
      unit,
      current_stock,
      minimum_stock,
      cost_per_unit,
      supplier_name,
      supplier_contact,
      expiry_date
    } = req.body;

    // Validation
    if (!name || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Name and unit are required'
      });
    }

    const itemData: any = {
      name: name.trim(),
      unit: unit.trim(),
      current_stock: current_stock || 0,
      minimum_stock: minimum_stock || 0
    };

    if (cost_per_unit !== undefined) {
      itemData.cost_per_unit = parseFloat(cost_per_unit);
    }

    if (supplier_name) {
      itemData.supplier_name = supplier_name.trim();
    }

    if (supplier_contact) {
      itemData.supplier_contact = supplier_contact.trim();
    }

    if (expiry_date) {
      itemData.expiry_date = new Date(expiry_date);
    }

    const item = await inventoryService.createInventoryItem(itemData);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Inventory item created successfully'
    });
  }),

  // Update inventory item
  updateItem: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if item exists
    const existingItem = await inventoryService.getInventoryItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Clean and validate update data
    const cleanData: any = {};
    
    if (updateData.name) cleanData.name = updateData.name.trim();
    if (updateData.unit) cleanData.unit = updateData.unit.trim();
    if (updateData.minimum_stock !== undefined) {
      cleanData.minimum_stock = parseFloat(updateData.minimum_stock);
    }
    if (updateData.cost_per_unit !== undefined) {
      cleanData.cost_per_unit = parseFloat(updateData.cost_per_unit);
    }
    if (updateData.supplier_name) {
      cleanData.supplier_name = updateData.supplier_name.trim();
    }
    if (updateData.supplier_contact) {
      cleanData.supplier_contact = updateData.supplier_contact.trim();
    }
    if (updateData.expiry_date) {
      cleanData.expiry_date = new Date(updateData.expiry_date);
    }
    if (updateData.is_active !== undefined) {
      cleanData.is_active = Boolean(updateData.is_active);
    }

    const updatedItem = await inventoryService.updateInventoryItem(id, cleanData);

    res.json({
      success: true,
      data: updatedItem,
      message: 'Inventory item updated successfully'
    });
  }),

  // Delete inventory item (soft delete)
  deleteItem: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingItem = await inventoryService.getInventoryItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await inventoryService.deleteInventoryItem(id);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });
  }),

  // Add stock transaction
  addStockTransaction: catchAsync(async (req: Request, res: Response) => {
    const {
      inventory_item_id,
      transaction_type,
      quantity,
      cost_per_unit,
      reference_type,
      reference_id,
      notes
    } = req.body;

    const user = (req as any).user;

    // Validation
    if (!inventory_item_id || !transaction_type || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Inventory item ID, transaction type, and quantity are required'
      });
    }

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(transaction_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transaction type'
      });
    }

    const transactionData: any = {
      inventory_item_id,
      transaction_type,
      quantity: parseFloat(quantity),
      user_id: user.id
    };

    if (cost_per_unit !== undefined) {
      transactionData.cost_per_unit = parseFloat(cost_per_unit);
    }

    if (reference_type) {
      transactionData.reference_type = reference_type;
    }

    if (reference_id) {
      transactionData.reference_id = reference_id;
    }

    if (notes) {
      transactionData.notes = notes.trim();
    }

    try {
      const transaction = await inventoryService.addStockTransaction(transactionData);

      res.status(201).json({
        success: true,
        data: transaction,
        message: 'Stock transaction added successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }),

  // Get low stock alerts
  getLowStockAlerts: catchAsync(async (req: Request, res: Response) => {
    const alerts = await inventoryService.getLowStockAlerts();

    res.json({
      success: true,
      data: alerts,
      count: alerts.length
    });
  }),

  // Get expiring items
  getExpiringItems: catchAsync(async (req: Request, res: Response) => {
    const { days } = req.query;
    const daysAhead = days ? parseInt(days as string) : 7;

    const items = await inventoryService.getExpiringItems(daysAhead);

    res.json({
      success: true,
      data: items,
      count: items.length
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

  // Get stock summary
  getStockSummary: catchAsync(async (req: Request, res: Response) => {
    const summary = await inventoryService.getStockSummary();

    res.json({
      success: true,
      data: summary
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

  // Bulk update stock levels
  bulkUpdateStock: catchAsync(async (req: Request, res: Response) => {
    const { updates } = req.body;
    const user = (req as any).user;

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }

    const results = [];

    try {
      for (const update of updates) {
        const { inventory_item_id, new_stock, notes } = update;

        if (!inventory_item_id || new_stock === undefined) {
          continue;
        }

        const transaction = await inventoryService.addStockTransaction({
          inventory_item_id,
          transaction_type: 'ADJUSTMENT',
          quantity: parseFloat(new_stock),
          reference_type: 'MANUAL',
          notes: notes || 'Bulk stock update',
          user_id: user.id
        });

        results.push(transaction);
      }

      res.json({
        success: true,
        data: results,
        message: `${results.length} stock levels updated successfully`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }),

  // Import inventory from CSV/Excel
  importInventory: catchAsync(async (req: Request, res: Response) => {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [] as string[]
    };

    for (const itemData of items) {
      try {
        const { name, unit, current_stock, minimum_stock, cost_per_unit, supplier_name } = itemData;

        if (!name || !unit) {
          results.errors.push(`Missing required fields for item: ${name || 'Unknown'}`);
          continue;
        }

        // Check if item already exists
        const existingItems = await inventoryService.getAllInventoryItems({
          search: name.trim()
        });

        const existingItem = existingItems.find(item => 
          item.name.toLowerCase() === name.trim().toLowerCase()
        );

        if (existingItem) {
          // Update existing item
          await inventoryService.updateInventoryItem(existingItem.id, {
            current_stock: current_stock || existingItem.current_stock,
            minimum_stock: minimum_stock || existingItem.minimum_stock,
            cost_per_unit: cost_per_unit || existingItem.cost_per_unit,
            supplier_name: supplier_name || existingItem.supplier_name
          });
          results.updated++;
        } else {
          // Create new item
          await inventoryService.createInventoryItem({
            name: name.trim(),
            unit: unit.trim(),
            current_stock: current_stock || 0,
            minimum_stock: minimum_stock || 0,
            cost_per_unit: cost_per_unit,
            supplier_name: supplier_name
          });
          results.created++;
        }
      } catch (error: any) {
        results.errors.push(`Error processing item ${itemData.name}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Import completed. Created: ${results.created}, Updated: ${results.updated}, Errors: ${results.errors.length}`
    });
  })
};