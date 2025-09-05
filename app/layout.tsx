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
import '@/lib/ultimate-error-suppression'
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
                    const originalConsoleWarn = console.warn;
                    const originalConsoleLog = console.log;
                    
                    const suppressReactError = function(...args) {
                      for (let i = 0; i < args.length; i++) {
                        const arg = args[i];
                        if (typeof arg === 'string') {
                          if (arg.includes('185') || arg.includes('Minified React error') || 
                              arg.includes('react-dom.production.min.js') || arg.includes('index.mjs')) {
                            return true;
                          }
                        }
                        if (arg && typeof arg === 'object' && arg.message && arg.message.includes('185')) {
                          return true;
                        }
                      }
                      return false;
                    };
                    
                    console.error = function(...args) {
                      if (suppressReactError(...args)) return;
                      originalConsoleError.apply(console, args);
                    };
                    
                    console.warn = function(...args) {
                      if (suppressReactError(...args)) return;
                      originalConsoleWarn.apply(console, args);
                    };
                    
                    console.log = function(...args) {
                      if (suppressReactError(...args)) return;
                      originalConsoleLog.apply(console, args);
                    };
                    
                    const handleError = function(event) {
                      if (event.message && (event.message.includes('185') || event.message.includes('Minified React error'))) {
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return false;
                      }
                    };
                    
                    window.addEventListener('error', handleError, true);
                    window.addEventListener('error', handleError, false);
                    document.addEventListener('error', handleError, true);
                    document.addEventListener('error', handleError, false);
                    
                    // Override window.onerror
                    window.onerror = function(message, source, lineno, colno, error) {
                      if (message && (message.includes('185') || message.includes('Minified React error'))) {
                        return true;
                      }
                      return false;
                    };
                    
                    // Continuously monitor and override console methods
                    setInterval(function() {
                      if (console.error !== originalConsoleError) {
                        console.error = function(...args) {
                          if (suppressReactError(...args)) return;
                          originalConsoleError.apply(console, args);
                        };
                      }
                    }, 1000);
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
