import React from 'react';
import { useCartStore } from '../../store/cartStore';
import { TrashIcon, PlusIcon, MinusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

const POSCart: React.FC = () => {
  const { items, total, clearCart, removeItem, updateQuantity } = useCartStore();
  
  // Use responsive hook
  const { isMobile, isTablet } = useResponsive();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeItem(productId);
  };

  // Mobile/Tablet Cart View
  if (isMobile || isTablet) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingCartIcon className="w-6 h-6 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
            </div>
            <span className="text-sm text-gray-500">{items.length} items</span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500">Add some items to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4"
                >
                  <div className="flex items-start space-x-3">
                    {/* Item Image */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product.image ? (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-400 text-lg font-bold">
                            {item.product.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        ₹{item.product.price} × {item.quantity}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-lg font-bold text-primary-600">
                          ₹{item.item_total}
                        </span>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveItem(item.product.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{total.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (5%)</span>
                <span className="font-medium">₹{total.tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="text-lg font-bold text-primary-600">₹{total.total}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <button className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors">
                Proceed to Payment
              </button>
              <button
                onClick={clearCart}
                className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Cart View
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Cart Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ShoppingCartIcon className="w-7 h-7 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {items.length} items
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingCartIcon className="w-16 h-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-gray-900 mb-3">Your cart is empty</h3>
            <p className="text-gray-500">Add some items from the menu to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6"
              >
                <div className="flex items-start space-x-4">
                  {/* Item Image */}
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-gray-400 text-xl font-bold">
                          {item.product.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-gray-900 truncate">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      ₹{item.product.price} per item
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xl font-bold text-primary-600">
                        ₹{item.item_total}
                      </span>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        >
                          <MinusIcon className="w-5 h-5" />
                        </button>
                        <span className="w-12 text-center text-base font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                          className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center hover:bg-primary-200 transition-colors"
                        >
                          <PlusIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.product.id)}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {items.length > 0 && (
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="space-y-4">
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{total.subtotal}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-gray-600">Tax (5%)</span>
              <span className="font-medium">₹{total.tax}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-gray-900 font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary-600">₹{total.total}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button className="w-full bg-primary-500 text-white py-4 px-6 rounded-lg font-medium hover:bg-primary-600 transition-colors text-lg">
              Proceed to Payment
            </button>
            <button
              onClick={clearCart}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSCart;
