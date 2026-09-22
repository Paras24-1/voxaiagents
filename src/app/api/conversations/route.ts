import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile } from '@/lib/supabase'
import { fetchUnifiedOsmoContacts } from '@/lib/osmoPhonebooks'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  try {
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, orgId, role } = profile
    const isStaffEmployee = role !== 'owner' && role !== 'admin'

    const { searchParams } = new URL(req.url)
    const search       = searchParams.get('search')        || ''
    const stage        = searchParams.get('stage')         || ''
    const unread       = searchParams.get('unread')        === 'true'
    const assignedTo   = searchParams.get('assigned_to')   || ''
    const assignFilter = searchParams.get('assign_filter') || ''

    const limit = Math.min(parseInt(searchParams.get('limit') || '300', 10), 1000)

    let query = supabaseAdmin
      .from('conversations')
      .select('*, leads(*)')
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (isStaffEmployee) {
      query = query.eq('assigned_to', userId)
    } else {
      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo)
      } else if (assignFilter === 'unassigned') {
        query = query.is('assigned_to', null)
      } else if (assignFilter === 'assigned') {
        query = query.not('assigned_to', 'is', null)
      } else if (assignFilter && assignFilter !== 'all') {
        query = query.eq('assigned_to', assignFilter)
      }
    }

    if (stage) {
      query = query.eq('stage', stage)
    }

    if (unread) {
      query = query.gt('unread_count', 0)
    }

    const { data: convs, error } = await query

    if (error) {
      console.error('[GET /api/conversations] Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const allConvs = convs || []

    let enrichedData = (allConvs || []).map(conv => {
      const leadObj = Array.isArray(conv.leads) ? conv.leads[0] : conv.leads
      return {
        ...conv,
        lead: leadObj || null
      }
    })

    // Fallback: for conversations missing a joined lead, check if a lead exists by phone number (in chunks of 50 to prevent URI length limits)
    try {
      const unlinkedConvs = enrichedData.filter(c => !c.lead && c.phone_number)
      if (unlinkedConvs.length > 0) {
        const phoneNumbers = Array.from(new Set(unlinkedConvs.map(c => c.phone_number)))
        const CHUNK_SIZE = 50
        const fallbackLeads: any[] = []

        for (let i = 0; i < phoneNumbers.length; i += CHUNK_SIZE) {
          const chunk = phoneNumbers.slice(i, i + CHUNK_SIZE)
          const { data: chunkLeads } = await supabaseAdmin
            .from('leads')
            .select('*')
            .eq('org_id', orgId)
            .in('phone_number', chunk)

          if (chunkLeads) fallbackLeads.push(...chunkLeads)
        }

        if (fallbackLeads.length > 0) {
          const leadByPhone = new Map<string, any>()
          fallbackLeads.forEach(l => {
            const p = (l.phone_number || '').replace(/\D/g, '').slice(-10)
            if (p && !leadByPhone.has(p)) leadByPhone.set(p, l)
          })

          enrichedData.forEach(c => {
            if (!c.lead && c.phone_number) {
              const p = c.phone_number.replace(/\D/g, '').slice(-10)
              if (leadByPhone.has(p)) {
                c.lead = leadByPhone.get(p)
              }
            }
          })
        }
      }
    } catch (e) {
      console.error('[GET /api/conversations] Fallback lead lookup error:', e)
    }

    // Apply search filter if present
    if (search) {
      const srch = search.toLowerCase()
      enrichedData = enrichedData.filter(conv => {
        const p = (conv.phone_number || '').toLowerCase()
        const n = (conv.name || conv.lead?.name || '').toLowerCase()
        const msg = (conv.last_message || '').toLowerCase()
        return p.includes(srch) || n.includes(srch) || msg.includes(srch)
      })
    }

    return NextResponse.json(enrichedData, {
      headers: {
        'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0'
      }
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}