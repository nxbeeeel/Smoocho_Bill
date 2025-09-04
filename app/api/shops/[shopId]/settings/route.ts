// Smoocho Bill POS - Shop Settings API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkShopAccess } from '@/lib/auth'
import { query } from '@/lib/database-server'

export const GET = requireAuth(async (request: NextRequest, user, { params }: { params: { shopId: string } }) => {
  try {
    const { shopId } = params

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    const result = await query(
      'SELECT settings FROM shops WHERE id = $1',
      [shopId]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Shop not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(result.rows[0].settings || {})

  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const PUT = requireAuth(async (request: NextRequest, user, { params }: { params: { shopId: string } }) => {
  try {
    const { shopId } = params
    const { settings } = await request.json()

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    await query(
      'UPDATE shops SET settings = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(settings), shopId]
    )

    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully' 
    })

  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})