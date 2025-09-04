"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  Settings, 
  Bot,
  Home,
  Wifi,
  WifiOff,
  History
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isCollapsed?: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Order History', href: '/order-history', icon: History },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Menu Editor', href: '/menu-editor', icon: Settings },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'AI Assistant', href: '/ai', icon: Bot },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar({ isCollapsed = false }: SidebarProps) {
  const pathname = usePathname()
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

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 shadow-sm",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Smoocho</h1>
              <p className="text-xs text-gray-500">Premium POS</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "sidebar-item",
                isActive ? "sidebar-item-active" : "sidebar-item-inactive"
              )}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {!isCollapsed && item.name}
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          {!isCollapsed && (
            <span className="text-xs text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
