import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { integrationController } from '../controllers/integrationController';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// INTEGRATION CONFIGURATION ROUTES

// Get all integrations
router.get('/', integrationController.getAllIntegrations);

// Get specific integration
router.get('/:integrationId', integrationController.getIntegrationById);

// Update integration configuration
router.put('/:integrationId', 
  authorize('admin', 'manager'), 
  integrationController.updateIntegration
);

// Enable integration
router.post('/:integrationId/enable', 
  authorize('admin', 'manager'), 
  integrationController.enableIntegration
);

// Disable integration
router.post('/:integrationId/disable', 
  authorize('admin', 'manager'), 
  integrationController.disableIntegration
);

// Update credentials
router.post('/:integrationId/credentials', 
  authorize('admin'), 
  integrationController.updateCredentials
);

// Test connection
router.post('/:integrationId/test', 
  authorize('admin', 'manager'), 
  integrationController.testConnection
);

// Get integration statistics
router.get('/stats/overview', integrationController.getIntegrationStats);

// Get health status
router.get('/health/status', integrationController.getHealthStatus);

// PAYMENT INTEGRATION ROUTES

// Process payment
router.post('/payments/process', integrationController.processPayment);

// Process card payment
router.post('/payments/card', integrationController.processCardPayment);

// Check payment status
router.get('/payments/:orderId/status', integrationController.checkPaymentStatus);

// Process refund
router.post('/payments/refund', 
  authorize('admin', 'manager'), 
  integrationController.processRefund
);

// ORDER SYNC ROUTES

// Sync all orders
router.post('/orders/sync', 
  authorize('admin', 'manager'), 
  integrationController.syncAllOrders
);

// Sync orders from specific platform
router.post('/orders/sync/:platform', 
  authorize('admin', 'manager'), 
  integrationController.syncPlatformOrders
);

// Update external order status
router.post('/orders/:orderId/status', integrationController.updateExternalOrderStatus);

// Accept external order
router.post('/orders/:orderId/accept', integrationController.acceptExternalOrder);

// Reject external order
router.post('/orders/:orderId/reject', integrationController.rejectExternalOrder);

// Mark food ready
router.post('/orders/:orderId/ready', integrationController.markFoodReady);

// Get sync statistics
router.get('/orders/sync/stats', integrationController.getSyncStats);

// Retry failed syncs
router.post('/orders/sync/retry', 
  authorize('admin', 'manager'), 
  integrationController.retryFailedSyncs
);

// WEBHOOK ROUTES (No authentication for external services)

// Zomato webhook
router.post('/webhooks/zomato', integrationController.handleZomatoWebhook);

// Swiggy webhook
router.post('/webhooks/swiggy', integrationController.handleSwiggyWebhook);

// Paytm payment callback
router.post('/webhooks/paytm/callback', integrationController.handlePaytmCallback);

export { router as integrationRoutes };