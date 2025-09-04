import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency}${amount.toFixed(2)}`
}

// Date formatting
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export function formatDateOnly(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Generate order number
export function generateOrderNumber(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const time = now.getTime().toString().slice(-6)
  return `SMO${year}${month}${day}${time}`
}

// Calculate discount
export function calculateDiscount(amount: number, discount: number, type: 'flat' | 'percentage'): number {
  if (type === 'flat') {
    return Math.min(discount, amount)
  } else {
    return (amount * discount) / 100
  }
}

// Calculate tax
export function calculateTax(amount: number, taxRate: number): number {
  return (amount * taxRate) / 100
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[+]?[91]?[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Generate receipt content
export function generateReceiptContent(order: any, shopDetails: any): string {
  const lines = []
  
  lines.push('================================')
  lines.push(`       ${shopDetails.name}`)
  lines.push(`    ${shopDetails.address}`)
  lines.push(`    Phone: ${shopDetails.phone}`)
  lines.push('================================')
  lines.push('')
  lines.push(`Order #: ${order.orderNumber}`)
  lines.push(`Date: ${formatDate(order.createdAt)}`)
  lines.push(`Cashier: ${order.cashierName || 'N/A'}`)
  lines.push('')
  lines.push('--------------------------------')
  lines.push('ITEMS')
  lines.push('--------------------------------')
  
  order.items.forEach((item: any) => {
    lines.push(`${item.productName}`)
    lines.push(`  ${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}`)
  })
  
  lines.push('--------------------------------')
  lines.push(`Subtotal: ${formatCurrency(order.subtotal)}`)
  
  if (order.discount > 0) {
    lines.push(`Discount: -${formatCurrency(order.discount)}`)
  }
  
  if (order.tax > 0) {
    lines.push(`Tax: ${formatCurrency(order.tax)}`)
  }
  
  lines.push(`TOTAL: ${formatCurrency(order.total)}`)
  lines.push(`Payment: ${order.paymentMethod.toUpperCase()}`)
  lines.push('')
  lines.push('Thank you for visiting!')
  lines.push('================================')
  
  return lines.join('\n')
}

// Check if item is low stock
export function isLowStock(quantity: number, threshold: number): boolean {
  return quantity <= threshold
}

// Check if item is expired or expiring soon
export function isExpiringSoon(expiryDate: Date | undefined, daysThreshold: number = 3): boolean {
  if (!expiryDate) return false
  
  const now = new Date()
  const diffTime = expiryDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays <= daysThreshold
}

// Network status check
export function isOnline(): boolean {
  return navigator.onLine
}

// Local storage helpers
export function getStorageItem(key: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

export function setStorageItem(key: string, value: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, value)
}

export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
