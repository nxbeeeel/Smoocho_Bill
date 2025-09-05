import { CartItem } from '@/types/cart.types'

export class CartService {
  private cart: CartItem[] = []

  // Add item to cart
  addItem(item: CartItem): void {
    const existingItem = this.cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      existingItem.quantity += item.quantity
      existingItem.total = existingItem.quantity * existingItem.price
    } else {
      this.cart.push({
        ...item,
        total: item.quantity * item.price
      })
    }
  }

  // Remove item from cart
  removeItem(itemId: number): void {
    this.cart = this.cart.filter(item => item.id !== itemId)
  }

  // Update item quantity
  updateQuantity(itemId: number, quantity: number): void {
    const item = this.cart.find(cartItem => cartItem.id === itemId)
    if (item) {
      item.quantity = quantity
      item.total = item.quantity * item.price
    }
  }

  // Clear cart
  clearCart(): void {
    this.cart = []
  }

  // Get cart items
  getCartItems(): CartItem[] {
    return [...this.cart]
  }

  // Get cart total
  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + item.total, 0)
  }

  // Get cart item count
  getCartItemCount(): number {
    return this.cart.reduce((count, item) => count + item.quantity, 0)
  }

  // Check if cart is empty
  isCartEmpty(): boolean {
    return this.cart.length === 0
  }
}

// Singleton instance
export const cartService = new CartService()
