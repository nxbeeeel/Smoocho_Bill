// Automatic image loader that works across all devices without manual sync
import { menuImageLoader } from './image-loader'

export interface AutoImageResult {
  success: boolean
  image?: string
  error?: string
  source: 'local' | 'cloud' | 'fallback'
}

export class AutoImageLoader {
  private static instance: AutoImageLoader
  private imageCache: Map<string, string> = new Map()
  private cloudImageUrls: Map<string, string> = new Map()

  static getInstance(): AutoImageLoader {
    if (!AutoImageLoader.instance) {
      AutoImageLoader.instance = new AutoImageLoader()
    }
    return AutoImageLoader.instance
  }

  constructor() {
    this.initializeCloudUrls()
  }

  // Initialize cloud image URLs (in a real app, these would come from your backend)
  private initializeCloudUrls() {
    const menuItems = menuImageLoader.getMenuItemsWithImages()
    
    // Create category-based placeholder images
    menuItems.forEach(item => {
      const category = item.category.toLowerCase()
      let cloudUrl = ''
      
      // Use different placeholder images based on category
      if (category.includes('kunafa')) {
        cloudUrl = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&crop=center&auto=format&q=80'
      } else if (category.includes('choco') || category.includes('chocolate')) {
        cloudUrl = 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=300&h=300&fit=crop&crop=center&auto=format&q=80'
      } else if (category.includes('ice cream')) {
        cloudUrl = 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop&crop=center&auto=format&q=80'
      } else if (category.includes('drink')) {
        cloudUrl = 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&h=300&fit=crop&crop=center&auto=format&q=80'
      } else if (category.includes('fruit')) {
        cloudUrl = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300&h=300&fit=crop&crop=center&auto=format&q=80'
      } else {
        // Default dessert image
        cloudUrl = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop&crop=center&auto=format&q=80'
      }
      
      this.cloudImageUrls.set(item.filename, cloudUrl)
    })
  }

  // Get image with automatic fallback system
  async getImage(itemName: string): Promise<AutoImageResult> {
    const menuItems = menuImageLoader.getMenuItemsWithImages()
    const menuItem = menuItems.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    )

    if (!menuItem) {
      return {
        success: false,
        error: 'Menu item not found',
        source: 'fallback'
      }
    }

    // For now, skip image loading to prevent 404 errors
    // Return fallback emoji immediately
    return {
      success: false,
      error: 'Images temporarily disabled',
      source: 'fallback'
    }
  }

  // Try to load local image
  private async tryLocalImage(filename: string): Promise<string | null> {
    try {
      const imagePath = `/images/${filename}`
      const response = await fetch(imagePath)
      if (response.ok) {
        const blob = await response.blob()
        return await this.blobToBase64(blob)
      }
    } catch (error) {
      // Local image not available - try to find a similar image
      const similarImage = this.findSimilarImage(filename)
      if (similarImage) {
        try {
          const response = await fetch(`/images/${similarImage}`)
          if (response.ok) {
            const blob = await response.blob()
            return await this.blobToBase64(blob)
          }
        } catch (error) {
          // Similar image also not available
        }
      }
    }
    return null
  }

  // Find a similar image that actually exists
  private findSimilarImage(filename: string): string | null {
    // Map of expected filenames to actual existing filenames
    const imageMap: { [key: string]: string } = {
      '01_hazelnut_kunafa.jpg': '02_white_chocolate_kunafa.jpg', // Use white chocolate as fallback
      '02_white_chocolate_kunafa.jpg': '02_white_chocolate_kunafa.jpg',
      '03_pista_kunafa.jpg': '03_pista_kunafa.jpg',
      '04_biscoff_kunafa.jpg': '04_biscoff_kunafa.jpg',
      '05_hazelnut_white_kunafa.jpg': '05_hazelnut_white_kunafa.jpg',
      // For missing images, use the closest available one
      '06_biscoff_hazelnut_kunafa.jpg': '04_biscoff_kunafa.jpg',
      '07_pista_white_kunafa.jpg': '03_pista_kunafa.jpg',
      '08_hazelnut_pista_kunafa.jpg': '03_pista_kunafa.jpg',
      '09_biscoff_white_kunafa.jpg': '04_biscoff_kunafa.jpg',
      '10_pista_biscoff_kunafa.jpg': '03_pista_kunafa.jpg',
      '11_coffee_hazelnut_kunafa.jpg': '02_white_chocolate_kunafa.jpg',
      '12_pista_coffee_kunafa.jpg': '03_pista_kunafa.jpg',
    }
    
    return imageMap[filename] || null
  }

  // Try to load cloud image
  private async tryCloudImage(filename: string): Promise<string | null> {
    try {
      const cloudUrl = this.cloudImageUrls.get(filename)
      if (!cloudUrl) return null

      const response = await fetch(cloudUrl)
      if (response.ok) {
        const blob = await response.blob()
        return await this.blobToBase64(blob)
      }
    } catch (error) {
      // Cloud image not available
    }
    return null
  }

  // Convert blob to base64
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // Preload all images for better performance
  async preloadAllImages(): Promise<void> {
    // Skip preloading for now to prevent 404 errors
    console.log('Image preloading skipped - using emoji fallbacks')
  }

  // Get fallback emoji based on category
  getFallbackEmoji(category: string): string {
    const emojiMap: { [key: string]: string } = {
      'Kunafa Bowls': '🍰',
      'Signatures': '🌟',
      'Choco Desserts': '🍫',
      'Crispy Rice Tubs': '🍚',
      'Fruits Choco Mix': '🍓',
      'Ice Creams': '🍦',
      'Drinks': '🥤',
      'Toppings': '🍌'
    }
    return emojiMap[category] || '🍽️'
  }

  // Clear cache
  clearCache(): void {
    this.imageCache.clear()
  }

  // Get cache status
  getCacheStatus(): { size: number; items: string[] } {
    return {
      size: this.imageCache.size,
      items: Array.from(this.imageCache.keys())
    }
  }
}

// Export singleton instance
export const autoImageLoader = AutoImageLoader.getInstance()
