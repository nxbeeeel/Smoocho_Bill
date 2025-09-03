import React, { useState, useEffect } from 'react';
import {
  GlobeAltIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { useIntegrationStore } from '../store/integrationStore';
import { useNotificationStore } from '../store/notificationStore';
import { LoadingSpinner } from '../components/LoadingSpinner';
import PremiumLayout from '../components/Layout/PremiumLayout';

const IntegrationsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'food-delivery' | 'payments'>(
    'food-delivery'
  );

  const {
    integrations,
    isLoading: storeLoading,
    fetchIntegrations,
    toggleIntegration,
    testConnection,
    updateCredentials,
    syncOrders,
  } = useIntegrationStore();

  const { addNotification } = useNotificationStore();

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleToggleIntegration = async (
    integrationId: string,
    enabled: boolean
  ) => {
    try {
      await toggleIntegration(integrationId, enabled);
      addNotification({
        type: 'success',
        title: 'Integration Updated',
        message: `Integration ${enabled ? 'enabled' : 'disabled'} successfully.`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update integration status.',
      });
    }
  };

  const handleTestConnection = async (integrationId: string) => {
    setIsLoading(true);
    try {
      const result = await testConnection(integrationId);
      addNotification({
        type: result.connected ? 'success' : 'error',
        title: 'Connection Test',
        message: result.connected
          ? 'Connection successful!'
          : 'Connection failed. Please check credentials.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Test Failed',
        message: 'Failed to test connection.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncOrders = async (platform: 'zomato' | 'swiggy') => {
    setIsLoading(true);
    try {
      const result = await syncOrders(platform);
      addNotification({
        type: 'success',
        title: 'Orders Synced',
        message: `Successfully synced ${result.orders_synced} orders from ${platform}.`,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Sync Failed',
        message: `Failed to sync orders from ${platform}.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getIntegrationStatus = (integration: any) => {
    if (!integration.is_configured) {
      return {
        text: 'Not Configured',
        color: 'text-gray-500',
        bg: 'bg-gray-100',
      };
    }
    if (integration.is_active) {
      return { text: 'Active', color: 'text-green-600', bg: 'bg-green-100' };
    }
    return { text: 'Inactive', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (storeLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <PremiumLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Integrations
            </h1>
            <p className="text-gray-600 mt-1">
              Connect with food delivery platforms and payment gateways
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('food-delivery')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'food-delivery'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TruckIcon className="h-5 w-5 inline mr-2" />
                  Food Delivery
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payments'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CreditCardIcon className="h-5 w-5 inline mr-2" />
                  Payment Gateways
                </button>
              </nav>
            </div>
          </div>

          {/* Food Delivery Integrations */}
          {activeTab === 'food-delivery' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Food Delivery Platforms
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically fetch orders from delivery platforms
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {/* Zomato Integration */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🟡</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Zomato
                          </h3>
                          <p className="text-sm text-gray-500">
                            Auto-fetch orders and sync order status
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntegrationStatus(integrations.zomato).bg} ${getIntegrationStatus(integrations.zomato).color}`}
                        >
                          {getIntegrationStatus(integrations.zomato).text}
                        </span>

                        <button
                          onClick={() => handleTestConnection('zomato')}
                          disabled={
                            isLoading || !integrations.zomato?.is_configured
                          }
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                          Test
                        </button>

                        <button
                          onClick={() => handleSyncOrders('zomato')}
                          disabled={isLoading || !integrations.zomato?.is_active}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                          Sync Orders
                        </button>

                        <button
                          onClick={() =>
                            handleToggleIntegration(
                              'zomato',
                              !integrations.zomato?.is_active
                            )
                          }
                          disabled={!integrations.zomato?.is_configured}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                            integrations.zomato?.is_active
                              ? 'text-white bg-red-600 hover:bg-red-700'
                              : 'text-white bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {integrations.zomato?.is_active ? (
                            <>
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Enable
                            </>
                          )}
                        </button>

                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          <Cog6ToothIcon className="h-4 w-4 mr-2" />
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Swiggy Integration */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🟠</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Swiggy
                          </h3>
                          <p className="text-sm text-gray-500">
                            Auto-fetch orders and sync order status
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntegrationStatus(integrations.swiggy).bg} ${getIntegrationStatus(integrations.swiggy).color}`}
                        >
                          {getIntegrationStatus(integrations.swiggy).text}
                        </span>

                        <button
                          onClick={() => handleTestConnection('swiggy')}
                          disabled={
                            isLoading || !integrations.swiggy?.is_configured
                          }
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                          Test
                        </button>

                        <button
                          onClick={() => handleSyncOrders('swiggy')}
                          disabled={isLoading || !integrations.swiggy?.is_active}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                          Sync Orders
                        </button>

                        <button
                          onClick={() =>
                            handleToggleIntegration(
                              'swiggy',
                              !integrations.swiggy?.is_active
                            )
                          }
                          disabled={!integrations.swiggy?.is_configured}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                            integrations.swiggy?.is_active
                              ? 'text-white bg-red-600 hover:bg-red-700'
                              : 'text-white bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {integrations.swiggy?.is_active ? (
                            <>
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Enable
                            </>
                          )}
                        </button>

                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          <Cog6ToothIcon className="h-4 w-4 mr-2" />
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Integration Stats */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Integration Statistics
                  </h2>
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {integrations.stats?.total_orders_synced || 0}
                      </div>
                      <div className="text-sm text-blue-800">
                        Total Orders Synced
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {integrations.stats?.last_sync_time
                          ? new Date(
                              integrations.stats.last_sync_time
                            ).toLocaleTimeString()
                          : 'Never'}
                      </div>
                      <div className="text-sm text-green-800">Last Sync Time</div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {integrations.stats?.active_integrations || 0}
                      </div>
                      <div className="text-sm text-purple-800">
                        Active Integrations
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Gateway Integrations */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Payment Gateways
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Process card payments and digital transactions
                  </p>
                </div>

                <div className="divide-y divide-gray-200">
                  {/* Paytm Integration */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">💳</span>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Paytm Card Machine
                          </h3>
                          <p className="text-sm text-gray-500">
                            Process card payments via Paytm terminal
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getIntegrationStatus(integrations.paytm).bg} ${getIntegrationStatus(integrations.paytm).color}`}
                        >
                          {getIntegrationStatus(integrations.paytm).text}
                        </span>

                        <button
                          onClick={() => handleTestConnection('paytm')}
                          disabled={
                            isLoading || !integrations.paytm?.is_configured
                          }
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                          Test
                        </button>

                        <button
                          onClick={() =>
                            handleToggleIntegration(
                              'paytm',
                              !integrations.paytm?.is_active
                            )
                          }
                          disabled={!integrations.paytm?.is_configured}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                            integrations.paytm?.is_active
                              ? 'text-white bg-red-600 hover:bg-red-700'
                              : 'text-white bg-green-600 hover:bg-green-700'
                          }`}
                        >
                          {integrations.paytm?.is_active ? (
                            <>
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Disable
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Enable
                            </>
                          )}
                        </button>

                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          <Cog6ToothIcon className="h-4 w-4 mr-2" />
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Statistics */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">
                    Payment Statistics
                  </h2>
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {integrations.payment_stats?.total_transactions || 0}
                      </div>
                      <div className="text-sm text-blue-800">
                        Total Transactions
                      </div>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {integrations.payment_stats?.success_rate
                          ? `${integrations.payment_stats.success_rate}%`
                          : '0%'}
                      </div>
                      <div className="text-sm text-green-800">Success Rate</div>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {integrations.payment_stats?.total_amount
                          ? `₹${integrations.payment_stats.total_amount.toLocaleString()}`
                          : '₹0'}
                      </div>
                      <div className="text-sm text-purple-800">Total Amount</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
                <LoadingSpinner size="md" />
                <span className="text-gray-700">Processing...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </PremiumLayout>
  );
};

export default IntegrationsPage;
