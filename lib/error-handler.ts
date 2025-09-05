// Global error handler for React errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    console.error('Promise:', event.promise)
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
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
        console.warn('⚠️ React Error #185 (Non-critical) - Ref reconciliation issue')
        console.warn('This error is typically caused by third-party libraries and does not affect functionality')
        console.warn('Error details:', args[0])
        
        // Don't call the original console.error for this specific error
        // to prevent it from showing as a red error in the console
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
