import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, supabaseVoiceAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('agent_id')
    if (!agentId) return NextResponse.json({ error: 'agent_id required' }, { status: 400 })

    const { data: versions, error } = await supabaseAdmin
      .from('script_versions')
      .select('*')
      .eq('agent_id', agentId)
      .order('version', { ascending: false })

    if (!error && versions) {
      return NextResponse.json(versions)
    }

    if (supabaseVoiceAdmin) {
      const { data: vVers } = await supabaseVoiceAdmin
        .from('script_versions')
        .select('*')
        .eq('agent_id', agentId)
        .order('version', { ascending: false })
      if (vVers) return NextResponse.json(vVers)
    }

    return NextResponse.json([])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
