import { NextRequest, NextResponse } from 'next/server'
import { supabaseVoiceAdmin, supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!supabaseVoiceAdmin) {
      return NextResponse.json({ error: 'Voice service is not configured' }, { status: 501 })
    }

    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaignId')
    if (!campaignId) {
      return NextResponse.json({ error: 'Missing query parameter: campaignId' }, { status: 400 })
    }

    // Retrieve mapped voice_org_id
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('voice_org_id')
      .eq('id', orgId)
      .single()

    if (orgError || !orgData?.voice_org_id) {
      return NextResponse.json({ error: 'Voice service is not linked for this organization' }, { status: 404 })
    }

    const voiceOrgId = orgData.voice_org_id

    // 1. Verify that the campaign belongs to this organization in Voice SaaS DB (Account B)
    const { data: campaign, error: campError } = await supabaseVoiceAdmin
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('organization_id', voiceOrgId)
      .single()

    if (campError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 })
    }

    // 2. Fetch contacts associated with this campaign
    const { data: contacts, error: contactsError } = await supabaseVoiceAdmin
      .from('campaign_contacts')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: true })

    if (contactsError) throw contactsError

    return NextResponse.json(contacts || [])
  } catch (err: any) {
    const error = err?.message || err?.details || String(err) || 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
