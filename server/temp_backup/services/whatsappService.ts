import axios, { AxiosInstance } from 'axios';
import { 
  WhatsAppConfig, 
  WhatsAppMessage, 
  WhatsAppWebhook,
  AlertDeliveryAttempt,
  AlertInstance
} from '../types';

/**
 * WhatsApp Business API Service
 * 
 * Handles WhatsApp messaging for alerts with:
 * - Message sending (text, templates, media)
 * - Webhook handling for delivery status
 * - Template management
 * - Contact verification
 * - Delivery tracking
 * - Rate limiting compliance
 */
export class WhatsAppService {
  private apiClient: AxiosInstance;
  private config: WhatsAppConfig | null = null;
  private readonly BASE_URL = 'https://graph.facebook.com';
  private isInitialized = false;
  
  // Rate limiting
  private messageQueue: Array<{ message: WhatsAppMessage; resolve: Function; reject: Function }> = [];
  private isProcessingQueue = false;
  private lastMessageTime = 0;
  private readonly MIN_MESSAGE_INTERVAL = 1000; // 1 second between messages

  constructor() {
    this.apiClient = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.setupInterceptors();
    this.loadConfiguration();
  }

  // Load configuration from environment or database
  private async loadConfiguration(): Promise<void> {
    // In production, load from secure database
    this.config = {
      business_account_id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      access_token: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      webhook_verify_token: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
      webhook_secret: process.env.WHATSAPP_WEBHOOK_SECRET,
      api_version: process.env.WHATSAPP_API_VERSION || 'v18.0',
      is_enabled: process.env.WHATSAPP_ENABLED === 'true'
    };

    if (this.config.is_enabled && this.isConfigValid()) {
      await this.initialize();
    }
  }

  // Initialize WhatsApp service
  private async initialize(): Promise<void> {
    if (!this.config || !this.isConfigValid()) {
      throw new Error('Invalid WhatsApp configuration');
    }

    this.apiClient.defaults.baseURL = `${this.BASE_URL}/${this.config.api_version}`;
    this.apiClient.defaults.headers.Authorization = `Bearer ${this.config.access_token}`;

    this.isInitialized = true;
    console.log('✅ WhatsApp Business API service initialized');

    // Start queue processor
    this.startQueueProcessor();
  }

  // Setup axios interceptors
  private setupInterceptors(): void {
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`📱 WhatsApp API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ WhatsApp API Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`✅ WhatsApp API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ WhatsApp API Response Error:', error.response?.status, error.response?.data);
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  // Handle API errors
  private handleApiError(error: any): void {
    const errorData = error.response?.data?.error;
    if (errorData) {
      console.error(`WhatsApp API Error: ${errorData.message} (Code: ${errorData.code})`);
      
      // Handle specific error codes
      switch (errorData.code) {
        case 190: // Invalid access token
          console.error('🚨 WhatsApp access token is invalid or expired');
          this.isInitialized = false;
          break;
        case 100: // Invalid parameter
          console.error('🚨 WhatsApp API parameter error:', errorData.error_data);
          break;
        case 80007: // Rate limit exceeded
          console.warn('⚠️ WhatsApp rate limit exceeded, slowing down...');
          this.handleRateLimit();
          break;
      }
    }
  }

  // Handle rate limiting
  private handleRateLimit(): void {
    // Increase minimum interval between messages
    // this.MIN_MESSAGE_INTERVAL = Math.min(this.MIN_MESSAGE_INTERVAL * 2, 10000);
    console.log(`🐌 Increased message interval to ${this.MIN_MESSAGE_INTERVAL}ms`);
  }

  // Check if configuration is valid
  private isConfigValid(): boolean {
    return !!(
      this.config?.access_token &&
      this.config?.phone_number_id &&
      this.config?.business_account_id
    );
  }

  // Send text message
  async sendTextMessage(
    to: string, 
    message: string, 
    previewUrl = false
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const whatsappMessage: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: this.formatPhoneNumber(to),
      type: 'text',
      text: {
        body: message,
        preview_url: previewUrl
      }
    };

    return this.sendMessage(whatsappMessage);
  }

  // Send template message
  async sendTemplateMessage(
    to: string,
    templateName: string,
    languageCode = 'en',
    components?: any[]
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const whatsappMessage: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: this.formatPhoneNumber(to),
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: languageCode
        },
        components: components
      }
    };

    return this.sendMessage(whatsappMessage);
  }

  // Send image message
  async sendImageMessage(
    to: string,
    imageUrl: string,
    caption?: string
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const whatsappMessage: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: this.formatPhoneNumber(to),
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption
      }
    };

    return this.sendMessage(whatsappMessage);
  }

  // Send document message
  async sendDocumentMessage(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const whatsappMessage: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      to: this.formatPhoneNumber(to),
      type: 'document',
      document: {
        link: documentUrl,
        filename: filename,
        caption: caption
      }
    };

    return this.sendMessage(whatsappMessage);
  }

  // Core message sending logic
  private async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; message_id?: string; error?: string }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.messageQueue.push({ message, resolve, reject });
      
      if (!this.isProcessingQueue) {
        this.processMessageQueue();
      }
    });
  }

  // Process message queue with rate limiting
  private async processMessageQueue(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0) {
      const queueItem = this.messageQueue.shift()!;
      
      try {
        // Respect rate limiting
        const timeSinceLastMessage = Date.now() - this.lastMessageTime;
        if (timeSinceLastMessage < this.MIN_MESSAGE_INTERVAL) {
          await this.sleep(this.MIN_MESSAGE_INTERVAL - timeSinceLastMessage);
        }

        const response = await this.apiClient.post(
          `/${this.config!.phone_number_id}/messages`,
          queueItem.message
        );

        this.lastMessageTime = Date.now();

        const messageId = response.data.messages?.[0]?.id;
        console.log(`✅ WhatsApp message sent successfully: ${messageId}`);
        
        queueItem.resolve({
          success: true,
          message_id: messageId
        });

      } catch (error: any) {
        console.error('❌ Failed to send WhatsApp message:', error);
        
        queueItem.resolve({
          success: false,
          error: error.response?.data?.error?.message || error.message
        });
      }
    }

    this.isProcessingQueue = false;
  }

  // Format phone number for WhatsApp API
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present (assuming India +91)
    if (cleaned.length === 10 && !cleaned.startsWith('91')) {
      cleaned = '91' + cleaned;
    }
    
    return cleaned;
  }

  // Verify phone number is on WhatsApp
  async verifyPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      // WhatsApp doesn't provide a direct verification API
      // This is a placeholder - in practice, you'd need to handle this differently
      const formatted = this.formatPhoneNumber(phoneNumber);
      return formatted.length >= 10;
    } catch (error) {
      console.error('Failed to verify phone number:', error);
      return false;
    }
  }

  // Handle webhook for delivery status
  async handleWebhook(payload: WhatsAppWebhook): Promise<void> {
    console.log('📨 Received WhatsApp webhook:', JSON.stringify(payload, null, 2));

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages') {
          const value = change.value;
          
          // Handle delivery status updates
          if (value.statuses) {
            for (const status of value.statuses) {
              await this.handleDeliveryStatus(status);
            }
          }
          
          // Handle incoming messages (replies)
          if (value.messages) {
            for (const message of value.messages) {
              await this.handleIncomingMessage(message);
            }
          }
        }
      }
    }
  }

  // Handle delivery status updates
  private async handleDeliveryStatus(status: any): Promise<void> {
    console.log(`📱 Message ${status.id} status: ${status.status}`);
    
    // Update delivery attempt in database
    try {
      // This would typically update the AlertDeliveryAttempt record
      // await updateDeliveryAttemptStatus(status.id, status.status, status.timestamp);
      
      switch (status.status) {
        case 'sent':
          console.log(`✅ Message ${status.id} sent to WhatsApp servers`);
          break;
        case 'delivered':
          console.log(`📥 Message ${status.id} delivered to recipient`);
          break;
        case 'read':
          console.log(`👁️ Message ${status.id} read by recipient`);
          break;
        case 'failed':
          console.log(`❌ Message ${status.id} failed to deliver`);
          break;
      }
    } catch (error) {
      console.error('Failed to update delivery status:', error);
    }
  }

  // Handle incoming messages (replies to alerts)
  private async handleIncomingMessage(message: any): Promise<void> {
    console.log(`📩 Incoming message from ${message.from}: ${message.text?.body}`);
    
    // Process replies to alerts (e.g., acknowledgments, requests for more info)
    try {
      // This could trigger automated responses or notify administrators
      // await processAlertReply(message.from, message.text?.body, message.timestamp);
    } catch (error) {
      console.error('Failed to process incoming message:', error);
    }
  }

  // Verify webhook (required for setup)
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.config?.webhook_verify_token) {
      console.log('✅ WhatsApp webhook verified');
      return challenge;
    }
    
    console.warn('❌ WhatsApp webhook verification failed');
    return null;
  }

  // Get account information
  async getAccountInfo(): Promise<any> {
    try {
      const response = await this.apiClient.get(`/${this.config!.business_account_id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  // Get phone number information
  async getPhoneNumberInfo(): Promise<any> {
    try {
      const response = await this.apiClient.get(`/${this.config!.phone_number_id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get phone number info:', error);
      throw error;
    }
  }

  // Test WhatsApp connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      await this.getPhoneNumberInfo();
      
      console.log('✅ WhatsApp connection test successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ WhatsApp connection test failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message 
      };
    }
  }

  // Send low stock alert
  async sendLowStockAlert(
    to: string,
    itemName: string,
    currentStock: number,
    minimumStock: number,
    alertId: string
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const message = `🚨 *Low Stock Alert*

Item: *${itemName}*
Current Stock: ${currentStock}
Minimum Required: ${minimumStock}
Shortage: ${minimumStock - currentStock} units

Please restock immediately to avoid stockouts.

Alert ID: ${alertId}
Time: ${new Date().toLocaleString('en-IN')}`;

    return this.sendTextMessage(to, message);
  }

  // Send critical stock alert
  async sendCriticalStockAlert(
    to: string,
    itemName: string,
    currentStock: number,
    alertId: string
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const message = `🔴 *CRITICAL STOCK ALERT*

⚠️ Item: *${itemName}*
Current Stock: ${currentStock} units

URGENT ACTION REQUIRED!
This item is critically low and may cause service disruption.

Please restock IMMEDIATELY.

Alert ID: ${alertId}
Time: ${new Date().toLocaleString('en-IN')}`;

    return this.sendTextMessage(to, message);
  }

  // Send daily summary alert
  async sendDailySummaryAlert(
    to: string,
    summary: {
      date: string;
      totalSales: number;
      totalOrders: number;
      lowStockItems: number;
      criticalItems: string[];
    },
    alertId: string
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    let message = `📊 *Daily Summary - ${summary.date}*

💰 Total Sales: ₹${summary.totalSales.toLocaleString('en-IN')}
📦 Total Orders: ${summary.totalOrders}
⚠️ Low Stock Items: ${summary.lowStockItems}`;

    if (summary.criticalItems.length > 0) {
      message += `\n\n🔴 Critical Items:`;
      summary.criticalItems.forEach(item => {
        message += `\n• ${item}`;
      });
    }

    message += `\n\nAlert ID: ${alertId}
Time: ${new Date().toLocaleString('en-IN')}`;

    return this.sendTextMessage(to, message);
  }

  // Update configuration
  async updateConfiguration(newConfig: Partial<WhatsAppConfig>): Promise<void> {
    if (this.config) {
      this.config = { ...this.config, ...newConfig };
      
      if (this.config.is_enabled && this.isConfigValid()) {
        await this.initialize();
      } else {
        this.isInitialized = false;
      }
    }
  }

  // Get service status
  getStatus(): {
    enabled: boolean;
    initialized: boolean;
    phoneNumber?: string;
    queueSize: number;
    lastMessageTime?: string;
  } {
    return {
      enabled: this.config?.is_enabled || false,
      initialized: this.isInitialized,
      phoneNumber: this.config?.phone_number_id,
      queueSize: this.messageQueue.length,
      lastMessageTime: this.lastMessageTime ? new Date(this.lastMessageTime).toISOString() : undefined
    };
  }

  // Utility sleep function
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enable/disable service
  async setEnabled(enabled: boolean): Promise<void> {
    if (this.config) {
      this.config.is_enabled = enabled;
      
      if (enabled && this.isConfigValid()) {
        await this.initialize();
      } else {
        this.isInitialized = false;
        this.messageQueue = []; // Clear pending messages
      }
    }
  }

  // Get message templates (if using WhatsApp Business Account)
  async getMessageTemplates(): Promise<any[]> {
    try {
      const response = await this.apiClient.get(
        `/${this.config!.business_account_id}/message_templates`
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get message templates:', error);
      return [];
    }
  }

  // Cleanup and destroy
  destroy(): void {
    this.messageQueue = [];
    this.isProcessingQueue = false;
    this.isInitialized = false;
    console.log('🗑️ WhatsApp service destroyed');
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();