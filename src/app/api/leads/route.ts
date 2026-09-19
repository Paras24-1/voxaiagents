import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'
import { isOsmoOrg, syncOsmoPhonebooks, invalidateUnifiedCache } from '@/lib/osmoPhonebooks'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversation_id')
    if (!conversationId) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 })

    // First, try matching directly by conversation_id
    let { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('org_id', orgId)
      .maybeSingle()

    if (error) throw error

    // If not found by conversation_id, fall back to matching by phone number
    if (!data) {
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .select('phone_number')
        .eq('id', conversationId)
        .eq('org_id', orgId)
        .maybeSingle()

      if (conv?.phone_number) {
        const phone = conv.phone_number.replace(/\D/g, '').slice(-10)
        const { data: leadData, error: leadError } = await supabaseAdmin
          .from('leads')
          .select('*')
          .ilike('phone_number', `%${phone}`)
          .eq('org_id', orgId)
          .maybeSingle()

        if (leadError) throw leadError
        
        if (leadData) {
          data = leadData
          // Auto-heal/link the conversation_id
          await supabaseAdmin
            .from('leads')
            .update({ conversation_id: conversationId })
            .eq('id', data.id)
          data.conversation_id = conversationId
        }
      }
    }

    return NextResponse.json(data || {})
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { conversation_id, id: leadId, phone_number, metadata, ...updates } = body
    if (!conversation_id && !leadId && !phone_number) {
      return NextResponse.json({ error: 'lead identifier (id, conversation_id, or phone_number) required' }, { status: 400 })
    }

    // 1. Find existing lead record to preserve existing metadata
    let existingLead: any = null
    if (leadId) {
      const { data } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .eq('org_id', orgId)
        .limit(1)
      if (data && data.length > 0) existingLead = data[0]
    }
    if (!existingLead && conversation_id) {
      const { data } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('conversation_id', conversation_id)
        .eq('org_id', orgId)
        .limit(1)
      if (data && data.length > 0) existingLead = data[0]
    }
    // Fallback: leadId might be a conversation ID
    if (!existingLead && leadId) {
      const { data } = await supabaseAdmin
        .from('leads')
        .select('*')
        .eq('conversation_id', leadId)
        .eq('org_id', orgId)
        .limit(1)
      if (data && data.length > 0) existingLead = data[0]
    }
    // Fallback by phone number
    if (!existingLead) {
      let searchPhone = phone_number
      if (!searchPhone && (conversation_id || leadId)) {
        const targetCId = conversation_id || leadId
        const { data: conv } = await supabaseAdmin
          .from('conversations')
          .select('phone_number')
          .eq('id', targetCId)
          .eq('org_id', orgId)
          .maybeSingle()
        if (conv?.phone_number) searchPhone = conv.phone_number
      }
      if (searchPhone) {
        const cleanP = String(searchPhone).replace(/\D/g, '').slice(-10)
        if (cleanP.length >= 10) {
          const { data } = await supabaseAdmin
            .from('leads')
            .select('*')
            .ilike('phone_number', `%${cleanP}`)
            .eq('org_id', orgId)
            .order('created_at', { ascending: false })
            .limit(1)
          if (data && data.length > 0) existingLead = data[0]
        }
      }
    }

    let existingMeta = existingLead?.metadata || {}
    if (typeof existingMeta === 'string') {
      try { existingMeta = JSON.parse(existingMeta) } catch {}
    }

    let parsedMeta: any = metadata
    if (metadata && typeof metadata === 'string') {
      try { parsedMeta = JSON.parse(metadata) } catch (e) {}
    }

    // Preserve existing metadata by merging into existing lead metadata
    let existingMeta: any = {}
    if (leadId || conversation_id || phone_number) {
      let query = supabaseAdmin.from('leads').select('metadata, conversation_id').eq('org_id', orgId)
      if (leadId) query = query.eq('id', leadId)
      else if (conversation_id) query = query.eq('conversation_id', conversation_id)
      else if (phone_number) {
        const cleanP = phone_number.replace(/\D/g, '').slice(-10)
        query = query.ilike('phone_number', `%${cleanP}`)
      }
      const { data: existingLead } = await query.maybeSingle()
      if (existingLead?.metadata) {
        if (typeof existingLead.metadata === 'string') {
          try { existingMeta = JSON.parse(existingLead.metadata) } catch {}
        } else existingMeta = existingLead.metadata
      }
    }

    // Move any fields that aren't valid DB columns into metadata
    const validDbColumns = [
      'id', 'conversation_id', 'phone_number', 'customer_name', 'name', 
      'created_at', 'org_id', 'metadata', 'followup_date', 'followup_notes', 
      'followup_notified', 'lead_temperature'
    ];

    let mergedMeta = { ...existingMeta, ...(parsedMeta || {}) };

    // Explicit manual lead_type update
    let targetLeadType = updates.lead_type || body.lead_type
    if (targetLeadType) {
      mergedMeta.lead_type = targetLeadType
      mergedMeta.category = targetLeadType
      mergedMeta.user_type = targetLeadType
      mergedMeta.Lead_Type = targetLeadType
      console.log(`[DIAG PATCH /api/leads] Setting targetLeadType='${targetLeadType}' for leadId=${leadId} convId=${conversation_id}`)
    }

    // Calculate lead_quality & lead_temperature dynamically based on lead_score
    const sentScore = updates.lead_score ?? mergedMeta?.lead_score;
    if (sentScore !== undefined) {
      const numericScore = Number(sentScore);
      if (!isNaN(numericScore)) {
        let temp = 'COLD';
        if (numericScore >= 70) temp = 'HOT';
        else if (numericScore >= 40) temp = 'WARM';
        
        updates.lead_temperature = temp;
        mergedMeta.lead_quality = temp.toLowerCase();
        mergedMeta.lead_score = numericScore;
      }
    }

    // Move invalid columns from updates to metadata
    const finalUpdates: any = {};
    for (const key of Object.keys(updates)) {
      if (validDbColumns.includes(key)) {
        finalUpdates[key] = updates[key];
      } else {
        mergedMeta[key] = updates[key];
      }
    }

    finalUpdates.metadata = Object.keys(mergedMeta).length > 0 ? mergedMeta : null;

    let data: any = null
    let error: any = null

    if (existingLead) {
      const shouldUpdateConvId = conversation_id && (!existingLead.conversation_id || existingLead.conversation_id === conversation_id)
      const res = await supabaseAdmin
        .from('leads')
        .update({
          ...finalUpdates,
          ...(shouldUpdateConvId ? { conversation_id } : {})
        })
        .eq('id', existingLead.id)
        .eq('org_id', orgId)
        .select()
        .maybeSingle()
      data = res.data
      error = res.error
    } else {
      // Find linked conversation for fallback details
      const targetConvId = conversation_id || (leadId && leadId.length > 20 ? leadId : null)
      let convDetails: any = null
      if (targetConvId) {
        const { data: c } = await supabaseAdmin
          .from('conversations')
          .select('id, phone_number, name')
          .eq('id', targetConvId)
          .eq('org_id', orgId)
          .maybeSingle()
        convDetails = c
      }

      const finalPhone = phone_number || convDetails?.phone_number || ''
      const finalName = updates.name || convDetails?.name || ''
      const finalConvId = conversation_id || convDetails?.id || null

      if (finalConvId) {
        const { data: leadByConv } = await supabaseAdmin
          .from('leads')
          .select('*')
          .eq('conversation_id', finalConvId)
          .eq('org_id', orgId)
          .limit(1)
        if (leadByConv && leadByConv.length > 0) {
          existingLead = leadByConv[0]
        }
      }

      if (existingLead) {
        const res = await supabaseAdmin
          .from('leads')
          .update({
            ...finalUpdates
          })
          .eq('id', existingLead.id)
          .eq('org_id', orgId)
          .select()
          .maybeSingle()
        data = res.data
        error = res.error
      } else {
        const res = await supabaseAdmin
          .from('leads')
          .insert({
            ...finalUpdates,
            org_id: orgId,
            phone_number: finalPhone,
            name: finalName,
            ...(finalConvId ? { conversation_id: finalConvId } : {})
          })
          .select()
          .maybeSingle()
        data = res.data
        error = res.error
      }
    }

    if (error) throw error

    // Sync conversations table if name, stage, or lead_type was updated
    const targetConvId = conversation_id || data?.conversation_id
    if (targetConvId) {
      if (updates.name || updates.stage || targetLeadType) {
        const { data: convData } = await supabaseAdmin
          .from('conversations')
          .select('metadata')
          .eq('id', targetConvId)
          .eq('org_id', orgId)
          .maybeSingle()

        let convMeta = convData?.metadata || {}
        if (typeof convMeta === 'string') { try { convMeta = JSON.parse(convMeta) } catch {} }
        if (targetLeadType) {
          convMeta = { ...convMeta, category: targetLeadType, lead_type: targetLeadType }
        }

        await supabaseAdmin
          .from('conversations')
          .update({
            ...(updates.name  ? { name: updates.name }   : {}),
            ...(updates.stage ? { stage: updates.stage } : {}),
            ...(targetLeadType ? { metadata: convMeta } : {})
          })
          .eq('id', targetConvId)
          .eq('org_id', orgId)
      }
    }

    // Invalidate server cache so immediate refetch reflects updated category
    invalidateUnifiedCache(orgId)

    // For Osmo RO tenant, trigger auto phonebook sync in background
    isOsmoOrg(orgId).then((isOsmo) => {
      if (isOsmo) syncOsmoPhonebooks(orgId).catch(console.error)
    }).catch(() => {})

    return NextResponse.json(data || {})
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}