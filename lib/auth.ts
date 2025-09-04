// Smoocho Bill POS - Authentication Utilities
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'manager' | 'cashier'
  shopId: string
  shopName?: string
}

export interface AuthToken {
  id: string
  email: string
  shopId: string
  role: string
  iat: number
  exp: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(user: Omit<User, 'shopName'>): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      shopId: user.shopId,
      role: user.role,
    },
    JWT_SECRET as string,
    { expiresIn: JWT_EXPIRES_IN as string }
  )
}

// Verify JWT token
export function verifyToken(token: string): AuthToken | null {
  try {
    return jwt.verify(token, JWT_SECRET as string) as AuthToken
  } catch (error) {
    return null
  }
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}

// Get user from request
export function getUserFromRequest(request: NextRequest): AuthToken | null {
  const token = getTokenFromRequest(request)
  if (!token) return null
  return verifyToken(token)
}

// Middleware for protected routes
export function requireAuth(handler: (request: NextRequest, user: AuthToken, context?: any) => Promise<Response>) {
  return async (request: NextRequest, context?: any) => {
    const user = getUserFromRequest(request)
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    return handler(request, user, context)
  }
}

// Middleware for role-based access
export function requireRole(allowedRoles: string[]) {
  return function(handler: (request: NextRequest, user: AuthToken, context?: any) => Promise<Response>) {
    return async (request: NextRequest, context?: any) => {
      const user = getUserFromRequest(request)
      
      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { 
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      if (!allowedRoles.includes(user.role)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { 
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }

      return handler(request, user, context)
    }
  }
}

// Check if user has access to shop
export async function checkShopAccess(userId: string, shopId: string): Promise<boolean> {
  const { query } = await import('./database-server')
  
  try {
    const result = await query(
      'SELECT id FROM users WHERE id = $1 AND shop_id = $2',
      [userId, shopId]
    )
    return result.rows.length > 0
  } catch (error) {
    console.error('Shop access check error:', error)
    return false
  }
}

// Generate order number
export async function generateOrderNumber(shopId: string): Promise<string> {
  const { query } = await import('./database-server')
  
  try {
    const result = await query(
      `SELECT COUNT(*) + 1 as count 
       FROM orders 
       WHERE shop_id = $1 
       AND DATE(created_at) = CURRENT_DATE`,
      [shopId]
    )
    
    const count = result.rows[0].count
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return `ORD-${date}-${count.toString().padStart(4, '0')}`
  } catch (error) {
    console.error('Order number generation error:', error)
    throw error
  }
}