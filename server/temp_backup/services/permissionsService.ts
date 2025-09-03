import { Permission, Role, User, AuthPayload } from '../types';

/**
 * Permissions Service
 * 
 * Handles role-based access control with:
 * - Permission checking and validation
 * - Role-based authorization
 * - Resource access control
 * - Dynamic permission evaluation
 * - Permission inheritance
 * - Access control lists (ACL)
 */
export class PermissionsService {
  // Permission cache for performance
  private permissionCache: Map<string, Set<string>> = new Map();
  private rolePermissionCache: Map<string, Set<string>> = new Map();

  constructor() {
    console.log('🔐 Permissions service initialized');
  }

  // Check if user has specific permission
  hasPermission(user: User | AuthPayload, resource: string, action: string): boolean {
    const permissionKey = `${resource}:${action}`;
    
    // Check if user has direct permission
    const userPermissions = this.getUserPermissions(user);
    if (userPermissions.has(permissionKey)) {
      return true;
    }

    // Check for wildcard permissions
    if (userPermissions.has(`${resource}:*`) || userPermissions.has('*:*')) {
      return true;
    }

    return false;
  }

  // Check multiple permissions (user must have ALL)
  hasAllPermissions(user: User | AuthPayload, permissions: Array<{ resource: string; action: string }>): boolean {
    return permissions.every(p => this.hasPermission(user, p.resource, p.action));
  }

  // Check multiple permissions (user must have ANY)
  hasAnyPermission(user: User | AuthPayload, permissions: Array<{ resource: string; action: string }>): boolean {
    return permissions.some(p => this.hasPermission(user, p.resource, p.action));
  }

  // Check if user has role
  hasRole(user: User | AuthPayload, roleName: string): boolean {
    return user.role === roleName;
  }

  // Check if user has any of the specified roles
  hasAnyRole(user: User | AuthPayload, roles: string[]): boolean {
    return roles.includes(user.role);
  }

  // Get all permissions for a user
  getUserPermissions(user: User | AuthPayload): Set<string> {
    const cacheKey = `user_${user.user_id || (user as User).id}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const permissions = new Set<string>();

    // Add permissions from user object
    if ('permissions' in user && user.permissions) {
      if (Array.isArray(user.permissions)) {
        // If permissions is array of strings (from AuthPayload)
        if (typeof user.permissions[0] === 'string') {
          user.permissions.forEach(p => permissions.add(p as string));
        } else {
          // If permissions is array of Permission objects (from User)
          (user.permissions as Permission[]).forEach(p => {
            permissions.add(`${p.resource}:${p.action}`);
          });
        }
      }
    }

    // Cache the result
    this.permissionCache.set(cacheKey, permissions);
    
    return permissions;
  }

  // Get all permissions for a role
  getRolePermissions(role: Role): Set<string> {
    const cacheKey = `role_${role.id}`;
    
    if (this.rolePermissionCache.has(cacheKey)) {
      return this.rolePermissionCache.get(cacheKey)!;
    }

    const permissions = new Set<string>();
    
    role.permissions.forEach(p => {
      permissions.add(`${p.resource}:${p.action}`);
    });

    // Cache the result
    this.rolePermissionCache.set(cacheKey, permissions);
    
    return permissions;
  }

  // Check resource access with context
  canAccessResource(
    user: User | AuthPayload, 
    resource: string, 
    action: string, 
    context?: { 
      resourceId?: string; 
      ownerId?: string; 
      metadata?: any 
    }
  ): boolean {
    // Basic permission check
    if (!this.hasPermission(user, resource, action)) {
      return false;
    }

    // Additional context-based checks
    if (context) {
      // Check ownership for self-access resources
      if (context.ownerId && action === 'read' && resource === 'profile') {
        const userId = user.user_id || (user as User).id;
        return userId === context.ownerId;
      }

      // Custom business rules can be added here
      if (context.metadata) {
        // Handle special cases based on metadata
        return this.evaluateMetadataPermissions(user, resource, action, context.metadata);
      }
    }

    return true;
  }

  // Filter resources based on permissions
  filterResources<T extends { id: string; created_by?: string }>(
    user: User | AuthPayload,
    resources: T[],
    resource: string,
    action: string
  ): T[] {
    return resources.filter(item => {
      return this.canAccessResource(user, resource, action, {
        resourceId: item.id,
        ownerId: item.created_by
      });
    });
  }

  // Permission-based field filtering
  filterFields<T extends Record<string, any>>(
    user: User | AuthPayload,
    data: T,
    fieldPermissions: Record<keyof T, { resource: string; action: string }>
  ): Partial<T> {
    const filteredData: Partial<T> = {};

    for (const [field, permission] of Object.entries(fieldPermissions)) {
      if (this.hasPermission(user, permission.resource, permission.action)) {
        filteredData[field as keyof T] = data[field as keyof T];
      }
    }

    return filteredData;
  }

  // Create permission middleware
  createPermissionMiddleware(resource: string, action: string) {
    return (req: any, res: any, next: any) => {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      if (!this.hasPermission(user, resource, action)) {
        return res.status(403).json({ 
          success: false, 
          error: `Insufficient permissions. Required: ${resource}:${action}` 
        });
      }

      next();
    };
  }

  // Create role middleware
  createRoleMiddleware(allowedRoles: string[]) {
    return (req: any, res: any, next: any) => {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      if (!this.hasAnyRole(user, allowedRoles)) {
        return res.status(403).json({ 
          success: false, 
          error: `Insufficient role. Required one of: ${allowedRoles.join(', ')}` 
        });
      }

      next();
    };
  }

  // Create combined permission and role middleware
  createAuthorizationMiddleware(options: {
    permissions?: Array<{ resource: string; action: string }>;
    roles?: string[];
    requireAll?: boolean; // For permissions, default true
    requireAnyRole?: boolean; // For roles, default true
  }) {
    return (req: any, res: any, next: any) => {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Authentication required' 
        });
      }

      let hasPermission = true;
      let hasRole = true;

      // Check permissions
      if (options.permissions && options.permissions.length > 0) {
        if (options.requireAll !== false) {
          hasPermission = this.hasAllPermissions(user, options.permissions);
        } else {
          hasPermission = this.hasAnyPermission(user, options.permissions);
        }
      }

      // Check roles
      if (options.roles && options.roles.length > 0) {
        hasRole = this.hasAnyRole(user, options.roles);
      }

      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient permissions' 
        });
      }

      if (!hasRole) {
        return res.status(403).json({ 
          success: false, 
          error: 'Insufficient role' 
        });
      }

      next();
    };
  }

  // Validate permission string format
  isValidPermission(permission: string): boolean {
    const parts = permission.split(':');
    return parts.length === 2 && parts[0].length > 0 && parts[1].length > 0;
  }

  // Parse permission string
  parsePermission(permission: string): { resource: string; action: string } | null {
    if (!this.isValidPermission(permission)) {
      return null;
    }

    const [resource, action] = permission.split(':');
    return { resource, action };
  }

  // Permission hierarchy and inheritance
  inheritsPermission(childPermission: string, parentPermission: string): boolean {
    const child = this.parsePermission(childPermission);
    const parent = this.parsePermission(parentPermission);

    if (!child || !parent) return false;

    // Exact match
    if (childPermission === parentPermission) return true;

    // Wildcard matches
    if (parent.resource === '*' || parent.action === '*') return true;
    if (parent.resource === child.resource && parent.action === '*') return true;
    if (parent.action === child.action && parent.resource === '*') return true;

    return false;
  }

  // Get effective permissions (with inheritance)
  getEffectivePermissions(user: User | AuthPayload): Set<string> {
    const basePermissions = this.getUserPermissions(user);
    const effectivePermissions = new Set(basePermissions);

    // Add implied permissions based on wildcards
    for (const permission of basePermissions) {
      const parsed = this.parsePermission(permission);
      if (!parsed) continue;

      // If user has resource:*, add all common actions for that resource
      if (parsed.action === '*') {
        const commonActions = ['create', 'read', 'update', 'delete'];
        commonActions.forEach(action => {
          effectivePermissions.add(`${parsed.resource}:${action}`);
        });
      }

      // If user has *:action, add that action for all common resources
      if (parsed.resource === '*') {
        const commonResources = ['users', 'products', 'orders', 'inventory', 'reports'];
        commonResources.forEach(resource => {
          effectivePermissions.add(`${resource}:${parsed.action}`);
        });
      }
    }

    return effectivePermissions;
  }

  // Check if user can perform action on own resources
  canAccessOwnResource(
    user: User | AuthPayload, 
    resource: string, 
    action: string, 
    ownerId: string
  ): boolean {
    const userId = user.user_id || (user as User).id;
    
    // Check if it's own resource
    if (userId === ownerId) {
      // Check for self-access permission
      return this.hasPermission(user, resource, `${action}_own`) || 
             this.hasPermission(user, resource, action);
    }

    // For other users' resources, need full permission
    return this.hasPermission(user, resource, action);
  }

  // Dynamic permission evaluation based on metadata
  private evaluateMetadataPermissions(
    user: User | AuthPayload, 
    resource: string, 
    action: string, 
    metadata: any
  ): boolean {
    // Time-based permissions
    if (metadata.timeRestriction) {
      const now = new Date();
      const start = new Date(metadata.timeRestriction.start);
      const end = new Date(metadata.timeRestriction.end);
      
      if (now < start || now > end) {
        return false;
      }
    }

    // IP-based restrictions
    if (metadata.ipRestriction && metadata.userIp) {
      const allowedIPs = Array.isArray(metadata.ipRestriction) 
        ? metadata.ipRestriction 
        : [metadata.ipRestriction];
      
      if (!allowedIPs.includes(metadata.userIp)) {
        return false;
      }
    }

    // Device-based restrictions
    if (metadata.deviceRestriction && metadata.userDevice) {
      const allowedDevices = Array.isArray(metadata.deviceRestriction) 
        ? metadata.deviceRestriction 
        : [metadata.deviceRestriction];
      
      if (!allowedDevices.includes(metadata.userDevice)) {
        return false;
      }
    }

    // Business logic-based permissions
    if (metadata.businessRules) {
      return this.evaluateBusinessRules(user, resource, action, metadata.businessRules);
    }

    return true;
  }

  // Evaluate custom business rules
  private evaluateBusinessRules(
    user: User | AuthPayload, 
    resource: string, 
    action: string, 
    rules: any
  ): boolean {
    // Example business rules
    if (rules.maxOrderAmount && resource === 'orders' && action === 'create') {
      const userRole = user.role;
      const maxAmount = rules.maxOrderAmount[userRole];
      
      if (maxAmount && rules.orderAmount > maxAmount) {
        return false;
      }
    }

    if (rules.departmentAccess && resource === 'reports') {
      const userDepartment = (user as any).profile?.department;
      const allowedDepartments = rules.departmentAccess;
      
      if (!allowedDepartments.includes(userDepartment)) {
        return false;
      }
    }

    return true;
  }

  // Clear permission caches
  clearCache(): void {
    this.permissionCache.clear();
    this.rolePermissionCache.clear();
    console.log('🧹 Permission cache cleared');
  }

  // Clear cache for specific user
  clearUserCache(userId: string): void {
    const cacheKey = `user_${userId}`;
    this.permissionCache.delete(cacheKey);
    console.log(`🧹 Permission cache cleared for user: ${userId}`);
  }

  // Clear cache for specific role
  clearRoleCache(roleId: string): void {
    const cacheKey = `role_${roleId}`;
    this.rolePermissionCache.delete(cacheKey);
    console.log(`🧹 Permission cache cleared for role: ${roleId}`);
  }

  // Get permission statistics
  getPermissionStats(): {
    cacheSize: number;
    roleCacheSize: number;
    totalPermissions: number;
  } {
    return {
      cacheSize: this.permissionCache.size,
      roleCacheSize: this.rolePermissionCache.size,
      totalPermissions: Array.from(this.permissionCache.values())
        .reduce((sum, perms) => sum + perms.size, 0)
    };
  }

  // Export permissions for debugging
  exportUserPermissions(user: User | AuthPayload): {
    userId: string;
    role: string;
    permissions: string[];
    effectivePermissions: string[];
  } {
    const userId = user.user_id || (user as User).id;
    const permissions = Array.from(this.getUserPermissions(user));
    const effectivePermissions = Array.from(this.getEffectivePermissions(user));

    return {
      userId,
      role: user.role,
      permissions,
      effectivePermissions
    };
  }

  // Validate permission assignment
  validatePermissions(permissions: Permission[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const seenPermissions = new Set<string>();

    for (const permission of permissions) {
      const permissionKey = `${permission.resource}:${permission.action}`;
      
      if (seenPermissions.has(permissionKey)) {
        errors.push(`Duplicate permission: ${permissionKey}`);
      }
      seenPermissions.add(permissionKey);

      if (!permission.resource || !permission.action) {
        errors.push(`Invalid permission format: ${permissionKey}`);
      }

      if (permission.resource.includes(':') || permission.action.includes(':')) {
        errors.push(`Invalid characters in permission: ${permissionKey}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const permissionsService = new PermissionsService();