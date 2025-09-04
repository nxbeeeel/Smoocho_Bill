'use client'

import React from 'react'
import { QrCode, X, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QRGeneratorProps {
  amount: number
  upiId: string
  onClose: () => void
}

export function QRGenerator({ amount, upiId, onClose }: QRGeneratorProps) {
  const [copied, setCopied] = React.useState(false)
  
  // Generate UPI payment URL
  const upiUrl = `upi://pay?pa=${upiId}&pn=Smoocho Bill&am=${amount}&cu=INR&tn=Payment for Order`
  
  // Simple QR code generation using Google Charts API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`
  
  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy UPI ID:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">UPI Payment</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Amount to Pay</p>
            <p className="text-2xl font-bold text-green-600">₹{amount}</p>
          </div>
          
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
              <img 
                src={qrCodeUrl} 
                alt="UPI QR Code" 
                className="w-48 h-48"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIExvYWRpbmcgUVI8L3RleHQ+PC9zdmc+'
                }}
              />
            </div>
          </div>
          
          {/* UPI ID */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center">Or pay directly to UPI ID:</p>
            <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-lg">
              <code className="flex-1 text-sm font-mono">{upiId}</code>
              <Button variant="ghost" size="sm" onClick={copyUpiId}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>1. Scan QR code with any UPI app</p>
            <p>2. Or copy UPI ID and pay manually</p>
            <p>3. Confirm payment to complete order</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Payment Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
