'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, RefreshCw, Filter, Image as ImageIcon, Check, ChevronDown, Save, X } from 'lucide-react'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/ui/image-upload'
import { db, Product } from '@/lib/database'
import { useLiveQuery } from 'dexie-react-hooks'
import { cn } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface ProductFormData {
  name: string
  price: number
  category: string
  description: string
  image: string
  isActive: boolean
}

export default function MenuEditorPage() {
  const { toast } = useToast()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    category: '',
    description: '',
    image: '',
    isActive: true
  })

  // Live query for products from database
  const products = useLiveQuery(() => db.products.toArray()) || []
  
  // Get unique categories
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))]
  
  // Filter products by category
  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  const handleReloadMenu = async () => {
    try {
      await db.reloadMenuData()
      toast({
        title: "Menu Reloaded",
        description: "Menu has been reloaded with default items.",
      })
    } catch (error) {
      console.error('Error reloading menu:', error)
      toast({
        title: "Error",
        description: "Failed to reload menu.",
        variant: "destructive"
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      description: product.description || '',
      image: product.image || '',
      isActive: product.isActive
    })
    setShowAddForm(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await db.products.delete(productId)
        toast({
          title: "Item Deleted",
          description: "Menu item has been deleted successfully.",
        })
      } catch (error) {
        console.error('Error deleting product:', error)
        toast({
          title: "Error",
          description: "Failed to delete menu item.",
          variant: "destructive"
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: 0,
      category: '',
      description: '',
      image: '',
      isActive: true
    })
    setEditingProduct(null)
    setShowAddForm(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    try {
      if (editingProduct) {
        // Update existing product
        await db.products.update(editingProduct.id!, {
          ...formData,
          updatedAt: new Date()
        })
        toast({
          title: "Item Updated",
          description: "Menu item has been updated successfully.",
        })
      } else {
        // Add new product
        await db.products.add({
          ...formData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as Product)
        toast({
          title: "Item Added",
          description: "New menu item has been added successfully.",
        })
      }

      resetForm()
    } catch (error) {
      console.error('Error saving menu item:', error)
      toast({
        title: "Error",
        description: "Failed to save menu item.",
        variant: "destructive"
      })
    }
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Menu Editor</h1>
            <p className="text-gray-600">Manage your complete Smoocho menu ({products.length} items)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReloadMenu} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Reload Menu</span>
            </Button>
            <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filter by category:</span>
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{products.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Items</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-green-600">{categories.length - 1}</div>
              <div className="text-xs sm:text-sm text-gray-600">Categories</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                ₹{products.length ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Avg Price</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold text-orange-600">{filteredProducts.length}</div>
              <div className="text-xs sm:text-sm text-gray-600">Filtered Items</div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`overflow-hidden ${!product.isActive ? 'opacity-60' : ''}`}>
              <div className="relative aspect-video bg-gray-100">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
                  {product.category}
                </div>
                <div className="absolute bottom-2 right-2 bg-white/90 px-2 py-1 rounded-full text-sm font-bold text-green-600">
                  ₹{product.price.toFixed(2)}
                </div>
                {!product.isActive && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                {product.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description}</p>
                )}
                <div className="flex justify-end gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0"
                    onClick={() => handleEditProduct(product)}
                    title="Edit item"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDeleteProduct(product.id!)}
                    title="Delete item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingProduct ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Item name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(c => c !== 'All')
                          .map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Item description (optional)"
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    Image
                  </Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </Label>
                    <p className="text-xs text-gray-500">Active items appear in POS</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.isActive ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-2">
                    {editingProduct ? (
                      <>
                        <Save className="h-4 w-4" />
                        Update Item
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Add Item
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  )
}
