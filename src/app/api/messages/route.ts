import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversation_id')
    if (!conversationId) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 })

    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 300)

    // Fast-path: query directly by conversation_id first (1 round-trip)
    const { data: directMsgs, error: directErr } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (directErr) throw directErr

    let finalMsgs = directMsgs || []
    let conv: { phone_number?: string | null; last_message?: string | null; created_at?: string | null } | null = null

    // Fallback only if no messages found directly under this conversation ID
    if (finalMsgs.length === 0) {
      const { data: convData } = await supabaseAdmin
        .from('conversations')
        .select('phone_number, last_message, created_at')
        .eq('id', conversationId)
        .eq('org_id', orgId)
        .maybeSingle()
      conv = convData

      let allConvIds = [conversationId]
      if (conv?.phone_number) {
        const cleanP = conv.phone_number.replace(/\D/g, '').slice(-10)
        if (cleanP.length >= 10) {
          const { data: dupes } = await supabaseAdmin
            .from('conversations')
            .select('id')
            .ilike('phone_number', `%${cleanP}`)
            .eq('org_id', orgId)

          if (dupes && dupes.length > 0) {
            allConvIds = dupes.map(d => d.id)
            const { data: dupeMsgs } = await supabaseAdmin
              .from('messages')
              .select('*')
              .in('conversation_id', allConvIds)
              .order('timestamp', { ascending: false })
              .limit(limit)
            finalMsgs = dupeMsgs || []
          }
        }
      }
    }

    // Deduplicate by message content + timestamp (within 2s window) to avoid showing
    // the same bot message that may have been logged in multiple conversation records
    const seen = new Map<string, boolean>()
    const deduped = finalMsgs.filter(msg => {
      // Create a fingerprint: direction + message content + rounded timestamp (2s window)
      const ts = Math.floor(new Date(msg.timestamp).getTime() / 2000)
      const key = `${msg.direction}|${(msg.message || '').trim()}|${ts}`
      if (seen.has(key)) return false
      seen.set(key, true)
      return true
    })

    // Fallback: If 0 messages found in messages table, but last_message exists in conversations table
    if (deduped.length === 0 && conv?.last_message) {
      const synthesizedMsg = {
        id: `fallback-${conversationId}`,
        conversation_id: conversationId,
        message: conv.last_message,
        direction: 'outbound',
        status: 'delivered',
        timestamp: conv.created_at || new Date().toISOString(),
        media_url: null,
        media_type: null,
        org_id: orgId
      }
      return NextResponse.json([synthesizedMsg])
    }

    // Reverse the array so the oldest messages are first, matching the UI's expected chronological order
    return NextResponse.json(deduped.reverse())
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}