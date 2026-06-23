import { NextRequest, NextResponse } from 'next/server'
import { supabaseVoiceAdmin, supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!supabaseVoiceAdmin) {
      return NextResponse.json({ error: 'Voice service is not configured' }, { status: 501 })
    }

    const { campaignId } = await req.json()
    if (!campaignId) {
      return NextResponse.json({ error: 'Missing required parameter: campaignId' }, { status: 400 })
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

    // 1. Verify that the campaign belongs to this organization
    const { data: campaign, error: campError } = await supabaseVoiceAdmin
      .from('campaigns')
      .select('id')
      .eq('id', campaignId)
      .eq('organization_id', voiceOrgId)
      .single()

    if (campError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 })
    }

    // Determine the gateway API URL from environment variables
    let gatewayUrl = process.env.GATEWAY_URL
    if (!gatewayUrl && process.env.NEXT_PUBLIC_WS_URL) {
      gatewayUrl = process.env.NEXT_PUBLIC_WS_URL
        .replace(/^ws/, 'http')
        .replace('/webRTC-stream', '')
    }

    const urlsToTry = gatewayUrl
      ? [gatewayUrl]
      : ['http://localhost:5050', 'http://localhost:8080']

    let lastError: any = null
    let response: Response | null = null

    for (const url of urlsToTry) {
      try {
        console.log(`[API/Voice/Campaigns/Pause] Forwarding request to: ${url}/api/campaigns/pause`)
        response = await fetch(`${url}/api/campaigns/pause`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ campaignId })
        })
        if (response.ok) break
      } catch (err) {
        lastError = err
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: `Dialer gateway connection failed. Error: ${lastError?.message || 'Response not OK'}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err: any) {
    const error = err?.message || err?.details || String(err) || 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
