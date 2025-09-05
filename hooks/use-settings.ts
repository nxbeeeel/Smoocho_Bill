"use client"

import { useState, useEffect, useCallback } from 'react'

export interface AppSettings {
  autoSync: boolean
  darkMode: boolean
  soundEffects: boolean
  taxRate: number
  currency: string
  businessName: string
  businessAddress: string
  businessPhone: string
  businessEmail: string
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
  autoSync: true,
  darkMode: false,
  soundEffects: true,
  taxRate: 18,
  currency: 'INR',
  businessName: 'Smoocho Bill',
  businessAddress: '',
  businessPhone: '',
  businessEmail: '',
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

  return {
    settings,
    loading,
    error,
    updateSetting,
    saveSettings,
    resetToDefaults
  }
}
