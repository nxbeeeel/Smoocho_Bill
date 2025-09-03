import { Request, Response } from 'express';
import { 
  integrationConfigService 
} from '../services/integrationConfigService';
import { orderSyncService } from '../services/orderSyncService';
import { paytmIntegrationService } from '../services/paytmIntegrationService';
import { zomatoIntegrationService } from '../services/zomatoIntegrationService';
import { swiggyIntegrationService } from '../services/swiggyIntegrationService';
import { 
  PaymentIntegrationRequest, 
  PaymentIntegrationResponse,
  IntegrationConfig 
} from '../types';

// Async error handler wrapper
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: Function) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * Integration Controller
 * 
 * Handles all integration-related API endpoints including:
 * - Integration configuration management
 * - Payment processing
 * - Order synchronization
 * - Webhook handling
 * - Status monitoring
 */
export const integrationController = {
  
  // Get all integration configurations
  getAllIntegrations: catchAsync(async (req: Request, res: Response) => {
    try {
      const integrations = integrationConfigService.getAllConfigs();
      
      res.json({
        success: true,
        data: integrations
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get specific integration configuration
  getIntegrationById: catchAsync(async (req: Request, res: Response) => {
    const { integrationId } = req.params;
    
    try {
      const integration = integrationConfigService.getConfig(integrationId);
      
      if (!integration) {
        return res.status(404).json({
          success: false,
          error: 'Integration not found'
        });
      }
      
      res.json({
        success: true,
        data: integration
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Update integration configuration
  updateIntegration: catchAsync(async (req: Request, res: Response) => {
    const { integrationId } = req.params;
    const updates = req.body;
    
    try {
      const updatedIntegration = await integrationConfigService.updateConfig(
        integrationId, 
        updates
      );
      
      res.json({
        success: true,
        data: updatedIntegration,
        message: 'Integration updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Enable integration
  enableIntegration: catchAsync(async (req: Request, res: Response) => {
    const { integrationId } = req.params;
    
    try {
      await integrationConfigService.enableIntegration(integrationId);
      
      res.json({
        success: true,
        message: `Integration ${integrationId} enabled successfully`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Disable integration
  disableIntegration: catchAsync(async (req: Request, res: Response) => {
    const { integrationId } = req.params;
    
    try {
      await integrationConfigService.disableIntegration(integrationId);
      
      res.json({
        success: true,
        message: `Integration ${integrationId} disabled successfully`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Update integration credentials
  updateCredentials: catchAsync(async (req: Request, res: Response) => {
    const { integrationId } = req.params;
    const { credentials } = req.body;
    
    try {
      await integrationConfigService.updateCredentials(integrationId, credentials);
      
      res.json({
        success: true,
        message: 'Credentials updated successfully'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Test integration connection
  testConnection: catchAsync(async (req: Request, res: Response) => {
    const { integrationId } = req.params;
    
    try {
      const isConnected = await integrationConfigService.testConnection(integrationId);
      
      res.json({
        success: true,
        data: {
          connected: isConnected,
          tested_at: new Date().toISOString()
        },
        message: isConnected ? 'Connection successful' : 'Connection failed'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get integration statistics
  getIntegrationStats: catchAsync(async (req: Request, res: Response) => {
    try {
      const stats = integrationConfigService.getIntegrationStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get integration health status
  getHealthStatus: catchAsync(async (req: Request, res: Response) => {
    try {
      const health = integrationConfigService.getHealthStatus();
      const orderSyncHealth = orderSyncService.getHealthStatus();
      
      res.json({
        success: true,
        data: {
          integrations: health,
          order_sync: orderSyncHealth,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // PAYMENT INTEGRATION ENDPOINTS

  // Process payment through integrated gateway
  processPayment: catchAsync(async (req: Request, res: Response) => {
    const paymentRequest: PaymentIntegrationRequest = req.body;
    
    try {
      let paymentResponse: PaymentIntegrationResponse;
      
      switch (paymentRequest.integration_type) {
        case 'paytm':
          paymentResponse = await paytmIntegrationService.initiatePayment({
            order_id: paymentRequest.order_id,
            amount: paymentRequest.amount,
            payment_mode: paymentRequest.payment_method.toUpperCase() as any,
            customer_id: paymentRequest.customer_details?.mobile,
            mobile_number: paymentRequest.customer_details?.mobile,
            email: paymentRequest.customer_details?.email,
            transaction_type: 'SALE'
          });
          break;
        default:
          throw new Error(`Unsupported payment integration: ${paymentRequest.integration_type}`);
      }
      
      res.json({
        success: paymentResponse.success,
        data: paymentResponse
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Process card payment
  processCardPayment: catchAsync(async (req: Request, res: Response) => {
    const paymentRequest = req.body;
    
    try {
      const paymentResponse = await paytmIntegrationService.processCardPayment({
        order_id: paymentRequest.order_id,
        amount: paymentRequest.amount,
        payment_mode: 'CARD',
        customer_id: paymentRequest.customer_details?.mobile,
        mobile_number: paymentRequest.customer_details?.mobile,
        email: paymentRequest.customer_details?.email,
        transaction_type: 'SALE'
      });
      
      res.json({
        success: paymentResponse.success,
        data: paymentResponse
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Check payment status
  checkPaymentStatus: catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { integration_type } = req.query;
    
    try {
      let statusResponse: PaymentIntegrationResponse;
      
      switch (integration_type) {
        case 'paytm':
          statusResponse = await paytmIntegrationService.checkTransactionStatus(orderId);
          break;
        default:
          throw new Error(`Unsupported payment integration: ${integration_type}`);
      }
      
      res.json({
        success: true,
        data: statusResponse
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Process refund
  processRefund: catchAsync(async (req: Request, res: Response) => {
    const { transactionId, amount, orderId, integration_type } = req.body;
    
    try {
      let refundResponse: PaymentIntegrationResponse;
      
      switch (integration_type) {
        case 'paytm':
          refundResponse = await paytmIntegrationService.processRefund(
            transactionId,
            amount,
            orderId
          );
          break;
        default:
          throw new Error(`Unsupported payment integration: ${integration_type}`);
      }
      
      res.json({
        success: refundResponse.success,
        data: refundResponse
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // ORDER SYNC ENDPOINTS

  // Sync orders from all platforms
  syncAllOrders: catchAsync(async (req: Request, res: Response) => {
    try {
      await orderSyncService.performFullSync();
      const stats = orderSyncService.getSyncStatistics();
      
      res.json({
        success: true,
        data: stats,
        message: 'Order sync completed'
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Sync orders from specific platform
  syncPlatformOrders: catchAsync(async (req: Request, res: Response) => {
    const { platform } = req.params;
    
    try {
      const orderCount = await orderSyncService.syncFromPlatform(platform as any);
      
      res.json({
        success: true,
        data: {
          platform,
          orders_synced: orderCount,
          synced_at: new Date().toISOString()
        },
        message: `${orderCount} orders synced from ${platform}`
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Update external order status
  updateExternalOrderStatus: catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status, platform } = req.body;
    
    try {
      const updated = await orderSyncService.updateExternalOrderStatus(
        orderId,
        status,
        platform
      );
      
      res.json({
        success: true,
        data: { updated },
        message: updated ? 'Order status updated on external platform' : 'No external mapping found'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Accept external order
  acceptExternalOrder: catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { prep_time } = req.body;
    
    try {
      const accepted = await orderSyncService.acceptExternalOrder(orderId, prep_time);
      
      res.json({
        success: true,
        data: { accepted },
        message: accepted ? 'Order accepted on external platform' : 'Failed to accept order'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Reject external order
  rejectExternalOrder: catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    try {
      const rejected = await orderSyncService.rejectExternalOrder(orderId, reason);
      
      res.json({
        success: true,
        data: { rejected },
        message: rejected ? 'Order rejected on external platform' : 'Failed to reject order'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Mark food ready
  markFoodReady: catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    
    try {
      const marked = await orderSyncService.markFoodReady(orderId);
      
      res.json({
        success: true,
        data: { marked },
        message: marked ? 'Food marked as ready on external platform' : 'Failed to mark food ready'
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Get sync statistics
  getSyncStats: catchAsync(async (req: Request, res: Response) => {
    try {
      const stats = orderSyncService.getSyncStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Retry failed syncs
  retryFailedSyncs: catchAsync(async (req: Request, res: Response) => {
    try {
      const retryCount = await orderSyncService.retryFailedSyncs();
      
      res.json({
        success: true,
        data: {
          retried_count: retryCount,
          retried_at: new Date().toISOString()
        },
        message: `${retryCount} failed syncs retried`
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }),

  // WEBHOOK ENDPOINTS

  // Handle Zomato webhook
  handleZomatoWebhook: catchAsync(async (req: Request, res: Response) => {
    try {
      await zomatoIntegrationService.handleWebhook(req.body);
      
      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error: any) {
      console.error('Zomato webhook error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Handle Swiggy webhook
  handleSwiggyWebhook: catchAsync(async (req: Request, res: Response) => {
    try {
      await swiggyIntegrationService.handleWebhook(req.body);
      
      res.json({
        success: true,
        message: 'Webhook processed successfully'
      });
    } catch (error: any) {
      console.error('Swiggy webhook error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }),

  // Handle Paytm payment callback
  handlePaytmCallback: catchAsync(async (req: Request, res: Response) => {
    try {
      const callbackResponse = await paytmIntegrationService.handlePaymentCallback(req.body);
      
      res.json({
        success: true,
        data: callbackResponse,
        message: 'Payment callback processed'
      });
    } catch (error: any) {
      console.error('Paytm callback error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  })
};