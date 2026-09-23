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

    // 3. Fetch Delivery Settings (Hybrid n8n Flow)
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('n8n_reply_webhook_url, n8n_webhook_url')
      .eq('org_id', orgId)
      .single()

    const targetWebhookUrl = 
      settings?.n8n_reply_webhook_url || 
      settings?.n8n_webhook_url || 
      process.env.N8N_BULK_WEBHOOK_URL || 
      'https://resplendent-rejoicing-production-4b92.up.railway.app/webhook/bulk-sendMulti'

    console.log(`[reply] Sending via Hybrid n8n Flow to ${targetWebhookUrl} for org: ${orgId}`)

    const n8nRes = await fetch(targetWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id,
        org_id: orgId,
        phone_number,
        message: message || '',
        media_url: media_url || null,
        media_type: media_type || null,
        type: type || null,
        template_name: template_name || null,
        template_language: template_language || null,
        template_components: template_components || null,
        filename: filename || null,
        location_data: location_data || null,
        direction: 'outgoing',
        timestamp,
        platform
      }),
    })

    if (!n8nRes.ok) {
      const errText = await n8nRes.text()
      console.error(`[reply] n8n Webhook Error: ${errText}`)
      // Rollback inserted message so phantom messages don't remain in DB if n8n fails
      await supabaseAdmin.from('messages').delete().eq('id', msg.id)
      throw new Error(`n8n webhook error: ${errText}`)
    }

    return NextResponse.json({ success: true, message: msg })
  } catch (err: any) {
    const error = err?.message || String(err || 'Unknown error')
    return NextResponse.json({ error }, { status: 500 })
  }
}