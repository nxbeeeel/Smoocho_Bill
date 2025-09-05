"use client"

import React from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
}

/**
 * ResponsiveLayout - Professional responsive layout component
 * Provides consistent layout structure across all screen sizes
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "min-h-screen bg-gray-50",
      "flex flex-col",
      className
    )}>
      {children}
    </div>
  )
}
