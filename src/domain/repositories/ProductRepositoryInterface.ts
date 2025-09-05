/**
 * Product Repository Interface - Enterprise Grade
 * Defines contract for product data access operations
 * 
 * @author Enterprise Architecture Team
 * @version 1.0.0
 * @since 2024
 */

import { ProductEntity } from '../entities/ProductEntity'

export interface ProductFilters {
  readonly category?: string
  readonly searchTerm?: string
  readonly isActive?: boolean
  readonly priceRange?: {
    readonly min: number
    readonly max: number
  }
}

export interface ProductSearchCriteria {
  readonly filters: ProductFilters
  readonly sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  readonly sortOrder?: 'asc' | 'desc'
  readonly limit?: number
  readonly offset?: number
}

export interface ProductRepositoryInterface {
  /**
   * Find product by ID
   */
  findById(id: number): Promise<ProductEntity | null>

  /**
   * Find all products with optional filters
   */
  findAll(criteria?: ProductSearchCriteria): Promise<ProductEntity[]>

  /**
   * Find products by category
   */
  findByCategory(category: string): Promise<ProductEntity[]>

  /**
   * Find products by search term
   */
  findBySearchTerm(searchTerm: string): Promise<ProductEntity[]>

  /**
   * Find active products only
   */
  findActiveProducts(): Promise<ProductEntity[]>

  /**
   * Save new product
   */
  save(product: ProductEntity): Promise<ProductEntity>

  /**
   * Update existing product
   */
  update(product: ProductEntity): Promise<ProductEntity>

  /**
   * Delete product by ID
   */
  delete(id: number): Promise<void>

  /**
   * Get all unique categories
   */
  getCategories(): Promise<string[]>

  /**
   * Get product count
   */
  count(filters?: ProductFilters): Promise<number>

  /**
   * Check if product exists
   */
  exists(id: number): Promise<boolean>

  /**
   * Find products by price range
   */
  findByPriceRange(min: number, max: number): Promise<ProductEntity[]>

  /**
   * Get product statistics
   */
  getStatistics(): Promise<{
    readonly totalProducts: number
    readonly activeProducts: number
    readonly inactiveProducts: number
    readonly categories: string[]
    readonly averagePrice: number
  }>
}
