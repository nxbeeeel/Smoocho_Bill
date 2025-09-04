'use client'

import React, { useEffect, useState } from 'react'
import { autoImageLoader } from '@/lib/auto-image-loader'

interface ImagePreloaderProps {
  onComplete?: () => void
  showProgress?: boolean
}

export function ImagePreloader({ onComplete, showProgress = false }: ImagePreloaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const preloadImages = async () => {
      try {
        setIsLoading(true)
        setProgress(0)
        
        // Preload images in the background
        await autoImageLoader.preloadAllImages()
        
        setProgress(100)
        setIsLoading(false)
        onComplete?.()
      } catch (error) {
        console.error('Image preloading failed:', error)
        setIsLoading(false)
        onComplete?.()
      }
    }

    // Start preloading after a short delay to not block the initial render
    const timer = setTimeout(preloadImages, 100)
    
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!showProgress || !isLoading) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading Images</h3>
          <p className="text-sm text-gray-600 mb-4">Preparing your menu images...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{progress}%</p>
        </div>
      </div>
    </div>
  )
}
