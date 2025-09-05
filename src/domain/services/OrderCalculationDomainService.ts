/**
 * Order Calculation Domain Service - Enterprise Grade
 * Contains complex business logic for order calculations
 * 
 * @author Enterprise Architecture Team
 * @version 1.0.0
 * @since 2024
 */

import { CartItemEntity } from '../entities/CartItemEntity'
import { MoneyValueObject } from '../value-objects/MoneyValueObject'

export interface DomainOrderCalculationRequest {
  readonly cartItems: CartItemEntity[]
  readonly discountAmount: MoneyValueObject
  readonly discountType: 'flat' | 'percentage'
  readonly taxRate: number
  readonly deliveryCharge: MoneyValueObject
}

export interface DomainOrderCalculationResult {
  readonly subtotal: MoneyValueObject
  readonly discountAmount: MoneyValueObject
  readonly taxableAmount: MoneyValueObject
  readonly taxAmount: MoneyValueObject
  readonly deliveryCharge: MoneyValueObject
  readonly totalAmount: MoneyValueObject
}

/**
 * Order Calculation Domain Service
 * Contains complex business rules for order calculations
 */
export class OrderCalculationDomainService {
  /**
   * Business Logic: Calculate complete order totals
   */
  public calculateOrderTotals(request: DomainOrderCalculationRequest): DomainOrderCalculationResult {
    this.validateCalculationRequest(request)

    // Calculate subtotal
    const subtotal = this.calculateSubtotal(request.cartItems)

    // Calculate discount
    const discountAmount = this.calculateDiscount(
      subtotal,
      request.discountAmount,
      request.discountType
    )

    // Calculate taxable amount
    const taxableAmount = subtotal.subtract(discountAmount)

    // Calculate tax
    const taxAmount = this.calculateTax(taxableAmount, request.taxRate)

    // Calculate total
    const totalAmount = taxableAmount.add(taxAmount).add(request.deliveryCharge)

    return {
      subtotal,
      discountAmount,
      taxableAmount,
      taxAmount,
      deliveryCharge: request.deliveryCharge,
      totalAmount
    }
  }

  /**
   * Business Logic: Calculate subtotal from cart items
   */
  private calculateSubtotal(cartItems: CartItemEntity[]): MoneyValueObject {
    if (cartItems.length === 0) {
      return MoneyValueObject.zero()
    }

    return cartItems.reduce((total, item) => {
      const itemTotal = MoneyValueObject.createINR(item.lineTotal.value)
      return total.add(itemTotal)
    }, MoneyValueObject.zero())
  }

  /**
   * Business Logic: Calculate discount amount
   */
  private calculateDiscount(
    subtotal: MoneyValueObject,
    discountAmount: MoneyValueObject,
    discountType: 'flat' | 'percentage'
  ): MoneyValueObject {
    if (discountType === 'flat') {
      // Flat discount cannot exceed subtotal
      return subtotal.isLessThan(discountAmount) ? subtotal : discountAmount
    } else {
      // Percentage discount
      const percentage = discountAmount.getAmount() / 100
      return subtotal.multiply(percentage)
    }
  }

  /**
   * Business Logic: Calculate tax amount
   */
  private calculateTax(
    taxableAmount: MoneyValueObject,
    taxRate: number
  ): MoneyValueObject {
    if (taxRate < 0 || taxRate > 100) {
      throw new Error('Tax rate must be between 0 and 100 percent')
    }

    const taxMultiplier = taxRate / 100
    return taxableAmount.multiply(taxMultiplier)
  }

  /**
   * Business Logic: Validate calculation request
   */
  private validateCalculationRequest(request: DomainOrderCalculationRequest): void {
    if (!request.cartItems || request.cartItems.length === 0) {
      throw new Error('Cart items are required for calculation')
    }

    if (request.discountAmount.getAmount() < 0) {
      throw new Error('Discount amount cannot be negative')
    }

    if (request.deliveryCharge.getAmount() < 0) {
      throw new Error('Delivery charge cannot be negative')
    }

    if (request.taxRate < 0 || request.taxRate > 100) {
      throw new Error('Tax rate must be between 0 and 100 percent')
    }
  }

  /**
   * Business Logic: Calculate item count
   */
  public calculateItemCount(cartItems: CartItemEntity[]): number {
    return cartItems.reduce((count, item) => count + item.quantity.value, 0)
  }

  /**
   * Business Logic: Calculate average item price
   */
  public calculateAverageItemPrice(cartItems: CartItemEntity[]): MoneyValueObject {
    if (cartItems.length === 0) {
      return MoneyValueObject.zero()
    }

    const totalAmount = this.calculateSubtotal(cartItems)
    const itemCount = this.calculateItemCount(cartItems)
    
    return totalAmount.divide(itemCount)
  }

  /**
   * Business Logic: Check if order qualifies for free delivery
   */
  public qualifiesForFreeDelivery(
    subtotal: MoneyValueObject,
    freeDeliveryThreshold: MoneyValueObject
  ): boolean {
    return subtotal.isGreaterThan(freeDeliveryThreshold) || 
           subtotal.equals(freeDeliveryThreshold)
  }
}
