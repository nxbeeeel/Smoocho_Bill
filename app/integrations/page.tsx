'use client'

import React from 'react'
import { Link as LinkIcon, Settings, CheckCircle, XCircle, Plus } from 'lucide-react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function IntegrationsPage() {
  const integrations = [
    { id: 1, name: 'Paytm', status: 'connected', type: 'Payment Gateway' },
    { id: 2, name: 'Zomato', status: 'connected', type: 'Food Delivery' },
    { id: 3, name: 'Swiggy', status: 'disconnected', type: 'Food Delivery' },
    { id: 4, name: 'UPI Gateway', status: 'connected', type: 'Payment' },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">Connect with external services and platforms</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <LinkIcon className="w-8 h-8 text-blue-600" />
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <p className="text-gray-600 text-sm">{integration.type}</p>
                    </div>
                  </div>
                  {integration.status === 'connected' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    integration.status === 'connected' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {integration.status.toUpperCase()}
                  </span>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
