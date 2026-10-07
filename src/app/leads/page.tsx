'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  Tag, 
  Eye, 
  X, 
  TrendingUp, 
  Calendar, 
  Phone, 
  User, 
  Check, 
  Trash2,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  MapPin,
  Plus,
  UploadCloud,
  Clock,
  UserCheck
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { useOrg } from '@/contexts/OrgContext'
import { useRouter } from 'next/navigation'
import { useLeadStages } from '@/hooks/useLeadStages'
import CustomStageModal from '@/components/leads/CustomStageModal'
import BulkImportLeadsModal from '@/components/leads/BulkImportLeadsModal'

interface Lead {
  id: string
  conversation_id: string
  phone_number: string
  customer_name?: string | null
  name?: string | null
  created_at: string
  updated_at?: string
  stage?: string | null
  lead_quality?: string | null
  lead_score?: number | null
  lead_temperature?: string | null
  lead_type?: string | null
  notes?: string | null
  followup_date?: string | null
  followup_notes?: string | null
  metadata?: any
}

const STAGES = ['new', 'interested', 'booking', 'confirmed', 'cancelled', 'completed', 'followup', 'not_interested', 'call_done', 'low_budget', 'hot_customer', 'not_connected', 'joined', 'not_joined', 'contact_save', 'contact_not_save', 'unknown']

const STAGE_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  interested: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50',
  booking: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50',
  confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50',
  completed: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50',
  followup: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/50',
  not_interested: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/50',
  call_done: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/50',
  low_budget: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50',
  hot_customer: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/50',
  not_connected: 'bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border border-gray-300/50',
  joined: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  not_joined: 'bg-zinc-150 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  contact_save: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  contact_not_save: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  unknown: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const QUALITY_COLORS: Record<string, string> = {
  HOT: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/50',
  WARM: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50',
  COLD: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50',
  SUPPRESSED: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50',
}

export const dynamic = 'force-dynamic'

export default function LeadsPage() {
  const { profile, loading: authLoading } = useOrg()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !profile) router.push('/login')
  }, [profile, authLoading, router])

  if (authLoading || !profile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <LeadsContent />
}

import { classifyOsmoContact } from '@/lib/osmoPhonebooks'
import { INDIAN_STATES } from '@/lib/constants'

function formatISTDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  try {
    const dt = new Date(dateStr)
    if (isNaN(dt.getTime())) return String(dateStr)
    return dt.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return String(dateStr)
  }
}

function classifyLead(lead: Lead): 'osmo_dealer' | 'dealer' | 'customer' | 'unfiltered' {
  return classifyOsmoContact(lead)
}

function LeadsContent() {
  const router = useRouter()
  const { profile, org } = useOrg()
  const { stages, customStages, addCustomStage, deleteCustomStage } = useLeadStages()
  const [isStageModalOpen, setIsStageModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const isOsmoRo = 
    profile?.email?.toLowerCase() === 'paanifilter9@gmail.com' ||
    org?.name?.toLowerCase().includes('osmo') ||
    org?.slug?.toLowerCase().includes('osmo')

  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)

  // Stats
  const [stats, setStats] = useState({ total: 0, unfiltered: 0, osmo_dealer: 0, dealer: 0, customer: 0, hot: 0, warm: 0, followups: 0 })
  
  // Filters
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState('')
  const [selectedQuality, setSelectedQuality] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedSource, setSelectedSource] = useState('')
  const [assignedTodayFilter, setAssignedTodayFilter] = useState(false)
  const [leadTypeFilter, setLeadTypeFilterState] = useState<string>('unfiltered') // unfiltered, osmo_dealer, dealer, customer

  // Multi-Select & Bulk Assignment State
  const [selectedLeadPhones, setSelectedLeadPhones] = useState<string[]>([])
  const [staffList, setStaffList] = useState<{ id: string; name: string; email: string; role: string }[]>([])
  const [bulkAssignEmployeeId, setBulkAssignEmployeeId] = useState('')
  const [bulkAssigning, setBulkAssigning] = useState(false)

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStaffList(data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('osmo_lead_tab')
      if (savedTab) setLeadTypeFilterState(savedTab)
    }
  }, [])

  const setLeadTypeFilter = (tab: string) => {
    setLeadTypeFilterState(tab)
    if (typeof window !== 'undefined') {
      localStorage.setItem('osmo_lead_tab', tab)
    }
  }

  const executeBulkAssignment = async () => {
    if (selectedLeadPhones.length === 0 || !bulkAssignEmployeeId) return
    setBulkAssigning(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }

      const res = await fetch('/api/assignments/bulk', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          phone_numbers: selectedLeadPhones,
          assigned_to: bulkAssignEmployeeId
        })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        alert(`Successfully assigned ${selectedLeadPhones.length} leads to employee!`)
        setSelectedLeadPhones([])
        setBulkAssignEmployeeId('')
        fetchLeads(false)
      } else {
        alert(`Bulk assignment failed: ${data.error || 'Server error'}`)
      }
    } catch (err: any) {
      alert(`Bulk assignment error: ${err.message}`)
    } finally {
      setBulkAssigning(false)
    }
  }

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  // Selected Lead for Details Drawer
  const [activeLead, setActiveLead] = useState<Lead | null>(null)
  
  // Edit State inside Drawer
  const [editStage, setEditStage] = useState('')
  const [editQuality, setEditQuality] = useState('')
  const [editScore, setEditScore] = useState(0)
  const [editCategory, setEditCategory] = useState('unfiltered')
  const [editState, setEditState] = useState('')
  const [savingLead, setSavingLead] = useState(false)

  // Stats loaded from server
  const typeCounts = {
    unfiltered: stats.unfiltered,
    osmo_dealer: stats.osmo_dealer,
    dealer: stats.dealer,
    customer: stats.customer,
  }

  const fetchStats = async (headers: any, params: URLSearchParams) => {
    try {
      const res = await fetch(`/api/leads/stats?${params.toString()}`, { headers, cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (e) {
      console.error('Failed to fetch stats', e)
    }
  }

  const fetchLeads = async (loadMore = false) => {
    if (loadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setPage(1)
    }
    setError(null)
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }

      const statsParams = new URLSearchParams()
      if (selectedStage) statsParams.set('stage', selectedStage)
      if (selectedQuality) statsParams.set('quality', selectedQuality)
      if (selectedState) statsParams.set('state', selectedState)
      if (assignedTodayFilter) statsParams.set('assigned_today', 'true')
      if (search) statsParams.set('search', search)
      if (startDate) statsParams.set('start_date', startDate)
      if (endDate) statsParams.set('end_date', endDate)

      if (!loadMore) {
        // Fetch stats across all categories for tab counts & metrics
        fetchStats(headers, statsParams)
      }

      const params = new URLSearchParams(statsParams)
      if (leadTypeFilter !== 'all') params.set('lead_type', leadTypeFilter)

      const currentPage = loadMore ? page + 1 : 1
      params.set('page', currentPage.toString())
      params.set('limit', '50')

      const res = await fetch(`/api/leads/list?${params}`, { headers, cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to fetch leads list')
      const { data, hasMore: more } = await res.json()
      
      if (loadMore) {
        setLeads(prev => [...prev, ...data])
        setPage(currentPage)
      } else {
        setLeads(data)
      }
      setHasMore(more)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An error occurred while loading leads.')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchLeads(false)
  }, [selectedStage, selectedQuality, selectedState, startDate, endDate, leadTypeFilter, assignedTodayFilter])

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchLeads(false)
    }
  }

  // Quick category change directly from table
  const handleQuickCategoryChange = async (lead: Lead, newCategory: string) => {
    // Instant optimistic update
    setLeads(prev => prev.map(l => {
      if (l.id === lead.id || (l.phone_number && lead.phone_number && l.phone_number === lead.phone_number)) {
        const currentMeta = typeof l.metadata === 'string' ? JSON.parse(l.metadata || '{}') : (l.metadata || {})
        return {
          ...l,
          lead_type: newCategory,
          metadata: { ...currentMeta, lead_type: newCategory, category: newCategory }
        }
      }
      return l
    }))

    const oldCat = typeof lead.metadata === 'string' 
      ? JSON.parse(lead.metadata || '{}').category || lead.lead_type || 'unfiltered' 
      : (lead.metadata as any)?.category || lead.lead_type || 'unfiltered'
    
    if (oldCat !== newCategory) {
      setStats(prev => ({
        ...prev,
        [oldCat]: Math.max(0, (prev[oldCat as keyof typeof prev] as number) - 1),
        [newCategory]: (prev[newCategory as keyof typeof prev] as number) + 1
      }))
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
      
      const targetConvId = lead.conversation_id || (lead.id && lead.id.length > 20 ? lead.id : null)

      const promises: Promise<any>[] = [
        fetch('/api/leads', {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            id: lead.id,
            conversation_id: lead.conversation_id,
            phone_number: lead.phone_number,
            lead_type: newCategory
          })
        })
      ]

      if (targetConvId) {
        promises.push(
          fetch(`/api/conversations/${targetConvId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ lead_type: newCategory })
          })
        )
        window.dispatchEvent(new CustomEvent('update-conversation', { detail: { id: targetConvId, lead_type: newCategory, category: newCategory } }))
      }

      const results = await Promise.all(promises)
      for (const res of results) {
        if (!res.ok) {
          console.error('Lead category update failed:', res.status, await res.text().catch(() => ''))
        }
      }
    } catch (err) {
      console.error('Failed to change lead category:', err)
    }
  }

  // Save Lead changes (Stage / Quality / Score / Category)
  const handleUpdateLead = async () => {
    if (!activeLead) return
    setSavingLead(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }

      const updates: any = {
        id: activeLead.id,
        conversation_id: activeLead.conversation_id,
        phone_number: activeLead.phone_number,
        stage: editStage,
        lead_quality: editQuality || null,
        lead_score: editScore,
        lead_type: editCategory,
        state: editState
      }

      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates)
      })

      if (!res.ok) throw new Error('Failed to update lead')

      const targetConvId = activeLead.conversation_id || (activeLead.id && activeLead.id.length > 20 ? activeLead.id : null)
      if (targetConvId) {
        fetch(`/api/conversations/${targetConvId}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ lead_type: editCategory, stage: editStage })
        }).catch(console.error)
        window.dispatchEvent(new CustomEvent('update-conversation', { detail: { id: targetConvId, lead_type: editCategory, category: editCategory, stage: editStage } }))
      }
      
      const currentMeta = typeof activeLead.metadata === 'string' ? JSON.parse(activeLead.metadata || '{}') : (activeLead.metadata || {})
      const mergedMeta = { ...currentMeta, lead_type: editCategory, category: editCategory, state: editState }
      
      const oldCat = currentMeta.category || activeLead.lead_type || 'unfiltered'
      if (oldCat !== editCategory) {
        setStats(prev => ({
          ...prev,
          [oldCat]: Math.max(0, (prev[oldCat as keyof typeof prev] as number) - 1),
          [editCategory]: (prev[editCategory as keyof typeof prev] as number) + 1
        }))
      }

      // Update local state list
      setLeads(prev => prev.map(l => (l.id === activeLead.id || (l.phone_number && activeLead.phone_number && l.phone_number === activeLead.phone_number)) ? { ...l, ...updates, metadata: mergedMeta } : l))
      setActiveLead(prev => prev ? { ...prev, ...updates, metadata: mergedMeta } : null)
    } catch (err) {
      console.error(err)
      alert('Failed to update lead settings.')
    } finally {
      setSavingLead(false)
    }
  }

  // Open Details Drawer
  const handleViewLead = (lead: Lead) => {
    let meta = (lead.metadata || {}) as Record<string, any>;
    if (typeof meta === 'string') { try { meta = JSON.parse(meta) } catch (e) { meta = {} } }
    const score = Number(meta.lead_score ?? lead.lead_score) || 0;
    const stage = meta.stage || lead.stage || 'new';
    const quality = meta.lead_quality || (score >= 70 ? 'hot' : score >= 40 ? 'warm' : score > 0 ? 'cold' : lead.lead_quality || 'unknown');
    
    setActiveLead({ ...lead, metadata: meta })
    setEditStage(stage)
    setEditQuality(quality)
    setEditScore(score)
    setEditCategory(classifyLead(lead))
    setEditState(meta.state || '')

    const targetConvId = lead.conversation_id || lead.id
    if (targetConvId) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        fetch(`/api/conversations/${targetConvId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
          },
          body: JSON.stringify({ unread_count: 0 })
        }).catch(() => {})
      })
    }
  }

  // Download filtered leads as CSV
  const handleDownloadCSV = () => {
    if (leads.length === 0) return

    // Standard columns
    const standardHeaders = ['Name', 'Phone', 'Stage', 'Lead Quality', 'Lead Score', 'Created At']

    // Unique keys in metadata
    const metadataKeys = new Set<string>()
    leads.forEach(l => {
      let meta = l.metadata || {};
      if (typeof meta === 'string') { try { meta = JSON.parse(meta) } catch (e) {} }
      if (meta) {
        Object.keys(meta).forEach(k => metadataKeys.add(k))
      }
    })

    const allHeaders = [...standardHeaders, ...Array.from(metadataKeys)]
    const csvRows = []

    // Header row
    csvRows.push(allHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(','))

    // Data rows
    leads.forEach(l => {
      let meta = l.metadata || {};
      if (typeof meta === 'string') { try { meta = JSON.parse(meta) } catch (e) {} }
      const score = Number(meta.lead_score ?? l.lead_score) || 0;
      const quality = meta.lead_quality || (score >= 70 ? 'hot' : score >= 40 ? 'warm' : score > 0 ? 'cold' : l.lead_quality || 'unknown');
      const stage = meta.stage || l.stage || 'new';

      const row = [
        l.name || (l as any).customer_name || meta.name || meta.contact_person || 'Unknown',
        l.phone_number || '',
        stage,
        quality,
        String(score),
        l.created_at ? new Date(l.created_at).toLocaleString() : ''
      ]

      metadataKeys.forEach(k => {
        row.push(meta?.[k] || '')
      })

      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    })

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `leads_crm_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Use stats from server for accurate metrics across all leads
  const totalLeads = stats.total
  const hotLeads = stats.hot ?? 0
  const warmLeads = stats.warm ?? 0
  const followupLeads = stats.followups ?? 0

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden text-gray-900 dark:text-gray-100">
      
      {/* Header Banner */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 z-50 bg-white/70 dark:bg-gray-950/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          <Sidebar />
          <span className="text-gray-900 dark:text-white font-bold text-lg flex items-center gap-2 tracking-tight">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Lead CRM Portal
          </span>
          <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/50 dark:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-800/50 rounded-full px-2.5 py-0.5 ml-2 tracking-wider">
            {org?.name || 'Tenant System'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm border border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <UploadCloud className="w-4 h-4" />
            Import Leads
          </button>
          <button
            onClick={() => setIsStageModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm border border-emerald-400/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            + Custom Stages
          </button>
          <button
            onClick={handleDownloadCSV}
            disabled={leads.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-bold rounded-xl shadow-sm border border-gray-200/50 dark:border-gray-800/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative z-0">
        <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-6">
          
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <MetricCard label="Total CRM Leads" value={totalLeads} bgGradient="from-blue-500 to-indigo-600" shadowColor="shadow-blue-500/20" icon={<User className="w-5 h-5 text-blue-100" />} />
            <MetricCard label="Hot Status Leads" value={hotLeads} bgGradient="from-rose-500 to-red-600" shadowColor="shadow-rose-500/20" icon={<TrendingUp className="w-5 h-5 text-rose-100" />} />
            <MetricCard label="Warm Status Leads" value={warmLeads} bgGradient="from-amber-400 to-orange-500" shadowColor="shadow-amber-500/20" icon={<AlertCircle className="w-5 h-5 text-amber-100" />} />
            <MetricCard label="Active Follow-ups" value={followupLeads} bgGradient="from-emerald-400 to-teal-500" shadowColor="shadow-teal-500/20" icon={<Calendar className="w-5 h-5 text-emerald-100" />} />
          </div>

          {/* Filtering Controls */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md p-4 rounded-2xl border border-white dark:border-gray-800/50 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between transition-all">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Search leads, crop, tehsil, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200/60 dark:border-gray-800/60 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-gray-400"
              />
              <Search className="w-4 h-4 text-emerald-500 absolute left-3.5 top-3.5" />
            </div>

            <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
              {/* Assigned Today Filter */}
              <button
                type="button"
                onClick={() => setAssignedTodayFilter(!assignedTodayFilter)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border shadow-xs ${
                  assignedTodayFilter
                    ? 'bg-amber-500 border-amber-500 text-white shadow-amber-500/20 shadow-md'
                    : 'bg-gray-50/50 dark:bg-gray-950/50 border-gray-200/60 dark:border-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title="Filter leads assigned or re-assigned today"
              >
                <Clock className={`w-4 h-4 ${assignedTodayFilter ? 'text-white' : 'text-amber-500'}`} />
                <span>Assigned Today</span>
              </button>

              {/* Stage Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200/60 dark:border-gray-800/60 px-4 py-2 rounded-xl w-1/2 md:w-auto shrink-0 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                <Filter className="w-4 h-4 text-emerald-500" />
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer w-full"
                >
                  <option value="">All Stages</option>
                  {stages.map(s => (
                    <option key={s.id || s.name} value={s.name}>{s.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Quality Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200/60 dark:border-gray-800/60 px-4 py-2 rounded-xl w-1/2 md:w-auto shrink-0 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                <Tag className="w-4 h-4 text-emerald-500" />
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer w-full"
                >
                  <option value="">All Qualities</option>
                  <option value="hot">HOT</option>
                  <option value="warm">WARM</option>
                  <option value="cold">COLD</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className={`flex items-center gap-2 border px-4 py-2 rounded-xl w-full md:w-auto shrink-0 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all ${
                (startDate || endDate)
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                  : 'bg-gray-50/50 dark:bg-gray-950/50 border-gray-200/60 dark:border-gray-800/60 focus-within:border-emerald-500'
              }`}>
                <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                  title="Start Date"
                />
                <span className="text-gray-300 dark:text-gray-700 text-xs shrink-0 font-bold">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
                  title="End Date"
                />
                {(startDate || endDate) && (
                  <button
                    onClick={() => { setStartDate(''); setEndDate('') }}
                    className="text-gray-400 hover:text-red-500 transition-colors ml-1 shrink-0"
                    title="Clear date filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* State Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200/60 dark:border-gray-800/60 px-4 py-2 rounded-xl w-1/2 md:w-auto shrink-0 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                <MapPin className="w-4 h-4 text-emerald-500" />
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer w-full"
                >
                  <option value="">All States</option>
                  {INDIAN_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Lead Source Filter */}
              <div className="flex items-center gap-1.5 bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200/60 dark:border-gray-800/60 px-4 py-2 rounded-xl w-1/2 md:w-auto shrink-0 focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all">
                <Filter className="w-4 h-4 text-emerald-500" />
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer w-full"
                >
                  <option value="">All Lead Sources</option>
                  <option value="bulk_import">📥 Bulk CSV/Excel Import</option>
                  <option value="inbound_chat">💬 Inbound WhatsApp</option>
                  <option value="google_maps_scraper">🗺️ Google Maps Scraper</option>
                  <option value="manual_entry">✏️ Manual Entry</option>
                </select>
              </div>

              <button
                onClick={() => fetchLeads(false)}
                className="hidden md:flex items-center justify-center gap-1.5 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-500/20 hover:shadow-lg hover:-translate-y-0.5"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Quick Tap Category Tabs (Osmo RO Dashboard: Paanifilter9@gmail.com) */}
          {isOsmoRo && (
            <div className="grid grid-cols-4 gap-3 p-2 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white dark:border-gray-800/50 shadow-sm transition-all">
              {[
                { id: 'unfiltered', label: 'Unfiltered', count: typeCounts.unfiltered, activeStyle: 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-md shadow-slate-500/30' },
                { id: 'osmo_dealer', label: 'Osmo Dealer', count: typeCounts.osmo_dealer, activeStyle: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md shadow-purple-500/30' },
                { id: 'dealer', label: 'Dealer', count: typeCounts.dealer, activeStyle: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/30' },
                { id: 'customer', label: 'Customer', count: typeCounts.customer, activeStyle: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md shadow-teal-500/30' },
              ].map((tab) => {
                const active = leadTypeFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setLeadTypeFilter(tab.id)}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[11px] uppercase tracking-wider font-black transition-all duration-300 select-none cursor-pointer ${
                      active
                        ? tab.activeStyle
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-black ${
                      active && tab.id !== 'all'
                        ? 'bg-white/25 text-white shadow-inner'
                        : 'bg-gray-200/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* CRM Leads Table */}
          <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/50 dark:border-gray-800/50 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[350px] transition-all relative">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-2" />
                <p className="text-sm text-gray-500">Loading leads from CRM database...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-red-500">
                <AlertCircle className="w-10 h-10 mb-2" />
                <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">{error}</p>
                <button onClick={() => fetchLeads(false)} className="mt-3 px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors border border-red-200">
                  Try Again
                </button>
              </div>
            ) : leads.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No Leads Found</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">Adjust your search parameters or check your n8n workflow connections.</p>
              </div>
            ) : (() => {
              const displayedLeads = leads.filter(l => {
                if (leadTypeFilter && leadTypeFilter !== 'all') {
                  const currentCategory = l.lead_type || (l.metadata as any)?.category || 'unfiltered'
                  if (currentCategory !== leadTypeFilter) return false
                }
                if (selectedSource) {
                  const metaObj = (typeof l.metadata === 'object' ? l.metadata : {}) as any
                  const src = String(metaObj?.source || (l as any).source || '').toLowerCase()
                  if (selectedSource === 'bulk_import' && !src.includes('bulk_import') && !src.includes('bulk') && !src.includes('import')) return false
                  if (selectedSource === 'inbound_chat' && !src.includes('inbound') && !src.includes('chat') && !src.includes('whatsapp')) return false
                  if (selectedSource === 'google_maps_scraper' && !src.includes('google_maps') && !src.includes('scraper')) return false
                  if (selectedSource === 'manual_entry' && !src.includes('manual') && !src.includes('crm')) return false
                }
                return true
              })

              if (displayedLeads.length === 0) {
                return (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">No Leads in this Category</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs">No leads match the selected category filter.</p>
                  </div>
                )
              }

              const skipKeys = [
                'id', 'created_at', 'updated_at', 'org_id', 'assigned_to', 
                'phone_number', 'name', 'conversation_id',
                'followup_notes', 'followup_date', 'followup_notified',
                'metadata', 'lead_type'
              ];

              const priorityOrder = [
                'source', 'lead_score', 'lead_quality', 'state', 'industry', 'business_intent', 
                'business_type', 'business_name', 'contact_person', 'city', 'email', 
                'demo_selected', 'pricing_requested', 'consultation_ready'
              ];

              // Always include core standard CRM keys so columns never disappear
              const standardKeys = [
                'source', 'lead_score', 'lead_quality', 'state', 'industry', 'business_intent'
              ];

              // Collect all unique custom keys by scanning ONLY the metadata JSON object.
              // IMPORTANT: Do NOT use { ...lead, ...meta } here — the API already spreads
              // parsedMetadata onto the lead object, so top-level lead fields may be plain
              // string values. Calling Object.keys() on a combined object that includes those
              // string-typed keys causes JavaScript to iterate their character indices
              // (e.g. Object.keys("Biaora") → ["0","1","2","3","4","5"]), producing the
              // garbled numeric column headers (0, 1, 10, 100...) seen in the CRM table.
              const rawKeys = Array.from(new Set([
                ...standardKeys,
                ...displayedLeads.flatMap(lead => {
                  // Parse metadata cleanly — never spread the full lead object
                  let metaOnly = (lead.metadata || {}) as Record<string, any>;
                  if (typeof metaOnly === 'string') {
                    try { metaOnly = JSON.parse(metaOnly) } catch (e) { metaOnly = {} }
                  }
                  // Guard: if metadata is not a plain object (e.g. still a string), skip
                  if (typeof metaOnly !== 'object' || Array.isArray(metaOnly)) return [];
                  return Object.keys(metaOnly).filter(key => {
                    if (skipKeys.includes(key.toLowerCase())) return false;
                    // Guard: filter out pure numeric keys (0, 1, 2, 250...) produced if a string is indexed
                    if (/^\d+$/.test(key)) return false;
                    const val = metaOnly[key];
                    // Skip nested objects/arrays and empty values
                    if (typeof val === 'object' && !Array.isArray(val)) return false;
                    if (val === null || val === undefined || String(val).trim() === '') return false;
                    return true;
                  });
                })
              ]));

              // Sort keys so high-priority CRM fields (Score, Quality, State, Industry) appear first
              const uniqueCustomKeys = rawKeys.sort((a, b) => {
                const idxA = priorityOrder.indexOf(a.toLowerCase());
                const idxB = priorityOrder.indexOf(b.toLowerCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return a.localeCompare(b);
              });

              const getHeaderLabelWithIcon = (key: string) => {
                const lower = key.toLowerCase();
                const formatted = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                if (lower.includes('tehsil') || lower.includes('village') || lower.includes('location') || lower.includes('pincode')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {formatted}</span>
                }
                if (lower.includes('district') || lower.includes('city') || lower.includes('state')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><span className="text-xs">🏙️</span> {formatted}</span>
                }
                if (lower.includes('crop') || lower.includes('farm')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><span className="text-xs">🌾</span> {formatted}</span>
                }
                if (lower.includes('product') || lower.includes('item') || lower.includes('requirement') || lower.includes('machine')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><span className="text-xs">📦</span> {formatted}</span>
                }
                if (lower.includes('intent') || lower.includes('purpose') || lower.includes('goal')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><span className="text-xs">🎯</span> {formatted}</span>
                }
                if (lower.includes('score')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><TrendingUp className="w-3.5 h-3.5 text-amber-500 shrink-0" /> {formatted}</span>
                }
                if (lower.includes('quality') || lower.includes('temperature')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><span className="text-xs">🔥</span> {formatted}</span>
                }
                if (lower.includes('source')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><span className="text-xs">📌</span> {formatted}</span>
                }
                if (lower.includes('stage')) {
                  return <span className="inline-flex items-center gap-1.5 font-extrabold"><Tag className="w-3.5 h-3.5 text-purple-500 shrink-0" /> {formatted}</span>
                }
                return <span className="inline-flex items-center gap-1.5 font-extrabold">{formatted}</span>
              }

              return (
                <div className="overflow-x-auto flex-1 pb-4">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-slate-100/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 text-[11px] font-black tracking-wider text-left uppercase sticky top-0 z-20 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-2xs">
                      <tr>
                        <th className="px-3 py-4 whitespace-nowrap sticky left-0 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl z-30 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={displayedLeads.length > 0 && displayedLeads.every(l => selectedLeadPhones.includes(l.phone_number))}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeadPhones(displayedLeads.map(l => l.phone_number))
                              } else {
                                setSelectedLeadPhones([])
                              }
                            }}
                            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                          />
                        </th>
                        <th className="px-6 py-4 whitespace-nowrap sticky left-10 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl z-30 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.08)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.08)] font-black text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5">
                            <User className="w-4 h-4 text-emerald-500" />
                            Lead Contact
                          </span>
                        </th>
                        {uniqueCustomKeys.map(key => (
                          <th key={key} className="px-6 py-4 whitespace-nowrap font-black text-slate-900 dark:text-white">
                            {getHeaderLabelWithIcon(key)}
                          </th>
                        ))}
                        <th className="px-6 py-4 whitespace-nowrap font-black text-slate-900 dark:text-white">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-emerald-500" />
                            Date Added
                          </span>
                        </th>
                        <th className="px-6 py-4 text-right whitespace-nowrap sticky right-0 bg-slate-100/95 dark:bg-slate-900/95 backdrop-blur-xl z-30 shadow-[inset_1px_0_0_0_rgba(0,0,0,0.08)] dark:shadow-[inset_1px_0_0_0_rgba(255,255,255,0.08)] font-black text-slate-900 dark:text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 text-sm">
                      {displayedLeads.map((lead) => {
                        let rawFollowup = lead.followup_notes || '';
                        if (rawFollowup.includes('Scheduled Meeting')) {
                          rawFollowup = 'Scheduled Meeting';
                        }

                        let meta = (lead.metadata || {}) as Record<string, any>;
                        if (typeof meta === 'string') {
                          try { meta = JSON.parse(meta) } catch (e) { meta = {} }
                        }

                        // Merge lead with metadata so metadata overrides stale columns
                        const allCustomData = { ...lead, ...meta } as Record<string, any>;

                        // Dynamically derive quality/temperature from score if available
                        const metaScore = Number(allCustomData.lead_score) || 0;
                        if (metaScore >= 70) {
                          allCustomData.lead_temperature = 'HOT';
                          allCustomData.lead_quality = 'HOT';
                        } else if (metaScore >= 40) {
                          allCustomData.lead_temperature = 'WARM';
                          allCustomData.lead_quality = 'WARM';
                        } else if (metaScore > 0) {
                          allCustomData.lead_temperature = 'COLD';
                          allCustomData.lead_quality = 'COLD';
                        }

                        const displayName = lead.name || (lead as any).customer_name || allCustomData.Name || allCustomData.name || allCustomData.contact_person || allCustomData.customer_name || 'Unknown';

                        return (
                          <tr 
                            key={lead.id} 
                            className={`group hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-all cursor-pointer relative ${
                              selectedLeadPhones.includes(lead.phone_number) ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-l-4 border-l-emerald-500' : ''
                            }`}
                            onClick={() => handleViewLead(lead)}
                          >
                            <td className="px-3 py-4 whitespace-nowrap sticky left-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl group-hover:bg-emerald-50/70 dark:group-hover:bg-emerald-950/50 transition-colors z-10 text-center" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={selectedLeadPhones.includes(lead.phone_number)}
                                onChange={() => {
                                  const phone = lead.phone_number
                                  setSelectedLeadPhones(prev => prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone])
                                }}
                                className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap sticky left-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl group-hover:bg-emerald-50/70 dark:group-hover:bg-emerald-950/50 transition-colors z-10 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.06)]">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0 ring-2 ring-emerald-500/20">
                                  {(displayName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                  <div className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2 text-sm tracking-tight">
                                    <span>{displayName}</span>
                                    {isOsmoRo && (
                                      <div className="relative inline-flex items-center" onClick={(e) => e.stopPropagation()}>
                                        <select
                                          value={classifyLead(lead)}
                                          onChange={(e) => handleQuickCategoryChange(lead, e.target.value)}
                                          className={`text-[9px] font-black pl-2 pr-4 py-0.5 rounded-full uppercase tracking-wider border cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs ${
                                            classifyLead(lead) === 'osmo_dealer' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border-purple-300 dark:border-purple-700' :
                                            classifyLead(lead) === 'dealer' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border-amber-300 dark:border-amber-700' :
                                            classifyLead(lead) === 'customer' ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border-teal-300 dark:border-teal-700' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                          }`}
                                          title="Change Category"
                                        >
                                          <option value="unfiltered">Unfiltered</option>
                                          <option value="osmo_dealer">Osmo Dealer</option>
                                          <option value="dealer">Dealer</option>
                                          <option value="customer">Customer</option>
                                        </select>
                                        <ChevronDown className="w-2.5 h-2.5 absolute right-1 pointer-events-none opacity-60" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 mt-0.5">
                                    <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                                    <span>{lead.phone_number}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {(() => {
                                      const src = String(allCustomData.source || '').toLowerCase()
                                      if (!src) return null
                                      if (src.includes('bulk_import') || src.includes('bulk') || src.includes('import')) {
                                        return (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-blue-700 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                                            📥 Bulk Import
                                          </span>
                                        )
                                      }
                                      if (src.includes('inbound') || src.includes('whatsapp') || src.includes('chat')) {
                                        return (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                            💬 Inbound WhatsApp
                                          </span>
                                        )
                                      }
                                      if (src.includes('google_maps') || src.includes('scraper')) {
                                        return (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800">
                                            🗺️ Scraper
                                          </span>
                                        )
                                      }
                                      if (src.includes('manual')) {
                                        return (
                                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                            ✏️ Manual Entry
                                          </span>
                                        )
                                      }
                                      return (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 uppercase">
                                          📌 {src}
                                        </span>
                                      )
                                    })()}
                                    {(lead as any).assigned_at && (new Date((lead as any).assigned_at).getTime() >= new Date().setHours(0,0,0,0)) && (
                                      <span className="text-[9px] font-black text-amber-700 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-700 inline-flex items-center gap-1 shadow-2xs">
                                        <Clock className="w-2.5 h-2.5 text-amber-600" />
                                        Assigned Today
                                      </span>
                                    )}
                                  </div>
                                  {rawFollowup && (
                                    <div className="text-cyan-700 dark:text-cyan-300 text-[10px] font-bold mt-1 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-800/60 inline-block truncate max-w-[200px]">
                                      📌 {rawFollowup}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {uniqueCustomKeys.map(key => {
                              const lowerKey = key.toLowerCase();
                              const val = (meta as any)[key] !== undefined ? (meta as any)[key] : allCustomData[key];
                              const displayVal = val !== undefined && val !== null ? String(val).trim() : '-';
                              const isMissing = !displayVal || displayVal === '-';

                              if (isMissing) {
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className="text-gray-300 dark:text-gray-700 font-mono text-xs">-</span>
                                  </td>
                                );
                              }

                              // 1. Source Field
                              if (lowerKey === 'source') {
                                const srcVal = displayVal.toLowerCase()
                                let label = displayVal
                                let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'

                                if (srcVal.includes('bulk_import') || srcVal.includes('bulk') || srcVal.includes('import')) {
                                  label = '📥 Bulk Import'
                                  badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60 shadow-2xs'
                                } else if (srcVal.includes('inbound') || srcVal.includes('whatsapp') || srcVal.includes('chat')) {
                                  label = '💬 Inbound WhatsApp'
                                  badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs'
                                } else if (srcVal.includes('google_maps') || srcVal.includes('scraper')) {
                                  label = '🗺️ Scraper'
                                  badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/60 shadow-2xs'
                                } else if (srcVal.includes('manual')) {
                                  label = '✏️ Manual Entry'
                                  badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60 shadow-2xs'
                                }

                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-lg border ${badgeStyle}`}>
                                      {label}
                                    </span>
                                  </td>
                                )
                              }
                              
                              // 2. Lead Score Field
                              if (lowerKey === 'lead_score') {
                                 const score = Number(val ?? allCustomData.lead_score) || 0;
                                 return (
                                   <td key={key} className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-16 bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden shadow-inner">
                                          <div 
                                            className={`h-full rounded-full transition-all duration-500 ${
                                              score >= 70 ? 'bg-gradient-to-r from-red-500 to-rose-600 shadow-sm shadow-red-500/50' : 
                                              score >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm shadow-amber-500/50' : 
                                              'bg-gradient-to-r from-blue-500 to-sky-500'
                                            }`} 
                                            style={{ width: `${Math.min(100, Math.max(0, score))}%` }} 
                                          />
                                        </div>
                                        <span className={`text-xs font-black font-mono px-2 py-0.5 rounded-md border shadow-2xs ${
                                          score >= 70 ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/60' : 
                                          score >= 40 ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60' : 
                                          'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60'
                                        }`}>
                                          {score}
                                        </span>
                                      </div>
                                   </td>
                                 )
                              }

                              // 3. Lead Quality / Temperature
                              if (lowerKey === 'lead_quality' || lowerKey === 'lead_temperature') {
                                const qVal = String(val || allCustomData.lead_quality || allCustomData.lead_temperature || (metaScore >= 70 ? 'HOT' : metaScore >= 40 ? 'WARM' : 'COLD')).toUpperCase();
                                
                                let qualityBadge = (
                                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                    {qVal}
                                  </span>
                                );

                                if (qVal === 'HOT') {
                                  qualityBadge = (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25 ring-2 ring-red-400/20">
                                      🔥 HOT
                                    </span>
                                  );
                                } else if (qVal === 'WARM') {
                                  qualityBadge = (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400/20">
                                      ⚡ WARM
                                    </span>
                                  );
                                } else if (qVal === 'COLD') {
                                  qualityBadge = (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 ring-2 ring-sky-400/20">
                                      ❄️ COLD
                                    </span>
                                  );
                                }

                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    {qualityBadge}
                                  </td>
                                );
                              }

                              // 4. Stage or State
                              if (lowerKey === 'stage' || lowerKey === 'state') {
                                const sVal = String(val || allCustomData.state || allCustomData.stage || 'new').toLowerCase();
                                const matched = stages.find(st => st.name === sVal || st.name.toLowerCase() === sVal || st.id === sVal || st.label.toLowerCase() === sVal);
                                const badgeColor = matched?.color || STAGE_COLORS[sVal] || 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50';
                                const badgeLabel = matched?.label || sVal.replace(/_/g, ' ');
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xs ${badgeColor}`}>
                                      <Tag className="w-3 h-3 opacity-70" />
                                      {badgeLabel}
                                    </span>
                                  </td>
                                );
                              }

                              // 5. Assigned At Date
                              if (lowerKey === 'assigned_at') {
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-800 dark:text-gray-200">
                                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/80 px-2.5 py-1 rounded-lg border border-gray-200/70 dark:border-gray-700/60">
                                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                                      {formatISTDate(val)}
                                    </div>
                                  </td>
                                );
                              }

                              // 6. Location Fields (Tehsil, District, Village, City, Location, Pincode)
                              if (lowerKey.includes('tehsil') || lowerKey.includes('village') || lowerKey.includes('location') || lowerKey.includes('pincode')) {
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/60 font-bold text-xs px-2.5 py-1 rounded-lg shadow-2xs">
                                      <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      {displayVal}
                                    </span>
                                  </td>
                                );
                              }

                              if (lowerKey.includes('district') || lowerKey.includes('city')) {
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800/60 font-bold text-xs px-2.5 py-1 rounded-lg shadow-2xs">
                                      <span className="text-xs">🏙️</span>
                                      {displayVal}
                                    </span>
                                  </td>
                                );
                              }

                              // 7. Crop Requirement / Farm Fields
                              if (lowerKey.includes('crop') || lowerKey.includes('farm')) {
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-200 border border-green-200 dark:border-green-800/60 font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-2xs">
                                      <span className="text-xs">🌾</span>
                                      {displayVal}
                                    </span>
                                  </td>
                                );
                              }

                              // 8. Product Interest / Requirement
                              if (lowerKey.includes('product') || lowerKey.includes('item') || lowerKey.includes('requirement') || lowerKey.includes('machine') || lowerKey.includes('model')) {
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/60 font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-2xs">
                                      <span className="text-xs">📦</span>
                                      {displayVal}
                                    </span>
                                  </td>
                                );
                              }

                              // 9. Intent / Purpose / Goal
                              if (lowerKey.includes('intent') || lowerKey.includes('purpose') || lowerKey.includes('inquiry')) {
                                return (
                                  <td key={key} className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 font-bold text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-2xs">
                                      <span className="text-xs">🎯</span>
                                      {displayVal.replace(/_/g, ' ')}
                                    </span>
                                  </td>
                                );
                              }

                              // 10. Default Custom Field Value (High Contrast Badge / Text)
                              const truncatedVal = displayVal.length > 45 ? displayVal.substring(0, 45) + '...' : displayVal;
                              return (
                                <td key={key} className="px-6 py-4 whitespace-nowrap text-xs">
                                  <span className="inline-block font-semibold text-gray-900 dark:text-gray-100 bg-gray-100/80 dark:bg-gray-800/80 px-2.5 py-1 rounded-lg border border-gray-200/80 dark:border-gray-700/80 shadow-2xs">
                                    {truncatedVal}
                                  </span>
                                </td>
                              );
                            })}
                            
                            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {formatISTDate(lead.created_at)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-xs sticky right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl group-hover:bg-emerald-50/70 dark:group-hover:bg-emerald-950/50 transition-colors z-10 shadow-[inset_1px_0_0_0_rgba(0,0,0,0.06)] dark:shadow-[inset_1px_0_0_0_rgba(255,255,255,0.06)]" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    const cleanP = (lead.phone_number || '').replace(/\D/g, '').slice(-10)
                                    if (cleanP) router.push(`/chats?phone=${cleanP}`)
                                  }}
                                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                                  title="Open chat conversation for this lead"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  Chat
                                </button>
                                <button
                                  onClick={() => handleViewLead(lead)}
                                  className="px-3 py-1.5 bg-white dark:bg-gray-800 text-slate-700 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400 rounded-xl border border-gray-200 dark:border-gray-700 font-extrabold text-xs shadow-2xs hover:bg-gray-50 dark:hover:bg-gray-750 transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-emerald-500" />
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  
                  {hasMore && (
                    <div className="flex justify-center p-4 pt-6 pb-8 border-t border-gray-100 dark:border-gray-800/60 relative">
                      <button 
                        onClick={() => fetchLeads(true)}
                        disabled={loadingMore}
                        className="px-6 py-2.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-sm rounded-xl border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
                      >
                        {loadingMore ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> Loading...</>
                        ) : (
                          'Load More Leads'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

        </div>

        {/* Lead details Drawer (Opens on Right side) */}
        {activeLead && (
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-md z-30 flex justify-end transition-opacity duration-300">
            {/* Click outside to close */}
            <div className="flex-1 cursor-pointer" onClick={() => setActiveLead(null)} />
            
            <div className="w-full max-w-md bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl h-full shadow-2xl flex flex-col border-l border-white/20 dark:border-gray-800/50 rounded-l-3xl animate-slide-in overflow-hidden">
              
              {/* Drawer Header */}
              <div className="p-5 border-b border-gray-200/60 dark:border-gray-800/60 bg-transparent flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-black tracking-tight text-gray-900 dark:text-white text-lg">Lead Summary</span>
                </div>
                <button 
                  onClick={() => setActiveLead(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
                
                {/* Details Section */}
                <div className="space-y-4">
                  <div className="text-center pb-5 border-b border-gray-100 dark:border-gray-800/50">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{activeLead.name || 'Unknown'}</h3>
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-1.5 mt-1 font-mono">
                      <Phone className="w-3.5 h-3.5" />
                      {activeLead.phone_number}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Database ID</span>
                      <p className="text-xs text-gray-900 dark:text-gray-100 font-mono truncate mt-1">{activeLead.id}</p>
                    </div>
                    <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Created Date</span>
                      <p className="text-xs text-gray-900 dark:text-gray-100 font-medium mt-1">
                        {new Date(activeLead.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Edit Section */}
                <div className="space-y-5 p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/80 dark:border-gray-800/80 shadow-xl shadow-gray-200/20 dark:shadow-black/40">
                  <h4 className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">CRM Management</h4>

                  <div className="space-y-3">
                    {/* Stage selector */}
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Lead Stage</label>
                      <select
                        value={editStage}
                        onChange={(e) => setEditStage(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm focus:outline-none"
                      >
                        {stages.map(s => (
                          <option key={s.id || s.name} value={s.name}>{s.label.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quality selector */}
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Lead Quality</label>
                      <select
                        value={editQuality}
                        onChange={(e) => setEditQuality(e.target.value)}
                        className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm focus:outline-none"
                      >
                        <option value="unknown">UNKNOWN</option>
                        <option value="hot">HOT</option>
                        <option value="warm">WARM</option>
                        <option value="cold">COLD</option>
                      </select>
                    </div>

                    {/* Category & State (Osmo RO only) */}
                    {isOsmoRo && (
                      <>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Lead Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm focus:outline-none font-semibold text-gray-900 dark:text-white"
                          >
                            <option value="unfiltered">⚪ Unfiltered (Undefined)</option>
                            <option value="osmo_dealer">🟣 Osmo Dealer</option>
                            <option value="dealer">🟠 Dealer / Retailer</option>
                            <option value="customer">🟢 Customer</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 block mb-1">Geographic State</label>
                          <select
                            value={editState}
                            onChange={(e) => setEditState(e.target.value)}
                            className="w-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 rounded-lg text-sm focus:outline-none font-semibold text-gray-900 dark:text-white"
                          >
                            <option value="">-- Select State --</option>
                            {INDIAN_STATES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleUpdateLead}
                    disabled={savingLead}
                    className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition-all disabled:opacity-50"
                  >
                    {savingLead ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    Save Changes
                  </button>
                </div>

                {/* Metadata JSON Viewer */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Dynamic Fields (Metadata)</h4>
                  
                  {Object.keys(activeLead.metadata || {}).length === 0 ? (
                    <p className="text-xs text-gray-500 italic p-3 bg-gray-50 dark:bg-gray-950 rounded-xl text-center border border-dashed">
                      No custom fields found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(activeLead.metadata || {}).map(([key, val]) => {
                        const formattedLabel = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                        return (
                          <div 
                            key={key} 
                            className="p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 shadow-sm flex items-center justify-between hover:bg-white dark:hover:bg-gray-900 transition-colors"
                          >
                            <div>
                              <span className="text-[10px] text-gray-400 block font-semibold">{formattedLabel}</span>
                              <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                                {(key.toLowerCase() === 'assigned_at' || key.toLowerCase() === 'created_at') 
                                  ? formatISTDate(String(val))
                                  : (String(val) || <span className="text-gray-400 italic">empty</span>)}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Drawer Footer Actions */}
              <div className="p-5 border-t border-gray-200/60 dark:border-gray-800/60 bg-white/50 dark:bg-gray-950/50 backdrop-blur-md flex gap-3 shrink-0">
                <Link
                  href={`/chats?phone=${encodeURIComponent(activeLead.phone_number)}`}
                  className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Open Conversation Chat
                </Link>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Bulk Import Leads Modal */}
      <BulkImportLeadsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => fetchLeads(false)}
      />

      {/* Floating Bulk Lead Assignment Action Bar */}
      {selectedLeadPhones.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 dark:bg-slate-950/95 border border-emerald-500/40 text-slate-100 px-6 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-5 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>{selectedLeadPhones.length} Lead{selectedLeadPhones.length > 1 ? 's' : ''} Selected</span>
          </div>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-3">
            <select
              value={bulkAssignEmployeeId}
              onChange={(e) => setBulkAssignEmployeeId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 max-w-[200px]"
            >
              <option value="">-- Assign to Employee --</option>
              {staffList.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name || emp.email} ({emp.role})
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={executeBulkAssignment}
              disabled={!bulkAssignEmployeeId || bulkAssigning}
              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {bulkAssigning ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
              Apply Bulk Assignment
            </button>

            <button
              type="button"
              onClick={() => setSelectedLeadPhones([])}
              className="p-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Deselect All"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, bgGradient, shadowColor, icon }: { label: string; value: number; bgGradient: string; shadowColor: string; icon: React.ReactNode }) {
  return (
    <div className={`relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br ${bgGradient} shadow-lg ${shadowColor} hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-white flex flex-col justify-between`}>
      {/* Abstract glass overlay */}
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-black/10 rounded-full blur-xl pointer-events-none" />
      
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs uppercase font-bold text-white/80 tracking-widest">{label}</span>
        <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
          {icon}
        </div>
      </div>
      <span className="relative z-10 text-3xl font-black mt-2 tracking-tight">{value}</span>
    </div>
  )
}
