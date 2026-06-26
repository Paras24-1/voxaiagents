import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// 1. GET: Fetch all orders for the authenticated organization
export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API/Orders] Database query error:', error)
      throw error
    }

    return NextResponse.json(orders || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

// 2. POST: Create a new order with auto-generated reference number
export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { customerName, customerEmail, customerPhone, items, totalAmount } = await req.json()

    if (!customerName || !customerEmail || !items) {
      return NextResponse.json({ error: 'Missing required parameters: customerName, customerEmail, or items' }, { status: 400 })
    }

    // Generate unique sequential-like ORD reference
    const timestampSegment = Date.now().toString().slice(-6)
    const randomSegment = Math.floor(100 + Math.random() * 900)
    const referenceNumber = `ORD-${timestampSegment}-${randomSegment}`

    const { data: newOrder, error } = await supabaseAdmin
      .from('orders')
      .insert({
        org_id: orgId,
        reference_number: referenceNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone || null,
        items,
        total_amount: Number(totalAmount) || 0.00,
        status: 'placed'
      })
      .select()
      .single()

    if (error) {
      console.error('[API/Orders] Database insert error:', error)
      throw error
    }

    console.log(`[API/Orders] Successfully created order ${referenceNumber} for customer ${customerName}`)
    return NextResponse.json(newOrder)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
