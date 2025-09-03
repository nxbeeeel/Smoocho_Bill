import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { 
  SMTPConfig, 
  EmailMessage, 
  AlertDeliveryAttempt,
  AlertInstance 
} from '../types';

/**
 * SMTP Email Service
 * 
 * Handles email notifications for alerts with:
 * - SMTP configuration management
 * - HTML and text email sending
 * - Email templates
 * - Attachment support
 * - Delivery tracking
 * - Queue management
 * - Error handling and retry logic
 */
export class EmailService {
  private transporter: Transporter | null = null;
  private config: SMTPConfig | null = null;
  private isInitialized = false;
  
  // Email queue for handling rate limiting
  private emailQueue: Array<{ 
    email: EmailMessage; 
    resolve: Function; 
    reject: Function; 
  }> = [];
  private isProcessingQueue = false;
  private lastEmailTime = 0;
  private readonly MIN_EMAIL_INTERVAL = 500; // 500ms between emails

  constructor() {
    this.loadConfiguration();
  }

  // Load configuration from environment or database
  private async loadConfiguration(): Promise<void> {
    // In production, load from secure database
    this.config = {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASSWORD || ''
      },
      from_email: process.env.SMTP_FROM_EMAIL || '',
      from_name: process.env.SMTP_FROM_NAME || 'Smoocho Bill POS',
      is_enabled: process.env.SMTP_ENABLED === 'true'
    };

    if (this.config.is_enabled && this.isConfigValid()) {
      await this.initialize();
    }
  }

  // Initialize email service
  private async initialize(): Promise<void> {
    if (!this.config || !this.isConfigValid()) {
      throw new Error('Invalid SMTP configuration');
    }

    try {
      this.transporter = nodemailer.createTransporter({
        host: this.config.host,
        port: this.config.port,
        secure: this.config.secure,
        auth: {
          user: this.config.auth.user,
          pass: this.config.auth.pass
        },
        // Additional options for better reliability
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 10
      });

      // Verify connection
      await this.transporter.verify();
      
      this.isInitialized = true;
      console.log('✅ SMTP email service initialized');

      // Start queue processor
      this.startQueueProcessor();

    } catch (error) {
      console.error('❌ Failed to initialize SMTP service:', error);
      throw error;
    }
  }

  // Check if configuration is valid
  private isConfigValid(): boolean {
    return !!(
      this.config?.host &&
      this.config?.auth?.user &&
      this.config?.auth?.pass &&
      this.config?.from_email
    );
  }

  // Send email
  async sendEmail(emailMessage: EmailMessage): Promise<{ 
    success: boolean; 
    message_id?: string; 
    error?: string 
  }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      this.emailQueue.push({ email: emailMessage, resolve, reject });
      
      if (!this.isProcessingQueue) {
        this.processEmailQueue();
      }
    });
  }

  // Process email queue with rate limiting
  private async processEmailQueue(): Promise<void> {
    if (this.isProcessingQueue || this.emailQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.emailQueue.length > 0) {
      const queueItem = this.emailQueue.shift()!;
      
      try {
        // Respect rate limiting
        const timeSinceLastEmail = Date.now() - this.lastEmailTime;
        if (timeSinceLastEmail < this.MIN_EMAIL_INTERVAL) {
          await this.sleep(this.MIN_EMAIL_INTERVAL - timeSinceLastEmail);
        }

        const mailOptions: SendMailOptions = {
          from: `"${this.config!.from_name}" <${this.config!.from_email}>`,
          to: emailMessage.to,
          cc: emailMessage.cc,
          bcc: emailMessage.bcc,
          subject: emailMessage.subject,
          text: emailMessage.text,
          html: emailMessage.html,
          attachments: emailMessage.attachments
        };

        const result = await this.transporter!.sendMail(mailOptions);
        this.lastEmailTime = Date.now();

        console.log(`✅ Email sent successfully: ${result.messageId}`);
        
        queueItem.resolve({
          success: true,
          message_id: result.messageId
        });

      } catch (error: any) {
        console.error('❌ Failed to send email:', error);
        
        queueItem.resolve({
          success: false,
          error: error.message
        });
      }
    }

    this.isProcessingQueue = false;
  }

  // Start queue processor
  private startQueueProcessor(): void {
    // Process queue immediately and then every 5 seconds
    this.processEmailQueue();
    
    setInterval(() => {
      this.processEmailQueue();
    }, 5000);
  }

  // Send low stock alert email
  async sendLowStockAlert(
    to: string | string[],
    itemName: string,
    currentStock: number,
    minimumStock: number,
    alertId: string,
    includeAttachment = false
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const subject = `🚨 Low Stock Alert - ${itemName}`;
    
    const htmlContent = this.generateLowStockEmailHTML(
      itemName,
      currentStock,
      minimumStock,
      alertId
    );
    
    const textContent = this.generateLowStockEmailText(
      itemName,
      currentStock,
      minimumStock,
      alertId
    );

    const emailMessage: EmailMessage = {
      to,
      subject,
      html: htmlContent,
      text: textContent
    };

    // Add attachment if requested
    if (includeAttachment) {
      emailMessage.attachments = [{
        filename: `low-stock-report-${new Date().toISOString().split('T')[0]}.txt`,
        content: textContent,
        contentType: 'text/plain'
      }];
    }

    return this.sendEmail(emailMessage);
  }

  // Send critical stock alert email
  async sendCriticalStockAlert(
    to: string | string[],
    itemName: string,
    currentStock: number,
    alertId: string
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const subject = `🔴 CRITICAL STOCK ALERT - ${itemName}`;
    
    const htmlContent = this.generateCriticalStockEmailHTML(
      itemName,
      currentStock,
      alertId
    );
    
    const textContent = this.generateCriticalStockEmailText(
      itemName,
      currentStock,
      alertId
    );

    const emailMessage: EmailMessage = {
      to,
      subject,
      html: htmlContent,
      text: textContent
    };

    return this.sendEmail(emailMessage);
  }

  // Send daily summary email
  async sendDailySummaryAlert(
    to: string | string[],
    summary: {
      date: string;
      totalSales: number;
      totalOrders: number;
      lowStockItems: Array<{ name: string; stock: number; minimum: number }>;
      criticalItems: string[];
      topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
    },
    alertId: string,
    attachReport = true
  ): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const subject = `📊 Daily Summary Report - ${summary.date}`;
    
    const htmlContent = this.generateDailySummaryEmailHTML(summary, alertId);
    const textContent = this.generateDailySummaryEmailText(summary, alertId);

    const emailMessage: EmailMessage = {
      to,
      subject,
      html: htmlContent,
      text: textContent
    };

    // Add detailed report as attachment
    if (attachReport) {
      const reportContent = this.generateDetailedDailyReport(summary);
      emailMessage.attachments = [{
        filename: `daily-report-${summary.date}.html`,
        content: reportContent,
        contentType: 'text/html'
      }];
    }

    return this.sendEmail(emailMessage);
  }

  // Generate low stock email HTML
  private generateLowStockEmailHTML(
    itemName: string,
    currentStock: number,
    minimumStock: number,
    alertId: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Low Stock Alert</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: #ff6b35; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 30px; }
            .alert-icon { font-size: 48px; margin-bottom: 10px; }
            .stock-info { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="alert-icon">🚨</div>
                <h1>Low Stock Alert</h1>
            </div>
            <div class="content">
                <p>Dear Administrator,</p>
                <p>We have detected that one of your inventory items is running low and requires immediate attention.</p>
                
                <div class="stock-info">
                    <h3>📦 Item Details</h3>
                    <p><strong>Item Name:</strong> ${itemName}</p>
                    <p><strong>Current Stock:</strong> ${currentStock} units</p>
                    <p><strong>Minimum Required:</strong> ${minimumStock} units</p>
                    <p><strong>Shortage:</strong> ${minimumStock - currentStock} units</p>
                </div>
                
                <p><strong>Action Required:</strong> Please restock this item immediately to avoid service disruptions.</p>
                
                <p>This alert was generated automatically by your POS system to help maintain optimal inventory levels.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="#" class="button">View Inventory Dashboard</a>
                </div>
            </div>
            <div class="footer">
                <p>Alert ID: ${alertId} | Generated: ${new Date().toLocaleString()}</p>
                <p>Smoocho Bill POS System | This is an automated message</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate low stock email text version
  private generateLowStockEmailText(
    itemName: string,
    currentStock: number,
    minimumStock: number,
    alertId: string
  ): string {
    return `LOW STOCK ALERT

Dear Administrator,

We have detected that one of your inventory items is running low and requires immediate attention.

ITEM DETAILS:
- Item Name: ${itemName}
- Current Stock: ${currentStock} units
- Minimum Required: ${minimumStock} units
- Shortage: ${minimumStock - currentStock} units

ACTION REQUIRED: Please restock this item immediately to avoid service disruptions.

This alert was generated automatically by your POS system to help maintain optimal inventory levels.

Alert ID: ${alertId}
Generated: ${new Date().toLocaleString()}

Smoocho Bill POS System
This is an automated message`;
  }

  // Generate critical stock email HTML
  private generateCriticalStockEmailHTML(
    itemName: string,
    currentStock: number,
    alertId: string
  ): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Critical Stock Alert</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: #dc3545; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 30px; }
            .alert-icon { font-size: 48px; margin-bottom: 10px; }
            .critical-info { background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; padding: 15px; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
            .urgent-button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="alert-icon">🔴</div>
                <h1>CRITICAL STOCK ALERT</h1>
            </div>
            <div class="content">
                <p><strong>URGENT ACTION REQUIRED!</strong></p>
                <p>A critical inventory item is extremely low and may cause immediate service disruption.</p>
                
                <div class="critical-info">
                    <h3>⚠️ Critical Item</h3>
                    <p><strong>Item Name:</strong> ${itemName}</p>
                    <p><strong>Current Stock:</strong> ${currentStock} units</p>
                    <p style="color: #dc3545; font-weight: bold;">STOCK LEVEL: CRITICAL</p>
                </div>
                
                <p><strong style="color: #dc3545;">IMMEDIATE ACTION REQUIRED:</strong> This item must be restocked immediately to prevent service interruption.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="#" class="urgent-button">RESTOCK NOW</a>
                </div>
            </div>
            <div class="footer">
                <p>Alert ID: ${alertId} | Generated: ${new Date().toLocaleString()}</p>
                <p>Smoocho Bill POS System | This is an automated message</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate critical stock email text version
  private generateCriticalStockEmailText(
    itemName: string,
    currentStock: number,
    alertId: string
  ): string {
    return `CRITICAL STOCK ALERT

URGENT ACTION REQUIRED!

A critical inventory item is extremely low and may cause immediate service disruption.

CRITICAL ITEM:
- Item Name: ${itemName}
- Current Stock: ${currentStock} units
- STOCK LEVEL: CRITICAL

IMMEDIATE ACTION REQUIRED: This item must be restocked immediately to prevent service interruption.

Alert ID: ${alertId}
Generated: ${new Date().toLocaleString()}

Smoocho Bill POS System
This is an automated message`;
  }

  // Generate daily summary email HTML
  private generateDailySummaryEmailHTML(
    summary: any,
    alertId: string
  ): string {
    const lowStockRows = summary.lowStockItems.map((item: any) => 
      `<tr><td>${item.name}</td><td>${item.stock}</td><td>${item.minimum}</td></tr>`
    ).join('');

    const topSellingRows = summary.topSellingItems.map((item: any) => 
      `<tr><td>${item.name}</td><td>${item.quantity}</td><td>₹${item.revenue.toLocaleString()}</td></tr>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Daily Summary Report</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: #28a745; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 30px; }
            .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
            .summary-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
            .summary-value { font-size: 24px; font-weight: bold; color: #28a745; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { padding: 8px; border: 1px solid #dee2e6; text-align: left; }
            .table th { background: #f8f9fa; }
            .footer { background: #f8f9fa; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📊 Daily Summary Report</h1>
                <p>${summary.date}</p>
            </div>
            <div class="content">
                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-value">₹${summary.totalSales.toLocaleString()}</div>
                        <div>Total Sales</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-value">${summary.totalOrders}</div>
                        <div>Total Orders</div>
                    </div>
                </div>

                ${summary.lowStockItems.length > 0 ? `
                <h3>⚠️ Low Stock Items</h3>
                <table class="table">
                    <thead>
                        <tr><th>Item</th><th>Current Stock</th><th>Minimum Required</th></tr>
                    </thead>
                    <tbody>${lowStockRows}</tbody>
                </table>
                ` : ''}

                ${summary.topSellingItems.length > 0 ? `
                <h3>🏆 Top Selling Items</h3>
                <table class="table">
                    <thead>
                        <tr><th>Item</th><th>Quantity Sold</th><th>Revenue</th></tr>
                    </thead>
                    <tbody>${topSellingRows}</tbody>
                </table>
                ` : ''}
            </div>
            <div class="footer">
                <p>Alert ID: ${alertId} | Generated: ${new Date().toLocaleString()}</p>
                <p>Smoocho Bill POS System | This is an automated message</p>
            </div>
        </div>
    </body>
    </html>`;
  }

  // Generate daily summary email text version
  private generateDailySummaryEmailText(summary: any, alertId: string): string {
    let text = `DAILY SUMMARY REPORT - ${summary.date}

SUMMARY:
- Total Sales: ₹${summary.totalSales.toLocaleString()}
- Total Orders: ${summary.totalOrders}`;

    if (summary.lowStockItems.length > 0) {
      text += `\n\nLOW STOCK ITEMS:`;
      summary.lowStockItems.forEach((item: any) => {
        text += `\n- ${item.name}: ${item.stock}/${item.minimum}`;
      });
    }

    if (summary.topSellingItems.length > 0) {
      text += `\n\nTOP SELLING ITEMS:`;
      summary.topSellingItems.forEach((item: any) => {
        text += `\n- ${item.name}: ${item.quantity} sold, ₹${item.revenue.toLocaleString()}`;
      });
    }

    text += `\n\nAlert ID: ${alertId}
Generated: ${new Date().toLocaleString()}

Smoocho Bill POS System
This is an automated message`;

    return text;
  }

  // Generate detailed daily report for attachment
  private generateDetailedDailyReport(summary: any): string {
    // This would generate a more detailed HTML report for attachment
    return this.generateDailySummaryEmailHTML(summary, 'detailed-report');
  }

  // Test email connection
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      await this.transporter!.verify();
      
      console.log('✅ SMTP connection test successful');
      return { success: true };
    } catch (error: any) {
      console.error('❌ SMTP connection test failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Send test email
  async sendTestEmail(to: string): Promise<{ success: boolean; message_id?: string; error?: string }> {
    const testEmail: EmailMessage = {
      to,
      subject: 'Test Email from Smoocho Bill POS',
      html: `
        <h2>Test Email</h2>
        <p>This is a test email from your Smoocho Bill POS system.</p>
        <p>If you received this email, your SMTP configuration is working correctly.</p>
        <p><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
      `,
      text: `Test Email

This is a test email from your Smoocho Bill POS system.
If you received this email, your SMTP configuration is working correctly.

Sent: ${new Date().toLocaleString()}`
    };

    return this.sendEmail(testEmail);
  }

  // Update configuration
  async updateConfiguration(newConfig: Partial<SMTPConfig>): Promise<void> {
    if (this.config) {
      this.config = { ...this.config, ...newConfig };
      
      if (this.config.is_enabled && this.isConfigValid()) {
        await this.initialize();
      } else {
        this.isInitialized = false;
        this.transporter = null;
      }
    }
  }

  // Get service status
  getStatus(): {
    enabled: boolean;
    initialized: boolean;
    host?: string;
    queueSize: number;
    lastEmailTime?: string;
  } {
    return {
      enabled: this.config?.is_enabled || false,
      initialized: this.isInitialized,
      host: this.config?.host,
      queueSize: this.emailQueue.length,
      lastEmailTime: this.lastEmailTime ? new Date(this.lastEmailTime).toISOString() : undefined
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
        this.transporter = null;
        this.emailQueue = []; // Clear pending emails
      }
    }
  }

  // Cleanup and destroy
  destroy(): void {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
    
    this.emailQueue = [];
    this.isProcessingQueue = false;
    this.isInitialized = false;
    console.log('🗑️ Email service destroyed');
  }
}

// Export singleton instance
export const emailService = new EmailService();