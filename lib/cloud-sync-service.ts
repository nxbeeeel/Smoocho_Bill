'use client'

import { db } from './database'

interface SyncData {
  orders: any[]
  products: any[]
  inventory: any[]
  settings: any[]
  lastSync: string
  deviceId: string
  userId: string
}

interface CloudSyncResponse {
  success: boolean
  data?: SyncData
  error?: string
  timestamp: string
}

class CloudSyncService {
  private userId: string | null = null
  private deviceId: string | null = null
  private syncInterval: NodeJS.Timeout | null = null
  private isOnline: boolean = true
  private pendingChanges: any[] = []
  private lastSyncTime: string | null = null

  constructor() {
    this.setupOnlineStatusListener()
  }

  // Initialize sync service with user and device info
  initialize(userId: string, deviceId: string) {
    this.userId = userId
    this.deviceId = deviceId
    this.startAutoSync()
  }

  // Setup online/offline status listener
  private setupOnlineStatusListener() {
    const handleOnline = () => {
      this.isOnline = true
      console.log('Device is online - resuming sync')
      this.syncPendingChanges()
    }

    const handleOffline = () => {
      this.isOnline = false
      console.log('Device is offline - queuing changes')
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
  }

  // Start automatic synchronization every 30 seconds
  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(async () => {
      if (this.isOnline && this.userId && this.deviceId) {
        await this.syncData()
      }
    }, 30000) // Sync every 30 seconds

    // Initial sync
    this.syncData()
  }

  // Stop automatic synchronization
  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Get all local data
  private async getLocalData(): Promise<SyncData> {
    try {
      const [orders, products, inventory, settings] = await Promise.all([
        db.orders.toArray(),
        db.products.toArray(),
        db.inventory.toArray(),
        db.settings.toArray()
      ])

      return {
        orders,
        products,
        inventory,
        settings,
        lastSync: this.lastSyncTime || new Date().toISOString(),
        deviceId: this.deviceId!,
        userId: this.userId!
      }
    } catch (error) {
      console.error('Error getting local data:', error)
      throw error
    }
  }

  // Simulate cloud storage (in production, this would be a real API)
  private async cloudStorage(action: 'get' | 'set', data?: SyncData): Promise<CloudSyncResponse> {
    const storageKey = `smoocho_sync_${this.userId}`
    
    try {
      if (action === 'get') {
        // Get data from cloud storage
        const cloudData = localStorage.getItem(storageKey)
        if (cloudData) {
          const parsed = JSON.parse(cloudData)
          return {
            success: true,
            data: parsed,
            timestamp: new Date().toISOString()
          }
        } else {
          return {
            success: true,
            data: {
              orders: [],
              products: [],
              inventory: [],
              settings: [],
              lastSync: new Date().toISOString(),
              deviceId: this.deviceId!,
              userId: this.userId!
            },
            timestamp: new Date().toISOString()
          }
        }
      } else if (action === 'set' && data) {
        // Save data to cloud storage
        localStorage.setItem(storageKey, JSON.stringify(data))
        return {
          success: true,
          timestamp: new Date().toISOString()
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }

    return {
      success: false,
      error: 'Invalid action',
      timestamp: new Date().toISOString()
    }
  }

  // Sync data with cloud storage
  async syncData(): Promise<boolean> {
    if (!this.userId || !this.deviceId || !this.isOnline) {
      return false
    }

    try {
      console.log('Starting data sync...')
      
      // Get local data
      const localData = await this.getLocalData()
      
      // Get cloud data
      const cloudResponse = await this.cloudStorage('get')
      
      if (!cloudResponse.success || !cloudResponse.data) {
        console.error('Failed to get cloud data:', cloudResponse.error)
        return false
      }

      const cloudData = cloudResponse.data
      
      // Compare timestamps to determine which data is newer
      const localTime = new Date(localData.lastSync).getTime()
      const cloudTime = new Date(cloudData.lastSync).getTime()
      
      let finalData: SyncData
      
      if (localTime > cloudTime) {
        // Local data is newer, upload to cloud
        console.log('Local data is newer, uploading to cloud...')
        finalData = localData
        await this.cloudStorage('set', localData)
      } else if (cloudTime > localTime) {
        // Cloud data is newer, download to local
        console.log('Cloud data is newer, downloading to local...')
        finalData = cloudData
        await this.applyCloudDataToLocal(cloudData)
      } else {
        // Data is the same, no sync needed
        console.log('Data is already in sync')
        return true
      }

      this.lastSyncTime = finalData.lastSync
      console.log('Data sync completed successfully')
      return true
      
    } catch (error) {
      console.error('Sync failed:', error)
      return false
    }
  }

  // Apply cloud data to local database
  private async applyCloudDataToLocal(cloudData: SyncData) {
    try {
      // Clear local data
      await Promise.all([
        db.orders.clear(),
        db.products.clear(),
        db.inventory.clear(),
        db.settings.clear()
      ])

      // Insert cloud data
      await Promise.all([
        db.orders.bulkAdd(cloudData.orders),
        db.products.bulkAdd(cloudData.products),
        db.inventory.bulkAdd(cloudData.inventory),
        db.settings.bulkAdd(cloudData.settings)
      ])

      console.log('Cloud data applied to local database')
    } catch (error) {
      console.error('Error applying cloud data:', error)
      throw error
    }
  }

  // Queue changes for offline sync
  queueChange(change: any) {
    this.pendingChanges.push({
      ...change,
      timestamp: new Date().toISOString(),
      deviceId: this.deviceId
    })
  }

  // Sync pending changes when back online
  private async syncPendingChanges() {
    if (this.pendingChanges.length === 0) return

    console.log(`Syncing ${this.pendingChanges.length} pending changes...`)
    
    try {
      await this.syncData()
      this.pendingChanges = []
      console.log('Pending changes synced successfully')
    } catch (error) {
      console.error('Failed to sync pending changes:', error)
    }
  }

  // Force immediate sync
  async forceSync(): Promise<boolean> {
    return await this.syncData()
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSyncTime,
      pendingChanges: this.pendingChanges.length,
      userId: this.userId,
      deviceId: this.deviceId
    }
  }

  // Cleanup
  destroy() {
    this.stopAutoSync()
    this.userId = null
    this.deviceId = null
    this.pendingChanges = []
  }
}

// Export singleton instance
export const cloudSyncService = new CloudSyncService()
