import bcrypt from 'bcryptjs';
import { 
  User, 
  UserProfile, 
  Role, 
  Permission, 
  CreateUserRequest, 
  UpdateUserRequest,
  UserManagementFilter,
  BulkUserAction,
  AuditLog,
  PasswordPolicy,
  PinPolicy
} from '../types';

/**
 * User Management Service
 * 
 * Handles CRUD operations for users with:
 * - User creation and updates
 * - Role and permission management
 * - Profile management
 * - Bulk operations
 * - Audit logging
 * - Data validation
 */
export class UserManagementService {
  private saltRounds: number = 12;
  
  // In-memory stores (in production, use database)
  private users: Map<string, User> = new Map();
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private auditLogs: AuditLog[] = [];

  constructor() {
    this.initializeDefaultRolesAndPermissions();
    this.createDefaultAdminUser();
    console.log('👥 User management service initialized');
  }

  // Initialize default roles and permissions
  private async initializeDefaultRolesAndPermissions(): Promise<void> {
    // Default permissions
    const defaultPermissions: Permission[] = [
      // User management
      { id: 'user_create', name: 'Create User', resource: 'users', action: 'create', description: 'Create new users', is_system: true },
      { id: 'user_read', name: 'View Users', resource: 'users', action: 'read', description: 'View user details', is_system: true },
      { id: 'user_update', name: 'Update User', resource: 'users', action: 'update', description: 'Update user information', is_system: true },
      { id: 'user_delete', name: 'Delete User', resource: 'users', action: 'delete', description: 'Delete users', is_system: true },
      
      // Product management
      { id: 'product_create', name: 'Create Product', resource: 'products', action: 'create', description: 'Create new products', is_system: true },
      { id: 'product_read', name: 'View Products', resource: 'products', action: 'read', description: 'View product catalog', is_system: true },
      { id: 'product_update', name: 'Update Product', resource: 'products', action: 'update', description: 'Update product information', is_system: true },
      { id: 'product_delete', name: 'Delete Product', resource: 'products', action: 'delete', description: 'Delete products', is_system: true },
      
      // Inventory management
      { id: 'inventory_create', name: 'Create Inventory', resource: 'inventory', action: 'create', description: 'Add inventory items', is_system: true },
      { id: 'inventory_read', name: 'View Inventory', resource: 'inventory', action: 'read', description: 'View inventory levels', is_system: true },
      { id: 'inventory_update', name: 'Update Inventory', resource: 'inventory', action: 'update', description: 'Update inventory levels', is_system: true },
      { id: 'inventory_delete', name: 'Delete Inventory', resource: 'inventory', action: 'delete', description: 'Remove inventory items', is_system: true },
      
      // Order management
      { id: 'order_create', name: 'Create Order', resource: 'orders', action: 'create', description: 'Process new orders', is_system: true },
      { id: 'order_read', name: 'View Orders', resource: 'orders', action: 'read', description: 'View order history', is_system: true },
      { id: 'order_update', name: 'Update Order', resource: 'orders', action: 'update', description: 'Modify orders', is_system: true },
      { id: 'order_cancel', name: 'Cancel Order', resource: 'orders', action: 'cancel', description: 'Cancel orders', is_system: true },
      
      // Reports
      { id: 'reports_read', name: 'View Reports', resource: 'reports', action: 'read', description: 'Access reports', is_system: true },
      { id: 'reports_export', name: 'Export Reports', resource: 'reports', action: 'export', description: 'Export reports', is_system: true },
      
      // Settings and configuration
      { id: 'settings_read', name: 'View Settings', resource: 'settings', action: 'read', description: 'View system settings', is_system: true },
      { id: 'settings_update', name: 'Update Settings', resource: 'settings', action: 'update', description: 'Modify system settings', is_system: true },
      
      // Promotions
      { id: 'promotion_create', name: 'Create Promotion', resource: 'promotions', action: 'create', description: 'Create discount codes', is_system: true },
      { id: 'promotion_read', name: 'View Promotions', resource: 'promotions', action: 'read', description: 'View promotions', is_system: true },
      { id: 'promotion_update', name: 'Update Promotion', resource: 'promotions', action: 'update', description: 'Modify promotions', is_system: true },
      { id: 'promotion_delete', name: 'Delete Promotion', resource: 'promotions', action: 'delete', description: 'Remove promotions', is_system: true }
    ];

    defaultPermissions.forEach(permission => {
      this.permissions.set(permission.id, permission);
    });

    // Default roles
    const adminRole: Role = {
      id: 'admin',
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: defaultPermissions,
      is_system: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const cashierPermissions = defaultPermissions.filter(p => 
      p.resource === 'orders' || 
      p.resource === 'reports' && p.action === 'read' ||
      p.resource === 'products' && p.action === 'read' ||
      p.resource === 'inventory' && p.action === 'read'
    );

    const cashierRole: Role = {
      id: 'cashier',
      name: 'Cashier',
      description: 'Limited access for billing and basic reports',
      permissions: cashierPermissions,
      is_system: true,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    this.roles.set(adminRole.id, adminRole);
    this.roles.set(cashierRole.id, cashierRole);

    console.log(`✅ Initialized ${defaultPermissions.length} permissions and ${this.roles.size} roles`);
  }

  // Create default admin user
  private async createDefaultAdminUser(): Promise<void> {
    const adminUser: User = {
      id: 'admin_001',
      username: 'admin',
      email: 'admin@smoocho.com',
      password_hash: await bcrypt.hash('admin123!', this.saltRounds),
      pin_hash: await bcrypt.hash('1234', this.saltRounds),
      role: 'admin',
      permissions: Array.from(this.permissions.values()),
      profile: {
        first_name: 'System',
        last_name: 'Administrator',
        display_name: 'Admin',
        department: 'Management',
        position: 'System Administrator'
      },
      is_active: true,
      is_locked: false,
      failed_login_attempts: 0,
      session_timeout_minutes: 60,
      must_change_password: false,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: 'system'
    };

    this.users.set(adminUser.id, adminUser);
    console.log('👤 Default admin user created (username: admin, password: admin123!, PIN: 1234)');
  }

  // Create new user
  async createUser(request: CreateUserRequest, createdBy: string): Promise<User> {
    // Validate request
    await this.validateCreateUserRequest(request);

    // Check if username already exists
    const existingUser = this.getUserByUsername(request.username);
    if (existingUser) {
      throw new Error(`Username '${request.username}' already exists`);
    }

    // Check if email already exists
    const existingEmail = this.getUserByEmail(request.email);
    if (existingEmail) {
      throw new Error(`Email '${request.email}' already exists`);
    }

    // Get role
    const role = this.roles.get(request.role);
    if (!role) {
      throw new Error(`Role '${request.role}' not found`);
    }

    // Generate user ID
    const userId = this.generateUserId();

    // Hash password and PIN
    let passwordHash: string | undefined;
    let pinHash: string | undefined;

    if (request.password) {
      passwordHash = await bcrypt.hash(request.password, this.saltRounds);
    }

    if (request.pin) {
      pinHash = await bcrypt.hash(request.pin, this.saltRounds);
    }

    // Create user
    const user: User = {
      id: userId,
      username: request.username,
      email: request.email,
      password_hash: passwordHash,
      pin_hash: pinHash,
      role: request.role,
      permissions: request.permissions || role.permissions,
      profile: {
        ...request.profile,
        display_name: request.profile.display_name || `${request.profile.first_name} ${request.profile.last_name}`
      },
      is_active: true,
      is_locked: false,
      failed_login_attempts: 0,
      session_timeout_minutes: request.session_timeout_minutes || 60,
      must_change_password: request.must_change_password || false,
      created_at: new Date(),
      updated_at: new Date(),
      created_by: createdBy
    };

    this.users.set(user.id, user);

    // Log audit
    await this.logAudit({
      user_id: createdBy,
      action: 'create_user',
      resource_type: 'users',
      resource_id: user.id,
      new_values: { username: user.username, email: user.email, role: user.role },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`👤 User created: ${user.username} (${user.role})`);
    return user;
  }

  // Update user
  async updateUser(userId: string, request: UpdateUserRequest, updatedBy: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldValues = {
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      profile: { ...user.profile }
    };

    // Update fields
    if (request.email !== undefined) {
      // Check if email already exists for another user
      const existingUser = this.getUserByEmail(request.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error(`Email '${request.email}' already exists`);
      }
      user.email = request.email;
    }

    if (request.role !== undefined) {
      const role = this.roles.get(request.role);
      if (!role) {
        throw new Error(`Role '${request.role}' not found`);
      }
      user.role = request.role;
      // Update permissions based on new role if not explicitly provided
      if (!request.permissions) {
        user.permissions = role.permissions;
      }
    }

    if (request.permissions !== undefined) {
      user.permissions = request.permissions;
    }

    if (request.profile !== undefined) {
      user.profile = { ...user.profile, ...request.profile };
      if (!user.profile.display_name) {
        user.profile.display_name = `${user.profile.first_name} ${user.profile.last_name}`;
      }
    }

    if (request.is_active !== undefined) {
      user.is_active = request.is_active;
    }

    if (request.session_timeout_minutes !== undefined) {
      user.session_timeout_minutes = request.session_timeout_minutes;
    }

    if (request.must_change_password !== undefined) {
      user.must_change_password = request.must_change_password;
    }

    user.updated_at = new Date();

    // Log audit
    await this.logAudit({
      user_id: updatedBy,
      action: 'update_user',
      resource_type: 'users',
      resource_id: userId,
      old_values: oldValues,
      new_values: {
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        profile: user.profile
      },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`👤 User updated: ${user.username}`);
    return user;
  }

  // Delete user
  async deleteUser(userId: string, deletedBy: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.is_system) {
      throw new Error('Cannot delete system user');
    }

    this.users.delete(userId);

    // Log audit
    await this.logAudit({
      user_id: deletedBy,
      action: 'delete_user',
      resource_type: 'users',
      resource_id: userId,
      old_values: { username: user.username, email: user.email, role: user.role },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`👤 User deleted: ${user.username}`);
  }

  // Get user by ID
  getUserById(userId: string): User | null {
    return this.users.get(userId) || null;
  }

  // Get user by username
  getUserByUsername(username: string): User | null {
    return Array.from(this.users.values()).find(u => u.username === username) || null;
  }

  // Get user by email
  getUserByEmail(email: string): User | null {
    return Array.from(this.users.values()).find(u => u.email === email) || null;
  }

  // Get users with filtering
  getUsers(filter?: UserManagementFilter): User[] {
    let users = Array.from(this.users.values());

    if (filter) {
      if (filter.role) {
        users = users.filter(u => u.role === filter.role);
      }

      if (filter.is_active !== undefined) {
        users = users.filter(u => u.is_active === filter.is_active);
      }

      if (filter.is_locked !== undefined) {
        users = users.filter(u => u.is_locked === filter.is_locked);
      }

      if (filter.last_login_from) {
        users = users.filter(u => u.last_login && u.last_login >= filter.last_login_from!);
      }

      if (filter.last_login_to) {
        users = users.filter(u => u.last_login && u.last_login <= filter.last_login_to!);
      }

      if (filter.created_from) {
        users = users.filter(u => u.created_at >= filter.created_from!);
      }

      if (filter.created_to) {
        users = users.filter(u => u.created_at <= filter.created_to!);
      }

      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        users = users.filter(u => 
          u.username.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm) ||
          u.profile.first_name.toLowerCase().includes(searchTerm) ||
          u.profile.last_name.toLowerCase().includes(searchTerm) ||
          (u.profile.display_name && u.profile.display_name.toLowerCase().includes(searchTerm))
        );
      }
    }

    return users;
  }

  // Bulk user operations
  async performBulkAction(action: BulkUserAction): Promise<{ success: number; failed: number; errors: string[] }> {
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (const userId of action.user_ids) {
      try {
        switch (action.action) {
          case 'activate':
            await this.updateUser(userId, { is_active: true }, action.performed_by);
            break;
          case 'deactivate':
            await this.updateUser(userId, { is_active: false }, action.performed_by);
            break;
          case 'unlock':
            await this.unlockUser(userId, action.performed_by);
            break;
          case 'delete':
            await this.deleteUser(userId, action.performed_by);
            break;
          case 'reset_password':
            await this.resetUserPassword(userId, action.performed_by);
            break;
          case 'assign_role':
            if (action.parameters?.role) {
              await this.updateUser(userId, { role: action.parameters.role }, action.performed_by);
            } else {
              throw new Error('Role parameter required for assign_role action');
            }
            break;
          default:
            throw new Error(`Unknown bulk action: ${action.action}`);
        }
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`User ${userId}: ${error.message}`);
      }
    }

    console.log(`📦 Bulk action ${action.action}: ${results.success} success, ${results.failed} failed`);
    return results;
  }

  // Lock user account
  async lockUser(userId: string, reason: string, lockedBy: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.is_locked = true;
    user.locked_at = new Date();
    user.locked_by = lockedBy;
    user.lock_reason = reason;
    user.updated_at = new Date();

    await this.logAudit({
      user_id: lockedBy,
      action: 'lock_user',
      resource_type: 'users',
      resource_id: userId,
      new_values: { is_locked: true, lock_reason: reason },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`🔒 User locked: ${user.username} - ${reason}`);
  }

  // Unlock user account
  async unlockUser(userId: string, unlockedBy: string): Promise<void> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.is_locked = false;
    user.failed_login_attempts = 0;
    user.locked_at = undefined;
    user.locked_by = undefined;
    user.lock_reason = undefined;
    user.updated_at = new Date();

    await this.logAudit({
      user_id: unlockedBy,
      action: 'unlock_user',
      resource_type: 'users',
      resource_id: userId,
      new_values: { is_locked: false },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`🔓 User unlocked: ${user.username}`);
  }

  // Reset user password
  async resetUserPassword(userId: string, resetBy: string): Promise<string> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Generate temporary password
    const tempPassword = this.generateTemporaryPassword();
    user.password_hash = await bcrypt.hash(tempPassword, this.saltRounds);
    user.must_change_password = true;
    user.password_changed_at = new Date();
    user.updated_at = new Date();

    await this.logAudit({
      user_id: resetBy,
      action: 'reset_password',
      resource_type: 'users',
      resource_id: userId,
      new_values: { must_change_password: true },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`🔑 Password reset for user: ${user.username}`);
    return tempPassword;
  }

  // Role management
  async createRole(role: Omit<Role, 'id' | 'created_at' | 'updated_at'>, createdBy: string): Promise<Role> {
    const roleId = this.generateRoleId();
    const newRole: Role = {
      ...role,
      id: roleId,
      created_at: new Date(),
      updated_at: new Date()
    };

    this.roles.set(roleId, newRole);

    await this.logAudit({
      user_id: createdBy,
      action: 'create_role',
      resource_type: 'roles',
      resource_id: roleId,
      new_values: { name: newRole.name, permissions: newRole.permissions.map(p => p.id) },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`👥 Role created: ${newRole.name}`);
    return newRole;
  }

  async updateRole(roleId: string, updates: Partial<Role>, updatedBy: string): Promise<Role> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.is_system && (updates.permissions || updates.name)) {
      throw new Error('Cannot modify system role permissions or name');
    }

    const oldValues = { name: role.name, permissions: role.permissions.map(p => p.id) };

    Object.assign(role, updates, { updated_at: new Date() });

    await this.logAudit({
      user_id: updatedBy,
      action: 'update_role',
      resource_type: 'roles',
      resource_id: roleId,
      old_values: oldValues,
      new_values: { name: role.name, permissions: role.permissions.map(p => p.id) },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`👥 Role updated: ${role.name}`);
    return role;
  }

  async deleteRole(roleId: string, deletedBy: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.is_system) {
      throw new Error('Cannot delete system role');
    }

    // Check if any users have this role
    const usersWithRole = this.getUsers({ role: roleId });
    if (usersWithRole.length > 0) {
      throw new Error(`Cannot delete role: ${usersWithRole.length} users are assigned to this role`);
    }

    this.roles.delete(roleId);

    await this.logAudit({
      user_id: deletedBy,
      action: 'delete_role',
      resource_type: 'roles',
      resource_id: roleId,
      old_values: { name: role.name },
      ip_address: '0.0.0.0',
      user_agent: 'System'
    });

    console.log(`👥 Role deleted: ${role.name}`);
  }

  getRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  getRoleById(roleId: string): Role | null {
    return this.roles.get(roleId) || null;
  }

  // Permission management
  getPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  getPermissionById(permissionId: string): Permission | null {
    return this.permissions.get(permissionId) || null;
  }

  // Validation
  private async validateCreateUserRequest(request: CreateUserRequest): Promise<void> {
    if (!request.username || request.username.length < 3) {
      throw new Error('Username must be at least 3 characters long');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(request.username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    if (!request.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) {
      throw new Error('Valid email address is required');
    }

    if (!request.profile.first_name || !request.profile.last_name) {
      throw new Error('First name and last name are required');
    }

    if (request.password) {
      this.validatePassword(request.password);
    }

    if (request.pin) {
      this.validatePin(request.pin);
    }

    if (!request.password && !request.pin) {
      throw new Error('Either password or PIN must be provided');
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  private validatePin(pin: string): void {
    if (!/^\d{4}$/.test(pin)) {
      throw new Error('PIN must be exactly 4 digits');
    }
    if (new Set(pin).size === 1) {
      throw new Error('PIN cannot have all same digits');
    }
  }

  // Utility methods
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRoleId(): string {
    return `role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Audit logging
  private async logAudit(audit: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: AuditLog = {
      ...audit,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.auditLogs.push(auditLog);

    // Keep only last 1000 logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs = this.auditLogs.slice(-1000);
    }
  }

  getAuditLogs(limit?: number): AuditLog[] {
    return limit ? this.auditLogs.slice(-limit) : this.auditLogs;
  }

  getUserCount(): number {
    return this.users.size;
  }

  getActiveUserCount(): number {
    return Array.from(this.users.values()).filter(u => u.is_active).length;
  }

  getLockedUserCount(): number {
    return Array.from(this.users.values()).filter(u => u.is_locked).length;
  }
}

// Export singleton instance
export const userManagementService = new UserManagementService();