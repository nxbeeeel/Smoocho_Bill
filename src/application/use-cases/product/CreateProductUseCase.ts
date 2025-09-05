import { Product, ProductName, ProductPrice, ProductCategory } from '../../../domain/entities/Product'
import { ProductRepository } from '../../../domain/repositories/ProductRepository'

export interface CreateProductRequest {
  name: string
  price: number
  category: string
  description: string
  imageUrl?: string
  isActive?: boolean
}

export interface CreateProductResponse {
  success: boolean
  product?: Product
  error?: string
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: CreateProductRequest): Promise<CreateProductResponse> {
    try {
      // Validate input
      if (!request.name || request.name.trim().length === 0) {
        return {
          success: false,
          error: 'Product name is required'
        }
      }

      if (request.price <= 0) {
        return {
          success: false,
          error: 'Product price must be greater than 0'
        }
      }

      // Create domain objects
      const productId = { value: 0 } // Will be set by repository
      const productName = new ProductName(request.name.trim())
      const productPrice = new ProductPrice(request.price)
      const productCategory = new ProductCategory(request.category)

      // Create product entity
      const product = new Product(
        productId,
        productName,
        productPrice,
        productCategory,
        request.description || '',
        request.isActive ?? true,
        request.imageUrl
      )

      // Save to repository
      const savedProduct = await this.productRepository.save(product)

      return {
        success: true,
        product: savedProduct
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
