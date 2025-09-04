// Smoocho Bill POS - Product Detail API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkShopAccess } from '@/lib/auth'
import { query } from '@/lib/database-server'

export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    const { params } = await request
    const shopId = params.shopId
    const productId = params.productId
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

    const result = await query(
      `UPDATE products 
       SET name = $1, price = $2, category = $3, description = $4, image_url = $5, is_active = $6, updated_at = NOW() 
       WHERE id = $7 AND shop_id = $8 
       RETURNING *`,
      [name, price, category, description, image_url, is_active !== false, productId, shopId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // TODO: Emit real-time update via WebSocket

    return NextResponse.json(result.rows[0])

  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = requireAuth(async (request: NextRequest, user) => {
  try {
    const { params } = await request
    const shopId = params.shopId
    const productId = params.productId

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    const result = await query(
      'DELETE FROM products WHERE id = $1 AND shop_id = $2 RETURNING id',
      [productId, shopId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // TODO: Emit real-time update via WebSocket

    return NextResponse.json({ 
      success: true,
      message: 'Product deleted successfully' 
    })

  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})
