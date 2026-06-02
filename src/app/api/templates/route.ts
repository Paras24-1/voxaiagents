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

    // 1. Fetch businesses associated with the token to find the WABAs
    const businessesRes = await fetch(
      `https://graph.facebook.com/v19.0/me/businesses`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
    const businessesData = await businessesRes.json()
    if (businessesData.error) {
      console.error('[templates] Meta businesses fetch error:', businessesData.error)
      return NextResponse.json({ error: businessesData.error.message }, { status: 500 })
    }

    const businesses = businessesData.data || []
    if (businesses.length === 0) {
      return NextResponse.json({ error: 'No Business Portfolios found for this token. Make sure the token is associated with a Meta Business Manager.' }, { status: 400 })
    }

    const accounts: any[] = []

    // Fetch owned WhatsApp Business Accounts for all businesses
    for (const biz of businesses) {
      const wabaRes = await fetch(
        `https://graph.facebook.com/v19.0/${biz.id}/owned_whatsapp_business_accounts`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      let wabaData = await wabaRes.json()
      if (wabaData.error) {
        // Fallback to whatsapp_business_accounts edge
        const fallbackRes = await fetch(
          `https://graph.facebook.com/v19.0/${biz.id}/whatsapp_business_accounts`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        wabaData = await fallbackRes.json()
      }

      if (wabaData.data) {
        accounts.push(...wabaData.data)
      }
    }

    if (accounts.length === 0) {
      return NextResponse.json({ error: 'No WhatsApp Business Accounts found for the associated Business Portfolios.' }, { status: 400 })
    }

    // Deduplicate accounts just in case
    const uniqueAccounts = Array.from(new Map(accounts.map((acc) => [acc.id, acc])).values())

    let wabaId = ''

    if (uniqueAccounts.length === 1) {
      wabaId = uniqueAccounts[0].id
    } else {
      // Find which WABA owns the phoneId
      for (const acc of uniqueAccounts) {
        const phoneListRes = await fetch(
          `https://graph.facebook.com/v19.0/${acc.id}/phone_numbers`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        const phoneListData = await phoneListRes.json()
        if (phoneListData.data?.some((p: any) => p.id === phoneId)) {
          wabaId = acc.id
          break
        }
      }
    }

    if (!wabaId) {
      return NextResponse.json({ error: 'Could not find a WhatsApp Business Account matching the configured Phone Number ID.' }, { status: 400 })
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
    console.error('[templates API error]:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
