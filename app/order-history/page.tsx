'use client'

import React, { useState, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, Order, OrderItem, Product } from '@/lib/database'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Printer, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  Phone,
  FileText,
  X,
  Save,
  Plus,
  Minus
} from 'lucide-react'

export default function OrderHistoryPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  // Fetch orders from database
  const orders = useLiveQuery(() => db.orders.orderBy('createdAt').reverse().toArray()) || []
  const products = useLiveQuery(() => db.products.toArray()) || []

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.includes(searchTerm) ||
      order.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filterStatus === 'all' || order.paymentStatus === filterStatus
    const matchesPaymentMethod = filterPaymentMethod === 'all' || order.paymentMethod === filterPaymentMethod

    return matchesSearch && matchesStatus && matchesPaymentMethod
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
    setIsEditing(false)
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder({ ...order })
    setSelectedOrder(order)
    setShowOrderModal(true)
    setIsEditing(true)
  }

  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        await db.orders.delete(orderId)
        toast({
          title: "Order Deleted",
          description: "Order has been successfully deleted.",
        })
      } catch (error) {
        console.error('Error deleting order:', error)
        toast({
          title: "Error",
          description: "Failed to delete order. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  const handlePrintOrder = (order: Order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; }
            .items-table th { background-color: #f0f0f0; }
            .totals { text-align: right; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Order Receipt</h1>
            <h2>Order #${order.orderNumber}</h2>
          </div>
          
          <div class="order-info">
            <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
            ${order.customerName ? `<p><strong>Customer:</strong> ${order.customerName}</p>` : ''}
            ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ''}
            <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
            <p><strong>Status:</strong> ${order.paymentStatus.toUpperCase()}</p>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <p><strong>Subtotal:</strong> ${formatCurrency(order.subtotal)}</p>
            ${order.discount > 0 ? `<p><strong>Discount:</strong> ${order.discountType === 'percentage' ? order.discount + '%' : formatCurrency(order.discount)}</p>` : ''}
            <p><strong>Tax:</strong> ${formatCurrency(order.tax)}</p>
            <p><strong>Total:</strong> ${formatCurrency(order.total)}</p>
          </div>

          ${order.notes ? `<div class="notes"><p><strong>Notes:</strong> ${order.notes}</p></div>` : ''}

          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleUpdateOrderItem = (itemIndex: number, field: keyof OrderItem, value: any) => {
    if (!editingOrder) return

    const updatedItems = [...editingOrder.items]
    const item = updatedItems[itemIndex]

    if (field === 'quantity') {
      item.quantity = Math.max(1, parseInt(value) || 1)
      item.total = item.quantity * item.price
    } else if (field === 'price') {
      item.price = parseFloat(value) || 0
      item.total = item.quantity * item.price
    } else if (field === 'productId') {
      const product = products.find(p => p.id === parseInt(value))
      if (product) {
        item.productId = product.id!
        item.productName = product.name
        item.price = product.price
        item.total = item.quantity * product.price
      }
    }

    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = editingOrder.discountType === 'percentage' 
      ? (subtotal * editingOrder.discount) / 100 
      : editingOrder.discount
    const tax = (subtotal - discountAmount) * 0.18 // 18% GST
    const total = subtotal - discountAmount + tax

    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      subtotal,
      tax,
      total
    })
  }

  const handleAddOrderItem = () => {
    if (!editingOrder || products.length === 0) return

    const firstProduct = products[0]
    const newItem: OrderItem = {
      productId: firstProduct.id!,
      productName: firstProduct.name,
      quantity: 1,
      price: firstProduct.price,
      total: firstProduct.price
    }

    const updatedItems = [...editingOrder.items, newItem]
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = editingOrder.discountType === 'percentage' 
      ? (subtotal * editingOrder.discount) / 100 
      : editingOrder.discount
    const tax = (subtotal - discountAmount) * 0.18
    const total = subtotal - discountAmount + tax

    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      subtotal,
      tax,
      total
    })
  }

  const handleRemoveOrderItem = (itemIndex: number) => {
    if (!editingOrder) return

    const updatedItems = editingOrder.items.filter((_, index) => index !== itemIndex)
    if (updatedItems.length === 0) return

    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0)
    const discountAmount = editingOrder.discountType === 'percentage' 
      ? (subtotal * editingOrder.discount) / 100 
      : editingOrder.discount
    const tax = (subtotal - discountAmount) * 0.18
    const total = subtotal - discountAmount + tax

    setEditingOrder({
      ...editingOrder,
      items: updatedItems,
      subtotal,
      tax,
      total
    })
  }

  const handleSaveOrder = async () => {
    if (!editingOrder) return

    try {
      await db.orders.update(editingOrder.id!, {
        ...editingOrder,
        updatedAt: new Date()
      })

      toast({
        title: "Order Updated",
        description: "Order has been successfully updated.",
      })

      setShowOrderModal(false)
      setEditingOrder(null)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating order:', error)
      toast({
        title: "Error",
        description: "Failed to update order. Please try again.",
        variant: "destructive"
      })
    }
  }

  const closeModal = () => {
    setShowOrderModal(false)
    setSelectedOrder(null)
    setEditingOrder(null)
    setIsEditing(false)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
            <p className="text-gray-600">Manage and view all orders</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Total Orders: {orders.length}</span>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payment Methods</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="h-4 w-4" />
                <span>{filteredOrders.length} orders</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== 'all' || filterPaymentMethod !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'No orders have been created yet'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {order.paymentStatus.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {order.paymentMethod.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-medium">{formatCurrency(order.total)}</span>
                        </div>
                        {order.customerName && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{order.customerName}</span>
                          </div>
                        )}
                        {order.customerPhone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{order.customerPhone}</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}: {order.items.map(item => `${item.productName} (${item.quantity})`).join(', ')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrder(order)}
                        title="View order details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditOrder(order)}
                        title="Edit order"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePrintOrder(order)}
                        title="Print order"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteOrder(order.id!)}
                        title="Delete order"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Order Modal */}
        {showOrderModal && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">
                    {isEditing ? 'Edit Order' : 'Order Details'} - #{selectedOrder.orderNumber}
                  </h2>
                  <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {isEditing && editingOrder ? (
                  <div className="space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Customer Name</Label>
                        <Input
                          value={editingOrder.customerName || ''}
                          onChange={(e) => setEditingOrder({...editingOrder, customerName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>Customer Phone</Label>
                        <Input
                          value={editingOrder.customerPhone || ''}
                          onChange={(e) => setEditingOrder({...editingOrder, customerPhone: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Order Items</h3>
                        <Button onClick={handleAddOrderItem} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {editingOrder.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                            <div className="flex-1">
                              <Select
                                value={item.productId.toString()}
                                onValueChange={(value) => handleUpdateOrderItem(index, 'productId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map(product => (
                                    <SelectItem key={product.id} value={product.id!.toString()}>
                                      {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-20">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateOrderItem(index, 'quantity', e.target.value)}
                              />
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => handleUpdateOrderItem(index, 'price', e.target.value)}
                              />
                            </div>
                            <div className="w-24 text-right font-medium">
                              {formatCurrency(item.total)}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveOrderItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-right">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(editingOrder.subtotal)}</span>
                        </div>
                        {editingOrder.discount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>{editingOrder.discountType === 'percentage' ? editingOrder.discount + '%' : formatCurrency(editingOrder.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tax (18%):</span>
                          <span>{formatCurrency(editingOrder.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(editingOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <Label>Notes</Label>
                      <Input
                        value={editingOrder.notes || ''}
                        onChange={(e) => setEditingOrder({...editingOrder, notes: e.target.value})}
                        placeholder="Add any notes..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveOrder}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Order Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Date</Label>
                        <p className="text-sm text-gray-600">{formatDate(selectedOrder.createdAt)}</p>
                      </div>
                      <div>
                        <Label>Payment Method</Label>
                        <p className="text-sm text-gray-600">{selectedOrder.paymentMethod.toUpperCase()}</p>
                      </div>
                      <div>
                        <Label>Status</Label>
                        <p className="text-sm text-gray-600">{selectedOrder.paymentStatus.toUpperCase()}</p>
                      </div>
                      <div>
                        <Label>Total</Label>
                        <p className="text-sm font-medium">{formatCurrency(selectedOrder.total)}</p>
                      </div>
                      {selectedOrder.customerName && (
                        <div>
                          <Label>Customer Name</Label>
                          <p className="text-sm text-gray-600">{selectedOrder.customerName}</p>
                        </div>
                      )}
                      {selectedOrder.customerPhone && (
                        <div>
                          <Label>Customer Phone</Label>
                          <p className="text-sm text-gray-600">{selectedOrder.customerPhone}</p>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity} × {formatCurrency(item.price)}</p>
                            </div>
                            <p className="font-medium">{formatCurrency(item.total)}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="space-y-2 text-right">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount:</span>
                            <span>{selectedOrder.discountType === 'percentage' ? selectedOrder.discount + '%' : formatCurrency(selectedOrder.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>{formatCurrency(selectedOrder.tax)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total:</span>
                          <span>{formatCurrency(selectedOrder.total)}</span>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.notes && (
                      <div>
                        <Label>Notes</Label>
                        <p className="text-sm text-gray-600">{selectedOrder.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={closeModal}>
                        Close
                      </Button>
                      <Button variant="outline" onClick={() => handlePrintOrder(selectedOrder)}>
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                      </Button>
                      <Button onClick={() => handleEditOrder(selectedOrder)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Order
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
