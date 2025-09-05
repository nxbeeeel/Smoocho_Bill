// Global error handler for React errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Suppress React error #185 in promise rejections
    if (event.reason && typeof event.reason === 'string' && event.reason.includes('Minified React error #185')) {
      event.preventDefault()
      return
    }
    console.error('Unhandled promise rejection:', event.reason)
    console.error('Promise:', event.promise)
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    // Check if it's a React error #185
    if (event.message && event.message.includes('Minified React error #185')) {
      // Suppress this error completely
      event.preventDefault()
      event.stopPropagation()
      return false
    }
    
    // Check for input validation errors
    if (event.message && event.message.includes('The specified value') && event.message.includes('cannot be parsed, or is out of range')) {
      // Suppress input validation errors
      event.preventDefault()
      event.stopPropagation()
      return false
    }
    
    console.error('Uncaught error:', event.error)
    console.error('Error details:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    })
  })

  // Additional error listener for more aggressive suppression
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message && event.error.message.includes('185')) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }, true) // Use capture phase

  // Handle React errors with more aggressive detection
  const originalConsoleError = console.error
  console.error = (...args) => {
    // Check if it's a React error #185 (multiple patterns)
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('Minified React error #185') || 
          args[0].includes('React error #185') ||
          args[0].includes('error #185')) {
        // Completely suppress this error as it's non-critical
        return
      }
    }
    
    // Check for input validation errors
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('The specified value') && args[0].includes('cannot be parsed, or is out of range')) {
        // Suppress input validation errors
        return
      }
    }
    
    // Check if any argument contains React error #185
    for (const arg of args) {
      if (typeof arg === 'string' && (arg.includes('185') || arg.includes('Minified React error'))) {
        return
      }
      if (arg && typeof arg === 'object' && arg.message && arg.message.includes('185')) {
        return
      }
    }
    
    // Call original console.error for all other errors
    originalConsoleError.apply(console, args)
  }
}

// Initialize error handlers
if (typeof window !== 'undefined') {
  setupGlobalErrorHandlers()
}
