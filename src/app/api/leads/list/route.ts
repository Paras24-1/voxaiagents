import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const stage = searchParams.get('stage') || ''
    const quality = searchParams.get('quality') || ''
    const search = searchParams.get('search') || ''

    let query = supabaseAdmin
      .from('leads')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (stage) {
      query = query.eq('stage', stage)
    }
    if (quality) {
      query = query.eq('lead_quality', quality)
    }

    const { data, error } = await query
    if (error) throw error

    const leads = data || []

    // Safely parse metadata on each lead
    const parsedLeads = leads.map((lead) => {
      let parsedMetadata = {}
      if (lead.metadata) {
        if (typeof lead.metadata === 'string') {
          try {
            parsedMetadata = JSON.parse(lead.metadata)
          } catch {}
        } else if (typeof lead.metadata === 'object') {
          parsedMetadata = lead.metadata
        }
      }
      return {
        ...lead,
        metadata: parsedMetadata
      }
    })

    let filteredLeads = parsedLeads

    // In-memory search for maximum flexibility (searches metadata keys and values too)
    if (search) {
      const searchLower = search.toLowerCase()
      filteredLeads = parsedLeads.filter((lead) => {
        const nameMatch = (lead.name || '').toLowerCase().includes(searchLower)
        const phoneMatch = (lead.phone_number || '').toLowerCase().includes(searchLower)
        const stageMatch = (lead.stage || '').toLowerCase().includes(searchLower)
        const qualityMatch = (lead.lead_quality || '').toLowerCase().includes(searchLower)

        let metadataMatch = false
        if (lead.metadata) {
          metadataMatch = Object.entries(lead.metadata).some(([key, val]) =>
            key.toLowerCase().includes(searchLower) ||
            String(val).toLowerCase().includes(searchLower)
          )
        }

        return nameMatch || phoneMatch || stageMatch || qualityMatch || metadataMatch
      })
    }

    return NextResponse.json(filteredLeads)
  } catch (err: unknown) {
    console.error('[leads-list]', err)
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
