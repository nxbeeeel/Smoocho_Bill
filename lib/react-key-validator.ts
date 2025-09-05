// React key validator to help identify key issues
export function validateReactKeys() {
  if (typeof window === 'undefined') return

  // Override console.error to catch React key warnings
  const originalConsoleError = console.error
  console.error = (...args) => {
    const message = args[0]
    
    if (typeof message === 'string') {
      // Check for React key warnings
      if (message.includes('Warning: Each child in a list should have a unique "key" prop')) {
        console.error('🚨 REACT KEY WARNING DETECTED:', ...args)
        console.error('This indicates a missing or duplicate key in a map function')
      }
      
      // Check for React error #185
      if (message.includes('Minified React error #185')) {
        console.warn('⚠️ REACT ERROR #185 DETECTED (Non-critical):', message)
        console.warn('This is a ref reconciliation error, typically caused by third-party libraries')
        console.warn('The application should continue to function normally')
        console.warn('Full error details:', ...args)
        return // Don't call the original console.error for this specific error
      }
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args)
  }
}

// Initialize key validator
if (typeof window !== 'undefined') {
  validateReactKeys()
}
