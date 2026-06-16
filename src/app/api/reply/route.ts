import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { conversation_id, phone_number, message, media_url, media_type } = body

    if (!conversation_id || !phone_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const timestamp = new Date().toISOString()

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
      })
      .select()
      .single()

    if (msgError) throw msgError

    // 2. Update conversation
    await supabaseAdmin
      .from('conversations')
      .update({ 
        last_message: message || (media_type?.startsWith('image') ? '📸 Image' : '📎 Attachment'), 
        updated_at: timestamp,
        ai_mode: false
      })
      .eq('id', conversation_id)
      .eq('org_id', orgId)

    // 3. Get org's n8n reply webhook URL from settings
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('n8n_reply_webhook_url')
      .eq('org_id', orgId)
      .single()

    const n8nUrl = settings?.n8n_reply_webhook_url
    if (n8nUrl) {
      await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number, message, media_url, media_type, direction: 'outgoing', timestamp }),
      })
    }

    return NextResponse.json({ success: true, message_id: msg.id })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}