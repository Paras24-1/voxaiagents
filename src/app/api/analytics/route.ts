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

    // 1. Fetch employees and call optimized single-shot DB analytics aggregation RPC in parallel
    const [usersRes, analyticsRes] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, name, email, role')
        .eq('org_id', orgId),
      supabaseAdmin
        .rpc('get_org_analytics', { p_org_id: orgId })
    ])

    if (usersRes.error) throw usersRes.error
    if (analyticsRes.error) throw analyticsRes.error

    const employeeList = (usersRes.data || []).filter((u: any) => u.role === 'employee')
    const stats = analyticsRes.data || {}

    const totalConvCount = stats.totalConversations || 0
    const totalAssignedCount = stats.totalAssigned || 0
    const totalUnassigned = stats.totalUnassigned ?? Math.max(0, totalConvCount - totalAssignedCount)
    const stageCounts = stats.stageCounts || {}

    // Map employee stats from aggregated data (0 extra queries)
    const empConvCounts = stats.employeeConvCounts || {}
    const empAssignments = stats.employeeAssignmentCounts || []

    const employeeStats = employeeList.map((emp: any) => {
      const activeObj = empAssignments.find((a: any) => a.assigned_to === emp.id && a.status === 'active')
      const completedObj = empAssignments.find((a: any) => a.assigned_to === emp.id && a.status === 'completed')

      return {
        id: emp.id,
        name: emp.name,
        email: emp.email,
        total_assigned: empConvCounts[emp.id] || 0,
        active: activeObj?.count || 0,
        completed: completedObj?.count || 0
      }
    })

    // Construct 30-day timeline from pre-aggregated daily counts (0 extra queries)
    const dailyMap = stats.dailyTimeline || {}
    const timeline: Array<{ date: string; count: number }> = []

    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateKey = d.toISOString().split('T')[0]
      timeline.push({
        date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        count: dailyMap[dateKey] || 0
      })
    }

    return NextResponse.json({
      stage_counts: stageCounts,
      total_conversations: totalConvCount,
      total_assigned: totalAssignedCount,
      total_unassigned: totalUnassigned,
      total_active: stats.totalActive || 0,
      total_completed: stats.totalCompleted || 0,
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
