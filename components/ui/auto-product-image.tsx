'use client'

import React, { useState, useEffect } from 'react'
import { Product } from '@/lib/database'
import { autoImageLoader } from '@/lib/auto-image-loader'

interface AutoProductImageProps {
  product: Product
  className?: string
  fallbackClassName?: string
}

export function AutoProductImage({ product, className = "w-full h-full object-cover", fallbackClassName = "text-4xl" }: AutoProductImageProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  // const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        // First check if product has an uploaded image
        if (product.image && product.image.trim() !== '') {
          setImageSrc(product.image)
          setIsLoading(false)
          return
        }

        // Try to get image from auto loader
        const result = await autoImageLoader.getImage(product.name)
        
        if (result.success && result.image) {
          setImageSrc(result.image)
        } else {
          // Use fallback emoji
          const fallbackEmoji = autoImageLoader.getFallbackEmoji(product.category)
          setImageSrc(fallbackEmoji)
        }
      } catch (error) {
        console.log('Auto image loading failed:', error)
        // Use fallback emoji
        const fallbackEmoji = autoImageLoader.getFallbackEmoji(product.category)
        setImageSrc(fallbackEmoji)
        setHasError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [product.name, product.image, product.category])

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if it's a base64 image or emoji
  if (imageSrc.startsWith('data:image')) {
    return (
      <img 
        src={imageSrc} 
        alt={product.name}
        className={className}
        onError={() => {
          setHasError(true)
          const fallbackEmoji = autoImageLoader.getFallbackEmoji(product.category)
          setImageSrc(fallbackEmoji)
        }}
      />
    )
  } else {
    // It's an emoji fallback
    return (
      <div className={`w-full h-full flex items-center justify-center ${fallbackClassName}`}>
        {imageSrc}
      </div>
    )
  }
}
