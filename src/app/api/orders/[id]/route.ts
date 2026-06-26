import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'
import { sendOrderStatusNotification } from '@/lib/email'

export const dynamic = 'force-dynamic'

// 1. PATCH: Update order status stage and trigger notifications
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status } = await req.json()
    if (!status) {
      return NextResponse.json({ error: 'Missing required status parameter' }, { status: 400 })
    }

    // First fetch original order to get details and verify ownership
    const { data: order, error: fetchError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', params.id)
      .eq('org_id', orgId)
      .single()

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 })
    }

    // Update status in the database
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError || !updatedOrder) {
      console.error('[API/Orders/PATCH] Failed to update status in DB:', updateError)
      throw updateError
    }

    // Fetch n8n Webhook URL from organization_settings
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('n8n_webhook_url')
      .eq('org_id', orgId)
      .maybeSingle()

    // Trigger notification async (fire-and-forget so API stays fast)
    sendOrderStatusNotification({
      customerName: updatedOrder.customer_name,
      customerEmail: updatedOrder.customer_email,
      referenceNumber: updatedOrder.reference_number,
      status: updatedOrder.status,
      items: updatedOrder.items,
      totalAmount: updatedOrder.total_amount
    }, settings?.n8n_webhook_url).catch(err => {
      console.error('[API/Orders/PATCH] Async notification failed:', err)
    })

    return NextResponse.json(updatedOrder)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

// 2. DELETE: Remove/Cancel an order
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', params.id)
      .eq('org_id', orgId)

    if (error) {
      console.error('[API/Orders/DELETE] Failed to delete order:', error)
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
