// Security Configuration for Smoocho Bill
export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-here',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-here',
    expiresIn: '24h',
    refreshExpiresIn: '7d',
    issuer: 'smoocho-bill',
    audience: 'smoocho-bill-users',
    algorithm: 'HS256'
  },

  // Password Security
  password: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    saltRounds: 12,
    maxAge: 90 * 24 * 60 * 60 * 1000 // 90 days
  },

  // Session Security
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    rolling: true
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // requests per window
    authMax: 5, // login attempts per window
    message: 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },

  // HSTS Configuration
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },

  // Account Lockout
  lockout: {
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    resetAfter: 24 * 60 * 60 * 1000 // 24 hours
  },

  // File Upload Security
  fileUpload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    scanForViruses: true,
    quarantineSuspicious: true
  },

  // API Security
  api: {
    versioning: true,
    rateLimitByIP: true,
    requireAuthentication: true,
    logAllRequests: true,
    validateInput: true,
    sanitizeOutput: true
  },

  // Database Security
  database: {
    useSSL: process.env.NODE_ENV === 'production',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    charset: 'utf8mb4'
  },

  // Logging Security
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maskSensitiveData: true,
    sensitiveFields: ['password', 'token', 'secret', 'key'],
    logToFile: process.env.NODE_ENV === 'production',
    logToConsole: process.env.NODE_ENV === 'development',
    maxLogSize: 10 * 1024 * 1024, // 10MB
    maxLogFiles: 5
  },

  // Monitoring and Alerting
  monitoring: {
    enableHealthChecks: true,
    enableMetrics: true,
    healthCheckInterval: 30000, // 30 seconds
    alertOnFailure: true,
    failureThreshold: 3,
    recoveryThreshold: 2
  },

  // Backup and Recovery
  backup: {
    enableAutoBackup: true,
    backupInterval: 24 * 60 * 60 * 1000, // 24 hours
    retentionDays: 30,
    encryptBackups: true,
    backupLocation: process.env.BACKUP_LOCATION || './backups'
  },

  // Network Security
  network: {
    allowedIPs: process.env.ALLOWED_IPS?.split(',') || [],
    blockSuspiciousIPs: true,
    enableDDoSProtection: true,
    maxConnectionsPerIP: 100,
    connectionTimeout: 30000 // 30 seconds
  },

  // Encryption
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16,
    saltLength: 64
  }
};

// Security validation functions
export const validateSecurityConfig = () => {
  const errors: string[] = [];

  // Check JWT secrets
  if (securityConfig.jwt.secret === 'your-super-secure-jwt-secret-here') {
    errors.push('JWT_SECRET must be changed from default value');
  }

  if (securityConfig.jwt.refreshSecret === 'your-refresh-secret-here') {
    errors.push('JWT_REFRESH_SECRET must be changed from default value');
  }

  // Check password requirements
  if (securityConfig.password.minLength < 8) {
    errors.push('Password minimum length should be at least 8 characters');
  }

  // Check CORS origins in production
  if (process.env.NODE_ENV === 'production' && 
      securityConfig.cors.origin.includes('localhost')) {
    errors.push('CORS origins should not include localhost in production');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Security middleware configuration
export const securityMiddleware = {
  enableHelmet: true,
  enableCORS: true,
  enableRateLimit: true,
  enableInputValidation: true,
  enableAuditLogging: true,
  enableIPWhitelist: false, // Set to true if you want IP restrictions
  enableRequestSizeLimit: true,
  enableSecurityHeaders: true
};

export default securityConfig;
