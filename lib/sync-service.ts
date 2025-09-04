// Data synchronization service for multi-device support
import { db } from './database'

export interface SyncData {
  products: any[]
  orders: any[]
  settings: any[]
  inventory: any[]
  lastSync: string
  deviceId: string
}

export interface SyncResponse {
  success: boolean
  data?: SyncData
  error?: string
  needsUpdate?: boolean
}

class SyncService {
  private static instance: SyncService
  private deviceId: string
  private syncEndpoint: string = '/api/sync' // This would be your backend endpoint

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService()
    }
    return SyncService.instance
  }

  constructor() {
    // Generate or retrieve device ID
    this.deviceId = this.getOrCreateDeviceId()
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('smoocho_device_id')
    if (!deviceId) {
      deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('smoocho_device_id', deviceId)
    }
    return deviceId
  }

  // Export all data for backup/sync
  async exportData(): Promise<SyncData> {
    try {
      const [products, orders, settings, inventory] = await Promise.all([
        db.products.toArray(),
        db.orders.toArray(),
        db.settings.toArray(),
        db.inventory.toArray()
      ])

      return {
        products,
        orders,
        settings,
        inventory,
        lastSync: new Date().toISOString(),
        deviceId: this.deviceId
      }
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  // Import data from backup/sync
  async importData(syncData: SyncData): Promise<void> {
    try {
      console.log('Importing data from sync...')
      
      // Clear existing data
      await Promise.all([
        db.products.clear(),
        db.orders.clear(),
        db.settings.clear(),
        db.inventory.clear()
      ])

      // Import new data
      await Promise.all([
        db.products.bulkAdd(syncData.products),
        db.orders.bulkAdd(syncData.orders),
        db.settings.bulkAdd(syncData.settings),
        db.inventory.bulkAdd(syncData.inventory)
      ])

      // Update last sync time
      localStorage.setItem('smoocho_last_sync', syncData.lastSync)
      
      console.log('Data imported successfully')
    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  // Sync with cloud (placeholder for actual implementation)
  async syncWithCloud(): Promise<SyncResponse> {
    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate the sync process
      
      const localData = await this.exportData()
      const lastSync = localStorage.getItem('smoocho_last_sync')
      
      // Simulate API call
      const response = await this.simulateCloudSync(localData, lastSync)
      
      if (response.success && response.data) {
        await this.importData(response.data)
      }
      
      return response
    } catch (error) {
      console.error('Cloud sync failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Simulate cloud sync (replace with actual API calls)
  private async simulateCloudSync(localData: SyncData, lastSync: string | null): Promise<SyncResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real implementation, you would:
    // 1. Send local data to your backend
    // 2. Get the latest data from the server
    // 3. Merge conflicts if any
    // 4. Return the merged data
    
    // For now, just return success
    return {
      success: true,
      data: localData,
      needsUpdate: false
    }
  }

  // Export data as JSON file
  async exportToFile(): Promise<void> {
    try {
      const data = await this.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = `smoocho-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      console.log('Data exported to file')
    } catch (error) {
      console.error('Failed to export to file:', error)
      throw error
    }
  }

  // Import data from JSON file
  async importFromFile(file: File): Promise<void> {
    try {
      const text = await file.text()
      const data: SyncData = JSON.parse(text)
      
      // Validate data structure
      if (!data.products || !data.orders || !data.settings || !data.inventory) {
        throw new Error('Invalid backup file format')
      }
      
      await this.importData(data)
      console.log('Data imported from file')
    } catch (error) {
      console.error('Failed to import from file:', error)
      throw error
    }
  }

  // Get sync status
  getSyncStatus(): { lastSync: string | null; deviceId: string } {
    return {
      lastSync: localStorage.getItem('smoocho_last_sync'),
      deviceId: this.deviceId
    }
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        db.products.clear(),
        db.orders.clear(),
        db.settings.clear(),
        db.inventory.clear()
      ])
      
      localStorage.removeItem('smoocho_last_sync')
      console.log('All data cleared')
    } catch (error) {
      console.error('Failed to clear data:', error)
      throw error
    }
  }

  // Auto-sync (call this periodically)
  async autoSync(): Promise<void> {
    try {
      const lastSync = localStorage.getItem('smoocho_last_sync')
      const now = new Date()
      const lastSyncTime = lastSync ? new Date(lastSync) : new Date(0)
      
      // Sync every 5 minutes
      const syncInterval = 5 * 60 * 1000
      
      if (now.getTime() - lastSyncTime.getTime() > syncInterval) {
        console.log('Auto-sync triggered')
        await this.syncWithCloud()
      }
    } catch (error) {
      console.error('Auto-sync failed:', error)
    }
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance()

// Auto-sync every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    syncService.autoSync()
  }, 5 * 60 * 1000)
}
