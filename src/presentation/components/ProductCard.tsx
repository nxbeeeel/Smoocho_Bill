import React from 'react'
import { Product } from '../../domain/entities/Product'
import { useCart } from '../hooks/useCart'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  showAddButton?: boolean
  compact?: boolean
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  showAddButton = true,
  compact = false
}) => {
  const { addToCart, getProductQuantity } = useCart()
  const quantityInCart = getProductQuantity(product.id.value)

  const handleAddToCart = () => {
    const result = addToCart(product, 1)
    if (result.success && onAddToCart) {
      onAddToCart(product)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border">
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{product.name.value}</h3>
          <p className="text-sm text-gray-500">₹{product.price.value.toFixed(2)}</p>
        </div>
        {showAddButton && product.isAvailable() && (
          <button
            onClick={handleAddToCart}
            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
          >
            {quantityInCart > 0 ? `+${quantityInCart}` : 'Add'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
      {product.hasImage() && (
        <div className="aspect-square bg-gray-100">
          <img
            src={product.imageUrl}
            alt={product.name.value}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900 line-clamp-2">
            {product.name.value}
          </h3>
          <span className="text-lg font-semibold text-gray-900">
            ₹{product.price.value.toFixed(2)}
          </span>
        </div>
        
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category.value}
          </span>
          
          {showAddButton && product.isAvailable() && (
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {quantityInCart > 0 ? `Add (${quantityInCart})` : 'Add to Cart'}
            </button>
          )}
          
          {!product.isAvailable() && (
            <span className="text-sm text-red-500">Unavailable</span>
          )}
        </div>
      </div>
    </div>
  )
}
