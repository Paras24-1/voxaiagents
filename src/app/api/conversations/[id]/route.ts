import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    // Verify ownership of conversation first
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('id', id)
      .eq('org_id', orgId)
      .maybeSingle()

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    await supabaseAdmin.from('leads').delete().eq('conversation_id', id)
    await supabaseAdmin.from('messages').delete().eq('conversation_id', id)

    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const body = await req.json()

    // Only allow updating safe fields
    const allowedUpdates = ['stage', 'notes', 'assigned_to', 'assignment_status']
    const filteredBody: Record<string, any> = {}
    for (const key of allowedUpdates) {
      if (key in body) {
        filteredBody[key] = body[key]
      }
    }

    const { error } = await supabaseAdmin
      .from('conversations')
      .update(filteredBody)
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

