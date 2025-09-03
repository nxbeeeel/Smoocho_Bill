// 🍰 SMOOCHO POS SYSTEM - COMPREHENSIVE CONFIGURATION
// This file contains all POS system settings with NO TIMEOUTS and optimized performance

export const POS_CONFIG = {
  // 🚀 PERFORMANCE SETTINGS - NO TIMEOUTS
  performance: {
    // No timeouts for POS operations
    operationTimeout: 0, // 0 = no timeout
    syncTimeout: 0, // 0 = no timeout
    requestTimeout: 0, // 0 = no timeout
    idleTimeout: 0, // 0 = no timeout
    sessionTimeout: 0, // 0 = no timeout
    
    // Optimized for instant response
    debounceDelay: 100, // Minimal delay for UI updates
    throttleDelay: 50, // Minimal delay for rapid operations
    cacheExpiry: 0, // 0 = never expire
    maxRetries: 10, // High retry count for reliability
  },

  // 📱 TABLET OPTIMIZATION
  tablet: {
    // Touch-friendly settings
    minTouchTarget: 44, // Minimum 44px for touch targets
    swipeThreshold: 50, // Swipe detection threshold
    longPressDelay: 500, // Long press delay in ms
    doubleTapDelay: 300, // Double tap delay in ms
    
    // UI optimization
    gridColumns: {
      small: 3, // Small tablets
      medium: 4, // Medium tablets
      large: 5, // Large tablets
      xlarge: 6, // Extra large tablets
    },
    
    // Landscape optimization
    orientation: 'landscape',
    aspectRatio: '16:9',
    minWidth: 768,
    minHeight: 1024,
  },

  // 🔄 OFFLINE/SYNC SETTINGS
  offline: {
    // Offline-first architecture
    enableOfflineMode: true,
    autoSync: true,
    syncInterval: 5000, // Sync every 5 seconds when online
    maxOfflineData: 100 * 1024 * 1024, // 100MB offline storage
    
    // Conflict resolution
    conflictStrategy: 'newest_wins', // Default conflict resolution
    autoResolveConflicts: true,
    manualResolutionRequired: false,
    
    // Data persistence
    dataRetention: {
      orders: 365, // Keep orders for 1 year
      inventory: 730, // Keep inventory for 2 years
      reports: 1095, // Keep reports for 3 years
      settings: 0, // Keep settings forever
    },
  },

  // 💳 PAYMENT SETTINGS
  payment: {
    // Payment methods
    methods: ['cash', 'card', 'upi', 'zomato', 'swiggy'],
    defaultMethod: 'cash',
    
    // Card payment settings
    card: {
      enableChip: true,
      enableSwipe: true,
      enableContactless: true,
      requireSignature: false,
      requirePin: false,
      autoCapture: true,
    },
    
    // UPI settings
    upi: {
      enableQR: true,
      enableDeepLink: true,
      autoRedirect: true,
      timeout: 0, // No timeout for UPI
    },
    
    // Integration timeouts
    timeouts: {
      paytm: 0, // No timeout for Paytm
      zomato: 0, // No timeout for Zomato
      swiggy: 0, // No timeout for Swiggy
      thermal: 0, // No timeout for thermal printer
    },
  },

  // 🖨️ PRINTER SETTINGS
  printer: {
    // Thermal printer configuration
    thermal: {
      enable: true,
      model: 'Star TSP100',
      port: 'USB',
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      timeout: 0, // No timeout for printing
      retryCount: 5,
      autoConnect: true,
    },
    
    // Receipt settings
    receipt: {
      header: '🍰 SMOOCHO DESSERT SHOP 🍰',
      footer: 'Thank you for choosing Smoocho!',
      showLogo: true,
      showQR: true,
      showTax: true,
      showTotal: true,
      paperWidth: 80, // 80mm paper
      fontSize: 'normal',
      alignment: 'center',
    },
  },

  // 🔔 NOTIFICATION SETTINGS
  notifications: {
    // WhatsApp integration
    whatsapp: {
      enable: true,
      apiKey: process.env.REACT_APP_WHATSAPP_API_KEY || '',
      phoneNumber: process.env.REACT_APP_WHATSAPP_PHONE || '',
      template: 'smoocho_order_confirmation',
      timeout: 0, // No timeout for WhatsApp
    },
    
    // Email settings
    email: {
      enable: true,
      smtp: {
        host: process.env.REACT_APP_SMTP_HOST || '',
        port: 587,
        secure: false,
        auth: {
          user: process.env.REACT_APP_SMTP_USER || '',
          pass: process.env.REACT_APP_SMTP_PASS || '',
        },
        timeout: 0, // No timeout for email
      },
    },
    
    // Low stock alerts
    lowStock: {
      enable: true,
      threshold: 10,
      checkInterval: 60000, // Check every minute
      notificationMethods: ['whatsapp', 'email', 'in-app'],
    },
  },

  // 📊 REPORTING SETTINGS
  reporting: {
    // Report generation
    generation: {
      enableAutoReports: true,
      dailyReportTime: '23:59',
      monthlyReportTime: '23:59',
      autoExport: true,
      exportFormats: ['pdf', 'csv', 'excel'],
      timeout: 0, // No timeout for report generation
    },
    
    // Data export
    export: {
      maxRecords: 100000, // Export up to 100k records
      chunkSize: 1000, // Process in chunks of 1000
      compression: true,
      timeout: 0, // No timeout for exports
    },
  },

  // 🔐 SECURITY SETTINGS
  security: {
    // Authentication
    auth: {
      enablePin: true,
      enableBiometric: false,
      sessionTimeout: 0, // No session timeout
      maxLoginAttempts: 10,
      lockoutDuration: 300000, // 5 minutes
      requirePasswordChange: false,
    },
    
    // Data encryption
    encryption: {
      enable: true,
      algorithm: 'AES-256-GCM',
      keyRotation: false,
      encryptOfflineData: true,
    },
  },

  // 🌐 INTEGRATION SETTINGS
  integrations: {
    // Zomato integration
    zomato: {
      enable: true,
      apiKey: process.env.REACT_APP_ZOMATO_API_KEY || '',
      baseUrl: 'https://developers.zomato.com/api/v2.1',
      timeout: 0, // No timeout for Zomato
      autoSync: true,
      syncInterval: 30000, // Sync every 30 seconds
    },
    
    // Swiggy integration
    swiggy: {
      enable: true,
      apiKey: process.env.REACT_APP_SWIGGY_API_KEY || '',
      baseUrl: 'https://api.swiggy.com/v1',
      timeout: 0, // No timeout for Swiggy
      autoSync: true,
      syncInterval: 30000, // Sync every 30 seconds
    },
    
    // Paytm integration
    paytm: {
      enable: true,
      merchantId: process.env.REACT_APP_PAYTM_MERCHANT_ID || '',
      merchantKey: process.env.REACT_APP_PAYTM_MERCHANT_KEY || '',
      baseUrl: 'https://securegw.paytm.in',
      timeout: 0, // No timeout for Paytm
      testMode: process.env.NODE_ENV === 'development',
    },
  },

  // 🗄️ DATABASE SETTINGS
  database: {
    // IndexedDB configuration
    indexedDB: {
      name: 'SmoochoPOS',
      version: 1,
      maxSize: 100 * 1024 * 1024, // 100MB
      autoCleanup: true,
      cleanupInterval: 86400000, // Daily cleanup
      timeout: 0, // No timeout for database operations
    },
    
    // Sync settings
    sync: {
      enableRealTime: true,
      batchSize: 100,
      maxConcurrent: 5,
      retryDelay: 1000,
      maxRetries: 10,
      timeout: 0, // No timeout for sync operations
    },
  },

  // 🎨 UI/UX SETTINGS
  ui: {
    // Theme settings
    theme: {
      primary: '#3B82F6',
      secondary: '#64748B',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#1E293B',
    },
    
    // Animation settings
    animations: {
      enable: true,
      duration: 200,
      easing: 'ease-in-out',
      reduceMotion: false,
    },
    
    // Accessibility
    accessibility: {
      enableHighContrast: false,
      enableLargeText: false,
      enableScreenReader: true,
      enableKeyboardNavigation: true,
    },
  },

  // 📱 PWA SETTINGS
  pwa: {
    // Service worker
    serviceWorker: {
      enable: true,
      scope: '/',
      updateViaCache: 'none',
      skipWaiting: true,
      clientsClaim: true,
    },
    
    // App manifest
    manifest: {
      name: 'Smoocho POS System',
      shortName: 'Smoocho POS',
      description: 'Professional POS and Inventory Management',
      startUrl: '/',
      display: 'standalone',
      orientation: 'landscape',
      themeColor: '#3B82F6',
      backgroundColor: '#F8FAFC',
    },
  },
};

// 🚀 EXPORT CONFIGURATION
export default POS_CONFIG;

// 📋 CONFIGURATION VALIDATION
export const validateConfig = () => {
  const errors: string[] = [];
  
  // Check for any timeouts that might cause issues
  if (POS_CONFIG.performance.operationTimeout > 0) {
    errors.push('Operation timeout should be 0 for instant response');
  }
  
  if (POS_CONFIG.performance.syncTimeout > 0) {
    errors.push('Sync timeout should be 0 for continuous operation');
  }
  
  if (POS_CONFIG.payment.timeouts.paytm > 0) {
    errors.push('Paytm timeout should be 0 for reliable payments');
  }
  
  if (POS_CONFIG.database.indexedDB.timeout > 0) {
    errors.push('Database timeout should be 0 for fast operations');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// 🔧 CONFIGURATION HELPERS
export const getConfig = (path: string) => {
  return path.split('.').reduce((obj: any, key) => obj?.[key], POS_CONFIG);
};

export const setConfig = (path: string, value: any) => {
  const keys = path.split('.');
  const lastKey = keys.pop()!;
  const obj = keys.reduce((obj: any, key) => obj[key], POS_CONFIG);
  (obj as any)[lastKey] = value;
};
