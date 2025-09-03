import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { 
  User, 
  LoginRequest, 
  AuthPayload, 
  SessionInfo, 
  JWTTokens, 
  RefreshTokenRequest,
  ChangePasswordRequest,
  SecurityEvent,
  AccessAttempt,
  UserActivity,
  PasswordPolicy,
  PinPolicy
} from '../types';

/**
 * Authentication Service
 * 
 * Handles secure authentication with:
 * - JWT token generation and validation
 * - Password and PIN authentication
 * - Session management
 * - Security event logging
 * - Account lockout protection
 * - Token refresh mechanism
 */
export class AuthService {
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private tokenExpiry: number = 24 * 60 * 60; // 24 hours
  private refreshTokenExpiry: number = 30 * 24 * 60 * 60; // 30 days
  private saltRounds: number = 12;
  
  // Security policies
  private passwordPolicy: PasswordPolicy = {
    min_length: 8,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_special_chars: true,
    max_age_days: 90,
    password_history: 5,
    lockout_attempts: 5,
    lockout_duration_minutes: 30
  };

  private pinPolicy: PinPolicy = {
    length: 4,
    allow_sequential: false,
    allow_repeated: false,
    max_age_days: 180,
    lockout_attempts: 3,
    lockout_duration_minutes: 15
  };

  // In-memory stores (in production, use Redis or database)
  private activeSessions: Map<string, SessionInfo> = new Map();
  private refreshTokens: Map<string, { user_id: string; expires_at: Date }> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private accessAttempts: AccessAttempt[] = [];
  private userActivities: UserActivity[] = [];

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'smoocho-bill-secret-key-2025';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'smoocho-bill-refresh-secret-2025';
    
    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 60 * 60 * 1000); // Every hour
    
    console.log('🔐 Authentication service initialized');
  }

  // Generate secure JWT tokens
  async generateTokens(user: User, deviceInfo?: any): Promise<JWTTokens> {
    const sessionId = this.generateSessionId();
    
    const payload: AuthPayload = {
      user_id: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions.map(p => `${p.resource}:${p.action}`),
      session_id: sessionId,
      device_id: deviceInfo?.device_name || 'unknown',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.tokenExpiry
    };

    const accessToken = jwt.sign(payload, this.jwtSecret);
    const refreshToken = this.generateRefreshToken();
    
    // Store refresh token
    this.refreshTokens.set(refreshToken, {
      user_id: user.id,
      expires_at: new Date(Date.now() + this.refreshTokenExpiry * 1000)
    });

    // Create session info
    const sessionInfo: SessionInfo = {
      id: sessionId,
      user_id: user.id,
      device_info: deviceInfo || {
        user_agent: 'Unknown',
        ip_address: '0.0.0.0',
        device_type: 'desktop'
      },
      is_active: true,
      created_at: new Date(),
      last_activity: new Date(),
      expires_at: new Date(Date.now() + user.session_timeout_minutes * 60 * 1000)
    };

    this.activeSessions.set(sessionId, sessionInfo);

    console.log(`🔑 Generated tokens for user: ${user.username}`);
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: this.tokenExpiry,
      token_type: 'Bearer'
    };
  }

  // Verify and decode JWT token
  async verifyToken(token: string): Promise<AuthPayload | null> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as AuthPayload;
      
      // Check if session is still active
      const session = this.activeSessions.get(payload.session_id);
      if (!session || !session.is_active || session.expires_at < new Date()) {
        console.warn(`❌ Session expired or inactive: ${payload.session_id}`);
        return null;
      }

      // Update last activity
      session.last_activity = new Date();
      this.activeSessions.set(payload.session_id, session);

      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshRequest: RefreshTokenRequest): Promise<JWTTokens | null> {
    const tokenData = this.refreshTokens.get(refreshRequest.refresh_token);
    
    if (!tokenData || tokenData.expires_at < new Date()) {
      console.warn('❌ Invalid or expired refresh token');
      return null;
    }

    // Get user data (in production, fetch from database)
    const user = await this.getUserById(tokenData.user_id);
    if (!user || !user.is_active) {
      console.warn(`❌ User not found or inactive: ${tokenData.user_id}`);
      return null;
    }

    // Generate new tokens
    const newTokens = await this.generateTokens(user, refreshRequest.device_info);
    
    // Remove old refresh token
    this.refreshTokens.delete(refreshRequest.refresh_token);
    
    console.log(`🔄 Refreshed tokens for user: ${user.username}`);
    return newTokens;
  }

  // Authenticate user with username/password
  async authenticateWithPassword(loginRequest: LoginRequest): Promise<{ user: User; tokens: JWTTokens } | null> {
    if (!loginRequest.password) {
      throw new Error('Password is required');
    }

    return this.performAuthentication(loginRequest, 'password');
  }

  // Authenticate user with PIN
  async authenticateWithPin(loginRequest: LoginRequest): Promise<{ user: User; tokens: JWTTokens } | null> {
    if (!loginRequest.pin) {
      throw new Error('PIN is required');
    }

    return this.performAuthentication(loginRequest, 'pin');
  }

  // Common authentication logic
  private async performAuthentication(
    loginRequest: LoginRequest, 
    authType: 'password' | 'pin'
  ): Promise<{ user: User; tokens: JWTTokens } | null> {
    const startTime = Date.now();
    
    try {
      // Check for account lockout
      if (await this.isAccountLocked(loginRequest.username)) {
        await this.logAccessAttempt(loginRequest, false, 'Account locked');
        throw new Error('Account is locked due to multiple failed attempts');
      }

      // Get user (in production, fetch from database)
      const user = await this.getUserByUsername(loginRequest.username);
      if (!user) {
        await this.logAccessAttempt(loginRequest, false, 'User not found');
        throw new Error('Invalid credentials');
      }

      if (!user.is_active) {
        await this.logAccessAttempt(loginRequest, false, 'Account disabled');
        throw new Error('Account is disabled');
      }

      // Verify credentials
      let isValidCredential = false;
      if (authType === 'password' && user.password_hash) {
        isValidCredential = await bcrypt.compare(loginRequest.password!, user.password_hash);
      } else if (authType === 'pin' && user.pin_hash) {
        isValidCredential = await bcrypt.compare(loginRequest.pin!, user.pin_hash);
      }

      if (!isValidCredential) {
        await this.incrementFailedAttempts(user.id);
        await this.logAccessAttempt(loginRequest, false, 'Invalid credentials');
        await this.logSecurityEvent({
          event_type: 'login_failure',
          user_id: user.id,
          username: user.username,
          ip_address: loginRequest.device_info?.ip_address || '0.0.0.0',
          user_agent: loginRequest.device_info?.user_agent || 'Unknown',
          details: { auth_type: authType, reason: 'Invalid credentials' },
          severity: 'medium'
        });
        throw new Error('Invalid credentials');
      }

      // Reset failed attempts on successful login
      await this.resetFailedAttempts(user.id);

      // Generate tokens
      const tokens = await this.generateTokens(user, loginRequest.device_info);

      // Log successful login
      await this.logAccessAttempt(loginRequest, true);
      await this.logSecurityEvent({
        event_type: 'login_success',
        user_id: user.id,
        username: user.username,
        ip_address: loginRequest.device_info?.ip_address || '0.0.0.0',
        user_agent: loginRequest.device_info?.user_agent || 'Unknown',
        details: { auth_type: authType, session_id: this.getSessionIdFromToken(tokens.access_token) },
        severity: 'low'
      });

      await this.logUserActivity({
        user_id: user.id,
        action: 'login',
        details: { auth_type: authType },
        ip_address: loginRequest.device_info?.ip_address || '0.0.0.0',
        user_agent: loginRequest.device_info?.user_agent || 'Unknown'
      });

      // Update last login
      user.last_login = new Date();
      user.last_activity = new Date();

      const duration = Date.now() - startTime;
      console.log(`✅ User authenticated: ${user.username} (${authType}) in ${duration}ms`);

      return { user, tokens };
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Authentication failed for ${loginRequest.username} (${authType}) in ${duration}ms:`, error.message);
      throw error;
    }
  }

  // Logout user and invalidate session
  async logout(sessionId: string, userId?: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    
    if (session) {
      session.is_active = false;
      this.activeSessions.delete(sessionId);
      
      if (userId) {
        await this.logSecurityEvent({
          event_type: 'logout',
          user_id: userId,
          ip_address: session.device_info.ip_address,
          user_agent: session.device_info.user_agent,
          details: { session_id: sessionId },
          severity: 'low'
        });

        await this.logUserActivity({
          user_id: userId,
          action: 'logout',
          details: { session_id: sessionId },
          ip_address: session.device_info.ip_address,
          user_agent: session.device_info.user_agent
        });
      }
      
      console.log(`👋 User logged out, session invalidated: ${sessionId}`);
    }
  }

  // Change user password
  async changePassword(userId: string, changeRequest: ChangePasswordRequest): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current credentials if not force change
    if (!changeRequest.force_change) {
      if (changeRequest.current_password && user.password_hash) {
        const isValid = await bcrypt.compare(changeRequest.current_password, user.password_hash);
        if (!isValid) {
          throw new Error('Current password is incorrect');
        }
      } else if (changeRequest.current_pin && user.pin_hash) {
        const isValid = await bcrypt.compare(changeRequest.current_pin, user.pin_hash);
        if (!isValid) {
          throw new Error('Current PIN is incorrect');
        }
      }
    }

    // Validate new credentials
    if (changeRequest.new_password) {
      this.validatePassword(changeRequest.new_password);
      user.password_hash = await bcrypt.hash(changeRequest.new_password, this.saltRounds);
      user.password_changed_at = new Date();
    }

    if (changeRequest.new_pin) {
      this.validatePin(changeRequest.new_pin);
      user.pin_hash = await bcrypt.hash(changeRequest.new_pin, this.saltRounds);
    }

    user.must_change_password = false;
    user.updated_at = new Date();

    // Log security event
    await this.logSecurityEvent({
      event_type: 'password_change',
      user_id: userId,
      username: user.username,
      ip_address: '0.0.0.0', // Should be passed from request
      user_agent: 'System',
      details: { 
        password_changed: !!changeRequest.new_password,
        pin_changed: !!changeRequest.new_pin,
        force_change: changeRequest.force_change
      },
      severity: 'medium'
    });

    console.log(`🔑 Password/PIN changed for user: ${user.username}`);
  }

  // Validate password against policy
  private validatePassword(password: string): void {
    const policy = this.passwordPolicy;
    
    if (password.length < policy.min_length) {
      throw new Error(`Password must be at least ${policy.min_length} characters long`);
    }

    if (policy.require_uppercase && !/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (policy.require_lowercase && !/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (policy.require_numbers && !/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (policy.require_special_chars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }
  }

  // Validate PIN against policy
  private validatePin(pin: string): void {
    const policy = this.pinPolicy;
    
    if (pin.length !== policy.length) {
      throw new Error(`PIN must be exactly ${policy.length} digits`);
    }

    if (!/^\d+$/.test(pin)) {
      throw new Error('PIN must contain only numbers');
    }

    if (!policy.allow_sequential) {
      // Check for sequential patterns (1234, 4321)
      const isSequential = this.isSequentialPin(pin);
      if (isSequential) {
        throw new Error('PIN cannot contain sequential numbers');
      }
    }

    if (!policy.allow_repeated) {
      // Check for repeated patterns (1111, 1212)
      const isRepeated = this.isRepeatedPin(pin);
      if (isRepeated) {
        throw new Error('PIN cannot contain repeated patterns');
      }
    }
  }

  // Check if PIN is sequential
  private isSequentialPin(pin: string): boolean {
    const digits = pin.split('').map(Number);
    
    // Check ascending sequence
    let isAscending = true;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i - 1] + 1) {
        isAscending = false;
        break;
      }
    }
    
    // Check descending sequence
    let isDescending = true;
    for (let i = 1; i < digits.length; i++) {
      if (digits[i] !== digits[i - 1] - 1) {
        isDescending = false;
        break;
      }
    }
    
    return isAscending || isDescending;
  }

  // Check if PIN has repeated patterns
  private isRepeatedPin(pin: string): boolean {
    // Check if all digits are the same
    if (new Set(pin).size === 1) {
      return true;
    }
    
    // Check for patterns like 1212, 1313
    if (pin.length === 4) {
      return pin[0] === pin[2] && pin[1] === pin[3];
    }
    
    return false;
  }

  // Session management
  async getActiveSession(sessionId: string): Promise<SessionInfo | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.user_id === userId);
    
    for (const session of userSessions) {
      session.is_active = false;
      this.activeSessions.delete(session.id);
    }
    
    console.log(`🚫 Invalidated ${userSessions.length} sessions for user: ${userId}`);
  }

  // Account lockout management
  private async isAccountLocked(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user) return false;
    
    if (user.is_locked) {
      // Check if lockout has expired
      if (user.locked_at && user.locked_at < new Date(Date.now() - this.passwordPolicy.lockout_duration_minutes * 60 * 1000)) {
        await this.unlockAccount(user.id);
        return false;
      }
      return true;
    }
    
    return false;
  }

  private async incrementFailedAttempts(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) return;
    
    user.failed_login_attempts++;
    
    if (user.failed_login_attempts >= this.passwordPolicy.lockout_attempts) {
      await this.lockAccount(userId, 'Multiple failed login attempts');
    }
  }

  private async resetFailedAttempts(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) return;
    
    user.failed_login_attempts = 0;
  }

  private async lockAccount(userId: string, reason: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) return;
    
    user.is_locked = true;
    user.locked_at = new Date();
    user.lock_reason = reason;
    
    await this.logSecurityEvent({
      event_type: 'account_locked',
      user_id: userId,
      username: user.username,
      ip_address: '0.0.0.0',
      user_agent: 'System',
      details: { reason, failed_attempts: user.failed_login_attempts },
      severity: 'high'
    });
    
    console.log(`🔒 Account locked: ${user.username} - ${reason}`);
  }

  private async unlockAccount(userId: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) return;
    
    user.is_locked = false;
    user.failed_login_attempts = 0;
    user.locked_at = undefined;
    user.locked_by = undefined;
    user.lock_reason = undefined;
    
    console.log(`🔓 Account unlocked: ${user.username}`);
  }

  // Logging methods
  private async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date(),
      resolved: false
    };
    
    this.securityEvents.push(securityEvent);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(-1000);
    }
  }

  private async logAccessAttempt(loginRequest: LoginRequest, success: boolean, failureReason?: string): Promise<void> {
    const accessAttempt: AccessAttempt = {
      id: this.generateId(),
      username: loginRequest.username,
      ip_address: loginRequest.device_info?.ip_address || '0.0.0.0',
      user_agent: loginRequest.device_info?.user_agent || 'Unknown',
      success,
      failure_reason: failureReason,
      timestamp: new Date()
    };
    
    this.accessAttempts.push(accessAttempt);
    
    // Keep only last 1000 attempts
    if (this.accessAttempts.length > 1000) {
      this.accessAttempts = this.accessAttempts.slice(-1000);
    }
  }

  private async logUserActivity(activity: Omit<UserActivity, 'id' | 'timestamp'>): Promise<void> {
    const userActivity: UserActivity = {
      ...activity,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    this.userActivities.push(userActivity);
    
    // Keep only last 1000 activities
    if (this.userActivities.length > 1000) {
      this.userActivities = this.userActivities.slice(-1000);
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private generateId(): string {
    return `${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private getSessionIdFromToken(token: string): string {
    try {
      const payload = jwt.decode(token) as AuthPayload;
      return payload.session_id;
    } catch {
      return 'unknown';
    }
  }

  private cleanupExpiredSessions(): void {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.expires_at < now || !session.is_active) {
        this.activeSessions.delete(sessionId);
        cleanedCount++;
      }
    }
    
    // Cleanup expired refresh tokens
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.expires_at < now) {
        this.refreshTokens.delete(token);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired sessions and tokens`);
    }
  }

  // Mock database methods (replace with actual database calls)
  private async getUserByUsername(username: string): Promise<User | null> {
    // This should fetch from database
    // Returning mock data for now
    return null;
  }

  private async getUserById(userId: string): Promise<User | null> {
    // This should fetch from database
    // Returning mock data for now
    return null;
  }

  // Getters for security data
  getSecurityEvents(limit?: number): SecurityEvent[] {
    return limit ? this.securityEvents.slice(-limit) : this.securityEvents;
  }

  getAccessAttempts(limit?: number): AccessAttempt[] {
    return limit ? this.accessAttempts.slice(-limit) : this.accessAttempts;
  }

  getUserActivities(userId?: string, limit?: number): UserActivity[] {
    let activities = userId 
      ? this.userActivities.filter(a => a.user_id === userId)
      : this.userActivities;
    
    return limit ? activities.slice(-limit) : activities;
  }

  getActiveSessions(): SessionInfo[] {
    return Array.from(this.activeSessions.values());
  }

  // Policy management
  updatePasswordPolicy(policy: Partial<PasswordPolicy>): void {
    this.passwordPolicy = { ...this.passwordPolicy, ...policy };
    console.log('🔧 Password policy updated:', policy);
  }

  updatePinPolicy(policy: Partial<PinPolicy>): void {
    this.pinPolicy = { ...this.pinPolicy, ...policy };
    console.log('🔧 PIN policy updated:', policy);
  }

  getPasswordPolicy(): PasswordPolicy {
    return { ...this.passwordPolicy };
  }

  getPinPolicy(): PinPolicy {
    return { ...this.pinPolicy };
  }
}

// Export singleton instance
export const authService = new AuthService();