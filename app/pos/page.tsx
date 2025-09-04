"use client"

import React from 'react'
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt, 
  X, 
  CreditCard, 
  Banknote, 
  QrCode, 
  User, 
  Percent,
  RefreshCw,
  ShoppingCart
} from 'lucide-react'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, calculateTax, generateOrderNumber } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'
import { db, Product } from '@/lib/database'
import { useLiveQuery } from 'dexie-react-hooks'
import { QRGenerator } from '@/components/ui/qr-generator'

interface CartItem {
  id: number | undefined
  name: string
  price: number
  quantity: number
  total: number
}


export default function POSPage() {
  const { toast } = useToast()
  const { settings } = useSettings()
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('All')
  const [showCheckout, setShowCheckout] = React.useState(false)
  const [paymentMethod, setPaymentMethod] = React.useState<'cash' | 'card' | 'upi'>('cash')
  const [orderType, setOrderType] = React.useState<'takeaway' | 'delivery' | 'dine-in'>('takeaway')
  const [discount, setDiscount] = React.useState(0)
  const [discountType, setDiscountType] = React.useState<'flat' | 'percentage'>('percentage')
  const [showQR, setShowQR] = React.useState(false)
  const [customerName, setCustomerName] = React.useState('')
  const [customerPhone, setCustomerPhone] = React.useState('')

  // Live query for products from database - get all products first, then filter
  const products = useLiveQuery(() => db.products.toArray()) || []
  const activeProducts = products.filter(p => p.isActive)

  const categories = ['All', ...Array.from(new Set(activeProducts.map(p => p.category)))]

  // Function to get product image based on category and name
  const getProductImage = (product: Product) => {
    // First check if product has an uploaded image
    if (product.image && product.image.trim() !== '') {
      return product.image
    }
    
    const category = product.category
    const name = product.name.toLowerCase()
    
    // Category-based images (fallback)
    if (category === 'Kunafa Bowls') {
      if (name.includes('chocolate') || name.includes('choco')) return '🍫'
      if (name.includes('pistachio')) return '🥜'
      if (name.includes('lotus')) return '🍪'
      if (name.includes('nutella')) return '🌰'
      return '🥣'
    }
    
    if (category === 'Signatures') {
      if (name.includes('kunafa')) return '⭐'
      if (name.includes('chocolate')) return '🍫'
      if (name.includes('caramel')) return '🍯'
      return '✨'
    }
    
    if (category === 'Choco Desserts') {
      if (name.includes('brownie')) return '🧁'
      if (name.includes('cake')) return '🍰'
      if (name.includes('mousse')) return '🍮'
      return '🍫'
    }
    
    if (category === 'Crispy Rice Tubs') {
      if (name.includes('chocolate')) return '🍫'
      if (name.includes('vanilla')) return '🍦'
      if (name.includes('strawberry')) return '🍓'
      return '🍚'
    }
    
    if (category === 'Fruits Choco Mix') {
      if (name.includes('strawberry')) return '🍓'
      if (name.includes('banana')) return '🍌'
      if (name.includes('mango')) return '🥭'
      if (name.includes('berry')) return '🫐'
      return '🍇'
    }
    
    if (category === 'Ice Creams') {
      if (name.includes('vanilla')) return '🍦'
      if (name.includes('chocolate')) return '🍫'
      if (name.includes('strawberry')) return '🍓'
      if (name.includes('mint')) return '🌿'
      return '🍨'
    }
    
    if (category === 'Drinks') {
      if (name.includes('coffee') || name.includes('latte')) return '☕'
      if (name.includes('tea')) return '🍵'
      if (name.includes('juice')) return '🧃'
      if (name.includes('shake') || name.includes('smoothie')) return '🥤'
      return '🥤'
    }
    
    if (category === 'Toppings') {
      if (name.includes('nuts') || name.includes('almond')) return '🥜'
      if (name.includes('chocolate')) return '🍫'
      if (name.includes('fruit')) return '🍓'
      return '🍌'
    }
    
    return '🍰' // Default dessert emoji
  }

  const filteredProducts = activeProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    if (!product.id) return
    
    const existingItem = cart.find(item => item.id === product.id)
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1, 
        total: product.price 
      }])
    }
    
    // Show success toast
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
      duration: 2000,
    })
  }

  const updateQuantity = (id: number | undefined, newQuantity: number) => {
    if (!id || newQuantity <= 0) {
      removeFromCart(id)
      return
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    )
  }

  const removeFromCart = (id: number | undefined) => {
    if (!id) return
    setCart(prevCart => prevCart.filter(item => item.id !== id))
  }

  const clearCart = () => {
    setCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const discountAmount = discountType === 'flat' ? Math.min(discount, subtotal) : (subtotal * discount) / 100
  const taxableAmount = subtotal - discountAmount
  
  // Use settings tax rate with fallback to 18%
  const taxRate = settings?.taxRate || 18
  const tax = calculateTax(taxableAmount, taxRate)
  
  // Add delivery charge for delivery orders
  const deliveryCharge = orderType === 'delivery' ? (settings?.deliveryCharge || 0) : 0
  const total = taxableAmount + tax + deliveryCharge

  const completeOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to cart before checkout",
        variant: "destructive"
      })
      return
    }

    const orderNumber = generateOrderNumber()
    
    // Create order object
    const order = {
      orderNumber,
      items: cart.map(item => ({
        productId: item.id!,
        productName: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      })),
      subtotal,
      discount: discountAmount,
      discountType,
      tax,
      total,
      paymentMethod,
      paymentStatus: 'completed' as const,
      cashierId: 1, // Default cashier
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      notes: `Order Type: ${orderType.toUpperCase()}${deliveryCharge > 0 ? ` | Delivery: ₹${deliveryCharge}` : ''}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    try {
      // Save order to database
      await db.orders.add(order)
      
      // Generate and print bill
      await generateBill(order)
      
      toast({
        title: "Payment Successful!",
        description: `Order ${orderNumber} has been processed successfully.`
      })

      // Clear cart and close checkout
      clearCart()
      setShowCheckout(false)
      setDiscount(0)
      setCustomerName('')
      setCustomerPhone('')
      setOrderType('takeaway')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      })
    }
  }

  const generateBill = async (order: any) => {
    // Create thermal receipt format
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.2;
              width: 80mm;
              max-width: 80mm;
              margin: 0 auto;
              padding: 5mm;
              background: white;
              color: black;
            }
            .receipt {
              width: 100%;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .store-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 2px;
            }
            .store-details {
              font-size: 10px;
              margin-bottom: 4px;
            }
            .order-info {
              margin-bottom: 8px;
              font-size: 11px;
            }
            .order-info p {
              margin: 1px 0;
            }
            .items {
              margin-bottom: 8px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 2px;
              font-size: 11px;
            }
            .item-name {
              flex: 1;
              margin-right: 4px;
            }
            .item-qty {
              width: 20px;
              text-align: center;
            }
            .item-price {
              width: 40px;
              text-align: right;
            }
            .item-total {
              width: 50px;
              text-align: right;
              font-weight: bold;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 4px 0;
            }
            .totals {
              margin-bottom: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin: 1px 0;
              font-size: 11px;
            }
            .total-label {
              flex: 1;
            }
            .total-amount {
              font-weight: bold;
            }
            .grand-total {
              font-size: 14px;
              font-weight: bold;
              border-top: 1px solid #000;
              padding-top: 4px;
              margin-top: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 8px;
              border-top: 1px dashed #000;
              padding-top: 8px;
              font-size: 10px;
            }
            .thank-you {
              font-weight: bold;
              margin-bottom: 4px;
            }
            .generated-time {
              font-size: 9px;
            }
            @media print {
              body {
                margin: 0;
                padding: 2mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="store-name">${settings?.storeName || 'SMOOCHO BILL'}</div>
              <div class="store-details">${settings?.storeAddress || 'Premium POS System'}</div>
              <div class="store-details">Phone: ${settings?.storePhone || 'N/A'}</div>
              ${settings?.storeEmail ? `<div class="store-details">Email: ${settings.storeEmail}</div>` : ''}
              ${settings?.storeWebsite ? `<div class="store-details">Web: ${settings.storeWebsite}</div>` : ''}
              ${settings?.storeGST ? `<div class="store-details">GST: ${settings.storeGST}</div>` : ''}
              <div class="divider"></div>
              <div class="store-details" style="font-weight: bold;">BILL #${order.orderNumber}</div>
            </div>
            
            <div class="order-info">
              <p>Date: ${new Date().toLocaleDateString('en-IN')}</p>
              <p>Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
              <p>Order Type: ${orderType.toUpperCase()}</p>
              <p>Payment: ${order.paymentMethod.toUpperCase()}</p>
              <p>Status: PAID</p>
              ${order.customerName ? `<p>Customer: ${order.customerName}</p>` : ''}
              ${order.customerPhone ? `<p>Phone: ${order.customerPhone}</p>` : ''}
            </div>

            <div class="items">
              <div class="item-row" style="font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px;">
                <div class="item-name">Item</div>
                <div class="item-qty">Qty</div>
                <div class="item-price">Price</div>
                <div class="item-total">Total</div>
              </div>
              ${order.items.map((item: any) => `
                <div class="item-row">
                  <div class="item-name">${item.productName}</div>
                  <div class="item-qty">${item.quantity}</div>
                  <div class="item-price">₹${item.price.toFixed(2)}</div>
                  <div class="item-total">₹${item.total.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>

            <div class="divider"></div>

            <div class="totals">
              <div class="total-row">
                <div class="total-label">Subtotal:</div>
                <div class="total-amount">₹${order.subtotal.toFixed(2)}</div>
              </div>
              ${order.discount > 0 ? `
                <div class="total-row">
                  <div class="total-label">Discount:</div>
                  <div class="total-amount">${order.discountType === 'percentage' ? order.discount + '%' : '₹' + order.discount.toFixed(2)}</div>
                </div>
              ` : ''}
              ${orderType === 'delivery' && (settings?.deliveryCharge || 0) > 0 ? `
                <div class="total-row">
                  <div class="total-label">Delivery Charge:</div>
                  <div class="total-amount">₹${(settings?.deliveryCharge || 0).toFixed(2)}</div>
                </div>
              ` : ''}
              <div class="total-row">
                <div class="total-label">Tax (${settings?.taxRate || 18}%):</div>
                <div class="total-amount">₹${order.tax.toFixed(2)}</div>
              </div>
              <div class="total-row grand-total">
                <div class="total-label">TOTAL:</div>
                <div class="total-amount">₹${order.total.toFixed(2)}</div>
              </div>
            </div>

            <div class="footer">
              <div class="thank-you">Thank you for your visit!</div>
              ${settings?.upiId ? `<div style="margin: 4px 0; font-size: 9px;">UPI ID: ${settings.upiId}</div>` : ''}
              <div style="margin: 4px 0; font-size: 9px;">Keep this receipt for warranty</div>
              <div style="margin: 4px 0; font-size: 9px;">For queries: ${settings?.storePhone || 'Contact Store'}</div>
              <div class="generated-time">Generated: ${new Date().toLocaleString('en-IN')}</div>
              <div style="margin-top: 4px; font-size: 8px; color: #666;">Powered by Smoocho Bill POS</div>
            </div>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    
    // Auto-print after a short delay
    setTimeout(() => {
      printWindow.print()
    }, 500)

    // Also log to console for debugging
    console.log('Bill Generated for Order:', order.orderNumber)
  }

  return (
    <ResponsiveLayout>
      {/* Desktop Layout with Sidebar Cart */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-6 lg:space-y-0 space-y-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-3 p-4 pb-32 lg:pb-6">
          {/* Responsive Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl lg:text-3xl font-bold text-slate-900">POS System</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm lg:text-base text-slate-600">{activeProducts.length} items available</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                    Tax: {settings?.taxRate || 18}%
                  </span>
                  {settings?.storeName && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {settings.storeName}
                    </span>
                  )}
                  {settings?.upiId && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      UPI: {settings.upiId}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={async () => {
                  await db.reloadMenuData()
                  window.location.reload()
                }}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden lg:inline ml-2">Reload Menu</span>
              </Button>
              {cart.length > 0 && (
                <div className="fixed bottom-24 right-4 z-40 lg:hidden">
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="rounded-full h-14 w-14 shadow-lg bg-green-600 hover:bg-green-700"
                    onClick={() => setShowCheckout(true)}
                  >
                    <ShoppingCart className="h-6 w-6" />
                    <span className="absolute -top-1 -right-1 bg-white text-green-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Compact Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>

          {/* Compact Category Filter */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-3">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap text-xs px-3 py-1 h-8"
              >
                {category}
              </Button>
            ))}
          </div>

          <div className="space-y-4">
          {/* Debug Info */}
          {products.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800">No products found in database. Click "Reload Menu" to load Smoocho menu.</p>
            </div>
          )}
            
          {products.length > 0 && filteredProducts.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-800">No products match current filters. Try changing category or search term.</p>
            </div>
          )}

          {/* Optimized Products Grid - More items, smaller tiles */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-2 lg:gap-3">
            {filteredProducts.map(product => (
              <Card 
                key={product.id} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95 hover:scale-105"
                onClick={() => addToCart(product)}
              >
                <CardContent className="p-2 lg:p-3">
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-md mb-2 flex items-center justify-center border border-slate-200 hover:shadow-sm transition-shadow overflow-hidden">
                    {(() => {
                      const image = getProductImage(product)
                      // Check if it's a base64 image (starts with data:image)
                      if (image.startsWith('data:image')) {
                        return (
                          <img 
                            src={image} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )
                      } else {
                        // It's an emoji
                        return (
                          <span className="text-2xl lg:text-3xl drop-shadow-sm">
                            {image}
                          </span>
                        )
                      }
                    })()}
                  </div>
                  <h3 className="font-medium text-xs lg:text-sm mb-1 line-clamp-2 leading-tight text-center">{product.name}</h3>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold text-sm lg:text-base text-green-600 text-center">
                      {product.price === 0 ? 'APM' : formatCurrency(product.price)}
                    </span>
                    <Button 
                      size="sm" 
                      className="h-6 w-6 lg:h-7 lg:w-7 p-0 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-110 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        addToCart(product)
                      }}
                    >
                      <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Mobile Cart Section - Premium Design */}
          {cart.length > 0 && (
            <Card className="lg:hidden sticky bottom-20 z-10 bg-white shadow-2xl border-2 border-slate-200 backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center text-slate-800">
                    <div className="bg-green-100 p-1.5 rounded-full mr-2">
                      <ShoppingCart className="h-4 w-4 text-green-600" />
                    </div>
                    Cart ({cart.length} items)
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCart}
                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 bg-white">
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500">{formatCurrency(item.price)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-slate-200">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="ml-3 text-right min-w-0">
                        <p className="font-bold text-sm text-green-600">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Discount Section - Mobile */}
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 p-1 rounded-full mr-2">
                      <Percent className="h-3 w-3 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Quick Discount</span>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Input
                      type="number"
                      placeholder={discountType === 'percentage' ? "Discount %" : "Discount ₹"}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="flex-1 h-8 text-sm border-2 focus:border-yellow-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDiscountType(discountType === 'percentage' ? 'flat' : 'percentage')}
                      className="h-8 px-3 text-xs"
                    >
                      {discountType === 'percentage' ? '%' : '₹'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDiscount(0)}
                      className="h-8 px-3 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 px-6 py-3 rounded-b-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-700">
                      <span>Subtotal:</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount ({discount}{discountType === 'percentage' ? '%' : '₹'}):</span>
                        <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-700">
                      <span>Tax ({taxRate}%):</span>
                      <span className="font-semibold">{formatCurrency(tax)}</span>
                    </div>
                    {deliveryCharge > 0 && (
                      <div className="flex justify-between text-slate-700">
                        <span>Delivery Charge:</span>
                        <span className="font-semibold">{formatCurrency(deliveryCharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-800 border-t border-green-200 pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-3"
                    size="lg"
                  >
                    <Receipt className="h-5 w-5 mr-2" />
                    Proceed to Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Desktop Cart Sidebar - Premium Design */}
        {cart.length > 0 && (
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-4 bg-white shadow-xl border-2 border-slate-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center text-slate-800">
                    <div className="bg-green-100 p-2 rounded-full mr-3">
                      <ShoppingCart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">Shopping Cart</div>
                      <div className="text-sm text-slate-600 font-normal">{cart.length} items</div>
                    </div>
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearCart}
                    className="hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200 hover:shadow-md transition-all duration-200">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{formatCurrency(item.price)} each</p>
                      </div>
                      <div className="flex items-center space-x-3 bg-white rounded-lg p-2 border border-slate-200 shadow-sm">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold text-slate-700">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="font-bold text-green-600">{formatCurrency(item.total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Discount Section - Desktop */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
                      <Percent className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="font-medium text-slate-700">Apply Discount</span>
                  </div>
                  <div className="flex gap-2 mb-4">
                    <Input
                      type="number"
                      placeholder={discountType === 'percentage' ? "Discount %" : "Discount ₹"}
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="flex-1 h-10 border-2 focus:border-yellow-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDiscountType(discountType === 'percentage' ? 'flat' : 'percentage')}
                      className="h-10 px-3"
                    >
                      {discountType === 'percentage' ? '%' : '₹'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDiscount(0)}
                      className="h-10 px-4 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      Clear
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 bg-gradient-to-r from-green-50 to-emerald-50 -mx-4 px-4 py-4 rounded-b-xl">
                  <div className="flex justify-between text-slate-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({discount}%):</span>
                      <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-700">
                    <span>Tax ({taxRate}%):</span>
                    <span className="font-semibold">{formatCurrency(tax)}</span>
                  </div>
                  {deliveryCharge > 0 && (
                    <div className="flex justify-between text-slate-700">
                      <span>Delivery Charge:</span>
                      <span className="font-semibold">{formatCurrency(deliveryCharge)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold border-t border-green-200 pt-3 text-slate-800">
                    <span>Total:</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-4"
                  size="lg"
                >
                  <Receipt className="h-5 w-5 mr-2" />
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

        {/* Premium Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 pb-16 lg:pb-0">
            <Card className="w-full lg:w-[600px] max-h-[90vh] lg:max-h-[80vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl rounded-b-none lg:rounded-b-2xl bg-white shadow-2xl border-2 border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100 rounded-t-2xl">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Receipt className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Checkout</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Complete your order</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCheckout(false)}
                  className="hover:bg-red-50 hover:text-red-600 transition-colors rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6 p-6 bg-white">
                {/* Order Summary */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-1.5 rounded-full mr-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800">Order Summary</h3>
                  </div>
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200">
                    <div className="space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                          <div className="flex-1">
                            <span className="font-medium text-slate-800">{item.name}</span>
                            <span className="text-slate-500 ml-2">× {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-green-600">{formatCurrency(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-1.5 rounded-full mr-2">
                      <CreditCard className="h-4 w-4 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800">Payment Method</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <Button
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('cash')}
                      className={`h-14 sm:h-16 flex-col transition-all duration-200 ${paymentMethod === 'cash' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'hover:bg-green-50 hover:border-green-300'}`}
                    >
                      <Banknote className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5 sm:mb-1" />
                      <span className="text-xs sm:text-sm font-medium">Cash</span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'card' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('card')}
                      className={`h-14 sm:h-16 flex-col transition-all duration-200 ${paymentMethod === 'card' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                    >
                      <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5 sm:mb-1" />
                      <span className="text-xs sm:text-sm font-medium">Card</span>
                    </Button>
                    <Button
                      variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('upi')}
                      className={`h-14 sm:h-16 flex-col transition-all duration-200 ${paymentMethod === 'upi' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : 'hover:bg-purple-50 hover:border-purple-300'}`}
                    >
                      <QrCode className="h-5 w-5 sm:h-6 sm:w-6 mb-0.5 sm:mb-1" />
                      <span className="text-xs sm:text-sm font-medium">UPI</span>
                    </Button>
                  </div>
                </div>

                {/* Order Type & Customer Details */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-1.5 rounded-full mr-2">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800">Order Details</h3>
                  </div>
                  
                  {/* Order Type */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Order Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={orderType === 'takeaway' ? 'default' : 'outline'}
                        onClick={() => setOrderType('takeaway')}
                        className={`h-12 flex-col transition-all duration-200 ${orderType === 'takeaway' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' : 'hover:bg-orange-50 hover:border-orange-300'}`}
                      >
                        <span className="text-xs font-medium">Takeaway</span>
                      </Button>
                      <Button
                        variant={orderType === 'dine-in' ? 'default' : 'outline'}
                        onClick={() => setOrderType('dine-in')}
                        className={`h-12 flex-col transition-all duration-200 ${orderType === 'dine-in' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                      >
                        <span className="text-xs font-medium">Dine-in</span>
                      </Button>
                      <Button
                        variant={orderType === 'delivery' ? 'default' : 'outline'}
                        onClick={() => setOrderType('delivery')}
                        className={`h-12 flex-col transition-all duration-200 ${orderType === 'delivery' ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg' : 'hover:bg-green-50 hover:border-green-300'}`}
                      >
                        <span className="text-xs font-medium">Delivery</span>
                      </Button>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Customer Name</label>
                      <Input
                        placeholder="Enter customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="border-2 focus:border-orange-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Phone Number</label>
                      <Input
                        placeholder="Enter phone number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="border-2 focus:border-orange-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Discount & Order Summary */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-1.5 rounded-full mr-2">
                        <Percent className="h-4 w-4 text-yellow-600" />
                      </div>
                      <h3 className="font-semibold text-lg text-slate-800">Order Summary</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-500">Discount:</span>
                      <Input
                        type="number"
                        placeholder="0"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-20 h-8 text-center border-2 focus:border-yellow-400"
                        min="0"
                        max={discountType === 'percentage' ? "100" : undefined}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDiscountType(discountType === 'percentage' ? 'flat' : 'percentage')}
                        className="h-8 px-2 text-xs"
                      >
                        {discountType === 'percentage' ? '%' : '₹'}
                      </Button>
                      {discount > 0 && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setDiscount(0)}
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border-2 border-green-200">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm sm:text-base text-slate-700">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm sm:text-base text-green-600">
                        <span>Discount ({discount}{discountType === 'percentage' ? '%' : '₹'}):</span>
                        <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm sm:text-base text-slate-700">
                      <span>Tax ({taxRate}%):</span>
                      <span className="font-medium">{formatCurrency(tax)}</span>
                    </div>
                    {deliveryCharge > 0 && (
                      <div className="flex justify-between text-sm sm:text-base text-slate-700">
                        <span>Delivery Charge:</span>
                        <span className="font-medium">{formatCurrency(deliveryCharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl sm:text-2xl font-bold border-t border-green-300 pt-3 text-slate-800">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 border-2 border-purple-200">
                    <div className="text-center space-y-4">
                      <div className="flex items-center justify-center">
                        <div className="bg-purple-100 p-2 rounded-full mr-2">
                          <QrCode className="h-5 w-5 text-purple-600" />
                        </div>
                        <h4 className="font-semibold text-lg text-slate-800">UPI Payment</h4>
                      </div>
                      <div className="p-2 sm:p-4 bg-white rounded-lg border border-purple-100">
                        <QRGenerator amount={total} upiId={settings?.upiId || 'pay@smoochobill.com'} onClose={() => setPaymentMethod('cash')} />
                      </div>
                      <p className="text-sm text-slate-500">Scan the QR code to complete payment</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCheckout(false)}
                    className="h-14 text-base sm:text-lg font-semibold hover:bg-slate-50 border-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={completeOrder}
                    className="h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay {formatCurrency(total)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  )
}
