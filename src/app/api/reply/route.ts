import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let orgId = await getOrgId(req)
    
    // Allow internal webhook routing to bypass cookie auth
    if (!orgId && req.headers.get('x-internal-secret') === (process.env.N8N_WEBHOOK_SECRET || 'internal-ai-reply')) {
      orgId = body.org_id
    }

    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { 
      conversation_id, 
      phone_number, 
      message, 
      media_url, 
      media_type, 
      type, 
      template_name, 
      template_language, 
      template_components,
      filename,
      location_data
    } = body

    if (!conversation_id || !phone_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()
    const isTemplate = type === 'template' || !!template_name

    // Fetch conversation platform, last incoming message time, and provider phone ID
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('platform, last_incoming_message_at, provider_phone_id')
      .eq('id', conversation_id)
      .eq('org_id', orgId)
      .maybeSingle()

    const platform = conv?.platform || 'whatsapp'
    const providerPhoneId = conv?.provider_phone_id
    
    // Calculate 24-hour messaging window status
    let is24hExpired = false
    if (conv?.last_incoming_message_at) {
      const lastIncomingTime = new Date(conv.last_incoming_message_at).getTime()
      const nowTime = new Date().getTime()
      is24hExpired = (nowTime - lastIncomingTime > 24 * 60 * 60 * 1000)
    } else {
      is24hExpired = true
    }

    // 1. Save outgoing message to DB
    const { data: msg, error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id,
        org_id: orgId,
        phone_number,
        message: message || '',
        direction: 'outgoing',
        timestamp,
        media_url: media_url || null,
        media_type: media_type || null,
        platform,
      })
      .select()
      .single()

    if (msgError) throw msgError

    // 2. Update conversation snippet & timestamp
    await supabaseAdmin
      .from('conversations')
      .update({ 
        last_message: message || (media_type?.startsWith('image') ? '📸 Image' : media_type?.startsWith('audio') ? '🎵 Voice note' : '📎 Attachment'), 
        updated_at: timestamp
      })
      .eq('id', conversation_id)
      .eq('org_id', orgId)

    // 3. Fetch Organization Credentials for Direct Meta Cloud API Dispatch
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('whatsapp_token, whatsapp_phone_id, n8n_reply_webhook_url, n8n_webhook_url')
      .eq('org_id', orgId)
      .single()

    const metaToken = settings?.whatsapp_token
    const metaPhoneId = providerPhoneId || settings?.whatsapp_phone_id

    // Direct Meta Graph API Dispatch Mode (bypasses n8n for manual dashboard replies)
    if (metaToken && metaPhoneId) {
      console.log(`[reply:direct-meta] Dispatching message directly via Meta API for org: ${orgId}, phone: ${phone_number}...`)
      
      let cleanPhone = String(phone_number).replace(/\D/g, '')
      if (cleanPhone.length === 10 && /^[6789]/.test(cleanPhone)) {
        cleanPhone = '91' + cleanPhone
      }

      let metaPayload: any = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
      }

      if (isTemplate) {
        metaPayload.type = 'template'
        metaPayload.template = {
          name: template_name,
          language: { code: template_language || 'en' },
          ...(template_components && Array.isArray(template_components) ? { components: template_components } : {})
        }
      } else if (media_url) {
        const mediaCategory = media_type?.startsWith('image')
          ? 'image'
          : media_type?.startsWith('audio')
          ? 'audio'
          : 'document'

        metaPayload.type = mediaCategory
        metaPayload[mediaCategory] = {
          link: media_url,
          ...(filename || message ? { caption: message || filename } : {})
        }
      } else {
        metaPayload.type = 'text'
        metaPayload.text = { body: message || '' }
      }

      const metaRes = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metaPayload)
      })

      const metaData = await metaRes.json()

      if (metaRes.ok && metaData.messages) {
        console.log(`[reply:direct-meta] Successfully sent message via Meta API! wamid: ${metaData.messages[0]?.id}`)
        return NextResponse.json({ success: true, message: msg, meta_id: metaData.messages[0]?.id })
      } else {
        console.error(`[reply:direct-meta] Meta API error (${metaRes.status}):`, JSON.stringify(metaData))
        // If direct Meta fails, log error but attempt fallback to n8n webhook if present
        if (!settings?.n8n_reply_webhook_url) {
          await supabaseAdmin.from('messages').delete().eq('id', msg.id)
          return NextResponse.json({ 
            error: metaData.error?.message || `Meta API error (${metaRes.status})`
          }, { status: 400 })
        }
      }
    }

    // Fallback: Webhook Routing if direct Meta credentials are not set
    const primaryWebhookUrl = settings?.n8n_reply_webhook_url
    const fallbackWebhookUrl = settings?.n8n_webhook_url || process.env.N8N_BULK_WEBHOOK_URL || 'https://resplendent-rejoicing-production-4b92.up.railway.app/webhook/bulk-sendMulti'

    const payload = {
      conversation_id,
      org_id: orgId,
      phone_number,
      phone: phone_number,
      to: phone_number.replace('+', ''),
      recipient: phone_number,
      message: message || '',
      text: message || '',
      body: message || '',
      media_url: media_url || null,
      url: media_url || null,
      audio_url: media_type?.startsWith('audio') ? media_url : null,
      image_url: media_type?.startsWith('image') ? media_url : null,
      image: media_type?.startsWith('image') ? media_url : null,
      photo: media_type?.startsWith('image') ? media_url : null,
      media: media_url || null,
      attachment: media_url || null,
      file_url: media_url || null,
      link: media_url || null,
      document_url: media_type?.includes('pdf') || media_type?.includes('document') ? media_url : null,
      media_type: media_type || null,
      type: type || (media_url ? (media_type?.includes('pdf') || media_type?.includes('document') ? 'document' : media_type?.split('/')[0]) : 'text'),
      template_name: template_name || null,
      template_language: template_language || null,
      template_components: template_components || null,
      filename: filename || null,
      location_data: location_data || null,
      direction: 'outgoing',
      timestamp,
      platform,
      is_24h_expired: is24hExpired,
      last_incoming_message_at: conv?.last_incoming_message_at || null
    }

    let targetUrl = primaryWebhookUrl || fallbackWebhookUrl
    console.log(`[reply] Sending via Hybrid n8n Flow to ${targetUrl} for org: ${orgId}`)

    let n8nRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!n8nRes.ok && n8nRes.status === 404 && primaryWebhookUrl && primaryWebhookUrl !== fallbackWebhookUrl) {
      console.warn(`[reply] Primary webhook ${primaryWebhookUrl} returned 404. Falling back to ${fallbackWebhookUrl}...`)
      n8nRes = await fetch(fallbackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    if (!n8nRes.ok) {
      const errText = await n8nRes.text()
      console.error(`[reply] n8n Webhook Error (${n8nRes.status}): ${errText}`)
      await supabaseAdmin.from('messages').delete().eq('id', msg.id)
      throw new Error(`n8n webhook error (${n8nRes.status}): ${errText}`)
    }

    return NextResponse.json({ success: true, message: msg })
  } catch (err: any) {
    const error = err?.message || String(err || 'Unknown error')
    return NextResponse.json({ error }, { status: 500 })
  }
}