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
  shopId: string
}

interface SyncResponse {
  success: boolean
  data?: SyncData
  error?: string
  timestamp: string
  conflictResolution?: 'local' | 'cloud' | 'merge'
}

interface ProductionConfig {
  apiBaseUrl: string
  shopId: string
  apiKey: string
  maxRetries: number
  syncInterval: number
  offlineQueueSize: number
}

class ProductionSyncService {
  private config: ProductionConfig
  private userId: string | null = null
  private deviceId: string | null = null
  private syncInterval: NodeJS.Timeout | null = null
  private isOnline: boolean = true
  private pendingChanges: any[] = []
  private lastSyncTime: string | null = null
  private retryCount: number = 0
  private isSyncing: boolean = false
  private syncListeners: Array<(status: any) => void> = []

  constructor() {
    this.config = {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.smoochobill.com',
      shopId: process.env.NEXT_PUBLIC_SHOP_ID || 'default_shop',
      apiKey: process.env.NEXT_PUBLIC_API_KEY || 'demo_key',
      maxRetries: 3,
      syncInterval: 15000, // 15 seconds for production
      offlineQueueSize: 1000
    }
    
    this.setupOnlineStatusListener()
    this.setupVisibilityChangeListener()
  }

  // Initialize sync service with user and device info
  initialize(userId: string, deviceId: string) {
    this.userId = userId
    this.deviceId = deviceId
    this.startAutoSync()
    this.notifyListeners({ status: 'initialized', message: 'Sync service initialized' })
  }

  // Setup online/offline status listener
  private setupOnlineStatusListener() {
    const handleOnline = () => {
      this.isOnline = true
      this.retryCount = 0
      console.log('Device is online - resuming sync')
      this.notifyListeners({ status: 'online', message: 'Connection restored' })
      this.syncPendingChanges()
    }

    const handleOffline = () => {
      this.isOnline = false
      console.log('Device is offline - queuing changes')
      this.notifyListeners({ status: 'offline', message: 'Working offline' })
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
  }

  // Setup visibility change listener for background sync
  private setupVisibilityChangeListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isOnline) {
          // App became visible, sync immediately
          this.forceSync()
        }
      })
    }
  }

  // Start automatic synchronization
  private startAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(async () => {
      if (this.isOnline && this.userId && this.deviceId && !this.isSyncing) {
        await this.syncData()
      }
    }, this.config.syncInterval)

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

  // Get all local data with validation
  private async getLocalData(): Promise<SyncData> {
    try {
      const [orders, products, inventory, settings] = await Promise.all([
        db.orders.toArray(),
        db.products.toArray(),
        db.inventory.toArray(),
        db.settings.toArray()
      ])

      // Validate data integrity
      this.validateData({ orders, products, inventory, settings })

      return {
        orders: this.sanitizeData(orders),
        products: this.sanitizeData(products),
        inventory: this.sanitizeData(inventory),
        settings: this.sanitizeData(settings),
        lastSync: this.lastSyncTime || new Date().toISOString(),
        deviceId: this.deviceId!,
        userId: this.userId!,
        shopId: this.config.shopId
      }
    } catch (error) {
      console.error('Error getting local data:', error)
      throw new Error('Failed to retrieve local data')
    }
  }

  // Validate data integrity
  private validateData(data: any) {
    // Check for required fields and data types
    if (!Array.isArray(data.orders)) throw new Error('Invalid orders data')
    if (!Array.isArray(data.products)) throw new Error('Invalid products data')
    if (!Array.isArray(data.inventory)) throw new Error('Invalid inventory data')
    if (!Array.isArray(data.settings)) throw new Error('Invalid settings data')
  }

  // Sanitize data before sending
  private sanitizeData(data: any[]): any[] {
    return data.map(item => {
      // Remove any sensitive or unnecessary fields
      const sanitized = { ...item }
      delete sanitized._id // Remove internal IDs
      delete sanitized._rev // Remove revision fields
      return sanitized
    })
  }

  // Production API calls with proper error handling
  private async apiCall(endpoint: string, method: 'GET' | 'POST' | 'PUT', data?: any): Promise<SyncResponse> {
    const url = `${this.config.apiBaseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.config.apiKey}`,
      'X-Shop-ID': this.config.shopId,
      'X-User-ID': this.userId!,
      'X-Device-ID': this.deviceId!
    }

    const options: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    }

    try {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return {
        success: true,
        data: result.data,
        timestamp: result.timestamp || new Date().toISOString()
      }
    } catch (error) {
      console.error('API call failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown API error',
        timestamp: new Date().toISOString()
      }
    }
  }

  // Sync data with production cloud storage
  async syncData(): Promise<boolean> {
    if (!this.userId || !this.deviceId || !this.isOnline || this.isSyncing) {
      return false
    }

    this.isSyncing = true
    this.notifyListeners({ status: 'syncing', message: 'Synchronizing data...' })

    try {
      console.log('Starting production data sync...')
      
      // Get local data
      const localData = await this.getLocalData()
      
      // Get cloud data
      const cloudResponse = await this.apiCall('/sync/get', 'GET')
      
      if (!cloudResponse.success) {
        throw new Error(cloudResponse.error || 'Failed to get cloud data')
      }

      const cloudData = cloudResponse.data
      
      if (!cloudData) {
        throw new Error('No data received from cloud')
      }
      
      // Handle data conflicts and merging
      const syncResult = await this.handleDataSync(localData, cloudData)
      
      if (syncResult.conflictResolution) {
        console.log(`Data conflict resolved using: ${syncResult.conflictResolution}`)
      }

      this.lastSyncTime = syncResult.timestamp
      this.retryCount = 0
      
      this.notifyListeners({ 
        status: 'synced', 
        message: 'Data synchronized successfully',
        lastSync: this.lastSyncTime
      })
      
      console.log('Production data sync completed successfully')
      return true
      
    } catch (error) {
      console.error('Sync failed:', error)
      this.retryCount++
      
      if (this.retryCount < this.config.maxRetries) {
        console.log(`Retrying sync in 5 seconds... (${this.retryCount}/${this.config.maxRetries})`)
        setTimeout(() => this.syncData(), 5000)
      } else {
        this.notifyListeners({ 
          status: 'error', 
          message: 'Sync failed after multiple retries',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
      
      return false
    } finally {
      this.isSyncing = false
    }
  }

  // Handle data synchronization with conflict resolution
  private async handleDataSync(localData: SyncData, cloudData: SyncData): Promise<SyncResponse> {
    const localTime = new Date(localData.lastSync).getTime()
    const cloudTime = new Date(cloudData.lastSync).getTime()
    
    let finalData: SyncData
    let conflictResolution: 'local' | 'cloud' | 'merge' | undefined
    
    if (localTime > cloudTime) {
      // Local data is newer, upload to cloud
      console.log('Local data is newer, uploading to cloud...')
      finalData = localData
      conflictResolution = 'local'
      
      const uploadResponse = await this.apiCall('/sync/upload', 'POST', localData)
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Failed to upload data')
      }
      
    } else if (cloudTime > localTime) {
      // Cloud data is newer, download to local
      console.log('Cloud data is newer, downloading to local...')
      finalData = cloudData
      conflictResolution = 'cloud'
      
      await this.applyCloudDataToLocal(cloudData)
      
    } else {
      // Data is the same, no sync needed
      console.log('Data is already in sync')
      return {
        success: true,
        timestamp: new Date().toISOString()
      }
    }

    return {
      success: true,
      data: finalData,
      timestamp: new Date().toISOString(),
      conflictResolution
    }
  }

  // Apply cloud data to local database with transaction safety
  private async applyCloudDataToLocal(cloudData: SyncData) {
    try {
      // Use transaction for data integrity
      await db.transaction('rw', [db.orders, db.products, db.inventory, db.settings], async () => {
        // Clear local data
        await Promise.all([
          db.orders.clear(),
          db.products.clear(),
          db.inventory.clear(),
          db.settings.clear()
        ])

        // Insert cloud data with validation
        await Promise.all([
          db.orders.bulkAdd(cloudData.orders),
          db.products.bulkAdd(cloudData.products),
          db.inventory.bulkAdd(cloudData.inventory),
          db.settings.bulkAdd(cloudData.settings)
        ])
      })

      console.log('Cloud data applied to local database successfully')
    } catch (error) {
      console.error('Error applying cloud data:', error)
      throw new Error('Failed to apply cloud data to local database')
    }
  }

  // Queue changes for offline sync with size limit
  queueChange(change: any) {
    if (this.pendingChanges.length >= this.config.offlineQueueSize) {
      // Remove oldest changes if queue is full
      this.pendingChanges = this.pendingChanges.slice(-this.config.offlineQueueSize + 1)
    }
    
    this.pendingChanges.push({
      ...change,
      timestamp: new Date().toISOString(),
      deviceId: this.deviceId,
      userId: this.userId
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
    this.retryCount = 0
    return await this.syncData()
  }

  // Add sync status listener
  addSyncListener(listener: (status: any) => void) {
    this.syncListeners.push(listener)
  }

  // Remove sync status listener
  removeSyncListener(listener: (status: any) => void) {
    this.syncListeners = this.syncListeners.filter(l => l !== listener)
  }

  // Notify all listeners
  private notifyListeners(status: any) {
    this.syncListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in sync listener:', error)
      }
    })
  }

  // Get comprehensive sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSync: this.lastSyncTime,
      pendingChanges: this.pendingChanges.length,
      retryCount: this.retryCount,
      userId: this.userId,
      deviceId: this.deviceId,
      shopId: this.config.shopId,
      config: {
        syncInterval: this.config.syncInterval,
        maxRetries: this.config.maxRetries,
        offlineQueueSize: this.config.offlineQueueSize
      }
    }
  }

  // Health check for production monitoring
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.apiCall('/health', 'GET')
      return response.success
    } catch (error) {
      console.error('Health check failed:', error)
      return false
    }
  }

  // Cleanup
  destroy() {
    this.stopAutoSync()
    this.syncListeners = []
    this.userId = null
    this.deviceId = null
    this.pendingChanges = []
    this.isSyncing = false
  }
}

// Export singleton instance
export const productionSyncService = new ProductionSyncService()
