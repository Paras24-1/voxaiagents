import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch employees
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role')
      .eq('org_id', orgId)

    if (usersError) throw usersError

    const employeeList = (users || []).filter((u: any) => u.role === 'employee')

    // 2. Fetch total active and completed assignments
    const [
      { count: totalActive },
      { count: totalCompleted }
    ] = await Promise.all([
      supabaseAdmin
        .from('conversation_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'active'),
      supabaseAdmin
        .from('conversation_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'completed')
    ])

    // 3. Fetch general conversation counts
    const [
      { count: totalConversations },
      { count: totalAssigned },
      { count: totalUnassignedRaw }
    ] = await Promise.all([
      supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId),
      supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .not('assigned_to', 'is', null),
      supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .is('assigned_to', null)
    ])

    const totalConvCount = totalConversations || 0
    const totalAssignedCount = totalAssigned || 0
    const totalUnassigned = Math.max(0, totalConvCount - totalAssignedCount)

    // 4. Fetch stage counts (including handling null as 'new')
    const stages = ['interested', 'booking', 'confirmed', 'completed', 'cancelled', 'followup', 'not_interested', 'call_done', 'low_budget', 'hot_customer', 'not_connected', 'joined', 'not_joined', 'unknown']
    
    const stagePromises = stages.map(async (stage) => {
      const { count } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('stage', stage)
      return { stage, count: count || 0 }
    })

    const newStagePromise = (async () => {
      const { count } = await supabaseAdmin
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .or('stage.eq.new,stage.is.null')
      return { stage: 'new', count: count || 0 }
    })()

    const stageResults = await Promise.all([newStagePromise, ...stagePromises])
    const stageCounts = stageResults.reduce((acc, curr) => {
      acc[curr.stage] = curr.count
      return acc
    }, {} as Record<string, number>)

    // 5. Fetch employee performance stats (total assigned, active, completed)
    const employeeStatsPromises = employeeList.map(async (emp: any) => {
      const [
        { count: assignedCount },
        { count: activeCount },
        { count: completedCount }
      ] = await Promise.all([
        supabaseAdmin
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('assigned_to', emp.id),
        supabaseAdmin
          .from('conversation_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('assigned_to', emp.id)
          .eq('status', 'active'),
        supabaseAdmin
          .from('conversation_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .eq('assigned_to', emp.id)
          .eq('status', 'completed')
      ])

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        total_assigned: assignedCount || 0,
        active: activeCount || 0,
        completed: completedCount || 0
      }
    })

    const employeeStats = await Promise.all(employeeStatsPromises)

    // 6. Fetch daily lead generation timeline (last 30 days) via fast parallel DB count queries (no row fetching)
    const dailyCounts: Record<string, number> = {}
    const dayBuckets: Array<{ dateKey: string; start: string; end: string }> = []

    for (let i = 29; i >= 0; i--) {
      const start = new Date()
      start.setDate(start.getDate() - i)
      start.setHours(0, 0, 0, 0)

      const end = new Date(start)
      end.setDate(end.getDate() + 1)

      const dateStr = start.toISOString().split('T')[0]
      dailyCounts[dateStr] = 0
      dayBuckets.push({
        dateKey: dateStr,
        start: start.toISOString(),
        end: end.toISOString()
      })
    }

    const dayCounts = await Promise.all(
      dayBuckets.map(async b => {
        const { count } = await supabaseAdmin
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', orgId)
          .gte('created_at', b.start)
          .lt('created_at', b.end)
        return { dateKey: b.dateKey, count: count || 0 }
      })
    )

    dayCounts.forEach(dc => {
      dailyCounts[dc.dateKey] = dc.count
    })

    const timeline = Object.keys(dailyCounts).map(date => ({
      date: new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      count: dailyCounts[date]
    }))

    // Return the unified aggregates
    return NextResponse.json({
      stage_counts: stageCounts,
      total_conversations: totalConvCount,
      total_assigned: totalAssignedCount,
      total_unassigned: totalUnassigned,
      total_active: totalActive || 0,
      total_completed: totalCompleted || 0,
      employees: employeeStats,
      timeline
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
