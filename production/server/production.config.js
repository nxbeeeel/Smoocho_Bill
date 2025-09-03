// Smoocho Bill - Production Server Configuration
module.exports = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: '0.0.0.0',
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    }
  },

  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/smoocho_bill_prod',
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100
    }
  },

  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'your-super-secure-jwt-secret-key-here',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      refreshExpiresIn: '7d'
    },
    bcrypt: {
      rounds: 12
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enable: process.env.ENABLE_LOGGING === 'true',
    format: 'combined',
    file: {
      enabled: true,
      filename: 'logs/smoocho-bill.log',
      maxSize: '10m',
      maxFiles: '5'
    }
  },

  // Performance Configuration
  performance: {
    compression: true,
    helmet: true,
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS === 'true'
  }
};
