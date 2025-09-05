import { CartItem } from './CartItem'
import { Product } from './Product'
import { Quantity } from './CartItem'

export class Cart {
  private items: Map<number, CartItem> = new Map()

  // Business logic methods
  addProduct(product: Product, quantity: Quantity = new Quantity(1)): void {
    const existingItem = this.items.get(product.id.value)
    
    if (existingItem) {
      const updatedItem = existingItem.increaseQuantity(quantity.value)
      this.items.set(product.id.value, updatedItem)
    } else {
      const newItem = new CartItem(
        { value: product.id.value },
        product,
        quantity
      )
      this.items.set(product.id.value, newItem)
    }
  }

  removeProduct(productId: ProductId): void {
    this.items.delete(productId.value)
  }

  updateQuantity(productId: ProductId, quantity: Quantity): void {
    const item = this.items.get(productId.value)
    if (item) {
      if (quantity.value <= 0) {
        this.removeProduct(productId)
      } else {
        const updatedItem = item.updateQuantity(quantity)
        this.items.set(productId.value, updatedItem)
      }
    }
  }

  clear(): void {
    this.items.clear()
  }

  getItems(): CartItem[] {
    return Array.from(this.items.values())
  }

  getItemCount(): number {
    return this.getItems().reduce((count, item) => count + item.quantity.value, 0)
  }

  getTotalPrice(): number {
    return this.getItems().reduce((total, item) => total + item.getTotalPrice(), 0)
  }

  isEmpty(): boolean {
    return this.items.size === 0
  }

  hasProduct(productId: ProductId): boolean {
    return this.items.has(productId.value)
  }

  getProductQuantity(productId: ProductId): number {
    const item = this.items.get(productId.value)
    return item ? item.quantity.value : 0
  }
}
