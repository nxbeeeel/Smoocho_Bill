import { Product } from './Product'

export interface CartItemId {
  value: number
}

export interface Quantity {
  value: number
}

export class CartItem {
  constructor(
    public readonly id: CartItemId,
    public readonly product: Product,
    public readonly quantity: Quantity
  ) {
    if (quantity.value <= 0) {
      throw new Error('Quantity must be greater than 0')
    }
  }

  // Business logic methods
  getTotalPrice(): number {
    return this.product.price.value * this.quantity.value
  }

  updateQuantity(newQuantity: Quantity): CartItem {
    return new CartItem(this.id, this.product, newQuantity)
  }

  increaseQuantity(amount: number = 1): CartItem {
    const newQuantity = new Quantity(this.quantity.value + amount)
    return this.updateQuantity(newQuantity)
  }

  decreaseQuantity(amount: number = 1): CartItem {
    const newQuantity = new Quantity(Math.max(0, this.quantity.value - amount))
    return this.updateQuantity(newQuantity)
  }

  isSameProduct(other: CartItem): boolean {
    return this.product.id.value === other.product.id.value
  }
}
