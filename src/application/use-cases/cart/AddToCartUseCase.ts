import { Product } from '../../../domain/entities/Product'
import { Cart } from '../../../domain/entities/Cart'
import { Quantity } from '../../../domain/entities/CartItem'

export interface AddToCartRequest {
  product: Product
  quantity?: number
}

export interface AddToCartResponse {
  success: boolean
  cartItemCount: number
  totalPrice: number
  error?: string
}

export class AddToCartUseCase {
  constructor(private readonly cart: Cart) {}

  execute(request: AddToCartRequest): AddToCartResponse {
    try {
      // Validate input
      if (!request.product.isAvailable()) {
        return {
          success: false,
          cartItemCount: this.cart.getItemCount(),
          totalPrice: this.cart.getTotalPrice(),
          error: 'Product is not available'
        }
      }

      const quantity = new Quantity(request.quantity || 1)
      
      // Add product to cart
      this.cart.addProduct(request.product, quantity)

      return {
        success: true,
        cartItemCount: this.cart.getItemCount(),
        totalPrice: this.cart.getTotalPrice()
      }
    } catch (error) {
      return {
        success: false,
        cartItemCount: this.cart.getItemCount(),
        totalPrice: this.cart.getTotalPrice(),
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
}
