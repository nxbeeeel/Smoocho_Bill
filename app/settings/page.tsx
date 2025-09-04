'use client'

import React from 'react'
import { Save, Bell, Printer, Wifi, Shield, User, Store, QrCode, Link as LinkIcon, CheckCircle, XCircle, Plus, Settings as SettingsIcon, Database, Palette, CreditCard, Download, Upload, Eye, EyeOff, Lock, Unlock, Volume2, VolumeX, Monitor, Smartphone, Globe, Clock, FileText, AlertTriangle } from 'lucide-react'
import { ResponsiveLayout } from '@/components/layout/responsive-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'
import { db } from '@/lib/database'

export default function SettingsPage() {
  const { toast } = useToast()
  const { settings, updateSetting, updateSettings, forceSaveSettings } = useSettings()
  const [activeTab, setActiveTab] = React.useState('store')
  const [showPassword, setShowPassword] = React.useState(false)
  const [localSettings, setLocalSettings] = React.useState(settings)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Sync local settings with hook settings only once when settings are first loaded
  React.useEffect(() => {
    if (Object.keys(settings).length > 0 && !isInitialized) {
      console.log('Settings initialized:', settings)
      setLocalSettings(settings)
      setIsInitialized(true)
    }
  }, [settings, isInitialized])

  // Helper function to update local settings safely
  const updateLocalSetting = React.useCallback((key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  const integrations = [
    { id: 1, name: 'Paytm', status: 'connected', type: 'Payment Gateway', description: 'Process payments through Paytm' },
    { id: 2, name: 'Zomato', status: 'connected', type: 'Food Delivery', description: 'Sync orders with Zomato' },
    { id: 3, name: 'Swiggy', status: 'disconnected', type: 'Food Delivery', description: 'Sync orders with Swiggy' },
    { id: 4, name: 'UPI Gateway', status: 'connected', type: 'Payment', description: 'UPI payment processing' },
    { id: 5, name: 'Google Analytics', status: 'disconnected', type: 'Analytics', description: 'Track business analytics' },
    { id: 6, name: 'WhatsApp Business', status: 'disconnected', type: 'Communication', description: 'Send order notifications' },
  ]

  const tabs = [
    { id: 'store', name: 'Store Info', icon: Store },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'integrations', name: 'Integrations', icon: LinkIcon },
    { id: 'system', name: 'System', icon: SettingsIcon },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Display', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'backup', name: 'Backup', icon: Database },
  ]

  const handleSaveSettings = async () => {
    try {
      console.log('Force saving settings:', localSettings)
      
      // Use the force save function that clears and re-adds all settings
      await forceSaveSettings(localSettings)
      
      console.log('Settings force saved successfully')
      
      toast({
        title: "Settings Saved Successfully",
        description: "All settings have been permanently saved with backup.",
      })
    } catch (error) {
      console.error('Error force saving settings:', error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export has been initiated.",
    })
  }

  const handleImportData = () => {
    toast({
      title: "Import Data",
      description: "Please select a backup file to import.",
    })
  }

  const handleTestPrinter = () => {
    toast({
      title: "Printer Test",
      description: "Test print sent to printer successfully.",
    })
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'store':
  return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Store className="h-4 w-4 mr-2" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="space-y-4">
            <div>
                    <label className="text-sm font-medium mb-1 block">Store Name *</label>
              <Input
                      value={localSettings.storeName || ''}
                      onChange={(e) => updateLocalSetting('storeName', e.target.value)}
                placeholder="Enter store name"
                className="w-full"
              />
            </div>
            <div>
                    <label className="text-sm font-medium mb-1 block">Phone Number *</label>
                    <Input
                      value={localSettings.storePhone || ''}
                      onChange={(e) => updateLocalSetting('storePhone', e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Store Address *</label>
                  <Input
                    value={localSettings.storeAddress || ''}
                    onChange={(e) => updateLocalSetting('storeAddress', e.target.value)}
                    placeholder="Enter complete store address"
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email Address</label>
                    <Input
                      type="email"
                      value={localSettings.storeEmail}
                      onChange={(e) => setLocalSettings({...localSettings, storeEmail: e.target.value})}
                      placeholder="info@yourstore.com"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Website</label>
                    <Input
                      value={localSettings.storeWebsite}
                      onChange={(e) => setLocalSettings({...localSettings, storeWebsite: e.target.value})}
                      placeholder="www.yourstore.com"
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">GST Number</label>
                  <Input
                    value={localSettings.storeGST}
                    onChange={(e) => setLocalSettings({...localSettings, storeGST: e.target.value})}
                    placeholder="22ABCDE1234F1Z5"
                  />
                  <p className="text-xs text-gray-500 mt-1">Required for tax calculations and invoices</p>
            </div>
          </CardContent>
        </Card>
          </div>
        )

      case 'payment':
        return (
          <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
                  <CreditCard className="h-4 w-4 mr-2" />
              Payment Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Tax Rate (%)</label>
                    <Input
                      type="number"
                      value={localSettings.taxRate}
                      onChange={(e) => setLocalSettings({...localSettings, taxRate: Number(e.target.value)})}
                      placeholder="18"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Currency</label>
                    <Input
                      value={localSettings.currency}
                      onChange={(e) => setLocalSettings({...localSettings, currency: e.target.value})}
                      placeholder="INR"
                      className="w-full"
                    />
                  </div>
                </div>
            <div>
              <label className="text-sm font-medium mb-1 block">UPI ID for QR Payments</label>
              <Input
                    value={localSettings.upiId}
                    onChange={(e) => setLocalSettings({...localSettings, upiId: e.target.value})}
                placeholder="yourstore@paytm"
              />
              <p className="text-xs text-gray-500 mt-1">This UPI ID will be used to generate QR codes for payments</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Minimum Order Amount (₹)</label>
                    <Input
                      type="number"
                      value={localSettings.minOrderAmount}
                      onChange={(e) => setLocalSettings({...localSettings, minOrderAmount: Number(e.target.value)})}
                      placeholder="0"
                      className="w-full"
                    />
            </div>
            <div>
                    <label className="text-sm font-medium mb-1 block">Delivery Charge (₹)</label>
              <Input
                type="number"
                      value={localSettings.deliveryCharge}
                      onChange={(e) => setLocalSettings({...localSettings, deliveryCharge: Number(e.target.value)})}
                      placeholder="0"
                      className="w-full"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Enabled Payment Methods</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['cash', 'card', 'upi', 'wallet'].map((method) => (
                      <label key={method} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.paymentMethods.includes(method)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocalSettings({
                                ...localSettings,
                                paymentMethods: [...localSettings.paymentMethods, method]
                              })
                            } else {
                              setLocalSettings({
                                ...localSettings,
                                paymentMethods: localSettings.paymentMethods.filter(m => m !== method)
                              })
                            }
                          }}
                          className="rounded border-gray-300 h-4 w-4"
                        />
                        <span className="text-sm font-medium capitalize">{method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Integrations</h3>
                <p className="text-sm text-gray-600">Connect with external services</p>
              </div>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.type}</p>
                          <p className="text-xs text-gray-500">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === 'connected' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          integration.status === 'connected' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {integration.status.toUpperCase()}
                        </span>
                        <Button size="sm" variant="outline">
                          <SettingsIcon className="w-4 h-4" />
                        </Button>
                      </div>
            </div>
          </CardContent>
        </Card>
              ))}
            </div>
          </div>
        )

      case 'system':
        return (
          <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
                  <SettingsIcon className="h-4 w-4 mr-2" />
              System Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Sound Effects</p>
                <p className="text-xs text-gray-500">Play sounds for actions</p>
              </div>
              <button
                    onClick={() => setLocalSettings({...localSettings, soundEnabled: !localSettings.soundEnabled})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Notifications</p>
                <p className="text-xs text-gray-500">Show system notifications</p>
              </div>
              <button
                    onClick={() => setLocalSettings({...localSettings, notifications: !localSettings.notifications})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.notifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Printer Integration</p>
                <p className="text-xs text-gray-500">Enable thermal printer</p>
              </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLocalSettings({...localSettings, printerEnabled: !localSettings.printerEnabled})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.printerEnabled ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.printerEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    {localSettings.printerEnabled && (
                      <Button size="sm" variant="outline" onClick={handleTestPrinter}>
                        Test
                      </Button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Language</label>
                    <Input
                      value={localSettings.language}
                      onChange={(e) => setLocalSettings({...localSettings, language: e.target.value})}
                      placeholder="en"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Timezone</label>
                    <Input
                      value={localSettings.timezone}
                      onChange={(e) => setLocalSettings({...localSettings, timezone: e.target.value})}
                      placeholder="Asia/Kolkata"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date Format</label>
                    <Input
                      value={localSettings.dateFormat}
                      onChange={(e) => setLocalSettings({...localSettings, dateFormat: e.target.value})}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Time Format</label>
                    <div className="flex gap-2">
                      <Button
                        variant={localSettings.timeFormat === '12h' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLocalSettings({...localSettings, timeFormat: '12h'})}
                      >
                        12 Hour
                      </Button>
                      <Button
                        variant={localSettings.timeFormat === '24h' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setLocalSettings({...localSettings, timeFormat: '24h'})}
                      >
                        24 Hour
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Require Password</p>
                    <p className="text-xs text-gray-500">Require password for app access</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({...localSettings, requirePassword: !localSettings.requirePassword})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.requirePassword ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.requirePassword ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500">Add extra security layer</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({...localSettings, twoFactorAuth: !localSettings.twoFactorAuth})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Session Timeout (minutes)</label>
                  <Input
                    type="number"
                    value={localSettings.sessionTimeout}
                    onChange={(e) => setLocalSettings({...localSettings, sessionTimeout: Number(e.target.value)})}
                    placeholder="30"
                    min="5"
                    max="480"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Palette className="h-4 w-4 mr-2" />
                  Display Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Theme</label>
                  <div className="flex gap-2">
                    <Button
                      variant={localSettings.theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLocalSettings({...localSettings, theme: 'light'})}
                    >
                      Light
                    </Button>
                    <Button
                      variant={localSettings.theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setLocalSettings({...localSettings, theme: 'dark'})}
                    >
                      Dark
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Show Product Images</p>
                      <p className="text-xs text-gray-500">Display product images in POS</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, showImages: !localSettings.showImages})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.showImages ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.showImages ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Show Prices</p>
                      <p className="text-xs text-gray-500">Display prices on products</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, showPrices: !localSettings.showPrices})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.showPrices ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.showPrices ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Show Stock Levels</p>
                      <p className="text-xs text-gray-500">Display stock quantities</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, showStock: !localSettings.showStock})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.showStock ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.showStock ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Compact Mode</p>
                      <p className="text-xs text-gray-500">Use smaller UI elements</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, compactMode: !localSettings.compactMode})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.compactMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.compactMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Email Notifications</p>
                      <p className="text-xs text-gray-500">Send notifications via email</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, emailNotifications: !localSettings.emailNotifications})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">SMS Notifications</p>
                      <p className="text-xs text-gray-500">Send notifications via SMS</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, smsNotifications: !localSettings.smsNotifications})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Push Notifications</p>
                      <p className="text-xs text-gray-500">Browser push notifications</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, pushNotifications: !localSettings.pushNotifications})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Low Stock Alerts</p>
                      <p className="text-xs text-gray-500">Alert when stock is low</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, lowStockAlert: !localSettings.lowStockAlert})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.lowStockAlert ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.lowStockAlert ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Daily Reports</p>
                    <p className="text-xs text-gray-500">Send daily sales reports</p>
              </div>
              <button
                    onClick={() => setLocalSettings({...localSettings, dailyReport: !localSettings.dailyReport})}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.dailyReport ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.dailyReport ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>
          </div>
        )

      case 'backup':
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Database className="h-4 w-4 mr-2" />
                  Backup & Restore
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">Auto Backup</p>
                    <p className="text-xs text-gray-500">Automatically backup data daily</p>
                  </div>
                  <button
                    onClick={() => setLocalSettings({...localSettings, autoBackup: !localSettings.autoBackup})}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      localSettings.autoBackup ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        localSettings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Backup Frequency</label>
                    <div className="flex gap-2">
                      {['daily', 'weekly', 'monthly'].map((freq) => (
                        <Button
                          key={freq}
                          variant={localSettings.backupFrequency === freq ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setLocalSettings({...localSettings, backupFrequency: freq})}
                        >
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Backup Retention (days)</label>
                    <Input
                      type="number"
                      value={localSettings.backupRetention}
                      onChange={(e) => setLocalSettings({...localSettings, backupRetention: Number(e.target.value)})}
                      placeholder="30"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Local Backup</p>
                      <p className="text-xs text-gray-500">Save backups locally</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, localBackup: !localSettings.localBackup})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.localBackup ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.localBackup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">Cloud Backup</p>
                      <p className="text-xs text-gray-500">Save backups to cloud</p>
                    </div>
                    <button
                      onClick={() => setLocalSettings({...localSettings, cloudBackup: !localSettings.cloudBackup})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.cloudBackup ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.cloudBackup ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" onClick={handleImportData}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                  <Button variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <ResponsiveLayout>
      <div className="space-y-4 p-4">
        {/* Premium Mobile Header */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Configure your system</p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${Object.keys(settings).length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-gray-500">
                {Object.keys(settings).length > 0 ? 'Settings loaded' : 'Loading settings...'}
              </span>
              {localSettings.storeName !== settings.storeName && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-yellow-600">Unsaved changes</span>
                </div>
              )}
            </div>
          </div>

          {/* Premium Mobile Tab Navigation */}
          <div className="grid grid-cols-2 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <tab.icon className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium text-sm">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Premium Mobile Content - Single Column */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>

                        {/* Action Buttons */}
            <div className="space-y-4">
              {/* Main Save Button - Prominent */}
              <div className="flex justify-center">
                <Button 
                  onClick={handleSaveSettings}
                  className="bg-green-600 hover:bg-green-700 px-12 py-4 text-lg font-semibold"
                  size="lg"
                >
                  <Save className="h-5 w-5 mr-3" />
                  Save Settings
                </Button>
              </div>
              
              {/* Debug Buttons - Collapsible */}
              <details className="bg-gray-50 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-gray-700 mb-3">
                  Debug Tools (Click to expand)
                </summary>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log('Current settings:', settings)
                      console.log('Local settings:', localSettings)
                      toast({
                        title: "Debug Info",
                        description: "Check console for settings data",
                      })
                    }}
                  >
                    Debug
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const settingsCount = await db.settings.count()
                      toast({
                        title: "Database Test",
                        description: `Found ${settingsCount} settings`,
                      })
                    }}
                  >
                    Test DB
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLocalSettings(settings)
                      toast({
                        title: "Settings Reset",
                        description: "Local settings reset to saved values",
                      })
                    }}
                  >
                    Reset
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await db.initializeData()
                      window.location.reload()
                    }}
                  >
                    Reload
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await db.settings.clear()
                      await db.initializeData()
                      window.location.reload()
                    }}
                  >
                    Reset DB
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        const settingsCount = await db.settings.count()
                        console.log('Current settings count:', settingsCount)
                        
                        if (settingsCount === 0) {
                          console.log('No settings found, initializing...')
                          await db.initializeData()
                          toast({
                            title: "Settings Initialized",
                            description: "Default settings have been created",
                          })
                          window.location.reload()
                        } else {
                          toast({
                            title: "Settings Already Exist",
                            description: `${settingsCount} settings found`,
                          })
                        }
                      } catch (error) {
                        console.error('Initialize error:', error)
                        toast({
                          title: "Initialize Error",
                          description: "Failed to initialize settings",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    Initialize
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Manual initialization only
                        await db.manualInitialize()
                        toast({
                          title: "Manual Initialization",
                          description: "Database manually initialized with default data",
                        })
                        window.location.reload()
                      } catch (error) {
                        console.error('Manual init error:', error)
                        toast({
                          title: "Manual Init Error",
                          description: "Failed to manually initialize database",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    Manual Init
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Test saving a specific value
                        const testValue = `Test Store ${Date.now()}`
                        await db.settings.put({
                          key: 'storeName',
                          value: testValue,
                          updatedAt: new Date()
                        })
                        
                        // Verify it was saved
                        const saved = await db.settings.where('key').equals('storeName').first()
                        console.log('Test save result:', saved)
                        
                        toast({
                          title: "Test Save Complete",
                          description: `Saved "${testValue}". Check console for details.`,
                        })
                      } catch (error) {
                        console.error('Test save error:', error)
                        toast({
                          title: "Test Save Failed",
                          description: "Check console for error details",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    Test Save
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Test persistence by saving and immediately checking
                        const testValue = `Persistence Test ${Date.now()}`
                        
                        // Save the value
                        await db.settings.put({
                          key: 'storeName',
                          value: testValue,
                          updatedAt: new Date()
                        })
                        
                        // Wait a moment
                        await new Promise(resolve => setTimeout(resolve, 100))
                        
                        // Check if it's still there
                        const saved = await db.settings.where('key').equals('storeName').first()
                        console.log('Persistence test - saved value:', saved?.value)
                        console.log('Persistence test - expected value:', testValue)
                        console.log('Persistence test - match:', saved?.value === testValue)
                        
                        if (saved?.value === testValue) {
                          toast({
                            title: "Persistence Test PASSED",
                            description: "Settings are persisting correctly!",
                          })
                        } else {
                          toast({
                            title: "Persistence Test FAILED",
                            description: "Settings are not persisting. Check console.",
                            variant: "destructive"
                          })
                        }
                      } catch (error) {
                        console.error('Persistence test error:', error)
                        toast({
                          title: "Persistence Test ERROR",
                          description: "Check console for error details",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    Test Persistence
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Test permanent save approach
                        const testValue = `Permanent Test ${Date.now()}`
                        
                        console.log('Testing permanent save approach...')
                        
                        // Step 1: Clear existing settings
                        await db.settings.clear()
                        console.log('Cleared existing settings')
                        
                        // Step 2: Save new setting
                        await db.settings.add({
                          key: 'storeName',
                          value: testValue,
                          updatedAt: new Date()
                        })
                        console.log('Saved new setting:', testValue)
                        
                        // Step 3: Wait for sync
                        await new Promise(resolve => setTimeout(resolve, 200))
                        
                        // Step 4: Verify
                        const saved = await db.settings.where('key').equals('storeName').first()
                        console.log('Permanent save test - saved value:', saved?.value)
                        console.log('Permanent save test - expected value:', testValue)
                        console.log('Permanent save test - match:', saved?.value === testValue)
                        
                        if (saved?.value === testValue) {
                          toast({
                            title: "Permanent Save Test PASSED",
                            description: "Permanent save approach works!",
                          })
                        } else {
                          toast({
                            title: "Permanent Save Test FAILED",
                            description: "Permanent save approach failed. Check console.",
                            variant: "destructive"
                          })
                        }
                      } catch (error) {
                        console.error('Permanent save test error:', error)
                        toast({
                          title: "Permanent Save Test ERROR",
                          description: "Check console for error details",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    Test Permanent Save
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Clear everything and start fresh
                        await db.settings.clear()
                        localStorage.removeItem('smoocho_settings_backup')
                        console.log('All settings and backups cleared')
                        toast({
                          title: "All Settings Cleared",
                          description: "Database and localStorage cleared. Page will reload.",
                        })
                        window.location.reload()
                      } catch (error) {
                        console.error('Clear all error:', error)
                        toast({
                          title: "Clear All Error",
                          description: "Failed to clear all settings",
                          variant: "destructive"
                        })
                      }
                    }}
                  >
                    Clear All
                  </Button>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveLayout>
  )
}
