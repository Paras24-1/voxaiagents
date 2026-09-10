import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile } from '@/lib/supabase'
import { isOsmoOrg, syncOsmoPhonebooks } from '@/lib/osmoPhonebooks'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 })
    }

    const isStaffEmployee = profile.role !== 'owner' && profile.role !== 'admin'

    // Verify ownership of conversation first
    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id, assigned_to')
      .eq('id', id)
      .eq('org_id', profile.orgId)
      .maybeSingle()

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (isStaffEmployee && conv.assigned_to !== profile.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only delete conversations assigned to you' }, { status: 403 })
    }

    // 1. Delete assignment logs associated with this conversation
    await supabaseAdmin.from('assignment_logs').delete().eq('conversation_id', id)

    // 2. Delete conversation assignments associated with this conversation
    await supabaseAdmin.from('conversation_assignments').delete().eq('conversation_id', id)

    // 3. Since lead_activities is a child table referencing leads, find lead ID and delete activities first
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('conversation_id', id)
      .maybeSingle()

    if (lead) {
      await supabaseAdmin.from('lead_activities').delete().eq('lead_id', lead.id)
    }

    // 4. Delete leads
    await supabaseAdmin.from('leads').delete().eq('conversation_id', id)

    // 5. Delete messages
    await supabaseAdmin.from('messages').delete().eq('conversation_id', id)

    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('org_id', profile.orgId)

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
    const profile = await getUserProfile(req)
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const body = await req.json()
    const isStaffEmployee = profile.role !== 'owner' && profile.role !== 'admin'

    const { data: conv } = await supabaseAdmin
      .from('conversations')
      .select('id, assigned_to, metadata, phone_number')
      .eq('id', id)
      .eq('org_id', profile.orgId)
      .maybeSingle()

    if (!conv) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    if (isStaffEmployee && conv.assigned_to !== profile.userId) {
      return NextResponse.json({ error: 'Forbidden: You can only update conversations assigned to you' }, { status: 403 })
    }

    // Only allow updating safe fields
    const allowedUpdates = isStaffEmployee 
      ? ['stage', 'notes', 'lead_type', 'metadata'] 
      : ['stage', 'notes', 'assigned_to', 'assignment_status', 'lead_type', 'metadata']
    
    const filteredBody: Record<string, any> = {}
    for (const key of allowedUpdates) {
      if (key in body) {
        filteredBody[key] = body[key]
      }
    }

    // Handle explicit lead_type update
    if (body.lead_type !== undefined) {
      let convMeta = conv.metadata || {}
      if (typeof convMeta === 'string') {
        try { convMeta = JSON.parse(convMeta) } catch {}
      }
      convMeta = { ...convMeta, lead_type: body.lead_type }
      filteredBody.metadata = convMeta

      // Also update linked lead record metadata if it exists
      const { data: linkedLead } = await supabaseAdmin
        .from('leads')
        .select('id, metadata')
        .eq('conversation_id', id)
        .maybeSingle()

      if (linkedLead) {
        let leadMeta = linkedLead.metadata || {}
        if (typeof leadMeta === 'string') {
          try { leadMeta = JSON.parse(leadMeta) } catch {}
        }
        leadMeta = { ...leadMeta, lead_type: body.lead_type }
        await supabaseAdmin
          .from('leads')
          .update({ metadata: leadMeta })
          .eq('id', linkedLead.id)
      }
    }

    const { error } = await supabaseAdmin
      .from('conversations')
      .update(filteredBody)
      .eq('id', id)
      .eq('org_id', profile.orgId)

    if (error) throw error

    // Sync Osmo Phonebooks in background if lead_type was updated
    if (body.lead_type !== undefined) {
      isOsmoOrg(profile.orgId).then((isOsmo) => {
        if (isOsmo) syncOsmoPhonebooks(profile.orgId).catch(console.error)
      }).catch(() => {})
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

