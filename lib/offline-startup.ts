'use client'

import { db } from './database'

interface StartupData {
  products: any[]
  inventory: any[]
  settings: any[]
  orders: any[]
  isOfflineMode: boolean
  lastSyncTime: string | null
}

interface StartupStatus {
  phase: 'checking' | 'loading' | 'syncing' | 'ready' | 'error'
  progress: number
  message: string
  isOfflineMode: boolean
}

class OfflineStartupService {
  private statusListeners: Array<(status: StartupStatus) => void> = []
  private isInitialized: boolean = false
  private startupData: StartupData | null = null

  constructor() {
    this.setupStartupStrategy()
  }

  // Setup comprehensive startup strategy
  private setupStartupStrategy() {
    // Check if we have cached data first
    this.checkCachedData()
    
    // Always try to load from IndexedDB (works offline)
    this.loadFromIndexedDB()
    
    // If online, try to sync with server
    if (typeof window !== 'undefined' && navigator.onLine) {
      this.attemptServerSync()
    }
  }

  // Check for cached data in localStorage
  private checkCachedData() {
    try {
      const cachedData = localStorage.getItem('pos_startup_cache')
      if (cachedData) {
        const parsed = JSON.parse(cachedData)
        const cacheAge = Date.now() - parsed.timestamp
        
        // Use cache if less than 24 hours old
        if (cacheAge < 24 * 60 * 60 * 1000) {
          console.log('📦 Using cached startup data')
          this.startupData = parsed.data
          this.notifyStatus({
            phase: 'ready',
            progress: 100,
            message: 'Loaded from cache',
            isOfflineMode: true,
          })
          return true
        }
      }
    } catch (error) {
      console.error('Failed to load cached data:', error)
    }
    return false
  }

  // Load data from IndexedDB (always works offline)
  private async loadFromIndexedDB() {
    try {
      this.notifyStatus({
        phase: 'loading',
        progress: 20,
        message: 'Loading local data...',
        isOfflineMode: typeof window === 'undefined' || !navigator.onLine,
      })

      // Load all data from IndexedDB
      const [products, inventory, settings, orders] = await Promise.all([
        db.products.toArray(),
        db.inventory.toArray(),
        db.settings.toArray(),
        db.orders.toArray()
      ])

      this.startupData = {
        products,
        inventory,
        settings,
        orders,
        isOfflineMode: typeof window === 'undefined' || !navigator.onLine,
        lastSyncTime: localStorage.getItem('last_sync_time'),
      }

      // Cache the data for future startups
      this.cacheStartupData()

      this.notifyStatus({
        phase: 'ready',
        progress: 100,
        message: 'Local data loaded successfully',
        isOfflineMode: typeof window === 'undefined' || !navigator.onLine,
      })

      console.log('✅ IndexedDB data loaded successfully')
      return true

    } catch (error) {
      console.error('Failed to load from IndexedDB:', error)
      this.notifyStatus({
        phase: 'error',
        progress: 0,
        message: 'Failed to load local data',
        isOfflineMode: true,
      })
      return false
    }
  }

  // Attempt to sync with server if online
  private async attemptServerSync() {
    if (typeof window === 'undefined' || !navigator.onLine) return

    try {
      this.notifyStatus({
        phase: 'syncing',
        progress: 50,
        message: 'Syncing with server...',
        isOfflineMode: false,
      })

      // Try to sync with server
      const syncResult = await this.syncWithServer()
      
      if (syncResult.success) {
        this.notifyStatus({
          phase: 'ready',
          progress: 100,
          message: 'Synced with server successfully',
          isOfflineMode: false,
        })
        console.log('✅ Server sync completed')
      } else {
        // Fall back to local data
        this.notifyStatus({
          phase: 'ready',
          progress: 100,
          message: 'Using local data (server unavailable)',
          isOfflineMode: true,
        })
        console.log('⚠️ Server sync failed, using local data')
      }

    } catch (error) {
      console.error('Server sync error:', error)
      this.notifyStatus({
        phase: 'ready',
        progress: 100,
        message: 'Using local data (connection failed)',
        isOfflineMode: true,
      })
    }
  }

  // Sync with server
  private async syncWithServer(): Promise<{ success: boolean; data?: any }> {
    try {
      // Check if we have a server endpoint
      const response = await fetch('/api/sync/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const serverData = await response.json()
      
      // Merge server data with local data
      await this.mergeServerData(serverData)
      
      return { success: true, data: serverData }

    } catch (error) {
      console.error('Server sync failed:', error)
      return { success: false }
    }
  }

  // Merge server data with local data
  private async mergeServerData(serverData: any) {
    try {
      // Update local data with server data
      if (serverData.products) {
        await db.products.clear()
        await db.products.bulkAdd(serverData.products)
      }

      if (serverData.inventory) {
        await db.inventory.clear()
        await db.inventory.bulkAdd(serverData.inventory)
      }

      if (serverData.settings) {
        await db.settings.clear()
        await db.settings.bulkAdd(serverData.settings)
      }

      if (serverData.orders) {
        await db.orders.clear()
        await db.orders.bulkAdd(serverData.orders)
      }


      // Update last sync time
      localStorage.setItem('last_sync_time', new Date().toISOString())
      
      // Cache updated data
      this.cacheStartupData()

    } catch (error) {
      console.error('Failed to merge server data:', error)
    }
  }

  // Cache startup data for future use
  private cacheStartupData() {
    if (!this.startupData) return

    try {
      const cacheData = {
        data: this.startupData,
        timestamp: Date.now()
      }
      
      localStorage.setItem('pos_startup_cache', JSON.stringify(cacheData))
      console.log('💾 Startup data cached successfully')
    } catch (error) {
      console.error('Failed to cache startup data:', error)
    }
  }

  // Get startup data
  getStartupData(): StartupData | null {
    return this.startupData
  }

  // Add status listener
  addStatusListener(listener: (status: StartupStatus) => void) {
    this.statusListeners.push(listener)
  }

  // Remove status listener
  removeStatusListener(listener: (status: StartupStatus) => void) {
    this.statusListeners = this.statusListeners.filter(l => l !== listener)
  }

  // Notify status change
  private notifyStatus(status: StartupStatus) {
    this.statusListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in startup status listener:', error)
      }
    })
  }

  // Initialize with fallback strategy
  async initialize(): Promise<StartupData> {
    if (this.isInitialized && this.startupData) {
      return this.startupData
    }

    return new Promise((resolve, reject) => {
      const handleStatus = (status: StartupStatus) => {
        if (status.phase === 'ready' && this.startupData) {
          this.isInitialized = true
          this.removeStatusListener(handleStatus)
          resolve(this.startupData)
        } else if (status.phase === 'error') {
          this.removeStatusListener(handleStatus)
          reject(new Error('Failed to initialize'))
        }
      }

      this.addStatusListener(handleStatus)
      
      // Start the initialization process
      this.setupStartupStrategy()
    })
  }

  // Force refresh from server
  async forceRefresh(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      console.log('Cannot refresh - offline')
      return false
    }

    try {
      this.notifyStatus({
        phase: 'syncing',
        progress: 0,
        message: 'Refreshing from server...',
        isOfflineMode: false,
      })

      const syncResult = await this.syncWithServer()
      
      if (syncResult.success) {
        // Reload from IndexedDB after sync
        await this.loadFromIndexedDB()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Force refresh failed:', error)
      return false
    }
  }

  // Check if we have essential data
  hasEssentialData(): boolean {
    if (!this.startupData) return false
    
    // Check if we have at least products and settings
    return this.startupData.products.length > 0 && this.startupData.settings.length > 0
  }

  // Get offline capabilities
  getOfflineCapabilities() {
    return {
      canProcessOrders: true,
      canManageInventory: true,
      canUpdateSettings: true,
      canViewHistory: true,
      canPrintBills: true,
      canExportData: true,
      canImportData: true,
      syncWhenOnline: true
    }
  }
}

// Export singleton instance
export const offlineStartupService = new OfflineStartupService()
