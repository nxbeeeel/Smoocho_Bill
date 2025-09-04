'use client'

import React from 'react'
import { Save, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useSettings } from '@/hooks/use-settings'

export default function SettingsPage() {
  const { toast } = useToast()
  const { settings, updateSetting } = useSettings()
  const [localSettings, setLocalSettings] = React.useState(settings)

  React.useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(localSettings)) {
        await updateSetting(key, value)
      }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 p-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-4">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600">Configure your system</p>
        </div>

        {/* Store Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Store className="h-4 w-4 mr-2" />
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Store Name</label>
              <Input
                value={localSettings.storeName || ''}
                onChange={(e) => setLocalSettings({...localSettings, storeName: e.target.value})}
                placeholder="Enter store name"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone Number</label>
              <Input
                value={localSettings.storePhone || ''}
                onChange={(e) => setLocalSettings({...localSettings, storePhone: e.target.value})}
                placeholder="+91 9876543210"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Store Address</label>
              <Input
                value={localSettings.storeAddress || ''}
                onChange={(e) => setLocalSettings({...localSettings, storeAddress: e.target.value})}
                placeholder="Enter complete store address"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email Address</label>
              <Input
                type="email"
                value={localSettings.storeEmail || ''}
                onChange={(e) => setLocalSettings({...localSettings, storeEmail: e.target.value})}
                placeholder="store@example.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">UPI ID</label>
              <Input
                value={localSettings.upiId || ''}
                onChange={(e) => setLocalSettings({...localSettings, upiId: e.target.value})}
                placeholder="yourname@upi"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tax Rate (%)</label>
              <Input
                type="number"
                value={localSettings.taxRate || 18}
                onChange={(e) => setLocalSettings({...localSettings, taxRate: Number(e.target.value)})}
                placeholder="18"
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center p-4">
          <Button onClick={handleSave} className="w-full max-w-md">
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
