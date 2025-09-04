'use client'

import React, { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { useToast } from '@/hooks/use-toast'
import { syncService } from '@/lib/sync-service'
import { menuImageLoader } from '@/lib/image-loader'
import { 
  Image, 
  Download, 
  Upload, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'

interface ImageSyncProps {
  className?: string
}

export function ImageSync({ className }: ImageSyncProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [imageStatus, setImageStatus] = useState<{
    total: number
    available: number
    missing: number
    missingFiles: string[]
  } | null>(null)

  const checkImageStatus = async () => {
    setIsLoading(true)
    try {
      const status = await menuImageLoader.getImageStatusReport()
      setImageStatus(status)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check image status.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncImages = async () => {
    setIsLoading(true)
    try {
      // Export images from current device
      const imageData = await syncService.exportStaticImages()
      
      if (Object.keys(imageData).length === 0) {
        toast({
          title: "No Images Found",
          description: "No images found to sync. Make sure images are in the /public/images folder.",
          variant: "destructive"
        })
        return
      }

      // Store images locally for this device
      await syncService.importStaticImages(imageData)
      
      toast({
        title: "Images Synced",
        description: `${Object.keys(imageData).length} images have been synced to this device.`,
      })

      // Refresh image status
      await checkImageStatus()
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync images. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const clearImageCache = async () => {
    setIsLoading(true)
    try {
      localStorage.removeItem('smoocho_static_images')
      toast({
        title: "Cache Cleared",
        description: "Image cache has been cleared.",
      })
      await checkImageStatus()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear image cache.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    checkImageStatus()
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Image className="h-5 w-5 mr-2" />
          Image Sync
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Image Status */}
        {imageStatus && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{imageStatus.total}</div>
              <div className="text-sm text-gray-600">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{imageStatus.available}</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{imageStatus.missing}</div>
              <div className="text-sm text-gray-600">Missing</div>
            </div>
          </div>
        )}

        {/* Missing Images List */}
        {imageStatus && imageStatus.missing > 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-800">Missing Images</span>
            </div>
            <div className="text-xs text-yellow-700 max-h-32 overflow-y-auto">
              {imageStatus.missingFiles.slice(0, 10).map((file, index) => (
                <div key={index} className="truncate">{file}</div>
              ))}
              {imageStatus.missingFiles.length > 10 && (
                <div className="text-yellow-600">... and {imageStatus.missingFiles.length - 10} more</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={checkImageStatus}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Status
          </Button>
          
          <Button
            onClick={syncImages}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Sync Images
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={clearImageCache}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            Clear Cache
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-1">How to sync images between devices:</div>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>On the device with images, click "Sync Images"</li>
                <li>Export the data using "Export Data" in Backup section</li>
                <li>On the other device, import the data file</li>
                <li>Images will be automatically synced with the data</li>
              </ol>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
