// Ultimate error suppression - overrides browser extensions and all error handling
(function() {
  'use strict'
  
  // Store original functions
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn
  const originalConsoleLog = console.log
  const originalConsoleInfo = console.info

  // Override all console methods with ultimate React error #185 suppression
  const suppressReactError = function(...args) {
    for (let i = 0; i < args.length; i++) {
      const arg = args[i]
      if (typeof arg === 'string') {
        if (arg.includes('Minified React error #185') || 
            arg.includes('React error #185') ||
            arg.includes('error #185') ||
            arg.includes('185') ||
            arg.includes('react-dom.production.min.js') ||
            arg.includes('index.mjs')) {
          return
        }
      }
      if (arg && typeof arg === 'object') {
        if (arg.message && (arg.message.includes('185') || arg.message.includes('Minified React error'))) {
          return
        }
        if (arg.stack && arg.stack.includes('185')) {
          return
        }
      }
    }
    return false
  }

  console.error = function(...args) {
    if (suppressReactError(...args)) return
    originalConsoleError.apply(console, args)
  }

  console.warn = function(...args) {
    if (suppressReactError(...args)) return
    originalConsoleWarn.apply(console, args)
  }

  console.log = function(...args) {
    if (suppressReactError(...args)) return
    originalConsoleLog.apply(console, args)
  }

  console.info = function(...args) {
    if (suppressReactError(...args)) return
    originalConsoleInfo.apply(console, args)
  }

  // Override Error constructor
  const OriginalError = Error
  window.Error = function(message) {
    if (message && (message.includes('185') || message.includes('Minified React error'))) {
      return new OriginalError('Suppressed React error')
    }
    return new OriginalError(message)
  }
  window.Error.prototype = OriginalError.prototype

  // Override all error handling methods
  const handleError = function(event) {
    if (event.message && (event.message.includes('185') || event.message.includes('Minified React error'))) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      return false
    }
  }

  const handleUnhandledRejection = function(event) {
    if (event.reason && typeof event.reason === 'string' && event.reason.includes('185')) {
      event.preventDefault()
      return false
    }
  }

  // Add multiple event listeners with different phases
  if (typeof window !== 'undefined') {
    window.addEventListener('error', handleError, true)
    window.addEventListener('error', handleError, false)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, false)
    
    // Also add to document
    document.addEventListener('error', handleError, true)
    document.addEventListener('error', handleError, false)
  }

  // Override window.onerror
  const originalOnError = window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
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
  window.onunhandledrejection = function(event) {
    if (event.reason && typeof event.reason === 'string' && event.reason.includes('185')) {
      event.preventDefault()
      return true
    }
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(window, event)
    }
    return false
  }

  // Override any existing error handlers that might be set by extensions
  setTimeout(function() {
    // Re-override console methods in case extensions override them
    console.error = function(...args) {
      if (suppressReactError(...args)) return
      originalConsoleError.apply(console, args)
    }
    
    console.warn = function(...args) {
      if (suppressReactError(...args)) return
      originalConsoleWarn.apply(console, args)
    }
    
    console.log = function(...args) {
      if (suppressReactError(...args)) return
      originalConsoleLog.apply(console, args)
    }
  }, 100)

  // Continuously monitor and override console methods
  setInterval(function() {
    if (console.error !== originalConsoleError) {
      console.error = function(...args) {
        if (suppressReactError(...args)) return
        originalConsoleError.apply(console, args)
      }
    }
  }, 1000)

})()
