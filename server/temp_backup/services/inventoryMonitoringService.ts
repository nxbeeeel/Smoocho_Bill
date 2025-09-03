import { 
  InventoryItem, 
  InventoryAlert, 
  AlertConfiguration, 
  AlertInstance,
  AlertRecipient,
  StockTransaction 
} from '../types';
import { whatsappService } from './whatsappService';
import { emailService } from './emailService';

/**
 * Inventory Monitoring Service
 * 
 * Monitors inventory levels and triggers alerts with:
 * - Real-time stock level monitoring
 * - Configurable alert thresholds
 * - Multiple alert types (low, critical, out-of-stock)
 * - Smart notification scheduling
 * - Alert suppression and cooldown
 * - Historical tracking
 */
export class InventoryMonitoringService {
  private activeAlerts: Map<string, InventoryAlert> = new Map();
  private alertConfigurations: Map<string, AlertConfiguration> = new Map();
  private alertHistory: AlertInstance[] = [];
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;

  // Configuration
  private readonly CHECK_INTERVAL = 60000; // 1 minute
  private readonly ALERT_COOLDOWN = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_ALERTS_PER_ITEM_PER_DAY = 5;

  constructor() {
    this.loadAlertConfigurations();
    this.loadActiveAlerts();
  }

  // Load alert configurations from database
  private async loadAlertConfigurations(): Promise<void> {
    try {
      // In production, load from database
      // For now, using default configurations
      this.setDefaultAlertConfigurations();
    } catch (error) {
      console.error('Failed to load alert configurations:', error);
      this.setDefaultAlertConfigurations();
    }
  }

  // Set default alert configurations
  private setDefaultAlertConfigurations(): void {
    const defaultConfigs: AlertConfiguration[] = [
      {
        id: 'low_stock_default',
        alert_type: 'low_stock',
        is_enabled: true,
        threshold_value: 10,
        threshold_type: 'quantity',
        notification_channels: ['whatsapp', 'email'],
        recipients: [], // Would be loaded from database
        schedule: {
          frequency: 'immediate'
        },
        cooldown_minutes: 30,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'system'
      },
      {
        id: 'critical_stock_default',
        alert_type: 'critical_stock',
        is_enabled: true,
        threshold_value: 5,
        threshold_type: 'quantity',
        notification_channels: ['whatsapp', 'email'],
        recipients: [],
        schedule: {
          frequency: 'immediate'
        },
        cooldown_minutes: 15,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'system'
      }
    ];

    defaultConfigs.forEach(config => {
      this.alertConfigurations.set(config.id, config);
    });

    console.log('✅ Default alert configurations loaded');
  }

  // Load active alerts from database
  private async loadActiveAlerts(): Promise<void> {
    try {
      // In production, load from database
      // this.activeAlerts = await loadActiveAlertsFromDB();
      console.log('📥 Active alerts loaded');
    } catch (error) {
      console.error('Failed to load active alerts:', error);
    }
  }

  // Start monitoring inventory
  startMonitoring(): void {
    if (this.isMonitoring) {
      console.log('⚠️ Inventory monitoring already started');
      return;
    }

    this.isMonitoring = true;
    
    // Perform initial check
    this.performInventoryCheck();
    
    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.performInventoryCheck();
    }, this.CHECK_INTERVAL);

    console.log(`🚀 Inventory monitoring started (checking every ${this.CHECK_INTERVAL / 1000}s)`);
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('⏹️ Inventory monitoring stopped');
  }

  // Perform comprehensive inventory check
  private async performInventoryCheck(): Promise<void> {
    try {
      console.log('🔍 Performing inventory check...');
      
      // Get all inventory items (in production, from database)
      const inventoryItems = await this.getAllInventoryItems();
      
      let alertsTriggered = 0;
      
      for (const item of inventoryItems) {
        await this.checkInventoryItem(item);
        alertsTriggered++;
      }
      
      console.log(`✅ Inventory check completed. ${alertsTriggered} items checked.`);
      
    } catch (error) {
      console.error('❌ Failed to perform inventory check:', error);
    }
  }

  // Check individual inventory item
  private async checkInventoryItem(item: InventoryItem): Promise<void> {
    try {
      // Check different alert types
      await this.checkLowStockAlert(item);
      await this.checkCriticalStockAlert(item);
      await this.checkOutOfStockAlert(item);
      await this.checkExpiryAlerts(item);
      
    } catch (error) {
      console.error(`Failed to check inventory item ${item.id}:`, error);
    }
  }

  // Check for low stock alert
  private async checkLowStockAlert(item: InventoryItem): Promise<void> {
    const config = this.alertConfigurations.get('low_stock_default');
    if (!config || !config.is_enabled) return;

    const threshold = this.getThresholdValue(item, config);
    
    if (item.current_stock <= threshold && item.current_stock > 0) {
      await this.triggerAlert(item, 'low_stock', 'medium', threshold);
    } else {
      // Resolve existing low stock alert if stock is above threshold
      await this.resolveAlert(item.id, 'low_stock');
    }
  }

  // Check for critical stock alert
  private async checkCriticalStockAlert(item: InventoryItem): Promise<void> {
    const config = this.alertConfigurations.get('critical_stock_default');
    if (!config || !config.is_enabled) return;

    const threshold = this.getThresholdValue(item, config);
    
    if (item.current_stock <= threshold && item.current_stock > 0) {
      await this.triggerAlert(item, 'critical_stock', 'high', threshold);
    } else {
      await this.resolveAlert(item.id, 'critical_stock');
    }
  }

  // Check for out of stock alert
  private async checkOutOfStockAlert(item: InventoryItem): Promise<void> {
    if (item.current_stock <= 0) {
      await this.triggerAlert(item, 'out_of_stock', 'critical', 0);
    } else {
      await this.resolveAlert(item.id, 'out_of_stock');
    }
  }

  // Check for expiry alerts
  private async checkExpiryAlerts(item: InventoryItem): Promise<void> {
    if (!item.expiry_date) return;

    const expiryDate = new Date(item.expiry_date);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry <= 0) {
      await this.triggerAlert(item, 'expired', 'critical', daysUntilExpiry);
    } else if (daysUntilExpiry <= 7) {
      await this.triggerAlert(item, 'expiring_soon', 'medium', daysUntilExpiry);
    } else {
      await this.resolveAlert(item.id, 'expired');
      await this.resolveAlert(item.id, 'expiring_soon');
    }
  }

  // Get threshold value based on configuration
  private getThresholdValue(item: InventoryItem, config: AlertConfiguration): number {
    if (config.threshold_type === 'percentage') {
      return Math.ceil((item.minimum_stock * (config.threshold_value || 0)) / 100);
    }
    
    return config.threshold_value || item.minimum_stock;
  }

  // Trigger alert
  private async triggerAlert(
    item: InventoryItem,
    alertType: InventoryAlert['alert_type'],
    severity: InventoryAlert['severity'],
    thresholdValue: number
  ): Promise<void> {
    const alertKey = `${item.id}_${alertType}`;
    const existingAlert = this.activeAlerts.get(alertKey);

    // Check if alert already exists and is within cooldown
    if (existingAlert && this.isWithinCooldown(existingAlert)) {
      return;
    }

    // Check daily alert limit
    if (this.hasExceededDailyLimit(item.id, alertType)) {
      console.log(`⚠️ Daily alert limit exceeded for ${item.name} (${alertType})`);
      return;
    }

    // Create or update alert
    const alert: InventoryAlert = {
      id: alertKey,
      inventory_item_id: item.id,
      alert_type: alertType,
      threshold_value: thresholdValue,
      current_value: alertType.includes('expir') ? thresholdValue : item.current_stock,
      severity: severity,
      status: 'active',
      first_detected: existingAlert?.first_detected || new Date(),
      last_checked: new Date(),
      notification_sent: false,
      notification_count: existingAlert?.notification_count || 0,
      last_notification_sent: existingAlert?.last_notification_sent
    };

    this.activeAlerts.set(alertKey, alert);

    // Send notifications
    await this.sendAlertNotifications(item, alert);

    console.log(`🚨 ${alertType} alert triggered for ${item.name}`);
  }

  // Resolve alert
  private async resolveAlert(itemId: string, alertType: string): Promise<void> {
    const alertKey = `${itemId}_${alertType}`;
    const alert = this.activeAlerts.get(alertKey);

    if (alert && alert.status === 'active') {
      alert.status = 'resolved';
      alert.resolved_at = new Date();
      
      // Remove from active alerts
      this.activeAlerts.delete(alertKey);
      
      console.log(`✅ ${alertType} alert resolved for item ${itemId}`);
    }
  }

  // Check if alert is within cooldown period
  private isWithinCooldown(alert: InventoryAlert): boolean {
    if (!alert.last_notification_sent) return false;

    const cooldownMs = this.ALERT_COOLDOWN;
    const timeSinceLastNotification = Date.now() - new Date(alert.last_notification_sent).getTime();
    
    return timeSinceLastNotification < cooldownMs;
  }

  // Check if daily alert limit has been exceeded
  private hasExceededDailyLimit(itemId: string, alertType: string): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayAlerts = this.alertHistory.filter(alert => 
      alert.data?.inventory_item_id === itemId &&
      alert.alert_type === alertType &&
      new Date(alert.created_at) >= today
    );

    return todayAlerts.length >= this.MAX_ALERTS_PER_ITEM_PER_DAY;
  }

  // Send alert notifications
  private async sendAlertNotifications(item: InventoryItem, alert: InventoryAlert): Promise<void> {
    try {
      // Get relevant alert configuration
      const config = this.getAlertConfiguration(alert.alert_type);
      if (!config) return;

      // Get recipients
      const recipients = await this.getAlertRecipients(config);
      
      for (const recipient of recipients) {
        for (const channel of config.notification_channels) {
          await this.sendNotification(recipient, channel, item, alert);
        }
      }

      // Update alert notification status
      alert.notification_sent = true;
      alert.notification_count++;
      alert.last_notification_sent = new Date();

      // Create alert instance for history
      const alertInstance: AlertInstance = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        configuration_id: config.id,
        alert_type: alert.alert_type as any,
        severity: alert.severity as any,
        title: this.generateAlertTitle(item, alert),
        message: this.generateAlertMessage(item, alert),
        data: {
          inventory_item_id: item.id,
          item_name: item.name,
          current_stock: item.current_stock,
          threshold_value: alert.threshold_value,
          alert_type: alert.alert_type
        },
        status: 'sent',
        recipients: recipients.map(r => r.id),
        delivery_attempts: [],
        created_at: new Date(),
        sent_at: new Date()
      };

      this.alertHistory.push(alertInstance);

    } catch (error) {
      console.error('Failed to send alert notifications:', error);
    }
  }

  // Send individual notification
  private async sendNotification(
    recipient: AlertRecipient,
    channel: 'whatsapp' | 'email' | 'sms',
    item: InventoryItem,
    alert: InventoryAlert
  ): Promise<void> {
    try {
      switch (channel) {
        case 'whatsapp':
          if (recipient.contact_methods.whatsapp) {
            await this.sendWhatsAppAlert(recipient.contact_methods.whatsapp, item, alert);
          }
          break;
        case 'email':
          if (recipient.contact_methods.email) {
            await this.sendEmailAlert(recipient.contact_methods.email, item, alert);
          }
          break;
        case 'sms':
          // SMS implementation would go here
          console.log(`📱 SMS alert would be sent to ${recipient.contact_methods.sms}`);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${channel} notification to ${recipient.name}:`, error);
    }
  }

  // Send WhatsApp alert
  private async sendWhatsAppAlert(
    phoneNumber: string,
    item: InventoryItem,
    alert: InventoryAlert
  ): Promise<void> {
    const alertId = alert.id;

    switch (alert.alert_type) {
      case 'low_stock':
        await whatsappService.sendLowStockAlert(
          phoneNumber,
          item.name,
          item.current_stock,
          item.minimum_stock,
          alertId
        );
        break;
      case 'critical_stock':
      case 'out_of_stock':
        await whatsappService.sendCriticalStockAlert(
          phoneNumber,
          item.name,
          item.current_stock,
          alertId
        );
        break;
    }
  }

  // Send email alert
  private async sendEmailAlert(
    email: string,
    item: InventoryItem,
    alert: InventoryAlert
  ): Promise<void> {
    const alertId = alert.id;

    switch (alert.alert_type) {
      case 'low_stock':
        await emailService.sendLowStockAlert(
          email,
          item.name,
          item.current_stock,
          item.minimum_stock,
          alertId
        );
        break;
      case 'critical_stock':
      case 'out_of_stock':
        await emailService.sendCriticalStockAlert(
          email,
          item.name,
          item.current_stock,
          alertId
        );
        break;
    }
  }

  // Generate alert title
  private generateAlertTitle(item: InventoryItem, alert: InventoryAlert): string {
    switch (alert.alert_type) {
      case 'low_stock':
        return `Low Stock Alert - ${item.name}`;
      case 'critical_stock':
        return `Critical Stock Alert - ${item.name}`;
      case 'out_of_stock':
        return `Out of Stock - ${item.name}`;
      case 'expiring_soon':
        return `Item Expiring Soon - ${item.name}`;
      case 'expired':
        return `Item Expired - ${item.name}`;
      default:
        return `Inventory Alert - ${item.name}`;
    }
  }

  // Generate alert message
  private generateAlertMessage(item: InventoryItem, alert: InventoryAlert): string {
    switch (alert.alert_type) {
      case 'low_stock':
        return `${item.name} is running low. Current stock: ${item.current_stock}, Minimum required: ${item.minimum_stock}`;
      case 'critical_stock':
        return `${item.name} is critically low with only ${item.current_stock} units remaining`;
      case 'out_of_stock':
        return `${item.name} is out of stock and needs immediate restocking`;
      case 'expiring_soon':
        return `${item.name} will expire in ${alert.current_value} days`;
      case 'expired':
        return `${item.name} has expired and should be removed from inventory`;
      default:
        return `Inventory issue detected for ${item.name}`;
    }
  }

  // Get alert configuration
  private getAlertConfiguration(alertType: string): AlertConfiguration | null {
    for (const [key, config] of this.alertConfigurations) {
      if (config.alert_type === alertType) {
        return config;
      }
    }
    return null;
  }

  // Get alert recipients
  private async getAlertRecipients(config: AlertConfiguration): Promise<AlertRecipient[]> {
    // In production, load from database
    // For now, return default recipients
    return [
      {
        id: 'admin_1',
        name: 'Restaurant Manager',
        type: 'admin',
        contact_methods: {
          whatsapp: '+919876543210',
          email: 'manager@restaurant.com'
        },
        alert_types: ['low_stock', 'critical_stock', 'out_of_stock'],
        is_active: true,
        created_at: new Date()
      }
    ];
  }

  // Get all inventory items (placeholder)
  private async getAllInventoryItems(): Promise<InventoryItem[]> {
    // In production, this would query the database
    // For now, return sample data
    return [
      {
        id: 'inv_1',
        name: 'Coffee Beans',
        unit: 'kg',
        current_stock: 8,
        minimum_stock: 10,
        cost_per_unit: 500,
        supplier_name: 'Coffee Supplier',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'inv_2',
        name: 'Milk',
        unit: 'liters',
        current_stock: 2,
        minimum_stock: 5,
        cost_per_unit: 60,
        expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
  }

  // Manual inventory check
  async performManualCheck(): Promise<{
    itemsChecked: number;
    alertsTriggered: number;
    activeAlerts: number;
  }> {
    const beforeAlerts = this.activeAlerts.size;
    await this.performInventoryCheck();
    const afterAlerts = this.activeAlerts.size;
    
    const inventoryItems = await this.getAllInventoryItems();
    
    return {
      itemsChecked: inventoryItems.length,
      alertsTriggered: afterAlerts - beforeAlerts,
      activeAlerts: afterAlerts
    };
  }

  // Get active alerts
  getActiveAlerts(): InventoryAlert[] {
    return Array.from(this.activeAlerts.values());
  }

  // Get alerts for specific item
  getAlertsForItem(itemId: string): InventoryAlert[] {
    return Array.from(this.activeAlerts.values())
      .filter(alert => alert.inventory_item_id === itemId);
  }

  // Get alert statistics
  getAlertStatistics(): {
    totalActiveAlerts: number;
    alertsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
    recentAlerts: AlertInstance[];
  } {
    const activeAlerts = Array.from(this.activeAlerts.values());
    
    const alertsByType: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {};
    
    activeAlerts.forEach(alert => {
      alertsByType[alert.alert_type] = (alertsByType[alert.alert_type] || 0) + 1;
      alertsBySeverity[alert.severity] = (alertsBySeverity[alert.severity] || 0) + 1;
    });

    const recentAlerts = this.alertHistory
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    return {
      totalActiveAlerts: activeAlerts.length,
      alertsByType,
      alertsBySeverity,
      recentAlerts
    };
  }

  // Update alert configuration
  async updateAlertConfiguration(configId: string, updates: Partial<AlertConfiguration>): Promise<void> {
    const config = this.alertConfigurations.get(configId);
    if (config) {
      Object.assign(config, updates);
      config.updated_at = new Date();
      
      // Save to database in production
      console.log(`✅ Updated alert configuration: ${configId}`);
    }
  }

  // Add new alert configuration
  async addAlertConfiguration(config: AlertConfiguration): Promise<void> {
    this.alertConfigurations.set(config.id, config);
    console.log(`✅ Added new alert configuration: ${config.id}`);
  }

  // Remove alert configuration
  async removeAlertConfiguration(configId: string): Promise<void> {
    this.alertConfigurations.delete(configId);
    console.log(`🗑️ Removed alert configuration: ${configId}`);
  }

  // Get monitoring status
  getMonitoringStatus(): {
    isMonitoring: boolean;
    checkInterval: number;
    activeAlerts: number;
    alertConfigurations: number;
    lastCheck?: string;
  } {
    return {
      isMonitoring: this.isMonitoring,
      checkInterval: this.CHECK_INTERVAL,
      activeAlerts: this.activeAlerts.size,
      alertConfigurations: this.alertConfigurations.size,
      lastCheck: this.alertHistory.length > 0 
        ? this.alertHistory[this.alertHistory.length - 1].created_at.toISOString()
        : undefined
    };
  }

  // Cleanup and destroy
  destroy(): void {
    this.stopMonitoring();
    this.activeAlerts.clear();
    this.alertConfigurations.clear();
    this.alertHistory = [];
    console.log('🗑️ Inventory monitoring service destroyed');
  }
}

// Export singleton instance
export const inventoryMonitoringService = new InventoryMonitoringService();