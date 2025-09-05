import { Money } from '../value-objects/Money'
import { CartItem } from '../entities/CartItem'

export interface OrderCalculationRequest {
  cartItems: CartItem[]
  discount: number
  discountType: 'flat' | 'percentage'
  taxRate: number
  deliveryCharge: number
}

export interface OrderCalculationResult {
  subtotal: Money
  discountAmount: Money
  taxableAmount: Money
  tax: Money
  deliveryCharge: Money
  total: Money
}

export class OrderCalculationService {
  calculateOrder(request: OrderCalculationRequest): OrderCalculationResult {
    // Calculate subtotal
    const subtotalAmount = request.cartItems.reduce(
      (sum, item) => sum + item.getTotalPrice(),
      0
    )
    const subtotal = new Money(subtotalAmount)

    // Calculate discount
    const discountAmount = this.calculateDiscount(
      subtotal,
      request.discount,
      request.discountType
    )

    // Calculate taxable amount
    const taxableAmount = subtotal.subtract(discountAmount)

    // Calculate tax
    const tax = taxableAmount.multiply(request.taxRate / 100)

    // Delivery charge
    const deliveryCharge = new Money(request.deliveryCharge)

    // Calculate total
    const total = taxableAmount.add(tax).add(deliveryCharge)

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      tax,
      deliveryCharge,
      total
    }
  }

  private calculateDiscount(
    subtotal: Money,
    discount: number,
    discountType: 'flat' | 'percentage'
  ): Money {
    if (discountType === 'flat') {
      return new Money(Math.min(discount, subtotal.getValue()))
    } else {
      return subtotal.multiply(discount / 100)
    }
  }
}
