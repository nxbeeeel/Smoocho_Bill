'use client'

import React from 'react'
import { MainLayout } from './main-layout'
import { MobileLayout } from './mobile-layout'
import { TabletLayout } from './tablet-layout'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [deviceType, setDeviceType] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1024
      let type: 'mobile' | 'tablet' | 'desktop'
      
      if (width < 768) {
        type = 'mobile' // Phones
      } else if (width < 1024) {
        type = 'tablet' // Tablets
      } else {
        type = 'desktop' // Laptops and desktops
      }
      
      setDeviceType(type)
      setIsLoading(false)
      
      // Debug log
      console.log(`Screen width: ${width}px, Using ${type} layout`)
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events with debouncing
    let timeoutId: NodeJS.Timeout
    const debouncedCheck = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkScreenSize, 100)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedCheck)
    }

    // Cleanup
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', debouncedCheck)
      }
      clearTimeout(timeoutId)
    }
  }, [])

  // Show loading state briefly to prevent layout shift
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Use appropriate layout based on device type
  if (deviceType === 'mobile') {
    return <MobileLayout>{children}</MobileLayout>
  } else if (deviceType === 'tablet') {
    return <TabletLayout>{children}</TabletLayout>
  }

  return <MainLayout>{children}</MainLayout>
}
