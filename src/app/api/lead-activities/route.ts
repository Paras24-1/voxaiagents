import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/lead-activities?lead_id=xxx or ?conversation_id=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let leadId = searchParams.get('lead_id')
    const conversationId = searchParams.get('conversation_id')

    if (!leadId && conversationId) {
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .select('id')
        .eq('conversation_id', conversationId)
        .maybeSingle()
      if (lead?.id) {
        leadId = lead.id
      }
    }

    if (!leadId) {
      return NextResponse.json([])
    }

    const { data, error } = await supabaseAdmin
      .from('lead_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

// POST /api/lead-activities
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { lead_id, conversation_id, activity_type, description, notes } = body

    if (!lead_id && conversation_id) {
      let { data: lead } = await supabaseAdmin
        .from('leads')
        .select('id')
        .eq('conversation_id', conversation_id)
        .maybeSingle()

      if (!lead) {
        const { data: conv } = await supabaseAdmin
          .from('conversations')
          .select('id, phone_number, name, org_id')
          .eq('id', conversation_id)
          .maybeSingle()
        if (conv) {
          const { data: newLead } = await supabaseAdmin
            .from('leads')
            .insert({
              conversation_id: conv.id,
              phone_number: conv.phone_number,
              customer_name: conv.name || 'Lead',
              org_id: conv.org_id
            })
            .select()
            .single()
          lead = newLead
        }
      }
      if (lead?.id) {
        lead_id = lead.id
      }
    }

    if (!lead_id || !activity_type || !description) {
      return NextResponse.json(
        { error: 'lead_id, activity_type, and description are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('lead_activities')
      .insert({
        lead_id,
        activity_type,
        description,
        notes,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

// PATCH /api/lead-activities
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, description, notes } = body

    if (!id || !description) {
      return NextResponse.json(
        { error: 'id and description are required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('lead_activities')
      .update({ description, notes })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}

// DELETE /api/lead-activities?id=xxx
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('lead_activities')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
