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
    const customField = searchParams.get('custom_field') || ''
    const customValue = searchParams.get('custom_value') || ''
    const distinctField = searchParams.get('distinct_field') || ''

    // Return distinct values for a custom metadata key across recent leads
    if (distinctField) {
      const cleanField = distinctField.trim().toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '')
      if (cleanField) {
        try {
          const { data } = await supabaseAdmin
            .from('leads')
            .select('metadata')
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(1000)

          const valSet = new Set<string>()
          const targetNorm = cleanField.replace(/[^a-z0-9]/g, '')

          data?.forEach((r: any) => {
            let m = r.metadata
            if (typeof m === 'string') {
              try { m = JSON.parse(m) } catch {}
            }
            if (m && typeof m === 'object') {
              for (const [k, v] of Object.entries(m)) {
                const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '')
                if (normK === targetNorm || normK.includes(targetNorm) || targetNorm.includes(normK) || (targetNorm.includes('crop') && normK.includes('crop'))) {
                  if (v !== null && v !== undefined) {
                    const str = String(v).trim()
                    if (str && str.length < 60 && str !== 'null' && str !== 'undefined') {
                      valSet.add(str)
                    }
                  }
                }
              }
            }
          })
          return NextResponse.json({ values: Array.from(valSet).sort((a, b) => a.localeCompare(b)) })
        } catch {
          return NextResponse.json({ values: [] })
        }
      }
    }

    // Pagination — DB-side, strictly 50 items per page
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100)
    const from = (page - 1) * limit
    // Fetch one extra to determine hasMore without an extra count query
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
    // Safely query leads using '*' so missing schema columns never crash.
    // Join only necessary fields from conversations for stage and assignment.
    // ----------------------------------------------------------------
    let query = supabaseAdmin
      .from('leads')
      .select('*, conversations(id, stage, name, assigned_to, updated_at)')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .range(from, from + fetchLimit - 1)

    // Staff employees only see leads belonging to their assigned conversations
    if (staffConvIds) {
      query = query.in('conversation_id', staffConvIds) as any
    }

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

    // If assignedToday filter is active, filter by created_at of today
    if (assignedToday) {
      const startOfTodayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
      query = query.gte('created_at', startOfTodayIso) as any
    }

    // Push text search to DB (name, phone_number, customer_name, and metadata fields)
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

      query = query.or(searchClauses.join(',')) as any
    }

    // Custom tenant metadata filter (e.g. crop_choice, city, district, etc.)
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
            query = query.or(orClauses.join(',')) as any
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
            query = query.or(orClauses) as any
          } catch {
            query = query.filter(`metadata->>${cleanField}`, 'ilike', `%${valTrim}%`) as any
          }
        }
      }
    }

    const { data, error } = await query
    if (error) {
      console.error('[leads-list query error]:', error)
      throw error
    }

    const rows = data || []
    const hasMore = rows.length > limit
    const slicedRows = hasMore ? rows.slice(0, limit) : rows

    // Lightweight enrichment
    const enrichedLeads = slicedRows.map((l: any) => {
      const c = Array.isArray(l.conversations) ? l.conversations[0] || {} : l.conversations || {}
      const p = l.phone_number || c.phone_number

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

      // Quality derived from score (0-25: COLD, 25-50: WARM, >50: HOT)
      const score = Number(l.lead_score ?? parsedMetadata.lead_score ?? 0)
      let q = (l.lead_quality || parsedMetadata.lead_quality || parsedMetadata.lead_temperature || l.lead_temperature || 'cold').toLowerCase()
      if (score > 50) q = 'hot'
      else if (score >= 25) q = 'warm'
      else q = 'cold'

      // Apply quality filter
      if (quality && q !== quality.toLowerCase()) return null

      // Apply geographic state filter
      if (geographicState) {
        const leadState = (parsedMetadata.state || l.state || '').trim()
        if (leadState.toLowerCase() !== geographicState.toLowerCase()) return null
      }

      // Apply dynamic custom tenant filter (e.g. crop_choice, city, etc.)
      if (customField && customValue) {
        const targetK = customField.toLowerCase().replace(/[^a-z0-9]/g, '')
        const targetV = customValue.toLowerCase().trim()
        const isCropFilter = targetK.includes('crop')
        const isOnion = /onion|pyaz|pyaaz|kanda|कांदा|प्याज/i.test(targetV)
        const isChana = /chana|channa|gram|chickpea|चना/i.test(targetV)
        let matched = false

        for (const [k, v] of Object.entries(parsedMetadata)) {
          const normK = k.toLowerCase().replace(/[^a-z0-9]/g, '')
          if (normK === targetK || normK.includes(targetK) || targetK.includes(normK) || (isCropFilter && (normK.includes('crop') || normK.includes('farm')))) {
            const vStr = String(v).toLowerCase()
            if (vStr.includes(targetV) || targetV.includes(vStr)) {
              matched = true
              break
            }
            if (isOnion && (vStr.includes('onion') || vStr.includes('pyaz') || vStr.includes('pyaaz') || vStr.includes('kanda') || vStr.includes('pyaj') || vStr.includes('प्याज') || vStr.includes('कांदा'))) {
              matched = true
              break
            }
            if (isChana && (vStr.includes('chana') || vStr.includes('channa') || vStr.includes('gram') || vStr.includes('chickpea') || vStr.includes('चना'))) {
              matched = true
              break
            }
          }
        }
        if (!matched && l[customField]) {
          const vStr = String(l[customField]).toLowerCase()
          if (vStr.includes(targetV) || (isOnion && (vStr.includes('onion') || vStr.includes('pyaz') || vStr.includes('kanda')))) matched = true
        }
        if (!matched) return null
      }

      const stg = c.stage || l.stage || parsedMetadata.stage || 'new'
      if (stage && stg !== stage) return null

      const displayName = c.name || l.name || l.customer_name || parsedMetadata.Name || parsedMetadata.name || parsedMetadata.contact_person || 'Unknown'
      const assignedAt = c.updated_at || l.created_at

      return {
        ...l,
        ...parsedMetadata,
        id: l.id,
        conversation_id: l.conversation_id || c.id || null,
        phone_number: p,
        name: displayName,
        customer_name: l.customer_name || c.name || displayName,
        created_at: l.created_at,
        updated_at: c.updated_at || l.created_at,
        assigned_at: assignedAt,
        stage: stg,
        lead_quality: q,
        lead_temperature: q.toUpperCase(),
        lead_score: score,
        lead_type: l.osmo_category || 'unfiltered',
        osmo_category: l.osmo_category,
        notes: l.notes || parsedMetadata.notes,
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
