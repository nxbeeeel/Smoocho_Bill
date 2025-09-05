'use client'

import React from 'react'
import { 
  Save, 
  Store, 
  CreditCard, 
  Settings as SettingsIcon, 
  Shield, 
  Eye, 
  Bell, 
  Database,
  Smartphone,
  Monitor,
  Globe,
  Clock,
  DollarSign,
  Truck,
  Printer,
  Volume2,
  Wifi,
  Cloud,
  Download,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'
import { syncService } from '@/lib/sync-service'
import { ImageSync } from '@/components/ui/image-sync'

export default function SettingsPage() {
  const { toast } = useToast()
  const { settings, updateSetting, updateSettings } = useSettings()
  const [localSettings, setLocalSettings] = React.useState(settings || {})
  const [activeTab, setActiveTab] = React.useState('store')

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  // Add error boundary for tab switching
  const handleTabChange = (tabId: string) => {
    try {
      setActiveTab(tabId)
    } catch (error) {
      console.error('Error switching tab:', error)
      toast({
        title: "Error",
        description: "Failed to switch tab. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSave = async () => {
    try {
      if (!localSettings || typeof localSettings !== 'object') {
        throw new Error('Invalid settings data')
      }
      await updateSettings(localSettings)
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    }
  }

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'system', label: 'System', icon: SettingsIcon },
    { id: 'display', label: 'Display', icon: Eye },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup', icon: Database },
  ]

  const renderTabContent = () => {
    // Add safety check for localSettings
    if (!localSettings || typeof localSettings !== 'object') {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-gray-500 mb-2">Loading settings...</div>
            <div className="text-sm text-gray-400">Please wait while settings are being loaded.</div>
          </div>
        </div>
      )
    }

    try {
      switch (activeTab) {
      case 'store':
  return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-sm font-medium">Store Name</Label>
                <Input
                  id="storeName"
                  type="text"
                  value={localSettings.storeName || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storeName: e.target.value})}
                  placeholder="Enter store name"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storePhone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="storePhone"
                  type="tel"
                  value={localSettings.storePhone || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storePhone: e.target.value})}
                  placeholder="+91 9876543210"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeAddress" className="text-sm font-medium">Store Address</Label>
              <Input
                id="storeAddress"
                type="text"
                value={localSettings.storeAddress || ''}
                onChange={(e) => setLocalSettings({...localSettings, storeAddress: e.target.value})}
                placeholder="Enter complete store address"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeEmail" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="storeEmail"
                  type="email"
                  value={localSettings.storeEmail || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storeEmail: e.target.value})}
                  placeholder="store@example.com"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeWebsite" className="text-sm font-medium">Website</Label>
                <Input
                  id="storeWebsite"
                  type="url"
                  value={localSettings.storeWebsite || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storeWebsite: e.target.value})}
                  placeholder="www.example.com"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="storeGST" className="text-sm font-medium">GST Number</Label>
              <Input
                id="storeGST"
                type="text"
                value={localSettings.storeGST || ''}
                onChange={(e) => setLocalSettings({...localSettings, storeGST: e.target.value})}
                placeholder="22ABCDE1234F1Z5"
                className="w-full"
              />
          </div>
        </div>
        )

      case 'payment':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxRate" className="text-sm font-medium">Tax Rate (%)</Label>
              <Input
                  id="taxRate"
                  type="number"
                  value={localSettings.taxRate || 18}
                  onChange={(e) => setLocalSettings({...localSettings, taxRate: Number(e.target.value)})}
                  placeholder="18"
                  className="w-full"
              />
            </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                <Select value={localSettings.currency || 'INR'} onValueChange={(value) => setLocalSettings({...localSettings, currency: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upiId" className="text-sm font-medium">UPI ID</Label>
              <Input
                id="upiId"
                type="text"
                value={localSettings.upiId || ''}
                onChange={(e) => setLocalSettings({...localSettings, upiId: e.target.value})}
                placeholder="yourname@upi"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount" className="text-sm font-medium">Minimum Order Amount</Label>
              <Input
                  id="minOrderAmount"
                  type="number"
                  value={localSettings.minOrderAmount || 0}
                  onChange={(e) => setLocalSettings({...localSettings, minOrderAmount: Number(e.target.value)})}
                  placeholder="0"
                  className="w-full"
              />
            </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryCharge" className="text-sm font-medium">Delivery Charge</Label>
              <Input
                  id="deliveryCharge"
                type="number"
                  value={localSettings.deliveryCharge || 0}
                  onChange={(e) => setLocalSettings({...localSettings, deliveryCharge: Number(e.target.value)})}
                  placeholder="0"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )

      case 'system':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-sm font-medium">Theme</Label>
                <Select value={localSettings.theme || 'light'} onValueChange={(value) => setLocalSettings({...localSettings, theme: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                <Select value={localSettings.language || 'en'} onValueChange={(value) => setLocalSettings({...localSettings, language: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">Hindi</SelectItem>
                    <SelectItem value="ta">Tamil</SelectItem>
                    <SelectItem value="te">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
                <Select value={localSettings.timezone || 'Asia/Kolkata'} onValueChange={(value) => setLocalSettings({...localSettings, timezone: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata</SelectItem>
                    <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                    <SelectItem value="America/New_York">America/New_York</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat" className="text-sm font-medium">Date Format</Label>
                <Select value={localSettings.dateFormat || 'DD/MM/YYYY'} onValueChange={(value) => setLocalSettings({...localSettings, dateFormat: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="printerEnabled" className="text-sm font-medium block mb-1">Enable Printer</Label>
                  <p className="text-xs text-gray-600">Auto-print receipts after payment</p>
                </div>
                <input
                  id="printerEnabled"
                  type="checkbox"
                  checked={localSettings.printerEnabled || false}
                  onChange={(e) => setLocalSettings({...localSettings, printerEnabled: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="soundEnabled" className="text-sm font-medium block mb-1">Enable Sound</Label>
                  <p className="text-xs text-gray-600">Play sounds for notifications</p>
                </div>
                <input
                  id="soundEnabled"
                  type="checkbox"
                  checked={localSettings.soundEnabled || false}
                  onChange={(e) => setLocalSettings({...localSettings, soundEnabled: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="autoBackup" className="text-sm font-medium block mb-1">Auto Backup</Label>
                  <p className="text-xs text-gray-600">Automatically backup data</p>
                </div>
                <input
                  id="autoBackup"
                  type="checkbox"
                  checked={localSettings.autoBackup || false}
                  onChange={(e) => setLocalSettings({...localSettings, autoBackup: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 'display':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="showImages" className="text-sm font-medium block mb-1">Show Product Images</Label>
                  <p className="text-xs text-gray-600">Display product images in POS</p>
                </div>
                <input
                  id="showImages"
                  type="checkbox"
                  checked={localSettings.showImages || false}
                  onChange={(e) => setLocalSettings({...localSettings, showImages: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="showPrices" className="text-sm font-medium block mb-1">Show Prices</Label>
                  <p className="text-xs text-gray-600">Display prices on product cards</p>
                </div>
                <input
                  id="showPrices"
                  type="checkbox"
                  checked={localSettings.showPrices || false}
                  onChange={(e) => setLocalSettings({...localSettings, showPrices: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="showStock" className="text-sm font-medium block mb-1">Show Stock</Label>
                  <p className="text-xs text-gray-600">Display stock levels</p>
                </div>
                <input
                  id="showStock"
                  type="checkbox"
                  checked={localSettings.showStock || false}
                  onChange={(e) => setLocalSettings({...localSettings, showStock: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="compactMode" className="text-sm font-medium block mb-1">Compact Mode</Label>
                  <p className="text-xs text-gray-600">Use compact layout for small screens</p>
                </div>
                <input
                  id="compactMode"
                  type="checkbox"
                  checked={localSettings.compactMode || false}
                  onChange={(e) => setLocalSettings({...localSettings, compactMode: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="emailNotifications" className="text-sm font-medium block mb-1">Email Notifications</Label>
                  <p className="text-xs text-gray-600">Send email alerts</p>
                </div>
                <input
                  id="emailNotifications"
                  type="checkbox"
                  checked={localSettings.emailNotifications || false}
                  onChange={(e) => setLocalSettings({...localSettings, emailNotifications: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="smsNotifications" className="text-sm font-medium block mb-1">SMS Notifications</Label>
                  <p className="text-xs text-gray-600">Send SMS alerts</p>
                </div>
                <input
                  id="smsNotifications"
                  type="checkbox"
                  checked={localSettings.smsNotifications || false}
                  onChange={(e) => setLocalSettings({...localSettings, smsNotifications: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="pushNotifications" className="text-sm font-medium block mb-1">Push Notifications</Label>
                  <p className="text-xs text-gray-600">Browser push notifications</p>
                </div>
                <input
                  id="pushNotifications"
                  type="checkbox"
                  checked={localSettings.pushNotifications || false}
                  onChange={(e) => setLocalSettings({...localSettings, pushNotifications: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="lowStockAlert" className="text-sm font-medium block mb-1">Low Stock Alert</Label>
                  <p className="text-xs text-gray-600">Alert when stock is low</p>
                </div>
                <input
                  id="lowStockAlert"
                  type="checkbox"
                  checked={localSettings.lowStockAlert || false}
                  onChange={(e) => setLocalSettings({...localSettings, lowStockAlert: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="dailyReport" className="text-sm font-medium block mb-1">Daily Report</Label>
                  <p className="text-xs text-gray-600">Send daily sales report</p>
                </div>
                <input
                  id="dailyReport"
                  type="checkbox"
                  checked={localSettings.dailyReport || false}
                  onChange={(e) => setLocalSettings({...localSettings, dailyReport: e.target.checked})}
                  className="h-4 w-4 mt-1"
              />
            </div>
            </div>
          </div>
        )

      case 'backup':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency" className="text-sm font-medium">Backup Frequency</Label>
                <Select value={localSettings.backupFrequency || 'daily'} onValueChange={(value) => setLocalSettings({...localSettings, backupFrequency: value})}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupRetention" className="text-sm font-medium">Backup Retention (days)</Label>
                <Input
                  id="backupRetention"
                  type="number"
                  value={localSettings.backupRetention || 30}
                  onChange={(e) => setLocalSettings({...localSettings, backupRetention: Number(e.target.value)})}
                  placeholder="30"
                  className="w-full"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="cloudBackup" className="text-sm font-medium block mb-1">Cloud Backup</Label>
                  <p className="text-xs text-gray-600">Backup to cloud storage</p>
                </div>
                <input
                  id="cloudBackup"
                  type="checkbox"
                  checked={localSettings.cloudBackup || false}
                  onChange={(e) => setLocalSettings({...localSettings, cloudBackup: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
              <div className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 pr-3">
                  <Label htmlFor="localBackup" className="text-sm font-medium block mb-1">Local Backup</Label>
                  <p className="text-xs text-gray-600">Backup to local storage</p>
                </div>
                <input
                  id="localBackup"
                  type="checkbox"
                  checked={localSettings.localBackup || false}
                  onChange={(e) => setLocalSettings({...localSettings, localBackup: e.target.checked})}
                  className="h-4 w-4 mt-1"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      await syncService.exportToFile()
                      toast({
                        title: "Export Successful",
                        description: "Data exported to file successfully.",
                      })
                    } catch (error) {
                      toast({
                        title: "Export Failed",
                        description: "Failed to export data. Please try again.",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const input = document.createElement('input')
                    input.type = 'file'
                    input.accept = '.json'
                    input.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0]
                      if (file) {
                        try {
                          await syncService.importFromFile(file)
                          toast({
                            title: "Import Successful",
                            description: "Data imported successfully. Please refresh the page.",
                          })
                          // Refresh the page to show updated data
                          setTimeout(() => window.location.reload(), 1000)
                        } catch (error) {
                          toast({
                            title: "Import Failed",
                            description: "Failed to import data. Please check the file format.",
                            variant: "destructive"
                          })
                        }
                      }
                    }
                    input.click()
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={async () => {
                    try {
                      const result = await syncService.syncWithCloud()
                      if (result.success) {
                        toast({
                          title: "Sync Successful",
                          description: "Data synchronized successfully.",
                        })
                      } else {
                        toast({
                          title: "Sync Failed",
                          description: result.error || "Failed to sync data.",
                          variant: "destructive"
                        })
                      }
                    } catch (error) {
                      toast({
                        title: "Sync Failed",
                        description: "Failed to sync data. Please try again.",
                        variant: "destructive"
                      })
                    }
                  }}
                >
                  <Cloud className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    const status = syncService.getSyncStatus()
                    toast({
                      title: "Sync Status",
                      description: `Device ID: ${status.deviceId}\nLast Sync: ${status.lastSync || 'Never'}`,
                    })
                  }}
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Sync Status
                </Button>
              </div>
            </div>

            {/* Image Sync Component */}
            <div className="mt-6">
              <ImageSync />
            </div>
          </div>
        )

      default:
        return null
      }
    } catch (error) {
      console.error('Error rendering tab content:', error)
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-red-500 mb-2">Error loading content</div>
            <div className="text-sm text-gray-400">There was an error loading this tab. Please try refreshing the page.</div>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 lg:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-gray-600">Configure your POS system settings</p>
              </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
              <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center p-3 sm:p-4 text-center transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-2" />
                    <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
              </button>
                )
              })}
            </div>
            </div>
              </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-0">
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
              <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.label}
              </button>
                    )
                  })}
            </div>
          </CardContent>
        </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  {React.createElement(tabs.find(t => t.id === activeTab)?.icon || SettingsIcon, { className: "h-5 w-5 mr-2" })}
                  {tabs.find(t => t.id === activeTab)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {renderTabContent()}
          </CardContent>
        </Card>

        {/* Save Button */}
            <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
              <Button onClick={handleSave} size="lg" className="w-full sm:w-auto px-6 sm:px-8">
          <Save className="h-4 w-4 mr-2" />
                Save All Settings
        </Button>
      </div>
          </div>
        </div>
      </div>
    </div>
  )
}
