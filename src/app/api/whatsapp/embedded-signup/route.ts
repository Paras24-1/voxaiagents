import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { code, waba_id, phone_number_id } = body

    if (!waba_id && !code) {
      return NextResponse.json(
        { error: 'Missing required parameters (code or waba_id)' },
        { status: 400 }
      )
    }

    const appId = process.env.NEXT_PUBLIC_META_APP_ID || '1605865680887764'
    const appSecret = process.env.META_APP_SECRET
    const fallbackToken = process.env.META_ACCESS_TOKEN || process.env.WHATSAPP_TOKEN || ''

    let clientAccessToken = ''

    // 1. If code and appSecret are provided, exchange code for an access token
    if (code && appSecret) {
      try {
        const tokenRes = await fetch(
          `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`
        )
        const tokenData = await tokenRes.json()
        if (tokenData.access_token) {
          clientAccessToken = tokenData.access_token
        } else {
          console.warn('[embedded-signup] Code exchange returned no access token:', tokenData)
        }
      } catch (tokenErr) {
        console.error('[embedded-signup] Token exchange error:', tokenErr)
      }
    }

    // Fall back to system / provider access token if exchange wasn't possible
    const tokenToUse = clientAccessToken || fallbackToken

    let resolvedWabaId = waba_id || ''
    let resolvedPhoneId = phone_number_id || ''

    // 2. If phone_number_id is missing, try fetching it from the WABA
    if (resolvedWabaId && !resolvedPhoneId && tokenToUse) {
      try {
        const phoneRes = await fetch(
          `https://graph.facebook.com/v21.0/${resolvedWabaId}/phone_numbers?access_token=${tokenToUse}`
        )
        const phoneData = await phoneRes.json()
        if (phoneData.data && phoneData.data.length > 0) {
          resolvedPhoneId = phoneData.data[0].id
        }
      } catch (err) {
        console.error('[embedded-signup] Error fetching phone numbers:', err)
      }
    }

    // 3. Subscribe the WABA to your app's webhooks so incoming messages reach your platform
    if (resolvedWabaId && tokenToUse) {
      try {
        const subRes = await fetch(
          `https://graph.facebook.com/v21.0/${resolvedWabaId}/subscribed_apps`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${tokenToUse}`,
              'Content-Type': 'application/json'
            }
          }
        )
        const subData = await subRes.json()
        console.log('[embedded-signup] Subscribed app result:', subData)
      } catch (subErr) {
        console.error('[embedded-signup] Error subscribing to WABA webhooks:', subErr)
      }
    }

    // 4. Update the organization_settings in Supabase
    const updatePayload: Record<string, any> = {}
    if (resolvedPhoneId) updatePayload.whatsapp_phone_id = resolvedPhoneId
    if (resolvedWabaId) updatePayload.whatsapp_waba_id = resolvedWabaId
    if (clientAccessToken) {
      updatePayload.whatsapp_token = clientAccessToken
    } else if (fallbackToken) {
      updatePayload.whatsapp_token = fallbackToken
    }

    const { data: existing } = await supabaseAdmin
      .from('organization_settings')
      .select('id')
      .eq('org_id', orgId)
      .maybeSingle()

    if (existing) {
      const { error: updError } = await supabaseAdmin
        .from('organization_settings')
        .update(updatePayload)
        .eq('org_id', orgId)
      if (updError) throw updError
    } else {
      const { error: insError } = await supabaseAdmin
        .from('organization_settings')
        .insert({ org_id: orgId, ...updatePayload })
      if (insError) throw insError
    }

    return NextResponse.json({
      success: true,
      whatsapp_phone_id: resolvedPhoneId,
      whatsapp_waba_id: resolvedWabaId,
      has_token: Boolean(updatePayload.whatsapp_token)
    })
  } catch (err: any) {
    console.error('[embedded-signup error]:', err)
    return NextResponse.json(
      { error: String(err.message || err) },
      { status: 500 }
    )
  }
}
