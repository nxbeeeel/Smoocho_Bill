import React from 'react'

// React Key Wrapper - Helps identify key issues
interface KeyWrapperProps {
  children: React.ReactNode
  componentName?: string
  debug?: boolean
}

export function ReactKeyWrapper({ children, componentName = 'Unknown', debug = false }: KeyWrapperProps) {
  if (debug) {
    console.log(`🔍 ReactKeyWrapper: Rendering ${componentName}`)
  }

  return <>{children}</>
}

// Hook to validate React keys in arrays
export function useKeyValidator() {
  const validateKeys = React.useCallback((items: any[], componentName: string) => {
    if (!Array.isArray(items)) {
      console.warn(`⚠️ ${componentName}: Items is not an array`, items)
      return false
    }

    const keys = new Set()
    let hasInvalidKeys = false

    items.forEach((item, index) => {
      if (item && typeof item === 'object') {
        // Check if item has a valid key
        if (!item.id && !item.key && !item.name) {
          console.warn(`⚠️ ${componentName}: Item at index ${index} has no valid key property`, item)
          hasInvalidKeys = true
        }

        // Check for duplicate keys
        const key = item.id || item.key || item.name || `fallback-${index}`
        if (keys.has(key)) {
          console.warn(`⚠️ ${componentName}: Duplicate key found: ${key}`, item)
          hasInvalidKeys = true
        }
        keys.add(key)
      }
    })

    if (hasInvalidKeys) {
      console.error(`🚨 ${componentName}: Key validation failed!`)
    }

    return !hasInvalidKeys
  }, [])

  return { validateKeys }
}

// Higher-order component to wrap components with key validation
export function withKeyValidation<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function KeyValidatedComponent(props: P) {
    const { validateKeys } = useKeyValidator()

    // Validate any array props
    React.useEffect(() => {
      Object.entries(props).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          validateKeys(value, `${componentName}.${key}`)
        }
      })
    }, [props, validateKeys, componentName])

    return <WrappedComponent {...props} />
  }
}
