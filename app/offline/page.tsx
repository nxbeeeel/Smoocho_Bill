'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            You're Offline
          </CardTitle>
          <CardDescription className="text-gray-600">
            It looks like you've lost your internet connection. Don't worry, some features are still available offline.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              Check your internet connection and try again
            </p>
            
            <Button 
              onClick={handleRetry}
              className="w-full mb-4"
              variant="default"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                Available offline:
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Previously viewed pages</li>
                <li>• Cached product data</li>
                <li>• Basic POS functionality</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <Wifi className="h-3 w-3" />
              <span>Waiting for connection...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
