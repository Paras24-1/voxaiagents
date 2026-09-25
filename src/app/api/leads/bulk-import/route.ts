import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'
import { cleanPhone, isOsmoOrg, syncOsmoPhonebooks, invalidateUnifiedCache } from '@/lib/osmoPhonebooks'
import { handleApiError } from '@/lib/apiErrors'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface BulkLeadItem {
  phone_number: string
  name?: string
  customer_name?: string
  osmo_category?: string
  category?: string
  lead_type?: string
  stage?: string
  lead_temperature?: string
  lead_quality?: string
  lead_score?: number | string
  followup_date?: string
  followup_notes?: string
  state?: string
  location?: string
  source?: string
  notes?: string
  [key: string]: any
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { leads } = body as { leads: BulkLeadItem[] }

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: 'No leads provided for import' }, { status: 400 })
    }

    if (leads.length > 200) {
      return NextResponse.json({ error: 'Batch size exceeds maximum limit of 200 leads per request' }, { status: 400 })
    }

    const validColumns = [
      'id', 'conversation_id', 'phone_number', 'customer_name', 'name',
      'created_at', 'org_id', 'metadata', 'followup_date', 'followup_notes',
      'followup_notified', 'lead_temperature', 'osmo_category'
    ]

    let insertedCount = 0
    let updatedCount = 0
    const errors: { row: number; phone: string; error: string }[] = []

    // 1. Clean and validate numbers in batch
    const sanitizedLeads: { rawIndex: number; phone: string; item: BulkLeadItem }[] = []
    
    leads.forEach((item, index) => {
      const rawPhone = item.phone_number || item.phone || item.mobile || item.contact || item['Phone Number'] || item['Mobile'] || item['Contact']
      const phone = cleanPhone(rawPhone)

      if (!phone || phone.length < 10) {
        errors.push({
          row: index + 1,
          phone: String(rawPhone || ''),
          error: 'Invalid or missing phone number'
        })
        return
      }

      sanitizedLeads.push({ rawIndex: index + 1, phone, item })
    })

    if (sanitizedLeads.length === 0) {
      return NextResponse.json({
        success: false,
        summary: { total: leads.length, inserted: 0, updated: 0, failed: errors.length },
        errors
      })
    }

    // Extract all batch phone numbers
    const batchPhones = Array.from(new Set(sanitizedLeads.map(s => s.phone)))

    // 2. Fetch existing conversations for these phone numbers to link conversation_id
    const { data: existingConvs } = await supabaseAdmin
      .from('conversations')
      .select('id, phone_number')
      .eq('org_id', orgId)
      .in('phone_number', batchPhones)

    const convMap = new Map<string, string>()
    if (existingConvs) {
      existingConvs.forEach(c => {
        convMap.set(c.phone_number, c.id)
      })
    }

    // 3. For phones missing conversations, auto-create conversation records
    const missingConvPhones = batchPhones.filter(p => !convMap.has(p))
    if (missingConvPhones.length > 0) {
      const newConvsPayload = missingConvPhones.map(phone => {
        const leadObj = sanitizedLeads.find(s => s.phone === phone)
        const name = leadObj?.item.name || leadObj?.item.customer_name || phone
        const category = leadObj?.item.osmo_category || leadObj?.item.category || leadObj?.item.lead_type || 'unfiltered'
        const stage = leadObj?.item.stage || 'new'
        return {
          org_id: orgId,
          phone_number: phone,
          name,
          unread_count: 0,
          ai_mode: false,
          stage,
          updated_at: new Date().toISOString(),
          metadata: { category, lead_type: category }
        }
      })

      const { data: createdConvs, error: createConvErr } = await supabaseAdmin
        .from('conversations')
        .upsert(newConvsPayload, { onConflict: 'phone_number,org_id' })
        .select('id, phone_number')

      if (!createConvErr && createdConvs) {
        createdConvs.forEach(c => convMap.set(c.phone_number, c.id))
      }
    }

    // 4. Check existing leads to count inserted vs updated correctly
    const { data: existingLeads } = await supabaseAdmin
      .from('leads')
      .select('id, phone_number, metadata')
      .eq('org_id', orgId)
      .in('phone_number', batchPhones)

    const existingLeadMap = new Map<string, any>()
    if (existingLeads) {
      existingLeads.forEach(l => existingLeadMap.set(l.phone_number, l))
    }

    // 5. Prepare batch payload for leads table
    const leadsUpsertPayload = sanitizedLeads.map(({ phone, item }) => {
      const existingLead = existingLeadMap.get(phone)
      const isNew = !existingLead

      if (isNew) insertedCount++
      else updatedCount++

      let existingMeta = existingLead?.metadata || {}
      if (typeof existingMeta === 'string') {
        try { existingMeta = JSON.parse(existingMeta) } catch {}
      }

      const category = item.osmo_category || item.category || item.lead_type || existingMeta.category || 'unfiltered'
      
      let temp = item.lead_temperature || existingMeta.lead_temperature || 'COLD'
      if (item.lead_score !== undefined) {
        const numericScore = Number(item.lead_score)
        if (!isNaN(numericScore)) {
          if (numericScore >= 70) temp = 'HOT'
          else if (numericScore >= 40) temp = 'WARM'
        }
      } else if (item.lead_quality) {
        const q = String(item.lead_quality).toUpperCase()
        if (['HOT', 'WARM', 'COLD'].includes(q)) temp = q
      }

      const name = item.name || item.customer_name || existingLead?.name || phone
      const convId = convMap.get(phone) || null

      const mergedMeta = {
        ...existingMeta,
        osmo_category: category,
        lead_type: category,
        category,
        ...(item.state ? { state: item.state } : {}),
        ...(item.location ? { location: item.location } : {}),
        ...(item.source ? { source: item.source } : {}),
        ...(item.notes ? { notes: item.notes } : {}),
      }

      // Collect custom fields into metadata
      for (const [key, val] of Object.entries(item)) {
        if (!validColumns.includes(key) && !['phone_number', 'phone', 'mobile', 'contact', 'category', 'lead_type', 'stage', 'lead_quality', 'lead_score', 'location', 'state', 'source', 'notes'].includes(key)) {
          mergedMeta[key] = val
        }
      }

      return {
        org_id: orgId,
        phone_number: phone,
        name,
        customer_name: name,
        osmo_category: category,
        lead_temperature: temp,
        ...(convId ? { conversation_id: convId } : {}),
        ...(item.followup_date ? { followup_date: item.followup_date } : {}),
        ...(item.followup_notes ? { followup_notes: item.followup_notes } : {}),
        metadata: mergedMeta,
        created_at: existingLead?.created_at || new Date().toISOString()
      }
    })

    // Upsert into leads table
    const { error: upsertErr } = await supabaseAdmin
      .from('leads')
      .upsert(leadsUpsertPayload, { onConflict: 'org_id,phone_number' })

    if (upsertErr) {
      console.error('[POST /api/leads/bulk-import] Upsert Error:', upsertErr)
      throw upsertErr
    }

    // Invalidate server cache so stats and pill counts update immediately
    invalidateUnifiedCache(orgId)

    // For Osmo tenant, trigger phonebook sync in background
    isOsmoOrg(orgId).then((isOsmo) => {
      if (isOsmo) syncOsmoPhonebooks(orgId).catch(console.error)
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      summary: {
        total: leads.length,
        inserted: insertedCount,
        updated: updatedCount,
        failed: errors.length
      },
      errors
    })
  } catch (err: unknown) {
    return handleApiError('POST /api/leads/bulk-import', err)
  }
}
