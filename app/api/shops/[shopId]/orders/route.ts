// Smoocho Bill POS - Orders API Route
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, checkShopAccess, generateOrderNumber } from '@/lib/auth'
import { query } from '@/lib/database-server'

export const GET = requireAuth(async (request: NextRequest, user, { params }: { params: { shopId: string } }) => {
  try {
    const { shopId } = params
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const offset = (page - 1) * limit

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    let queryText = 'SELECT * FROM orders WHERE shop_id = $1'
    const queryParams: (string | number)[] = [shopId]
    let paramCount = 2

    if (startDate && endDate) {
      queryText += ` AND created_at BETWEEN $${paramCount} AND $${paramCount + 1}`
      queryParams.push(startDate, endDate)
      paramCount += 2
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    queryParams.push(limit, offset)

    const result = await query(queryText, queryParams)

    return NextResponse.json(result.rows)

  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})

export const POST = requireAuth(async (request: NextRequest, user, { params }: { params: { shopId: string } }) => {
  try {
    const { shopId } = params
    const orderData = await request.json()

    const {
      items,
      subtotal,
      tax,
      discount,
      discount_type,
      total,
      payment_method,
      payment_status,
      customer_name,
      customer_phone,
      order_type,
      delivery_address,
      delivery_charge,
      notes
    } = orderData

    // Check if user has access to this shop
    const hasAccess = await checkShopAccess(user.id, shopId)
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this shop' },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!items || !subtotal || !total) {
      return NextResponse.json(
        { error: 'Items, subtotal, and total are required' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = await generateOrderNumber(shopId)

    const result = await query(
      `INSERT INTO orders (
        shop_id, order_number, items, subtotal, tax, discount, discount_type, 
        total, payment_method, payment_status, cashier_id, customer_name, 
        customer_phone, order_type, delivery_address, delivery_charge, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) 
      RETURNING *`,
      [
        shopId, orderNumber, JSON.stringify(items), subtotal, tax, discount, discount_type,
        total, payment_method, payment_status, user.id, customer_name,
        customer_phone, order_type, delivery_address, delivery_charge, notes
      ]
    )

    return NextResponse.json(result.rows[0], { status: 201 })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
})