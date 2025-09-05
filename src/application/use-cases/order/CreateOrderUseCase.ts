import { Order } from '../../../domain/entities/Order'
import { Cart } from '../../../domain/entities/Cart'
import { OrderRepository } from '../../../domain/repositories/OrderRepository'
import { OrderCalculationService } from '../../../domain/services/OrderCalculationService'
import { OrderNumber } from '../../../domain/entities/Order'

export interface CreateOrderRequest {
  paymentMethod: 'cash' | 'card' | 'upi'
  orderType: 'takeaway' | 'delivery' | 'dine-in'
  discount: number
  discountType: 'flat' | 'percentage'
  taxRate: number
  deliveryCharge: number
  customerName?: string
  customerPhone?: string
}

export interface CreateOrderResponse {
  success: boolean
  order?: Order
  error?: string
}

export class CreateOrderUseCase {
  constructor(
    private readonly cart: Cart,
    private readonly orderRepository: OrderRepository,
    private readonly orderCalculationService: OrderCalculationService
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // Validate cart is not empty
      if (this.cart.isEmpty()) {
        return {
          success: false,
          error: 'Cart is empty'
        }
      }

      // Generate order number
      const orderNumber = new OrderNumber(this.generateOrderNumber())

      // Calculate order totals
      const calculation = this.orderCalculationService.calculateOrder({
        cartItems: this.cart.getItems(),
        discount: request.discount,
        discountType: request.discountType,
        taxRate: request.taxRate,
        deliveryCharge: request.deliveryCharge
      })

      // Create order from cart items
      const order = Order.fromCartItems(
        this.cart.getItems(),
        orderNumber,
        request.paymentMethod,
        request.orderType,
        { value: calculation.discountAmount.getValue() },
        request.discountType,
        request.taxRate,
        request.deliveryCharge,
        request.customerName,
        request.customerPhone
      )

      // Save order to repository
      const savedOrder = await this.orderRepository.save(order)

      // Clear cart after successful order creation
      this.cart.clear()

      return {
        success: true,
        order: savedOrder
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    return `ORD-${timestamp}-${random}`
  }
}
