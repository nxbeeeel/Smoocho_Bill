import React, { ReactNode } from 'react';
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  ChartBarIcon, 
  CogIcon, 
  BellIcon,
  UserIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useNavigate, useLocation } from 'react-router-dom';

interface PremiumLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const PremiumLayout: React.FC<PremiumLayoutProps> = ({ 
  children, 
  title = 'Smoocho POS', 
  showBackButton = false,
  onBack 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Debug logging
  console.log('🔍 PremiumLayout rendering:', { title, location: location.pathname });

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
    { name: 'POS', href: '/pos', icon: ShoppingCartIcon, current: location.pathname === '/pos' },
    { name: 'Menu Editor', href: '/menu-editor', icon: PencilIcon, current: location.pathname === '/menu-editor' },
    { name: 'Inventory', href: '/inventory', icon: CubeIcon, current: location.pathname === '/inventory' },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon, current: location.pathname === '/reports' },
    { name: 'Integrations', href: '/integrations', icon: CogIcon, current: location.pathname === '/integrations' },
    { name: 'Updates', href: '/updates', icon: CloudArrowUpIcon, current: location.pathname === '/updates' },
    { name: 'Settings', href: '/settings', icon: CogIcon, current: location.pathname === '/settings' },
  ];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* 🌟 Premium Header */}
      <header className="bg-white shadow-lg border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <ArrowLeftIcon className="w-6 h-6 text-neutral-600" />
                </button>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">🍰</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
                  <p className="text-sm text-neutral-500">Professional POS System</p>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <BellIcon className="w-6 h-6 text-neutral-600" />
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neutral-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-neutral-700">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 🌟 Premium Sidebar */}
        <nav className="w-64 bg-white shadow-xl border-r border-neutral-200 min-h-screen">
          <div className="p-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      item.current
                        ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500 shadow-sm'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <Icon 
                      className={`w-6 h-6 transition-colors duration-200 ${
                        item.current ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'
                      }`} 
                    />
                    <span className="text-sm">{item.name}</span>
                  </a>
                );
              })}
            </div>

            {/* 🌟 System Status */}
            <div className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-emerald-800">System Online</span>
              </div>
              <p className="text-xs text-emerald-600 mt-1">All services running smoothly</p>
            </div>

            {/* 🌟 Quick Stats */}
            <div className="mt-4 space-y-2">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Today's Sales</span>
                  <span className="text-sm font-semibold text-neutral-900">₹12,450</span>
                </div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">Orders</span>
                  <span className="text-sm font-semibold text-neutral-900">24</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* 🌟 Main Content Area */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* 🌟 Premium Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-500">© 2024 Smoocho POS System</span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-sm text-neutral-500">Version 2.0.0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-xs text-neutral-400">Offline Mode: Active</span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-400">Sync: Real-time</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PremiumLayout;