// Smoocho Bill POS - Order Detail API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkShopAccess } from '@/lib/auth'
import { query } from '@/lib/database-server'

export const PUT = requireAuth(async (request: NextRequest, user, { params }: { params: { shopId: string; orderId: string } }) => {
  try {
    const { shopId, orderId } = params
    const updateData = await request.json()

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    // Build dynamic update query
    const fields = []
    const values = []
    let paramCount = 1

    Object.keys(updateData).forEach(key => {
      if (key === 'items') {
        fields.push(`${key} = $${paramCount}`)
        values.push(JSON.stringify(updateData[key]))
      } else {
        fields.push(`${key} = $${paramCount}`)
        values.push(updateData[key])
      }
      paramCount++
    })

    values.push(orderId, shopId)

    const queryText = `UPDATE orders SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} AND shop_id = $${paramCount + 1} RETURNING *`
    
    const result = await query(queryText, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0])

  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const DELETE = requireAuth(async (request: NextRequest, user, { params }: { params: { shopId: string; orderId: string } }) => {
  try {
    const { shopId, orderId } = params

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    const result = await query(
      'DELETE FROM orders WHERE id = $1 AND shop_id = $2 RETURNING id',
      [orderId, shopId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      message: 'Order deleted successfully' 
    })

  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})