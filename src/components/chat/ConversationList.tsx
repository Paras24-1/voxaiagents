'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Conversation, Stage } from '@/types'
import { useConversations } from '@/hooks'
import { formatDistanceToNow } from 'date-fns'
import { Search, Filter, Wifi, Trash2, X, UserPlus, Ban, ChevronDown, CheckCheck, CheckSquare, Square, Send, Clock, ListChecks, Paperclip, AlertTriangle, CheckCircle2, MessageSquare, Check } from 'lucide-react'
import { useOrg } from '@/contexts/OrgContext'
import { supabase, fetchWithAuth } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { useLeadStages } from '@/hooks/useLeadStages'

const STAGES: Stage[] = ['new', 'interested', 'booking', 'confirmed', 'cancelled', 'completed', 'followup', 'not_interested', 'call_done', 'low_budget', 'hot_customer', 'not_connected', 'joined', 'not_joined', 'contact_save', 'contact_not_save', 'unknown']

const STAGE_COLORS: Record<Stage, string> = {
  new:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  interested: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  booking:    'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled:  'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  completed:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  followup:      'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  not_interested:'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  call_done:      'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  low_budget:  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  hot_customer:'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  not_connected:  'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  joined:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  not_joined:     'bg-zinc-150 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  contact_save:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  contact_not_save: 'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  unknown:        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

import { PropsWithChildren } from 'react'

interface Props {
  selectedId: string | null
  onSelect: (conv: Conversation) => void
  onDelete?: (id: string) => void
}

interface Employee {
  id: string
  name: string
  email: string
}

const extractOsmoCategory = (conv: any): string => {
  if (!conv) return 'unfiltered'
  const leadObj = Array.isArray(conv.leads) ? conv.leads[0] : conv.leads || conv.lead || {}
  const meta = typeof leadObj?.metadata === 'object' ? leadObj.metadata : (typeof conv.metadata === 'object' ? conv.metadata : {})
  const cat = 
    leadObj?.osmo_category || 
    leadObj?.category || 
    leadObj?.lead_type || 
    meta?.osmo_category || 
    meta?.category || 
    meta?.lead_type || 
    conv.osmo_category || 
    conv.category || 
    conv.lead_type || 
    'unfiltered'
  return String(cat).toLowerCase()
}

export default function ConversationList({ selectedId, onSelect, onDelete }: Props) {
  const { stages } = useLeadStages()
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const [unread, setUnread] = useState(false)
  const [assignedFilter, setAssignedFilter] = useState<string>('all') // all, unassigned, assigned, or employee_id
  const [channelFilter, setChannelFilter] = useState<string>('all') // all, whatsapp, instagram
  const [osmoTab, setOsmoTab] = useState<string>('unfiltered')
  const [categoryStats, setCategoryStats] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const res = await fetchWithAuth('/api/leads/stats')
        if (res.ok) {
          const data = await res.json()
          setCategoryStats(data)
        }
      } catch (err) {
        console.error('Failed to fetch lead category stats:', err)
      }
    }
    fetchCategoryStats()
  }, [])

  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showAddLead, setShowAddLead] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])

  // Multi-Select & Bulk Broadcast State
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedConvIds, setSelectedConvIds] = useState<Set<string>>(new Set())
  const [showBulkModal, setShowBulkModal] = useState(false)

  // Top-Level Assignment Modal State (Prevents hover jitter / infinite re-render loop)
  const [assigningConv, setAssigningConv] = useState<Conversation | null>(null)
  const [assigning, setAssigning] = useState(false)

  const handleAssign = async (userId: string) => {
    if (!assigningConv) return
    setAssigning(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          conversation_id: assigningConv.id,
          assigned_to: userId
        })
      })

      if (res.ok) {
        refetch()
        setAssigningConv(null)
      }
    } catch (err) {
      console.error('Assignment failed:', err)
    } finally {
      setAssigning(false)
    }
  }

  const toggleSelectConv = (id: string) => {
    setSelectedConvIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const { profile, org } = useOrg()
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'
  const isOsmo = !!(profile?.email?.toLowerCase() === 'paanifilter9@gmail.com' || org?.name?.toLowerCase().includes('osmo') || org?.slug?.toLowerCase().includes('osmo'))

  const { conversations, loading, refetch, markAsRead, markAllAsRead } = useConversations({ 
    search, 
    stage, 
    unread,
    assignFilter: assignedFilter,
    userId: profile?.id,
    isAdmin: !!isAdmin,
    userRole: profile?.role,
    selectedId,
  })

  const totalUnreadConvs = useMemo(() => {
    return conversations.filter(c => (c.unread_count && c.unread_count > 0) || (c as any).unread).length
  }, [conversations])

  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unread_count || ((c as any).unread ? 1 : 0)), 0)
  }, [conversations])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (totalUnreadConvs > 0) {
        document.title = `(${totalUnreadConvs}) Unread Chats — Vox AI`
      } else {
        document.title = 'Chats — Vox AI'
      }
    }
  }, [totalUnreadConvs])

  useEffect(() => {
    if (selectedId) {
      markAsRead(selectedId)
    }
  }, [selectedId, markAsRead])

  useEffect(() => {
    if (profile?.role === 'admin' || profile?.role === 'owner') {
      fetchEmployees()
    }
  }, [profile])

  const fetchEmployees = async () => {
    if (!profile?.org_id) return
    const { data } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'employee')
      .eq('org_id', profile.org_id)
      .order('name')
    
    if (data) setEmployees(data)
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/conversations/${confirmId}`, {
        method: 'DELETE',
        headers: {
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        }
      })
      if (res.ok) {
        onDelete?.(confirmId)
        refetch()
      }
    } finally {
      setDeleting(false)
      setConfirmId(null)
    }
  }


  const hasInstagram = conversations.some(c => c.platform === 'instagram')

  return (
    <aside className="flex flex-col h-full bg-white dark:bg-gray-950 border-r border-gray-200/80 dark:border-gray-800/80">
      {/* Add Lead & Initiate Chat Modal */}
      {showAddLead && (
        <AddLeadModal
          onClose={() => setShowAddLead(false)}
          onSuccess={(newConv) => {
            refetch()
            onSelect(newConv)
            setShowAddLead(false)
          }}
          profile={profile}
        />
      )}

      {/* Confirm Delete Modal */}
      {confirmId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 w-full max-w-xs shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Delete Conversation?</h3>
              <button onClick={() => setConfirmId(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
              This will permanently delete the conversation and all messages. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-colors shadow-sm"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200/80 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
              {isAdmin ? 'Conversations' : 'My Inbox'}
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50">
              {conversations.length}
            </span>
            {totalUnreadConvs > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500 text-white shadow-xs animate-pulse">
                {totalUnreadConvs} unread
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddLead(true)}
              className="px-2.5 py-1.5 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all shadow-xs flex items-center gap-1.5 text-xs font-bold"
              title="Add New Lead & Start Chat"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {isMultiSelect && (
          <div className="flex items-center gap-1.5 mb-3 p-1.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl overflow-x-auto scrollbar-hide">
            <button
              onClick={() => {
                const newSet = new Set<string>()
                conversations.forEach(c => {
                  const is24h = c.last_incoming_message_at && (Date.now() - new Date(c.last_incoming_message_at).getTime() <= 24 * 60 * 60 * 1000)
                  if (is24h) newSet.add(c.id)
                })
                setSelectedConvIds(newSet)
              }}
              className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-emerald-500 text-white shadow-xs whitespace-nowrap hover:bg-emerald-600 transition-colors flex items-center gap-1"
            >
              <Clock className="w-3 h-3" />
              Select 24h Active
            </button>
            <button
              onClick={() => {
                const newSet = new Set<string>()
                conversations.forEach(c => newSet.add(c.id))
                setSelectedConvIds(newSet)
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 whitespace-nowrap hover:bg-gray-100"
            >
              All ({conversations.length})
            </button>
            {selectedConvIds.size > 0 && (
              <button
                onClick={() => setSelectedConvIds(new Set())}
                className="text-[10px] font-bold px-2 py-1 rounded-lg text-red-600 dark:text-red-400 bg-red-100/60 dark:bg-red-950/40 border border-red-200/50 whitespace-nowrap hover:bg-red-200/50"
              >
                Clear ({selectedConvIds.size})
              </button>
            )}
          </div>
        )}

        {/* Search Input */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search name, phone, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Channel Filters */}
          <div className="flex items-center bg-gray-200/60 dark:bg-gray-800/60 p-0.5 rounded-xl border border-gray-200/50 dark:border-gray-800/50">
            <button
              onClick={() => setChannelFilter('all')}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                channelFilter === 'all'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                channelFilter === 'whatsapp'
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              WhatsApp
            </button>
            {hasInstagram && (
              <button
                onClick={() => setChannelFilter('instagram')}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all ${
                  channelFilter === 'instagram'
                    ? 'bg-pink-500 text-white shadow-2xs'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                Insta
              </button>
            )}
          </div>

          {/* Unread Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setUnread((u) => !u)}
              className={`text-[10px] px-2.5 py-1 rounded-xl font-bold border transition-all shadow-2xs flex items-center gap-1.5 ${
                unread
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20'
                  : totalUnreadConvs > 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                  : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>Unread</span>
              {totalUnreadConvs > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${
                  unread ? 'bg-white text-emerald-700' : 'bg-red-500 text-white'
                }`}>
                  {totalUnreadConvs}
                </span>
              )}
            </button>
          </div>

          {/* Stage Dropdown */}
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            className="text-[10px] px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
          >
            <option value="">All Stages</option>
            {stages.map((s) => (
              <option key={s.id || s.name} value={s.name}>{s.label}</option>
            ))}
          </select>

          {/* Assignment Filter (Admin only) */}
          {isAdmin && (
            <select
              value={assignedFilter}
              onChange={(e) => setAssignedFilter(e.target.value)}
              className="text-[10px] px-2 py-1 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          )}


        </div>

        {/* Premium Animated Osmo RO Tabs */}
        {isOsmo && (
          <div className="flex bg-gray-900/5 dark:bg-black/20 p-1.5 rounded-2xl mb-4 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/50 shadow-inner overflow-x-auto scrollbar-hide gap-1">
            {['unfiltered', 'osmo_dealer', 'dealer', 'customer'].map(tab => {
              const tabKey = tab.toLowerCase()
              const count = categoryStats?.[tabKey] ?? conversations.filter(c => extractOsmoCategory(c) === tabKey).length
              const isActive = osmoTab === tab
              
              return (
                <button
                  key={tab}
                  onClick={() => setOsmoTab(tab)}
                  className={`relative shrink-0 px-3 py-2 text-[11px] font-bold rounded-xl transition-colors capitalize whitespace-nowrap z-10 ${
                    isActive
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="osmoTabIndicator"
                      className="absolute inset-0 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-black/5 dark:border-white/5 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex justify-center items-center gap-1.5">
                    {tab.replace('_', ' ')}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                      isActive 
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-gray-200/50 dark:bg-gray-800 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Conversation Cards List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-gray-50/30 dark:bg-gray-950/30">
        {loading ? (
          <LoadingSkeleton />
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-xs gap-2">
            <Filter className="w-6 h-6 opacity-30" />
            <span>No conversations found</span>
          </div>
        ) : (
          [...conversations]
            .filter(c => {
              if (!isOsmo) return true
              return extractOsmoCategory(c) === osmoTab.toLowerCase()
            })
            .filter((c) => {
              if (unread) {
                return (c.unread_count || 0) > 0
              }
              return true
            })
            .filter((c) => {
              if (channelFilter === 'whatsapp') return !c.platform || c.platform === 'whatsapp'
              if (channelFilter === 'instagram') return c.platform === 'instagram'
              return true
            })
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedId}
                selectedId={selectedId}
                onClick={() => {
                  if (isMultiSelect) {
                    toggleSelectConv(conv.id)
                  } else {
                    conv.unread_count = 0
                    markAsRead(conv.id)
                    onSelect({ ...conv, unread_count: 0 })
                  }
                }}
                onDelete={(e) => handleDelete(e, conv.id)}
                isAdmin={isAdmin}
                employees={employees}
                onOpenAssign={() => setAssigningConv(conv)}
                isOsmo={isOsmo}
                stages={stages}
                isMultiSelect={isMultiSelect}
                isChecked={selectedConvIds.has(conv.id)}
                onToggleCheck={() => toggleSelectConv(conv.id)}
              />
            ))
        )}
      </div>

      {/* Floating Action Bar when Multi-Select is Active */}
      {isMultiSelect && selectedConvIds.size > 0 && (
        <div className="p-3 bg-slate-900 text-white border-t border-slate-800 shadow-2xl flex items-center justify-between gap-2 z-20 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
              {selectedConvIds.size}
            </span>
            <div>
              <p className="text-xs font-bold text-white leading-none">Chats Selected</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                {conversations.filter(c => selectedConvIds.has(c.id) && c.last_incoming_message_at && (Date.now() - new Date(c.last_incoming_message_at).getTime() <= 24 * 60 * 60 * 1000)).length} 24h window active
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Message</span>
          </button>
        </div>
      )}

      {/* Bulk Send Modal */}
      {showBulkModal && (
        <BulkBroadcastModal
          selectedConvs={conversations.filter(c => selectedConvIds.has(c.id))}
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            setShowBulkModal(false)
            setIsMultiSelect(false)
            setSelectedConvIds(new Set())
            refetch()
          }}
        />
      )}

      {/* Top-Level Assignment Modal (Completely isolated from sidebar hover loops) */}
      {assigningConv && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
          onClick={() => setAssigningConv(null)}
        >
          <div 
            className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Assign Lead</h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[170px] font-medium">
                    {assigningConv.name || assigningConv.phone_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAssigningConv(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
              {/* Option to Unassign if currently assigned */}
              {assigningConv.assigned_to && (
                <button
                  onClick={() => handleAssign('')}
                  disabled={assigning}
                  className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Unassign Lead</span>
                  <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">Clear</span>
                </button>
              )}

              {employees.length === 0 ? (
                <p className="text-center py-4 text-xs text-slate-400">No active employees available</p>
              ) : (
                employees.map((emp) => {
                  const isCurrent = emp.id === assigningConv.assigned_to
                  return (
                    <button
                      key={emp.id}
                      onClick={() => handleAssign(emp.id)}
                      disabled={assigning}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-500/10 hover:text-emerald-500 text-slate-700 dark:text-slate-200 border border-transparent hover:border-emerald-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                          isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {emp.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate">{emp.name}</span>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 shrink-0 text-white" />}
                    </button>
                  )
                })
              )}
            </div>

            <button
              onClick={() => setAssigningConv(null)}
              className="w-full py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}

function ConversationItem({
  conversation: conv,
  isSelected,
  selectedId,
  onClick,
  onDelete,
  isAdmin,
  employees,
  onOpenAssign,
  isOsmo,
  stages,
  isMultiSelect,
  isChecked,
  onToggleCheck,
}: {
  conversation: Conversation
  isSelected: boolean
  selectedId: string | null
  onClick: () => void
  onDelete: (e: React.MouseEvent) => void
  isAdmin: boolean
  employees: Employee[]
  onOpenAssign: () => void
  isOsmo: boolean
  stages: any[]
  isMultiSelect?: boolean
  isChecked?: boolean
  onToggleCheck?: () => void
}) {
  const initials = (conv.name || conv.phone_number || 'U')
    .split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)

  const timeAgo = formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })

  const assignedEmployee = employees.find(e => e.id === conv.assigned_to)

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-all duration-200 rounded-2xl border ${
        isChecked
          ? 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-500/40 shadow-sm'
          : isSelected
          ? 'bg-gradient-to-br from-emerald-50/90 to-teal-50/50 dark:from-emerald-900/20 dark:to-teal-900/10 border-emerald-500/30 dark:border-emerald-500/30 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500/20 backdrop-blur-sm'
          : 'bg-white/70 dark:bg-gray-900/50 border-transparent dark:border-transparent hover:bg-white dark:hover:bg-gray-900 border-gray-100 hover:border-gray-200 dark:hover:border-gray-800 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      {/* Checkbox for Multi-Select */}
      {isMultiSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleCheck?.()
          }}
          className="shrink-0 pt-3 text-gray-400 hover:text-emerald-500 focus:outline-none select-none cursor-pointer"
        >
          {isChecked ? (
            <CheckSquare className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
          ) : (
            <Square className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          )}
        </button>
      )}

      {/* Avatar with dynamic AI/Manual Mode Indicator */}
      <div className="relative shrink-0 select-none">
        <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${isSelected ? 'from-emerald-500 to-teal-600 shadow-emerald-500/20' : 'from-emerald-400 to-teal-500'} flex items-center justify-center text-white text-xs font-black shadow-md border border-white/20 dark:border-gray-800 transition-all duration-300 group-hover:scale-105`}>
          {initials}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-950 shadow-xs ${
            conv.ai_mode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
          title={conv.ai_mode ? 'AI Assistant active' : 'Manual takeover active'}
        />
      </div>

      {/* Main Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className={`text-sm font-bold truncate transition-colors ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400'}`}>
            {conv.name || conv.phone_number}
          </span>
          <span className={`text-[10px] font-semibold shrink-0 ml-2 transition-colors ${isSelected ? 'text-emerald-600/80 dark:text-emerald-400/80' : 'text-gray-400 group-hover:text-gray-500'}`}>{timeAgo}</span>
        </div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-mono truncate mb-1 opacity-80">
          {conv.phone_number}
        </p>
        <p className={`text-xs truncate leading-relaxed transition-colors ${isSelected ? 'text-gray-700 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
          {(() => {
            const msg = conv.last_message || ''
            if (msg === '[Received image]' || msg.includes('image')) return '📷 Image attachment'
            if (msg === '[Received audio]' || msg.includes('audio')) return '🎵 Audio message'
            if (msg === '[Received video]' || msg.includes('video')) return '🎥 Video attachment'
            if (msg === '[Received document]' || msg.includes('document')) return '📄 Document file'
            if (msg === '[Message]') return '💬 Message'
            return msg || 'No messages yet'
          })()}
        </p>

        {/* Badges Container */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          {(() => {
            const convStageVal = conv.stage || 'new'
            const matchedStage = stages.find(s => 
              s.name === convStageVal || 
              s.name === convStageVal.toLowerCase() || 
              s.id === convStageVal || 
              s.label.toLowerCase() === convStageVal.toLowerCase()
            )
            const badgeColor = matchedStage?.color || STAGE_COLORS[convStageVal as Stage] || STAGE_COLORS.new
            const badgeLabel = matchedStage?.label || convStageVal.replace(/_/g, ' ')
            return (
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${badgeColor}`}>
                {badgeLabel}
              </span>
            )
          })()}

          {/* Osmo Category Badge (Premium) */}
          {isOsmo && (
            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
              extractOsmoCategory(conv) === 'unfiltered'
                ? 'bg-gray-100 text-gray-500 border border-gray-200/60 dark:bg-gray-800/80 dark:text-gray-400 dark:border-gray-700/50'
                : 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-200/60 dark:from-emerald-950/80 dark:to-teal-950/80 dark:text-emerald-300 dark:border-emerald-800/50 shadow-sm shadow-emerald-500/5'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${extractOsmoCategory(conv) === 'unfiltered' ? 'bg-gray-400' : 'bg-emerald-500'}`} />
              {extractOsmoCategory(conv).replace('_', ' ')}
            </span>
          )}

          {/* Platform Badge */}
          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
            conv.platform === 'instagram'
              ? 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300 border border-pink-200/50'
              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50'
          }`}>
            {conv.platform || 'whatsapp'}
          </span>

          {/* 24h Window Status Badge */}
          {(() => {
            const is24hActive = conv.last_incoming_message_at
              ? (Date.now() - new Date(conv.last_incoming_message_at).getTime() <= 24 * 60 * 60 * 1000)
              : false
            return (
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${
                is24hActive
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50'
                  : 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 border border-red-200/40'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${is24hActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                {is24hActive ? '24h Open' : '24h Expired'}
              </span>
            )
          })()}

          {/* Blocked Badge */}
          {conv.is_blocked && (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300 border border-red-200/50 flex items-center gap-1">
              <Ban className="w-2.5 h-2.5" /> Blocked
            </span>
          )}
          
          {/* Assignment Badge */}
          {assignedEmployee && (
            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/50">
              👤 {assignedEmployee.name.split(' ')[0]}
            </span>
          )}
          {!assignedEmployee && isAdmin && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200/50">
              Unassigned
            </span>
          )}
        </div>
      </div>

      {/* Actions (Pure CSS hover opacity to prevent re-render shivering) */}
      <div className="flex items-center gap-1 shrink-0 select-none opacity-0 group-hover:opacity-100 transition-opacity">
        {isAdmin && (
          <button
            onClick={(e) => { e.stopPropagation(); onOpenAssign(); }}
            className="p-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors border border-blue-100/30"
            title="Assign to employee"
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-1 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 transition-colors border border-red-100/30"
          title="Delete conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Unread count badge */}
      {((conv.unread_count || 0) > 0 || (conv as any).unread) && !isSelected && (
        <div className="absolute top-3 right-3 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-white text-[10px] font-black shadow-md shadow-emerald-500/30">
          {conv.unread_count && conv.unread_count > 0 ? conv.unread_count : '1'}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-3.5 py-3 rounded-xl border border-gray-100 dark:border-gray-900 bg-white dark:bg-gray-900/40">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-850 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-3/4" />
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-full" />
            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function AddLeadModal({
  onClose,
  onSuccess,
  profile
}: {
  onClose: () => void
  onSuccess: (conv: any) => void
  profile: any
}) {
  const [leadName, setLeadName] = useState('')
  const [phone, setPhone] = useState('')
  const [templates, setTemplates] = useState<any[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [variables, setVariables] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadTemplates() {
      setLoadingTemplates(true)
      setError('')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/templates', {
          headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
        })
        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || 'Failed to fetch templates')
        }
        const data = await res.json()
        setTemplates(data || [])
      } catch (err: any) {
        setError(err.message || 'Error loading templates')
      } finally {
        setLoadingTemplates(false)
      }
    }
    loadTemplates()
  }, [])

  const handleTemplateChange = (templateName: string) => {
    const template = templates.find(t => t.name === templateName)
    setSelectedTemplate(template || null)
    if (template && template.variables) {
      setVariables(new Array(template.variables.length).fill(''))
    } else {
      setVariables([])
    }
  }

  const handleVariableChange = (index: number, value: string) => {
    setVariables(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadName || !phone || !selectedTemplate) {
      setError('Please fill in all required fields.')
      return
    }
    setSubmitting(true)
    setError('')

    try {
      // Reconstruct preview message
      let previewMessage = selectedTemplate.body || ''
      variables.forEach((val, i) => {
        previewMessage = previewMessage.replace(`{{${i + 1}}}`, val)
      })

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/conversations/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          phone,
          name: leadName,
          template_name: selectedTemplate.name,
          template_lang: selectedTemplate.language,
          variables,
          message_text: previewMessage,
          userId: profile?.id
        })
      })

      const resData = await res.json()
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to initiate conversation')
      }

      onSuccess(resData.conversation)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const getPreviewText = () => {
    if (!selectedTemplate) return ''
    let text = selectedTemplate.body || ''
    variables.forEach((val, i) => {
      text = text.replace(`{{${i + 1}}}`, val || `[Variable ${i + 1}]`)
    })
    return text
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-emerald-600 dark:bg-emerald-700">
          <h3 className="text-base font-semibold text-white">Add Lead & Initiate Chat</h3>
          <button type="button" onClick={onClose} className="text-emerald-100 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-medium border border-red-100 dark:border-red-900/40">
              ⚠️ {error}
            </div>
          )}

          {/* Lead Name */}
          <div>
            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 tracking-wider">
              LEAD NAME *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 tracking-wider">
              PHONE NUMBER * (With country code, e.g. 919739755997)
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 919739755997"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Select Template */}
          <div>
            <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1 tracking-wider">
              SELECT WHATSAPP TEMPLATE *
            </label>
            {loadingTemplates ? (
              <div className="text-xs text-gray-400 animate-pulse py-2">Loading templates from Meta...</div>
            ) : (
              <select
                required
                value={selectedTemplate?.name || ''}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Template --</option>
                {templates.map((t) => (
                  <option key={t.id || t.name} value={t.name}>
                    {t.name} ({t.language})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Dynamic Variables Inputs */}
          {selectedTemplate && selectedTemplate.variables?.length > 0 && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-850 rounded-2xl border border-gray-105 dark:border-gray-750">
              <h4 className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Template Variables
              </h4>
              {selectedTemplate.variables.map((v: string, i: number) => (
                <div key={i}>
                  <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-0.5">
                    VARIABLE {i + 1}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Enter value for ${v}`}
                    value={variables[i] || ''}
                    onChange={(e) => handleVariableChange(i, e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-850 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
              <h4 className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                Message Preview
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {getPreviewText()}
              </p>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Initiating...</span>
                </>
              ) : (
                <span>Send & Start Chat</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function BulkBroadcastModal({
  selectedConvs,
  onClose,
  onSuccess
}: {
  selectedConvs: Conversation[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [message, setMessage] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [resultSummary, setResultSummary] = useState<any | null>(null)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { profile } = useOrg()

  // Partition conversations into 24h eligible vs expired
  const now = Date.now()
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

  const eligibleConvs = selectedConvs.filter(c => {
    if (c.platform === 'instagram') return false
    if (!c.last_incoming_message_at) return false
    return (now - new Date(c.last_incoming_message_at).getTime()) <= TWENTY_FOUR_HOURS
  })

  const expiredConvs = selectedConvs.filter(c => !eligibleConvs.some(e => e.id === c.id))

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMediaFile(file)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (ev) => setMediaPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setMediaPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !mediaFile) {
      setError('Please enter a message or select a file to broadcast.')
      return
    }

    if (eligibleConvs.length === 0) {
      setError('None of the selected chats have an active 24-hour window.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      let uploadedMediaUrl: string | null = null
      let uploadedMediaType: string | null = null

      if (mediaFile) {
        const orgId = profile?.org_id
        if (!orgId) throw new Error('Organization not found')

        const ext = mediaFile.name.split('.').pop()
        const filename = `${orgId}/${Date.now()}-bulk.${ext}`

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('chat-media')
          .upload(filename, mediaFile, { contentType: mediaFile.type, upsert: false })

        if (uploadErr) throw uploadErr

        const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(filename)
        uploadedMediaUrl = urlData.publicUrl
        uploadedMediaType = mediaFile.type
      }

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/messages/bulk-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          conversation_ids: eligibleConvs.map(c => c.id),
          message: message.trim(),
          media_url: uploadedMediaUrl,
          media_type: uploadedMediaType,
          filename: mediaFile?.name || null
        })
      })

      const resData = await res.json()
      if (!res.ok) throw new Error(resData.error || 'Failed to dispatch broadcast')

      setResultSummary(resData)
    } catch (err: any) {
      setError(err?.message || 'An error occurred during bulk sending')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Bulk Broadcast Message</h3>
              <p className="text-[11px] text-gray-400">Send message to multiple active WhatsApp chats</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {resultSummary ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-gray-900 dark:text-white">Broadcast Dispatched!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Sent to <strong className="text-emerald-600 dark:text-emerald-400">{resultSummary.sentCount}</strong> active 24h chats.
                </p>
                {resultSummary.skippedCount > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {resultSummary.skippedCount} chat(s) skipped (24-hour window expired).
                  </p>
                )}
                {resultSummary.errorCount > 0 && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                    {resultSummary.errorCount} chat(s) encountered dispatch errors.
                  </p>
                )}
              </div>
              <button
                onClick={onSuccess}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-100 dark:border-red-900/40 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Recipients Breakdown Card */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Target Recipients</span>
                  <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {selectedConvs.length} Total Selected
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <p className="text-[10px] font-extrabold uppercase text-emerald-700 dark:text-emerald-300">🟢 24h Window Active</p>
                    <p className="text-lg font-black text-emerald-900 dark:text-emerald-100">{eligibleConvs.length} chats</p>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800/60">
                    <p className="text-[10px] font-extrabold uppercase text-amber-700 dark:text-amber-300">🔴 24h Expired (Skipped)</p>
                    <p className="text-lg font-black text-amber-900 dark:text-amber-100">{expiredConvs.length} chats</p>
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Broadcast Message Content *
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type message to broadcast to all eligible 24h WhatsApp chats..."
                  className="w-full p-3 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Media Attachment */}
              <div>
                <label className="block text-[10px] font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  Attachment (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                    <span>{mediaFile ? mediaFile.name : 'Choose Image / File'}</span>
                  </button>
                  {mediaFile && (
                    <button
                      type="button"
                      onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {mediaPreview && (
                  <img src={mediaPreview} alt="Preview" className="w-20 h-20 rounded-xl object-cover mt-2 border border-gray-200" />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMediaSelect}
                  className="hidden"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || eligibleConvs.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {submitting ? (
                    <span>Sending to {eligibleConvs.length} chats...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Broadcast ({eligibleConvs.length})</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
