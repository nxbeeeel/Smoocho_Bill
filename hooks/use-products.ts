import { useState, useCallback } from 'react'
import { Product } from '@/lib/database'
import { ProductFilters, ProductStats, productService } from '@/lib/services/product.service'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    categories: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true)
    setError(null)
    try {
      const fetchedProducts = filters 
        ? await productService.getFilteredProducts(filters)
        : await productService.getAllProducts()
      setProducts(fetchedProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const fetchedCategories = await productService.getCategories()
      setCategories(fetchedCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const fetchedStats = await productService.getProductStats()
      setStats(fetchedStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    }
  }, [])

  const createProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    try {
      const newProduct = await productService.createProduct(product)
      if (newProduct) {
        setProducts(prev => [...prev, newProduct])
        await fetchStats() // Refresh stats
        return { success: true, product: newProduct }
      } else {
        setError('Failed to create product')
        return { success: false, error: 'Failed to create product' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  const updateProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    setLoading(true)
    setError(null)
    try {
      const success = await productService.updateProduct(id, updates)
      if (success) {
        setProducts(prev => prev.map(product => 
          product.id === id ? { ...product, ...updates } : product
        ))
        await fetchStats() // Refresh stats
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  const deleteProduct = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const success = await productService.deleteProduct(id)
      if (success) {
        setProducts(prev => prev.filter(product => product.id !== id))
        await fetchStats() // Refresh stats
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  const toggleProductStatus = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const success = await productService.toggleProductStatus(id)
      if (success) {
        setProducts(prev => prev.map(product => 
          product.id === id ? { ...product, isActive: !product.isActive } : product
        ))
        await fetchStats() // Refresh stats
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle product status')
      return false
    } finally {
      setLoading(false)
    }
  }, [fetchStats])

  return {
    products,
    categories,
    stats,
    loading,
    error,
    fetchProducts,
    fetchCategories,
    fetchStats,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus
  }
}
