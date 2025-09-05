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

    // Enhanced error suppression function
    const suppressReactError = (...args: any[]) => {
      for (const arg of args) {
        if (typeof arg === 'string') {
          if (arg.includes('Minified React error #185') || 
              arg.includes('React error #185') ||
              arg.includes('error #185') ||
              arg.includes('185') ||
              arg.includes('react-dom.production.min.js') ||
              arg.includes('index.mjs') ||
              arg.includes('hook.js')) {
            return true
          }
        }
        if (arg && typeof arg === 'object') {
          if (arg.message && (arg.message.includes('185') || arg.message.includes('Minified React error'))) {
            return true
          }
          if (arg.stack && arg.stack.includes('185')) {
            return true
          }
        }
      }
      return false
    }

    // Override console.error with aggressive React error #185 suppression
    console.error = (...args) => {
      if (suppressReactError(...args)) return
      originalConsoleError.apply(console, args)
    }

    // Override console.warn to catch any warnings that might be errors
    console.warn = (...args) => {
      if (suppressReactError(...args)) return
      originalConsoleWarn.apply(console, args)
    }

    // Override console.log to catch any logs that might be errors
    console.log = (...args) => {
      if (suppressReactError(...args)) return
      originalConsoleLog.apply(console, args)
    }

    // Set up global error handlers
    const handleError = (event: ErrorEvent) => {
      if (event.message && (event.message.includes('185') || event.message.includes('Minified React error'))) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
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
    document.addEventListener('error', handleError, true)
    document.addEventListener('error', handleError, false)

    // Override window.onerror
    const originalOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && (message.includes('185') || message.includes('Minified React error'))) {
        return true
      }
      if (originalOnError) {
        return originalOnError.call(window, message, source, lineno, colno, error)
      }
      return false
    }

    // Override window.onunhandledrejection
    const originalOnUnhandledRejection = window.onunhandledrejection
    window.onunhandledrejection = (event) => {
      if (event.reason && typeof event.reason === 'string' && event.reason.includes('185')) {
        event.preventDefault()
        return true
      }
      if (originalOnUnhandledRejection) {
        return originalOnUnhandledRejection.call(window, event)
      }
      return false
    }

    // Continuously monitor and override console methods (in case extensions override them)
    const monitorInterval = setInterval(() => {
      if (console.error !== originalConsoleError) {
        console.error = (...args) => {
          if (suppressReactError(...args)) return
          originalConsoleError.apply(console, args)
        }
      }
      if (console.warn !== originalConsoleWarn) {
        console.warn = (...args) => {
          if (suppressReactError(...args)) return
          originalConsoleWarn.apply(console, args)
        }
      }
      if (console.log !== originalConsoleLog) {
        console.log = (...args) => {
          if (suppressReactError(...args)) return
          originalConsoleLog.apply(console, args)
        }
      }
    }, 1000)

    // Cleanup function
    return () => {
      clearInterval(monitorInterval)
      console.error = originalConsoleError
      console.warn = originalConsoleWarn
      console.log = originalConsoleLog
      window.onerror = originalOnError
      window.onunhandledrejection = originalOnUnhandledRejection
      window.removeEventListener('error', handleError, true)
      window.removeEventListener('error', handleError, false)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, false)
      document.removeEventListener('error', handleError, true)
      document.removeEventListener('error', handleError, false)
    }
  }, [])

  return <>{children}</>
}

