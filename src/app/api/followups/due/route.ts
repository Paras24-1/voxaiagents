import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Decode token to get user ID
    const authHeader = req.headers.get('authorization')
    let userId: string | null = null
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '')
      const { data } = await supabaseAdmin.auth.getUser(token)
      userId = data.user?.id || null
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile role
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .eq('org_id', orgId)
      .maybeSingle()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'

    // Fetch followups due now or within the last 24 hours that haven't been dismissed yet
    const nowIso = new Date().toISOString()
    const lookbackIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    let query = supabaseAdmin
      .from('leads')
      .select('id, conversation_id, phone_number, name, customer_name, followup_date, followup_notes, followup_notified, conversations(id, name, phone_number, assigned_to)')
      .eq('org_id', orgId)
      .not('followup_date', 'is', null)
      .lte('followup_date', nowIso)
      .gte('followup_date', lookbackIso)
      .eq('followup_notified', false)
      .order('followup_date', { ascending: false })
      .limit(20)

    const { data: leads, error } = await query

    if (error) throw error

    // Filter by assigned user if not admin
    let results = leads || []
    if (!isAdmin && userId) {
      results = results.filter((l: any) => {
        const conv = Array.isArray(l.conversations) ? l.conversations[0] : l.conversations
        // If conversation is assigned to this user, or if unassigned
        return conv?.assigned_to === userId || !conv?.assigned_to
      })
    }

    const formatted = results.map((l: any) => {
      const conv = Array.isArray(l.conversations) ? l.conversations[0] : l.conversations
      return {
        id: l.id,
        conversation_id: l.conversation_id || conv?.id || null,
        phone_number: l.phone_number || conv?.phone_number || '',
        name: l.name || l.customer_name || conv?.name || 'Lead',
        followup_date: l.followup_date,
        followup_notes: l.followup_notes || '',
        followup_notified: l.followup_notified
      }
    })

    return NextResponse.json(formatted)
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { lead_id, action } = body

    if (!lead_id) {
      return NextResponse.json({ error: 'lead_id is required' }, { status: 400 })
    }

    if (action === 'snooze_10m') {
      const snoozedDate = new Date(Date.now() + 10 * 60 * 1000).toISOString()
      const { error } = await supabaseAdmin
        .from('leads')
        .update({
          followup_date: snoozedDate,
          followup_notified: false
        })
        .eq('id', lead_id)
        .eq('org_id', orgId)

      if (error) throw error
      return NextResponse.json({ success: true, snoozed_until: snoozedDate })
    }

    // Default: dismiss / mark notified
    const { error } = await supabaseAdmin
      .from('leads')
      .update({
        followup_notified: true
      })
      .eq('id', lead_id)
      .eq('org_id', orgId)

    if (error) throw error
    return NextResponse.json({ success: true, dismissed: true })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
