'use client'

import React, { useState, useEffect } from 'react'
import { StartupScreen, QuickStartupScreen } from '@/components/ui/startup-screen'
import { OfflineIndicator } from '@/components/ui/offline-indicator'
import { offlineStartupService } from '@/lib/offline-startup'
import { offlineService } from '@/lib/offline-service'
import { offlinePersistenceService } from '@/lib/offline-persistence'

interface OfflineAppProps {
  children: React.ReactNode
}

export function OfflineApp({ children }: OfflineAppProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [startupData, setStartupData] = useState<any>(null)
  const [error, setError] = useState<Error | null>(null)
  const [showStartupScreen, setShowStartupScreen] = useState(true)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check if we have cached data for quick startup
      const hasCachedData = offlineStartupService.hasEssentialData()
      
      if (hasCachedData) {
        // Quick startup with cached data
        setShowStartupScreen(false)
        const data = offlineStartupService.getStartupData()
        setStartupData(data)
        setIsInitialized(true)
        setIsLoading(false)
        return
      }

      // Full startup process
      const data = await offlineStartupService.initialize()
      setStartupData(data)
      setIsInitialized(true)
      setShowStartupScreen(false)
      setIsLoading(false)

    } catch (err) {
      console.error('App initialization failed:', err)
      setError(err as Error)
      setIsLoading(false)
    }
  }

  const handleStartupReady = (data: any) => {
    setStartupData(data)
    setIsInitialized(true)
    setShowStartupScreen(false)
    setIsLoading(false)
  }

  const handleStartupError = (err: Error) => {
    setError(err)
    setIsLoading(false)
  }

  // Show startup screen during initialization
  if (showStartupScreen && (isLoading || !isInitialized)) {
    return (
      <StartupScreen
        onReady={handleStartupReady}
        onError={handleStartupError}
      />
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Initialization Failed</h1>
          <p className="text-gray-600 mb-6">
            Unable to start the POS system. This might be due to:
          </p>
          <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
            <li>• No internet connection</li>
            <li>• Local storage issues</li>
            <li>• Database corruption</li>
            <li>• Browser compatibility issues</li>
          </ul>
          <div className="space-y-3">
            <button
              onClick={initializeApp}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry Initialization
            </button>
            <button
              onClick={() => {
                // Clear all data and retry
                localStorage.clear()
                window.location.reload()
              }}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Reset System
            </button>
          </div>
          <div className="mt-6 text-xs text-gray-500">
            <p>Error: {error.message}</p>
            <p>Time: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return <QuickStartupScreen />
  }

  // Main app with offline indicators
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Status Bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Smoocho Bill POS</h1>
            <OfflineIndicator />
          </div>
          <div className="text-sm text-gray-600">
            {startupData?.isOfflineMode ? 'Offline Mode' : 'Online Mode'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

// Hook for accessing offline status
export function useOfflineStatus() {
  const [status, setStatus] = useState(offlineService.getStatus())

  useEffect(() => {
    const handleStatusChange = (newStatus: any) => {
      setStatus(newStatus)
    }

    offlineService.addStatusListener(handleStatusChange)

    return () => {
      offlineService.removeStatusListener(handleStatusChange)
    }
  }, [])

  return status
}

// Hook for accessing startup data
export function useStartupData() {
  const [data, setData] = useState(offlineStartupService.getStartupData())

  useEffect(() => {
    const interval = setInterval(() => {
      const newData = offlineStartupService.getStartupData()
      if (newData !== data) {
        setData(newData)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [data])

  return data
}
