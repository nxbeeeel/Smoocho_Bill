import React, { useState, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon, Cog6ToothIcon, ChartBarIcon, ClipboardDocumentListIcon, HomeIcon, BellIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import POSMenu from './POSMenu';
import POSCart from './POSCart';
import POSPayment from './POSPayment';
import { motion, AnimatePresence } from 'framer-motion';
import { useResponsive } from '../../hooks/useResponsive';

const POSPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'menu' | 'cart' | 'payment'>('menu');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { items } = useCartStore();
  
  // Use responsive hook
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Sample alerts - replace with real alert system later
  const [alerts] = useState([
    { id: 1, type: 'info', message: 'New menu items added today!', icon: InformationCircleIcon },
    { id: 2, type: 'warning', message: 'Low stock on Chicken Biryani', icon: ExclamationTriangleIcon },
    { id: 3, type: 'success', message: 'Order #123 completed successfully', icon: CheckCircleIcon }
  ]);

  // Auto-open sidebar on desktop
  useEffect(() => {
    if (isDesktop) {
      setIsSidebarOpen(true);
    } else {
      setIsSidebarOpen(false);
    }
  }, [isDesktop]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Alert component
  const AlertBanner = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BellIcon className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">System Alerts</span>
        </div>
        <div className="flex items-center space-x-2">
          {alerts.slice(0, 2).map((alert) => (
            <div key={alert.id} className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              alert.type === 'info' ? 'bg-blue-100 text-blue-700' :
              alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              <alert.icon className="w-3 h-3" />
              <span className="truncate max-w-24">{alert.message}</span>
            </div>
          ))}
          {alerts.length > 2 && (
            <span className="text-xs text-blue-600 font-medium">+{alerts.length - 2} more</span>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
        {/* Alert Banner */}
        <AlertBanner />
        
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Smoocho POS</h1>
          </div>
          
          {/* Mobile Cart Indicator */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('cart')}
              className="relative p-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {items.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">POS System</h2>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Mobile Navigation Tabs */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button
                    onClick={() => setActiveTab('menu')}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'menu'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Menu
                  </button>
                  <button
                    onClick={() => setActiveTab('cart')}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'cart'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Cart ({items.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('payment')}
                    className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'payment'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Payment
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="px-4 pb-4">
                <div className="space-y-2">
                  <button className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Recent Orders</span>
                  </button>
                  <button className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                    <ChartBarIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Sales Report</span>
                  </button>
                  <button className="w-full p-3 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                    <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Settings</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <POSMenu />
              </motion.div>
            )}
            
            {activeTab === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <POSCart />
              </motion.div>
            )}
            
            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <POSPayment onBack={() => setActiveTab('cart')} onOrderSuccess={() => setActiveTab('menu')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSidebar}
          />
        )}
      </div>
    );
  }

  // Tablet Layout - OPTIMIZED FOR BETTER FIT
  if (isTablet) {
    return (
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        {/* Tablet Sidebar - Fixed Width */}
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">POS System</h2>
          </div>

          {/* Tablet Navigation */}
          <div className="p-4">
            <div className="space-y-2 mb-6">
              <button
                onClick={() => setActiveTab('menu')}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <HomeIcon className="w-5 h-5" />
                  <span className="font-medium">Menu</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('cart')}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'cart'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span className="font-medium">Cart ({items.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  activeTab === 'payment'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ChartBarIcon className="w-5 h-5" />
                  <span className="font-medium">Payment</span>
                </div>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button className="w-full p-2 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2">
                <ClipboardDocumentListIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Recent Orders</span>
              </button>
              <button className="w-full p-2 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2">
                <ChartBarIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Sales Report</span>
              </button>
              <button className="w-full p-2 text-left rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors flex items-center space-x-2">
                <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Settings</span>
              </button>
            </div>
          </div>

          {/* Cart Summary for Tablet */}
          <div className="mt-auto p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-center mb-3">
              <div className="text-sm text-gray-600">Total Items</div>
              <div className="text-2xl font-bold text-primary-600">{items.length}</div>
            </div>
            <button
              onClick={() => setActiveTab('cart')}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm"
            >
              View Cart Details
            </button>
          </div>
        </div>

        {/* Tablet Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Alert Banner */}
          <AlertBanner />
          
          {/* Tablet Header - Compact */}
          <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">Smoocho POS</h1>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Mode
              </div>
            </div>
            
            {/* Tablet Cart Summary */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-gray-600">Items in Cart</div>
                <div className="text-lg font-bold text-primary-600">{items.length}</div>
              </div>
              <button
                onClick={() => setActiveTab('cart')}
                className="px-3 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
              >
                Cart
              </button>
            </div>
          </div>

          {/* Tablet Content - Optimized for better fit */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence mode="wait">
              {activeTab === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <POSMenu />
                </motion.div>
              )}
              
              {activeTab === 'cart' && (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <POSCart />
                </motion.div>
              )}
              
              {activeTab === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <POSPayment onBack={() => setActiveTab('cart')} onOrderSuccess={() => setActiveTab('menu')} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">POS System</h2>
        </div>

        {/* Desktop Cart View */}
        <div className="flex-1 overflow-y-auto p-6">
          <POSCart />
        </div>
      </div>

      {/* Desktop Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Alert Banner */}
        <AlertBanner />
        
        {/* Desktop Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex space-x-8 px-8">
            <button
              onClick={() => setActiveTab('menu')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'menu'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setActiveTab('cart')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cart'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cart ({items.length})
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'payment'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300'
              }`}
            >
              Payment
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'menu' && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <POSMenu />
              </motion.div>
            )}
            
            {activeTab === 'cart' && (
              <motion.div
                key="cart"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-4xl mx-auto">
                  <POSCart />
                </div>
              </motion.div>
            )}
            
            {activeTab === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="max-w-4xl mx-auto">
                  <POSPayment onBack={() => setActiveTab('cart')} onOrderSuccess={() => setActiveTab('menu')} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default POSPage;
