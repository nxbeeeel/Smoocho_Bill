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
    // Check if it's a React error
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('Minified React error') || args[0].includes('React error #185')) {
        console.error('🚨🚨🚨 REACT ERROR #185 DETECTED 🚨🚨🚨')
        console.error('Full error details:', args)
        console.error('Error stack trace:', new Error().stack)
        
        // Try to get more context
        if (args[1]) {
          console.error('Error object:', args[1])
          console.error('Error stack:', args[1]?.stack)
        }
        
        // Log current React component tree
        console.error('Current URL:', window.location.href)
        console.error('Current timestamp:', new Date().toISOString())
        
        // Try to identify the problematic component
        const errorMessage = args[0]
        if (errorMessage.includes('185')) {
          console.error('🔍 React Error #185 Analysis:')
          console.error('This error typically occurs when:')
          console.error('1. A component key is undefined or null')
          console.error('2. A map function is missing proper keys')
          console.error('3. Component reconciliation fails due to key issues')
          console.error('4. State updates cause key conflicts')
        }
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
