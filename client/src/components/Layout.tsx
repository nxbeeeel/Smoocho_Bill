import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import {
  HomeIcon,
  ShoppingCartIcon,
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    {
      name: 'POS',
      href: '/pos',
      icon: ShoppingCartIcon,
      badge: getItemCount(),
    },
    { name: 'Orders', href: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Inventory', href: '/inventory', icon: ArchiveBoxIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-72 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-secondary-200">
          <div className="flex items-center flex-shrink-0 px-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-secondary-900">
                  Smoocho Bill
                </h1>
                <p className="text-sm text-secondary-500">POS System</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex-grow flex flex-col">
            <nav className="flex-1 px-4 space-y-2">
              {navigation.map(item => {
                const isActive = location.pathname === item.href;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`
                      group flex items-center px-3 py-3 text-base font-medium rounded-lg transition-colors duration-200
                      min-h-touch touch-feedback
                      ${
                        isActive
                          ? 'bg-primary-50 text-primary-700 border-r-4 border-primary-500'
                          : 'text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-4 flex-shrink-0 h-6 w-6
                        ${isActive ? 'text-primary-500' : 'text-secondary-400 group-hover:text-secondary-500'}
                      `}
                    />
                    {item.name}
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="flex-shrink-0 p-4 border-t border-secondary-200">
              <div className="flex items-center">
                <UserCircleIcon className="w-10 h-10 text-secondary-400" />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-secondary-900">
                    {user?.username}
                  </p>
                  <p className="text-xs text-secondary-500 capitalize">
                    {user?.role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-2 text-secondary-400 hover:text-secondary-600 rounded-lg hover:bg-secondary-100"
                  title="Logout"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 px-4 py-2 z-30">
        <div className="flex justify-around">
          {navigation.slice(0, 4).map(item => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  flex flex-col items-center p-2 rounded-lg min-h-touch min-w-touch relative
                  ${isActive ? 'text-primary-600' : 'text-secondary-500'}
                `}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
          <div className="py-6 px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
