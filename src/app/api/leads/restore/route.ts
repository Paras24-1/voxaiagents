import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'
import { invalidateUnifiedCache } from '@/lib/osmoPhonebooks'
import { handleApiError } from '@/lib/apiErrors'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    let ids: string[] = []

    if (body.id) ids.push(body.id)
    if (Array.isArray(body.ids)) ids.push(...body.ids)
    ids = Array.from(new Set(ids.filter(Boolean)))

    if (ids.length === 0) {
      return NextResponse.json({ error: 'lead id or ids required to restore' }, { status: 400 })
    }

    const { data: leads, error: fetchErr } = await supabaseAdmin
      .from('leads')
      .select('id, metadata')
      .in('id', ids)
      .eq('org_id', orgId)

    if (fetchErr) throw fetchErr

    const now = new Date().toISOString()
    const updatePromises = (leads || []).map((l: any) => {
      let meta = l.metadata || {}
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta) } catch { meta = {} }
      }
      meta = {
        ...meta,
        is_deleted: false,
        deleted_at: null,
        restored_at: now
      }
      return supabaseAdmin
        .from('leads')
        .update({ metadata: meta })
        .eq('id', l.id)
        .eq('org_id', orgId)
    })

    await Promise.all(updatePromises)
    invalidateUnifiedCache(orgId)

    return NextResponse.json({ success: true, count: leads?.length || 0, restored_at: now })
  } catch (err: unknown) {
    return handleApiError('POST /api/leads/restore', err)
  }
}
