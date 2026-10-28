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
    const search = searchParams.get('search') || ''
    const startDate = searchParams.get('start_date') || ''
    const endDate = searchParams.get('end_date') || ''
    const assignedToday = searchParams.get('assigned_today') === 'true'
    const customField = searchParams.get('custom_field') || ''
    const customValue = searchParams.get('custom_value') || ''

    let staffConvIds: string[] | null = null
    if (isStaffEmployee) {
      const { data: convs } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('org_id', orgId)
        .eq('assigned_to', userId)
      staffConvIds = (convs || []).map(c => c.id)
      if (staffConvIds.length === 0) {
        return NextResponse.json({
          total: 0,
          osmo_dealer: 0,
          dealer: 0,
          customer: 0,
          unfiltered: 0,
          hot: 0,
          warm: 0,
          followups: 0
        })
      }
    }

    // Helper to build lightweight DB count queries using PostgREST HEAD requests
    const buildCount = (applyFilter?: (q: any) => any) => {
      let q = supabaseAdmin
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)

      if (staffConvIds) q = q.in('conversation_id', staffConvIds) as any
      if (startDate) q = q.gte('created_at', startDate) as any
      if (endDate) q = q.lte('created_at', `${endDate}T23:59:59.999Z`) as any
      if (assignedToday) {
        const startOfTodayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
        q = q.gte('created_at', startOfTodayIso) as any
      }
      if (customField && customValue) {
        const cleanField = customField.trim().replace(/[^a-zA-Z0-9_-]/g, '')
        if (cleanField) {
          try {
            q = q.filter(`metadata->>${cleanField}`, 'ilike', `%${customValue.trim()}%`) as any
          } catch {}
        }
      }
      if (search) {
        q = q.or(`name.ilike.%${search}%,phone_number.ilike.%${search}%,customer_name.ilike.%${search}%`) as any
      }
      if (applyFilter) q = applyFilter(q)
      return q
    }

    const getHotCount = async (): Promise<number> => {
      // Strategy 1: JSONB lead_score > 50
      try {
        const { count, error } = await buildCount(q => q.filter('metadata->lead_score', 'gt', 50))
        if (!error && count && count > 0) return count
      } catch {}

      // Strategy 2: Combined JSONB / column text search for hot
      try {
        const { count, error } = await buildCount(q => q.or('lead_temperature.ilike.%hot%,metadata->>lead_quality.ilike.%hot%,metadata->>lead_temperature.ilike.%hot%'))
        if (!error && count && count > 0) return count
      } catch {}

      // Strategy 3: Direct column check
      try {
        const { count, error } = await buildCount(q => q.ilike('lead_temperature', '%hot%'))
        if (!error && count !== null) return count
      } catch {}

      return 0
    }

    const getWarmCount = async (): Promise<number> => {
      // Strategy 1: JSONB lead_score 25 to 50
      try {
        const { count, error } = await buildCount(q => q.filter('metadata->lead_score', 'gte', 25).filter('metadata->lead_score', 'lte', 50))
        if (!error && count && count > 0) return count
      } catch {}

      // Strategy 2: Combined JSONB / column text search for warm
      try {
        const { count, error } = await buildCount(q => q.or('lead_temperature.ilike.%warm%,metadata->>lead_quality.ilike.%warm%,metadata->>lead_temperature.ilike.%warm%'))
        if (!error && count && count > 0) return count
      } catch {}

      // Strategy 3: Direct column check
      try {
        const { count, error } = await buildCount(q => q.ilike('lead_temperature', '%warm%'))
        if (!error && count !== null) return count
      } catch {}

      return 0
    }

    // Execute count queries concurrently in parallel at DB level
    const [
      { count: totalCount },
      { count: osmoDealerCount },
      { count: dealerCount },
      { count: customerCount },
      { count: unfilteredCount },
      { count: followupCount },
      hotCount,
      warmCount
    ] = await Promise.all([
      buildCount(),
      buildCount(q => q.eq('osmo_category', 'osmo_dealer')),
      buildCount(q => q.eq('osmo_category', 'dealer')),
      buildCount(q => q.eq('osmo_category', 'customer')),
      buildCount(q => q.or('osmo_category.eq.unfiltered,osmo_category.is.null')),
      buildCount(q => q.not('followup_date', 'is', null)),
      getHotCount(),
      getWarmCount()
    ])

    const total = totalCount || 0
    const osmo_dealer = osmoDealerCount || 0
    const dealer = dealerCount || 0
    const customer = customerCount || 0
    const unfiltered = unfilteredCount ?? Math.max(0, total - (osmo_dealer + dealer + customer))

    return NextResponse.json({
      total,
      osmo_dealer,
      dealer,
      customer,
      unfiltered,
      hot: hotCount || 0,
      warm: warmCount || 0,
      followups: followupCount || 0
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, max-age=0, must-revalidate'
      }
    })
  } catch (err: unknown) {
    console.error('[leads-stats]', err)
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
