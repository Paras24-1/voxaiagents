import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// PATCH /api/takeover
// Body: { conversation_id?: string, conversation_ids?: string[], ai_mode: boolean }
export async function PATCH(req: NextRequest) {
  try {
    const { conversation_id, conversation_ids, ai_mode } = await req.json()

    const idsToUpdate: string[] = Array.isArray(conversation_ids)
      ? conversation_ids.filter(Boolean)
      : conversation_id
      ? [conversation_id]
      : []

    if (idsToUpdate.length === 0 || typeof ai_mode !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing conversation_id(s) or ai_mode' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('conversations')
      .update({ ai_mode, updated_at: new Date().toISOString() })
      .in('id', idsToUpdate)

    if (error) throw error
    return NextResponse.json({ success: true, ai_mode, count: idsToUpdate.length })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
