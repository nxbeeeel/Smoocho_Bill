'use client'

import React from 'react'
import { menuImageLoader } from '@/lib/image-loader'
import { db } from '@/lib/database'
import { useLiveQuery } from 'dexie-react-hooks'
import { Button } from '@/components/ui/button'

export default function ImageTestPage() {
  const products = useLiveQuery(() => db.products.toArray())
  const [imageStatus, setImageStatus] = React.useState<any>(null)
  const [testResults, setTestResults] = React.useState<any>(null)

  React.useEffect(() => {
    const checkImages = async () => {
      try {
        const status = await menuImageLoader.getImageStatusReport()
        setImageStatus(status)
        
        // Test specific images
        const testImages = [
          'hazelnut-kunafa.jpg',
          'white-chocolate-kunafa.jpg',
          'pista-kunafa.jpg',
          'choco-tsunami.jpg',
          'mango-tsunami.jpg',
          'choco-sponge-classic.jpg',
          'milo-dinauser.jpg',
          'malaysian-mango-milk.jpg'
        ]
        
        const results = []
        for (const imageName of testImages) {
          try {
            const imageData = await menuImageLoader.getImageForMenuItem(imageName.replace('.jpg', ''))
            results.push({
              name: imageName,
              found: !!imageData,
              type: imageData ? 'loaded' : 'missing'
            })
          } catch (error) {
            results.push({
              name: imageName,
              found: false,
              type: 'error',
              error: error instanceof Error ? error.message : String(error)
            })
          }
        }
        
        setTestResults(results)
      } catch (error) {
        console.error('Error checking images:', error)
        setImageStatus({ error: error instanceof Error ? error.message : String(error) })
      }
    }

    checkImages()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Image Test Page</h1>
      
      {/* Test Results */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        {imageStatus ? (
          <div className="space-y-2">
            <p><strong>Total Images:</strong> {imageStatus.total}</p>
            <p><strong>Available:</strong> {imageStatus.available}</p>
            <p><strong>Missing:</strong> {imageStatus.missing}</p>
            {imageStatus.missingFiles && imageStatus.missingFiles.length > 0 && (
              <div>
                <p><strong>Missing Files:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  {imageStatus.missingFiles.map((file: string, index: number) => (
                    <li key={index} className="text-red-600">{file}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p>Loading image status...</p>
        )}
      </div>

      {/* Direct Image Test */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Direct Image Test</h2>
        {testResults ? (
          <div className="space-y-2">
            {testResults.map((result: any, index: number) => (
              <div key={index} className="flex items-center space-x-4 p-2 border rounded">
                <span className="font-medium">{result.name}</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.found ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {result.type}
                </span>
                {result.error && (
                  <span className="text-red-600 text-sm">{result.error}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Testing images...</p>
        )}
      </div>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Products in Database</h2>
        {products ? (
          <div className="space-y-2">
            {products.map((product: any) => (
              <div key={product.id} className="flex items-center space-x-4 p-2 border rounded">
                <span className="font-medium">{product.name}</span>
                <span className="text-gray-600">₹{product.price}</span>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading products...</p>
        )}
      </div>

      {/* Sync Service Test */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Sync Service Test</h2>
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={async () => {
              try {
                const { syncService } = await import('@/lib/sync-service')
                const result = await syncService.exportStaticImages()
                console.log('Export result:', result)
                alert(`Exported ${Object.keys(result).length} images`)
              } catch (error) {
                console.error('Export error:', error)
                alert('Export failed: ' + (error instanceof Error ? error.message : String(error)))
              }
            }}>
              Test Export Images
            </Button>
            <Button onClick={async () => {
              try {
                const { syncService } = await import('@/lib/sync-service')
                const image = syncService.getStaticImage('hazelnut-kunafa.jpg')
                console.log('Get image result:', image)
                alert(image ? 'Image found in cache' : 'Image not found in cache')
              } catch (error) {
                console.error('Get image error:', error)
                alert('Get image failed: ' + (error instanceof Error ? error.message : String(error)))
              }
            }} variant="outline">
              Test Get Image
            </Button>
            <Button onClick={() => {
              try {
                localStorage.removeItem('smoocho_static_images')
                alert('Image cache cleared')
              } catch (error) {
                console.error('Clear cache error:', error)
                alert('Clear cache failed: ' + (error instanceof Error ? error.message : String(error)))
              }
            }} variant="outline">
              Clear Image Cache
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            <p>• <strong>Export Images:</strong> Tests exporting images from /public/images folder</p>
            <p>• <strong>Get Image:</strong> Tests retrieving an image from sync service cache</p>
            <p>• <strong>Clear Cache:</strong> Clears the local image cache</p>
          </div>
        </div>
      </div>
    </div>
  )
}