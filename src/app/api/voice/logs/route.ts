import { NextRequest, NextResponse } from 'next/server'
import { supabaseVoice, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!supabaseVoice) {
      return NextResponse.json({ error: 'Voice service is not configured' }, { status: 501 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await supabaseVoice
      .from('call_logs')
      .select('*, agents(name)')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (err: any) {
    const error = err?.message || err?.details || String(err) || 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
