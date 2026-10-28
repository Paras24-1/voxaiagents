import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  try {
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, orgId, role } = profile
    const isStaffEmployee = role !== 'owner' && role !== 'admin'

    const searchParams = new URL(req.url).searchParams
    const stage = searchParams.get('stage') || ''
    const quality = searchParams.get('quality') || ''
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''
    const leadType = searchParams.get('lead_type') || ''
    const geographicState = searchParams.get('state') || ''
    const assignedToday = searchParams.get('assigned_today') === 'true'

    // Pagination — DB-side, no full scan
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const from = (page - 1) * limit
    // Fetch one extra to determine hasMore without a COUNT query
    const fetchLimit = limit + 1

    let staffConvIds: string[] | null = null
    if (isStaffEmployee) {
      const { data: convs } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('org_id', orgId)
        .eq('assigned_to', userId)
      staffConvIds = (convs || []).map(c => c.id)
      if (staffConvIds.length === 0) {
        return NextResponse.json({ data: [], hasMore: false })
      }
    }

    // ----------------------------------------------------------------
    // Build the query — push ALL filters to the DB, never fetch all rows
    // Direct single-table query on leads for maximum PostgreSQL query plan efficiency
    // ----------------------------------------------------------------
    const selectFields = 'id, conversation_id, phone_number, name, customer_name, created_at, updated_at, stage, lead_quality, lead_score, lead_temperature, lead_type, osmo_category, notes, followup_date, followup_notes, metadata, org_id'

    let query = supabaseAdmin
      .from('leads')
      .select(selectFields)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .range(from, from + fetchLimit - 1)

    // Staff employees only see leads belonging to their assigned conversations
    if (staffConvIds) {
      query = query.in('conversation_id', staffConvIds) as any
    }

    // Push stage filter to DB
    if (stage) query = query.eq('stage', stage) as any

    // Push lead_type / osmo_category filter to DB
    if (leadType && leadType !== 'all') {
      if (leadType === 'unfiltered') {
        query = query.or('osmo_category.eq.unfiltered,osmo_category.is.null') as any
      } else {
        query = query.eq('osmo_category', leadType) as any
      }
    }

    // Push date range filters to DB
    if (startDate) query = query.gte('created_at', startDate) as any
    if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`) as any

    // If assignedToday filter is enabled, filter by today's date
    if (assignedToday) {
      const startOfTodayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      query = query.gte('updated_at', startOfTodayIso) as any
    }

    // Push text search to DB (ilike on name OR phone_number OR customer_name)
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%,customer_name.ilike.%${search}%`) as any
    }

    const { data, error } = await query
    if (error) throw error

    const rows = data || []
    const hasMore = rows.length > limit
    const slicedRows = hasMore ? rows.slice(0, limit) : rows

    // Lightweight enrichment — no heavy loops, no additional DB calls
    const enrichedLeads = slicedRows.map((l: any) => {
      let parsedMetadata: Record<string, any> = {}
      try {
        if (typeof l.metadata === 'string' && l.metadata.trim()) {
          parsedMetadata = JSON.parse(l.metadata)
        } else if (l.metadata && typeof l.metadata === 'object' && !Array.isArray(l.metadata)) {
          parsedMetadata = l.metadata
        }
        if (typeof parsedMetadata !== 'object' || Array.isArray(parsedMetadata) || parsedMetadata === null) {
          parsedMetadata = {}
        }
      } catch {
        parsedMetadata = {}
      }

      // Quality derived from score — applies client-side quality filter too
      const score = Number(l.lead_score ?? parsedMetadata.lead_score ?? 0)
      let q = (l.lead_quality || parsedMetadata.lead_quality || parsedMetadata.lead_temperature || l.lead_temperature || 'cold').toLowerCase()
      if (score >= 70) q = 'hot'
      else if (score >= 40) q = 'warm'
      else if (score > 0) q = 'cold'

      // Apply quality filter (done in JS since it's derived)
      if (quality && q !== quality.toLowerCase()) return null

      // Apply geographic state filter (stored in metadata)
      if (geographicState) {
        const leadState = (parsedMetadata.state || l.state || '').trim()
        if (leadState.toLowerCase() !== geographicState.toLowerCase()) return null
      }

      const stg = l.stage || parsedMetadata.stage || 'new'
      const displayName = l.name || l.customer_name || parsedMetadata.Name || parsedMetadata.name || parsedMetadata.contact_person || 'Unknown'
      const assignedAt = l.updated_at || l.created_at

      return {
        ...l,
        ...parsedMetadata,
        id: l.id,
        conversation_id: l.conversation_id || null,
        phone_number: l.phone_number,
        name: displayName,
        customer_name: l.customer_name,
        created_at: l.created_at,
        updated_at: l.updated_at,
        assigned_at: assignedAt,
        stage: stg,
        lead_quality: q,
        lead_temperature: q.toUpperCase(),
        lead_score: score,
        lead_type: l.osmo_category || 'unfiltered',
        osmo_category: l.osmo_category,
        notes: l.notes,
        followup_date: l.followup_date,
        followup_notes: l.followup_notes,
        org_id: l.org_id,
        metadata: { ...parsedMetadata, lead_type: l.osmo_category || 'unfiltered', category: l.osmo_category || 'unfiltered' },
        state: parsedMetadata.state,
        city: parsedMetadata.city,
        source: parsedMetadata.source || l.source || 'Direct'
      }
    }).filter(Boolean)

    return NextResponse.json({ data: enrichedLeads, hasMore })
  } catch (err: unknown) {
    console.error('[leads-list]', err)
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
