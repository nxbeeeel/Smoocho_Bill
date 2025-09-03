import express from 'express';
import { inventoryController } from '../controllers/inventoryController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// Inventory Items CRUD
router.get('/items', inventoryController.getAllItems);
router.get('/items/:id', inventoryController.getItemById);
router.post('/items', inventoryController.createItem);
router.put('/items/:id', inventoryController.updateItem);
router.delete('/items/:id', inventoryController.deleteItem);

// Stock Management
router.post('/items/:id/stock', inventoryController.addStockTransaction);
router.get('/items/:id/stock-history', inventoryController.getStockHistory);
router.get('/low-stock', inventoryController.getLowStockItems);
router.get('/expiring-soon', inventoryController.getExpiringSoonItems);

// Reports and Analytics
router.get('/summary', inventoryController.getStockSummary);
router.get('/usage-report', inventoryController.getStockUsageReport);

// Stock Availability
router.post('/check-availability', inventoryController.checkStockAvailability);

// Import/Export
router.post('/import', inventoryController.importInventory);
router.get('/export', inventoryController.exportInventory);

export { router as inventoryRoutes };
