import { create } from 'zustand';
import { IntegrationsState, IntegrationConfig } from '../types';
import { useNotificationStore } from './notificationStore';

interface IntegrationStoreState {
  // State
  integrations: IntegrationsState;
  selectedIntegration: IntegrationConfig | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchIntegrations: () => Promise<void>;
  toggleIntegration: (integrationId: string, enabled: boolean) => Promise<void>;
  testConnection: (
    integrationId: string
  ) => Promise<{ connected: boolean; message?: string }>;
  updateCredentials: (integrationId: string, credentials: any) => Promise<void>;
  syncOrders: (
    platform: 'zomato' | 'swiggy'
  ) => Promise<{ orders_synced: number }>;

  // Utility actions
  clearError: () => void;
  setSelectedIntegration: (integration: IntegrationConfig | null) => void;
}

export const useIntegrationStore = create<IntegrationStoreState>(set => ({
  // Initial state
  integrations: {
    zomato: {
      id: 'zomato',
      name: 'Zomato',
      type: 'order_platform',
      is_enabled: false,
      is_active: false,
      is_configured: false,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    swiggy: {
      id: 'swiggy',
      name: 'Swiggy',
      type: 'order_platform',
      is_enabled: false,
      is_active: false,
      is_configured: false,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    paytm: {
      id: 'paytm',
      name: 'Paytm',
      type: 'payment',
      is_enabled: false,
      is_active: false,
      is_configured: false,
      settings: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    stats: {
      total_orders_synced: 0,
      last_sync_time: '',
      active_integrations: 0,
    },
    payment_stats: {
      total_transactions: 0,
      success_rate: 0,
      total_amount: 0,
    },
  },
  selectedIntegration: null,
  isLoading: false,
  error: null,

  // Fetch integrations
  fetchIntegrations: async () => {
    set({ isLoading: true, error: null });

    try {
      // Simulate API call - replace with actual service call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update with mock data for now
      set(state => ({
        integrations: {
          ...state.integrations,
          zomato: {
            ...state.integrations.zomato,
            is_configured: true,
            is_active: true,
          },
          stats: {
            total_orders_synced: 45,
            last_sync_time: new Date().toISOString(),
            active_integrations: 2,
          },
        },
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false,
      });

      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Failed to Load Integrations',
        message: error.message,
      });
    }
  },

  // Toggle integration
  toggleIntegration: async (integrationId: string, enabled: boolean) => {
    try {
      set(state => ({
        integrations: {
          ...state.integrations,
          [integrationId]: {
            ...state.integrations[integrationId as keyof IntegrationsState],
            is_active: enabled,
          },
        },
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Test connection
  testConnection: async () => {
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { connected: true, message: 'Connection successful' };
    } catch (error: any) {
      return { connected: false, message: error.message };
    }
  },

  // Update credentials
  updateCredentials: async (integrationId: string, credentials: any) => {
    try {
      set(state => ({
        integrations: {
          ...state.integrations,
          [integrationId]: {
            ...state.integrations[integrationId as keyof IntegrationsState],
            api_credentials: credentials,
            is_configured: true,
          },
        },
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Sync orders
  syncOrders: async () => {
    try {
      // Simulate order sync
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { orders_synced: Math.floor(Math.random() * 10) + 1 };
    } catch (error: any) {
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Set selected integration
  setSelectedIntegration: (integration: IntegrationConfig | null) =>
    set({ selectedIntegration: integration }),
}));
