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
        console.error('🚨 REACT ERROR #185 DETECTED:', ...args)
        console.error('This is a reconciliation error, likely caused by undefined keys')
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
