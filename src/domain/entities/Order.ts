import { CartItem } from './CartItem'
import { ProductId, ProductName, ProductPrice } from './Product'

export class OrderId {
  constructor(public readonly value: number) {}
}

export class OrderNumber {
  constructor(public readonly value: string) {}
}

export interface OrderItem {
  productId: ProductId
  productName: ProductName
  quantity: number
  price: ProductPrice
  total: number
}

export type PaymentMethod = 'cash' | 'card' | 'upi'
export type PaymentStatus = 'pending' | 'completed' | 'failed'
export type OrderType = 'takeaway' | 'delivery' | 'dine-in'

export interface OrderMoney {
  value: number
}

export class Order {
  constructor(
    public readonly id: OrderId,
    public readonly orderNumber: OrderNumber,
    public readonly items: OrderItem[],
    public readonly subtotal: OrderMoney,
    public readonly discount: OrderMoney,
    public readonly discountType: 'flat' | 'percentage',
    public readonly tax: OrderMoney,
    public readonly total: OrderMoney,
    public readonly paymentMethod: PaymentMethod,
    public readonly paymentStatus: PaymentStatus,
    public readonly orderType: OrderType,
    public readonly customerName?: string,
    public readonly customerPhone?: string,
    public readonly notes?: string,
    public readonly cashierId: number = 1,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  // Business logic methods
  isCompleted(): boolean {
    return this.paymentStatus === 'completed'
  }

  isPending(): boolean {
    return this.paymentStatus === 'pending'
  }

  isFailed(): boolean {
    return this.paymentStatus === 'failed'
  }

  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  }

  hasCustomerInfo(): boolean {
    return !!(this.customerName || this.customerPhone)
  }

  updatePaymentStatus(status: PaymentStatus): Order {
    return new Order(
      this.id,
      this.orderNumber,
      this.items,
      this.subtotal,
      this.discount,
      this.discountType,
      this.tax,
      this.total,
      this.paymentMethod,
      status,
      this.orderType,
      this.customerName,
      this.customerPhone,
      this.notes,
      this.cashierId,
      this.createdAt,
      new Date()
    )
  }

  static fromCartItems(
    cartItems: CartItem[],
    orderNumber: OrderNumber,
    paymentMethod: PaymentMethod,
    orderType: OrderType,
    discount: OrderMoney = { value: 0 },
    discountType: 'flat' | 'percentage' = 'flat',
    taxRate: number = 0,
    deliveryCharge: number = 0,
    customerName?: string,
    customerPhone?: string
  ): Order {
    const items: OrderItem[] = cartItems.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity.value,
      price: item.product.price,
      total: item.getTotalPrice()
    }))

    const subtotal = { value: cartItems.reduce((sum, item) => sum + item.getTotalPrice(), 0) }
    const discountAmount = discountType === 'flat' 
      ? Math.min(discount.value, subtotal.value)
      : (subtotal.value * discount.value) / 100
    
    const taxableAmount = subtotal.value - discountAmount
    const tax = { value: (taxableAmount * taxRate) / 100 }
    const total = { value: taxableAmount + tax.value + deliveryCharge }

    return new Order(
      { value: 0 }, // Will be set by repository
      orderNumber,
      items,
      subtotal,
      { value: discountAmount },
      discountType,
      tax,
      total,
      paymentMethod,
      'completed',
      orderType,
      customerName,
      customerPhone,
      `Order Type: ${orderType.toUpperCase()}${deliveryCharge > 0 ? ` | Delivery: ₹${deliveryCharge}` : ''}`
    )
  }
}
