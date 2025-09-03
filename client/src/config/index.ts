// Configuration file for Smoocho Bill POS System
export const config = {
  // Application settings
  app: {
    name: 'Smoocho Bill',
    version: '1.0.0',
    description: 'Touch-optimized POS & Inventory Management System',
    defaultLanguage: 'en',
    deviceType: 'tablet', // tablet, mobile, desktop
  },

  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // WebSocket configuration
  websocket: {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
    reconnectAttempts: 5,
    reconnectDelay: 1000,
    pingInterval: 30000, // 30 seconds
  },

  // Offline/Sync configuration
  sync: {
    interval: 5 * 60 * 1000, // 5 minutes
    batchSize: 50,
    maxRetries: 3,
    backoffDelay: 1000,
    autoSyncOnReconnect: true,
  },

  // Touch/UI configuration - Optimized for tablets
  ui: {
    touchTargetSize: 80, // Increased to 80px for better tablet experience
    animationDuration: 150, // Faster animations for better responsiveness
    debounceDelay: 200, // Reduced delay for better touch response
    toastDuration: 4000, // 4 seconds for notifications
    tablet: {
      gridColumns: 4, // 4-column grid for tablets
      itemSpacing: 16, // Increased spacing between items
      fontSize: {
        small: '14px',
        medium: '16px',
        large: '20px',
        xlarge: '24px'
      },
      buttonHeight: 60, // Larger buttons for tablet
      inputHeight: 56, // Larger input fields
      cardPadding: 20, // Increased card padding
    },
    mobile: {
      gridColumns: 2, // 2-column grid for mobile
      itemSpacing: 12,
      fontSize: {
        small: '12px',
        medium: '14px',
        large: '18px',
        xlarge: '22px'
      },
      buttonHeight: 50,
      inputHeight: 48,
      cardPadding: 16,
    }
  },

  // Business logic configuration
  business: {
    taxRate: 0.05, // 5% tax rate (can be overridden by settings)
    currency: {
      code: 'INR',
      symbol: '₹',
      decimals: 2,
    },
    orderNumberPrefix: 'SMO',
    receiptFooter: 'Thank you for choosing Smoocho!',
    lowStockThreshold: 10, // default low stock threshold
  },

  // Storage configuration
  storage: {
    tokenKey: 'smoocho-auth-token',
    maxCacheSize: 100 * 1024 * 1024, // Increased to 100MB for tablets
    cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
    dbName: 'SmoochoOfflineDB',
    dbVersion: 1,
  },

  // Print configuration - Enhanced for tablet printing
  print: {
    thermalPrinterWidth: 48, // characters per line for thermal printer
    paperSizes: {
      thermal58mm: { width: 48, name: '58mm Thermal' },
      thermal80mm: { width: 64, name: '80mm Thermal' },
      a4: { width: 80, name: 'A4 Paper' },
    },
    defaultPaperSize: 'thermal80mm',
    tablet: {
      enableBuiltInPrinter: true, // Enable tablet's built-in printer
      printPreview: true, // Show print preview before printing
      autoPrint: false, // Don't auto-print, let user confirm
      printQuality: 'high', // High quality printing
      margins: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10
      }
    },
    receipt: {
      headerLogo: true,
      showQRCode: true,
      showTaxBreakdown: true,
      showPaymentMethod: true,
      showCashierInfo: true,
      footerMessage: true
    }
  },

  // Payment configuration
  payments: {
    supportedMethods: ['cash', 'card', 'upi', 'wallet'],
    paytm: {
      environment: import.meta.env.VITE_PAYTM_ENV || 'staging',
      website: import.meta.env.VITE_PAYTM_WEBSITE || 'WEBSTAGING',
    },
    tablet: {
      enableCardReader: true, // Enable external card reader
      enableBarcodeScanner: true, // Enable barcode scanning
      enableNFC: true, // Enable NFC payments
      showPaymentKeyboard: true, // Show on-screen payment keyboard
    }
  },

  // External integrations
  integrations: {
    zomato: {
      enabled: false,
      apiUrl: 'https://api.zomato.com/v2.1',
      webhookEndpoint: '/api/webhooks/zomato',
    },
    swiggy: {
      enabled: false,
      apiUrl: 'https://api.swiggy.com/v1',
      webhookEndpoint: '/api/webhooks/swiggy',
    },
    whatsapp: {
      enabled: false,
      provider: 'twilio', // or 'whatsapp-business-api'
      sendReceipt: true,
      sendOrderUpdates: true,
    }
  },

  // Performance configuration for tablets
  performance: {
    enableServiceWorker: true,
    enableOfflineMode: true,
    enableBackgroundSync: true,
    enablePushNotifications: true,
    cacheStrategies: {
      images: 'cache-first',
      api: 'network-first',
      static: 'cache-first'
    },
    tablet: {
      enableHardwareAcceleration: true,
      enableTouchGestures: true,
      enableSwipeNavigation: true,
      enablePinchZoom: false, // Disable zoom for better UX
      enableOrientationLock: 'landscape', // Lock to landscape for POS
    }
  },

  // Accessibility configuration
  accessibility: {
    enableHighContrast: true,
    enableLargeText: true,
    enableScreenReader: true,
    enableKeyboardNavigation: true,
    enableVoiceCommands: false, // Future feature
    tablet: {
      enableHapticFeedback: true,
      enableSoundEffects: true,
      enableVisualCues: true,
      enableTouchAssist: true
    }
  }
};

// Export individual configurations for easy access
export const API_BASE_URL = config.api.baseUrl;
export const WS_BASE_URL = config.websocket.url;
export const APP_NAME = config.app.name;
export const APP_VERSION = config.app.version;
export const CURRENCY_SYMBOL = config.business.currency.symbol;
export const CURRENCY_CODE = config.business.currency.code;
export const TAX_RATE = config.business.taxRate;
export const TOUCH_TARGET_SIZE = config.ui.touchTargetSize;
export const ANIMATION_DURATION = config.ui.animationDuration;
export const TOAST_DURATION = config.ui.toastDuration;
export const GRID_COLUMNS = config.ui.tablet.gridColumns;
export const ITEM_SPACING = config.ui.tablet.itemSpacing;
export const BUTTON_HEIGHT = config.ui.tablet.buttonHeight;
export const INPUT_HEIGHT = config.ui.tablet.inputHeight;
export const CARD_PADDING = config.ui.tablet.cardPadding;
export const FONT_SIZES = config.ui.tablet.fontSize;
export const PRINT_CONFIG = config.print;
export const PAYMENT_CONFIG = config.payments;
export const PERFORMANCE_CONFIG = config.performance;
export const ACCESSIBILITY_CONFIG = config.accessibility;

// Business configuration
export const businessConfig = {
  name: "Smoocho Bill",
  address: "123 Business Street, City, State 12345",
  phone: "+1-555-123-4567",
  email: "info@smoochobill.com",
  website: "https://smoochobill.com",
  taxRate: 0.08, // 8%
  currency: {
    code: "USD",
    symbol: "$",
    decimals: 2
  },
  timezone: "America/New_York",
  businessHours: {
    monday: { open: "09:00", close: "21:00" },
    tuesday: { open: "09:00", close: "21:00" },
    wednesday: { open: "09:00", close: "21:00" },
    thursday: { open: "09:00", close: "21:00" },
    friday: { open: "09:00", close: "22:00" },
    saturday: { open: "10:00", close: "22:00" },
    sunday: { open: "11:00", close: "20:00" }
  },
  app: {
    name: "Smoocho Bill POS",
    version: "1.0.0",
    description: "Professional Point of Sale System"
  }
};
