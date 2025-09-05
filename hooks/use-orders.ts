import { useState, useCallback } from 'react'
import { Order } from '@/lib/database'
import { CreateOrderRequest, orderService } from '@/lib/services/order.service'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedOrders = await orderService.getAllOrders()
      setOrders(fetchedOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [])

  const createOrder = useCallback(async (request: CreateOrderRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await orderService.createOrder(request)
      if (result.success && result.order) {
        setOrders(prev => [result.order!, ...prev])
        return { success: true, order: result.order }
      } else {
        setError(result.error || 'Failed to create order')
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [])

  const updateOrderStatus = useCallback(async (orderId: number, status: 'pending' | 'completed' | 'failed') => {
    setLoading(true)
    setError(null)
    try {
      const success = await orderService.updateOrderStatus(orderId, status)
      if (success) {
        setOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, paymentStatus: status } : order
        ))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteOrder = useCallback(async (orderId: number) => {
    setLoading(true)
    setError(null)
    try {
      const success = await orderService.deleteOrder(orderId)
      if (success) {
        setOrders(prev => prev.filter(order => order.id !== orderId))
      }
      return success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder
  }
}
