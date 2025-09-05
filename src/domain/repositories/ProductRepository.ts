import { Product } from '../entities/Product'
import { ProductId } from '../entities/Product'

export interface ProductFilters {
  category?: string
  searchTerm?: string
  isActive?: boolean
}

export interface ProductRepository {
  findById(id: ProductId): Promise<Product | null>
  findAll(): Promise<Product[]>
  findByFilters(filters: ProductFilters): Promise<Product[]>
  save(product: Product): Promise<Product>
  update(product: Product): Promise<Product>
  delete(id: ProductId): Promise<void>
  findCategories(): Promise<string[]>
  count(): Promise<number>
}
