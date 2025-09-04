// Smoocho Bill POS - Profile API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { query } from '@/lib/database-server'

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const result = await query(
      `SELECT u.*, s.name as shop_name 
       FROM users u 
       LEFT JOIN shops s ON u.shop_id = s.id 
       WHERE u.id = $1`,
      [user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = result.rows[0]

    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      shopId: userData.shop_id,
      shopName: userData.shop_name,
      lastLogin: userData.last_login,
      createdAt: userData.created_at,
    })

  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
