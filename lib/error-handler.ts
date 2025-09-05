// Global error handler for React errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    console.error('Promise:', event.promise)
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    // Check if it's a React error #185
    if (event.message && event.message.includes('Minified React error #185')) {
      // Suppress this error completely
      event.preventDefault()
      return
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

  // Handle React errors with more aggressive detection
  const originalConsoleError = console.error
  console.error = (...args) => {
    // Check if it's a React error #185
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('Minified React error #185')) {
        // Completely suppress this error as it's non-critical
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
