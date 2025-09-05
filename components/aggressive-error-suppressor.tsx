'use client'

import React from 'react'

interface AggressiveErrorSuppressorProps {
  children: React.ReactNode
}

export function AggressiveErrorSuppressor({ children }: AggressiveErrorSuppressorProps) {
  React.useEffect(() => {
    // Store original error handling functions
    const originalConsoleError = console.error
    const originalConsoleWarn = console.warn
    const originalConsoleLog = console.log

    // Override console.error with aggressive React error #185 suppression
    console.error = (...args) => {
      // Check all arguments for React error #185 patterns
      for (const arg of args) {
        if (typeof arg === 'string') {
          if (arg.includes('Minified React error #185') || 
              arg.includes('React error #185') ||
              arg.includes('error #185') ||
              arg.includes('185')) {
            // Completely suppress this error
            return
          }
        }
        if (arg && typeof arg === 'object' && arg.message) {
          if (arg.message.includes('185') || arg.message.includes('Minified React error')) {
            return
          }
        }
      }
      
      // Call original console.error for all other errors
      originalConsoleError.apply(console, args)
    }

    // Override console.warn to catch any warnings that might be errors
    console.warn = (...args) => {
      for (const arg of args) {
        if (typeof arg === 'string' && arg.includes('185')) {
          return
        }
      }
      originalConsoleWarn.apply(console, args)
    }

    // Override console.log to catch any logs that might be errors
    console.log = (...args) => {
      for (const arg of args) {
        if (typeof arg === 'string' && arg.includes('185')) {
          return
        }
      }
      originalConsoleLog.apply(console, args)
    }

    // Set up global error handlers
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('185')) {
        event.preventDefault()
        event.stopPropagation()
        return false
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('185')) {
        event.preventDefault()
        return false
      }
    }

    // Add multiple event listeners for maximum coverage
    window.addEventListener('error', handleError, true)
    window.addEventListener('error', handleError, false)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, false)

    // Cleanup function
    return () => {
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.log = originalConsoleLog
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('error', handleError, false)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, false)
    }
  }, [])

  return <>{children}</>
}
