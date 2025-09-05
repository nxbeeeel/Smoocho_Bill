import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import { ReactErrorSuppressor } from '@/components/react-error-suppressor'
import { setupGlobalErrorHandlers } from '@/lib/error-handler'
import '@/lib/react-key-validator'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smoocho Bill - Premium POS System',
  description: 'Advanced Point of Sale system for modern businesses',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize error handlers
  if (typeof window !== 'undefined') {
    setupGlobalErrorHandlers()
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactErrorSuppressor>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ReactErrorSuppressor>
      </body>
    </html>
  )
}
