import React from 'react'
import { useCart } from '../hooks/useCart'
import { useOrders } from '../hooks/useOrders'

interface CartSummaryProps {
  onCheckout?: () => void
  showCheckoutButton?: boolean
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  onCheckout,
  showCheckoutButton = true
}) => {
  const { items, itemCount, totalPrice, isEmpty, clearCart } = useCart()
  const { createOrder, loading } = useOrders()

  const handleCheckout = async () => {
    if (isEmpty) return

    const result = await createOrder({
      paymentMethod: 'cash',
      orderType: 'takeaway',
      discount: 0,
      discountType: 'flat',
      taxRate: 0,
      deliveryCharge: 0
    })

    if (result.success) {
      clearCart()
      if (onCheckout) {
        onCheckout()
      }
    }
  }

  if (isEmpty) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </div>
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-900">Cart Summary</h3>
      </div>
      
      <div className="p-4 space-y-3">
        {items.map((item) => (
          <div key={item.id.value} className="flex justify-between items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {item.product.name.value}
              </p>
              <p className="text-xs text-gray-500">
                ₹{item.product.price.value.toFixed(2)} × {item.quantity.value}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              ₹{item.getTotalPrice().toFixed(2)}
            </p>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-lg font-semibold text-gray-900">
            ₹{totalPrice.toFixed(2)}
          </span>
        </div>
        
        {showCheckoutButton && (
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        )}
      </div>
    </div>
  )
}
