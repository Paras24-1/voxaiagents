import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { conversation_id, phone_number, message, scheduled_at, media_url, media_type, filename } = body

    if (!conversation_id || !phone_number || !scheduled_at) {
      return NextResponse.json({ error: 'Missing required fields: conversation_id, phone_number, scheduled_at' }, { status: 400 })
    }

    if (!message && !media_url) {
      return NextResponse.json({ error: 'Message content or media attachment is required' }, { status: 400 })
    }

    const scheduledTime = new Date(scheduled_at).getTime()
    const nowTime = Date.now()

    if (isNaN(scheduledTime) || scheduledTime <= nowTime + 5000) {
      return NextResponse.json({ error: 'Scheduled time must be at least 10 seconds in the future' }, { status: 400 })
    }

    // Verify conversation ownership
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('id', conversation_id)
      .eq('org_id', orgId)
      .maybeSingle()

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found or unauthorized' }, { status: 404 })
    }

    // Insert into scheduled_messages
    const { data, error } = await supabaseAdmin
      .from('scheduled_messages')
      .insert({
        org_id: orgId,
        conversation_id,
        phone_number,
        message: message || '',
        media_url: media_url || null,
        media_type: media_type || null,
        filename: filename || null,
        scheduled_at: new Date(scheduledTime).toISOString(),
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, scheduled_message: data })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversation_id')
    const status = searchParams.get('status') || 'pending'

    let query = supabaseAdmin
      .from('scheduled_messages')
      .select('*')
      .eq('org_id', orgId)
      .order('scheduled_at', { ascending: true })

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await req.json()
        id = body?.id
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'Scheduled message ID required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('scheduled_messages')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    return NextResponse.json({ success: true, id })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
