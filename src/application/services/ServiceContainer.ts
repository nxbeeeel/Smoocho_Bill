import { ProductRepository } from '../../domain/repositories/ProductRepository'
import { OrderRepository } from '../../domain/repositories/OrderRepository'
import { DexieProductRepository } from '../../infrastructure/repositories/DexieProductRepository'
import { DexieOrderRepository } from '../../infrastructure/repositories/DexieOrderRepository'
import { GetProductsUseCase } from '../use-cases/product/GetProductsUseCase'
import { CreateProductUseCase } from '../use-cases/product/CreateProductUseCase'
import { AddToCartUseCase } from '../use-cases/cart/AddToCartUseCase'
import { CreateOrderUseCase } from '../use-cases/order/CreateOrderUseCase'
import { Cart } from '../../domain/entities/Cart'
import { OrderCalculationService } from '../../domain/services/OrderCalculationService'

export class ServiceContainer {
  private static instance: ServiceContainer
  private _productRepository: ProductRepository
  private _orderRepository: OrderRepository
  private _cart: Cart
  private _orderCalculationService: OrderCalculationService

  private constructor() {
    // Initialize repositories
    this._productRepository = new DexieProductRepository()
    this._orderRepository = new DexieOrderRepository()
    
    // Initialize domain services
    this._cart = new Cart()
    this._orderCalculationService = new OrderCalculationService()
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  // Repositories
  get productRepository(): ProductRepository {
    return this._productRepository
  }

  get orderRepository(): OrderRepository {
    return this._orderRepository
  }

  // Domain Services
  get cart(): Cart {
    return this._cart
  }

  get orderCalculationService(): OrderCalculationService {
    return this._orderCalculationService
  }

  // Use Cases
  get getProductsUseCase(): GetProductsUseCase {
    return new GetProductsUseCase(this._productRepository)
  }

  get createProductUseCase(): CreateProductUseCase {
    return new CreateProductUseCase(this._productRepository)
  }

  get addToCartUseCase(): AddToCartUseCase {
    return new AddToCartUseCase(this._cart)
  }

  get createOrderUseCase(): CreateOrderUseCase {
    return new CreateOrderUseCase(
      this._cart,
      this._orderRepository,
      this._orderCalculationService
    )
  }
}
