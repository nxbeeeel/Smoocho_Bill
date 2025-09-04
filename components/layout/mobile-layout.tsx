'use client'

import React from 'react'
import { 
  Home, 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Menu as MenuIcon,
  History,
  Bot,
  X,
  MoreHorizontal,
  Wifi,
  WifiOff,
  User
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: React.ReactNode
}

// Primary navigation items (always visible in bottom nav)
const primaryNavigationItems = [
  { name: 'Home', href: '/', icon: Home, shortName: 'Home' },
  { name: 'POS', href: '/pos', icon: ShoppingCart, shortName: 'POS' },
  { name: 'Menu', href: '/menu-editor', icon: MenuIcon, shortName: 'Menu' },
  { name: 'Inventory', href: '/inventory', icon: Package, shortName: 'Stock' },
]

// Secondary navigation items (in collapsible sidebar)
const secondaryNavigationItems = [
  { name: 'Order History', href: '/order-history', icon: History, description: 'View all orders' },
  { name: 'Reports', href: '/reports', icon: BarChart3, description: 'Analytics & insights' },
  { name: 'AI Assistant', href: '/ai', icon: Bot, description: 'Smart assistance' },
  { name: 'Settings', href: '/settings', icon: Settings, description: 'App configuration' },
]

export function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [isOnline, setIsOnline] = React.useState(true)

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smoocho Bill</h1>
              <p className="text-xs text-gray-600">Premium POS System</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Online Status */}
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100">
              {isOnline ? (
                <Wifi className="h-3 w-3 text-green-500" />
              ) : (
                <WifiOff className="h-3 w-3 text-red-500" />
              )}
              <span className="text-xs text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* More Options Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              title="More options"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with better spacing */}
      <main className="px-4 py-4 min-h-[calc(100vh-140px)]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Enhanced Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="px-2 py-2">
          <div className="flex items-center justify-around">
            {primaryNavigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center px-3 py-2 rounded-lg min-w-0 flex-1 transition-all duration-200",
                    isActive 
                      ? "bg-blue-50 text-blue-600 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    isActive ? "bg-blue-100" : "bg-gray-100"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium truncate mt-1">{item.shortName}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Collapsible Sidebar */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">More Options</h2>
                  <p className="text-sm text-gray-600">Additional features</p>
                </div>
                <button
                  onClick={closeSidebar}
                  className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-2">
                  {secondaryNavigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeSidebar}
                        className={cn(
                          "flex items-center px-4 py-3 rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-blue-50 text-blue-600 border border-blue-200" 
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        <div className="flex-1">
                          <span className="font-medium block">{item.name}</span>
                          <span className="text-sm text-gray-500">{item.description}</span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-center gap-2 text-gray-500">
                  <User className="h-4 w-4" />
                  <span className="text-sm">Admin User</span>
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs text-gray-400">Tap outside to close</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
