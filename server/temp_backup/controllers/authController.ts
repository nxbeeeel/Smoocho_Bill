import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../types';
import { LoginRequest, AuthResponse, User } from '../types';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { username, password }: LoginRequest = req.body;

    if (!username || !password) {
      throw new AppError('Username and password are required', 400);
    }

    // For demo purposes, use hardcoded admin user
    // In production, this would query the database
    if (username === 'admin' && password === 'admin123') {
      const user: Omit<User, 'password_hash'> = {
        id: '1',
        username: 'admin',
        email: 'admin@smoocho.com',
        role: 'admin',
        permissions: [
          {
            id: '1',
            name: 'Full Access',
            resource: '*',
            action: 'manage',
            description: 'Full system access'
          }
        ],
        profile: {
          first_name: 'Admin',
          last_name: 'User',
          phone: '+1234567890',
          employee_id: 'ADMIN001'
        },
        is_active: true,
        is_locked: false,
        failed_login_attempts: 0,
        password_changed_at: new Date(),
        session_timeout_minutes: 480,
        must_change_password: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      const token = this.generateToken({
        userId: user.id,
        username: user.username,
        role: user.role,
        permissions: user.permissions,
        sessionId: `session_${Date.now()}`
      });

      const response: AuthResponse = {
        user,
        token,
        refresh_token: `refresh_${Date.now()}`,
        permissions: user.permissions
      };

      res.json({
        success: true,
        data: response,
        message: 'Login successful',
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new AppError('Invalid credentials', 401);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    // For now, registration is disabled in demo
    throw new AppError('Registration is currently disabled', 403);
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { token } = req.body;

    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const newToken = this.generateToken({
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      });

      res.json({
        success: true,
        data: { token: newToken },
        message: 'Token refreshed successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // In a production app, you might want to invalidate the token
    // For now, just send success response
    res.json({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  }

  private generateToken(payload: any): string {
    if (!process.env.JWT_SECRET) {
      throw new AppError('JWT secret not configured', 500);
    }

    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}