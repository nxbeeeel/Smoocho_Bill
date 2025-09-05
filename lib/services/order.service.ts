import { Order, OrderItem } from '@/lib/database'
import { CartItem } from '@/types/cart.types'
import { generateOrderNumber, calculateTax } from '@/lib/utils'
import { db } from '@/lib/database'
import { firebaseSync } from '@/lib/firebase-sync'

export interface CreateOrderRequest {
  cartItems: CartItem[]
  customerName?: string
  customerPhone?: string
  paymentMethod: 'cash' | 'card' | 'upi'
  orderType: 'takeaway' | 'delivery' | 'dine-in'
  discount: number
  discountType: 'flat' | 'percentage'
  taxRate: number
  deliveryCharge: number
}

export interface CreateOrderResponse {
  success: boolean
  order?: Order
  error?: string
}

export class OrderService {
  // Create a new order
  async createOrder(request: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      // Validate cart
      if (request.cartItems.length === 0) {
        return {
          success: false,
          error: 'Cart is empty'
        }
      }

      // Calculate totals
      const subtotal = request.cartItems.reduce((sum, item) => sum + item.total, 0)
      const discountAmount = this.calculateDiscount(subtotal, request.discount, request.discountType)
      const taxableAmount = subtotal - discountAmount
      const tax = calculateTax(taxableAmount, request.taxRate)
      const total = taxableAmount + tax + request.deliveryCharge

      // Create order object
      const order: Order = {
        orderNumber: generateOrderNumber(),
        items: request.cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal,
        discount: discountAmount,
        discountType: request.discountType,
        tax,
        total,
        paymentMethod: request.paymentMethod,
        paymentStatus: 'completed',
        cashierId: 1, // Default cashier
        customerName: request.customerName,
        customerPhone: request.customerPhone,
        notes: `Order Type: ${request.orderType.toUpperCase()}${request.deliveryCharge > 0 ? ` | Delivery: ₹${request.deliveryCharge}` : ''}`,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save to database
      const orderId = await db.orders.add(order)
      const savedOrder = { ...order, id: orderId }

      // Sync to Firebase
      await firebaseSync.addOrderToFirebase(savedOrder)

      return {
        success: true,
        order: savedOrder
      }

    } catch (error) {
      console.error('Error creating order:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Calculate discount amount
  private calculateDiscount(subtotal: number, discount: number, discountType: 'flat' | 'percentage'): number {
    if (discountType === 'flat') {
      return Math.min(discount, subtotal)
    } else {
      return (subtotal * discount) / 100
    }
  }

  // Get order by ID
  async getOrderById(orderId: number): Promise<Order | null> {
    try {
      return await db.orders.get(orderId) || null
    } catch (error) {
      console.error('Error fetching order:', error)
      return null
    }
  }

  // Get all orders
  async getAllOrders(): Promise<Order[]> {
    try {
      return await db.orders.orderBy('createdAt').reverse().toArray()
    } catch (error) {
      console.error('Error fetching orders:', error)
      return []
    }
  }

  // Update order status
  async updateOrderStatus(orderId: number, status: 'pending' | 'completed' | 'failed'): Promise<boolean> {
    try {
      await db.orders.update(orderId, { 
        paymentStatus: status,
        updatedAt: new Date()
      })
      return true
    } catch (error) {
      console.error('Error updating order status:', error)
      return false
    }
  }

  // Delete order
  async deleteOrder(orderId: number): Promise<boolean> {
    try {
      await db.orders.delete(orderId)
      return true
    } catch (error) {
      console.error('Error deleting order:', error)
      return false
    }
  }
}

// Singleton instance
export const orderService = new OrderService()
