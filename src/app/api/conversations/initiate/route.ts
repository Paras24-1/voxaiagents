import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'
import { cleanPhone as formatCleanPhone } from '@/lib/osmoPhonebooks'

export async function POST(req: NextRequest) {
  try {
    const internalSecret = req.headers.get('x-internal-secret')
    const body = await req.json()
    
    let orgId = null
    if (internalSecret === (process.env.N8N_WEBHOOK_SECRET || 'internal-ai-reply')) {
      orgId = body.org_id
    } else {
      orgId = await getOrgId(req)
    }

    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { phone, name, template_name, template_lang, variables, message_text, userId } = body

    if (!phone || !template_name || !template_lang) {
      return NextResponse.json({ error: 'Missing required fields: phone, template_name, template_lang' }, { status: 400 })
    }

    const cleanPhone = formatCleanPhone(phone)
    if (!cleanPhone) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    // 1. Fetch organization settings
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('whatsapp_token, whatsapp_phone_id, n8n_reply_webhook_url, n8n_webhook_url, n8n_inbound_webhook_url')
      .eq('org_id', orgId)
      .maybeSingle()

    // 2. Format components for Meta Template message
    const components: any[] = []
    if (variables && Array.isArray(variables) && variables.length > 0) {
      components.push({
        type: 'body',
        parameters: variables.map(v => {
          const val = v !== undefined && v !== null ? String(v).trim() : ''
          return {
            type: 'text',
            text: val.length > 0 ? val : ' '
          }
        })
      })
    }

    let wamid: string | null = null

    // 3. Prefer direct Meta Cloud API dispatch if credentials exist
    if (settings?.whatsapp_token && settings?.whatsapp_phone_id) {
      console.log(`[initiate conversation] Dispatching template directly via Meta Cloud API for org: ${orgId}, phone: ${cleanPhone}`)

      let formattedPhone = cleanPhone
      if (formattedPhone.length === 10 && /^[6789]/.test(formattedPhone)) {
        formattedPhone = '91' + formattedPhone
      }

      const metaPayload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'template',
        template: {
          name: template_name,
          language: { code: template_lang || 'en' },
          ...(components.length > 0 ? { components } : {})
        }
      }

      const metaRes = await fetch(`https://graph.facebook.com/v19.0/${settings.whatsapp_phone_id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.whatsapp_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metaPayload)
      })

      const metaData = await metaRes.json()

      if (!metaRes.ok || !metaData.messages?.[0]?.id) {
        console.error('[initiate conversation] Meta API Error:', JSON.stringify(metaData))
        return NextResponse.json({
          error: metaData.error?.message || `Meta API error (${metaRes.status})`
        }, { status: 400 })
      }

      wamid = metaData.messages[0].id
      console.log(`[initiate conversation] Meta dispatch success, wamid: ${wamid}`)
    } else {
      // Fallback: Webhook dispatch only if direct credentials are not configured
      // Strictly guard against ever calling the inbound chatbot webhook
      const validReplyWebhook = (
        settings?.n8n_reply_webhook_url &&
        settings.n8n_reply_webhook_url !== settings.n8n_inbound_webhook_url &&
        !settings.n8n_reply_webhook_url.startsWith('has_calendar:')
      ) ? settings.n8n_reply_webhook_url : null

      const targetWebhookUrl = 
        settings?.n8n_webhook_url || 
        validReplyWebhook || 
        process.env.N8N_BULK_WEBHOOK_URL || 
        'https://resplendent-rejoicing-production-4b92.up.railway.app/webhook/bulk-sendMulti'

      const n8nRes = await fetch(targetWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          org_id: orgId,
          phone_number: cleanPhone,
          type: 'template',
          template_name,
          template_language: template_lang,
          template_components: components,
          message: message_text || `Template: ${template_name}`,
          direction: 'outgoing',
          timestamp: new Date().toISOString()
        })
      })

      if (!n8nRes.ok) {
        const errText = await n8nRes.text()
        console.error('[initiate conversation] n8n Webhook Error:', errText)
        return NextResponse.json({ error: `n8n webhook error: ${errText}` }, { status: 400 })
      }
    }

    const resolvedMessageText = message_text || `Template: ${template_name}`

    // 4. Upsert conversation record
    const { data: conv, error: convError } = await supabaseAdmin
      .from('conversations')
      .upsert({
        phone_number: cleanPhone,
        name: name || cleanPhone,
        last_message: resolvedMessageText,
        org_id: orgId,
        unread_count: 0,
        ai_mode: false,
        stage: 'new',
        updated_at: new Date().toISOString(),
        ...(userId ? { assigned_to: userId, assignment_status: 'assigned' } : {})
      }, { onConflict: 'phone_number,org_id' })
      .select()
      .single()

    if (convError) throw convError

    // 5. Upsert lead record
    const { error: leadError } = await supabaseAdmin
      .from('leads')
      .upsert({
        conversation_id: conv.id,
        org_id: orgId,
        phone_number: cleanPhone,
        name: name || cleanPhone
      }, { onConflict: 'conversation_id' })

    if (leadError) throw leadError

    // 6. Insert outgoing template message record
    const { error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conv.id,
        org_id: orgId,
        phone_number: cleanPhone,
        message: resolvedMessageText,
        direction: 'outgoing',
        timestamp: new Date().toISOString(),
        provider_message_id: wamid || null,
        status: wamid ? 'sent' : 'pending'
      })

    if (msgError) throw msgError

    // 7. Establish assignment configuration if user is selected
    if (userId) {
      await supabaseAdmin
        .from('conversation_assignments')
        .upsert({
          conversation_id: conv.id,
          org_id: orgId,
          assigned_to: userId,
          status: 'active'
        }, { onConflict: 'conversation_id' })

      await supabaseAdmin
        .from('assignment_logs')
        .insert({
          conversation_id: conv.id,
          org_id: orgId,
          user_id: userId,
          action: 'assigned',
          details: 'Initiated conversation via template'
        })
    }

    return NextResponse.json({ success: true, conversation: conv })
  } catch (err: any) {
    console.error('[initiate conversation] Exception:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
