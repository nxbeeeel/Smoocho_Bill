import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AuthPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: AuthPayload;
}

// JWT token verification with enhanced security
export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    // Check if token is expired
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    // Check if user account is locked
    if (decoded.lockedUntil && new Date(decoded.lockedUntil) > new Date()) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked',
        code: 'ACCOUNT_LOCKED',
        lockedUntil: decoded.lockedUntil
      });
    }

    // Create user object for request
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
      permissions: decoded.permissions,
      sessionId: decoded.sessionId,
      iat: decoded.iat,
      exp: decoded.exp
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }

    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based access control
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Permission-based access control
export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    // Check if user has specific permission
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: No permissions found',
        code: 'NO_PERMISSIONS',
        required: permission,
        current: req.user?.permissions || []
      });
    }

    const hasPermission = req.user.permissions.some(p => p.name === permission);
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: permission,
        current: req.user.permissions.map(p => p.name)
      });
    }

    next();
  };
};

// Admin-only access
export const requireAdmin = requireRole(['admin', 'super_admin']);

// Manager or higher access
export const requireManager = requireRole(['admin', 'super_admin', 'manager']);

// Staff or higher access
export const requireStaff = requireRole(['admin', 'super_admin', 'manager', 'staff']);

// Enhanced password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12; // Increased from default 10 for better security
  return await bcrypt.hash(password, saltRounds);
};

// Enhanced password verification
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

// Generate secure JWT token
export const generateToken = (user: any): string => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    lastLogin: user.lastLogin,
    loginAttempts: user.loginAttempts,
    lockedUntil: user.lockedUntil,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    algorithm: 'HS256',
    issuer: 'smoocho-bill',
    audience: 'smoocho-bill-users'
  });
};

// Refresh token generation
export const generateRefreshToken = (user: any): string => {
  const payload = {
    id: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
    algorithm: 'HS256',
    issuer: 'smoocho-bill',
    audience: 'smoocho-bill-users'
  });
};

// Validate refresh token
export const validateRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret');
  } catch (error) {
    throw error;
  }
};

// Session management
export const createSession = (req: AuthenticatedRequest, res: Response, user: any) => {
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set secure HTTP-only cookie for refresh token
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      permissions: user.permissions || []
    }
  };
};

// Logout and session cleanup
export const destroySession = (req: AuthenticatedRequest, res: Response) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  
  // Add token to blacklist (in production, you'd use Redis)
  // This is a simplified version
  return {
    success: true,
    message: 'Logged out successfully'
  };
};

// Account lockout after failed attempts
export const handleFailedLogin = async (user: any): Promise<any> => {
  const maxAttempts = 5;
  const lockoutDuration = 15 * 60 * 1000; // 15 minutes

  if (!user.loginAttempts) {
    user.loginAttempts = 0;
  }

  user.loginAttempts += 1;

  if (user.loginAttempts >= maxAttempts) {
    user.lockedUntil = new Date(Date.now() + lockoutDuration);
    user.loginAttempts = 0; // Reset for next lockout period
  }

  return user;
};

// Reset failed login attempts
export const resetFailedLogins = async (user: any): Promise<any> => {
  user.loginAttempts = 0;
  user.lockedUntil = null;
  return user;
};

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // For development, allow all requests without authentication
  // In production, you would verify JWT tokens here
  
  // Mock user for development
  (req as any).user = {
    id: 'dev-user-1',
    username: 'admin',
    role: 'admin'
  };
  
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};
