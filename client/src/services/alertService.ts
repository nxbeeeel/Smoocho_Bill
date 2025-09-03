import { InventoryItem } from '../types';
import { inventoryService } from './inventoryService';
import { useNotificationStore } from '../store/notificationStore';

export interface AlertSettings {
  lowStockEnabled: boolean;
  lowStockThresholdType: 'absolute' | 'percentage';
  lowStockThreshold: number;
  expiryAlertEnabled: boolean;
  expiryAlertDays: number;
  outOfStockEnabled: boolean;
  autoCheckInterval: number; // minutes
}

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring' | 'expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  item: InventoryItem;
  message: string;
  actionRequired: string;
  timestamp: string;
  acknowledged: boolean;
}

export class AlertService {
  private checkInterval: NodeJS.Timeout | null = null;
  private settings: AlertSettings = {
    lowStockEnabled: true,
    lowStockThresholdType: 'absolute',
    lowStockThreshold: 5,
    expiryAlertEnabled: true,
    expiryAlertDays: 7,
    outOfStockEnabled: true,
    autoCheckInterval: 30, // 30 minutes
  };

  private acknowledgedAlerts = new Set<string>();

  constructor() {
    this.loadSettings();
    this.startAutoCheck();
  }

  // Load alert settings from localStorage
  private loadSettings() {
    const savedSettings = localStorage.getItem('alert_settings');
    if (savedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error('Failed to load alert settings:', error);
      }
    }
  }

  // Save alert settings to localStorage
  private saveSettings() {
    localStorage.setItem('alert_settings', JSON.stringify(this.settings));
  }

  // Update alert settings
  updateSettings(newSettings: Partial<AlertSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();

    // Restart auto-check with new interval
    if (newSettings.autoCheckInterval !== undefined) {
      this.startAutoCheck();
    }
  }

  // Get current alert settings
  getSettings(): AlertSettings {
    return { ...this.settings };
  }

  // Start automatic alert checking
  startAutoCheck() {
    this.stopAutoCheck();

    if (this.settings.autoCheckInterval > 0) {
      this.checkInterval = setInterval(
        () => {
          this.performAlertCheck();
        },
        this.settings.autoCheckInterval * 60 * 1000
      );
    }
  }

  // Stop automatic alert checking
  stopAutoCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Perform comprehensive alert check
  async performAlertCheck(): Promise<StockAlert[]> {
    const alerts: StockAlert[] = [];

    try {
      const inventoryItems = await inventoryService.getAllItems({
        isActive: true,
      });

      for (const item of inventoryItems) {
        // Check for out of stock
        if (this.settings.outOfStockEnabled && this.isOutOfStock(item)) {
          alerts.push(this.createAlert('out_of_stock', 'critical', item));
        }
        // Check for low stock (only if not out of stock)
        else if (this.settings.lowStockEnabled && this.isLowStock(item)) {
          alerts.push(this.createAlert('low_stock', 'high', item));
        }

        // Check for expiry alerts
        if (this.settings.expiryAlertEnabled && item.expiry_date) {
          const expiryAlert = this.checkExpiryAlert(item);
          if (expiryAlert) {
            alerts.push(expiryAlert);
          }
        }
      }

      // Show notifications for new alerts
      this.showNewAlertNotifications(alerts);

      return alerts;
    } catch (error) {
      console.error('Failed to perform alert check:', error);
      return [];
    }
  }

  // Check if item is out of stock
  private isOutOfStock(item: InventoryItem): boolean {
    return (item.current_stock || 0) <= 0;
  }

  // Check if item is low on stock
  private isLowStock(item: InventoryItem): boolean {
    const currentStock = item.current_stock || 0;
    const minimumStock = item.minimum_stock || 0;

    if (this.settings.lowStockThresholdType === 'percentage') {
      // Calculate percentage of minimum stock
      const threshold = minimumStock * (this.settings.lowStockThreshold / 100);
      return currentStock <= threshold;
    } else {
      // Absolute threshold
      return (
        currentStock <= Math.max(minimumStock, this.settings.lowStockThreshold)
      );
    }
  }

  // Check expiry alerts for an item
  private checkExpiryAlert(item: InventoryItem): StockAlert | null {
    if (!item.expiry_date) return null;

    const expiryDate = new Date(item.expiry_date);
    const now = new Date();
    const alertDate = new Date();
    alertDate.setDate(now.getDate() + this.settings.expiryAlertDays);

    // Check if already expired
    if (expiryDate < now) {
      return this.createAlert('expired', 'critical', item);
    }

    // Check if expiring soon
    if (expiryDate <= alertDate) {
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return this.createAlert(
        'expiring',
        daysUntilExpiry <= 1 ? 'high' : 'medium',
        item
      );
    }

    return null;
  }

  // Create alert object
  private createAlert(
    type: StockAlert['type'],
    severity: StockAlert['severity'],
    item: InventoryItem
  ): StockAlert {
    const alertId = `${type}_${item.id}_${Date.now()}`;

    let message = '';
    let actionRequired = '';

    switch (type) {
      case 'out_of_stock':
        message = `${item.name} is out of stock`;
        actionRequired = 'Restock immediately';
        break;
      case 'low_stock':
        message = `${item.name} is running low (${item.current_stock} ${item.unit} remaining)`;
        actionRequired = 'Consider restocking soon';
        break;
      case 'expiring':
        const daysUntilExpiry = Math.ceil(
          (new Date(item.expiry_date!).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        );
        message = `${item.name} expires in ${daysUntilExpiry} day(s)`;
        actionRequired = 'Use before expiry or remove from inventory';
        break;
      case 'expired':
        message = `${item.name} has expired`;
        actionRequired = 'Remove from inventory immediately';
        break;
    }

    return {
      id: alertId,
      type,
      severity,
      item,
      message,
      actionRequired,
      timestamp: new Date().toISOString(),
      acknowledged: this.acknowledgedAlerts.has(alertId),
    };
  }

  // Show notifications for new alerts
  private showNewAlertNotifications(alerts: StockAlert[]) {
    const { addNotification } = useNotificationStore.getState();

    for (const alert of alerts) {
      if (!this.acknowledgedAlerts.has(alert.id)) {
        let notificationType: 'info' | 'warning' | 'error' = 'info';

        switch (alert.severity) {
          case 'critical':
            notificationType = 'error';
            break;
          case 'high':
          case 'medium':
            notificationType = 'warning';
            break;
          default:
            notificationType = 'info';
        }

        addNotification({
          type: notificationType,
          title: this.getAlertTitle(alert.type),
          message: alert.message,
          action: {
            label: 'View Inventory',
            onClick: () => {
              // Navigate to inventory page - this would be handled by the UI
              console.log('Navigate to inventory page');
            },
          },
        });
      }
    }
  }

  // Get alert title based on type
  private getAlertTitle(type: StockAlert['type']): string {
    switch (type) {
      case 'out_of_stock':
        return 'Out of Stock Alert';
      case 'low_stock':
        return 'Low Stock Alert';
      case 'expiring':
        return 'Expiry Warning';
      case 'expired':
        return 'Expired Item Alert';
      default:
        return 'Inventory Alert';
    }
  }

  // Acknowledge an alert
  acknowledgeAlert(alertId: string) {
    this.acknowledgedAlerts.add(alertId);
    localStorage.setItem(
      'acknowledged_alerts',
      JSON.stringify([...this.acknowledgedAlerts])
    );
  }

  // Acknowledge all alerts of a specific type
  acknowledgeAllAlerts(_type?: StockAlert['type']) {
    // This would require getting current alerts and acknowledging them
    // Implementation depends on how alerts are stored/managed
  }

  // Get critical alerts count
  async getCriticalAlertsCount(): Promise<number> {
    const alerts = await this.performAlertCheck();
    return alerts.filter(
      alert => alert.severity === 'critical' && !alert.acknowledged
    ).length;
  }

  // Get alerts summary for dashboard
  async getAlertsSummary(): Promise<{
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<StockAlert['type'], number>;
  }> {
    const alerts = await this.performAlertCheck();

    const summary = {
      total: alerts.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {
        out_of_stock: 0,
        low_stock: 0,
        expiring: 0,
        expired: 0,
      } as Record<StockAlert['type'], number>,
    };

    for (const alert of alerts) {
      if (!alert.acknowledged) {
        summary[alert.severity]++;
        summary.byType[alert.type]++;
      }
    }

    return summary;
  }

  // Generate restock recommendations based on alerts
  async getRestockRecommendations(): Promise<
    Array<{
      item: InventoryItem;
      priority: 'urgent' | 'high' | 'medium' | 'low';
      recommendedQuantity: number;
      reason: string;
    }>
  > {
    const alerts = await this.performAlertCheck();
    const recommendations = [];

    for (const alert of alerts) {
      if (alert.type === 'out_of_stock' || alert.type === 'low_stock') {
        let priority: 'urgent' | 'high' | 'medium' | 'low' = 'medium';
        let recommendedQuantity = (alert.item.minimum_stock || 10) * 2; // Double the minimum stock

        if (alert.type === 'out_of_stock') {
          priority = 'urgent';
          recommendedQuantity = Math.max(recommendedQuantity, 20);
        } else if (alert.severity === 'high') {
          priority = 'high';
        }

        recommendations.push({
          item: alert.item,
          priority,
          recommendedQuantity,
          reason: alert.message,
        });
      }
    }

    // Sort by priority
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    recommendations.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return recommendations;
  }

  // Check alerts for specific items (useful for POS)
  async checkItemsAlert(itemIds: string[]): Promise<Map<string, StockAlert[]>> {
    const alertMap = new Map<string, StockAlert[]>();

    try {
      for (const itemId of itemIds) {
        const item = await inventoryService.getItemById(itemId);
        const alerts: StockAlert[] = [];

        if (item) {
          // Check stock alerts
          if (this.isOutOfStock(item)) {
            alerts.push(this.createAlert('out_of_stock', 'critical', item));
          } else if (this.isLowStock(item)) {
            alerts.push(this.createAlert('low_stock', 'high', item));
          }

          // Check expiry alerts
          if (item.expiry_date) {
            const expiryAlert = this.checkExpiryAlert(item);
            if (expiryAlert) {
              alerts.push(expiryAlert);
            }
          }
        }

        alertMap.set(itemId, alerts);
      }
    } catch (error) {
      console.error('Failed to check item alerts:', error);
    }

    return alertMap;
  }
}

// Export singleton instance
export const alertService = new AlertService();
