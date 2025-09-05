"use client"

import React, { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { syncService } from '@/lib/sync-service'

interface ImageSyncProps {
  className?: string
}

/**
 * ImageSync - Professional image synchronization component
 * Handles image synchronization with proper status indicators
 */
export const ImageSync: React.FC<ImageSyncProps> = ({ className }) => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncStatus('idle')

    try {
      const result = await syncService.syncAll({ syncImages: true })
      
      if (result.success) {
        setSyncStatus('success')
        setLastSync(new Date())
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      setSyncStatus('error')
    } finally {
      setIsSyncing(false)
    }
  }

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    switch (syncStatus) {
      case 'success':
        return 'Images synced successfully'
      case 'error':
        return 'Sync failed'
      default:
        return 'Ready to sync'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Image Synchronization
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm">{getStatusText()}</span>
          </div>
          <Badge variant={syncService.isDeviceOnline() ? 'default' : 'secondary'}>
            {syncService.isDeviceOnline() ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {lastSync && (
          <div className="text-xs text-muted-foreground">
            Last sync: {lastSync.toLocaleString()}
          </div>
        )}

        <Button
          onClick={handleSync}
          disabled={isSyncing || !syncService.isDeviceOnline()}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync Images
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
