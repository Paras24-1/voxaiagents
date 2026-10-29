import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'
export const maxDuration = 60 // Allow up to 60 seconds for large dataset exports

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""'
  const str = String(val).replace(/"/g, '""')
  return `"${str}"`
}

export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let body: any = {}
    try {
      body = await req.json()
    } catch {}

    return handleExport(req, profile, body)
  } catch (err: unknown) {
    console.error('[leads-export POST error]', err)
    const error = err instanceof Error ? err.message : 'Unknown export error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const searchParams = new URL(req.url).searchParams
    const body: any = {
      stage: searchParams.get('stage') || '',
      quality: searchParams.get('quality') || '',
      search: searchParams.get('search') || '',
      start_date: searchParams.get('start_date') || '',
      end_date: searchParams.get('end_date') || '',
      lead_type: searchParams.get('lead_type') || '',
      state: searchParams.get('state') || '',
      assigned_today: searchParams.get('assigned_today') === 'true',
      custom_field: searchParams.get('custom_field') || '',
      custom_value: searchParams.get('custom_value') || '',
    }

    const phonesParam = searchParams.get('selected_phones')
    if (phonesParam) {
      try {
        body.selected_phones = JSON.parse(phonesParam)
      } catch {
        body.selected_phones = phonesParam.split(',').map(p => p.trim()).filter(Boolean)
      }
    }

    return handleExport(req, profile, body)
  } catch (err: unknown) {
    console.error('[leads-export GET error]', err)
    const error = err instanceof Error ? err.message : 'Unknown export error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

async function handleExport(req: NextRequest, profile: any, params: any) {
  const { userId, orgId, role } = profile
  const isStaffEmployee = role !== 'owner' && role !== 'admin'

  const selectedPhones: string[] = Array.isArray(params.selected_phones)
    ? params.selected_phones.map((p: any) => String(p).trim()).filter(Boolean)
    : []

  const stage = params.stage || ''
  const quality = params.quality || ''
  const search = params.search || ''
  const startDate = params.start_date || ''
  const endDate = params.end_date || ''
  const leadType = params.lead_type || ''
  const geographicState = params.state || ''
  const assignedToday = params.assigned_today === true || params.assigned_today === 'true'
  const customField = params.custom_field || ''
  const customValue = params.custom_value || ''

  let staffConvIds: string[] | null = null
  if (isStaffEmployee) {
    const { data: convs } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('org_id', orgId)
      .eq('assigned_to', userId)
    staffConvIds = (convs || []).map(c => c.id)
    if (staffConvIds.length === 0) {
      return emptyCsvResponse()
    }
  }

  let allRawRows: any[] = []

  // Case 1: Specific chosen leads requested
  if (selectedPhones.length > 0) {
    const CHUNK_SIZE = 500
    for (let i = 0; i < selectedPhones.length; i += CHUNK_SIZE) {
      const chunk = selectedPhones.slice(i, i + CHUNK_SIZE)
      let q = supabaseAdmin
        .from('leads')
        .select('*, conversations(id, stage, name, assigned_to, updated_at)')
        .eq('org_id', orgId)
        .in('phone_number', chunk)

      if (staffConvIds) {
        q = q.in('conversation_id', staffConvIds) as any
      }

      const { data, error } = await q
      if (error) {
        console.error('[leads-export: selected phones query error]', error)
        throw error
      }
      if (data && data.length > 0) {
        allRawRows.push(...data)
      }
    }
  } else {
    // Case 2: All filtered leads across the entire database
    const BATCH_SIZE = 1000
    const MAX_EXPORT_LIMIT = 60000
    let offset = 0
    let keepFetching = true

    while (keepFetching && allRawRows.length < MAX_EXPORT_LIMIT) {
      let query = supabaseAdmin
        .from('leads')
        .select('*, conversations(id, stage, name, assigned_to, updated_at)')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + BATCH_SIZE - 1)

      if (staffConvIds) {
        query = query.in('conversation_id', staffConvIds) as any
      }

      if (leadType && leadType !== 'all') {
        if (leadType === 'unfiltered') {
          query = query.or('osmo_category.eq.unfiltered,osmo_category.is.null') as any
        } else {
          query = query.eq('osmo_category', leadType) as any
        }
      }

      if (startDate) query = query.gte('created_at', startDate) as any
      if (endDate) query = query.lte('created_at', `${endDate}T23:59:59.999Z`) as any

      if (assignedToday) {
        const startOfTodayIso = new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
        query = query.gte('created_at', startOfTodayIso) as any
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

        query = query.or(searchClauses.join(',')) as any
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
        console.error('[leads-export: filtered query error]', error)
        throw error
      }

      if (!data || data.length === 0) {
        keepFetching = false
        break
      }

      allRawRows.push(...data)

      if (data.length < BATCH_SIZE) {
        keepFetching = false
      } else {
        offset += BATCH_SIZE
      }
    }
  }

  // Enrich and apply secondary in-memory filters (stage, quality, state, custom field variants)
  const metadataKeys = new Set<string>()

  const enrichedLeads = allRawRows.map((l: any) => {
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

    // Lead quality logic matching dashboard (0-25: COLD, 25-50: WARM, >50: HOT)
    const score = Number(l.lead_score ?? parsedMetadata.lead_score ?? 0)
    let q = (l.lead_quality || parsedMetadata.lead_quality || parsedMetadata.lead_temperature || l.lead_temperature || 'cold').toLowerCase()
    if (score > 50) q = 'hot'
    else if (score >= 25) q = 'warm'
    else q = 'cold'

    if (quality && q !== quality.toLowerCase()) return null

    if (geographicState) {
      const leadState = (parsedMetadata.state || l.state || '').trim()
      if (leadState.toLowerCase() !== geographicState.toLowerCase()) return null
    }

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

    // Collect metadata keys for dynamic CSV columns
    Object.keys(parsedMetadata).forEach(k => {
      const lower = k.toLowerCase().trim()
      if (!['name', 'phone', 'phone_number', 'stage', 'lead_quality', 'lead_score', 'lead_temperature', 'category', 'osmo_category', 'lead_type', 'city', 'state', 'source', 'created_at', 'notes'].includes(lower)) {
        metadataKeys.add(k)
      }
    })

    return {
      name: displayName,
      phone_number: p || '',
      stage: stg,
      lead_quality: q.toUpperCase(),
      lead_score: score,
      category: l.osmo_category || 'unfiltered',
      city: parsedMetadata.city || l.city || '',
      state: parsedMetadata.state || l.state || '',
      source: parsedMetadata.source || l.source || 'Direct',
      followup_date: l.followup_date || parsedMetadata.followup_date || '',
      followup_notes: l.followup_notes || parsedMetadata.followup_notes || '',
      created_at: l.created_at ? new Date(l.created_at).toLocaleString() : '',
      metadata: parsedMetadata
    }
  }).filter(Boolean)

  const sortedMetaKeys = Array.from(metadataKeys).sort((a, b) => a.localeCompare(b))

  const standardHeaders = [
    'Name',
    'Phone Number',
    'Stage',
    'Lead Quality',
    'Lead Score',
    'Category',
    'City',
    'State',
    'Source',
    'Followup Date',
    'Followup Notes',
    'Created At'
  ]

  const allHeaders = [...standardHeaders, ...sortedMetaKeys]
  const csvLines: string[] = []

  // Header row
  csvLines.push(allHeaders.map(escapeCsv).join(','))

  // Data rows
  enrichedLeads.forEach((lead: any) => {
    const row = [
      lead.name,
      lead.phone_number,
      lead.stage,
      lead.lead_quality,
      String(lead.lead_score),
      lead.category,
      lead.city,
      lead.state,
      lead.source,
      lead.followup_date,
      lead.followup_notes,
      lead.created_at
    ]

    sortedMetaKeys.forEach(k => {
      row.push(lead.metadata?.[k] !== undefined && lead.metadata?.[k] !== null ? String(lead.metadata[k]) : '')
    })

    csvLines.push(row.map(escapeCsv).join(','))
  })

  // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility with international characters
  const csvContent = '\uFEFF' + csvLines.join('\r\n')
  const filename = `leads_crm_export_${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}

function emptyCsvResponse() {
  const standardHeaders = ['Name', 'Phone Number', 'Stage', 'Lead Quality', 'Lead Score', 'Category', 'City', 'State', 'Source', 'Followup Date', 'Followup Notes', 'Created At']
  const csvContent = '\uFEFF' + standardHeaders.map(escapeCsv).join(',') + '\r\n'
  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="leads_crm_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}
