'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, MessageSquare, Clock } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useOrg } from '@/contexts/OrgContext'
import { useRouter } from 'next/navigation'

interface EmployeeStats {
  id: string
  name: string
  email: string
  total_assigned: number
  active: number
  completed: number
}

interface Stats {
  stage_counts: {
    new: number
    interested: number
    booking: number
    confirmed: number
    completed: number
    cancelled: number
    followup: number
    not_interested: number
    call_done: number
    low_budget: number
    hot_customer: number
  }
  total_conversations: number
  total_assigned: number
  total_unassigned: number
  total_active: number
  total_completed: number
  employees: EmployeeStats[]
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444']

export const dynamic = 'force-dynamic'

export default function AnalyticsPage() {
  const { profile, loading: authLoading } = useOrg()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !profile) router.push('/login')
    if (!authLoading && profile?.role === 'employee') router.push('/chats')
  }, [profile, authLoading, router])

  if (authLoading || !profile) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <AnalyticsContent />
}

function AnalyticsContent() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const { org } = useOrg()

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const headers = { 'Authorization': `Bearer ${token}` }

      const res = await fetch('/api/analytics', { headers })
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    </div>
  )

  if (!stats) return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <p className="text-gray-500">Failed to load analytics</p>
    </div>
  )

  const chartData = stats.employees.map(emp => ({
    name: emp.name.split(' ')[0],
    assigned: emp.total_assigned,
    active: emp.active,
    completed: emp.completed,
  }))

  const pieData = [
    { name: 'Unassigned', value: stats.total_unassigned },
    ...stats.employees.map(emp => ({ name: emp.name.split(' ')[0], value: emp.total_assigned }))
  ]

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shrink-0">
        <div className="flex items-center gap-4">
          <Sidebar />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
            <p className="text-sm text-gray-500">{org?.name} — Team performance and conversation insights</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={<MessageSquare className="w-5 h-5" />} label="Total Conversations" value={stats.total_conversations} color="blue" />
          <StatCard icon={<Users className="w-5 h-5" />} label="Assigned" value={stats.total_assigned} color="green" />
          <StatCard icon={<Clock className="w-5 h-5" />} label="Unassigned" value={stats.total_unassigned} color="amber" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-4">
          <StageCard label="New" value={stats.stage_counts.new} color="gray" />
          <StageCard label="Interested" value={stats.stage_counts.interested} color="blue" />
          <StageCard label="Booking" value={stats.stage_counts.booking} color="amber" />
          <StageCard label="Confirmed" value={stats.stage_counts.confirmed} color="green" />
          <StageCard label="Completed" value={stats.stage_counts.completed} color="purple" />
          <StageCard label="Cancelled" value={stats.stage_counts.cancelled} color="red" />
          <StageCard label="Follow Up" value={stats.stage_counts.followup} color="blue" />
          <StageCard label="Not Interested" value={stats.stage_counts.not_interested} color="gray" />
          <StageCard label="Call Done" value={stats.stage_counts.call_done} color="green" />
          <StageCard label="Low Budget" value={stats.stage_counts.low_budget} color="red" />
          <StageCard label="Hot Customer" value={stats.stage_counts.hot_customer} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Chats per Employee</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="assigned" fill="#10b981" name="Total Assigned" />
                <Bar dataKey="active" fill="#3b82f6" name="Active" />
                <Bar dataKey="completed" fill="#8b5cf6" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Distribution of Chats</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>


        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Employee Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Employee</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Total Assigned</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Active</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Completed</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {stats.employees.map(emp => {
                  const completionRate = emp.total_assigned > 0
                    ? Math.round((emp.completed / emp.total_assigned) * 100) : 0
                  return (
                    <tr key={emp.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-xs font-semibold">
                            {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 text-sm font-semibold">{emp.total_assigned}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 text-sm font-semibold">{emp.active}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="inline-block px-3 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">{emp.completed}</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-600 rounded-full transition-all" style={{ width: `${completionRate}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
      <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function StageCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    blue: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400',
    green: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400',
    red: 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400',
  }
  return (
    <div className={`rounded-2xl p-5 border border-gray-200 dark:border-gray-800 ${colorClasses[color]}`}>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs font-medium opacity-80">{label}</p>
    </div>
  )
}