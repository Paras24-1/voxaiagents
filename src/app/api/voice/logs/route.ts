import { NextRequest, NextResponse } from 'next/server'
import { supabaseVoice, supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  console.log('[API/Voice/Logs] GET request received');
  try {
    const orgId = await getOrgId(req)
    console.log('[API/Voice/Logs] Resolved primary orgId:', orgId);
    if (!orgId) {
      console.warn('[API/Voice/Logs] Unauthorized: Failed to resolve orgId from request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseVoice) {
      console.warn('[API/Voice/Logs] Service not configured: supabaseVoice is null');
      return NextResponse.json({ error: 'Voice service is not configured' }, { status: 501 })
    }

    // Retrieve the mapped Voice SaaS Organization ID from the main database
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('voice_org_id')
      .eq('id', orgId)
      .single()

    if (orgError) {
      console.error('[API/Voice/Logs] Database error fetching organization voice_org_id:', orgError);
      return NextResponse.json({ error: 'Voice service is not linked for this organization' }, { status: 404 })
    }

    if (!orgData?.voice_org_id) {
      console.warn('[API/Voice/Logs] voice_org_id is null/undefined in database for orgId:', orgId);
      return NextResponse.json({ error: 'Voice service is not linked for this organization' }, { status: 404 })
    }

    const voiceOrgId = orgData.voice_org_id;
    console.log('[API/Voice/Logs] Successfully mapped to voiceOrgId:', voiceOrgId);

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')

    const { data, error } = await supabaseVoice
      .from('call_logs')
      .select('*, agents(name)')
      .eq('organization_id', voiceOrgId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[API/Voice/Logs] Error querying call logs from Voice DB:', error);
      throw error
    }

    console.log(`[API/Voice/Logs] Successfully fetched ${data?.length || 0} call logs for voiceOrgId: ${voiceOrgId}`);
    return NextResponse.json(data || [])
  } catch (err: any) {
    const error = err?.message || err?.details || String(err) || 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
