// Smoocho Bill POS - Products API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkShopAccess } from '@/lib/auth'
import { query } from '@/lib/database-server'

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { params } = await request
    const shopId = params.shopId

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    const result = await query(
      'SELECT * FROM products WHERE shop_id = $1 ORDER BY created_at DESC',
      [shopId]
    )

    return NextResponse.json(result.rows)

  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { params } = await request
    const shopId = params.shopId
    const productData = await request.json()

    const { name, price, category, description, image_url, is_active } = productData

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO products (shop_id, name, price, category, description, image_url, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [shopId, name, price, category, description, image_url, is_active !== false]
    )

    // TODO: Emit real-time update via WebSocket

    return NextResponse.json(result.rows[0], { status: 201 })

  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
