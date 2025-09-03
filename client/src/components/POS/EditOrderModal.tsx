import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/notificationStore';
import { orderService } from '../../services/orderService';
import { Order, OrderItem } from '../../types';
import {
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface EditOrderModalProps {
  order: Order & { order_items: OrderItem[] };
  onClose: () => void;
  onOrderUpdated: () => void;
}

const EditOrderModal: React.FC<EditOrderModalProps> = ({
  order,
  onClose,
  onOrderUpdated,
}) => {
  const [editedItems, setEditedItems] = useState<OrderItem[]>(
    order.order_items
  );
  const [loading, setLoading] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');

  const { user } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // Check if current user needs admin approval for editing
    setRequiresApproval(user?.role !== 'admin' && user?.role !== 'manager');
  }, [user]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setEditedItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setEditedItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                item_total: newQuantity * item.product_price,
              }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setEditedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const calculateNewTotals = () => {
    const subtotal = editedItems.reduce(
      (sum, item) => sum + item.item_total,
      0
    );
    const discount = order.discount_amount || 0;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * 0.05; // 5% tax
    const total = taxableAmount + tax;

    return { subtotal, tax, total };
  };

  const handleSaveChanges = async () => {
    if (editedItems.length === 0) {
      addNotification({
        type: 'error',
        title: 'Invalid Order',
        message: 'Order must have at least one item',
      });
      return;
    }

    setLoading(true);

    try {
      const { subtotal, tax, total } = calculateNewTotals();

      const updates = {
        subtotal,
        tax_amount: tax,
        total_amount: total,
        updated_at: new Date().toISOString(),
      };

      // Determine if admin approval is needed
      const needsApproval = requiresApproval && adminPassword === '';

      if (needsApproval) {
        // Show admin password requirement
        addNotification({
          type: 'warning',
          title: 'Admin Approval Required',
          message: 'Please enter admin password to approve this edit',
        });
        return;
      }

      // TODO: Update order items in the database
      // This would require additional service methods to handle item updates

      await orderService.updateOrder(
        order.id,
        updates,
        !requiresApproval || adminPassword !== ''
      );

      addNotification({
        type: 'success',
        title: 'Order Updated',
        message: 'Order has been updated successfully',
      });

      onOrderUpdated();
      onClose();
    } catch (error) {
      console.error('Failed to update order:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message:
          error instanceof Error ? error.message : 'Failed to update order',
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, tax, total } = calculateNewTotals();
  const hasChanges =
    JSON.stringify(editedItems) !== JSON.stringify(order.order_items);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-secondary-900">
              Edit Order - #{order.order_number}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-secondary-100 rounded"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Warning for order editing */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">
                  Order Edit Warning
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Editing orders can affect inventory tracking and financial
                  records.
                  {requiresApproval && ' This action requires admin approval.'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-secondary-900">Order Items</h4>

            {editedItems.map(item => (
              <div
                key={item.id}
                className="border border-secondary-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-secondary-900">
                      {item.product_name}
                    </h5>
                    <p className="text-sm text-secondary-500">
                      ₹{item.product_price.toFixed(2)} each
                    </p>
                    {item.special_instructions && (
                      <p className="text-sm text-secondary-600 mt-1">
                        Note: {item.special_instructions}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                      >
                        <MinusIcon className="w-4 h-4" />
                      </button>

                      <span className="text-lg font-medium min-w-[3rem] text-center">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right min-w-[5rem]">
                      <p className="text-lg font-bold text-secondary-900">
                        ₹{item.item_total.toFixed(2)}
                      </p>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Remove Item"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {editedItems.length === 0 && (
              <div className="text-center py-8 text-secondary-500">
                <p>No items in order. Add at least one item to save changes.</p>
              </div>
            )}
          </div>

          {/* Updated Totals */}
          <div className="border-t border-secondary-200 pt-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount:</span>
                  <span>-₹{order.discount_amount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Tax (5%):</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-bold text-lg border-t border-secondary-200 pt-2">
                <span>Total:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Show change from original */}
              {hasChanges && (
                <div className="flex justify-between text-sm text-blue-600 pt-2 border-t border-blue-200">
                  <span>Change from original:</span>
                  <span>
                    {total > order.total_amount ? '+' : ''}₹
                    {(total - order.total_amount).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Admin Password (if required) */}
          {requiresApproval && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Admin Password (Required for Approval)
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={loading || !hasChanges || editedItems.length === 0}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-secondary-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
