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

  // Handle React errors
  const originalConsoleError = console.error
  console.error = (...args) => {
    // Check if it's a React error
    if (args[0] && typeof args[0] === 'string' && args[0].includes('Minified React error')) {
      console.error('🚨 REACT ERROR DETECTED:', ...args)
      console.error('Full error details:', args)
      
      // Try to get more context
      if (args[1]) {
        console.error('Error object:', args[1])
        console.error('Error stack:', args[1]?.stack)
      }
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args)
  }
}

// Initialize error handlers
if (typeof window !== 'undefined') {
  setupGlobalErrorHandlers()
}
