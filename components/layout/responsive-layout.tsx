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
      // Use 1024px as breakpoint - below this use mobile layout (tablets and phones)
      // Above this use desktop layout (laptops and desktops)
      setIsMobile(window.innerWidth < 1024)
    }

    // Check on mount
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Use mobile layout for tablets and phones, desktop layout for laptops and PCs
  if (isMobile) {
    return <MobileLayout>{children}</MobileLayout>
  }

  return <MainLayout>{children}</MainLayout>
}
