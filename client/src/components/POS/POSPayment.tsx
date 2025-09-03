import React, { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { orderService } from '../../services/orderService';
import { printService } from '../../services/printService';
import { paytmService } from '../../services/paytmService';
import {
  ChevronLeftIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  BuildingStorefrontIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface POSPaymentProps {
  onBack: () => void;
  onOrderSuccess: (orderId: string, orderNumber: string) => void;
}

type PaymentMethod = 'cash' | 'card' | 'upi';
type OrderType = 'dine_in' | 'takeaway';

const POSPayment: React.FC<POSPaymentProps> = ({ onBack, onOrderSuccess }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>('cash');
  const [selectedOrderType, setSelectedOrderType] =
    useState<OrderType>('dine_in');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    tableNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const {
    items,
    subtotal,
    discount_amount,
    tax_amount,
    total_amount,
    getItemCount,
  } = useCartStore();

  // Payment method options
  const paymentMethods = [
    {
      id: 'cash' as PaymentMethod,
      name: 'Cash',
      icon: CurrencyDollarIcon,
      color: 'green',
      description: 'Physical cash payment',
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Card',
      icon: CreditCardIcon,
      color: 'blue',
      description: 'Credit/Debit card',
    },
    {
      id: 'upi' as PaymentMethod,
      name: 'UPI',
      icon: DevicePhoneMobileIcon,
      color: 'purple',
      description: 'UPI/Digital payment',
    },
  ];

  // Order type options
  const orderTypes = [
    {
      id: 'dine_in' as OrderType,
      name: 'Dine In',
      icon: BuildingStorefrontIcon,
      color: 'blue',
      description: 'Customer dining in restaurant',
    },
    {
      id: 'takeaway' as OrderType,
      name: 'Takeaway',
      icon: ShoppingBagIcon,
      color: 'green',
      description: 'Customer pickup order',
    },
  ];

  // Handle customer info change
  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Validate form - Make mobile/table optional
  const validateForm = () => {
    if (getItemCount() === 0) {
      setError('Cart is empty');
      return false;
    }

    // All fields are now optional - no validation needed
    setError('');
    return true;
  };

  // Handle Paytm payment
  const handlePaytmPayment = async (orderId: string): Promise<boolean> => {
    try {
      setPaymentProcessing(true);

      const paytmData = {
        id: `paytm_${Date.now()}`,
        order_id: orderId,
        orderId: orderId,
        transaction_id: '',
        amount: total_amount,
        txnAmount: total_amount.toString(),
        payment_status: 'pending' as const,
        payment_method: 'card' as const,
        customer_info: {
          name: customerInfo.name || 'Guest',
          phone: customerInfo.phone,
          email: customerInfo.email,
        },
        mobileNo: customerInfo.phone || '',
        email: customerInfo.email || '',
        custId: customerInfo.phone || 'guest',
        callbackUrl: `${window.location.origin}/payment-callback`,
        gateway_response: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await paytmService.initiatePayment(paytmData);

      if (result.success && result.transactionId) {
        // Verify payment with backend
        const verification = await paytmService.verifyPayment(
          orderId,
          result.transactionId
        );

        if (verification.verified) {
          return true;
        } else {
          throw new Error('Payment verification failed');
        }
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Paytm payment error:', error);
      setError(
        error instanceof Error ? error.message : 'Payment processing failed'
      );
      return false;
    } finally {
      setPaymentProcessing(false);
    }
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order with selected payment method
      const orderId = await orderService.createOrder(
        items,
        selectedOrderType,
        selectedPaymentMethod,
        customerInfo
      );

      // Get the created order to get order number
      const order = await orderService.getOrderWithItems(orderId);
      if (order) {
        // Handle card payments through Paytm
        if (selectedPaymentMethod === 'card') {
          const paytmSuccess = await handlePaytmPayment(orderId);
          if (!paytmSuccess) {
            // If Paytm payment fails, update order status to cancelled with pending payment
            await orderService.updateOrder(orderId, {
              status: 'cancelled',
              payment_status: 'pending',
            });
            return;
          }
        }

        // Try to print receipt
        try {
          await printService.printReceipt(orderId);
        } catch (printError) {
          console.warn('Print failed, but order was successful:', printError);
        }

        onOrderSuccess(orderId, order.order_number);
      } else {
        throw new Error('Failed to retrieve order details');
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to place order'
      );
    } finally {
      setLoading(false);
    }
  };

  if (getItemCount() === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-white border-b border-secondary-200 px-3 py-2 flex items-center">
          <button
            onClick={onBack}
            className="mr-2 p-1.5 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-secondary-900">Payment</h2>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-500 mx-auto mb-3" />
            <h3 className="text-base sm:text-lg font-medium text-secondary-900 mb-2">
              No items in cart
            </h3>
            <p className="text-secondary-500 mb-4 text-sm">
              Add some items before proceeding to payment
            </p>
            <button onClick={onBack} className="btn-primary px-4 py-2 text-sm">
              Go Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Compact */}
      <div className="bg-white border-b border-secondary-200 px-3 py-2 flex items-center">
        <button
          onClick={onBack}
          className="mr-2 p-1.5 hover:bg-secondary-100 rounded-lg transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
        </button>
        <h2 className="text-lg font-bold text-secondary-900">Payment</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-3">
        {/* Order Summary - Compact */}
        <div className="bg-white rounded-lg border border-secondary-200 p-3">
          <h3 className="text-base font-semibold text-secondary-900 mb-2">
            Order Summary
          </h3>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-secondary-600">
                Items ({getItemCount()})
              </span>
              <span>₹{subtotal.toFixed(0)}</span>
            </div>

            {discount_amount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-₹{discount_amount.toFixed(0)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-secondary-600">Tax (5%)</span>
              <span>₹{tax_amount.toFixed(0)}</span>
            </div>

            <div className="border-t border-secondary-200 pt-1 mt-2">
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>₹{total_amount.toFixed(0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Type Selection - Compact */}
        <div className="bg-white rounded-lg border border-secondary-200 p-3">
          <h3 className="text-base font-semibold text-secondary-900 mb-2">
            Order Type
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {orderTypes.map(type => {
              const IconComponent = type.icon;
              const isSelected = selectedOrderType === type.id;

              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedOrderType(type.id)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? `border-${type.color}-500 bg-${type.color}-50`
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 mx-auto mb-1 ${
                      isSelected
                        ? `text-${type.color}-600`
                        : 'text-secondary-400'
                    }`}
                  />
                  <div className="text-xs font-medium text-secondary-900">
                    {type.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Information - All Optional & Compact */}
        <div className="bg-white rounded-lg border border-secondary-200 p-3">
          <h3 className="text-base font-semibold text-secondary-900 mb-2">
            Customer Info (Optional)
          </h3>

          <div className="space-y-2">
            <div>
              <input
                type="text"
                placeholder="Customer name (optional)"
                value={customerInfo.name}
                onChange={e => handleCustomerInfoChange('name', e.target.value)}
                className="w-full px-2 py-2 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone number (optional)"
                value={customerInfo.phone}
                onChange={e =>
                  handleCustomerInfoChange('phone', e.target.value)
                }
                className="w-full px-2 py-2 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {selectedOrderType === 'dine_in' && (
              <div>
                <input
                  type="text"
                  placeholder="Table number (optional)"
                  value={customerInfo.tableNumber}
                  onChange={e =>
                    handleCustomerInfoChange('tableNumber', e.target.value)
                  }
                  className="w-full px-2 py-2 text-sm border border-secondary-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>

        {/* Payment Method Selection - Compact */}
        <div className="bg-white rounded-lg border border-secondary-200 p-3">
          <h3 className="text-base font-semibold text-secondary-900 mb-2">
            Payment Method
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {paymentMethods.map(method => {
              const IconComponent = method.icon;
              const isSelected = selectedPaymentMethod === method.id;

              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedPaymentMethod(method.id)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-3 ${
                    isSelected
                      ? `border-${method.color}-500 bg-${method.color}-50`
                      : 'border-secondary-200 hover:border-secondary-300'
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${
                      isSelected
                        ? `text-${method.color}-600`
                        : 'text-secondary-400'
                    }`}
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium text-secondary-900">
                      {method.name}
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircleIcon
                      className={`w-5 h-5 text-${method.color}-600 ml-auto`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Message - Compact */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Place Order Button - Compact */}
      <div className="bg-white border-t border-secondary-200 p-2">
        <button
          onClick={handlePlaceOrder}
          disabled={loading || paymentProcessing}
          className="w-full btn-primary py-3 text-sm font-medium flex items-center justify-center space-x-2 disabled:bg-secondary-300 disabled:cursor-not-allowed"
        >
          {loading || paymentProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>
                {paymentProcessing ? 'Processing...' : 'Processing...'}
              </span>
            </>
          ) : (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              <span>Place Order (₹{total_amount.toFixed(0)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default POSPayment;
