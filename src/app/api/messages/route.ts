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

    // 1. Get the phone number for this conversation
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('phone_number')
      .eq('id', conversationId)
      .eq('org_id', orgId)
      .maybeSingle()

    // 3. Find ALL conversation IDs for this phone number in this org
    //    This merges messages across duplicate conversation records
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
        }
      }
    }

    // 4. Fetch messages from ALL matching conversations and deduplicate
    const { data, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .in('conversation_id', allConvIds)
      .order('timestamp', { ascending: false }) // Fetch newest first to prevent cutting off new messages
      .limit(500)

    if (error) throw error

    // Deduplicate by message content + timestamp (within 2s window) to avoid showing
    // the same bot message that may have been logged in multiple conversation records
    const seen = new Map<string, boolean>()
    const deduped = (data || []).filter(msg => {
      // Create a fingerprint: direction + message content + rounded timestamp (2s window)
      const ts = Math.floor(new Date(msg.timestamp).getTime() / 2000)
      const key = `${msg.direction}|${(msg.message || '').trim()}|${ts}`
      if (seen.has(key)) return false
      seen.set(key, true)
      return true
    })

    // Reverse the array so the oldest messages are first, matching the UI's expected chronological order
    return NextResponse.json(deduped.reverse())
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}