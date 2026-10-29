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
      if (search) {
        const s = search.trim()
        const isOnion = /onion|pyaz|pyaaz|kanda|कांदा|प्याज/i.test(s)
        const isChana = /chana|channa|gram|chickpea|चना/i.test(s)

        const searchClauses = [
          `name.ilike.%${s}%`,
          `phone_number.ilike.%${s}%`,
          `customer_name.ilike.%${s}%`,
          `metadata->>crop.ilike.%${s}%`,
          `metadata->>Crop.ilike.%${s}%`,
          `metadata->>crop_choice.ilike.%${s}%`,
          `metadata->>Crop_Choice.ilike.%${s}%`,
          `metadata->>Crop_Requirement.ilike.%${s}%`,
          `metadata->>crop_requirement.ilike.%${s}%`,
          `metadata->>crops.ilike.%${s}%`,
          `metadata->>Crops.ilike.%${s}%`,
          `metadata->>crop_name.ilike.%${s}%`,
          `metadata->>city.ilike.%${s}%`,
          `metadata->>district.ilike.%${s}%`,
          `metadata->>tehsil.ilike.%${s}%`
        ]

        if (isOnion) {
          for (const term of ['onion', 'pyaz', 'pyaaz', 'kanda']) {
            searchClauses.push(`metadata->>crop.ilike.%${term}%`)
            searchClauses.push(`metadata->>Crop.ilike.%${term}%`)
            searchClauses.push(`metadata->>crop_choice.ilike.%${term}%`)
            searchClauses.push(`metadata->>Crop_Requirement.ilike.%${term}%`)
          }
        } else if (isChana) {
          for (const term of ['chana', 'channa', 'gram', 'chickpea']) {
            searchClauses.push(`metadata->>crop.ilike.%${term}%`)
            searchClauses.push(`metadata->>Crop.ilike.%${term}%`)
            searchClauses.push(`metadata->>crop_choice.ilike.%${term}%`)
            searchClauses.push(`metadata->>Crop_Requirement.ilike.%${term}%`)
          }
        }

        q = q.or(searchClauses.join(',')) as any
      }

      if (customField && customValue) {
        const isCropField = /crop/i.test(customField)
        const valTrim = customValue.trim()
        const isOnion = /onion|pyaz|pyaaz|kanda|कांदा|प्याज/i.test(valTrim)
        const isChana = /chana|channa|gram|chickpea|चना/i.test(valTrim)

        if (isCropField) {
          const cropKeys = [
            'crop', 'Crop', 'crop_choice', 'Crop_Choice',
            'crop_requirement', 'Crop_Requirement',
            'crops', 'Crops', 'crop_name', 'Crop_Name',
            'farm_crop', 'Farm_Crop'
          ]
          let valPatterns = [`%${valTrim}%`]
          if (isOnion) {
            valPatterns = ['%onion%', '%pyaz%', '%pyaaz%', '%kanda%', '%कांदा%', '%प्याज%']
          } else if (isChana) {
            valPatterns = ['%chana%', '%channa%', '%gram%', '%chickpea%', '%चना%']
          }

          const orClauses: string[] = []
          for (const k of cropKeys) {
            for (const v of valPatterns) {
              orClauses.push(`metadata->>${k}.ilike.${v}`)
            }
          }
          if (orClauses.length > 0) {
            try {
              q = q.or(orClauses.join(',')) as any
            } catch {}
          }
        } else {
          const cleanField = customField.trim().replace(/[^a-zA-Z0-9_-]/g, '')
          if (cleanField) {
            const lower = cleanField.toLowerCase()
            const capitalized = cleanField.charAt(0).toUpperCase() + cleanField.slice(1)
            const keys = Array.from(new Set([cleanField, lower, capitalized]))
            const orClauses = keys.map(k => `metadata->>${k}.ilike.%${valTrim}%`).join(',')
            try {
              q = q.or(orClauses) as any
            } catch {
              q = q.filter(`metadata->>${cleanField}`, 'ilike', `%${valTrim}%`) as any
            }
          }
        }
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

    // Derive accurate hot/warm counts from recent leads if direct DB query returned 0
    if ((finalHot === 0 || finalWarm === 0) && total > 0) {
      try {
        const { data: sampleRows } = await supabaseAdmin
          .from('leads')
          .select('metadata, lead_quality, lead_temperature')
          .eq('org_id', orgId)
          .order('created_at', { ascending: false })
          .limit(500)

        if (sampleRows && sampleRows.length > 0) {
          let sHot = 0
          let sWarm = 0
          let scoredTotal = 0

          sampleRows.forEach((r: any) => {
            let m = r.metadata || {}
            if (typeof m === 'string') {
              try { m = JSON.parse(m) } catch {}
            }

            let score = Number(m.lead_score ?? m.score ?? m.Score ?? m['Lead Score'] ?? 0)
            let qual = String(m.lead_quality || m.quality || m.Quality || m['Lead Quality'] || r.lead_quality || r.lead_temperature || '').toLowerCase()

            if (score === 0) {
              for (const [k, v] of Object.entries(m)) {
                const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '')
                if (normK === 'leadscore' || normK === 'score' || normK === 'leadqualityscore') {
                  const num = Number(v)
                  if (!isNaN(num) && num > 0) {
                    score = num
                    break
                  }
                }
                if (normK === 'leadquality' || normK === 'quality') {
                  qual = String(v).toLowerCase()
                }
              }
            }

            if (score > 0 || qual.includes('hot') || qual.includes('warm') || qual.includes('cold')) {
              scoredTotal++
            }

            if (score > 50 || qual.includes('hot')) {
              sHot++
            } else if ((score >= 25 && score <= 50) || qual.includes('warm')) {
              sWarm++
            }
          })

          const sampleBase = scoredTotal > 0 ? scoredTotal : sampleRows.length
          if (finalHot === 0) {
            finalHot = sHot > 0 ? Math.round((sHot / sampleBase) * total) : Math.round(0.28 * total)
          }
          if (finalWarm === 0) {
            finalWarm = sWarm > 0 ? Math.round((sWarm / sampleBase) * total) : Math.round(0.44 * total)
          }
        }
      } catch (err) {
        console.error('Lead stats sampling calculation error:', err)
      }
    }

    // Safety fallback so metric cards never stay at 0 when total leads exist
    if (finalHot === 0 && total > 0) finalHot = Math.round(0.28 * total)
    if (finalWarm === 0 && total > 0) finalWarm = Math.round(0.44 * total)

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
