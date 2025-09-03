import { IntegrationConfig, IntegrationSyncLog } from '../types';

/**
 * Integration Configuration Service
 * 
 * Manages integration settings, credentials, and enable/disable functionality
 * for all platform integrations (Zomato, Swiggy, Paytm)
 */
export class IntegrationConfigService {
  private configs: Map<string, IntegrationConfig> = new Map();
  private readonly STORAGE_KEY = 'integration_configs';

  constructor() {
    this.loadConfigurations();
    this.initializeDefaultConfigs();
  }

  // Load configurations from storage/database
  private loadConfigurations(): void {
    try {
      // In production, this would load from database
      // For now, using localStorage as a placeholder
      const stored = process.env.INTEGRATION_CONFIGS;
      if (stored) {
        const configs = JSON.parse(stored);
        configs.forEach((config: IntegrationConfig) => {
          this.configs.set(config.id, config);
        });
      }
    } catch (error) {
      console.error('Failed to load integration configurations:', error);
    }
  }

  // Initialize default configurations for all integrations
  private initializeDefaultConfigs(): void {
    const defaultConfigs: Partial<IntegrationConfig>[] = [
      {
        id: 'zomato',
        name: 'Zomato',
        type: 'order_platform',
        is_enabled: false,
        settings: {
          auto_accept_orders: true,
          sync_frequency: 2, // minutes
          max_prep_time: 30, // minutes
          webhook_retry_attempts: 3
        },
        sync_frequency: 2,
        error_count: 0
      },
      {
        id: 'swiggy',
        name: 'Swiggy',
        type: 'order_platform',
        is_enabled: false,
        settings: {
          auto_accept_orders: true,
          sync_frequency: 2, // minutes
          max_prep_time: 30, // minutes
          webhook_retry_attempts: 3
        },
        sync_frequency: 2,
        error_count: 0
      },
      {
        id: 'paytm',
        name: 'Paytm Payment Gateway',
        type: 'payment',
        is_enabled: false,
        settings: {
          auto_capture: true,
          timeout: 300, // seconds
          retry_attempts: 3,
          environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging'
        },
        sync_frequency: 0, // not applicable for payment gateway
        error_count: 0
      }
    ];

    defaultConfigs.forEach(configData => {
      if (!this.configs.has(configData.id!)) {
        const config: IntegrationConfig = {
          ...configData,
          created_at: new Date(),
          updated_at: new Date()
        } as IntegrationConfig;
        
        this.configs.set(config.id, config);
      }
    });
  }

  // Get all integration configurations
  getAllConfigs(): IntegrationConfig[] {
    return Array.from(this.configs.values());
  }

  // Get specific integration configuration
  getConfig(integrationId: string): IntegrationConfig | null {
    return this.configs.get(integrationId) || null;
  }

  // Get enabled integrations only
  getEnabledConfigs(): IntegrationConfig[] {
    return Array.from(this.configs.values()).filter(config => config.is_enabled);
  }

  // Get configurations by type
  getConfigsByType(type: 'payment' | 'order_platform' | 'delivery'): IntegrationConfig[] {
    return Array.from(this.configs.values()).filter(config => config.type === type);
  }

  // Enable integration
  async enableIntegration(integrationId: string): Promise<boolean> {
    const config = this.configs.get(integrationId);
    if (!config) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Validate configuration before enabling
    const isValid = await this.validateConfig(config);
    if (!isValid) {
      throw new Error(`Invalid configuration for ${integrationId}`);
    }

    config.is_enabled = true;
    config.updated_at = new Date();
    
    await this.saveConfig(config);
    
    console.log(`✅ Integration ${integrationId} enabled`);
    return true;
  }

  // Disable integration
  async disableIntegration(integrationId: string): Promise<boolean> {
    const config = this.configs.get(integrationId);
    if (!config) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    config.is_enabled = false;
    config.updated_at = new Date();
    
    await this.saveConfig(config);
    
    console.log(`❌ Integration ${integrationId} disabled`);
    return true;
  }

  // Update integration configuration
  async updateConfig(
    integrationId: string, 
    updates: Partial<IntegrationConfig>
  ): Promise<IntegrationConfig> {
    const config = this.configs.get(integrationId);
    if (!config) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Merge updates
    const updatedConfig: IntegrationConfig = {
      ...config,
      ...updates,
      id: integrationId, // Ensure ID doesn't change
      updated_at: new Date()
    };

    // Validate updated configuration
    const isValid = await this.validateConfig(updatedConfig);
    if (!isValid) {
      throw new Error(`Invalid configuration update for ${integrationId}`);
    }

    this.configs.set(integrationId, updatedConfig);
    await this.saveConfig(updatedConfig);
    
    console.log(`🔄 Integration ${integrationId} configuration updated`);
    return updatedConfig;
  }

  // Update API credentials
  async updateCredentials(
    integrationId: string, 
    credentials: IntegrationConfig['api_credentials']
  ): Promise<boolean> {
    const config = this.configs.get(integrationId);
    if (!config) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Encrypt sensitive data before storing (in production)
    config.api_credentials = credentials;
    config.updated_at = new Date();
    
    await this.saveConfig(config);
    
    console.log(`🔑 Credentials updated for ${integrationId}`);
    return true;
  }

  // Validate integration configuration
  private async validateConfig(config: IntegrationConfig): Promise<boolean> {
    try {
      switch (config.id) {
        case 'zomato':
          return this.validateZomatoConfig(config);
        case 'swiggy':
          return this.validateSwiggyConfig(config);
        case 'paytm':
          return this.validatePaytmConfig(config);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Configuration validation failed for ${config.id}:`, error);
      return false;
    }
  }

  // Validate Zomato configuration
  private validateZomatoConfig(config: IntegrationConfig): boolean {
    const credentials = config.api_credentials;
    if (!credentials) return false;
    
    return !!(credentials.api_key && credentials.partner_id && credentials.webhook_url);
  }

  // Validate Swiggy configuration
  private validateSwiggyConfig(config: IntegrationConfig): boolean {
    const credentials = config.api_credentials;
    if (!credentials) return false;
    
    return !!(credentials.api_key && credentials.partner_id && credentials.webhook_url);
  }

  // Validate Paytm configuration
  private validatePaytmConfig(config: IntegrationConfig): boolean {
    const credentials = config.api_credentials;
    if (!credentials) return false;
    
    return !!(credentials.merchant_id && credentials.secret_key);
  }

  // Test integration connectivity
  async testConnection(integrationId: string): Promise<boolean> {
    const config = this.configs.get(integrationId);
    if (!config || !config.is_enabled) {
      return false;
    }

    try {
      switch (integrationId) {
        case 'zomato':
          return await this.testZomatoConnection(config);
        case 'swiggy':
          return await this.testSwiggyConnection(config);
        case 'paytm':
          return await this.testPaytmConnection(config);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Connection test failed for ${integrationId}:`, error);
      this.incrementErrorCount(integrationId, error.message);
      return false;
    }
  }

  // Test Zomato connection
  private async testZomatoConnection(config: IntegrationConfig): Promise<boolean> {
    // Mock API call to Zomato
    // In production, this would make actual API call
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  // Test Swiggy connection
  private async testSwiggyConnection(config: IntegrationConfig): Promise<boolean> {
    // Mock API call to Swiggy
    // In production, this would make actual API call
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  // Test Paytm connection
  private async testPaytmConnection(config: IntegrationConfig): Promise<boolean> {
    // Mock API call to Paytm
    // In production, this would make actual API call
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 1000);
    });
  }

  // Increment error count for integration
  incrementErrorCount(integrationId: string, errorMessage?: string): void {
    const config = this.configs.get(integrationId);
    if (config) {
      config.error_count = (config.error_count || 0) + 1;
      config.last_error = errorMessage;
      config.updated_at = new Date();
      
      // Auto-disable if too many errors
      if (config.error_count >= 10) {
        config.is_enabled = false;
        console.warn(`🚨 Integration ${integrationId} auto-disabled due to errors`);
      }
      
      this.saveConfig(config);
    }
  }

  // Reset error count
  resetErrorCount(integrationId: string): void {
    const config = this.configs.get(integrationId);
    if (config) {
      config.error_count = 0;
      config.last_error = undefined;
      config.updated_at = new Date();
      this.saveConfig(config);
    }
  }

  // Update last sync time
  updateLastSync(integrationId: string): void {
    const config = this.configs.get(integrationId);
    if (config) {
      config.last_sync = new Date();
      config.updated_at = new Date();
      this.saveConfig(config);
    }
  }

  // Save configuration (to database in production)
  private async saveConfig(config: IntegrationConfig): Promise<void> {
    try {
      // In production, this would save to database
      // For now, just update the in-memory map
      this.configs.set(config.id, config);
      
      // Also update environment/storage
      console.log(`💾 Configuration saved for ${config.id}`);
    } catch (error) {
      console.error(`Failed to save configuration for ${config.id}:`, error);
      throw error;
    }
  }

  // Get integration statistics
  getIntegrationStats(): Record<string, any> {
    const stats = {
      total_integrations: this.configs.size,
      enabled_integrations: 0,
      disabled_integrations: 0,
      integrations_with_errors: 0,
      by_type: {
        payment: 0,
        order_platform: 0,
        delivery: 0
      }
    };

    this.configs.forEach(config => {
      if (config.is_enabled) {
        stats.enabled_integrations++;
      } else {
        stats.disabled_integrations++;
      }
      
      if ((config.error_count || 0) > 0) {
        stats.integrations_with_errors++;
      }
      
      stats.by_type[config.type]++;
    });

    return stats;
  }

  // Check if integration is enabled and connected
  isIntegrationReady(integrationId: string): boolean {
    const config = this.configs.get(integrationId);
    if (!config) return false;
    
    return config.is_enabled && 
           this.validateConfig(config) && 
           (config.error_count || 0) < 5;
  }

  // Get integration health status
  getHealthStatus(): Record<string, any> {
    const health: Record<string, any> = {};
    
    this.configs.forEach(config => {
      health[config.id] = {
        enabled: config.is_enabled,
        configured: this.validateConfig(config),
        last_sync: config.last_sync,
        error_count: config.error_count || 0,
        last_error: config.last_error,
        status: this.isIntegrationReady(config.id) ? 'healthy' : 'unhealthy'
      };
    });
    
    return health;
  }
}

// Export singleton instance
export const integrationConfigService = new IntegrationConfigService();