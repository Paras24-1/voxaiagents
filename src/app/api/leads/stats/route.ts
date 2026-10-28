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
      // 1. Regex match on metadata->>lead_score (> 50: 51-100)
      try {
        const { count, error } = await buildCount(q => 
          q.filter('metadata->>lead_score', 'match', '^\\s*(5[1-9]|[6-9][0-9]|100)(\\.[0-9]+)?\\s*$')
        )
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 2. Regex match on metadata->>score (> 50)
      try {
        const { count, error } = await buildCount(q => 
          q.filter('metadata->>score', 'match', '^\\s*(5[1-9]|[6-9][0-9]|100)(\\.[0-9]+)?\\s*$')
        )
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 3. metadata->>lead_quality ILIKE %hot%
      try {
        const { count, error } = await buildCount(q => q.ilike('metadata->>lead_quality', '%hot%'))
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 4. metadata->>lead_temperature ILIKE %hot%
      try {
        const { count, error } = await buildCount(q => q.ilike('metadata->>lead_temperature', '%hot%'))
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 5. Physical column lead_quality ILIKE %hot%
      try {
        const { count, error } = await buildCount(q => q.ilike('lead_quality', '%hot%'))
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 6. Physical column lead_temperature ILIKE %hot%
      try {
        const { count, error } = await buildCount(q => q.ilike('lead_temperature', '%hot%'))
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      return 0
    }

    const getWarmCount = async (): Promise<number> => {
      // 1. Regex match on metadata->>lead_score (25 to 50)
      try {
        const { count, error } = await buildCount(q => 
          q.filter('metadata->>lead_score', 'match', '^\\s*(2[5-9]|[3-4][0-9]|50)(\\.[0-9]+)?\\s*$')
        )
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 2. Regex match on metadata->>score (25 to 50)
      try {
        const { count, error } = await buildCount(q => 
          q.filter('metadata->>score', 'match', '^\\s*(2[5-9]|[3-4][0-9]|50)(\\.[0-9]+)?\\s*$')
        )
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 3. metadata->>lead_quality ILIKE %warm%
      try {
        const { count, error } = await buildCount(q => q.ilike('metadata->>lead_quality', '%warm%'))
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 4. metadata->>lead_temperature ILIKE %warm%
      try {
        const { count, error } = await buildCount(q => q.ilike('metadata->>lead_temperature', '%warm%'))
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 5. Physical column lead_quality ILIKE %warm%
      try {
        const { count, error } = await buildCount(q => q.ilike('lead_quality', '%warm%'))
        if (!error && typeof count === 'number' && count > 0) return count
      } catch {}

      // 6. Physical column lead_temperature ILIKE %warm%
      try {
        const { count, error } = await buildCount(q => q.ilike('lead_temperature', '%warm%'))
        if (!error && typeof count === 'number' && count > 0) return count
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

    let finalHot = hotCount || 0
    let finalWarm = warmCount || 0

    // If direct DB queries yielded 0 hot or warm leads despite having leads in DB,
    // sample 300 rows from the organization to derive the authoritative dataset-wide count
    if ((finalHot === 0 || finalWarm === 0) && total > 0) {
      try {
        const { data: sampleRows } = await supabaseAdmin
          .from('leads')
          .select('metadata, lead_quality, lead_temperature')
          .eq('org_id', orgId)
          .limit(300)

        if (sampleRows && sampleRows.length > 0) {
          let sHot = 0
          let sWarm = 0
          sampleRows.forEach((r: any) => {
            let m = r.metadata || {}
            if (typeof m === 'string') {
              try { m = JSON.parse(m) } catch {}
            }
            const score = Number(m.lead_score ?? m.score ?? 0)
            const qual = String(m.lead_quality || m.lead_temperature || r.lead_quality || r.lead_temperature || '').toLowerCase()
            if (score > 50 || qual.includes('hot')) {
              sHot++
            } else if ((score >= 25 && score <= 50) || qual.includes('warm')) {
              sWarm++
            }
          })

          if (finalHot === 0 && sHot > 0) {
            finalHot = Math.round((sHot / sampleRows.length) * total)
          }
          if (finalWarm === 0 && sWarm > 0) {
            finalWarm = Math.round((sWarm / sampleRows.length) * total)
          }
        }
      } catch (err) {
        console.error('Lead stats sampling calculation error:', err)
      }
    }

    return NextResponse.json({
      total,
      osmo_dealer,
      dealer,
      customer,
      unfiltered,
      hot: finalHot,
      warm: finalWarm,
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
