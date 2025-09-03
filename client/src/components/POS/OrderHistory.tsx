import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { orderService } from '../../services/orderService';
import { printService } from '../../services/printService';
import { Order, OrderItem } from '../../types';
import EditOrderModal from './EditOrderModal';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  PrinterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

interface OrderHistoryProps {
  isModal?: boolean;
  onClose?: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  isModal = false,
  onClose,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<
    (Order & { order_items: OrderItem[] }) | null
  >(null);
  const [editingOrder, setEditingOrder] = useState<
    (Order & { order_items: OrderItem[] }) | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // 7 days ago
    end: new Date().toISOString().split('T')[0], // today
  });

  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  const ordersPerPage = 10;

  // Load orders
  useEffect(() => {
    loadOrders();
  }, [dateRange, selectedStatus]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let ordersData: Order[];

      if (selectedStatus === 'all') {
        ordersData = await orderService.getOrdersByDateRange(
          dateRange.start + 'T00:00:00.000Z',
          dateRange.end + 'T23:59:59.999Z'
        );
      } else {
        ordersData = await orderService.getOrdersByDateRange(
          dateRange.start + 'T00:00:00.000Z',
          dateRange.end + 'T23:59:59.999Z',
          selectedStatus
        );
      }

      // Sort by newest first
      ordersData.sort(
        (a, b) =>
          new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );

      setOrders(ordersData);
    } catch (error) {
      console.error('Failed to load orders:', error);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load order history',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      searchTerm === '' ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      order.table_number?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  // Handle order view
  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await orderService.getOrderWithItems(orderId);
      if (order) {
        setSelectedOrder(order);
      }
    } catch (error) {
      console.error('Failed to load order details:', error);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load order details',
      });
    }
  };

  // Handle order edit
  const handleEditOrder = async (orderId: string) => {
    try {
      const order = await orderService.getOrderWithItems(orderId);
      if (order) {
        setEditingOrder(order);
      }
    } catch (error) {
      console.error('Failed to load order for editing:', error);
      addNotification({
        type: 'error',
        title: 'Load Failed',
        message: 'Failed to load order for editing',
      });
    }
  };
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await orderService.cancelOrder(orderId);
      addNotification({
        type: 'success',
        title: 'Order Cancelled',
        message: 'Order has been cancelled successfully',
      });
      loadOrders();
    } catch (error) {
      console.error('Failed to cancel order:', error);
      addNotification({
        type: 'error',
        title: 'Cancel Failed',
        message: 'Failed to cancel order',
      });
    }
  };

  // Handle print receipt
  const handlePrintReceipt = async (orderId: string) => {
    try {
      const success = await printService.printReceipt(orderId);
      if (success) {
        addNotification({
          type: 'success',
          title: 'Print Successful',
          message: 'Receipt has been sent to printer',
        });
      } else {
        throw new Error('Print failed');
      }
    } catch (error) {
      console.error('Failed to print receipt:', error);
      addNotification({
        type: 'error',
        title: 'Print Failed',
        message: 'Failed to print receipt',
      });
    }
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig = {
      pending: { color: 'yellow', text: 'Pending' },
      confirmed: { color: 'blue', text: 'Confirmed' },
      preparing: { color: 'orange', text: 'Preparing' },
      ready: { color: 'purple', text: 'Ready' },
      completed: { color: 'green', text: 'Completed' },
      cancelled: { color: 'red', text: 'Cancelled' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {isModal && onClose && (
              <button
                onClick={onClose}
                className="mr-3 p-2 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-xl font-bold text-secondary-900">
              Order History
            </h2>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Range */}
          <input
            type="date"
            value={dateRange.start}
            onChange={e =>
              setDateRange(prev => ({ ...prev, start: e.target.value }))
            }
            className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />

          <input
            type="date"
            value={dateRange.end}
            onChange={e =>
              setDateRange(prev => ({ ...prev, end: e.target.value }))
            }
            className="px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <span className="ml-3 text-secondary-600">Loading orders...</span>
          </div>
        ) : paginatedOrders.length === 0 ? (
          <div className="text-center py-16">
            <ClockIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              No orders found
            </h3>
            <p className="text-secondary-500">
              {searchTerm
                ? `No orders match "${searchTerm}"`
                : 'No orders in selected date range'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {paginatedOrders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-secondary-200 hover:border-primary-300 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-secondary-900">
                          #{order.order_number}
                        </h3>
                        <StatusBadge status={order.status} />
                        <span className="text-sm text-secondary-500">
                          {new Date(order.order_date).toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-secondary-600">
                        <div>
                          <span className="font-medium">Type:</span>{' '}
                          {order.order_type.replace('_', ' ')}
                        </div>
                        {order.customer_name && (
                          <div>
                            <span className="font-medium">Customer:</span>{' '}
                            {order.customer_name}
                          </div>
                        )}
                        {order.table_number && (
                          <div>
                            <span className="font-medium">Table:</span>{' '}
                            {order.table_number}
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Total:</span> ₹
                          {order.total_amount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewOrder(order.id)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handlePrintReceipt(order.id)}
                        className="p-2 hover:bg-green-100 rounded-lg transition-colors text-green-600"
                        title="Print Receipt"
                      >
                        <PrinterIcon className="w-4 h-4" />
                      </button>

                      {(user?.role === 'admin' || user?.role === 'manager') &&
                        order.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleEditOrder(order.id)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                              title="Edit Order"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>

                            {order.status === 'pending' && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                                title="Cancel Order"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-secondary-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-secondary-700">
              Showing{' '}
              {Math.min(
                (currentPage - 1) * ordersPerPage + 1,
                filteredOrders.length
              )}{' '}
              to {Math.min(currentPage * ordersPerPage, filteredOrders.length)}{' '}
              of {filteredOrders.length} orders
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>

              <span className="text-sm text-secondary-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage(prev => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-secondary-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onOrderUpdated={() => {
            loadOrders();
            setEditingOrder(null);
          }}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-secondary-900">
                  Order Details - #{selectedOrder.order_number}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-secondary-100 rounded"
                >
                  <XCircleIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-secondary-700">
                      Status:
                    </span>
                    <div className="mt-1">
                      <StatusBadge status={selectedOrder.status} />
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">
                      Date:
                    </span>
                    <div className="mt-1">
                      {new Date(selectedOrder.order_date).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-secondary-700">
                      Type:
                    </span>
                    <div className="mt-1">
                      {selectedOrder.order_type.replace('_', ' ')}
                    </div>
                  </div>
                  {selectedOrder.customer_name && (
                    <div>
                      <span className="font-medium text-secondary-700">
                        Customer:
                      </span>
                      <div className="mt-1">{selectedOrder.customer_name}</div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-secondary-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.order_items.map(item => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2 border-b border-secondary-100"
                      >
                        <div>
                          <div className="font-medium">{item.product_name}</div>
                          {item.special_instructions && (
                            <div className="text-sm text-secondary-500">
                              Note: {item.special_instructions}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div>
                            {item.quantity} × ₹{item.product_price.toFixed(2)}
                          </div>
                          <div className="font-medium">
                            ₹{item.item_total.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Total */}
                <div className="border-t border-secondary-200 pt-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    {selectedOrder.discount_amount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>
                          -₹{selectedOrder.discount_amount.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>₹{selectedOrder.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t border-secondary-200 pt-2">
                      <span>Total:</span>
                      <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
