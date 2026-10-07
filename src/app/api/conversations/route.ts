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
    const categoryFilter = (searchParams.get('category')  || searchParams.get('osmo_category') || '').toLowerCase().trim()

    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 1000)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    let query = supabaseAdmin
      .from('conversations')
      .select('*, leads(*)', { count: 'exact' })
      .eq('org_id', orgId)

    if (categoryFilter && categoryFilter !== 'all') {
      try {
        let catLeads: any[] = []
        let lFrom = 0
        let lFetchMore = true
        while (lFetchMore) {
          const { data: chunk, error: chunkErr } = await supabaseAdmin
            .from('leads')
            .select('phone_number, osmo_category, metadata')
            .eq('org_id', orgId)
            .range(lFrom, lFrom + 999)

          if (chunkErr || !chunk || chunk.length === 0) {
            lFetchMore = false
          } else {
            catLeads.push(...chunk)
            if (chunk.length < 1000) lFetchMore = false
            else lFrom += 1000
          }
        }

        if (catLeads && catLeads.length > 0) {
          const matchingPhones = catLeads.filter(l => {
            let parsedMeta: Record<string, any> = l.metadata || {}
            if (typeof l.metadata === 'string') {
              try { parsedMeta = JSON.parse(l.metadata) } catch {}
            }
            const cat = String(
              l.osmo_category || 
              parsedMeta.osmo_category || 
              parsedMeta.category || 
              parsedMeta.lead_type || 
              'unfiltered'
            ).toLowerCase()
            return cat === categoryFilter
          }).map(l => l.phone_number).filter(Boolean)

          const uniquePhones = Array.from(new Set(matchingPhones))
          if (uniquePhones.length === 0) {
            return NextResponse.json([], {
              headers: {
                'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
                'X-Total-Count': '0'
              }
            })
          }
          query = query.in('phone_number', uniquePhones)
        }
      } catch (e) {
        console.error('[GET /api/conversations] Category phone filter error:', e)
      }
    }

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

    if (search && search.trim()) {
      const cleanSrch = search.trim()
      const digitsOnly = cleanSrch.replace(/\D/g, '')

      let orConditions = [
        `name.ilike.%${cleanSrch}%`,
        `phone_number.ilike.%${cleanSrch}%`,
        `last_message.ilike.%${cleanSrch}%`
      ]
      if (digitsOnly.length >= 3) {
        orConditions.push(`phone_number.ilike.%${digitsOnly}%`)
      }

      // Also search matching leads in leads table by name or phone
      try {
        let leadQuery = supabaseAdmin
          .from('leads')
          .select('phone_number')
          .eq('org_id', orgId)
          .limit(100)

        if (digitsOnly.length >= 3) {
          leadQuery = leadQuery.or(`name.ilike.%${cleanSrch}%,phone_number.ilike.%${cleanSrch}%,phone_number.ilike.%${digitsOnly}%`)
        } else {
          leadQuery = leadQuery.or(`name.ilike.%${cleanSrch}%,phone_number.ilike.%${cleanSrch}%`)
        }

        const { data: leadMatches } = await leadQuery
        if (leadMatches && leadMatches.length > 0) {
          leadMatches.forEach(l => {
            if (l.phone_number) {
              orConditions.push(`phone_number.eq.${l.phone_number}`)
            }
          })
        }
      } catch (e) {
        console.error('[GET /api/conversations] Lead search error:', e)
      }

      query = query.or(orConditions.join(','))
    }

    query = query
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: convs, count, error } = await query

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

    // Filter by category if requested
    if (categoryFilter && categoryFilter !== 'all') {
      enrichedData = enrichedData.filter(c => {
        const leadObj = c.lead || (Array.isArray(c.leads) ? c.leads[0] : c.leads) || {}
        const meta = typeof leadObj?.metadata === 'object' ? leadObj.metadata : (typeof c.metadata === 'object' ? c.metadata : {})
        const cat = String(
          leadObj?.osmo_category || 
          leadObj?.category || 
          leadObj?.lead_type || 
          meta?.osmo_category || 
          meta?.category || 
          meta?.lead_type || 
          c.osmo_category || 
          c.category || 
          c.lead_type || 
          'unfiltered'
        ).toLowerCase()
        return cat === categoryFilter
      })
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
        'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
        'X-Total-Count': String(count ?? enrichedData.length)
      }
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}