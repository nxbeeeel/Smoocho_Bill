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
  X
} from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
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

  // Use Dexie live query to get real-time inventory data
  const inventory = useLiveQuery(() => db.inventory.toArray()) || []

  const categories = ['All', ...Array.from(new Set(inventory.map(item => item.category)))]

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (showAddModal) {
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
  }, [showAddModal])

  // Populate form when editing
  React.useEffect(() => {
    if (editingItem) {
      setFormData({
        name: editingItem.name,
        quantity: editingItem.quantity.toString(),
        unit: editingItem.unit,
        costPerUnit: editingItem.costPerUnit.toString(),
        threshold: editingItem.threshold.toString(),
        category: editingItem.category,
        supplier: editingItem.supplier || '',
        expiryDate: editingItem.expiryDate ? new Date(editingItem.expiryDate).toISOString().split('T')[0] : ''
      })
    }
  }, [editingItem])

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const lowStockItems = inventory.filter(item => isLowStock(item.quantity, item.threshold))
  const expiringItems = inventory.filter(item => item.expiryDate && isExpiringSoon(item.expiryDate))
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0)

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

      setShowAddModal(false)
      setEditingItem(null)
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
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-600">Track stock levels, manage suppliers, and monitor expiry dates</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportInventory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory.length}</div>
              <p className="text-xs text-muted-foreground">
                Active inventory items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Items below threshold
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
              <Calendar className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{expiringItems.length}</div>
              <p className="text-xs text-muted-foreground">
                Items expiring in 3 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Current inventory value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {(lowStockItems.length > 0 || expiringItems.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {lowStockItems.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-orange-800">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Low Stock Alert
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm text-orange-800">{item.name}</span>
                        <span className="text-sm font-medium text-orange-600">
                          {item.quantity} {item.unit} remaining
                        </span>
                      </div>
                    ))}
                    {lowStockItems.length > 3 && (
                      <p className="text-xs text-orange-600">
                        +{lowStockItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {expiringItems.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <Calendar className="h-5 w-5 mr-2" />
                    Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {expiringItems.slice(0, 3).map(item => (
                      <div key={item.id} className="flex justify-between items-center">
                        <span className="text-sm text-red-800">{item.name}</span>
                        <span className="text-sm font-medium text-red-600">
                          {item.expiryDate && formatDate(item.expiryDate)}
                        </span>
                      </div>
                    ))}
                    {expiringItems.length > 3 && (
                      <p className="text-xs text-red-600">
                        +{expiringItems.length - 3} more items
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex space-x-2">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredInventory.map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-slate-600">
                          {item.category} • {item.supplier}
                        </p>
                        {item.expiryDate && (
                          <p className={`text-xs ${isExpiringSoon(item.expiryDate) ? 'text-red-600' : 'text-slate-500'}`}>
                            Expires: {formatDate(item.expiryDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Quantity</p>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateStock(item.id!, item.quantity - 1)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <span className="font-medium min-w-[60px] text-center">
                          {item.quantity} {item.unit}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateStock(item.id!, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-slate-600">Cost/Unit</p>
                      <p className="font-medium">{formatCurrency(item.costPerUnit)}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-slate-600">Total Value</p>
                      <p className="font-medium">{formatCurrency(item.quantity * item.costPerUnit)}</p>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-slate-600">Status</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        isLowStock(item.quantity, item.threshold)
                          ? 'bg-orange-100 text-orange-800'
                          : item.expiryDate && isExpiringSoon(item.expiryDate)
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isLowStock(item.quantity, item.threshold)
                          ? 'Low Stock'
                          : item.expiryDate && isExpiringSoon(item.expiryDate)
                          ? 'Expiring'
                          : 'Good'}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItem(item.id!)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Modal */}
        {(showAddModal || editingItem) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingItem(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Item Name *</label>
                  <Input 
                    placeholder="Enter item name" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Quantity</label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Unit *</label>
                    <Input 
                      placeholder="kg, liters, pieces" 
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cost per Unit (₹)</label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formData.costPerUnit}
                      onChange={(e) => handleInputChange('costPerUnit', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Low Stock Threshold</label>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      value={formData.threshold}
                      onChange={(e) => handleInputChange('threshold', e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category *</label>
                  <Input 
                    placeholder="Baking, Dairy, etc." 
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Supplier</label>
                  <Input 
                    placeholder="Supplier name" 
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Expiry Date (Optional)</label>
                  <Input 
                    type="date" 
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingItem(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1">
                    {editingItem ? 'Update' : 'Add'} Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
