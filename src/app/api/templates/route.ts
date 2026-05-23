import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Fetch tenant-specific credentials
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('organization_settings')
      .select('whatsapp_token, whatsapp_phone_id')
      .eq('org_id', orgId)
      .single()

    if (settingsError || !settings || !settings.whatsapp_token || !settings.whatsapp_phone_id) {
      return NextResponse.json({ error: 'WhatsApp credentials not configured. Go to Settings.' }, { status: 400 })
    }

    const token = settings.whatsapp_token
    const phoneId = settings.whatsapp_phone_id

    // 1. Resolve WABA ID dynamically using Phone Number ID
    const phoneRes = await fetch(
      `https://graph.facebook.com/v19.0/${phoneId}?fields=whatsapp_business_account`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const phoneData = await phoneRes.json()
    if (phoneData.error) {
      console.error('[templates] Meta WABA resolution error:', phoneData.error)
      return NextResponse.json({ error: phoneData.error.message }, { status: 500 })
    }

    const wabaId = phoneData.whatsapp_business_account?.id
    if (!wabaId) {
      return NextResponse.json({ error: 'Failed to resolve WhatsApp Business Account ID' }, { status: 500 })
    }

    // 2. Fetch approved message templates from Meta WABA
    const templatesRes = await fetch(
      `https://graph.facebook.com/v19.0/${wabaId}/message_templates?status=APPROVED&limit=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
      }
    )

    const templatesData = await templatesRes.json()
    if (templatesData.error) {
      console.error('[templates] Meta templates fetch error:', templatesData.error)
      return NextResponse.json({ error: templatesData.error.message }, { status: 500 })
    }

    // 3. Format templates for the frontend editor
    const templates = (templatesData.data || []).map((t: any) => ({
      id:       t.id,
      name:     t.name,
      language: t.language,
      status:   t.status,
      category: t.category,
      body:     t.components?.find((c: any) => c.type === 'BODY')?.text || '',
      header:   t.components?.find((c: any) => c.type === 'HEADER')?.text || '',
      footer:   t.components?.find((c: any) => c.type === 'FOOTER')?.text || '',
      variables: (t.components?.find((c: any) => c.type === 'BODY')?.text || '')
        .match(/{{\d+}}/g) || []
    }))

    return NextResponse.json(templates)

  } catch (err) {
    console.error('[templates]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
