'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Database, Cloud, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { offlineStartupService } from '@/lib/offline-startup'

interface StartupStatus {
  phase: 'checking' | 'loading' | 'syncing' | 'ready' | 'error'
  progress: number
  message: string
  isOfflineMode: boolean
}

interface StartupScreenProps {
  onReady: (data: any) => void
  onError: (error: Error) => void
}

export function StartupScreen({ onReady, onError }: StartupScreenProps) {
  const [status, setStatus] = useState<StartupStatus>({
    phase: 'checking',
    progress: 0,
    message: 'Initializing POS system...',
    isOfflineMode: false
  })

  const [retryCount, setRetryCount] = useState(0)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const handleStatusChange = (newStatus: StartupStatus) => {
      setStatus(newStatus)
    }

    offlineStartupService.addStatusListener(handleStatusChange)

    // Initialize the system
    initializeSystem()

    return () => {
      offlineStartupService.removeStatusListener(handleStatusChange)
    }
  }, [])

  const initializeSystem = async () => {
    try {
      const startupData = await offlineStartupService.initialize()
      onReady(startupData)
    } catch (error) {
      console.error('Startup failed:', error)
      onError(error as Error)
    }
  }

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1)
    await initializeSystem()
  }

  const handleForceRefresh = async () => {
    const success = await offlineStartupService.forceRefresh()
    if (success) {
      const startupData = offlineStartupService.getStartupData()
      if (startupData) {
        onReady(startupData)
      }
    }
  }

  const getStatusIcon = () => {
    switch (status.phase) {
      case 'checking':
        return <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      case 'loading':
        return <Database className="h-8 w-8 text-blue-600" />
      case 'syncing':
        return <Cloud className="h-8 w-8 text-green-600" />
      case 'ready':
        return <CheckCircle className="h-8 w-8 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-8 w-8 text-red-600" />
      default:
        return <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
    }
  }

  // const getStatusColor = () => {
  //   switch (status.phase) {
  //     case 'checking':
  //     case 'loading':
  //       return 'text-blue-600'
  //     case 'syncing':
  //       return 'text-green-600'
  //     case 'ready':
  //       return 'text-green-600'
  //     case 'error':
  //       return 'text-red-600'
  //     default:
  //       return 'text-blue-600'
  //   }
  // }

  const getConnectionStatus = () => {
    if (navigator.onLine) {
      return (
        <div className="flex items-center gap-2 text-green-600">
          <Wifi className="h-4 w-4" />
          <span className="text-sm">Online</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-orange-600">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">Offline Mode</span>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Smoocho Bill POS
          </h1>
          <p className="text-gray-600">
            {status.phase === 'ready' ? 'System Ready' : 'Initializing System...'}
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex justify-center mb-6">
          {getConnectionStatus()}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{status.message}</span>
            <span>{status.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                status.phase === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>

        {/* Status Details */}
        <div className="mb-6">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Mode:</span>
              <span className={status.isOfflineMode ? 'text-orange-600' : 'text-green-600'}>
                {status.isOfflineMode ? 'Offline' : 'Online'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Phase:</span>
              <span className="capitalize">{status.phase}</span>
            </div>
            <div className="flex justify-between">
              <span>Retry Count:</span>
              <span>{retryCount}</span>
            </div>
          </div>
        </div>

        {/* Offline Capabilities */}
        {status.isOfflineMode && (
          <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <h3 className="font-medium text-orange-800 mb-2">Offline Capabilities</h3>
            <div className="text-sm text-orange-700 space-y-1">
              <div>✅ Process orders and payments</div>
              <div>✅ Manage inventory</div>
              <div>✅ Update settings</div>
              <div>✅ Print bills</div>
              <div>✅ View order history</div>
              <div>🔄 Auto-sync when online</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status.phase === 'error' && (
          <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-medium text-red-800 mb-2">Initialization Failed</h3>
            <p className="text-sm text-red-700 mb-3">
              Unable to load system data. This might be due to:
            </p>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>No internet connection</li>
              <li>Local storage issues</li>
              <li>Database corruption</li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {status.phase === 'error' && (
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry Initialization
            </button>
          )}

          {status.phase === 'ready' && navigator.onLine && (
            <button
              onClick={handleForceRefresh}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Refresh from Server
            </button>
          )}

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </button>
        </div>

        {/* Technical Details */}
        {showDetails && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Technical Details</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Phase: {status.phase}</div>
              <div>Progress: {status.progress}%</div>
              <div>Message: {status.message}</div>
              <div>Offline Mode: {status.isOfflineMode ? 'Yes' : 'No'}</div>
              <div>Internet: {navigator.onLine ? 'Available' : 'Unavailable'}</div>
              <div>Retry Count: {retryCount}</div>
              <div>Timestamp: {new Date().toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© 2024 Smoocho Bill POS</p>
          <p>Professional Point of Sale System</p>
        </div>
      </div>
    </div>
  )
}

// Simple loading component for quick loads
export function QuickStartupScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Smoocho Bill POS</h2>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
