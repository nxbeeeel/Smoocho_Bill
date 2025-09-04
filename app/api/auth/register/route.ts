// Smoocho Bill POS - Register API Route
import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, generateToken } from '@/lib/auth'
import { query, transaction } from '@/lib/database-server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, shopName } = await request.json()

    if (!email || !password || !name || !shopName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create shop and user in transaction
    const result = await transaction(async (client) => {
      // Create shop first
      const shopResult = await client.query(
        'INSERT INTO shops (name) VALUES ($1) RETURNING id',
        [shopName]
      )
      const shopId = shopResult.rows[0].id

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, name, role, shop_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, email, name, role, shop_id`,
        [email, passwordHash, name, 'owner', shopId]
      )

      // Update shop owner
      await client.query(
        'UPDATE shops SET owner_id = $1 WHERE id = $2',
        [userResult.rows[0].id, shopId]
      )

      return {
        user: userResult.rows[0],
        shopId,
        shopName,
      }
    })

    // Generate JWT token
    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      shopId: result.shopId,
    })

    // Return user data and token
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        shopId: result.shopId,
        shopName: result.shopName,
      },
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
