import { NextRequest, NextResponse } from 'next/server'
import { supabaseVoice, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!supabaseVoice) {
      return NextResponse.json({ error: 'Voice service is not configured' }, { status: 501 })
    }

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
      .eq('organization_id', orgId)
      .gte('created_at', since)

    if (countError) throw countError

    // 2. Fetch all logs for duration and cost totals
    const { data: allBilling, error: billingError } = await supabaseVoice
      .from('call_logs')
      .select('duration_seconds, cost')
      .eq('organization_id', orgId)

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
