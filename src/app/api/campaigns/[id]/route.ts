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
    
    // Verify ownership of the campaign first
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .eq('id', id)
      .eq('org_id', orgId)
      .maybeSingle()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Delete related campaign contacts first
    await supabaseAdmin
      .from('campaign_contacts')
      .delete()
      .eq('campaign_id', id)
      .eq('org_id', orgId)

    const { error } = await supabaseAdmin
      .from('campaigns')
      .delete()
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
