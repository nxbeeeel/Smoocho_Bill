"use client"

import React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { ErrorBoundary } from '../error-boundary'
import { ImagePreloader } from '@/components/ui/image-preloader'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [currentUser] = React.useState({
    name: 'Admin User',
    role: 'admin'
  })

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar - Hidden on mobile/tablet */}
      <div className="hidden lg:block">
        <Sidebar isCollapsed={sidebarCollapsed} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          user={currentUser}
        />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
      
      {/* Image Preloader - runs in background */}
      <ImagePreloader />
    </div>
  )
}
