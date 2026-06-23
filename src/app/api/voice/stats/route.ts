import { NextRequest, NextResponse } from 'next/server'
import { supabaseVoice, supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  console.log('[API/Voice/Stats] GET request received');
  try {
    const orgId = await getOrgId(req)
    console.log('[API/Voice/Stats] Resolved primary orgId:', orgId);
    if (!orgId) {
      console.warn('[API/Voice/Stats] Unauthorized: Failed to resolve orgId from request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!supabaseVoice) {
      console.warn('[API/Voice/Stats] Service not configured: supabaseVoice is null');
      return NextResponse.json({ error: 'Voice service is not configured' }, { status: 501 })
    }

    // Retrieve the mapped Voice SaaS Organization ID from the main database
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('voice_org_id')
      .eq('id', orgId)
      .single()

    if (orgError) {
      console.error('[API/Voice/Stats] Database error fetching organization voice_org_id:', orgError);
      return NextResponse.json({ error: 'Voice service is not linked for this organization' }, { status: 404 })
    }

    if (!orgData?.voice_org_id) {
      console.warn('[API/Voice/Stats] voice_org_id is null/undefined in database for orgId:', orgId);
      return NextResponse.json({ error: 'Voice service is not linked for this organization' }, { status: 404 })
    }

    const voiceOrgId = orgData.voice_org_id;
    console.log('[API/Voice/Stats] Successfully mapped to voiceOrgId:', voiceOrgId);

    const { searchParams } = new URL(req.url)
    const timeRange = searchParams.get('timeRange') || '7d'

    // Determine time filter
    const now = new Date()
    const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30
    const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString()

    // 1. Get EXACT total call count
    const { count: exactTotalCalls, error: countError } = await supabaseVoice
      .from('call_logs')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', voiceOrgId)
      .gte('created_at', since)

    if (countError) {
      console.error('[API/Voice/Stats] Error querying exact call logs count from Voice DB:', countError);
      throw countError
    }

    console.log(`[API/Voice/Stats] Exact total calls count: ${exactTotalCalls} for voiceOrgId: ${voiceOrgId}`);

    // 2. Fetch all logs for duration and cost totals
    const { data: allBilling, error: billingError } = await supabaseVoice
      .from('call_logs')
      .select('duration_seconds, cost')
      .eq('organization_id', voiceOrgId)

    if (billingError) throw billingError

    const billingArr = allBilling || []
    const totalDurationSeconds = billingArr.reduce((sum, l) => sum + (l.duration_seconds || 0), 0)
    const totalMinutes = totalDurationSeconds / 60
    const totalCost = billingArr.reduce((sum, l) => sum + (Number(l.cost) || 0), 0)
    const avgDuration = billingArr.length > 0 ? Math.round(totalDurationSeconds / billingArr.length) : 0

    return NextResponse.json({
      totalCalls: exactTotalCalls || 0,
      totalMinutes: Number(totalMinutes.toFixed(2)),
      minutesLimit: 600,
      avgDuration,
      totalCost: Number(totalCost.toFixed(2))
    })
  } catch (err: any) {
    const error = err?.message || err?.details || String(err) || 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
