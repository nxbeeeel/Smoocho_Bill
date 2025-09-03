export interface SystemSettings {
  id: string;
  business_name: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  tax_rate: number;
  currency: string;
  timezone: string;
  language: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  auto_backup: boolean;
  backup_frequency: 'daily' | 'weekly' | 'monthly';
  created_at: Date;
  updated_at: Date;
}

export interface NotificationSettings {
  id: string;
  low_stock_alerts: boolean;
  order_notifications: boolean;
  payment_notifications: boolean;
  system_alerts: boolean;
  email_frequency: 'immediate' | 'hourly' | 'daily';
  sms_frequency: 'immediate' | 'hourly' | 'daily';
  created_at: Date;
  updated_at: Date;
}

export interface POSSettings {
  id: string;
  receipt_header: string;
  receipt_footer: string;
  show_tax: boolean;
  show_cost: boolean;
  require_customer_info: boolean;
  allow_discounts: boolean;
  max_discount_percentage: number;
  auto_logout_minutes: number;
  created_at: Date;
  updated_at: Date;
}

export class SettingsService {
  private systemSettings!: SystemSettings;
  private notificationSettings!: NotificationSettings;
  private posSettings!: POSSettings;

  constructor() {
    this.initializeDefaultSettings();
  }

  private initializeDefaultSettings() {
    // Initialize system settings
    this.systemSettings = {
      id: 'system-1',
      business_name: 'Smoocho Bill',
      business_address: '123 Business Street, City, Country',
      business_phone: '+1234567890',
      business_email: 'info@smoochobill.com',
      tax_rate: 8.5,
      currency: 'USD',
      timezone: 'UTC',
      language: 'en',
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      auto_backup: true,
      backup_frequency: 'daily',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Initialize notification settings
    this.notificationSettings = {
      id: 'notif-1',
      low_stock_alerts: true,
      order_notifications: true,
      payment_notifications: true,
      system_alerts: true,
      email_frequency: 'immediate',
      sms_frequency: 'hourly',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Initialize POS settings
    this.posSettings = {
      id: 'pos-1',
      receipt_header: 'Smoocho Bill - Thank you for your order!',
      receipt_footer: 'Please visit again!',
      show_tax: true,
      show_cost: false,
      require_customer_info: false,
      allow_discounts: true,
      max_discount_percentage: 20,
      auto_logout_minutes: 30,
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  // Get all system settings
  async getSystemSettings(): Promise<SystemSettings> {
    return this.systemSettings;
  }

  // Update system settings
  async updateSystemSettings(updates: Partial<SystemSettings>): Promise<SystemSettings> {
    this.systemSettings = {
      ...this.systemSettings,
      ...updates,
      updated_at: new Date()
    };
    return this.systemSettings;
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    return this.notificationSettings;
  }

  // Update notification settings
  async updateNotificationSettings(updates: Partial<NotificationSettings>): Promise<NotificationSettings> {
    this.notificationSettings = {
      ...this.notificationSettings,
      ...updates,
      updated_at: new Date()
    };
    return this.notificationSettings;
  }

  // Get POS settings
  async getPOSSettings(): Promise<POSSettings> {
    return this.posSettings;
  }

  // Update POS settings
  async updatePOSSettings(updates: Partial<POSSettings>): Promise<POSSettings> {
    this.posSettings = {
      ...this.posSettings,
      ...updates,
      updated_at: new Date()
    };
    return this.posSettings;
  }

  // Get all settings
  async getAllSettings(): Promise<{
    system: SystemSettings;
    notifications: NotificationSettings;
    pos: POSSettings;
  }> {
    return {
      system: this.systemSettings,
      notifications: this.notificationSettings,
      pos: this.posSettings
    };
  }

  // Reset settings to default
  async resetToDefault(): Promise<{
    system: SystemSettings;
    notifications: NotificationSettings;
    pos: POSSettings;
  }> {
    this.initializeDefaultSettings();
    return this.getAllSettings();
  }

  // Export settings
  async exportSettings(): Promise<string> {
    const settings = await this.getAllSettings();
    return JSON.stringify(settings, null, 2);
  }

  // Import settings
  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const settings = JSON.parse(settingsJson);
      
      if (settings.system) {
        this.systemSettings = { ...this.systemSettings, ...settings.system, updated_at: new Date() };
      }
      
      if (settings.notifications) {
        this.notificationSettings = { ...this.notificationSettings, ...settings.notifications, updated_at: new Date() };
      }
      
      if (settings.pos) {
        this.posSettings = { ...this.posSettings, ...settings.pos, updated_at: new Date() };
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import settings:', error);
      return false;
    }
  }
}

export const settingsService = new SettingsService();
