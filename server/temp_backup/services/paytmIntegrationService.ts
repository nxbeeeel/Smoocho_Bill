import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';
import { 
  PaytmConfig, 
  PaytmPaymentRequest, 
  PaytmPaymentResponse, 
  IntegrationConfig,
  PaymentIntegrationRequest,
  PaymentIntegrationResponse
} from '../types';
import { integrationConfigService } from './integrationConfigService';

/**
 * Paytm Machine Integration Service
 * 
 * Handles Paytm payment gateway integration for:
 * - Card payment processing
 * - UPI payments
 * - Wallet payments
 * - Transaction status checking
 * - Refund processing
 */
export class PaytmIntegrationService {
  private apiClient: AxiosInstance;
  private config: IntegrationConfig | null = null;
  private paytmConfig: PaytmConfig | null = null;
  private readonly PAYTM_STAGING_URL = 'https://securegw-stage.paytm.in';
  private readonly PAYTM_PRODUCTION_URL = 'https://securegw.paytm.in';

  constructor() {
    this.initializeConfig();
    this.setupApiClient();
  }

  // Initialize configuration
  private async initializeConfig(): Promise<void> {
    this.config = integrationConfigService.getConfig('paytm');
    if (this.config && this.config.is_enabled) {
      this.setupPaytmConfig();
      this.setupApiClient();
    }
  }

  // Setup Paytm configuration
  private setupPaytmConfig(): void {
    if (!this.config?.api_credentials) {
      throw new Error('Paytm API credentials not configured');
    }

    this.paytmConfig = {
      merchant_id: this.config.api_credentials.merchant_id!,
      merchant_key: this.config.api_credentials.secret_key!,
      environment: this.config.settings?.environment || 'staging',
      callback_url: this.config.api_credentials.webhook_url || 'http://localhost:5000/api/integrations/paytm/callback',
      website: 'WEBSTAGING' // or 'DEFAULT' for production
    };
  }

  // Setup API client
  private setupApiClient(): void {
    const baseURL = this.paytmConfig?.environment === 'production' 
      ? this.PAYTM_PRODUCTION_URL 
      : this.PAYTM_STAGING_URL;

    this.apiClient = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.setupInterceptors();
  }

  // Setup axios interceptors
  private setupInterceptors(): void {
    // Request interceptor
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🟡 Paytm API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('🔴 Paytm API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`🟢 Paytm API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('🔴 Paytm API Response Error:', error.response?.status, error.response?.data);
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Handle API errors
  private handleApiError(error: any): void {
    const errorMessage = error.response?.data?.message || error.message;
    integrationConfigService.incrementErrorCount('paytm', errorMessage);
    
    // Disable integration if too many auth errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('🚨 Paytm authentication failed - disabling integration');
      integrationConfigService.disableIntegration('paytm');
    }
  }

  // Initialize payment transaction
  async initiatePayment(request: PaytmPaymentRequest): Promise<PaymentIntegrationResponse> {
    if (!this.isConfigured()) {
      throw new Error('Paytm integration not configured');
    }

    try {
      console.log(`💳 Initiating Paytm payment for order ${request.order_id}`);
      
      // Generate transaction token
      const txnToken = await this.generateTransactionToken(request);
      
      // Create payment response
      const response: PaymentIntegrationResponse = {
        success: true,
        transaction_id: txnToken.txnToken,
        status: 'pending',
        amount: request.amount,
        payment_method: request.payment_mode?.toLowerCase() || 'card',
        gateway_response: {
          txnToken: txnToken.txnToken,
          orderId: request.order_id,
          amount: request.amount,
          merchant_id: this.paytmConfig!.merchant_id,
          website: this.paytmConfig!.website,
          callbackUrl: this.paytmConfig!.callback_url
        }
      };

      console.log(`✅ Paytm payment initiated: ${txnToken.txnToken}`);
      return response;
      
    } catch (error) {
      console.error(`🔴 Failed to initiate Paytm payment:`, error);
      
      return {
        success: false,
        status: 'failed',
        error_message: error.message,
        gateway_response: error.response?.data
      };
    }
  }

  // Generate transaction token
  private async generateTransactionToken(request: PaytmPaymentRequest): Promise<any> {
    const requestData = {
      body: {
        requestType: 'Payment',
        mid: this.paytmConfig!.merchant_id,
        websiteName: this.paytmConfig!.website,
        orderId: request.order_id,
        txnAmount: {
          value: request.amount.toString(),
          currency: 'INR'
        },
        userInfo: {
          custId: request.customer_id || 'GUEST_USER',
          mobile: request.mobile_number,
          email: request.email
        },
        callbackUrl: this.paytmConfig!.callback_url,
        paymentMode: {
          mode: request.payment_mode || 'CARD',
          channels: this.getPaymentChannels(request.payment_mode)
        }
      }
    };

    // Generate checksum
    const checksum = this.generateChecksum(JSON.stringify(requestData.body));
    
    const response = await this.apiClient.post('/theia/api/v1/initiateTransaction', requestData, {
      headers: {
        'X-MID': this.paytmConfig!.merchant_id,
        'X-CHECKSUM': checksum
      }
    });

    if (response.data.body.resultInfo.resultStatus !== 'S') {
      throw new Error(`Transaction token generation failed: ${response.data.body.resultInfo.resultMsg}`);
    }

    return response.data.body;
  }

  // Get payment channels based on payment mode
  private getPaymentChannels(paymentMode?: string): string[] {
    switch (paymentMode) {
      case 'CARD':
        return ['CC', 'DC']; // Credit Card, Debit Card
      case 'UPI':
        return ['UPI'];
      case 'WALLET':
        return ['PPI'];
      default:
        return ['CC', 'DC', 'UPI', 'PPI']; // All methods
    }
  }

  // Process card payment (EMV integration)
  async processCardPayment(request: PaytmPaymentRequest): Promise<PaymentIntegrationResponse> {
    try {
      console.log(`💳 Processing card payment for order ${request.order_id}`);
      
      // For actual card machine integration, this would interface with
      // the Paytm EDC machine SDK or API
      
      // Simulate card machine interaction
      const cardResponse = await this.simulateCardMachineInteraction(request);
      
      if (cardResponse.status === 'SUCCESS') {
        // Verify payment with Paytm servers
        const verificationResponse = await this.verifyPayment(cardResponse.txn_id);
        
        return {
          success: true,
          transaction_id: cardResponse.txn_id,
          status: 'success',
          amount: request.amount,
          payment_method: 'card',
          gateway_response: verificationResponse
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error_message: cardResponse.response_message,
          gateway_response: cardResponse
        };
      }
      
    } catch (error) {
      console.error(`🔴 Card payment processing failed:`, error);
      
      return {
        success: false,
        status: 'failed',
        error_message: error.message
      };
    }
  }

  // Simulate card machine interaction (replace with actual SDK calls)
  private async simulateCardMachineInteraction(
    request: PaytmPaymentRequest
  ): Promise<PaytmPaymentResponse> {
    // In production, this would call actual Paytm EDC machine SDK methods
    // For example: paytmEDC.initiateCardPayment(amount, orderId)
    
    console.log('💳 Simulating card machine interaction...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate success response (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        txn_id: `TXN${Date.now()}`,
        order_id: request.order_id,
        amount: request.amount,
        status: 'SUCCESS',
        response_code: '01',
        response_message: 'Transaction successful',
        txn_date: new Date().toISOString(),
        gateway_name: 'PAYTM',
        bank_name: 'HDFC Bank',
        payment_mode: 'CARD'
      };
    } else {
      return {
        txn_id: `TXN${Date.now()}`,
        order_id: request.order_id,
        amount: request.amount,
        status: 'FAILURE',
        response_code: '02',
        response_message: 'Transaction declined by bank',
        txn_date: new Date().toISOString(),
        gateway_name: 'PAYTM',
        payment_mode: 'CARD'
      };
    }
  }

  // Verify payment with Paytm servers
  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const requestData = {
        body: {
          mid: this.paytmConfig!.merchant_id,
          orderId: transactionId
        }
      };

      const checksum = this.generateChecksum(JSON.stringify(requestData.body));
      
      const response = await this.apiClient.post('/merchant-status/api/v1/getPaymentStatus', requestData, {
        headers: {
          'X-MID': this.paytmConfig!.merchant_id,
          'X-CHECKSUM': checksum
        }
      });

      return response.data;
      
    } catch (error) {
      console.error(`🔴 Payment verification failed for ${transactionId}:`, error);
      throw error;
    }
  }

  // Process refund
  async processRefund(
    originalTransactionId: string, 
    refundAmount: number, 
    orderId: string
  ): Promise<PaymentIntegrationResponse> {
    try {
      console.log(`💰 Processing refund for transaction ${originalTransactionId}`);
      
      const refundId = `REF${Date.now()}`;
      
      const requestData = {
        body: {
          mid: this.paytmConfig!.merchant_id,
          txnType: 'REFUND',
          orderId: orderId,
          refId: refundId,
          txnId: originalTransactionId,
          refundAmount: refundAmount.toString()
        }
      };

      const checksum = this.generateChecksum(JSON.stringify(requestData.body));
      
      const response = await this.apiClient.post('/refund/apply', requestData, {
        headers: {
          'X-MID': this.paytmConfig!.merchant_id,
          'X-CHECKSUM': checksum
        }
      });

      const refundResponse = response.data.body;
      
      if (refundResponse.resultInfo.resultStatus === 'S') {
        console.log(`✅ Refund processed: ${refundId}`);
        
        return {
          success: true,
          transaction_id: refundId,
          status: 'success',
          amount: refundAmount,
          payment_method: 'refund',
          gateway_response: refundResponse
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error_message: refundResponse.resultInfo.resultMsg,
          gateway_response: refundResponse
        };
      }
      
    } catch (error) {
      console.error(`🔴 Refund processing failed:`, error);
      
      return {
        success: false,
        status: 'failed',
        error_message: error.message
      };
    }
  }

  // Handle payment callback/webhook
  async handlePaymentCallback(callbackData: any): Promise<PaymentIntegrationResponse> {
    try {
      console.log('📨 Received Paytm payment callback');
      
      // Verify checksum
      const isValidChecksum = this.verifyChecksum(callbackData);
      if (!isValidChecksum) {
        throw new Error('Invalid checksum in callback');
      }

      // Extract payment details
      const {
        ORDERID,
        TXNID,
        TXNAMOUNT,
        STATUS,
        RESPCODE,
        RESPMSG,
        PAYMENTMODE,
        BANKNAME,
        GATEWAYNAME
      } = callbackData;

      const response: PaymentIntegrationResponse = {
        success: STATUS === 'TXN_SUCCESS',
        transaction_id: TXNID,
        status: STATUS === 'TXN_SUCCESS' ? 'success' : 'failed',
        amount: parseFloat(TXNAMOUNT),
        payment_method: PAYMENTMODE?.toLowerCase() || 'card',
        gateway_response: {
          orderId: ORDERID,
          responseCode: RESPCODE,
          responseMessage: RESPMSG,
          bankName: BANKNAME,
          gatewayName: GATEWAYNAME
        }
      };

      if (!response.success) {
        response.error_message = RESPMSG;
      }

      console.log(`📋 Payment callback processed: ${ORDERID} - ${STATUS}`);
      return response;
      
    } catch (error) {
      console.error('🔴 Failed to handle Paytm callback:', error);
      
      return {
        success: false,
        status: 'failed',
        error_message: error.message
      };
    }
  }

  // Generate checksum for Paytm requests
  private generateChecksum(data: string): string {
    const key = this.paytmConfig!.merchant_key;
    return crypto.createHmac('sha256', key).update(data).digest('base64');
  }

  // Verify checksum from Paytm responses
  private verifyChecksum(responseData: any): boolean {
    const { CHECKSUMHASH, ...params } = responseData;
    
    // Sort parameters and create string
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    const expectedChecksum = this.generateChecksum(sortedParams);
    return expectedChecksum === CHECKSUMHASH;
  }

  // Check transaction status
  async checkTransactionStatus(orderId: string): Promise<PaymentIntegrationResponse> {
    try {
      const verificationResponse = await this.verifyPayment(orderId);
      const resultInfo = verificationResponse.body.resultInfo;
      
      if (resultInfo.resultStatus === 'S') {
        const txnInfo = verificationResponse.body;
        
        return {
          success: txnInfo.txnInfo.STATUS === 'TXN_SUCCESS',
          transaction_id: txnInfo.txnInfo.TXNID,
          status: txnInfo.txnInfo.STATUS === 'TXN_SUCCESS' ? 'success' : 'failed',
          amount: parseFloat(txnInfo.txnInfo.TXNAMOUNT),
          payment_method: txnInfo.txnInfo.PAYMENTMODE?.toLowerCase() || 'card',
          gateway_response: txnInfo.txnInfo
        };
      } else {
        return {
          success: false,
          status: 'failed',
          error_message: resultInfo.resultMsg
        };
      }
      
    } catch (error) {
      console.error(`🔴 Failed to check transaction status for ${orderId}:`, error);
      
      return {
        success: false,
        status: 'failed',
        error_message: error.message
      };
    }
  }

  // Get integration status
  getStatus(): any {
    return {
      platform: 'paytm',
      is_enabled: this.config?.is_enabled || false,
      is_configured: this.isConfigured(),
      environment: this.paytmConfig?.environment || 'staging',
      error_count: this.config?.error_count || 0,
      last_error: this.config?.last_error
    };
  }

  // Check if integration is properly configured
  private isConfigured(): boolean {
    return !!(this.config?.is_enabled && 
             this.paytmConfig?.merchant_id && 
             this.paytmConfig?.merchant_key);
  }

  // Enable integration
  async enable(): Promise<void> {
    await integrationConfigService.enableIntegration('paytm');
    await this.initializeConfig();
  }

  // Disable integration
  async disable(): Promise<void> {
    await integrationConfigService.disableIntegration('paytm');
    this.config = integrationConfigService.getConfig('paytm');
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      // Test with a mock transaction status check
      const testOrderId = `TEST_${Date.now()}`;
      await this.verifyPayment(testOrderId);
      
      console.log('✅ Paytm connection test successful');
      integrationConfigService.resetErrorCount('paytm');
      return true;
    } catch (error) {
      // Expected to fail for test order, but verifies API connectivity
      if (error.response?.status === 400 || error.response?.status === 404) {
        console.log('✅ Paytm connection test successful (API reachable)');
        return true;
      }
      
      console.error('❌ Paytm connection test failed:', error);
      return false;
    }
  }

  // Update configuration
  async updateConfiguration(updates: Partial<IntegrationConfig>): Promise<void> {
    await integrationConfigService.updateConfig('paytm', updates);
    await this.initializeConfig();
  }

  // Get supported payment methods
  getSupportedPaymentMethods(): string[] {
    return ['card', 'upi', 'wallet', 'netbanking'];
  }

  // Get payment method configuration
  getPaymentMethodConfig(method: string): any {
    const configs = {
      card: {
        channels: ['CC', 'DC'],
        supported_networks: ['VISA', 'MASTERCARD', 'RUPAY'],
        requires_cvv: true,
        requires_pin: true
      },
      upi: {
        channels: ['UPI'],
        supported_apps: ['PAYTM', 'GPAY', 'PHONEPE', 'BHIM'],
        qr_code_support: true
      },
      wallet: {
        channels: ['PPI'],
        supported_wallets: ['PAYTM', 'MOBIKWIK', 'FREECHARGE'],
        balance_check: true
      },
      netbanking: {
        channels: ['NB'],
        supported_banks: ['SBI', 'HDFC', 'ICICI', 'AXIS'],
        redirect_required: true
      }
    };

    return configs[method] || null;
  }
}

// Export singleton instance
export const paytmIntegrationService = new PaytmIntegrationService();