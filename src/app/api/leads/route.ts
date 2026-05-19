import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversation_id')
    if (!conversationId) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('org_id', orgId)
      .maybeSingle()

    if (error) throw error
    return NextResponse.json(data || {})
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { conversation_id, ...updates } = await req.json()
    if (!conversation_id) return NextResponse.json({ error: 'conversation_id required' }, { status: 400 })

    const { data, error } = await supabaseAdmin
      .from('leads')
      .update(updates)
      .eq('conversation_id', conversation_id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) throw error

    if (updates.name || updates.stage) {
      await supabaseAdmin
        .from('conversations')
        .update({
          ...(updates.name  ? { name: updates.name }   : {}),
          ...(updates.stage ? { stage: updates.stage } : {}),
        })
        .eq('id', conversation_id)
        .eq('org_id', orgId)
    }

    return NextResponse.json(data)
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}