'use client'

import { db } from './database'

interface OfflineOperation {
  id: string
  type: 'order' | 'inventory' | 'product' | 'setting'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: string
  deviceId: string
  userId: string
  retryCount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

interface OfflineStatus {
  isOnline: boolean
  pendingOperations: number
  lastSyncTime: string | null
  queueSize: number
  isProcessing: boolean
}

class OfflineService {
  private isOnline: boolean = typeof window !== 'undefined' ? navigator.onLine : false
  private offlineQueue: OfflineOperation[] = []
  private isProcessing: boolean = false
  private lastSyncTime: string | null = null
  private statusListeners: Array<(status: OfflineStatus) => void> = []
  private maxQueueSize: number = 1000
  private maxRetries: number = 3

  constructor() {
    this.setupOnlineStatusListener()
    this.loadOfflineQueue()
    this.startPeriodicSync()
  }

  // Setup online/offline status monitoring
  private setupOnlineStatusListener() {
    const handleOnline = () => {
      this.isOnline = true
      console.log('🟢 Device is online - processing offline queue')
      this.notifyStatusChange()
      this.processOfflineQueue()
    }

    const handleOffline = () => {
      this.isOnline = false
      console.log('🔴 Device is offline - queuing operations')
      this.notifyStatusChange()
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)
    }
    
    // Check online status periodically
    setInterval(() => {
      const wasOnline = this.isOnline
      this.isOnline = typeof window !== 'undefined' ? navigator.onLine : false
      
      if (this.isOnline && !wasOnline) {
        handleOnline()
      } else if (!this.isOnline && wasOnline) {
        handleOffline()
      }
    }, 5000)
  }

  // Load offline queue from localStorage
  private loadOfflineQueue() {
    try {
      const stored = localStorage.getItem('offline_queue')
      if (stored) {
        this.offlineQueue = JSON.parse(stored)
        console.log(`📦 Loaded ${this.offlineQueue.length} offline operations`)
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error)
      this.offlineQueue = []
    }
  }

  // Save offline queue to localStorage
  private saveOfflineQueue() {
    try {
      localStorage.setItem('offline_queue', JSON.stringify(this.offlineQueue))
    } catch (error) {
      console.error('Failed to save offline queue:', error)
    }
  }

  // Add operation to offline queue
  addOperation(type: OfflineOperation['type'], action: OfflineOperation['action'], data: any, userId: string, deviceId: string) {
    const operation: OfflineOperation = {
      id: `${type}_${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      action,
      data,
      timestamp: new Date().toISOString(),
      deviceId,
      userId,
      retryCount: 0,
      status: 'pending'
    }

    // Prevent queue overflow
    if (this.offlineQueue.length >= this.maxQueueSize) {
      // Remove oldest operations
      this.offlineQueue = this.offlineQueue.slice(-this.maxQueueSize + 1)
    }

    this.offlineQueue.push(operation)
    this.saveOfflineQueue()
    this.notifyStatusChange()

    console.log(`📝 Added ${type} ${action} operation to offline queue`)

    // If online, try to process immediately
    if (this.isOnline) {
      this.processOfflineQueue()
    }
  }

  // Process offline queue
  private async processOfflineQueue() {
    if (this.isProcessing || !this.isOnline || this.offlineQueue.length === 0) {
      return
    }

    this.isProcessing = true
    this.notifyStatusChange()

    console.log(`🔄 Processing ${this.offlineQueue.length} offline operations...`)

    const operationsToProcess = [...this.offlineQueue]
    const completedOperations: string[] = []
    const failedOperations: OfflineOperation[] = []

    for (const operation of operationsToProcess) {
      try {
        await this.processOperation(operation)
        completedOperations.push(operation.id)
        console.log(`✅ Completed operation: ${operation.type} ${operation.action}`)
      } catch (error) {
        console.error(`❌ Failed operation: ${operation.type} ${operation.action}`, error)
        
        operation.retryCount++
        if (operation.retryCount < this.maxRetries) {
          operation.status = 'pending'
          failedOperations.push(operation)
        } else {
          operation.status = 'failed'
          console.error(`💀 Operation failed permanently: ${operation.id}`)
        }
      }
    }

    // Update queue
    this.offlineQueue = this.offlineQueue.filter(op => !completedOperations.includes(op.id))
    this.offlineQueue = [...this.offlineQueue, ...failedOperations]
    
    this.saveOfflineQueue()
    this.lastSyncTime = new Date().toISOString()
    this.isProcessing = false
    this.notifyStatusChange()

    console.log(`🎉 Processed ${completedOperations.length} operations, ${failedOperations.length} failed`)
  }

  // Process individual operation
  private async processOperation(operation: OfflineOperation) {
    operation.status = 'processing'

    switch (operation.type) {
      case 'order':
        await this.processOrderOperation(operation)
        break
      case 'inventory':
        await this.processInventoryOperation(operation)
        break
      case 'product':
        await this.processProductOperation(operation)
        break
      case 'setting':
        await this.processSettingOperation(operation)
        break
      default:
        throw new Error(`Unknown operation type: ${operation.type}`)
    }

    operation.status = 'completed'
  }

  // Process order operations
  private async processOrderOperation(operation: OfflineOperation) {
    const { action, data } = operation

    switch (action) {
      case 'create':
        await db.orders.add({
          ...data,
          id: undefined, // Let database generate ID
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'update':
        await db.orders.update(data.id, {
          ...data,
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'delete':
        await db.orders.delete(data.id)
        break
    }
  }

  // Process inventory operations
  private async processInventoryOperation(operation: OfflineOperation) {
    const { action, data } = operation

    switch (action) {
      case 'create':
        await db.inventory.add({
          ...data,
          id: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'update':
        await db.inventory.update(data.id, {
          ...data,
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'delete':
        await db.inventory.delete(data.id)
        break
    }
  }

  // Process product operations
  private async processProductOperation(operation: OfflineOperation) {
    const { action, data } = operation

    switch (action) {
      case 'create':
        await db.products.add({
          ...data,
          id: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'update':
        await db.products.update(data.id, {
          ...data,
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'delete':
        await db.products.delete(data.id)
        break
    }
  }

  // Process setting operations
  private async processSettingOperation(operation: OfflineOperation) {
    const { action, data } = operation

    switch (action) {
      case 'create':
        await db.settings.add({
          ...data,
          id: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'update':
        await db.settings.update(data.id, {
          ...data,
          updatedAt: new Date(),
          syncStatus: 'synced'
        })
        break
      case 'delete':
        await db.settings.delete(data.id)
        break
    }
  }

  // Start periodic sync when online
  private startPeriodicSync() {
    setInterval(() => {
      if (this.isOnline && this.offlineQueue.length > 0) {
        this.processOfflineQueue()
      }
    }, 30000) // Check every 30 seconds
  }

  // Add status listener
  addStatusListener(listener: (status: OfflineStatus) => void) {
    this.statusListeners.push(listener)
  }

  // Remove status listener
  removeStatusListener(listener: (status: OfflineStatus) => void) {
    this.statusListeners = this.statusListeners.filter(l => l !== listener)
  }

  // Notify status change
  private notifyStatusChange() {
    const status: OfflineStatus = {
      isOnline: this.isOnline,
      pendingOperations: this.offlineQueue.length,
      lastSyncTime: this.lastSyncTime,
      queueSize: this.offlineQueue.length,
      isProcessing: this.isProcessing
    }

    this.statusListeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in status listener:', error)
      }
    })
  }

  // Get offline status
  getStatus(): OfflineStatus {
    return {
      isOnline: this.isOnline,
      pendingOperations: this.offlineQueue.length,
      lastSyncTime: this.lastSyncTime,
      queueSize: this.offlineQueue.length,
      isProcessing: this.isProcessing
    }
  }

  // Force process queue
  async forceProcessQueue() {
    if (this.isOnline) {
      await this.processOfflineQueue()
    }
  }

  // Clear failed operations
  clearFailedOperations() {
    this.offlineQueue = this.offlineQueue.filter(op => op.status !== 'failed')
    this.saveOfflineQueue()
    this.notifyStatusChange()
  }

  // Get queue details
  getQueueDetails() {
    return {
      total: this.offlineQueue.length,
      pending: this.offlineQueue.filter(op => op.status === 'pending').length,
      processing: this.offlineQueue.filter(op => op.status === 'processing').length,
      completed: this.offlineQueue.filter(op => op.status === 'completed').length,
      failed: this.offlineQueue.filter(op => op.status === 'failed').length,
      operations: this.offlineQueue
    }
  }
}

// Export singleton instance
export const offlineService = new OfflineService()
