import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { Express } from 'express';

// Security headers configuration
export const securityHeaders = helmet({
  contentSecurityPolicy: {
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
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  frameguard: { action: 'deny' },
  xssFilter: true,
  hidePoweredBy: true
});

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use IP + User Agent for better rate limiting
    return req.ip + '|' + (req.get('User-Agent') || 'unknown');
  }
});

// Strict rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress;
    return ip || 'unknown';
  }
});

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Input validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi
  ];

  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);
  const params = JSON.stringify(req.params);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(body) || pattern.test(query) || pattern.test(params)) {
      return res.status(400).json({
        success: false,
        message: 'Suspicious input detected',
        code: 'SUSPICIOUS_INPUT'
      });
    }
  }

  next();
};

// Request size limiting
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction) => {
  const contentLength = parseInt(req.get('Content-Length') || '0');
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

  if (contentLength > maxSize) {
    return res.status(413).json({
      success: false,
      message: 'Request entity too large',
      maxSize: maxSize,
      receivedSize: contentLength
    });
  }

  next();
};

// IP whitelist middleware (optional)
export const ipWhitelist = (req: Request, res: Response, next: NextFunction) => {
  const allowedIPs = process.env.ALLOWED_IPS?.split(',') || [];
  
  if (allowedIPs.length > 0) {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    
    if (!allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }
  }

  next();
};

// Audit logging middleware
export const auditLog = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: duration,
      userId: (req as any).user?.id || 'anonymous'
    };

    // Log to console in development, file in production
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Audit Log:', logData);
    } else {
      // In production, you'd log to a file or external service
      console.log('🔍 Audit Log:', JSON.stringify(logData));
    }
  });

  next();
};

// Apply all security middleware
export const applySecurityMiddleware = (app: Express) => {
  // Basic security headers
  app.use(securityHeaders);
  
  // CORS
  app.use(cors(corsOptions));
  
  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      const ip = req.ip || req.connection.remoteAddress;
      return ip || 'unknown';
    }
  });
  app.use(limiter);
  app.use('/api/auth/', authRateLimiter);
  
  // Request size limiting
  app.use(requestSizeLimit);
  
  // Input validation
  app.use('/api/', validateInput);
  
  // Audit logging
  app.use(auditLog);
  
  // IP whitelist (optional - uncomment if needed)
  // app.use(ipWhitelist);
  
  console.log('🔒 Security middleware applied');
};
