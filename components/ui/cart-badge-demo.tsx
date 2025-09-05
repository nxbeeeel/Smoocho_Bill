"use client"

import React from 'react'
import { CartBadge, MaterialStyleCartBadge, PremiumCartBadge } from './cart-badge'

export function CartBadgeDemo() {
  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Cart Badge Components</h1>
        <p className="text-slate-600">Different styles of shopping cart badges with quantity indicators</p>
      </div>

      {/* Standard Cart Badge */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Standard Cart Badge</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-2">
            <CartBadge count={0} size="sm" variant="emerald" />
            <span className="text-sm text-slate-600">Empty (sm)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CartBadge count={3} size="md" variant="emerald" />
            <span className="text-sm text-slate-600">3 items (md)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CartBadge count={15} size="lg" variant="emerald" />
            <span className="text-sm text-slate-600">15 items (lg)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <CartBadge count={99} size="md" variant="red" />
            <span className="text-sm text-slate-600">99+ items (red)</span>
          </div>
        </div>
      </div>

      {/* Material Style Cart Badge */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Material-UI Style Cart Badge</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-2">
            <MaterialStyleCartBadge count={0} size="sm" variant="emerald" />
            <span className="text-sm text-slate-600">Empty (sm)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MaterialStyleCartBadge count={5} size="md" variant="emerald" />
            <span className="text-sm text-slate-600">5 items (md)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MaterialStyleCartBadge count={25} size="lg" variant="blue" />
            <span className="text-sm text-slate-600">25 items (blue)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MaterialStyleCartBadge count={150} size="md" variant="red" />
            <span className="text-sm text-slate-600">99+ items (red)</span>
          </div>
        </div>
      </div>

      {/* Premium Cart Badge */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Premium Cart Badge</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col items-center gap-2">
            <PremiumCartBadge count={0} size="sm" variant="emerald" />
            <span className="text-sm text-slate-600">Empty (sm)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PremiumCartBadge count={7} size="md" variant="emerald" />
            <span className="text-sm text-slate-600">7 items (md)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PremiumCartBadge count={42} size="lg" variant="blue" />
            <span className="text-sm text-slate-600">42 items (blue)</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PremiumCartBadge count={200} size="md" variant="red" />
            <span className="text-sm text-slate-600">99+ items (red)</span>
          </div>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Interactive Demo</h2>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-slate-600 mb-4">Click the badges to see them in action:</p>
          <div className="flex flex-wrap gap-4">
            <CartBadge 
              count={12} 
              size="md" 
              variant="emerald" 
              onClick={() => alert('Standard badge clicked!')}
            />
            <MaterialStyleCartBadge 
              count={8} 
              size="md" 
              variant="blue" 
              onClick={() => alert('Material style badge clicked!')}
            />
            <PremiumCartBadge 
              count={23} 
              size="md" 
              variant="red" 
              onClick={() => alert('Premium badge clicked!')}
            />
          </div>
        </div>
      </div>

      {/* Usage Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800">Usage Examples</h2>
        <div className="bg-slate-900 text-slate-100 p-6 rounded-lg font-mono text-sm overflow-x-auto">
          <pre>{`// Standard Cart Badge
<CartBadge 
  count={cartItems.length} 
  size="md" 
  variant="emerald" 
  onClick={() => setShowCart(true)}
/>

// Material-UI Style
<MaterialStyleCartBadge 
  count={totalQuantity} 
  size="lg" 
  variant="blue" 
/>

// Premium Floating Badge
<PremiumCartBadge 
  count={cart.reduce((sum, item) => sum + item.quantity, 0)} 
  size="md" 
  variant="emerald" 
  onClick={() => setShowCartModal(true)}
/>`}</pre>
        </div>
      </div>
    </div>
  )
}
