import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

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

    // Fetch followups for the organization
    let query = supabaseAdmin
      .from('leads')
      .select('*, conversations:conversation_id!inner(id, name, phone_number, assigned_to)')
      .eq('org_id', orgId)
      .not('followup_date', 'is', null)

    if (!isAdmin) {
      query = query.eq('conversations.assigned_to', userId)
    }

    const { data, error } = await query.order('followup_date', { ascending: true })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
