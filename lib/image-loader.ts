// Image loader utility for Smoocho Bill menu images

export interface MenuImage {
  id: string
  name: string
  category: string
  filename: string
  dataUrl?: string
}

export class MenuImageLoader {
  private static instance: MenuImageLoader
  private imageCache: Map<string, string> = new Map()

  static getInstance(): MenuImageLoader {
    if (!MenuImageLoader.instance) {
      MenuImageLoader.instance = new MenuImageLoader()
    }
    return MenuImageLoader.instance
  }

  // Get all menu items with their expected image filenames
  getMenuItemsWithImages(): MenuImage[] {
    return [
      // Kunafa Bowls
      { id: '01', name: 'Hazelnut Kunafa', category: 'Kunafa Bowls', filename: '01_hazelnut_kunafa.jpg' },
      { id: '02', name: 'White Chocolate Kunafa', category: 'Kunafa Bowls', filename: '02_white_chocolate_kunafa.jpg' },
      { id: '03', name: 'Pista Kunafa', category: 'Kunafa Bowls', filename: '03_pista_kunafa.jpg' },
      { id: '04', name: 'Biscoff Kunafa', category: 'Kunafa Bowls', filename: '04_biscoff_kunafa.jpg' },
      { id: '05', name: 'Hazelnut White Kunafa', category: 'Kunafa Bowls', filename: '05_hazelnut_white_kunafa.jpg' },
      { id: '06', name: 'Biscoff Hazelnut Kunafa', category: 'Kunafa Bowls', filename: '06_biscoff_hazelnut_kunafa.jpg' },
      { id: '07', name: 'Pista White Kunafa', category: 'Kunafa Bowls', filename: '07_pista_white_kunafa.jpg' },
      { id: '08', name: 'Hazelnut Pista Kunafa', category: 'Kunafa Bowls', filename: '08_hazelnut_pista_kunafa.jpg' },
      { id: '09', name: 'Biscoff White Kunafa', category: 'Kunafa Bowls', filename: '09_biscoff_white_kunafa.jpg' },
      { id: '10', name: 'Pista Biscoff Kunafa', category: 'Kunafa Bowls', filename: '10_pista_biscoff_kunafa.jpg' },
      { id: '11', name: 'Coffee Hazelnut Kunafa', category: 'Kunafa Bowls', filename: '11_coffee_hazelnut_kunafa.jpg' },
      { id: '12', name: 'Pista Coffee Kunafa', category: 'Kunafa Bowls', filename: '12_pista_coffee_kunafa.jpg' },

      // Signatures
      { id: '13', name: 'Choco Tsunami', category: 'Signatures', filename: '13_choco_tsunami.jpg' },
      { id: '14', name: 'Mango Tsunami', category: 'Signatures', filename: '14_mango_tsunami.jpg' },
      { id: '15', name: 'Hazelnut Mango Cyclone', category: 'Signatures', filename: '15_hazelnut_mango_cyclone.jpg' },
      { id: '16', name: 'Pista Mango Thunderstorm', category: 'Signatures', filename: '16_pista_mango_thunderstorm.jpg' },
      { id: '17', name: 'Biscoff Mango Hurricane', category: 'Signatures', filename: '17_biscoff_mango_hurricane.jpg' },
      { id: '18', name: 'Pista Hazelnut Earthquake', category: 'Signatures', filename: '18_pista_hazelnut_earthquake.jpg' },
      { id: '19', name: 'Pista Biscoff Tsunami', category: 'Signatures', filename: '19_pista_biscoff_tsunami.jpg' },
      { id: '20', name: 'Coffee Mango Cyclone', category: 'Signatures', filename: '20_coffee_mango_cyclone.jpg' },
      { id: '21', name: 'Pista Coffee Earthquake', category: 'Signatures', filename: '21_pista_coffee_earthquake.jpg' },

      // Choco Desserts
      { id: '22', name: 'Choco Sponge Classic', category: 'Choco Desserts', filename: '22_choco_sponge_classic.jpg' },
      { id: '23', name: 'Choco Sponge Premium', category: 'Choco Desserts', filename: '23_choco_sponge_premium.jpg' },
      { id: '24', name: 'Choco Brownie Classic', category: 'Choco Desserts', filename: '24_choco_brownie_classic.jpg' },
      { id: '25', name: 'Choco Brownie Premium', category: 'Choco Desserts', filename: '25_choco_brownie_premium.jpg' },
      { id: '26', name: 'Coffee Sponge Classic', category: 'Choco Desserts', filename: '26_coffee_sponge_classic.jpg' },
      { id: '27', name: 'Coffee Sponge Premium', category: 'Choco Desserts', filename: '27_coffee_sponge_premium.jpg' },
      { id: '28', name: 'Coffee Brownie Classic', category: 'Choco Desserts', filename: '28_coffee_brownie_classic.jpg' },
      { id: '29', name: 'Coffee Brownie Premium', category: 'Choco Desserts', filename: '29_coffee_brownie_premium.jpg' },

      // Crispy Rice Tubs
      { id: '30', name: 'Hazelnut White Crispy Rice', category: 'Crispy Rice Tubs', filename: '30_hazelnut_white_crispy_rice.jpg' },
      { id: '31', name: 'Hazelnut Biscoff Crispy Rice', category: 'Crispy Rice Tubs', filename: '31_hazelnut_biscoff_crispy_rice.jpg' },
      { id: '32', name: 'Mango Hazelnut Crispy Rice', category: 'Crispy Rice Tubs', filename: '32_mango_hazelnut_crispy_rice.jpg' },
      { id: '33', name: 'Pista Hazelnut Crispy Rice', category: 'Crispy Rice Tubs', filename: '33_pista_hazelnut_crispy_rice.jpg' },
      { id: '34', name: 'Mango Pista Crispy Rice', category: 'Crispy Rice Tubs', filename: '34_mango_pista_crispy_rice.jpg' },
      { id: '35', name: 'Biscoff White Crispy Rice', category: 'Crispy Rice Tubs', filename: '35_biscoff_white_crispy_rice.jpg' },
      { id: '36', name: 'Pista Biscoff Crispy Rice', category: 'Crispy Rice Tubs', filename: '36_pista_biscoff_crispy_rice.jpg' },
      { id: '37', name: 'Mango Biscoff Crispy Rice', category: 'Crispy Rice Tubs', filename: '37_mango_biscoff_crispy_rice.jpg' },
      { id: '38', name: 'Coffee Hazelnut Crispy Rice', category: 'Crispy Rice Tubs', filename: '38_coffee_hazelnut_crispy_rice.jpg' },
      { id: '39', name: 'Mango Coffee Crispy Rice', category: 'Crispy Rice Tubs', filename: '39_mango_coffee_crispy_rice.jpg' },
      { id: '40', name: 'Biscoff Coffee Crispy Rice', category: 'Crispy Rice Tubs', filename: '40_biscoff_coffee_crispy_rice.jpg' },
      { id: '41', name: 'Coffee Pista Crispy Rice', category: 'Crispy Rice Tubs', filename: '41_coffee_pista_crispy_rice.jpg' },

      // Fruits Choco Mix
      { id: '42', name: 'Choco Strawberry', category: 'Fruits Choco Mix', filename: '42_choco_strawberry.jpg' },
      { id: '43', name: 'Choco Kiwi', category: 'Fruits Choco Mix', filename: '43_choco_kiwi.jpg' },
      { id: '44', name: 'Choco Mixed Fruits Classic', category: 'Fruits Choco Mix', filename: '44_choco_mixed_fruits_classic.jpg' },
      { id: '45', name: 'Choco Mixed Fruits Premium', category: 'Fruits Choco Mix', filename: '45_choco_mixed_fruits_premium.jpg' },
      { id: '46', name: 'Choco Mango Classic', category: 'Fruits Choco Mix', filename: '46_choco_mango_classic.jpg' },
      { id: '47', name: 'Choco Mango Premium', category: 'Fruits Choco Mix', filename: '47_choco_mango_premium.jpg' },
      { id: '48', name: 'Choco Robusto Classic', category: 'Fruits Choco Mix', filename: '48_choco_robusto_classic.jpg' },
      { id: '49', name: 'Choco Robusto Premium', category: 'Fruits Choco Mix', filename: '49_choco_robusto_premium.jpg' },

      // Ice Creams
      { id: '50', name: 'Choco Vanilla Scoop', category: 'Ice Creams', filename: '50_choco_vanilla_scoop.jpg' },
      { id: '51', name: 'Choco Chocolate Scoop', category: 'Ice Creams', filename: '51_choco_chocolate_scoop.jpg' },
      { id: '52', name: 'Choco Strawberry Scoop', category: 'Ice Creams', filename: '52_choco_strawberry_scoop.jpg' },
      { id: '53', name: 'Choco Mango Scoop', category: 'Ice Creams', filename: '53_choco_mango_scoop.jpg' },

      // Drinks
      { id: '54', name: 'Milo Dinauser', category: 'Drinks', filename: '54_milo_dinauser.jpg' },
      { id: '55', name: 'Malaysian Mango Milk', category: 'Drinks', filename: '55_malaysian_mango_milk.jpg' },
      { id: '56', name: 'Korean Strawberry Milk', category: 'Drinks', filename: '56_korean_strawberry_milk.jpg' },
      { id: '57', name: 'Vietnamese Iced Coffee', category: 'Drinks', filename: '57_vietnamese_iced_coffee.jpg' },
      { id: '58', name: 'Premium Iced Coffee', category: 'Drinks', filename: '58_premium_iced_coffee.jpg' },

      // Toppings
      { id: '59', name: 'Fresh Robust Banana', category: 'Toppings', filename: '59_fresh_robust_banana.jpg' },
      { id: '60', name: 'Diced Mango', category: 'Toppings', filename: '60_diced_mango.jpg' },
      { id: '61', name: 'Sliced Strawberry', category: 'Toppings', filename: '61_sliced_strawberry.jpg' },
      { id: '62', name: 'Sliced Kiwi', category: 'Toppings', filename: '62_sliced_kiwi.jpg' }
    ]
  }

  // Convert image file to base64 data URL
  async fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Load image from URL and convert to base64
  async loadImageAsDataUrl(imageUrl: string): Promise<string> {
    if (this.imageCache.has(imageUrl)) {
      return this.imageCache.get(imageUrl)!
    }

    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const dataUrl = await this.fileToDataUrl(blob as any)
      this.imageCache.set(imageUrl, dataUrl)
      return dataUrl
    } catch (error) {
      console.error('Failed to load image:', error)
      throw error
    }
  }

  // Get image for a specific menu item
  async getImageForMenuItem(itemName: string): Promise<string | null> {
    const menuItems = this.getMenuItemsWithImages()
    const menuItem = menuItems.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    )

    if (!menuItem) {
      return null
    }

    try {
      // Try to load from the public images folder
      const imagePath = `/images/${menuItem.filename}`
      return await this.loadImageAsDataUrl(imagePath)
    } catch (error) {
      console.log(`Image not found for ${itemName}: ${menuItem.filename}`)
      return null
    }
  }

  // Get all available images
  async getAllAvailableImages(): Promise<Map<string, string>> {
    const images = new Map<string, string>()
    const menuItems = this.getMenuItemsWithImages()

    for (const item of menuItems) {
      try {
        const imagePath = `/images/${item.filename}`
        const dataUrl = await this.loadImageAsDataUrl(imagePath)
        images.set(item.name, dataUrl)
      } catch (error) {
        // Image not found, skip
        console.log(`Image not found: ${item.filename}`)
      }
    }

    return images
  }

  // Check which images are missing
  async getMissingImages(): Promise<string[]> {
    const missing: string[] = []
    const menuItems = this.getMenuItemsWithImages()

    for (const item of menuItems) {
      try {
        const imagePath = `/images/${item.filename}`
        await this.loadImageAsDataUrl(imagePath)
      } catch (error) {
        missing.push(item.filename)
      }
    }

    return missing
  }

  // Get image status report
  async getImageStatusReport(): Promise<{
    total: number
    available: number
    missing: number
    missingFiles: string[]
  }> {
    const menuItems = this.getMenuItemsWithImages()
    const missingFiles = await this.getMissingImages()

    return {
      total: menuItems.length,
      available: menuItems.length - missingFiles.length,
      missing: missingFiles.length,
      missingFiles
    }
  }
}

// Export singleton instance
export const menuImageLoader = MenuImageLoader.getInstance()
