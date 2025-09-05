'use client'

import { db } from './database'

interface PersistenceConfig {
  autoBackup: boolean
  backupInterval: number // in minutes
  maxBackups: number
  compressionEnabled: boolean
  encryptionEnabled: boolean
}

interface BackupData {
  id: string
  timestamp: string
  data: any
  size: number
  checksum: string
  version: string
}

class OfflinePersistenceService {
  private config: PersistenceConfig = {
    autoBackup: true,
    backupInterval: 30, // 30 minutes
    maxBackups: 10,
    compressionEnabled: true,
    encryptionEnabled: false // Can be enabled for sensitive data
  }

  private backupTimer: NodeJS.Timeout | null = null
  private isBackingUp: boolean = false

  constructor() {
    this.setupAutoBackup()
    this.setupDataRecovery()
  }

  // Setup automatic backup
  private setupAutoBackup() {
    if (this.config.autoBackup) {
      this.startBackupTimer()
    }

    // Backup before page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.createBackup()
      })
    }

    // Backup on visibility change (when app goes to background)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.createBackup()
        }
      })
    }
  }

  // Setup data recovery mechanisms
  private setupDataRecovery() {
    // Check for corrupted data on startup
    this.checkDataIntegrity()
    
    // Setup periodic integrity checks
    setInterval(() => {
      this.checkDataIntegrity()
    }, 60 * 60 * 1000) // Every hour
  }

  // Start backup timer
  private startBackupTimer() {
    if (this.backupTimer) {
      clearInterval(this.backupTimer)
    }

    this.backupTimer = setInterval(() => {
      this.createBackup()
    }, this.config.backupInterval * 60 * 1000)
  }

  // Create backup
  async createBackup(): Promise<BackupData | null> {
    if (this.isBackingUp) {
      console.log('Backup already in progress, skipping...')
      return null
    }

    this.isBackingUp = true

    try {
      console.log('🔄 Creating backup...')

      // Collect all data
      const [products, inventory, settings, orders] = await Promise.all([
        db.products.toArray(),
        db.inventory.toArray(),
        db.settings.toArray(),
        db.orders.toArray()
      ])

      const backupData = {
        products,
        inventory,
        settings,
        orders,
        metadata: {
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          deviceId: this.getDeviceId(),
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
        }
      }

      // Compress if enabled
      let processedData = backupData
      if (this.config.compressionEnabled) {
        processedData = await this.compressData(backupData)
      }

      // Create backup object
      const backup: BackupData = {
        id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        data: processedData,
        size: JSON.stringify(processedData).length,
        checksum: this.calculateChecksum(processedData),
        version: '1.0.0'
      }

      // Store backup
      await this.storeBackup(backup)

      // Cleanup old backups
      await this.cleanupOldBackups()

      console.log('✅ Backup created successfully')
      return backup

    } catch (error) {
      console.error('❌ Backup failed:', error)
      return null
    } finally {
      this.isBackingUp = false
    }
  }

  // Store backup in localStorage
  private async storeBackup(backup: BackupData) {
    try {
      const backups = this.getStoredBackups()
      backups.push(backup)
      
      // Keep only the latest backups
      const sortedBackups = backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      
      const limitedBackups = sortedBackups.slice(0, this.config.maxBackups)
      
      localStorage.setItem('pos_backups', JSON.stringify(limitedBackups))
      console.log(`💾 Backup stored: ${backup.id}`)
    } catch (error) {
      console.error('Failed to store backup:', error)
    }
  }

  // Get stored backups
  private getStoredBackups(): BackupData[] {
    try {
      const stored = localStorage.getItem('pos_backups')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Failed to get stored backups:', error)
      return []
    }
  }

  // Cleanup old backups
  private async cleanupOldBackups() {
    const backups = this.getStoredBackups()
    if (backups.length > this.config.maxBackups) {
      const sortedBackups = backups.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      
      const limitedBackups = sortedBackups.slice(0, this.config.maxBackups)
      localStorage.setItem('pos_backups', JSON.stringify(limitedBackups))
      
      console.log(`🧹 Cleaned up ${backups.length - limitedBackups.length} old backups`)
    }
  }

  // Restore from backup
  async restoreFromBackup(backupId: string): Promise<boolean> {
    try {
      const backups = this.getStoredBackups()
      const backup = backups.find(b => b.id === backupId)
      
      if (!backup) {
        throw new Error('Backup not found')
      }

      console.log(`🔄 Restoring from backup: ${backupId}`)

      // Verify backup integrity
      if (!this.verifyBackupIntegrity(backup)) {
        throw new Error('Backup integrity check failed')
      }

      // Clear existing data
      await Promise.all([
        db.products.clear(),
        db.inventory.clear(),
        db.settings.clear(),
        db.orders.clear()
      ])

      // Restore data
      const data = backup.data
      await Promise.all([
        db.products.bulkAdd(data.products || []),
        db.inventory.bulkAdd(data.inventory || []),
        db.settings.bulkAdd(data.settings || []),
        db.orders.bulkAdd(data.orders || []),
      ])

      console.log('✅ Data restored successfully')
      return true

    } catch (error) {
      console.error('❌ Restore failed:', error)
      return false
    }
  }

  // Check data integrity
  private async checkDataIntegrity(): Promise<boolean> {
    try {
      console.log('🔍 Checking data integrity...')

      // Check if database is accessible
      const productCount = await db.products.count()
      const inventoryCount = await db.inventory.count()
      const settingsCount = await db.settings.count()
      const ordersCount = await db.orders.count()

      console.log(`📊 Data counts: Products: ${productCount}, Inventory: ${inventoryCount}, Settings: ${settingsCount}, Orders: ${ordersCount}`)

      // Check for essential data
      if (settingsCount === 0) {
        console.warn('⚠️ No settings found - this might indicate data corruption')
        await this.createDefaultSettings()
      }


      console.log('✅ Data integrity check passed')
      return true

    } catch (error) {
      console.error('❌ Data integrity check failed:', error)
      return false
    }
  }

  // Create default settings if missing
  private async createDefaultSettings() {
    try {
      const defaultSettings = [
        {
          key: 'store_name',
          value: 'My Store',
          type: 'string',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: 'store_address',
          value: '123 Main Street, City, State',
          type: 'string',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: 'store_phone',
          value: '+1 (555) 123-4567',
          type: 'string',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: 'tax_rate',
          value: '0.18',
          type: 'number',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          key: 'currency',
          value: 'INR',
          type: 'string',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      await db.settings.bulkAdd(defaultSettings)
      console.log('✅ Default settings created')
    } catch (error) {
      console.error('Failed to create default settings:', error)
    }
  }


  // Compress data
  private async compressData(data: any): Promise<any> {
    // Simple compression by removing unnecessary whitespace
    // In a real implementation, you might use a compression library
    return JSON.parse(JSON.stringify(data))
  }

  // Calculate checksum
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(36)
  }

  // Verify backup integrity
  private verifyBackupIntegrity(backup: BackupData): boolean {
    const calculatedChecksum = this.calculateChecksum(backup.data)
    return calculatedChecksum === backup.checksum
  }

  // Get device ID
  private getDeviceId(): string {
    let deviceId = localStorage.getItem('device_id')
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('device_id', deviceId)
    }
    return deviceId
  }

  // Export data
  async exportData(): Promise<string> {
    const backup = await this.createBackup()
    if (backup) {
      return JSON.stringify(backup, null, 2)
    }
    throw new Error('Failed to create export data')
  }

  // Import data
  async importData(data: string): Promise<boolean> {
    try {
      const backup = JSON.parse(data) as BackupData
      
      if (!this.verifyBackupIntegrity(backup)) {
        throw new Error('Invalid backup data')
      }

      return await this.restoreFromBackup(backup.id)
    } catch (error) {
      console.error('Import failed:', error)
      return false
    }
  }

  // Get backup list
  getBackupList(): BackupData[] {
    return this.getStoredBackups()
  }

  // Update configuration
  updateConfig(newConfig: Partial<PersistenceConfig>) {
    this.config = { ...this.config, ...newConfig }
    
    if (newConfig.autoBackup !== undefined) {
      if (newConfig.autoBackup) {
        this.startBackupTimer()
      } else if (this.backupTimer) {
        clearInterval(this.backupTimer)
        this.backupTimer = null
      }
    }
  }

  // Get configuration
  getConfig(): PersistenceConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const offlinePersistenceService = new OfflinePersistenceService()
