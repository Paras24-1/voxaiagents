import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { conversation_id, assigned_to } = await req.json()

    if (!conversation_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current user (admin/owner)
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let adminId = null
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      adminId = user?.id
    }

    // Update conversation (verify tenancy with org_id)
    const { error: convError } = await supabaseAdmin
      .from('conversations')
      .update({
        assigned_to: assigned_to || null,
        assignment_status: assigned_to ? 'assigned' : 'unassigned'
      })
      .eq('id', conversation_id)
      .eq('org_id', orgId)

    if (convError) throw convError

    // Upsert or delete assignment record
    if (assigned_to) {
      const { error: assignError } = await supabaseAdmin
        .from('conversation_assignments')
        .upsert({
          conversation_id,
          org_id: orgId,
          assigned_to,
          assigned_by: adminId,
          status: 'active',
          assigned_at: new Date().toISOString()
        }, { onConflict: 'conversation_id' })

      if (assignError) throw assignError

      // Log assignment
      await supabaseAdmin
        .from('assignment_logs')
        .insert({
          conversation_id,
          org_id: orgId,
          user_id: adminId || assigned_to,
          action: 'assigned',
          details: `Assigned to employee`
        })
    } else {
      // Unassign
      await supabaseAdmin
        .from('conversation_assignments')
        .delete()
        .eq('conversation_id', conversation_id)
        .eq('org_id', orgId)

      await supabaseAdmin
        .from('assignment_logs')
        .insert({
          conversation_id,
          org_id: orgId,
          user_id: adminId,
          action: 'unassigned',
          details: 'Removed assignment'
        })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[assignment]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
