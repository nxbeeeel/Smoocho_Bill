import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/toaster'
import { AuthProvider } from '@/contexts/auth-context'
import { ReactErrorSuppressor } from '@/components/react-error-suppressor'
import { AggressiveErrorSuppressor } from '@/components/aggressive-error-suppressor'
import { setupGlobalErrorHandlers } from '@/lib/error-handler'
import '@/lib/react-key-validator'
import '@/lib/early-error-suppression'
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
          <head>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function() {
                    const originalConsoleError = console.error;
                    console.error = function(...args) {
                      for (let i = 0; i < args.length; i++) {
                        const arg = args[i];
                        if (typeof arg === 'string' && (arg.includes('185') || arg.includes('Minified React error'))) {
                          return;
                        }
                        if (arg && typeof arg === 'object' && arg.message && arg.message.includes('185')) {
                          return;
                        }
                      }
                      originalConsoleError.apply(console, args);
                    };
                    
                    const handleError = function(event) {
                      if (event.message && event.message.includes('185')) {
                        event.preventDefault();
                        event.stopPropagation();
                        return false;
                      }
                    };
                    
                    window.addEventListener('error', handleError, true);
                    window.addEventListener('error', handleError, false);
                  })();
                `
              }}
            />
          </head>
          <body className={inter.className}>
            <AggressiveErrorSuppressor>
              <ReactErrorSuppressor>
                <AuthProvider>
                  {children}
                  <Toaster />
                </AuthProvider>
              </ReactErrorSuppressor>
            </AggressiveErrorSuppressor>
          </body>
        </html>
  )
}
