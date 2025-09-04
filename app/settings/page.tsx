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

export default function SettingsPage() {
  const { toast } = useToast()
  const { settings, updateSetting, updateSettings } = useSettings()
  const [localSettings, setLocalSettings] = React.useState(settings)
  const [activeTab, setActiveTab] = React.useState('store')

  React.useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    try {
      await updateSettings(localSettings)
      toast({
        title: "Settings Saved",
        description: "Your settings have been saved successfully.",
      })
    } catch (error) {
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
    switch (activeTab) {
      case 'store':
  return (
      <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                <Label htmlFor="storeName">Store Name</Label>
              <Input
                  id="storeName"
                  value={localSettings.storeName || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storeName: e.target.value})}
                placeholder="Enter store name"
              />
            </div>
            <div>
                <Label htmlFor="storePhone">Phone Number</Label>
                <Input
                  id="storePhone"
                  value={localSettings.storePhone || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storePhone: e.target.value})}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="storeAddress">Store Address</Label>
              <Input
                id="storeAddress"
                value={localSettings.storeAddress || ''}
                onChange={(e) => setLocalSettings({...localSettings, storeAddress: e.target.value})}
                placeholder="Enter complete store address"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="storeEmail">Email Address</Label>
              <Input
                  id="storeEmail"
                  type="email"
                  value={localSettings.storeEmail || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storeEmail: e.target.value})}
                  placeholder="store@example.com"
              />
            </div>
            <div>
                <Label htmlFor="storeWebsite">Website</Label>
              <Input
                  id="storeWebsite"
                  value={localSettings.storeWebsite || ''}
                  onChange={(e) => setLocalSettings({...localSettings, storeWebsite: e.target.value})}
                  placeholder="www.example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="storeGST">GST Number</Label>
              <Input
                id="storeGST"
                value={localSettings.storeGST || ''}
                onChange={(e) => setLocalSettings({...localSettings, storeGST: e.target.value})}
                placeholder="22ABCDE1234F1Z5"
              />
            </div>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                  id="taxRate"
                type="number"
                  value={localSettings.taxRate || 18}
                  onChange={(e) => setLocalSettings({...localSettings, taxRate: Number(e.target.value)})}
                placeholder="18"
              />
            </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <Select value={localSettings.currency || 'INR'} onValueChange={(value) => setLocalSettings({...localSettings, currency: value})}>
                  <SelectTrigger>
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
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                value={localSettings.upiId || ''}
                onChange={(e) => setLocalSettings({...localSettings, upiId: e.target.value})}
                placeholder="yourname@upi"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrderAmount">Minimum Order Amount</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  value={localSettings.minOrderAmount || 0}
                  onChange={(e) => setLocalSettings({...localSettings, minOrderAmount: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="deliveryCharge">Delivery Charge</Label>
                <Input
                  id="deliveryCharge"
                  type="number"
                  value={localSettings.deliveryCharge || 0}
                  onChange={(e) => setLocalSettings({...localSettings, deliveryCharge: Number(e.target.value)})}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )

      case 'system':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="theme">Theme</Label>
                <Select value={localSettings.theme || 'light'} onValueChange={(value) => setLocalSettings({...localSettings, theme: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={localSettings.language || 'en'} onValueChange={(value) => setLocalSettings({...localSettings, language: value})}>
                  <SelectTrigger>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={localSettings.timezone || 'Asia/Kolkata'} onValueChange={(value) => setLocalSettings({...localSettings, timezone: value})}>
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={localSettings.dateFormat || 'DD/MM/YYYY'} onValueChange={(value) => setLocalSettings({...localSettings, dateFormat: value})}>
                  <SelectTrigger>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="printerEnabled">Enable Printer</Label>
                  <p className="text-sm text-gray-600">Auto-print receipts after payment</p>
                </div>
                <input
                  id="printerEnabled"
                  type="checkbox"
                  checked={localSettings.printerEnabled || false}
                  onChange={(e) => setLocalSettings({...localSettings, printerEnabled: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="soundEnabled">Enable Sound</Label>
                  <p className="text-sm text-gray-600">Play sounds for notifications</p>
                </div>
                <input
                  id="soundEnabled"
                  type="checkbox"
                  checked={localSettings.soundEnabled || false}
                  onChange={(e) => setLocalSettings({...localSettings, soundEnabled: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup">Auto Backup</Label>
                  <p className="text-sm text-gray-600">Automatically backup data</p>
                </div>
                <input
                  id="autoBackup"
                  type="checkbox"
                  checked={localSettings.autoBackup || false}
                  onChange={(e) => setLocalSettings({...localSettings, autoBackup: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        )

      case 'display':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showImages">Show Product Images</Label>
                  <p className="text-sm text-gray-600">Display product images in POS</p>
                </div>
                <input
                  id="showImages"
                  type="checkbox"
                  checked={localSettings.showImages || false}
                  onChange={(e) => setLocalSettings({...localSettings, showImages: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showPrices">Show Prices</Label>
                  <p className="text-sm text-gray-600">Display prices on product cards</p>
                </div>
                <input
                  id="showPrices"
                  type="checkbox"
                  checked={localSettings.showPrices || false}
                  onChange={(e) => setLocalSettings({...localSettings, showPrices: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="showStock">Show Stock</Label>
                  <p className="text-sm text-gray-600">Display stock levels</p>
                </div>
                <input
                  id="showStock"
                  type="checkbox"
                  checked={localSettings.showStock || false}
                  onChange={(e) => setLocalSettings({...localSettings, showStock: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compactMode">Compact Mode</Label>
                  <p className="text-sm text-gray-600">Use compact layout for small screens</p>
                </div>
                <input
                  id="compactMode"
                  type="checkbox"
                  checked={localSettings.compactMode || false}
                  onChange={(e) => setLocalSettings({...localSettings, compactMode: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600">Send email alerts</p>
                </div>
                <input
                  id="emailNotifications"
                  type="checkbox"
                  checked={localSettings.emailNotifications || false}
                  onChange={(e) => setLocalSettings({...localSettings, emailNotifications: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600">Send SMS alerts</p>
                </div>
                <input
                  id="smsNotifications"
                  type="checkbox"
                  checked={localSettings.smsNotifications || false}
                  onChange={(e) => setLocalSettings({...localSettings, smsNotifications: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <p className="text-sm text-gray-600">Browser push notifications</p>
                </div>
                <input
                  id="pushNotifications"
                  type="checkbox"
                  checked={localSettings.pushNotifications || false}
                  onChange={(e) => setLocalSettings({...localSettings, pushNotifications: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
            <div className="flex items-center justify-between">
              <div>
                  <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                  <p className="text-sm text-gray-600">Alert when stock is low</p>
              </div>
                <input
                  id="lowStockAlert"
                  type="checkbox"
                  checked={localSettings.lowStockAlert || false}
                  onChange={(e) => setLocalSettings({...localSettings, lowStockAlert: e.target.checked})}
                  className="h-4 w-4"
                />
            </div>
            <div className="flex items-center justify-between">
              <div>
                  <Label htmlFor="dailyReport">Daily Report</Label>
                  <p className="text-sm text-gray-600">Send daily sales report</p>
                </div>
                <input
                  id="dailyReport"
                  type="checkbox"
                  checked={localSettings.dailyReport || false}
                  onChange={(e) => setLocalSettings({...localSettings, dailyReport: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
            </div>
          </div>
        )

      case 'backup':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={localSettings.backupFrequency || 'daily'} onValueChange={(value) => setLocalSettings({...localSettings, backupFrequency: value})}>
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="backupRetention">Backup Retention (days)</Label>
                <Input
                  id="backupRetention"
                  type="number"
                  value={localSettings.backupRetention || 30}
                  onChange={(e) => setLocalSettings({...localSettings, backupRetention: Number(e.target.value)})}
                  placeholder="30"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cloudBackup">Cloud Backup</Label>
                  <p className="text-sm text-gray-600">Backup to cloud storage</p>
              </div>
                <input
                  id="cloudBackup"
                  type="checkbox"
                  checked={localSettings.cloudBackup || false}
                  onChange={(e) => setLocalSettings({...localSettings, cloudBackup: e.target.checked})}
                  className="h-4 w-4"
                />
            </div>
            <div className="flex items-center justify-between">
              <div>
                  <Label htmlFor="localBackup">Local Backup</Label>
                  <p className="text-sm text-gray-600">Backup to local storage</p>
                </div>
                <input
                  id="localBackup"
                  type="checkbox"
                  checked={localSettings.localBackup || false}
                  onChange={(e) => setLocalSettings({...localSettings, localBackup: e.target.checked})}
                  className="h-4 w-4"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
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
                  className="flex-1"
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
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
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
                  className="flex-1"
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
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your POS system settings</p>
              </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
              <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
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
              <CardHeader>
                <CardTitle className="flex items-center">
                  {React.createElement(tabs.find(t => t.id === activeTab)?.icon || SettingsIcon, { className: "h-5 w-5 mr-2" })}
                  {tabs.find(t => t.id === activeTab)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTabContent()}
          </CardContent>
        </Card>

        {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} size="lg" className="px-8">
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
