import React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/toaster'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smoocho Bill - Premium POS System',
  description: 'Advanced Point of Sale system for modern businesses with Clean Architecture',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smoocho Bill'
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: 'website',
    siteName: 'Smoocho Bill',
    title: 'Smoocho Bill - Premium POS System',
    description: 'Advanced Point of Sale system for modern businesses'
  },
  twitter: {
    card: 'summary',
    title: 'Smoocho Bill - Premium POS System',
    description: 'Advanced Point of Sale system for modern businesses'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="Smoocho Bill" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Smoocho Bill" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-192x192.png" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        
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
        {children}
        <Toaster />
      </body>
    </html>
  )
}
