// Smoocho Bill POS - API Client for Backend Integration
import { io, Socket } from 'socket.io-client'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'manager' | 'cashier'
  shopId: string
  shopName: string
}

export interface Shop {
  id: string
  name: string
  settings: any
  address?: string
  phone?: string
  email?: string
  website?: string
  gstNumber?: string
  upiId?: string
  taxRate: number
  currency: string
  timezone: string
}

export interface Product {
  id: string
  shopId: string
  name: string
  price: number
  category: string
  description?: string
  imageUrl?: string
  isActive: boolean
  stockQuantity?: number
  lowStockThreshold?: number
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  shopId: string
  orderNumber: string
  items: any[]
  subtotal: number
  tax: number
  discount: number
  discountType: 'flat' | 'percentage'
  total: number
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet'
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  cashierId: string
  customerName?: string
  customerPhone?: string
  orderType: 'dine_in' | 'takeaway' | 'delivery'
  deliveryAddress?: string
  deliveryCharge: number
  notes?: string
  createdAt: string
  updatedAt: string
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null
  private socket: Socket | null = null
  private shopId: string | null = null

  constructor(baseUrl: string = 'http://localhost:3001/api') {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem('smoocho_token')
    this.shopId = localStorage.getItem('smoocho_shop_id')
  }

  // ==================== AUTHENTICATION ====================

  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        this.token = data.token
        this.shopId = data.user.shopId
        localStorage.setItem('smoocho_token', data.token)
        localStorage.setItem('smoocho_shop_id', data.user.shopId)
        localStorage.setItem('smoocho_user', JSON.stringify(data.user))
        
        // Initialize socket connection
        this.initializeSocket()
        
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async register(email: string, password: string, name: string, shopName: string): Promise<ApiResponse<{ token: string; user: User }>> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, shopName }),
      })

      const data = await response.json()

      if (response.ok) {
        this.token = data.token
        this.shopId = data.user.shopId
        localStorage.setItem('smoocho_token', data.token)
        localStorage.setItem('smoocho_shop_id', data.user.shopId)
        localStorage.setItem('smoocho_user', JSON.stringify(data.user))
        
        // Initialize socket connection
        this.initializeSocket()
        
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async logout(): Promise<void> {
    this.token = null
    this.shopId = null
    localStorage.removeItem('smoocho_token')
    localStorage.removeItem('smoocho_shop_id')
    localStorage.removeItem('smoocho_user')
    
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.authenticatedRequest('/auth/profile')
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  // ==================== SHOP SETTINGS ====================

  async getShopSettings(): Promise<ApiResponse<any>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/settings`)
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async updateShopSettings(settings: any): Promise<ApiResponse<any>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/settings`, {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  // ==================== PRODUCTS ====================

  async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/products`)
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async createProduct(product: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/products`, {
        method: 'POST',
        body: JSON.stringify(product),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async updateProduct(productId: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async deleteProduct(productId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/products/${productId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  // ==================== ORDERS ====================

  async getOrders(page: number = 1, limit: number = 50, startDate?: string, endDate?: string): Promise<ApiResponse<Order[]>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })

      const response = await this.authenticatedRequest(`/shops/${this.shopId}/orders?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async createOrder(order: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/orders`, {
        method: 'POST',
        body: JSON.stringify(order),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async updateOrder(orderId: string, order: Partial<Order>): Promise<ApiResponse<Order>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(order),
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  async deleteOrder(orderId: string): Promise<ApiResponse<any>> {
    try {
      const response = await this.authenticatedRequest(`/shops/${this.shopId}/orders/${orderId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (response.ok) {
        return { success: true, data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  // ==================== REAL-TIME SOCKET ====================

  private initializeSocket(): void {
    if (!this.shopId) return

    this.socket = io('http://localhost:3001', {
      auth: {
        token: this.token,
        shopId: this.shopId,
      },
    })

    this.socket.on('connect', () => {
      console.log('Connected to real-time server')
      this.socket?.emit('join_shop', this.shopId)
    })

    this.socket.on('disconnect', () => {
      console.log('Disconnected from real-time server')
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  // Real-time event listeners
  onOrderCreated(callback: (order: Order) => void): void {
    this.socket?.on('order_created', callback)
  }

  onOrderUpdated(callback: (order: Order) => void): void {
    this.socket?.on('order_updated', callback)
  }

  onOrderDeleted(callback: (data: { id: string }) => void): void {
    this.socket?.on('order_deleted', callback)
  }

  onProductCreated(callback: (product: Product) => void): void {
    this.socket?.on('product_created', callback)
  }

  onProductUpdated(callback: (product: Product) => void): void {
    this.socket?.on('product_updated', callback)
  }

  onProductDeleted(callback: (data: { id: string }) => void): void {
    this.socket?.on('product_deleted', callback)
  }

  onSettingsUpdated(callback: (settings: any) => void): void {
    this.socket?.on('settings_updated', callback)
  }

  // ==================== UTILITY METHODS ====================

  private async authenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.token) {
      throw new Error('No authentication token')
    }

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('smoocho_user')
    return userStr ? JSON.parse(userStr) : null
  }

  getCurrentShopId(): string | null {
    return this.shopId
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export types
