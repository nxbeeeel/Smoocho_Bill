"use client"

import React from 'react'
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Search,
  Download,
  Upload,
  Calendar,
  TrendingUp,
  X,
  Filter
} from 'lucide-react'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, formatDate, isLowStock, isExpiringSoon } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { db } from '@/lib/database'
import { useLiveQuery } from 'dexie-react-hooks'

interface FormData {
  name: string
  quantity: string
  unit: string
  costPerUnit: string
  threshold: string
  category: string
  supplier: string
  expiryDate: string
}

export default function InventoryPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [showAddModal, setShowAddModal] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<any>(null)
  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    quantity: '',
    unit: '',
    costPerUnit: '',
    threshold: '',
    category: '',
    supplier: '',
    expiryDate: ''
  })

  // Live query for inventory data
  const inventory = useLiveQuery(() => db.inventory.toArray()) || []

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(inventory.map(item => item.category).filter(Boolean)))]

  // Calculate stats
  const lowStockItems = inventory.filter(item => isLowStock(item.quantity, item.threshold))
  const expiringItems = inventory.filter(item => isExpiringSoon(item.expiryDate))
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0)

  const resetForm = () => {
    setFormData({
      name: '',
      quantity: '',
      unit: '',
      costPerUnit: '',
      threshold: '',
      category: '',
      supplier: '',
      expiryDate: ''
    })
  }

  const openAddModal = () => {
    resetForm()
    setEditingItem(null)
    setShowAddModal(true)
  }

  const openEditModal = (item: any) => {
    setFormData({
      name: item.name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      costPerUnit: item.costPerUnit.toString(),
      threshold: item.threshold.toString(),
      category: item.category,
      supplier: item.supplier || '',
      expiryDate: item.expiryDate ? item.expiryDate.toISOString().split('T')[0] : ''
    })
    setEditingItem(item)
    setShowAddModal(true)
  }

  const closeModal = () => {
    setShowAddModal(false)
    setEditingItem(null)
    resetForm()
  }

  const updateStock = async (id: number, newQuantity: number) => {
    try {
      await db.inventory.update(id, {
        quantity: Math.max(0, newQuantity),
        updatedAt: new Date()
      })
      
      toast({
        title: "Stock Updated",
        description: "Inventory quantity has been updated successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock quantity.",
        variant: "destructive"
      })
    }
  }

  const deleteItem = async (id: number) => {
    try {
      await db.inventory.delete(id)
      toast({
        title: "Item Deleted",
        description: "Inventory item has been removed successfully."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete inventory item.",
        variant: "destructive"
      })
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      const now = new Date()
      const itemData = {
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity) || 0,
        unit: formData.unit.trim(),
        costPerUnit: parseFloat(formData.costPerUnit) || 0,
        threshold: parseFloat(formData.threshold) || 0,
        category: formData.category.trim(),
        supplier: formData.supplier.trim(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        createdAt: editingItem ? editingItem.createdAt : now,
        updatedAt: now
      }

      if (!itemData.name || !itemData.unit || !itemData.category) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        })
        return
      }

      if (editingItem) {
        await db.inventory.update(editingItem.id, {
          name: itemData.name,
          quantity: itemData.quantity,
          unit: itemData.unit,
          costPerUnit: itemData.costPerUnit,
          threshold: itemData.threshold,
          category: itemData.category,
          supplier: itemData.supplier,
          expiryDate: itemData.expiryDate,
          updatedAt: itemData.updatedAt
        })
        toast({
          title: "Item Updated",
          description: "Inventory item has been updated successfully."
        })
      } else {
        await db.inventory.add(itemData)
        toast({
          title: "Item Added",
          description: "New inventory item has been added successfully."
        })
      }

      closeModal()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingItem ? 'update' : 'add'} inventory item.`,
        variant: "destructive"
      })
    }
  }

  const exportInventory = () => {
    const csvContent = [
      ['Name', 'Quantity', 'Unit', 'Cost per Unit', 'Threshold', 'Category', 'Supplier', 'Expiry Date', 'Total Value'].join(','),
      ...inventory.map(item => [
        item.name,
        item.quantity,
        item.unit,
        item.costPerUnit,
        item.threshold,
        item.category,
        item.supplier || '',
        item.expiryDate ? formatDate(item.expiryDate) : '',
        (item.quantity * item.costPerUnit).toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Inventory data has been exported successfully."
    })
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-4 p-4 pb-24 lg:pb-4">
        {/* Mobile-Optimized Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
              <p className="text-sm text-slate-600">{inventory.length} items in stock</p>
            </div>
            <Button onClick={openAddModal} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>
          
          {/* Quick Stats - Mobile Friendly */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-medium">Total Items</p>
                  <p className="text-lg font-bold text-green-700">{inventory.length}</p>
                </div>
                <Package className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Low Stock</p>
                  <p className="text-lg font-bold text-orange-700">{lowStockItems.length}</p>
                </div>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Alerts - Mobile Optimized */}
        {(lowStockItems.length > 0 || expiringItems.length > 0) && (
          <div className="space-y-3">
            {lowStockItems.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  <h3 className="font-semibold text-orange-800">Low Stock Alert</h3>
                </div>
                <div className="space-y-1">
                  {lowStockItems.slice(0, 2).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-orange-800 truncate">{item.name}</span>
                      <span className="text-orange-600 font-medium">
                        {item.quantity} {item.unit}
                      </span>
                    </div>
                  ))}
                  {lowStockItems.length > 2 && (
                    <p className="text-xs text-orange-600">
                      +{lowStockItems.length - 2} more items
                    </p>
                  )}
                </div>
              </div>
            )}

            {expiringItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-red-600 mr-2" />
                  <h3 className="font-semibold text-red-800">Expiring Soon</h3>
                </div>
                <div className="space-y-1">
                  {expiringItems.slice(0, 2).map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <span className="text-red-800 truncate">{item.name}</span>
                      <span className="text-red-600 font-medium">
                        {item.expiryDate && formatDate(item.expiryDate)}
                      </span>
                    </div>
                  ))}
                  {expiringItems.length > 2 && (
                    <p className="text-xs text-red-600">
                      +{expiringItems.length - 2} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search and Filter - Mobile Optimized */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          
          {/* Category Filter - Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap text-xs px-3 py-1 h-8"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Inventory Items - Mobile Card Layout */}
        <div className="space-y-3">
          {filteredInventory.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-600 mb-1">No items found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm || selectedCategory !== 'All' 
                  ? 'Try adjusting your search or filter' 
                  : 'Add your first inventory item to get started'
                }
              </p>
            </div>
          ) : (
            filteredInventory.map(item => (
              <Card key={item.id} className="border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{item.name}</h3>
                      <p className="text-sm text-slate-500">{item.category}</p>
                      {item.supplier && (
                        <p className="text-xs text-slate-400">Supplier: {item.supplier}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(item)}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => item.id && deleteItem(item.id)}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Current Stock</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {item.quantity} {item.unit}
                        </span>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => item.id && updateStock(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            -
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => item.id && updateStock(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs text-slate-500 mb-1">Total Value</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(item.quantity * item.costPerUnit)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Threshold: {item.threshold} {item.unit}</span>
                    {item.expiryDate && (
                      <span>Expires: {formatDate(item.expiryDate)}</span>
                    )}
                  </div>
                  
                  {/* Status Indicators */}
                  <div className="flex items-center space-x-2 mt-2">
                    {isLowStock(item.quantity, item.threshold) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Low Stock
                      </span>
                    )}
                    {isExpiringSoon(item.expiryDate) && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Calendar className="h-3 w-3 mr-1" />
                        Expiring Soon
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 pb-16 lg:pb-0">
            <Card className="w-full lg:w-[600px] max-h-[90vh] lg:max-h-[80vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl rounded-b-none lg:rounded-b-2xl bg-white shadow-2xl border-2 border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 rounded-t-2xl">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">
                      {editingItem ? 'Edit Item' : 'Add New Item'}
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {editingItem ? 'Update inventory item details' : 'Add a new item to your inventory'}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={closeModal}
                  className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              
              <CardContent className="space-y-4 p-6 bg-white">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Item Name *</label>
                    <Input
                      placeholder="Enter item name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                    <Input
                      placeholder="Enter category"
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Unit *</label>
                    <Input
                      placeholder="kg, pcs, liters, etc."
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Cost per Unit</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.costPerUnit}
                      onChange={(e) => handleInputChange('costPerUnit', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Low Stock Threshold</label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formData.threshold}
                      onChange={(e) => handleInputChange('threshold', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Supplier</label>
                    <Input
                      placeholder="Supplier name"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="h-10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                    <Input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={closeModal}
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    {editingItem ? 'Update Item' : 'Add Item'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  )
}