import { useState, useCallback } from 'react'
import { CartItem, CartState } from '@/lib/types/cart.types'
import { cartService } from '@/lib/services/cart.service'

export function useCart() {
  const [cartState, setCartState] = useState<CartState>({
    items: cartService.getCartItems(),
    total: cartService.getCartTotal(),
    itemCount: cartService.getCartItemCount(),
    isEmpty: cartService.isCartEmpty()
  })

  const updateCartState = useCallback(() => {
    setCartState({
      items: cartService.getCartItems(),
      total: cartService.getCartTotal(),
      itemCount: cartService.getCartItemCount(),
      isEmpty: cartService.isCartEmpty()
    })
  }, [])

  const addToCart = useCallback((item: Omit<CartItem, 'total'>) => {
    cartService.addItem(item)
    updateCartState()
  }, [updateCartState])

  const removeFromCart = useCallback((itemId: number) => {
    cartService.removeItem(itemId)
    updateCartState()
  }, [updateCartState])

  const updateQuantity = useCallback((itemId: number, quantity: number) => {
    cartService.updateQuantity(itemId, quantity)
    updateCartState()
  }, [updateCartState])

  const clearCart = useCallback(() => {
    cartService.clearCart()
    updateCartState()
  }, [updateCartState])

  return {
    ...cartState,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  }
}
