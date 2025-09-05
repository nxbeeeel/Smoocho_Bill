import { Product, ProductId, ProductName, ProductPrice, ProductCategory } from '../../domain/entities/Product'
import { ProductRepository, ProductFilters } from '../../domain/repositories/ProductRepository'
import { db, Product as DatabaseProduct } from '../../../lib/database'

export class DexieProductRepository implements ProductRepository {
  async findById(id: ProductId): Promise<Product | null> {
    try {
      const model = await db.products.get(id.value)
      return model ? this.toDomainEntity(model) : null
    } catch (error) {
      console.error('Error finding product by ID:', error)
      return null
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const models = await db.products.toArray()
      return models.map(model => this.toDomainEntity(model))
    } catch (error) {
      console.error('Error finding all products:', error)
      return []
    }
  }

  async findByFilters(filters: ProductFilters): Promise<Product[]> {
    try {
      let models = await db.products.toArray()

      // Apply filters
      if (filters.category && filters.category !== 'All') {
        models = models.filter(model => model.category === filters.category)
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        models = models.filter(model => 
          model.name.toLowerCase().includes(searchLower) ||
          model.description?.toLowerCase().includes(searchLower)
        )
      }

      if (filters.isActive !== undefined) {
        models = models.filter(model => model.isActive === filters.isActive)
      }

      return models.map(model => this.toDomainEntity(model))
    } catch (error) {
      console.error('Error finding products by filters:', error)
      return []
    }
  }

  async save(product: Product): Promise<Product> {
    try {
      const model = this.toDatabaseModel(product)
      const id = await db.products.add(model)
      return new Product(
        { value: id },
        product.name,
        product.price,
        product.category,
        product.description,
        product.isActive,
        product.imageUrl,
        product.createdAt,
        product.updatedAt
      )
    } catch (error) {
      console.error('Error saving product:', error)
      throw error
    }
  }

  async update(product: Product): Promise<Product> {
    try {
      const model = this.toDatabaseModel(product)
      await db.products.update(product.id.value, model)
      return product
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  async delete(id: ProductId): Promise<void> {
    try {
      await db.products.delete(id.value)
    } catch (error) {
      console.error('Error deleting product:', error)
      throw error
    }
  }

  async findCategories(): Promise<string[]> {
    try {
      const products = await db.products.toArray()
      const categories = Array.from(new Set(products.map(p => p.category)))
      return categories.sort()
    } catch (error) {
      console.error('Error finding categories:', error)
      return []
    }
  }

  async count(): Promise<number> {
    try {
      return await db.products.count()
    } catch (error) {
      console.error('Error counting products:', error)
      return 0
    }
  }

  private toDomainEntity(model: DatabaseProduct): Product {
    return new Product(
      { value: model.id! },
      new ProductName(model.name),
      new ProductPrice(model.price),
      new ProductCategory(model.category),
      model.description || '',
      model.isActive,
      model.imageUrl,
      model.createdAt,
      model.updatedAt
    )
  }

  private toDatabaseModel(product: Product): DatabaseProduct {
    return {
      id: product.id.value || undefined,
      name: product.name.value,
      price: product.price.value,
      category: product.category.value,
      description: product.description,
      isActive: product.isActive,
      imageUrl: product.imageUrl,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }
  }
}
