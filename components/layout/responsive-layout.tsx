'use client'

import React from 'react'
import { MainLayout } from './main-layout'
import { MobileLayout } from './mobile-layout'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const checkScreenSize = () => {
      // Use 768px (md breakpoint) as the threshold for better mobile optimization
      // Below 768px: Mobile layout (phones)
      // Above 768px: Desktop layout (tablets, laptops and desktops)
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsLoading(false)
      
      // Debug log
      console.log(`Screen width: ${window.innerWidth}px, Using ${mobile ? 'Mobile' : 'Desktop'} layout`)
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events with debouncing
    let timeoutId: NodeJS.Timeout
    const debouncedCheck = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkScreenSize, 100)
    }

    window.addEventListener('resize', debouncedCheck)

    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedCheck)
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

  // Use mobile layout for tablets and phones, desktop layout for laptops and PCs
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>
  }

  return <MainLayout>{children}</MainLayout>
}
