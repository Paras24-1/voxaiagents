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
    
    // ENFORCE 24 HOUR WINDOW RULE FOR WHATSAPP (TEMPLATES BYPASS THIS RULE)
    if (platform === 'whatsapp' && !isTemplate) {
      if (!conv?.last_incoming_message_at) {
         return NextResponse.json({ error: '24-hour messaging window is closed. User must send a message first, or use a template.' }, { status: 400 })
      }
      
      const lastIncomingTime = new Date(conv.last_incoming_message_at).getTime()
      const nowTime = new Date().getTime()
      
      if (nowTime - lastIncomingTime > 24 * 60 * 60 * 1000) {
         return NextResponse.json({ error: '24-hour messaging window has expired. You can only send template messages to this user.' }, { status: 400 })
      }
    }

    // 1. Save outgoing message
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

    // 2. Update conversation
    await supabaseAdmin
      .from('conversations')
      .update({ 
        last_message: message || (media_type?.startsWith('image') ? '📸 Image' : media_type?.startsWith('audio') ? '🎵 Voice note' : '📎 Attachment'), 
        updated_at: timestamp
      })
      .eq('id', conversation_id)
      .eq('org_id', orgId)

    // 3. Fetch Delivery Settings (Meta Native or n8n Fallback)
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('n8n_reply_webhook_url, whatsapp_token, whatsapp_phone_id')
      .eq('org_id', orgId)
      .single()

    const whatsapp_token = settings?.whatsapp_token
    const n8n_reply_webhook_url = settings?.n8n_reply_webhook_url
    
    // Use the specific phone ID that the customer originally messaged, fallback to the default org setting
    const active_phone_id = providerPhoneId || settings?.whatsapp_phone_id

    // Priority 1: Native Meta/WhatsApp Cloud API
    if (whatsapp_token && active_phone_id) {
      console.log(`[reply] Sending natively via WhatsApp Cloud API for org: ${orgId} using phone ID: ${active_phone_id}`)
      
      let determinedType = type || (media_url ? (media_type?.includes('pdf') || media_type?.includes('document') ? 'document' : media_type?.split('/')[0]) : 'text')
      if (isTemplate) determinedType = 'template'
      if (type === 'location' || location_data) determinedType = 'location'
      
      const payload: any = {
        messaging_product: 'whatsapp',
        to: phone_number.replace('+', ''), // Meta requires phone without +
        type: determinedType
      }

      if (payload.type === 'template') {
        payload.template = {
          name: template_name,
          language: { code: template_language || 'en' },
          components: template_components || []
        }
      } else if (payload.type === 'location') {
        const loc = location_data || {}
        payload.location = {
          latitude: String(loc.latitude || '28.6139'),
          longitude: String(loc.longitude || '77.2090'),
          name: loc.name || 'Location',
          address: loc.address || ''
        }
      } else if (payload.type === 'text') {
        payload.text = { body: message }
      } else if (payload.type === 'audio') {
        // Meta Cloud API supports direct HTTPS links for audio
        payload.audio = { link: media_url }
      } else if (payload.type === 'document') {
        payload.document = { 
          link: media_url,
          filename: filename || 'Document.pdf'
        }
        if (message) payload.document.caption = message
      } else {
        // e.g. type 'image', 'video'
        payload[payload.type] = { link: media_url }
        if (message) payload[payload.type].caption = message
      }

      let metaRes = await fetch(`https://graph.facebook.com/v20.0/${active_phone_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsapp_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      // Fallback for audio: If direct link fails, upload to Meta Media API using native File
      if (!metaRes.ok && payload.type === 'audio' && media_url) {
        console.warn(`[reply] Direct link audio send returned error, trying Meta Media API upload fallback...`)
        try {
          const audioRes = await fetch(media_url)
          if (audioRes.ok) {
            const audioBuffer = await audioRes.arrayBuffer()
            const audioFile = new File([audioBuffer], filename || 'voicenote.mp3', { type: media_type || 'audio/mpeg' })
            
            const formData = new FormData()
            formData.append('messaging_product', 'whatsapp')
            formData.append('type', media_type || 'audio/mpeg')
            formData.append('file', audioFile)

            const uploadRes = await fetch(`https://graph.facebook.com/v20.0/${active_phone_id}/media`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${whatsapp_token}` },
              body: formData
            })

            if (uploadRes.ok) {
              const uploadData = await uploadRes.json()
              console.log(`[reply] Audio uploaded to Meta fallback, media_id: ${uploadData.id}`)
              payload.audio = { id: uploadData.id }
              
              metaRes = await fetch(`https://graph.facebook.com/v20.0/${active_phone_id}/messages`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${whatsapp_token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
              })
            }
          }
        } catch (fallbackErr) {
          console.error(`[reply] Meta audio upload fallback failed:`, fallbackErr)
        }
      }

      if (!metaRes.ok) {
        const errorText = await metaRes.text()
        console.error(`[reply] Meta API Error: ${errorText}`)
        // Rollback inserted message so phantom messages don't remain in DB
        await supabaseAdmin.from('messages').delete().eq('id', msg.id)
        throw new Error(`Meta API Error: ${errorText}`)
      }

      // Capture provider_message_id to support delivery ticks
      const metaData = await metaRes.json()
      const wamid = metaData?.messages?.[0]?.id
      
      if (wamid) {
        await supabaseAdmin
          .from('messages')
          .update({ provider_message_id: wamid })
          .eq('id', msg.id)
      }
    } 
    // Priority 2: Legacy n8n Webhook Fallback
    else if (n8n_reply_webhook_url) {
      console.log(`[reply] Sending via n8n fallback for org: ${orgId}`)
      const n8nRes = await fetch(n8n_reply_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number, message, media_url, media_type, direction: 'outgoing', timestamp, platform }),
      })
      if (!n8nRes.ok) {
        await supabaseAdmin.from('messages').delete().eq('id', msg.id)
        throw new Error(`n8n webhook error: ${await n8nRes.text()}`)
      }
    }

    return NextResponse.json({ success: true, message: msg })
  } catch (err: any) {
    const error = err?.message || String(err || 'Unknown error')
    return NextResponse.json({ error }, { status: 500 })
  }
}