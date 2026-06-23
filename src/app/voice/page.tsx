'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { useOrg } from '@/contexts/OrgContext'
import { supabase } from '@/lib/supabase'
import { 
  PhoneCall, 
  Activity, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Loader2,
  Lock,
  Sparkles,
  ArrowRight,
  User,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react'

export const dynamic = 'force-dynamic'

interface CallLog {
  id: string
  from_phone_number: string | null
  to_phone_number: string | null
  duration_seconds: number
  status: string
  cost: number
  created_at: string
  transcript: string | null
  agents?: { name: string } | null
}

interface Stats {
  totalCalls: number
  totalMinutes: number
  minutesLimit: number
  avgDuration: number
  totalCost: number
}

export default function VoicePage() {
  const { profile, org, loading: authLoading } = useOrg()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !profile) router.push('/login')
  }, [profile, authLoading, router])

  if (authLoading || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasAccess = org?.has_voice_ai || false

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-950">
      
      {/* Top Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 shrink-0 shadow-sm z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sidebar />
          <div className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-emerald-500 shrink-0" />
            <h1 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
              Voice AI Agent
            </h1>
          </div>
        </div>
      </header>

      {/* Main Gated Content */}
      <div className="flex-1 overflow-y-auto">
        {hasAccess ? (
          <VoiceDashboardContent />
        ) : (
          <VoiceUpgradePaywall orgName={org?.name || 'Your Team'} />
        )}
      </div>
    </div>
  )
}

/* Paywall Upgrade Screen */
function VoiceUpgradePaywall({ orgName }: { orgName: string }) {
  const [requestLoading, setRequestLoading] = useState(false)
  const [requested, setRequested] = useState(false)

  const handleRequestUpgrade = () => {
    setRequestLoading(true)
    setTimeout(() => {
      setRequestLoading(false)
      setRequested(true)
      // Open WhatsApp direct link to developer for custom plan upgrade
      window.open('https://wa.me/919831282280?text=Hello!%20I%20want%20to%20upgrade%20and%20activate%20Multilingual%20Voice%20AI%20for%20my%20dashboard%20organization:%20' + encodeURIComponent(orgName), '_blank')
    }, 1200)
  }

  return (
    <div className="min-h-full flex items-center justify-center p-6 relative overflow-hidden bg-gray-50/50 dark:bg-gray-950">
      
      {/* Blurred background mockup of Voice Dashboard */}
      <div className="absolute inset-0 filter blur-md opacity-25 dark:opacity-10 scale-105 pointer-events-none select-none grid grid-cols-3 gap-6 p-8">
        <div className="border border-zinc-800 rounded-2xl h-36 bg-zinc-900" />
        <div className="border border-zinc-800 rounded-2xl h-36 bg-zinc-900" />
        <div className="border border-zinc-800 rounded-2xl h-36 bg-zinc-900" />
        <div className="col-span-3 border border-zinc-800 rounded-2xl h-80 bg-zinc-900" />
      </div>

      <div className="relative w-full max-w-xl border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-scale-in">
        
        {/* Glow locked Icon */}
        <div className="relative w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/10 flex items-center justify-center shadow-md">
          <PhoneCall className="w-8 h-8 text-emerald-500 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white border-2 border-white dark:border-gray-900 shadow-sm">
            <Lock className="w-2.5 h-2.5" />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100/20">
            Premium Add-on
          </span>
          <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mt-1">
            Unlock Multilingual Voice AI Autopilots
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Elevate {orgName}&apos;s customer acquisition. Connect Twilio/Vobiz phone lines directly to a voice assistant that speaks Hindi, Marathi, and English fluently.
          </p>
        </div>

        {/* Feature list */}
        <div className="w-full max-w-md border border-gray-150 dark:border-gray-850 rounded-2xl bg-gray-50/50 dark:bg-gray-950/20 p-4 space-y-3.5 text-left">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500 shrink-0 border border-emerald-100/10">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Gemini Multimodal Live API</h4>
              <p className="text-[10px] text-gray-550 dark:text-gray-400 leading-normal font-medium mt-0.5">Bidirectional real-time audio streams with near-zero latency and natural voice cadence.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-500 shrink-0 border border-blue-100/10">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Outbound Auto-Dialer Campaigns</h4>
              <p className="text-[10px] text-gray-550 dark:text-gray-400 leading-normal font-medium mt-0.5">Bulk-dial cold lead lists automatically from your Leads CRM and log results.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-500 shrink-0 border border-purple-100/10">
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Smart Sales Employee Handover</h4>
              <p className="text-[10px] text-gray-550 dark:text-gray-400 leading-normal font-medium mt-0.5">Transfers the call live to the assigned sales representative when requested by the customer.</p>
            </div>
          </div>
        </div>

        {/* Pricing tag */}
        <div className="text-xs text-gray-500 dark:text-gray-400 font-bold bg-gray-50 dark:bg-gray-950/40 border border-gray-150 dark:border-gray-850 px-4 py-2.5 rounded-xl flex items-center gap-2">
          <span>Voice Rate:</span>
          <span className="text-emerald-500 font-black">₹3.5 / minute</span>
          <span className="text-[10px] text-gray-400 font-normal">| No setup fee</span>
        </div>

        <button
          onClick={handleRequestUpgrade}
          disabled={requestLoading || requested}
          className="w-full max-w-sm py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          {requestLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : requested ? (
            'Plan Request Sent!'
          ) : (
            <>
              Request Voice Activation
              <ExternalLink className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/* Unlocked Voice AI Dashboard Content */
function VoiceDashboardContent() {
  const [timeRange, setTimeRange] = useState('7d')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [logs, setLogs] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      // 1. Fetch Stats
      const statsRes = await fetch(`/api/voice/stats?timeRange=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const statsData = await statsRes.json()
      if (statsData.error) throw new Error(statsData.error)
      setStats(statsData)

      // 2. Fetch Call Logs
      const logsRes = await fetch('/api/voice/logs?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const logsData = await logsRes.json()
      if (logsData.error) throw new Error(logsData.error)
      setLogs(logsData)

    } catch (err: any) {
      console.error('Failed to fetch Voice Dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const filteredLogs = logs.filter(l =>
    (l.agents?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase()) ||
    (l.transcript || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.from_phone_number || '').includes(search) ||
    (l.to_phone_number || '').includes(search)
  )

  const percentUsed = stats ? Math.min((stats.totalMinutes / stats.minutesLimit) * 100, 100) : 0

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase()
    if (lower === 'completed') return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100/10 text-[10px] font-bold uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Ended
      </span>
    )
    if (lower === 'active' || lower === 'live') return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-455 border border-blue-100/10 text-[10px] font-bold uppercase tracking-wider animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Live
      </span>
    )
    if (lower === 'failed' || lower === 'busy' || lower === 'no-answer') return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-100/10 text-[10px] font-bold uppercase tracking-wider">
        <XCircle className="w-3 h-3 text-red-500" /> {status}
      </span>
    )
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-100/10 text-[10px] font-bold uppercase tracking-wider">
        <AlertTriangle className="w-3 h-3 text-amber-500" /> {status}
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100/20">
            Realtime Analytics Node
          </span>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2.5">
            Voice Stream Overview
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">
            Live metrics and transcripts synced from your telecommunication servers.
          </p>
        </div>
        
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex rounded-xl bg-white dark:bg-gray-900 p-1 border border-gray-150 dark:border-gray-800 shadow-sm">
            {['24h', '7d', '30d'].map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${timeRange === r ? 'bg-gray-50 dark:bg-gray-800 text-emerald-500 shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 hover:border-gray-250 dark:hover:border-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-all flex items-center gap-2 text-xs font-bold shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
        
        {/* Total Calls */}
        <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-800/80 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Total Calls</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
                {loading ? '—' : stats?.totalCalls}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">calls</span>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2.5">For filtered range ({timeRange})</p>
          </div>
        </div>

        {/* Minutes Gauge */}
        <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-800/80 backdrop-blur-md rounded-2xl p-6 flex items-center gap-6 h-40 shadow-sm hover:shadow-md transition-all">
          <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle cx="40" cy="40" r="34" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="6" fill="transparent" />
              <circle
                cx="40" cy="40" r="34"
                className="stroke-emerald-500"
                strokeWidth="6" fill="transparent"
                strokeDasharray={213.6}
                strokeDashoffset={loading ? 213.6 : 213.6 - (213.6 * percentUsed) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                {loading ? '—' : `${Math.round(percentUsed)}%`}
              </span>
            </div>
          </div>
          <div className="flex-grow flex flex-col justify-between py-1 h-full">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block">Minutes Used</span>
              <span className="text-2xl font-extrabold text-gray-950 dark:text-white block mt-1 tracking-tight">
                {loading ? '—' : stats?.totalMinutes.toLocaleString()}
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {stats && stats.totalCost > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Cost: ₹{stats.totalCost.toFixed(2)}
                </span>
              ) : (
                <>of <span className="text-gray-700 dark:text-gray-300 font-black">{stats?.minutesLimit}</span> free min limit</>
              )}
            </div>
          </div>
        </div>

        {/* Avg Call Duration */}
        <div className="bg-white/60 dark:bg-gray-900/60 border border-gray-150 dark:border-gray-800/80 backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Avg Call Duration</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-gray-950 dark:text-white tracking-tight">
              {loading ? '—' : stats ? formatDuration(stats.avgDuration) : '—'}
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2.5">per completed session</p>
          </div>
        </div>

      </div>

      {/* Call History Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div>
            <h2 className="text-sm font-extrabold text-gray-950 dark:text-white tracking-tight uppercase tracking-wide">Call History</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Historical records for outbound & inbound dialogs</p>
          </div>
          
          <div className="w-full sm:max-w-xs relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by phone, status, transcript..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-250 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        <div className="border border-gray-150 dark:border-gray-800/80 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center select-none text-gray-400">
              <PhoneCall className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-xs font-bold">No call history matches your filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-150 dark:border-gray-850 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 bg-gray-50/50 dark:bg-gray-950/20 select-none">
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">From</th>
                    <th className="px-5 py-3.5">To</th>
                    <th className="px-5 py-3.5">Agent</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Cost</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-gray-855 text-xs text-gray-700 dark:text-gray-300">
                  {filteredLogs.map((log) => {
                    const isExpanded = expandedLogId === log.id
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-850/20 transition-all">
                        <td className="px-5 py-3.5 whitespace-nowrap align-middle">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="px-5 py-3.5 font-medium font-mono text-[11px] align-middle">
                          {log.from_phone_number || 'Inbound (Virtual)'}
                        </td>
                        <td className="px-5 py-3.5 font-medium font-mono text-[11px] align-middle">
                          {log.to_phone_number || 'Direct Dial'}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-800 dark:text-gray-200 align-middle">
                          {log.agents?.name || 'Default Bot'}
                        </td>
                        <td className="px-5 py-3.5 font-semibold align-middle">
                          {formatDuration(log.duration_seconds)}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 align-middle">
                          {log.cost > 0 ? `₹${log.cost.toFixed(2)}` : '₹0.00'}
                        </td>
                        <td className="px-5 py-3.5 text-right align-middle select-none">
                          <button
                            onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                            className="p-1 text-gray-400 hover:text-emerald-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wide border border-transparent hover:border-gray-150"
                          >
                            Transcript
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Transcript Panel Modal */}
      {expandedLogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="p-5 border-b border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-gray-950 dark:text-white tracking-tight">Call Audio Transcript</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Session ID: {expandedLogId}</p>
              </div>
              <button 
                onClick={() => setExpandedLogId(null)}
                className="p-1.5 rounded-xl border border-gray-250 dark:border-gray-800 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transcript Body */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50/20 dark:bg-gray-950/10">
              {logs.find(l => l.id === expandedLogId)?.transcript ? (
                <div className="text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-medium text-gray-700 dark:text-gray-300">
                  {logs.find(l => l.id === expandedLogId)?.transcript}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 select-none">
                  <Activity className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-xs font-bold">No audio transcript was captured for this call.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-150 dark:border-gray-850 bg-gray-50 dark:bg-gray-900 flex justify-end">
              <button
                type="button"
                onClick={() => setExpandedLogId(null)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
