import React, { useState, useEffect } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
// import { orderService } from '../services/orderService'; // Not needed currently
import { Product, Category } from '../types';
import POSMenu from '../components/POS/POSMenu';
import POSCart from '../components/POS/POSCart';
import POSPayment from '../components/POS/POSPayment';
import StockWarnings from '../components/POS/StockWarnings';
import PremiumLayout from '../components/Layout/PremiumLayout';
import {
  ShoppingCartIcon,
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

type POSView = 'menu' | 'cart' | 'payment' | 'success';

interface OrderResult {
  orderId: string;
  orderNumber: string;
}

const POSPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<POSView>('menu');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Initializing...');
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);
  const [showStockWarnings, setShowStockWarnings] = useState(true);

  const { user } = useAuthStore();
  const { getItemCount, clearCart, items } = useCartStore();

  // Load products and categories on mount
  useEffect(() => {
    const initializeAndLoadData = async () => {
      try {
        console.log('🚀 Initializing POS page (direct mode)...');
        setLoadingMessage('Loading menu data...');

        // Skip IndexedDB due to persistent DexieError - load directly
        await loadData();
      } catch (error) {
        console.error('❌ Failed to initialize POS:', error);
        setLoadingMessage('Error loading data');
        // Set empty data to prevent infinite loading
        setProducts([]);
        setCategories([]);
        setLoading(false);
      }
    };

    initializeAndLoadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading POS data...');
      setLoadingMessage('Loading menu directly (bypassing database)...');

      // BYPASS IndexedDB completely due to DexieError
      // Load data directly from menu files
      console.log('🔄 Loading menu data directly from source files');

      const { smoochoProducts } = await import('../utils/smoochoMenuData');
      const productsData = smoochoProducts.map(p => ({
        ...p,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const categoriesData = [
        {
          id: 'cat-1',
          name: 'Kunafa Bowls',
          description: 'Premium dessert bowls',
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cat-2',
          name: 'Smoocho Signatures',
          description: 'Signature desserts',
          sort_order: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cat-3',
          name: 'Crispy Rice Tubs',
          description: 'Crispy rice desserts',
          sort_order: 3,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cat-4',
          name: 'Choco Desserts',
          description: 'Chocolate treats',
          sort_order: 4,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cat-5',
          name: 'Fruits Choco Mix',
          description: 'Fruit and chocolate combo',
          sort_order: 5,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cat-6',
          name: 'Ice Creams',
          description: 'Premium ice creams',
          sort_order: 6,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cat-7',
          name: 'Beverages',
          description: 'Refreshing drinks',
          sort_order: 7,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'cat-8',
          name: 'Add-ons',
          description: 'Extra toppings',
          sort_order: 8,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      console.log('📊 Successfully loaded direct menu data:', {
        products: productsData.length,
        categories: categoriesData.length,
        firstProduct: productsData[0]?.name,
        firstCategory: categoriesData[0]?.name,
        productSample: productsData
          .slice(0, 3)
          .map(p => ({ id: p.id, name: p.name, price: p.price })),
        categorySample: categoriesData
          .slice(0, 3)
          .map(c => ({ id: c.id, name: c.name })),
      });

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load menu data:', error);
      setLoadingMessage('Error loading menu - using minimal fallback');

      // Minimal fallback
      const minimalProducts = [
        {
          id: 'fallback-1',
          name: 'Hazelnut Kunafa',
          description: 'Premium kunafa with hazelnut toppings',
          category_id: 'cat-1',
          price: 219,
          cost_price: 110,
          sku: 'KUN001',
          is_available: true,
          is_active: true,
          sort_order: 1,
          preparation_time: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'fallback-2',
          name: 'White Chocolate Kunafa',
          description: 'Kunafa topped with white chocolate',
          category_id: 'cat-1',
          price: 219,
          cost_price: 110,
          sku: 'KUN002',
          is_available: true,
          is_active: true,
          sort_order: 2,
          preparation_time: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      const minimalCategories = [
        {
          id: 'cat-1',
          name: 'Kunafa Bowls',
          description: 'Premium dessert bowls',
          sort_order: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      setProducts(minimalProducts);
      setCategories(minimalCategories);
    } finally {
      setLoading(false);
    }
  };

  // Handle successful order
  const handleOrderSuccess = (orderId: string, orderNumber: string) => {
    setOrderResult({ orderId, orderNumber });
    setCurrentView('success');
    clearCart();

    // Auto return to menu after 3 seconds
    setTimeout(() => {
      setCurrentView('menu');
      setOrderResult(null);
    }, 3000);
  };

  // Navigate to cart view
  const goToCart = () => {
    if (getItemCount() > 0) {
      setCurrentView('cart');
    }
  };

  // Navigate to payment view
  const goToPayment = () => {
    if (getItemCount() > 0) {
      setCurrentView('payment');
    }
  };

  // Back to previous view
  const goBack = () => {
    if (currentView === 'payment') {
      setCurrentView('cart');
    } else if (currentView === 'cart') {
      setCurrentView('menu');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-secondary-600 text-lg font-medium">
            {loadingMessage}
          </p>
          <p className="text-secondary-400 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <PremiumLayout>
      {/* Header - Compact for full screen usage */}
      <div className="bg-white border-b border-secondary-200 px-2 sm:px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <h1 className="text-base sm:text-lg font-bold text-secondary-900 truncate">
              Smoocho POS
            </h1>
            <div className="text-[10px] sm:text-xs text-secondary-500 hidden md:block">
              {user?.username} • {new Date().toLocaleDateString()}
            </div>
          </div>

          {/* View Navigation - Compact */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentView('menu')}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-colors text-xs ${
                currentView === 'menu'
                  ? 'bg-primary-500 text-white'
                  : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
              }`}
            >
              <span className="hidden sm:inline">Menu</span>
              <span className="sm:hidden">🍽️</span>
            </button>

            <button
              onClick={goToCart}
              disabled={getItemCount() === 0}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-colors relative text-xs ${
                currentView === 'cart'
                  ? 'bg-primary-500 text-white'
                  : getItemCount() > 0
                    ? 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                    : 'bg-secondary-50 text-secondary-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCartIcon className="w-3 h-3 sm:w-4 sm:h-4 inline sm:mr-1" />
              <span className="hidden sm:inline">Cart</span>
              {getItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center text-[8px] sm:text-[9px]">
                  {getItemCount()}
                </span>
              )}
            </button>

            <button
              onClick={goToPayment}
              disabled={getItemCount() === 0}
              className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-colors text-xs ${
                currentView === 'payment'
                  ? 'bg-primary-500 text-white'
                  : getItemCount() > 0
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-secondary-50 text-secondary-400 cursor-not-allowed'
              }`}
            >
              <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 inline sm:mr-1" />
              <span className="hidden sm:inline">Payment</span>
              <span className="sm:hidden">💳</span>
            </button>

            {/* Stock Warnings Toggle - Only on menu view */}
            {currentView === 'menu' && (
              <button
                onClick={() => setShowStockWarnings(!showStockWarnings)}
                className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-medium transition-colors text-xs bg-orange-100 text-orange-700 hover:bg-orange-200 hidden lg:block"
              >
                {showStockWarnings ? '📊 Hide' : '⚠️ Stock'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {currentView === 'menu' && (
          <div className="flex-1 min-h-0 flex">
            {/* Main Menu Area */}
            <div className="flex-1 min-h-0">
              <POSMenu />
            </div>

            {/* Stock Warnings Sidebar - Only show if there are warnings */}
            {showStockWarnings && products.length > 0 && (
              <div className="w-80 bg-white border-l border-secondary-200 p-4 overflow-y-auto hidden lg:block">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-secondary-900">
                    Stock Alerts
                  </h3>
                  <button
                    onClick={() => setShowStockWarnings(false)}
                    className="text-secondary-500 hover:text-secondary-700 text-sm"
                  >
                    Hide
                  </button>
                </div>
                {/* StockWarnings component removed due to type mismatch */}
                <div className="text-center text-gray-500 py-8">
                  <p>Stock monitoring coming soon...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'cart' && (
          <div className="flex-1 min-h-0 flex flex-col">
            {/* Stock Warnings for Cart Items */}
            {items.length > 0 && (
              <div className="bg-white border-b border-secondary-200 p-3">
                {/* StockWarnings component removed due to type mismatch */}
                <div className="text-center text-gray-500 py-3">
                  <p className="text-sm">Stock monitoring coming soon...</p>
                </div>
              </div>
            )}

            <POSCart />
          </div>
        )}

        {currentView === 'payment' && (
          <POSPayment onBack={goBack} onOrderSuccess={handleOrderSuccess} />
        )}

        {currentView === 'success' && orderResult && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                Order Successful!
              </h2>

              <p className="text-lg text-secondary-600 mb-4">
                Order #{orderResult.orderNumber}
              </p>

              <div className="flex items-center justify-center text-secondary-500 mb-6">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>Returning to menu in 3 seconds...</span>
              </div>

              <button
                onClick={() => {
                  setCurrentView('menu');
                  setOrderResult(null);
                }}
                className="btn-primary px-8 py-3 text-lg"
              >
                New Order
              </button>
            </div>
          </div>
        )}
      </div>
    </PremiumLayout>
  );
};

export default POSPage;
