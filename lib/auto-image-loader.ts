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

    // Check cache first
    if (this.imageCache.has(menuItem.filename)) {
      return {
        success: true,
        image: this.imageCache.get(menuItem.filename)!,
        source: 'local'
      }
    }

    // Try local image first
    try {
      const localImage = await this.tryLocalImage(menuItem.filename)
      if (localImage) {
        this.imageCache.set(menuItem.filename, localImage)
        return {
          success: true,
          image: localImage,
          source: 'local'
        }
      }
    } catch (error) {
      console.log(`Local image failed for ${menuItem.filename}:`, error)
    }

    // Try cloud image
    try {
      const cloudImage = await this.tryCloudImage(menuItem.filename)
      if (cloudImage) {
        this.imageCache.set(menuItem.filename, cloudImage)
        return {
          success: true,
          image: cloudImage,
          source: 'cloud'
        }
      }
    } catch (error) {
      console.log(`Cloud image failed for ${menuItem.filename}:`, error)
    }

    // Return fallback
    return {
      success: false,
      error: 'No image available',
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
    // All images now exist - return the filename as is
    return filename
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
    const menuItems = menuImageLoader.getMenuItemsWithImages()
    const promises = menuItems.map(async (item) => {
      try {
        await this.getImage(item.name)
      } catch (error) {
        console.log(`Failed to preload ${item.name}:`, error)
      }
    })

    await Promise.allSettled(promises)
    console.log('Image preloading completed')
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
