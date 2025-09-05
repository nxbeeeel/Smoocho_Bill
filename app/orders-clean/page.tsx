'use client'

import React, { useState } from 'react'
import { useOrders } from '@/src/presentation'
import { Order } from '@/src/domain'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export default function CleanOrdersPage() {
  const { toast } = useToast()
  const { orders, loading, updateOrderStatus, deleteOrder } = useOrders()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'All' || order.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (order: Order, newStatus: 'pending' | 'completed' | 'failed') => {
    const success = await updateOrderStatus(order.id.value, newStatus)
    if (success) {
      toast({
        title: "Status Updated",
        description: `Order ${order.orderNumber.value} status updated to ${newStatus}`,
      })
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive"
      })
    }
  }

  const handleDeleteOrder = async (order: Order) => {
    if (confirm(`Are you sure you want to delete order ${order.orderNumber.value}?`)) {
      const success = await deleteOrder(order.id.value)
      if (success) {
        toast({
          title: "Order Deleted",
          description: `Order ${order.orderNumber.value} has been deleted`,
        })
      } else {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete order",
          variant: "destructive"
        })
      }
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default'
      case 'pending': return 'secondary'
      case 'failed': return 'destructive'
      default: return 'outline'
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash': return 'Cash'
      case 'card': return 'Card'
      case 'upi': return 'UPI'
      default: return method
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
              <p className="text-sm text-gray-600">Clean Architecture Implementation</p>
            </div>
            <Badge variant="outline" className="text-sm">
              {orders.length} Total Orders
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card key={order.id.value} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{order.orderNumber.value}</h3>
                        <p className="text-sm text-gray-600">
                          {order.createdAt.toLocaleDateString()} at {order.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
                          {order.paymentStatus}
                        </Badge>
                        <Badge variant="outline">
                          {getPaymentMethodBadge(order.paymentMethod)}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Items</p>
                        <p className="text-sm text-gray-600">{order.getItemCount()} items</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Total</p>
                        <p className="text-sm text-gray-600">₹{order.total.value.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Type</p>
                        <p className="text-sm text-gray-600 capitalize">{order.orderType}</p>
                      </div>
                    </div>

                    {order.hasCustomerInfo() && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-700">Customer Info</p>
                        {order.customerName && (
                          <p className="text-sm text-gray-600">Name: {order.customerName}</p>
                        )}
                        {order.customerPhone && (
                          <p className="text-sm text-gray-600">Phone: {order.customerPhone}</p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        {order.paymentStatus !== 'completed' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order, 'completed')}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {order.paymentStatus !== 'failed' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusUpdate(order, 'failed')}
                          >
                            Mark Failed
                          </Button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteOrder(order)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No orders found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
