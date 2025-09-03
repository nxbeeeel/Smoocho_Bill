import { PaytmPayment } from '../types';
import { config } from '../config';

declare global {
  interface Window {
    Paytm: any;
  }
}

export class PaytmService {
  private static instance: PaytmService;
  private isSDKLoaded = false;

  static getInstance(): PaytmService {
    if (!PaytmService.instance) {
      PaytmService.instance = new PaytmService();
    }
    return PaytmService.instance;
  }

  // Load Paytm SDK
  async loadSDK(): Promise<boolean> {
    if (this.isSDKLoaded) {
      return true;
    }

    return new Promise(resolve => {
      // Check if already loaded
      if (window.Paytm) {
        this.isSDKLoaded = true;
        resolve(true);
        return;
      }

      // Create script tag
      const script = document.createElement('script');
      script.src =
        config.payments.paytm.environment === 'production'
          ? 'https://securegw.paytm.in/merchantpgpui/checkoutjs/merchants/YOUR_MID.js'
          : 'https://securegw-stage.paytm.in/merchantpgpui/checkoutjs/merchants/YOUR_MID.js';

      script.onload = () => {
        this.isSDKLoaded = true;
        resolve(true);
      };

      script.onerror = () => {
        console.error('Failed to load Paytm SDK');
        resolve(false);
      };

      document.head.appendChild(script);
    });
  }

  // Initialize payment
  async initiatePayment(paymentData: PaytmPayment): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
  }> {
    try {
      // Load SDK if not loaded
      const sdkLoaded = await this.loadSDK();
      if (!sdkLoaded) {
        throw new Error('Failed to load Paytm SDK');
      }

      // Validate payment data
      this.validatePaymentData(paymentData);

      // Get transaction token from backend
      const tokenResponse = await this.getTransactionToken(paymentData);
      if (!tokenResponse.success) {
        throw new Error(
          tokenResponse.error || 'Failed to get transaction token'
        );
      }

      // Configure Paytm
      const config = {
        root: '',
        flow: 'DEFAULT',
        data: {
          orderId: paymentData.orderId,
          token: tokenResponse.token,
          tokenType: 'TXN_TOKEN',
          amount: paymentData.txnAmount,
        },
        merchant: {
          mid: import.meta.env.VITE_PAYTM_MID,
          redirect: false,
        },
        handler: {
          transactionStatus: (paymentStatus: any) => {
            return this.handlePaymentResponse(paymentStatus);
          },
          notifyMerchant: (eventName: string, data: any) => {
            console.log('Paytm Event:', eventName, data);
          },
        },
      };

      // Start payment process
      return new Promise(resolve => {
        if (window.Paytm && window.Paytm.CheckoutJS) {
          window.Paytm.CheckoutJS.init(config).then(() => {
            window.Paytm.CheckoutJS.invoke();
          });

          // Set up global handler for payment completion
          (window as any).paytmPaymentHandler = (result: any) => {
            resolve(this.processPaymentResult(result));
          };
        } else {
          resolve({
            success: false,
            error: 'Paytm SDK not available',
          });
        }
      });
    } catch (error) {
      console.error('Paytm payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  // Validate payment data
  private validatePaymentData(data: PaytmPayment): void {
    const required = ['orderId', 'txnAmount', 'custId'];

    for (const field of required) {
      if (!data[field as keyof PaytmPayment]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate amount
    const amount = parseFloat(data.txnAmount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid transaction amount');
    }

    // Validate phone number
    if (data.mobileNo && !/^[6-9]\d{9}$/.test(data.mobileNo)) {
      throw new Error('Invalid mobile number');
    }

    // Validate email
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new Error('Invalid email address');
    }
  }

  // Get transaction token from backend
  private async getTransactionToken(paymentData: PaytmPayment): Promise<{
    success: boolean;
    token?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/api/payments/paytm/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem(config.storage.tokenKey)}`,
          },
          body: JSON.stringify(paymentData),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get transaction token');
      }

      const data = await response.json();
      return {
        success: true,
        token: data.token,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token request failed',
      };
    }
  }

  // Handle payment response
  private handlePaymentResponse(paymentStatus: any): boolean {
    console.log('Payment Status:', paymentStatus);

    // Call global handler if set
    if ((window as any).paytmPaymentHandler) {
      (window as any).paytmPaymentHandler(paymentStatus);
    }

    return true;
  }

  // Process payment result
  private processPaymentResult(result: any): {
    success: boolean;
    transactionId?: string;
    error?: string;
  } {
    if (result.STATUS === 'TXN_SUCCESS') {
      return {
        success: true,
        transactionId: result.TXNID,
      };
    } else {
      return {
        success: false,
        error: result.RESPMSG || 'Payment failed',
      };
    }
  }

  // Verify payment status with backend
  async verifyPayment(
    orderId: string,
    transactionId: string
  ): Promise<{
    success: boolean;
    verified: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch(
        `${config.api.baseUrl}/api/payments/paytm/verify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem(config.storage.tokenKey)}`,
          },
          body: JSON.stringify({ orderId, transactionId }),
        }
      );

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return {
        success: true,
        verified: data.verified,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  // Check if Paytm is available
  isAvailable(): boolean {
    return this.isSDKLoaded && !!window.Paytm;
  }

  // Get payment methods supported
  getSupportedMethods(): string[] {
    return ['CREDIT_CARD', 'DEBIT_CARD', 'NET_BANKING', 'WALLET', 'UPI'];
  }
}

// Export singleton instance
export const paytmService = PaytmService.getInstance();
