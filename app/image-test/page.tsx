'use client'

import React from 'react'
import { menuImageLoader } from '@/lib/image-loader'
import { db } from '@/lib/database'
import { useLiveQuery } from 'dexie-react-hooks'nimport { Button } from '@/components/ui/button'

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
          'White Chocolate Kunafa',
          'Pista Kunafa', 
          'Biscoff Kunafa',
          'Hazelnut White Kunafa'
        ]
        
        const results = []
        for (const name of testImages) {
          try {
            console.log(`Testing image for: ${name}`)
            const image = await menuImageLoader.getImageForMenuItem(name)
            console.log(`Image result for ${name}:`, image ? 'Found' : 'Not found')
            results.push({ name, found: !!image, image })
          } catch (error) {
            console.error(`Error loading image for ${name}:`, error)
            results.push({ name, found: false, error: error instanceof Error ? error.message : String(error) })
          }
        }
        
        setTestResults(results)
      } catch (error) {
        console.error('Error checking images:', error)
      }
    }
    
    checkImages()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Image Test Page</h1>
        
        {/* Image Status Report */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Image Status Report</h2>
          {imageStatus ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{imageStatus.total}</div>
                <div className="text-sm text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{imageStatus.available}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{imageStatus.missing}</div>
                <div className="text-sm text-gray-600">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((imageStatus.available / imageStatus.total) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
            </div>
          ) : (
            <div>Loading image status...</div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {testResults ? (
            <div className="space-y-4">
              {testResults.map((result: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{result.name}</h3>
                    <p className="text-sm text-gray-600">
                      {result.found ? '✅ Image found' : '❌ Image not found'}
                    </p>
                    {result.error && (
                      <p className="text-sm text-red-600">{result.error}</p>
                    )}
                  </div>
                  {result.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border">
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>Loading test results...</div>
          )}
        </div>

        {/* Direct Image Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Direct Image Test</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-3">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/02_white_chocolate_kunafa.jpg" 
                  alt="White Chocolate Kunafa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load direct image:', e)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={() => console.log('Direct image loaded successfully')}
                />
              </div>
              <h3 className="font-medium text-sm">Direct Test</h3>
              <p className="text-xs text-gray-600">White Chocolate Kunafa</p>
            </div>
            <div className="border rounded-lg p-3">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                <img 
                  src="/images/03_pista_kunafa.jpg" 
                  alt="Pista Kunafa"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Failed to load direct image:', e)
                    e.currentTarget.style.display = 'none'
                  }}
                  onLoad={() => console.log('Direct image loaded successfully')}
                />
              </div>
              <h3 className="font-medium text-sm">Direct Test</h3>
              <p className="text-xs text-gray-600">Pista Kunafa</p>
            </div>
          </div>
        </div>

        {/* Products with Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Products with Images</h2>
          {products ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, 8).map((product) => (
                <div key={product.id} className="border rounded-lg p-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {product.image && product.image.startsWith('data:image') ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl">🍰</div>
                    )}
                  </div>
                  <h3 className="font-medium text-sm">{product.name}</h3>
                  <p className="text-xs text-gray-600">₹{product.price}</p>
                  <p className="text-xs text-blue-600">
                    {product.image ? 'Has Image' : 'No Image'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div>Loading products...</div>
          )}
        </div>

        {/* Sync Service Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sync Service Test</h2>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={async () => {
                  try {
                    const { syncService } = await import('@/lib/sync-service')
                    const imageData = await syncService.exportStaticImages()
                    console.log('Exported images:', Object.keys(imageData).length)
                    alert(`Exported ${Object.keys(imageData).length} images`)
                  } catch (error) {
                    console.error('Export failed:', error)
                    alert('Export failed: ' + (error instanceof Error ? error.message : String(error)))
                  }
                }}
              >
                Test Export Images
              </Button>
              <Button
                onClick={async () => {
                  try {
                    const { syncService } = await import('@/lib/sync-service')
                    const image = syncService.getStaticImage('02_white_chocolate_kunafa.jpg')
                    console.log('Retrieved image:', image ? 'Found' : 'Not found')
                    alert(image ? 'Image found in sync service' : 'Image not found in sync service')
                  } catch (error) {
                    console.error('Get image failed:', error)
                    alert('Get image failed: ' + (error instanceof Error ? error.message : String(error)))
                  }
                }}
                variant="outline"
              >
                Test Get Image
              </Button>
              <Button
                onClick={() => {
                  localStorage.removeItem('smoocho_static_images')
                  alert('Image cache cleared')
                }}
                variant="outline"
              >
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
    </div>
  )
}
