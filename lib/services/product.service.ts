import { Product } from '@/lib/database'
import { db } from '@/lib/database'

export interface ProductFilters {
  category?: string
  searchTerm?: string
  isActive?: boolean
}

export interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  categories: string[]
}

export class ProductService {
  // Get all products
  async getAllProducts(): Promise<Product[]> {
    try {
      return await db.products.toArray()
    } catch (error) {
      console.error('Error fetching products:', error)
      return []
    }
  }

  // Get products with filters
  async getFilteredProducts(filters: ProductFilters): Promise<Product[]> {
    try {
      let products = await db.products.toArray()

      // Apply filters
      if (filters.category && filters.category !== 'All') {
        products = products.filter(p => p.category === filters.category)
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        products = products.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        )
      }

      if (filters.isActive !== undefined) {
        products = products.filter(p => p.isActive === filters.isActive)
      }

      return products
    } catch (error) {
      console.error('Error fetching filtered products:', error)
      return []
    }
  }

  // Get product by ID
  async getProductById(id: number): Promise<Product | null> {
    try {
      return await db.products.get(id) || null
    } catch (error) {
      console.error('Error fetching product:', error)
      return null
    }
  }

  // Get unique categories
  async getCategories(): Promise<string[]> {
    try {
      const products = await db.products.toArray()
      const categories = [...new Set(products.map(p => p.category))]
      return categories.sort()
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Get product statistics
  async getProductStats(): Promise<ProductStats> {
    try {
      const products = await db.products.toArray()
      const categories = [...new Set(products.map(p => p.category))]
      
      return {
        totalProducts: products.length,
        activeProducts: products.filter(p => p.isActive).length,
        inactiveProducts: products.filter(p => !p.isActive).length,
        categories: categories.sort()
      }
    } catch (error) {
      console.error('Error fetching product stats:', error)
      return {
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
        categories: []
      }
    }
  }

  // Create new product
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
      const newProduct: Omit<Product, 'id'> = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const id = await db.products.add(newProduct)
      return { ...newProduct, id }
    } catch (error) {
      console.error('Error creating product:', error)
      return null
    }
  }

  // Update product
  async updateProduct(id: number, updates: Partial<Product>): Promise<boolean> {
    try {
      await db.products.update(id, {
        ...updates,
        updatedAt: new Date()
      })
      return true
    } catch (error) {
      console.error('Error updating product:', error)
      return false
    }
  }

  // Delete product
  async deleteProduct(id: number): Promise<boolean> {
    try {
      await db.products.delete(id)
      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  // Toggle product active status
  async toggleProductStatus(id: number): Promise<boolean> {
    try {
      const product = await db.products.get(id)
      if (product) {
        await db.products.update(id, {
          isActive: !product.isActive,
          updatedAt: new Date()
        })
        return true
      }
      return false
    } catch (error) {
      console.error('Error toggling product status:', error)
      return false
    }
  }
}

// Singleton instance
export const productService = new ProductService()
