/**
 * Cart Item Entity - Core Business Object
 * Represents an item in the shopping cart with business rules
 * 
 * @author Enterprise Architecture Team
 * @version 1.0.0
 * @since 2024
 */

import { ProductEntity } from './ProductEntity'

export interface CartItemId {
  readonly value: number
}

export interface Quantity {
  readonly value: number
}

export interface LineTotal {
  readonly value: number
}

/**
 * Cart Item Entity - Immutable business object
 * Contains all business rules for cart items
 */
export class CartItemEntity {
  constructor(
    public readonly id: CartItemId,
    public readonly product: ProductEntity,
    public readonly quantity: Quantity,
    public readonly lineTotal: LineTotal
  ) {
    this.validateInvariants()
  }

  /**
   * Business Rule: Quantity must be positive
   */
  private validateInvariants(): void {
    if (this.quantity.value <= 0) {
      throw new Error('Cart item quantity must be greater than zero')
    }

    if (this.lineTotal.value <= 0) {
      throw new Error('Cart item line total must be greater than zero')
    }

    if (!this.product.isAvailableForSale()) {
      throw new Error('Cannot add unavailable product to cart')
    }
  }

  /**
   * Business Logic: Calculate line total
   */
  public calculateLineTotal(): LineTotal {
    const total = this.product.price.value * this.quantity.value
    return { value: total }
  }

  /**
   * Business Logic: Update quantity
   */
  public updateQuantity(newQuantity: Quantity): CartItemEntity {
    if (newQuantity.value <= 0) {
      throw new Error('Quantity must be greater than zero')
    }

    const lineTotal = this.product.price.value * newQuantity.value

    return new CartItemEntity(
      this.id,
      this.product,
      newQuantity,
      { value: lineTotal }
    )
  }

  /**
   * Business Logic: Increase quantity
   */
  public increaseQuantity(amount: number = 1): CartItemEntity {
    const newQuantity = { value: this.quantity.value + amount }
    return this.updateQuantity(newQuantity)
  }

  /**
   * Business Logic: Decrease quantity
   */
  public decreaseQuantity(amount: number = 1): CartItemEntity {
    const newQuantity = { value: Math.max(1, this.quantity.value - amount) }
    return this.updateQuantity(newQuantity)
  }

  /**
   * Business Logic: Check if same product
   */
  public isSameProduct(other: CartItemEntity): boolean {
    return this.product.id.value === other.product.id.value
  }

  /**
   * Business Logic: Get formatted line total
   */
  public getFormattedLineTotal(): string {
    return `₹${this.lineTotal.value.toFixed(2)}`
  }

  /**
   * Factory Method: Create new cart item
   */
  public static create(
    product: ProductEntity,
    quantity: Quantity
  ): CartItemEntity {
    if (!product.isAvailableForSale()) {
      throw new Error('Cannot add unavailable product to cart')
    }

    const lineTotal = product.price.value * quantity.value

    return new CartItemEntity(
      { value: 0 }, // Will be set by repository
      product,
      quantity,
      { value: lineTotal }
    )
  }
}
