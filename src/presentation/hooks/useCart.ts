import { useState, useCallback, useEffect } from 'react'
import { CartItem } from '../../domain/entities/CartItem'
import { Product } from '../../domain/entities/Product'
import { ServiceContainer } from '../../application/services/ServiceContainer'

export interface UseCartReturn {
  items: CartItem[]
  itemCount: number
  totalPrice: number
  isEmpty: boolean
  addToCart: (product: Product, quantity?: number) => { success: boolean; error?: string }
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getProductQuantity: (productId: number) => number
}

export function useCart(): UseCartReturn {
  const [items, setItems] = useState<CartItem[]>([])
  const [itemCount, setItemCount] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)
  const [isEmpty, setIsEmpty] = useState(true)

  const container = ServiceContainer.getInstance()

  const updateCartState = useCallback(() => {
    const cartItems = container.cart.getItems()
    setItems(cartItems)
    setItemCount(container.cart.getItemCount())
    setTotalPrice(container.cart.getTotalPrice())
    setIsEmpty(container.cart.isEmpty())
  }, [container.cart])

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    const result = container.addToCartUseCase.execute({ product, quantity })
    updateCartState()
    return result
  }, [container, updateCartState])

  const removeFromCart = useCallback((productId: number) => {
    container.cart.removeProduct({ value: productId })
    updateCartState()
  }, [container.cart, updateCartState])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    container.cart.updateQuantity({ value: productId }, { value: quantity })
    updateCartState()
  }, [container.cart, updateCartState])

  const clearCart = useCallback(() => {
    container.cart.clear()
    updateCartState()
  }, [container.cart, updateCartState])

  const getProductQuantity = useCallback((productId: number) => {
    return container.cart.getProductQuantity({ value: productId })
  }, [container.cart])

  // Initialize cart state
  useEffect(() => {
    updateCartState()
  }, [updateCartState])

  return {
    items,
    itemCount,
    totalPrice,
    isEmpty,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getProductQuantity
  }
}
