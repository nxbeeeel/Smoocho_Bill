import { Order } from '../entities/Order'
import { OrderId } from '../entities/Order'

export interface OrderRepository {
  findById(id: OrderId): Promise<Order | null>
  findAll(): Promise<Order[]>
  save(order: Order): Promise<Order>
  update(order: Order): Promise<Order>
  delete(id: OrderId): Promise<void>
  findByDateRange(startDate: Date, endDate: Date): Promise<Order[]>
  findByPaymentStatus(status: string): Promise<Order[]>
}
