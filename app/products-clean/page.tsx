'use client'

import React, { useState } from 'react'
import { useProducts } from '@/src/presentation'
import { ProductCard } from '@/src/presentation'
import { Product } from '@/src/domain'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

export default function CleanProductsPage() {
  const { toast } = useToast()
  const { products, categories, loading, createProduct, updateProduct, deleteProduct } = useProducts()
  
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    imageUrl: '',
    isActive: true
  })

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.value.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category.value === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleCreateProduct = async () => {
    if (!formData.name || !formData.price || !formData.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const result = await createProduct({
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      imageUrl: formData.imageUrl || undefined,
      isActive: formData.isActive
    })

    if (result.success) {
      toast({
        title: "Product Created",
        description: "Product has been created successfully",
      })
      setShowCreateDialog(false)
      resetForm()
    } else {
      toast({
        title: "Creation Failed",
        description: result.error || "Failed to create product",
        variant: "destructive"
      })
    }
  }

  const handleUpdateProduct = async (product: Product) => {
    const success = await updateProduct(product.id.value, product)
    if (success) {
      toast({
        title: "Product Updated",
        description: "Product has been updated successfully",
      })
    } else {
      toast({
        title: "Update Failed",
        description: "Failed to update product",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProduct = async (product: Product) => {
    if (confirm(`Are you sure you want to delete "${product.name.value}"?`)) {
      const success = await deleteProduct(product.id.value)
      if (success) {
        toast({
          title: "Product Deleted",
          description: "Product has been deleted successfully",
        })
      } else {
        toast({
          title: "Deletion Failed",
          description: "Failed to delete product",
          variant: "destructive"
        })
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      imageUrl: '',
      isActive: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-sm text-gray-600">Clean Architecture Implementation</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>Add Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Product</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter product description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProduct} className="flex-1">
                      Create Product
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <div key={product.id.value} className="relative">
                  <ProductCard product={product} showAddButton={false} />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateProduct(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
