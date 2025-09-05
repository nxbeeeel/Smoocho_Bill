'use client'

import React from 'react'

interface ReactErrorSuppressorProps {
  children: React.ReactNode
}

export function ReactErrorSuppressor({ children }: ReactErrorSuppressorProps) {
  React.useEffect(() => {
    // Override console.error to suppress React error #185
    const originalConsoleError = console.error
    console.error = (...args) => {
      // Check if it's a React error #185
      if (args[0] && typeof args[0] === 'string') {
        if (args[0].includes('Minified React error #185')) {
          // Completely suppress this error
          return
        }
      }
      
      // Call original console.error for all other errors
      originalConsoleError.apply(console, args)
    }

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalConsoleError
    }
  }, [])

  return <>{children}</>
}
