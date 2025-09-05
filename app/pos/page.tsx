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
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CartBadge, PremiumCartBadge } from '@/components/ui/cart-badge'
import { formatCurrency, calculateTax, generateOrderNumber } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'
import { db, Product } from '@/lib/database'
import { useLiveQuery } from 'dexie-react-hooks'
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
  // const [showQR, setShowQR] = React.useState(false)
  const [customerName, setCustomerName] = React.useState('')
  const [customerPhone, setCustomerPhone] = React.useState('')
  const [showCartModal, setShowCartModal] = React.useState(false)
  const [autoPrint, setAutoPrint] = React.useState(true)
  const [soundEnabled, setSoundEnabled] = React.useState(true)
  const [showPrices, setShowPrices] = React.useState(true)
  const [compactView, setCompactView] = React.useState(false)

  // Live query for products from database - get all products first, then filter
  const products = useLiveQuery(() => db.products.toArray()) || []
  const activeProducts = products.filter(p => p.isActive)
  const [isLoadingProducts, setIsLoadingProducts] = React.useState(true)

  // Ensure menu data is loaded on component mount (only once)
  React.useEffect(() => {
    const ensureMenuData = async () => {
      try {
        const productCount = await db.products.count()
        if (productCount === 0) {
          console.log('No products found in POS - Ensuring menu data is loaded...')
          await db.ensureMenuData()
        }
        setIsLoadingProducts(false)
      } catch (error) {
        console.error('Error ensuring menu data:', error)
        toast({
          title: "Menu Loading Error",
          description: "Failed to load menu data. Please refresh the page.",
          variant: "destructive"
        })
        setIsLoadingProducts(false)
      }
    }
    ensureMenuData()
  }, []) // Empty dependency array - run only once on mount

  // Update loading state when products are loaded
  React.useEffect(() => {
    if (products.length > 0) {
      setIsLoadingProducts(false)
    }
  }, [products])

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
    } catch {
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
    } catch {
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
        <div className="lg:grid lg:grid-cols-5 lg:gap-6 space-y-4 lg:space-y-0">
          {/* Products Section - Takes 3 columns on laptop, full width on mobile */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mobile-Optimized Header */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg shadow-lg border border-slate-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-bold text-white">POS System</h1>
                  <p className="text-sm text-slate-300">{activeProducts.length} items available</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* Cart Badge for Mobile */}
                  {cart.length > 0 && (
                    <div className="lg:hidden">
                      <CartBadge 
                        count={cart.reduce((total, item) => total + item.quantity, 0)}
                        size="sm"
                        variant="emerald"
                        onClick={() => setShowCartModal(true)}
                      />
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={async () => {
                      try {
                        await db.reloadMenuData()
                        toast({
                          title: "Menu Reloaded",
                          description: "Menu data has been refreshed successfully.",
                        })
                        window.location.reload()
                      } catch (error) {
                        console.error('Error reloading menu:', error)
                        toast({
                          title: "Reload Failed",
                          description: "Failed to reload menu data. Please try again.",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Reload</span>
                  </Button>
                </div>
              </div>
              
              {/* Settings Status - Mobile Friendly */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Tax: {settings?.taxRate || 18}%
                </span>
                {settings?.storeName && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
                    {settings.storeName}
                  </span>
                )}
                {settings?.upiId && (
                  <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">
                    UPI: {settings.upiId}
                  </span>
                )}
              </div>
              
              {/* POS Controls */}
              <div className="flex flex-wrap items-center gap-4 mt-3 pt-3 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-print" 
                    checked={autoPrint}
                    onCheckedChange={setAutoPrint}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="auto-print" className="text-xs text-slate-300">Auto Print</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="sound-enabled" 
                    checked={soundEnabled}
                    onCheckedChange={setSoundEnabled}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="sound-enabled" className="text-xs text-slate-300">Sound</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="show-prices" 
                    checked={showPrices}
                    onCheckedChange={setShowPrices}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="show-prices" className="text-xs text-slate-300">Show Prices</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="compact-view" 
                    checked={compactView}
                    onCheckedChange={setCompactView}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                  <Label htmlFor="compact-view" className="text-xs text-slate-300">Compact View</Label>
                </div>
              </div>
            </div>

            {/* Compact Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm bg-slate-900 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
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
                  className={`whitespace-nowrap text-xs px-3 py-1 h-8 ${
                    selectedCategory === category 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg' 
                      : 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-slate-900'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {/* Debug Info */}
              {isLoadingProducts && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-8 mb-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                  <p className="text-emerald-300">Loading menu items...</p>
                </div>
              )}

              {!isLoadingProducts && products.length === 0 && (
                <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-4">
                  <p className="text-amber-200">No products found in database. Click &quot;Reload Menu&quot; to load Smoocho menu.</p>
                </div>
              )}
                
              {!isLoadingProducts && products.length > 0 && filteredProducts.length === 0 && (
                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-4">
                  <p className="text-slate-300">No products match current filters. Try changing category or search term.</p>
                </div>
              )}

              {/* Mobile-Optimized Products Grid */}
              {!isLoadingProducts && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredProducts.map((product, index) => {
                  const cartItem = cart.find(item => item.id === product.id)
                  const quantity = cartItem ? cartItem.quantity : 0
                  
                  return (
                    <Card 
                      key={product.id || `product-${index}`} 
                      className="cursor-pointer hover:shadow-xl transition-all duration-200 active:scale-95 hover:scale-105 relative bg-slate-900 border-slate-800 hover:border-emerald-500 shadow-lg"
                      onClick={() => addToCart(product)}
                    >
                      {/* Permanent Quantity Indicator */}
                      {quantity > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg border-2 border-slate-900">
                            {quantity}
                          </div>
                        </div>
                      )}
                      
                      <CardContent className="p-3">
                        <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg mb-3 flex items-center justify-center border border-slate-700 hover:shadow-sm transition-shadow overflow-hidden relative">
                          <AutoProductImage 
                            product={product}
                            className="w-full h-full object-cover"
                            fallbackClassName="text-3xl drop-shadow-sm text-slate-400"
                          />
                          {/* Permanent overlay for items in cart */}
                          {quantity > 0 && (
                            <div className="absolute inset-0 bg-emerald-500 bg-opacity-20 rounded-lg"></div>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight text-center text-white">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base text-emerald-400">
                            {product.price === 0 ? 'APM' : formatCurrency(product.price)}
                          </span>
                          <Button 
                            size="sm" 
                            className="h-8 w-8 p-0 bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:scale-110 rounded-full shadow-lg"
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
              )}
            </div>
          </div>

          {/* Cart Section - Right side on laptop, floating button on mobile */}
          <div className="lg:col-span-2">
            {/* Desktop Cart Sidebar */}
            {cart.length > 0 && (
              <div className="hidden lg:block">
                <Card className="sticky top-4 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl border-2 border-slate-700 backdrop-blur-sm h-fit max-h-[calc(100vh-2rem)]">
                  <CardHeader className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center text-white">
                        <div className="mr-3">
                          <CartBadge 
                            count={cart.reduce((total, item) => total + item.quantity, 0)}
                            size="md"
                            variant="emerald"
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600"
                          />
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
                  <CardContent className="p-4 bg-gradient-to-br from-slate-900 to-slate-800">
                    <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={item.id || `cart-item-${index}`} className="flex items-center justify-between p-4 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-sm">
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="font-semibold text-sm text-white truncate">{item.name}</h4>
                            <p className="text-xs text-slate-400">{formatCurrency(item.price)} × {item.quantity}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg p-1 border border-slate-700/50">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-400"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-right min-w-0">
                              <p className="font-bold text-sm text-emerald-400">{formatCurrency(item.total)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Order Summary */}
                    <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-lg p-4 mt-4 border border-slate-700">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                          <span>Subtotal:</span>
                          <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-amber-400">
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
                        <span className="text-emerald-400">{formatCurrency(total)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 mt-4"
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
            <PremiumCartBadge 
              count={cart.reduce((total, item) => total + item.quantity, 0)}
              size="md"
              variant="emerald"
              onClick={() => setShowCartModal(true)}
            />
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
                  {cart.map((item, index) => (
                    <div key={item.id || `cart-item-${index}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
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
                      {cart.map((item, index) => (
                        <div key={item.id || `cart-item-${index}`} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
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