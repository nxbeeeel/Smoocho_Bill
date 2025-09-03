import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { reportController } from '../controllers/reportController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Daily Sales Reports
router.get('/daily/:date', reportController.getDailySalesReport);
router.post('/daily/regenerate/:date', authorize('admin', 'manager'), reportController.regenerateReport);

// Monthly Sales Reports
router.get('/monthly/:month/:year', reportController.getMonthlySalesReport);
router.post('/monthly/regenerate/:month/:year', authorize('admin', 'manager'), reportController.regenerateReport);

// Cached Reports
router.get('/cached/:type/:period', reportController.getCachedReport);

// Generate and Store Reports
router.post('/generate', authorize('admin', 'manager'), reportController.generateReport);

// Sales Summary for Date Range
router.get('/summary', reportController.getSalesSummary);

// Top Selling Items
router.get('/top-items', reportController.getTopSellingItems);

// Payment Analytics
router.get('/payment-analytics', reportController.getPaymentAnalytics);

// Regenerate Report (for reprinting)
router.post('/regenerate/:type/:period', authorize('admin', 'manager'), reportController.regenerateReport);

export { router as reportRoutes };