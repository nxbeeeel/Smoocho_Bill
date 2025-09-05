'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { offlineService } from '@/lib/offline-service'

interface OfflineStatus {
  isOnline: boolean
  pendingOperations: number
  lastSyncTime: string | null
  queueSize: number
  isProcessing: boolean
}

export function OfflineIndicator() {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    pendingOperations: 0,
    lastSyncTime: null,
    queueSize: 0,
    isProcessing: false
  })

  useEffect(() => {
    // Get initial status
    setStatus(offlineService.getStatus())

    // Add status listener
    const handleStatusChange = (newStatus: OfflineStatus) => {
      setStatus(newStatus)
    }

    offlineService.addStatusListener(handleStatusChange)

    return () => {
      offlineService.removeStatusListener(handleStatusChange)
    }
  }, [])

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString()
  }

  const handleForceSync = async () => {
    if (status.isOnline) {
      await offlineService.forceProcessQueue()
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Online/Offline Status */}
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        status.isOnline 
          ? 'bg-green-100 text-green-700 border border-green-200' 
          : 'bg-red-100 text-red-700 border border-red-200'
      }`}>
        {status.isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        <span className="hidden sm:inline">
          {status.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Pending Operations Indicator */}
      {status.pendingOperations > 0 && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          status.isProcessing
            ? 'bg-blue-100 text-blue-700 border border-blue-200'
            : 'bg-orange-100 text-orange-700 border border-orange-200'
        }`}>
          {status.isProcessing ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Clock className="h-3 w-3" />
          )}
          <span className="hidden sm:inline">
            {status.isProcessing ? 'Syncing' : 'Pending'}
          </span>
          <span className="bg-white/50 px-1 rounded text-xs">
            {status.pendingOperations}
          </span>
        </div>
      )}

      {/* Last Sync Time */}
      {status.lastSyncTime && (
        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full text-xs text-gray-600 bg-gray-100">
          <CheckCircle className="h-3 w-3" />
          <span>Last sync: {formatLastSync(status.lastSyncTime)}</span>
        </div>
      )}

      {/* Force Sync Button */}
      {status.isOnline && status.pendingOperations > 0 && (
        <button
          onClick={handleForceSync}
          disabled={status.isProcessing}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
          title="Force sync now"
        >
          <RefreshCw className={`h-3 w-3 text-gray-600 ${status.isProcessing ? 'animate-spin' : ''}`} />
        </button>
      )}

      {/* Offline Warning */}
      {!status.isOnline && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
          <AlertTriangle className="h-3 w-3" />
          <span className="hidden sm:inline">Working offline</span>
        </div>
      )}
    </div>
  )
}

// Full offline status modal
export function OfflineStatusModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<OfflineStatus>({
    isOnline: true,
    pendingOperations: 0,
    lastSyncTime: null,
    queueSize: 0,
    isProcessing: false
  })

  useEffect(() => {
    if (isOpen) {
      setStatus(offlineService.getStatus())
      
      const handleStatusChange = (newStatus: OfflineStatus) => {
        setStatus(newStatus)
      }

      offlineService.addStatusListener(handleStatusChange)

      return () => {
        offlineService.removeStatusListener(handleStatusChange)
      }
    }
  }, [isOpen])

  const queueDetails = offlineService.getQueueDetails()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Sync Status</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          {/* Connection Status */}
          <div className="mb-6">
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              status.isOnline 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {status.isOnline ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <div>
                <div className="font-medium text-gray-900">
                  {status.isOnline ? 'Connected' : 'Offline'}
                </div>
                <div className="text-sm text-gray-600">
                  {status.isOnline 
                    ? 'All changes will sync automatically' 
                    : 'Changes are queued for when connection is restored'
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Queue Details */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Pending Operations</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">{queueDetails.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{queueDetails.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{queueDetails.processing}</div>
                <div className="text-sm text-gray-600">Processing</div>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{queueDetails.failed}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>
          </div>

          {/* Last Sync */}
          {status.lastSyncTime && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Last Sync</h3>
              <div className="text-sm text-gray-600">
                {new Date(status.lastSyncTime).toLocaleString()}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {status.isOnline && status.pendingOperations > 0 && (
              <button
                onClick={() => offlineService.forceProcessQueue()}
                disabled={status.isProcessing}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status.isProcessing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
            
            {queueDetails.failed > 0 && (
              <button
                onClick={() => {
                  offlineService.clearFailedOperations()
                  onClose()
                }}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Clear Failed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
