import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile } from '@/lib/supabase'
import { isOsmoOrg, syncOsmoPhonebooks } from '@/lib/osmoPhonebooks'

export async function POST(req: NextRequest) {
  try {
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { conversation_id, category } = body

    if (!conversation_id || !category) {
      return NextResponse.json({ error: 'Missing conversation_id or category' }, { status: 400 })
    }

    const validCategories = ['unfiltered', 'osmo_dealer', 'dealer', 'customer']
    const normalizedCategory = String(category).trim().toLowerCase().replace(/\s+/g, '_')
    const targetCategory = validCategories.includes(normalizedCategory) ? normalizedCategory : 'unfiltered'

    // 1. Fetch existing conversation
    const { data: conv, error: convFetchErr } = await supabaseAdmin
      .from('conversations')
      .select('id, phone_number, name, metadata')
      .eq('id', conversation_id)
      .eq('org_id', profile.orgId)
      .maybeSingle()

    if (convFetchErr || !conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // 2. Prepare conversation metadata
    let convMeta: any = conv.metadata || {}
    if (typeof convMeta === 'string') {
      try { convMeta = JSON.parse(convMeta) } catch {}
    }
    convMeta = {
      ...convMeta,
      category: targetCategory,
      lead_type: targetCategory,
      Lead_Type: targetCategory,
      user_type: targetCategory
    }

    // 3. Find linked lead or search by phone
    let linkedLead: any = null
    const { data: leadByConv } = await supabaseAdmin
      .from('leads')
      .select('id, metadata, phone_number')
      .eq('conversation_id', conversation_id)
      .eq('org_id', profile.orgId)
      .maybeSingle()

    linkedLead = leadByConv

    if (!linkedLead && conv.phone_number) {
      const phone = conv.phone_number.replace(/\D/g, '').slice(-10)
      const { data: leadByPhone } = await supabaseAdmin
        .from('leads')
        .select('id, metadata, phone_number')
        .ilike('phone_number', `%${phone}`)
        .eq('org_id', profile.orgId)
        .maybeSingle()
      linkedLead = leadByPhone
    }

    let leadMeta: any = linkedLead?.metadata || {}
    if (typeof leadMeta === 'string') {
      try { leadMeta = JSON.parse(leadMeta) } catch {}
    }
    leadMeta = {
      ...leadMeta,
      category: targetCategory,
      lead_type: targetCategory,
      Lead_Type: targetCategory,
      user_type: targetCategory
    }

    // 4. Update leads table
    if (linkedLead) {
      await supabaseAdmin
        .from('leads')
        .update({
          metadata: leadMeta,
          conversation_id // ensure conversation_id is linked
        })
        .eq('id', linkedLead.id)
    } else {
      await supabaseAdmin
        .from('leads')
        .insert({
          conversation_id,
          org_id: profile.orgId,
          phone_number: conv.phone_number || '',
          name: conv.name || '',
          metadata: leadMeta
        })
    }

    // 5. Update conversations table with new metadata & updated_at timestamp
    const { error: convUpdateErr } = await supabaseAdmin
      .from('conversations')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', conversation_id)
      .eq('org_id', profile.orgId)

    if (convUpdateErr) throw convUpdateErr

    // 6. Trigger Osmo Phonebook sync in background
    isOsmoOrg(profile.orgId).then((isOsmo) => {
      if (isOsmo) syncOsmoPhonebooks(profile.orgId).catch(console.error)
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      conversation_id,
      category: targetCategory
    })

  } catch (err: any) {
    console.error('[POST /api/conversations/category] Error:', err)
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
