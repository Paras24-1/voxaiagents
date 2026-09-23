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
      .select('n8n_reply_webhook_url, n8n_webhook_url')
      .eq('org_id', orgId)
      .maybeSingle()

    const targetWebhookUrl = 
      settings?.n8n_reply_webhook_url || 
      settings?.n8n_webhook_url || 
      process.env.N8N_BULK_WEBHOOK_URL || 
      'https://resplendent-rejoicing-production-4b92.up.railway.app/webhook/bulk-sendMulti'

    // 2. Format components for Meta Template message
    const components: any[] = []
    if (variables && Array.isArray(variables) && variables.length > 0) {
      components.push({
        type: 'body',
        parameters: variables.map(v => ({
          type: 'text',
          text: String(v)
        }))
      })
    }

    // 3. Send template message via n8n hybrid flow
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
        timestamp: new Date().toISOString()
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
