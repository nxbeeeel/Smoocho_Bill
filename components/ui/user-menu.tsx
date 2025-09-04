'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Shield,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline" size="sm">
          <User className="h-4 w-4 mr-2" />
          Login
        </Button>
      </Link>
    )
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="hidden sm:inline">{user.username}</span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border z-20">
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <Shield className="h-3 w-3 text-blue-600" />
                    <span className="text-xs text-blue-600 capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-2">
              <Link 
                href="/account"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <User className="h-4 w-4" />
                Account Settings
              </Link>
              
              <Link 
                href="/settings"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-4 w-4" />
                POS Settings
              </Link>
              
              <div className="border-t my-2"></div>
              
              <div className="px-3 py-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Smartphone className="h-3 w-3" />
                  <span className="font-mono">{user.deviceId}</span>
                </div>
              </div>
              
              <div className="border-t my-2"></div>
              
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
