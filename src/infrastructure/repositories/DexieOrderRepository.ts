import { Order, OrderId, OrderNumber } from '../../domain/entities/Order'
import { OrderRepository } from '../../domain/repositories/OrderRepository'
import { db } from '../../../lib/database'

// Database model interface
interface OrderModel {
  id?: number
  orderNumber: string
  items: Record<string, unknown>[]
  subtotal: number
  discount: number
  discountType: 'flat' | 'percentage'
  tax: number
  total: number
  paymentMethod: 'cash' | 'card' | 'upi'
  paymentStatus: 'pending' | 'completed' | 'failed'
  orderType: 'takeaway' | 'delivery' | 'dine-in'
  customerName?: string
  customerPhone?: string
  notes?: string
  cashierId: number
  createdAt: Date
  updatedAt: Date
}

export class DexieOrderRepository implements OrderRepository {
  async findById(id: OrderId): Promise<Order | null> {
    try {
      const model = await db.orders.get(id.value)
      return model ? this.toDomainEntity(model) : null
    } catch (error) {
      console.error('Error finding order by ID:', error)
      return null
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      const models = await db.orders.orderBy('createdAt').reverse().toArray()
      return models.map(model => this.toDomainEntity(model))
    } catch (error) {
      console.error('Error finding all orders:', error)
      return []
    }
  }

  async save(order: Order): Promise<Order> {
    try {
      const model = this.toDatabaseModel(order)
      const id = await db.orders.add(model)
      return new Order(
        { value: id },
        order.orderNumber,
        order.items,
        order.subtotal,
        order.discount,
        order.discountType,
        order.tax,
        order.total,
        order.paymentMethod,
        order.paymentStatus,
        order.orderType,
        order.customerName,
        order.customerPhone,
        order.notes,
        order.cashierId,
        order.createdAt,
        order.updatedAt
      )
    } catch (error) {
      console.error('Error saving order:', error)
      throw error
    }
  }

  async update(order: Order): Promise<Order> {
    try {
      const model = this.toDatabaseModel(order)
      await db.orders.update(order.id.value, model)
      return order
    } catch (error) {
      console.error('Error updating order:', error)
      throw error
    }
  }

  async delete(id: OrderId): Promise<void> {
    try {
      await db.orders.delete(id.value)
    } catch (error) {
      console.error('Error deleting order:', error)
      throw error
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    try {
      const models = await db.orders
        .where('createdAt')
        .between(startDate, endDate)
        .toArray()
      return models.map(model => this.toDomainEntity(model))
    } catch (error) {
      console.error('Error finding orders by date range:', error)
      return []
    }
  }

  async findByPaymentStatus(status: string): Promise<Order[]> {
    try {
      const models = await db.orders
        .where('paymentStatus')
        .equals(status)
        .toArray()
      return models.map(model => this.toDomainEntity(model))
    } catch (error) {
      console.error('Error finding orders by payment status:', error)
      return []
    }
  }

  private toDomainEntity(model: OrderModel): Order {
    return new Order(
      { value: model.id! },
      new OrderNumber(model.orderNumber),
      model.items,
      { value: model.subtotal },
      { value: model.discount },
      model.discountType,
      { value: model.tax },
      { value: model.total },
      model.paymentMethod,
      model.paymentStatus,
      model.orderType,
      model.customerName,
      model.customerPhone,
      model.notes,
      model.cashierId,
      model.createdAt,
      model.updatedAt
    )
  }

  private toDatabaseModel(order: Order): OrderModel {
    return {
      id: order.id.value || undefined,
      orderNumber: order.orderNumber.value,
      items: order.items,
      subtotal: order.subtotal.value,
      discount: order.discount.value,
      discountType: order.discountType,
      tax: order.tax.value,
      total: order.total.value,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderType: order.orderType,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      notes: order.notes,
      cashierId: order.cashierId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }
  }
}
