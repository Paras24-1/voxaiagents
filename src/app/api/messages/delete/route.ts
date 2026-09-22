import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function DELETE(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    let messageId = searchParams.get('id')

    if (!messageId) {
      try {
        const body = await req.json()
        messageId = body?.id || body?.message_id
      } catch {}
    }

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    // 1. Fetch message to check org ownership and capture conversation_id
    const { data: msg, error: fetchErr } = await supabaseAdmin
      .from('messages')
      .select('id, conversation_id, org_id')
      .eq('id', messageId)
      .eq('org_id', orgId)
      .maybeSingle()

    if (fetchErr) throw fetchErr
    if (!msg) {
      return NextResponse.json({ error: 'Message not found or unauthorized' }, { status: 404 })
    }

    const conversationId = msg.conversation_id

    // 2. Delete message from database
    const { error: deleteErr } = await supabaseAdmin
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('org_id', orgId)

    if (deleteErr) throw deleteErr

    // 3. Recalculate and update last_message for the conversation
    if (conversationId) {
      const { data: latestMsg } = await supabaseAdmin
        .from('messages')
        .select('message, media_type, timestamp')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle()

      const snippet = latestMsg
        ? (latestMsg.message || (latestMsg.media_type?.startsWith('image') ? '📸 Image' : latestMsg.media_type ? '📎 Media' : '💬 Message'))
        : ''

      await supabaseAdmin
        .from('conversations')
        .update({ 
          last_message: snippet,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .eq('org_id', orgId)
    }

    return NextResponse.json({ success: true, id: messageId, conversation_id: conversationId })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
