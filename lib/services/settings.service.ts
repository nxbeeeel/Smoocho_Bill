import { AppSettings } from '@/hooks/use-settings'
import { db } from '@/lib/database'

export interface SettingsUpdateRequest {
  [key: string]: any
}

export class SettingsService {
  // Get all settings
  async getAllSettings(): Promise<AppSettings> {
    try {
      const settings = await db.settings.toArray()
      const settingsMap: Partial<AppSettings> = {}
      
      settings.forEach(setting => {
        try {
          settingsMap[setting.key as keyof AppSettings] = JSON.parse(setting.value)
        } catch {
          settingsMap[setting.key as keyof AppSettings] = setting.value as any
        }
      })
      
      return settingsMap as AppSettings
    } catch (error) {
      console.error('Error fetching settings:', error)
      throw error
    }
  }

  // Get specific setting
  async getSetting(key: keyof AppSettings): Promise<any> {
    try {
      const setting = await db.settings.get({ key })
      if (setting) {
        try {
          return JSON.parse(setting.value)
        } catch {
          return setting.value
        }
      }
      return null
    } catch (error) {
      console.error(`Error fetching setting ${key}:`, error)
      return null
    }
  }

  // Update single setting
  async updateSetting(key: keyof AppSettings, value: any): Promise<boolean> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
      
      await db.settings.put({
        key,
        value: stringValue,
        updatedAt: new Date()
      })
      
      return true
    } catch (error) {
      console.error(`Error updating setting ${key}:`, error)
      return false
    }
  }

  // Update multiple settings
  async updateSettings(updates: SettingsUpdateRequest): Promise<boolean> {
    try {
      const promises = Object.entries(updates).map(([key, value]) => 
        this.updateSetting(key as keyof AppSettings, value)
      )
      
      const results = await Promise.all(promises)
      return results.every(result => result === true)
    } catch (error) {
      console.error('Error updating settings:', error)
      return false
    }
  }

  // Reset settings to default
  async resetToDefaults(): Promise<boolean> {
    try {
      // Clear all existing settings
      await db.settings.clear()
      
      // You would typically reload default settings here
      // This is a placeholder for the default settings logic
      return true
    } catch (error) {
      console.error('Error resetting settings:', error)
      return false
    }
  }

  // Export settings
  async exportSettings(): Promise<string> {
    try {
      const settings = await this.getAllSettings()
      return JSON.stringify(settings, null, 2)
    } catch (error) {
      console.error('Error exporting settings:', error)
      throw error
    }
  }

  // Import settings
  async importSettings(settingsJson: string): Promise<boolean> {
    try {
      const settings = JSON.parse(settingsJson)
      return await this.updateSettings(settings)
    } catch (error) {
      console.error('Error importing settings:', error)
      return false
    }
  }
}

// Singleton instance
export const settingsService = new SettingsService()
