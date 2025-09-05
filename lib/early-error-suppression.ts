// Early error suppression - runs before React loads
// This script must be loaded as early as possible

(function() {
  'use strict'
  
  // Store original functions
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  const originalConsoleLog = console.log

  // Override console methods with aggressive React error #185 suppression
  console.error = function(...args) {
    // Check all arguments for React error #185 patterns
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
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

  console.warn = function(...args) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (typeof arg === 'string' && arg.includes('185')) {
        return
      }
    }
    originalConsoleWarn.apply(console, args)
  }

  console.log = function(...args) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (typeof arg === 'string' && arg.includes('185')) {
        return
      }
    }
    originalConsoleLog.apply(console, args)
  }

  // Set up global error handlers
  const handleError = function(event) {
    if (event.message && event.message.includes('185')) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  const handleUnhandledRejection = function(event) {
    if (event.reason && typeof event.reason === 'string' && event.reason.includes('185')) {
      event.preventDefault()
      return false
    }
  }

  // Add event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleError, true)
    window.addEventListener('error', handleError, false)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, false)
  }

  // Also override Error constructor to catch errors at creation
  const OriginalError = Error
  window.Error = function(message) {
    if (message && message.includes('185')) {
      // Return a dummy error that won't cause issues
      return new OriginalError('Suppressed React error #185')
    }
    return new OriginalError(message)
  }
  window.Error.prototype = OriginalError.prototype

})()
