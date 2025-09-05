import { Product } from '../../../domain/entities/Product'
import { ProductRepository, ProductFilters } from '../../../domain/repositories/ProductRepository'

export interface GetProductsRequest {
  filters?: ProductFilters
}

export interface GetProductsResponse {
  products: Product[]
  total: number
}

export class GetProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(request: GetProductsRequest): Promise<GetProductsResponse> {
    const products = request.filters
      ? await this.productRepository.findByFilters(request.filters)
      : await this.productRepository.findAll()

    return {
      products,
      total: products.length
    }
  }
}
