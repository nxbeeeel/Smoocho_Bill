import React from 'react';
import { 
  ArrowTrendingUpIcon as TrendingUpIcon, 
  ShoppingCartIcon, 
  CubeIcon, 
  CurrencyDollarIcon as CurrencyRupeeIcon,
  UsersIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const PremiumDashboard: React.FC = () => {
  // Mock data for demonstration
  const stats = [
    {
      name: 'Today\'s Sales',
      value: '₹12,450',
      change: '+12.5%',
      changeType: 'positive',
      icon: TrendingUpIcon,
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      name: 'Total Orders',
      value: '24',
      change: '+8.2%',
      changeType: 'positive',
      icon: ShoppingCartIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Inventory Items',
      value: '156',
      change: '-2.1%',
      changeType: 'negative',
      icon: CubeIcon,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Revenue',
      value: '₹89,240',
      change: '+15.3%',
      changeType: 'positive',
      icon: CurrencyRupeeIcon,
      color: 'from-amber-500 to-amber-600'
    }
  ];

  const recentOrders = [
    { id: '#001', customer: 'John Doe', amount: '₹450', status: 'completed', time: '2 min ago' },
    { id: '#002', customer: 'Jane Smith', amount: '₹320', status: 'pending', time: '5 min ago' },
    { id: '#003', customer: 'Mike Johnson', amount: '₹680', status: 'completed', time: '8 min ago' },
    { id: '#004', customer: 'Sarah Wilson', amount: '₹290', status: 'processing', time: '12 min ago' }
  ];

  const lowStockItems = [
    { name: 'Chocolate Chips', current: 5, threshold: 10, status: 'critical' },
    { name: 'Vanilla Extract', current: 8, threshold: 15, status: 'warning' },
    { name: 'Butter', current: 3, threshold: 20, status: 'critical' },
    { name: 'Flour', current: 12, threshold: 25, status: 'warning' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-neutral-100 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 🌟 Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-primary-100 text-lg">Your Smoocho POS system is running perfectly</p>
          </div>
          <div className="hidden lg:block">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🍰</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-lg border border-neutral-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-neutral-500 ml-1">from yesterday</span>
                  </div>
                </div>
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🌟 Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-neutral-200">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <ShoppingCartIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">{order.customer}</p>
                      <p className="text-sm text-neutral-500">{order.id} • {order.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-neutral-900">{order.amount}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                <ShoppingCartIcon className="w-5 h-5" />
                <span>New Order</span>
              </button>
              <button className="w-full bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                <CubeIcon className="w-5 h-5" />
                <span>Add Inventory</span>
              </button>
              <button className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-700 transition-colors duration-200 flex items-center justify-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>View Reports</span>
              </button>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Low Stock Alerts</h3>
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ExclamationTriangleIcon className={`w-5 h-5 ${
                      item.status === 'critical' ? 'text-red-500' : 'text-amber-500'
                    }`} />
                    <div>
                      <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                      <p className="text-xs text-neutral-500">
                        {item.current} / {item.threshold} units
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStockStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-neutral-900">System Status</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">Online</p>
          <p className="text-sm text-neutral-500 mt-1">All services operational</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-neutral-900">Uptime</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-2">99.9%</p>
          <p className="text-sm text-neutral-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
          <div className="flex items-center space-x-3">
            <UsersIcon className="w-5 h-5 text-purple-500" />
            <span className="font-medium text-neutral-900">Active Users</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-2">3</p>
          <p className="text-sm text-neutral-500 mt-1">Currently online</p>
        </div>
      </div>

      {/* 🌟 Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">98.5%</p>
            <p className="text-sm text-neutral-500">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ClockIcon className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">0.8s</p>
            <p className="text-sm text-neutral-500">Avg Response</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUpIcon className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">+15.2%</p>
            <p className="text-sm text-neutral-500">Growth</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CubeIcon className="w-8 h-8 text-amber-600" />
            </div>
            <p className="text-2xl font-bold text-neutral-900">156</p>
            <p className="text-sm text-neutral-500">Products</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumDashboard;
