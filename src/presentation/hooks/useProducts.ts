import { useState, useCallback, useEffect } from 'react'
import { Product } from '../../domain/entities/Product'
import { ServiceContainer } from '../../application/services/ServiceContainer'
import { ProductFilters } from '../../domain/repositories/ProductRepository'

export interface UseProductsReturn {
  products: Product[]
  categories: string[]
  loading: boolean
  error: string | null
  fetchProducts: (filters?: ProductFilters) => Promise<void>
  createProduct: (data: {
    name: string
    price: number
    category: string
    description: string
    imageUrl?: string
    isActive?: boolean
  }) => Promise<{ success: boolean; product?: Product; error?: string }>
  updateProduct: (id: number, updates: Partial<Product>) => Promise<boolean>
  deleteProduct: (id: number) => Promise<boolean>
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const container = ServiceContainer.getInstance()

  const fetchProducts = useCallback(async (filters?: ProductFilters) => {
    setLoading(true)
    setError(null)
    try {
      const result = await container.getProductsUseCase.execute({ filters })
      setProducts(result.products)
      
      // Also fetch categories
      const categoriesList = await container.productRepository.findCategories()
      setCategories(categoriesList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [container])

  const createProduct = useCallback(async (data) => {
    setLoading(true)
    setError(null)
    try {
      const result = await container.createProductUseCase.execute(data)
      if (result.success && result.product) {
        setProducts(prev => [...prev, result.product!])
        await fetchProducts() // Refresh the list
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create product'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [container, fetchProducts])

  const updateProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    setLoading(true)
    setError(null)
    try {
      const product = await container.productRepository.findById({ value: id })
      if (!product) {
        setError('Product not found')
        return false
      }

      // Create updated product with the provided updates
      const updatedProduct = { ...product, ...updates }
      await container.productRepository.update(updatedProduct)
      await fetchProducts() // Refresh the list
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      return false
    } finally {
      setLoading(false)
    }
  }, [container, fetchProducts])

  const deleteProduct = useCallback(async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      await container.productRepository.delete({ value: id })
      setProducts(prev => prev.filter(p => p.id.value !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      return false
    } finally {
      setLoading(false)
    }
  }, [container])

  // Load products on mount
  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  return {
    products,
    categories,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  }
}
