"use client"

import { useState, useEffect, useCallback } from 'react'

export interface AppSettings {
  // Core Application Settings
  autoSync: boolean
  darkMode: boolean
  soundEffects: boolean
  
  // Business Information
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
  businessWebsite: string
  businessGST: string
  
  // Financial Settings
  taxRate: number
  currency: string
  minimumOrderAmount: number
  deliveryCharge: number
  upiId: string
  
  // Display Settings
  theme: string
  language: string
  timezone: string
  dateFormat: string
  
  // Feature Toggles
  printerEnabled: boolean
  soundEnabled: boolean
  autoBackup: boolean
  showImages: boolean
  showPrices: boolean
  showStock: boolean
  compactMode: boolean
  
  // Notification Settings
  notifications: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  lowStockAlert: boolean
  dailyReport: boolean
  
  // Backup Settings
  backupFrequency: string
  backupRetention: number
  cloudBackup: boolean
  localBackup: boolean
  
  // Legacy Settings (for backward compatibility)
  printerSettings: {
    enabled: boolean
    paperSize: string
    copies: number
  }
  backupSettings: {
    enabled: boolean
    frequency: string
    lastBackup: Date | null
  }
}

const defaultSettings: AppSettings = {
  // Core Application Settings
  autoSync: true,
  darkMode: false,
  soundEffects: true,
  
  // Business Information
  businessName: 'Smoocho Bill',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
  businessWebsite: '',
  businessGST: '',
  
  // Financial Settings
  taxRate: 18,
  currency: 'INR',
  minimumOrderAmount: 0,
  deliveryCharge: 0,
  upiId: '',
  
  // Display Settings
  theme: 'light',
  language: 'en',
  timezone: 'Asia/Kolkata',
  dateFormat: 'DD/MM/YYYY',
  
  // Feature Toggles
  printerEnabled: false,
  soundEnabled: true,
  autoBackup: false,
  showImages: true,
  showPrices: true,
  showStock: true,
  compactMode: false,
  
  // Notification Settings
  notifications: true,
  emailNotifications: false,
  smsNotifications: false,
  pushNotifications: true,
  lowStockAlert: true,
  dailyReport: false,
  
  // Backup Settings
  backupFrequency: 'daily',
  backupRetention: 30,
  cloudBackup: false,
  localBackup: true,
  
  // Legacy Settings (for backward compatibility)
  printerSettings: {
    enabled: false,
    paperSize: '80mm',
    copies: 1
  },
  backupSettings: {
    enabled: false,
    frequency: 'daily',
    lastBackup: null
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }, [])

  // Save settings to localStorage
  const saveSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)
      localStorage.setItem('app-settings', JSON.stringify(updatedSettings))
    } catch (err) {
      console.error('Error saving settings:', err)
      setError('Failed to save settings')
    }
  }, [settings])

  // Update specific setting
  const updateSetting = useCallback(async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    await saveSettings({ [key]: value })
  }, [saveSettings])

  // Reset to defaults
  const resetToDefaults = useCallback(async () => {
    setSettings(defaultSettings)
    localStorage.setItem('app-settings', JSON.stringify(defaultSettings))
  }, [])

  // Legacy method for backward compatibility
  const updateSettings = saveSettings

  return {
    settings,
    loading,
    error,
    updateSetting,
    updateSettings, // Legacy method
    saveSettings,
    resetToDefaults
  }
}
