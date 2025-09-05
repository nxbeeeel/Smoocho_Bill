'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { cloudSyncService } from '@/lib/cloud-sync-service'

interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'user'
  createdAt: Date
  lastLogin: Date
  deviceId: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default admin credentials (should be changed in production)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'smoocho2024',
  email: 'admin@smoocho.com'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate unique device ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('deviceId')
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      localStorage.setItem('deviceId', deviceId)
    }
    return deviceId
  }

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user')
        const deviceId = getDeviceId()
        
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          // Update device ID if it changed
          if (userData.deviceId !== deviceId) {
            userData.deviceId = deviceId
            localStorage.setItem('user', JSON.stringify(userData))
          }
          setUser(userData)
          
          // Initialize cloud sync service for existing user
          cloudSyncService.initialize(userData.id, deviceId)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Check against default admin credentials
      if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
        const deviceId = getDeviceId()
        const userData: User = {
          id: 'admin_001',
          username: DEFAULT_ADMIN.username,
          email: DEFAULT_ADMIN.email,
          role: 'admin',
          createdAt: new Date(),
          lastLogin: new Date(),
          deviceId
        }
        
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        
        // Initialize cloud sync service
        cloudSyncService.initialize(userData.id, deviceId)
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${userData.username}!`,
        })
        
        return true
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive"
        })
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive"
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Stop cloud sync service
    cloudSyncService.destroy()
    
    localStorage.removeItem('user')
    setUser(null)
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
