import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, template_name, template_body, contacts, scheduled_at, header_image_url } = body

    if (!name || !template_name || !contacts?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data: campaign, error: campError } = await supabaseAdmin
      .from('campaigns')
      .insert({
        org_id: orgId,
        name,
        template_name,
        template_body,
        total: contacts.length,
        status: scheduled_at ? 'draft' : 'sending',
        scheduled_at: scheduled_at || null,
        started_at: scheduled_at ? null : new Date().toISOString(),
      })
      .select()
      .single()

    if (campError) throw campError

    const contactRows = contacts.map((c: any) => ({
      campaign_id: campaign.id,
      org_id: orgId,
      phone: c.phone,
      name: c.name || '',
      variables: c.variables || {},
      status: 'pending',
    }))

    const { error: contactError } = await supabaseAdmin
      .from('campaign_contacts')
      .insert(contactRows)

    if (contactError) throw contactError

    // Get org's n8n bulk webhook
    if (!scheduled_at) {
      const { data: settings } = await supabaseAdmin
        .from('organization_settings')
        .select('n8n_webhook_url')
        .eq('org_id', orgId)
        .single()

      const n8nUrl = settings?.n8n_webhook_url || process.env.N8N_BULK_WEBHOOK_URL
      if (n8nUrl) {
        await fetch(n8nUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            campaign_id: campaign.id, 
            template_name, 
            contacts,
            header_image_url: header_image_url || ''
          }),
        }).catch(console.error)
      }
    }

    return NextResponse.json({ success: true, campaign_id: campaign.id })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}