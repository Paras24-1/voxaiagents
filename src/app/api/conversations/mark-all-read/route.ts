import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isStaffEmployee = profile.role !== 'owner' && profile.role !== 'admin'
    let query = supabaseAdmin
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('org_id', profile.orgId)

    if (isStaffEmployee) {
      query = query.eq('assigned_to', profile.userId)
    }

    const { error } = await query

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
