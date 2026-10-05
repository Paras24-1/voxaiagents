import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { conversation_ids, phone_numbers, assigned_to } = await req.json()

    let convIdsToUpdate: string[] = Array.isArray(conversation_ids) ? conversation_ids : []
    const phones: string[] = Array.isArray(phone_numbers) ? phone_numbers : []

    if (convIdsToUpdate.length === 0 && phones.length === 0) {
      return NextResponse.json({ error: 'No conversations or phone numbers provided' }, { status: 400 })
    }

    // If phone numbers provided, resolve missing conversation IDs
    if (phones.length > 0) {
      const { data: convs } = await supabaseAdmin
        .from('conversations')
        .select('id, phone_number')
        .eq('org_id', orgId)
        .in('phone_number', phones)

      if (convs) {
        const foundIds = convs.map(c => c.id)
        convIdsToUpdate = Array.from(new Set([...convIdsToUpdate, ...foundIds]))
      }
    }

    if (convIdsToUpdate.length === 0) {
      return NextResponse.json({ error: 'No matching conversations found' }, { status: 404 })
    }

    // Get current user (admin/owner)
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    let adminId = null
    if (token) {
      const { data: { user } } = await supabaseAdmin.auth.getUser(token)
      adminId = user?.id
    }

    const targetAssignedTo = assigned_to || null
    const targetStatus = targetAssignedTo ? 'assigned' : 'unassigned'

    // Update conversations in batches of 200
    const BATCH_SIZE = 200
    let updatedCount = 0

    for (let i = 0; i < convIdsToUpdate.length; i += BATCH_SIZE) {
      const batch = convIdsToUpdate.slice(i, i + BATCH_SIZE)

      const { error: convError } = await supabaseAdmin
        .from('conversations')
        .update({
          assigned_to: targetAssignedTo,
          assignment_status: targetStatus
        })
        .eq('org_id', orgId)
        .in('id', batch)

      if (convError) throw convError
      updatedCount += batch.length

      // Upsert assignment records if assigned
      if (targetAssignedTo) {
        const assignPayload = batch.map(cId => ({
          conversation_id: cId,
          org_id: orgId,
          assigned_to: targetAssignedTo,
          assigned_by: adminId,
          status: 'active',
          assigned_at: new Date().toISOString()
        }))

        await supabaseAdmin
          .from('conversation_assignments')
          .upsert(assignPayload, { onConflict: 'conversation_id' })
      }
    }

    return NextResponse.json({
      success: true,
      updated_count: updatedCount
    })
  } catch (err: any) {
    console.error('[bulk assignment error]', err)
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 })
  }
}
