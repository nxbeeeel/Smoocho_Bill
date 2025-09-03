import {
  IntegrationConfig,
  IntegrationStatus,
  PaymentIntegrationRequest,
  PaymentIntegrationResponse,
} from '../types';
import { API_BASE_URL } from '../config';

export class IntegrationService {
  private baseUrl = `${API_BASE_URL}/integrations`;

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get all integrations
  async getAllIntegrations(): Promise<IntegrationConfig[]> {
    const response = await this.fetchWithAuth(this.baseUrl);
    return response.data;
  }

  // Get specific integration
  async getIntegrationById(id: string): Promise<IntegrationConfig> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`);
    return response.data;
  }

  // Update integration
  async updateIntegration(
    id: string,
    updates: Partial<IntegrationConfig>
  ): Promise<IntegrationConfig> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return response.data;
  }

  // Enable integration
  async enableIntegration(id: string): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/${id}/enable`, {
      method: 'POST',
    });
  }

  // Disable integration
  async disableIntegration(id: string): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/${id}/disable`, {
      method: 'POST',
    });
  }

  // Update credentials
  async updateCredentials(
    id: string,
    credentials: IntegrationConfig['api_credentials']
  ): Promise<void> {
    await this.fetchWithAuth(`${this.baseUrl}/${id}/credentials`, {
      method: 'POST',
      body: JSON.stringify({ credentials }),
    });
  }

  // Test connection
  async testConnection(
    id: string
  ): Promise<{ connected: boolean; tested_at: string }> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/${id}/test`, {
      method: 'POST',
    });
    return response.data;
  }

  // Get integration statistics
  async getIntegrationStats(): Promise<any> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/stats/overview`);
    return response.data;
  }

  // Get health status
  async getHealthStatus(): Promise<any> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/health/status`);
    return response.data;
  }

  // PAYMENT METHODS

  // Process payment
  async processPayment(
    request: PaymentIntegrationRequest
  ): Promise<PaymentIntegrationResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/payments/process`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
    return response.data;
  }

  // Process card payment
  async processCardPayment(
    request: PaymentIntegrationRequest
  ): Promise<PaymentIntegrationResponse> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/payments/card`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response.data;
  }

  // Check payment status
  async checkPaymentStatus(
    orderId: string,
    integrationType: string
  ): Promise<PaymentIntegrationResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/payments/${orderId}/status?integration_type=${integrationType}`
    );
    return response.data;
  }

  // Process refund
  async processRefund(
    transactionId: string,
    amount: number,
    orderId: string,
    integrationType: string
  ): Promise<PaymentIntegrationResponse> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/payments/refund`,
      {
        method: 'POST',
        body: JSON.stringify({
          transactionId,
          amount,
          orderId,
          integration_type: integrationType,
        }),
      }
    );
    return response.data;
  }

  // ORDER SYNC METHODS

  // Sync all orders
  async syncAllOrders(): Promise<any> {
    const response = await this.fetchWithAuth(`${this.baseUrl}/orders/sync`, {
      method: 'POST',
    });
    return response.data;
  }

  // Sync platform orders
  async syncPlatformOrders(platform: string): Promise<any> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/orders/sync/${platform}`,
      {
        method: 'POST',
      }
    );
    return response.data;
  }

  // Update external order status
  async updateExternalOrderStatus(
    orderId: string,
    status: string,
    platform?: string
  ): Promise<any> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/orders/${orderId}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ status, platform }),
      }
    );
    return response.data;
  }

  // Accept external order
  async acceptExternalOrder(orderId: string, prepTime?: number): Promise<any> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/orders/${orderId}/accept`,
      {
        method: 'POST',
        body: JSON.stringify({ prep_time: prepTime }),
      }
    );
    return response.data;
  }

  // Reject external order
  async rejectExternalOrder(orderId: string, reason: string): Promise<any> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/orders/${orderId}/reject`,
      {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }
    );
    return response.data;
  }

  // Mark food ready
  async markFoodReady(orderId: string): Promise<any> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/orders/${orderId}/ready`,
      {
        method: 'POST',
      }
    );
    return response.data;
  }

  // Get sync statistics
  async getSyncStats(): Promise<any> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/orders/sync/stats`
    );
    return response.data;
  }

  // Retry failed syncs
  async retryFailedSyncs(): Promise<any> {
    const response = await this.fetchWithAuth(
      `${this.baseUrl}/orders/sync/retry`,
      {
        method: 'POST',
      }
    );
    return response.data;
  }

  // Get integration statuses
  async getIntegrationStatuses(): Promise<Record<string, IntegrationStatus>> {
    const healthData = await this.getHealthStatus();

    // Transform health data to status format
    const statuses: Record<string, IntegrationStatus> = {};

    if (healthData.integrations) {
      Object.keys(healthData.integrations).forEach(platform => {
        const health = healthData.integrations[platform];
        statuses[platform] = {
          id: `integration_${platform}_${Date.now()}`,
          integration_id: platform,
          platform: platform as any,
          status: health.enabled ? 'active' : 'inactive',
          is_enabled: health.enabled,
          is_connected: health.configured,
          last_sync: health.last_sync,
          sync_frequency: 2, // Default
          orders_synced_today: 0, // Would come from sync stats
          error_count: health.error_count,
          last_error: health.last_error,
          next_sync: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });
    }

    return statuses;
  }
}

export const integrationService = new IntegrationService();
