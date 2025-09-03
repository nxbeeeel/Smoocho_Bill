import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { inventoryController } from '../controllers/inventoryController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Inventory Items CRUD
router.get('/items', inventoryController.getAllItems);
router.get('/items/:id', inventoryController.getItemById);
router.post('/items', authorize('admin', 'manager'), inventoryController.createItem);
router.put('/items/:id', authorize('admin', 'manager'), inventoryController.updateItem);
router.delete('/items/:id', authorize('admin'), inventoryController.deleteItem);

// Stock Transactions
router.post('/transactions', authorize('admin', 'manager'), inventoryController.addStockTransaction);
router.post('/bulk-update', authorize('admin', 'manager'), inventoryController.bulkUpdateStock);

// Reports and Analytics
router.get('/alerts/low-stock', inventoryController.getLowStockAlerts);
router.get('/alerts/expiring', inventoryController.getExpiringItems);
router.get('/reports/usage', inventoryController.getStockUsageReport);
router.get('/summary', inventoryController.getStockSummary);

// Stock Availability
router.post('/check-availability', inventoryController.checkStockAvailability);

// Import/Export
router.post('/import', authorize('admin', 'manager'), inventoryController.importInventory);

export { router as inventoryRoutes };