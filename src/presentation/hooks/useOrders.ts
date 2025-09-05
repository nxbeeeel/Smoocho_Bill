import { useState, useCallback, useEffect } from 'react'
import { Order } from '../../domain/entities/Order'
import { ServiceContainer } from '../../application/services/ServiceContainer'
import { CreateOrderRequest } from '../../application/use-cases/order/CreateOrderUseCase'

export interface UseOrdersReturn {
  orders: Order[]
  loading: boolean
  error: string | null
  fetchOrders: () => Promise<void>
  createOrder: (request: CreateOrderRequest) => Promise<{ success: boolean; order?: Order; error?: string }>
  updateOrderStatus: (orderId: number, status: 'pending' | 'completed' | 'failed') => Promise<boolean>
  deleteOrder: (orderId: number) => Promise<boolean>
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const container = ServiceContainer.getInstance()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedOrders = await container.orderRepository.findAll()
      setOrders(fetchedOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [container.orderRepository])

  const createOrder = useCallback(async (request: CreateOrderRequest) => {
    setLoading(true)
    setError(null)
    try {
      const result = await container.createOrderUseCase.execute(request)
      if (result.success && result.order) {
        setOrders(prev => [result.order!, ...prev])
      }
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [container])

  const updateOrderStatus = useCallback(async (orderId: number, status: 'pending' | 'completed' | 'failed') => {
    setLoading(true)
    setError(null)
    try {
      const order = await container.orderRepository.findById({ value: orderId })
      if (!order) {
        setError('Order not found')
        return false
      }

      const updatedOrder = order.updatePaymentStatus(status)
      await container.orderRepository.update(updatedOrder)
      
      setOrders(prev => prev.map(o => 
        o.id.value === orderId ? updatedOrder : o
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
      return false
    } finally {
      setLoading(false)
    }
  }, [container])

  const deleteOrder = useCallback(async (orderId: number) => {
    setLoading(true)
    setError(null)
    try {
      await container.orderRepository.delete({ value: orderId })
      setOrders(prev => prev.filter(o => o.id.value !== orderId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order')
      return false
    } finally {
      setLoading(false)
    }
  }, [container])

  // Load orders on mount
  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

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
