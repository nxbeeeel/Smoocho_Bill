import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/database'

export interface AppSettings {
  // Store Information
  storeName: string
  storeAddress: string
  storePhone: string
  storeEmail: string
  storeWebsite: string
  storeGST: string
  
  // Payment Settings
  taxRate: number
  currency: string
  upiId: string
  paymentMethods: string[]
  minOrderAmount: number
  deliveryCharge: number
  
  // System Settings
  printerEnabled: boolean
  soundEnabled: boolean
  notifications: boolean
  autoBackup: boolean
  theme: string
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  
  // Security Settings
  requirePassword: boolean
  sessionTimeout: number
  twoFactorAuth: boolean
  
  // Display Settings
  showImages: boolean
  showPrices: boolean
  showStock: boolean
  compactMode: boolean
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  lowStockAlert: boolean
  dailyReport: boolean
  
  // Backup Settings
  backupFrequency: string
  cloudBackup: boolean
  localBackup: boolean
  backupRetention: number
}

const defaultSettings: AppSettings = {
  // Store Information
  storeName: 'Smoocho Bill',
  storeAddress: '123 Main Street, City',
  storePhone: '+91 9876543210',
  storeEmail: 'info@smoochobill.com',
  storeWebsite: 'https://www.smoochobill.com',
  storeGST: '22ABCDE1234F1Z5',
  
  // Payment Settings
  taxRate: 18,
  currency: 'INR',
  upiId: 'smoocho@paytm',
  paymentMethods: ['cash', 'card', 'upi', 'wallet'],
  minOrderAmount: 0,
  deliveryCharge: 0,
  
  // System Settings
  printerEnabled: true,
  soundEnabled: true,
  notifications: true,
  autoBackup: false,
  theme: 'light',
  language: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  
  // Security Settings
  requirePassword: false,
  sessionTimeout: 30,
  twoFactorAuth: false,
  
  // Display Settings
  showImages: true,
  showPrices: true,
  showStock: true,
  compactMode: false,
  
  // Notification Settings
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  lowStockAlert: true,
  dailyReport: false,
  
  // Backup Settings
  backupFrequency: 'daily',
  cloudBackup: false,
  localBackup: true,
  backupRetention: 30
}

// localStorage key for settings backup
const SETTINGS_STORAGE_KEY = 'smoocho_settings_backup'

// Helper functions for localStorage backup
const saveToLocalStorage = (settings: AppSettings) => {
  // Check if we're in the browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return
  }
  
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
    console.log('Settings backed up to localStorage')
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

const loadFromLocalStorage = (): AppSettings | null => {
  // Check if we're in the browser environment
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null
  }
  
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Only log once to avoid spam
      if (!(window as any).settingsLoadedFromBackup) {
        console.log('Settings loaded from localStorage backup')
        ;(window as any).settingsLoadedFromBackup = true
      }
      return parsed
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error)
  }
  return null
}

export function useSettings() {
  const settingsData = useLiveQuery(() => db.settings.toArray()) || []
  
  // Convert database settings to object
  const settings: AppSettings = { ...defaultSettings }
  
  // Safety check for settingsData
  if (Array.isArray(settingsData)) {
    settingsData.forEach(setting => {
      const key = setting.key as keyof AppSettings
      if (key in settings) {
        const value = setting.value
        
        // Parse different data types
        if (key === 'taxRate' || key === 'minOrderAmount' || key === 'deliveryCharge' || key === 'sessionTimeout' || key === 'backupRetention') {
          settings[key] = parseFloat(value) || 0
        } else if (key === 'printerEnabled' || key === 'soundEnabled' || key === 'notifications' || key === 'autoBackup' || key === 'requirePassword' || key === 'twoFactorAuth' || key === 'showImages' || key === 'showPrices' || key === 'showStock' || key === 'compactMode' || key === 'emailNotifications' || key === 'smsNotifications' || key === 'pushNotifications' || key === 'lowStockAlert' || key === 'dailyReport' || key === 'cloudBackup' || key === 'localBackup') {
          settings[key] = value === 'true'
        } else if (key === 'paymentMethods') {
          try {
            settings[key] = JSON.parse(value)
          } catch {
            settings[key] = ['cash', 'card', 'upi', 'wallet']
          }
        } else {
          settings[key] = value as any
        }
      }
    })
  }
  
  // If no settings from database, try localStorage backup
  if (!Array.isArray(settingsData) || settingsData.length === 0) {
    const backupSettings = loadFromLocalStorage()
    if (backupSettings) {
      Object.assign(settings, backupSettings)
      // Only log once to avoid spam
      if (!(window as any).usingLocalStorageBackup) {
        console.log('Using localStorage backup for settings')
        ;(window as any).usingLocalStorageBackup = true
      }
    }
  }
  
  // Debug logging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('Settings loaded:', settings)
    console.log('Settings data from DB:', settingsData)
  }
  
  const updateSetting = async (key: keyof AppSettings, value: any) => {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
    
    try {
      const existing = await db.settings.where('key').equals(key).first()
      
      if (existing) {
        await db.settings.update(existing.id!, {
          value: stringValue,
          updatedAt: new Date()
        })
      } else {
        await db.settings.add({
          key,
          value: stringValue,
          updatedAt: new Date()
        })
      }
      
      // Update localStorage backup
      const updatedSettings = { ...settings, [key]: value }
      saveToLocalStorage(updatedSettings)
      
      console.log(`Setting ${key} updated successfully`)
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error)
      throw error
    }
  }
  
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      console.log('Updating multiple settings:', newSettings)
      
      // Update each setting individually
      const promises = Object.entries(newSettings).map(([key, value]) => 
        updateSetting(key as keyof AppSettings, value)
      )
      
      await Promise.all(promises)
      
      // Update localStorage backup with all new settings
      const updatedSettings = { ...settings, ...newSettings }
      saveToLocalStorage(updatedSettings)
      
      console.log('All settings updated successfully')
    } catch (error) {
      console.error('Failed to update settings:', error)
      throw error
    }
  }
  
  const forceSaveSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      console.log('Force saving settings:', newSettings)
      
      // Clear existing settings
      await db.settings.clear()
      console.log('Cleared existing settings')
      
      // Add new settings
      const savePromises = Object.entries(newSettings).map(async ([key, value]) => {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value)
        
        await db.settings.add({
          key,
          value: stringValue,
          updatedAt: new Date()
        })
        
        console.log(`Force saved setting ${key}: ${stringValue}`)
      })
      
      await Promise.all(savePromises)
      
      // Update localStorage backup
      const updatedSettings = { ...settings, ...newSettings }
      saveToLocalStorage(updatedSettings)
      
      console.log('Force save completed successfully')
    } catch (error) {
      console.error('Force save failed:', error)
      throw error
    }
  }
  
  return {
    settings,
    updateSetting,
    updateSettings,
    forceSaveSettings
  }
}