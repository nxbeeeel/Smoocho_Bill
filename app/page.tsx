"use client"

import React from 'react'
import Link from 'next/link'
import { 
  ShoppingCart, 
  Package, 
  BarChart3, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'

export default function Dashboard() {
  const [stats] = React.useState({
    todaySales: 15420,
    todayOrders: 47,
    lowStockItems: 3,
    activeUsers: 2
  })

  const [recentOrders] = React.useState([
    { id: 'SMO240101001', total: 299, time: '2 mins ago', status: 'completed' },
    { id: 'SMO240101002', total: 450, time: '5 mins ago', status: 'completed' },
    { id: 'SMO240101003', total: 199, time: '8 mins ago', status: 'completed' }
  ])

  const [lowStockItems] = React.useState([
    { name: 'Milk', current: 2, threshold: 5, unit: 'liters' },
    { name: 'Sugar', current: 3, threshold: 5, unit: 'kg' },
    { name: 'Vanilla Extract', current: 1, threshold: 3, unit: 'bottles' }
  ])

  return (
    <ResponsiveLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600">Welcome to Smoocho Premium POS System</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.todaySales)}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-muted-foreground">
                +8% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Currently online
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/pos">
            <Button className="w-full h-20 flex flex-col space-y-2 bg-blue-600 hover:bg-blue-700">
              <ShoppingCart className="h-6 w-6" />
              <span>Start Billing</span>
            </Button>
          </Link>

          <Link href="/inventory">
            <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
              <Package className="h-6 w-6" />
              <span>Manage Inventory</span>
            </Button>
          </Link>

          <Link href="/reports">
            <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>View Reports</span>
            </Button>
          </Link>

          <Link href="/menu-editor">
            <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
              <TrendingUp className="h-6 w-6" />
              <span>Menu Editor</span>
            </Button>
          </Link>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest transactions from today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">#{order.id}</p>
                        <p className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {order.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(order.total)}</p>
                      <p className="text-xs text-green-600 capitalize">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/reports">
                  <Button variant="outline" className="w-full">View All Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                Low Stock Alerts
              </CardTitle>
              <CardDescription>Items that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems.map((item, index) => (
                  <div key={item.name || `low-stock-${index}`} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Threshold: {item.threshold} {item.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {item.current} {item.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">remaining</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Link href="/inventory">
                  <Button variant="outline" className="w-full">Manage Stock</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
