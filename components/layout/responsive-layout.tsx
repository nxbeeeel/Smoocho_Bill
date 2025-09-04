'use client'

import React from 'react'
import { MainLayout } from './main-layout'
import { MobileLayout } from './mobile-layout'

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkScreenSize = () => {
      // Use 1024px (lg breakpoint) as the threshold
      // Below 1024px: Mobile layout (tablets and phones)
      // Above 1024px: Desktop layout (laptops and desktops)
      setIsMobile(window.innerWidth < 1024)
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

  // Use mobile layout for tablets and phones, desktop layout for laptops and PCs
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>
  }

  return <MainLayout>{children}</MainLayout>
}
