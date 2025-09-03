import { Request, Response, NextFunction } from 'express';
import { 
  AuthenticatedRequest, 
  AuthMiddlewareOptions, 
  Permission,
  SecurityEvent,
  UserActivity
} from '../types';
import { authService } from '../services/authService';
import { permissionsService } from '../services/permissionsService';
import { userManagementService } from '../services/userManagementService';

/**
 * Enhanced Authentication Middleware
 * 
 * Provides comprehensive authentication and authorization with:
 * - JWT token validation
 * - Session management
 * - Permission-based access control
 * - Security event logging
 * - Rate limiting per user
 * - Device tracking
 */

// Extract device information from request
function extractDeviceInfo(req: Request) {
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ipAddress = req.ip || req.connection.remoteAddress || '0.0.0.0';
  
  let deviceType: 'desktop' | 'tablet' | 'mobile' = 'desktop';
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceType = /iPad|Tablet/.test(userAgent) ? 'tablet' : 'mobile';
  }
  
  return {
    user_agent: userAgent,
    ip_address: ipAddress,
    device_type: deviceType,
    device_name: req.get('X-Device-Name') || deviceType
  };
}

// Log user activity
async function logUserActivity(
  userId: string, 
  action: string, 
  req: Request,
  details?: any
): Promise<void> {
  const deviceInfo = extractDeviceInfo(req);
  
  // This would typically save to database
  console.log(`📝 User activity: ${userId} - ${action}`, {
    details,
    deviceInfo,
    timestamp: new Date()
  });
}

// Log security event
async function logSecurityEvent(
  eventType: SecurityEvent['event_type'],
  req: Request,
  userId?: string,
  username?: string,
  details?: any
): Promise<void> {
  const deviceInfo = extractDeviceInfo(req);
  
  console.log(`🔒 Security event: ${eventType}`, {
    userId,
    username,
    details,
    deviceInfo,
    timestamp: new Date()
  });
}

/**
 * Basic JWT Authentication Middleware
 * Validates token and populates req.user
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      await logSecurityEvent('permission_denied', req, undefined, undefined, {
        reason: 'No token provided'
      });
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid token.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token using auth service
    const payload = await authService.verifyToken(token);
    
    if (!payload) {
      await logSecurityEvent('permission_denied', req, undefined, undefined, {
        reason: 'Invalid or expired token'
      });
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token. Please login again.'
      });
    }

    // Get session info
    const session = await authService.getActiveSession(payload.session_id);
    if (!session || !session.is_active) {
      await logSecurityEvent('permission_denied', req, payload.user_id, payload.username, {
        reason: 'Session expired or inactive'
      });
      return res.status(401).json({
        success: false,
        error: 'Session expired. Please login again.'
      });
    }

    // Get full user data
    const user = userManagementService.getUserById(payload.user_id);
    if (!user || !user.is_active) {
      await logSecurityEvent('permission_denied', req, payload.user_id, payload.username, {
        reason: 'User not found or inactive'
      });
      return res.status(401).json({
        success: false,
        error: 'User account is not active.'
      });
    }

    if (user.is_locked) {
      await logSecurityEvent('permission_denied', req, payload.user_id, payload.username, {
        reason: 'Account locked'
      });
      return res.status(401).json({
        success: false,
        error: 'Account is locked. Please contact administrator.'
      });
    }

    // Add user and session to request
    req.user = payload;
    req.session = session;

    // Log activity
    await logUserActivity(payload.user_id, 'api_access', req, {
      endpoint: req.path,
      method: req.method
    });

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    await logSecurityEvent('permission_denied', req, undefined, undefined, {
      reason: 'Authentication error',
      error: error.message
    });
    
    res.status(401).json({
      success: false,
      error: 'Authentication failed. Please try again.'
    });
  }
};

/**
 * Role-based Authorization Middleware
 */
export const authorize = (...allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      if (!permissionsService.hasAnyRole(req.user, allowedRoles)) {
        await logSecurityEvent('permission_denied', req, req.user.user_id, req.user.username, {
          reason: 'Insufficient role',
          required_roles: allowedRoles,
          user_role: req.user.role
        });
        
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${allowedRoles.join(' or ')}`
        });
      }

      next();
    } catch (error) {
      console.error('Authorization error:', error);
      res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      });
    }
  };
};

/**
 * Permission-based Authorization Middleware
 */
export const requirePermission = (resource: string, action: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const user = userManagementService.getUserById(req.user.user_id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!permissionsService.hasPermission(user, resource, action)) {
        await logSecurityEvent('permission_denied', req, req.user.user_id, req.user.username, {
          reason: 'Insufficient permission',
          required_permission: `${resource}:${action}`,
          user_permissions: permissionsService.getUserPermissions(user)
        });
        
        return res.status(403).json({
          success: false,
          error: `Access denied. Required permission: ${resource}:${action}`
        });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
};

/**
 * Multiple Permissions Authorization (requires ALL permissions)
 */
export const requireAllPermissions = (permissions: Array<{ resource: string; action: string }>) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const user = userManagementService.getUserById(req.user.user_id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!permissionsService.hasAllPermissions(user, permissions)) {
        await logSecurityEvent('permission_denied', req, req.user.user_id, req.user.username, {
          reason: 'Insufficient permissions',
          required_permissions: permissions.map(p => `${p.resource}:${p.action}`),
        });
        
        return res.status(403).json({
          success: false,
          error: 'Access denied. Missing required permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Permissions check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permissions check failed'
      });
    }
  };
};

/**
 * Multiple Permissions Authorization (requires ANY permission)
 */
export const requireAnyPermission = (permissions: Array<{ resource: string; action: string }>) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const user = userManagementService.getUserById(req.user.user_id);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!permissionsService.hasAnyPermission(user, permissions)) {
        await logSecurityEvent('permission_denied', req, req.user.user_id, req.user.username, {
          reason: 'Insufficient permissions',
          required_permissions: permissions.map(p => `${p.resource}:${p.action}`),
        });
        
        return res.status(403).json({
          success: false,
          error: 'Access denied. Missing required permissions.'
        });
      }

      next();
    } catch (error) {
      console.error('Permissions check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permissions check failed'
      });
    }
  };
};

/**
 * Optional Authentication Middleware
 * Populates req.user if valid token is provided, but doesn't require it
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await authService.verifyToken(token);
      
      if (payload) {
        const session = await authService.getActiveSession(payload.session_id);
        if (session && session.is_active) {
          const user = userManagementService.getUserById(payload.user_id);
          if (user && user.is_active && !user.is_locked) {
            req.user = payload;
            req.session = session;
          }
        }
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

/**
 * Admin Only Middleware
 */
export const adminOnly = authorize('admin');

/**
 * Cashier or Admin Middleware
 */
export const cashierOrAdmin = authorize('cashier', 'admin');

/**
 * Self or Admin Access Middleware
 * Allows users to access their own resources or admins to access any
 */
export const selfOrAdmin = (userIdParam: string = 'userId') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const targetUserId = req.params[userIdParam];
      const isAdmin = req.user.role === 'admin';
      const isSelf = req.user.user_id === targetUserId;

      if (!isAdmin && !isSelf) {
        await logSecurityEvent('permission_denied', req, req.user.user_id, req.user.username, {
          reason: 'Not self or admin',
          target_user_id: targetUserId
        });
        
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only access your own resources.'
        });
      }

      next();
    } catch (error) {
      console.error('Self or admin check error:', error);
      res.status(500).json({
        success: false,
        error: 'Access check failed'
      });
    }
  };
};

/**
 * Rate Limiting per User
 */
const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimitPerUser = (maxRequests: number = 100, windowMs: number = 60000) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        return next(); // Skip rate limiting for unauthenticated requests
      }

      const userId = req.user.user_id;
      const now = Date.now();
      const userLimit = userRequestCounts.get(userId);

      if (!userLimit || now > userLimit.resetTime) {
        // Reset or initialize counter
        userRequestCounts.set(userId, {
          count: 1,
          resetTime: now + windowMs
        });
        next();
      } else if (userLimit.count < maxRequests) {
        // Increment counter
        userLimit.count++;
        next();
      } else {
        // Rate limit exceeded
        await logSecurityEvent('suspicious_activity', req, req.user.user_id, req.user.username, {
          reason: 'Rate limit exceeded',
          requests_count: userLimit.count,
          window_ms: windowMs
        });
        
        res.status(429).json({
          success: false,
          error: 'Rate limit exceeded. Please slow down your requests.',
          retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        });
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Continue on error
    }
  };
};

/**
 * Device Validation Middleware
 */
export const validateDevice = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user || !req.session) {
      return next();
    }

    const currentDevice = extractDeviceInfo(req);
    const sessionDevice = req.session.device_info;

    // Check if device matches session
    if (sessionDevice.ip_address !== currentDevice.ip_address) {
      await logSecurityEvent('suspicious_activity', req, req.user.user_id, req.user.username, {
        reason: 'IP address mismatch',
        session_ip: sessionDevice.ip_address,
        current_ip: currentDevice.ip_address
      });
      
      // Log but don't block (IP can change due to mobile networks)
    }

    if (sessionDevice.user_agent !== currentDevice.user_agent) {
      await logSecurityEvent('suspicious_activity', req, req.user.user_id, req.user.username, {
        reason: 'User agent mismatch',
        session_ua: sessionDevice.user_agent,
        current_ua: currentDevice.user_agent
      });
      
      // This could indicate session hijacking
      return res.status(401).json({
        success: false,
        error: 'Device mismatch detected. Please login again for security.'
      });
    }

    next();
  } catch (error) {
    console.error('Device validation error:', error);
    next(); // Continue on error
  }
};

/**
 * Combined Security Middleware
 * Applies authentication, device validation, and rate limiting
 */
export const secureEndpoint = [
  authenticate,
  validateDevice,
  rateLimitPerUser()
];

/**
 * Admin Secure Endpoint
 */
export const adminSecureEndpoint = [
  ...secureEndpoint,
  adminOnly
];

/**
 * Cashier Secure Endpoint
 */
export const cashierSecureEndpoint = [
  ...secureEndpoint,
  cashierOrAdmin
];

// Utility function to create permission-based middleware
export const createPermissionMiddleware = permissionsService.createPermissionMiddleware.bind(permissionsService);
export const createRoleMiddleware = permissionsService.createRoleMiddleware.bind(permissionsService);
export const createAuthorizationMiddleware = permissionsService.createAuthorizationMiddleware.bind(permissionsService);