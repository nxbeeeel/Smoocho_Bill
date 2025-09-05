"use client"

import React from 'react'
import { ProtectedRoute } from '@/components/auth/protected-route'
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
import { AutoProductImage } from '@/components/ui/auto-product-image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, calculateTax, generateOrderNumber } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'
import { db, Product } from '@/lib/database'
import { useLiveQuery } from 'dexie-react-hooks'
import { QRGenerator } from '@/components/ui/qr-generator'
import { thermalPrinter } from '@/lib/printer'

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
  const [showCartModal, setShowCartModal] = React.useState(false)

  // Live query for products from database - get all products first, then filter
  const products = useLiveQuery(() => db.products.toArray()) || []
  const activeProducts = products.filter(p => p.isActive)

  // Ensure menu data is loaded on component mount (only once)
  React.useEffect(() => {
    const ensureMenuData = async () => {
      const productCount = await db.products.count()
      if (productCount === 0) {
        console.log('No products found in POS - Ensuring menu data is loaded...')
        await db.ensureMenuData()
      }
    }
    ensureMenuData()
  }, []) // Empty dependency array - run only once on mount

  // Get unique categories from products
  const categories = ['All', ...Array.from(new Set(activeProducts.map(p => p.category).filter(Boolean)))]

  // Filter products based on search and category
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
    setCart(cart.filter(item => item.id !== id))
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
    try {
      // Generate receipt content using thermal printer
      const receiptContent = thermalPrinter.generateReceiptContent(order, settings)
      
      // Try direct printing to built-in printer
      const printSuccess = await thermalPrinter.printDirect(receiptContent, {
        width: 80,
        fontSize: 12,
        fontFamily: 'Courier New, monospace',
        margin: 5
      })

      if (printSuccess) {
        toast({
          title: "Receipt Printed",
          description: "Receipt sent to built-in printer successfully",
        })
        console.log('Bill printed to built-in printer for Order:', order.orderNumber)
      } else {
        // Fallback to traditional printing if direct print fails
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Receipt - ${order.orderNumber}</title>
                <style>
                  @page { size: 80mm auto; margin: 0; }
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.2; width: 80mm; max-width: 80mm; margin: 0 auto; padding: 5mm; background: white; color: black; }
                  @media print { body { margin: 0; padding: 2mm; } }
                </style>
              </head>
              <body>
                ${receiptContent}
              </body>
            </html>
          `)
          printWindow.document.close()
          
          setTimeout(() => {
            printWindow.print()
            setTimeout(() => printWindow.close(), 1000)
          }, 500)
          
          toast({
            title: "Receipt Printed",
            description: "Receipt opened in print dialog",
          })
        }
      }
    } catch (error) {
      console.error('Print error:', error)
      toast({
        title: "Print Error",
        description: "Failed to print receipt. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <ProtectedRoute>
      <ResponsiveLayout>
      <div className="space-y-4 p-4 pb-24 lg:pb-4">
        {/* Main Content Area - Responsive Grid Layout */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-6 space-y-4 lg:space-y-0">
          {/* Products Section - Takes 3 columns on laptop, full width on mobile */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mobile-Optimized Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">POS System</h1>
                  <p className="text-sm text-slate-600">{activeProducts.length} items available</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    await db.reloadMenuData()
                    window.location.reload()
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Reload</span>
                </Button>
              </div>
              
              {/* Settings Status - Mobile Friendly */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
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
              {categories.map((category, index) => (
                <Button
                  key={category || `category-${index}`}
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

              {/* Mobile-Optimized Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredProducts.map((product, index) => {
                  const cartItem = cart.find(item => item.id === product.id)
                  const quantity = cartItem ? cartItem.quantity : 0
                  
                  return (
                    <Card 
                      key={product.id || `product-${index}`} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 active:scale-95 hover:scale-105 relative"
                      onClick={() => addToCart(product)}
                    >
                      {/* Permanent Quantity Indicator */}
                      {quantity > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
                            {quantity}
                          </div>
                        </div>
                      )}
                      
                      <CardContent className="p-3">
                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg mb-3 flex items-center justify-center border border-slate-200 hover:shadow-sm transition-shadow overflow-hidden relative">
                          <AutoProductImage 
                            product={product}
                            className="w-full h-full object-cover"
                            fallbackClassName="text-3xl drop-shadow-sm"
                          />
                          {/* Permanent overlay for items in cart */}
                          {quantity > 0 && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-10 rounded-lg"></div>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight text-center text-slate-800">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-green-600">
                            {product.price === 0 ? 'APM' : formatCurrency(product.price)}
                          </span>
                          <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-110 rounded-full shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              addToCart(product)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Cart Section - Right side on laptop, floating button on mobile */}
          <div className="lg:col-span-1">
            {/* Desktop Cart Sidebar */}
            {cart.length > 0 && (
              <div className="hidden lg:block">
                <Card className="sticky top-4 bg-gradient-to-br from-slate-50 to-slate-100 shadow-2xl border-2 border-slate-300/50 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center text-white">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-full mr-3 shadow-lg">
                          <ShoppingCart className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">Shopping Cart</div>
                          <div className="text-sm text-slate-300 font-normal">{cart.length} items</div>
                        </div>
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearCart}
                        className="hover:bg-red-500/20 hover:text-red-400 transition-colors text-slate-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-sm">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h4>
                            <p className="text-xs text-slate-500">{formatCurrency(item.price)} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg p-1 border border-slate-300/50">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 hover:bg-red-500/20 hover:text-red-600 text-slate-600"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 hover:bg-blue-500/20 hover:text-blue-600 text-slate-600"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="ml-3 text-right min-w-0">
                            <p className="font-bold text-sm text-blue-600">{formatCurrency(item.total)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-4 mt-4 border border-slate-700">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-orange-400">
                            <span>Discount ({discount}{discountType === 'percentage' ? '%' : '₹'}):</span>
                            <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-300">
                          <span>Tax ({taxRate}%):</span>
                          <span className="font-semibold text-white">{formatCurrency(tax)}</span>
                        </div>
                        {deliveryCharge > 0 && (
                          <div className="flex justify-between text-slate-300">
                            <span>Delivery:</span>
                            <span className="font-semibold text-white">{formatCurrency(deliveryCharge)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between text-xl font-bold border-t border-slate-600 pt-3 text-white">
                        <span>Total:</span>
                        <span className="text-blue-400">{formatCurrency(total)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-4"
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
        </div>

        {/* Premium Floating Cart Button - Mobile */}
        {cart.length > 0 && (
          <div className="fixed bottom-24 right-4 z-50 lg:hidden">
            <div className="relative">
              {/* Outer glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
              
              {/* Main button */}
              <button 
                className="relative rounded-full h-16 w-16 shadow-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 hover:from-slate-600 hover:via-slate-700 hover:to-slate-800 transition-all duration-300 hover:scale-110 border-2 border-white/20 backdrop-blur-sm cursor-pointer flex items-center justify-center"
                onClick={() => setShowCartModal(true)}
              >
                {/* Inner shine effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent"></div>
                
                {/* Cart icon with premium styling */}
                <div className="relative z-10">
                  <ShoppingCart className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
                
                {/* Premium quantity badge */}
                <div className="absolute -top-1 -right-1 z-20">
                  <div className="relative">
                    {/* Badge glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-sm opacity-80"></div>
                    
                    {/* Badge content */}
                    <div className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center border-2 border-white shadow-lg">
                      {cart.reduce((total, item) => total + item.quantity, 0)}
                    </div>
                  </div>
                </div>
                
                {/* Subtle animation ring */}
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20"></div>
              </button>
            </div>
          </div>
        )}

        {/* Cart Modal - Mobile */}
        {showCartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end lg:hidden">
            <div className="bg-white w-full max-h-[85vh] rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out pb-24">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">Cart ({cart.length} items)</h2>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowCartModal(false)}
                    className="hover:bg-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
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
                
                {/* Quick Discount */}
                <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-100 p-1 rounded-full mr-2">
                      <Percent className="h-3 w-3 text-yellow-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">Quick Discount</span>
                  </div>
                  <div className="flex gap-2">
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

                {/* Order Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mt-4">
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
                        <span>Delivery:</span>
                        <span className="font-semibold">{formatCurrency(deliveryCharge)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-slate-800 border-t border-green-300 pt-2">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 pb-6 border-t border-gray-200 bg-gray-50">
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCartModal(false)}
                    className="h-12 font-semibold"
                  >
                    Continue Shopping
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowCartModal(false)
                      setShowCheckout(true)
                    }}
                    className="h-12 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Checkout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Premium Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end lg:items-center justify-center z-50 pb-24 lg:pb-0">
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

                {/* Order Type */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-1.5 rounded-full mr-2">
                      <User className="h-4 w-4 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800">Order Type</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <Button
                      variant={orderType === 'takeaway' ? 'default' : 'outline'}
                      onClick={() => setOrderType('takeaway')}
                      className={`h-12 sm:h-14 flex-col transition-all duration-200 ${orderType === 'takeaway' ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' : 'hover:bg-orange-50 hover:border-orange-300'}`}
                    >
                      <span className="text-xs sm:text-sm font-medium">Takeaway</span>
                    </Button>
                    <Button
                      variant={orderType === 'delivery' ? 'default' : 'outline'}
                      onClick={() => setOrderType('delivery')}
                      className={`h-12 sm:h-14 flex-col transition-all duration-200 ${orderType === 'delivery' ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg' : 'hover:bg-blue-50 hover:border-blue-300'}`}
                    >
                      <span className="text-xs sm:text-sm font-medium">Delivery</span>
                    </Button>
                    <Button
                      variant={orderType === 'dine-in' ? 'default' : 'outline'}
                      onClick={() => setOrderType('dine-in')}
                      className={`h-12 sm:h-14 flex-col transition-all duration-200 ${orderType === 'dine-in' ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' : 'hover:bg-green-50 hover:border-green-300'}`}
                    >
                      <span className="text-xs sm:text-sm font-medium">Dine-in</span>
                    </Button>
                  </div>
                </div>

                {/* Customer Details */}
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 p-1.5 rounded-full mr-2">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-lg text-slate-800">Customer Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Name (Optional)</label>
                      <Input
                        placeholder="Customer name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phone (Optional)</label>
                      <Input
                        type="tel"
                        placeholder="Phone number"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Order Total */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                  <div className="space-y-3">
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
                    <div className="flex justify-between text-2xl font-bold text-slate-800 border-t-2 border-green-300 pt-3">
                      <span>Total:</span>
                      <span className="text-green-600">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Complete Order Button */}
                <Button 
                  onClick={completeOrder}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-lg py-4 shadow-xl hover:shadow-2xl transition-all duration-200"
                  size="lg"
                >
                  <Receipt className="h-6 w-6 mr-3" />
                  Complete Order - {formatCurrency(total)}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      </ResponsiveLayout>
    </ProtectedRoute>
  )
}