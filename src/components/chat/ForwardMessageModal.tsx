'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { X, Search, Send, Clock, Check, CheckSquare, Square, Share2, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export interface ForwardMessageData {
  id: string
  text: string
  mediaUrl?: string | null
  mediaType?: string | null
  filename?: string | null
}

interface ForwardMessageModalProps {
  messageData: ForwardMessageData
  onClose: () => void
}

interface ConvOption {
  id: string
  name: string
  phone_number: string
  last_incoming_message_at?: string
  platform?: string
}

export default function ForwardMessageModal({ messageData, onClose }: ForwardMessageModalProps) {
  const [conversations, setConversations] = useState<ConvOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [forwarding, setForwarding] = useState(false)
  const [resultMsg, setResultMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const res = await fetch('/api/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        const rawConvs = data.conversations || data || []
        const mapped: ConvOption[] = rawConvs.map((c: any) => ({
          id: c.id,
          name: c.name || c.leads?.name || c.leads?.[0]?.name || c.phone_number,
          phone_number: c.phone_number,
          last_incoming_message_at: c.last_incoming_message_at,
          platform: c.platform || 'whatsapp'
        }))
        setConversations(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch conversations for forwarding:', err)
    } finally {
      setLoading(false)
    }
  }

  const is24hActive = (conv: ConvOption) => {
    if (!conv.last_incoming_message_at) return false
    return (Date.now() - new Date(conv.last_incoming_message_at).getTime() <= 24 * 60 * 60 * 1000)
  }

  const filteredConvs = useMemo(() => {
    if (!search.trim()) return conversations
    const q = search.toLowerCase()
    return conversations.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.phone_number.includes(q)
    )
  }, [conversations, search])

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelect24h = () => {
    const activeSet = new Set<string>()
    conversations.forEach(c => {
      if (is24hActive(c)) activeSet.add(c.id)
    })
    setSelectedIds(activeSet)
  }

  const handleSelectAll = () => {
    const allSet = new Set<string>()
    filteredConvs.forEach(c => allSet.add(c.id))
    setSelectedIds(allSet)
  }

  const handleDeselectAll = () => {
    setSelectedIds(new Set())
  }

  const handleForwardSubmit = async () => {
    if (selectedIds.size === 0 || forwarding) return
    setForwarding(true)
    setResultMsg(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''

      const res = await fetch('/api/messages/bulk-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversation_ids: Array.from(selectedIds),
          message: messageData.text || '',
          media_url: messageData.mediaUrl || null,
          media_type: messageData.mediaType || null,
          filename: messageData.filename || null
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to forward message')
      }

      setResultMsg(`Successfully forwarded to ${data.sentCount} contact(s)!${data.skippedCount ? ` (${data.skippedCount} skipped due to expired 24h window)` : ''}`)
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error('Forward error:', err)
      alert(`Failed to forward message: ${err.message || String(err)}`)
    } finally {
      setForwarding(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
                Forward Message to Multiple Contacts
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Select recipients to send this message to</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Preview Box */}
        <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/30 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">Message Preview:</span>
          <p className="text-xs text-gray-800 dark:text-gray-200 font-medium line-clamp-2 italic bg-white/80 dark:bg-gray-900/80 p-2.5 rounded-xl border border-blue-200/50 dark:border-blue-800/40">
            "{messageData.text || (messageData.mediaUrl ? '📎 Media Attachment' : 'Message')}"
          </p>
        </div>

        {/* Filters & Actions Bar */}
        <div className="p-3 space-y-2 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-white dark:bg-gray-900">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts by name or phone..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800/80 border border-gray-200/60 dark:border-gray-700/60 rounded-xl text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={handleSelect24h}
              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 active:scale-95"
            >
              <Clock className="w-3 h-3" />
              <span>Select 24h Window Active</span>
            </button>
            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 border border-gray-200/60 dark:border-gray-700/60 text-[11px] font-bold transition-all"
            >
              Select All ({filteredConvs.length})
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeselectAll}
                className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200/50 text-[11px] font-bold transition-all"
              >
                Clear ({selectedIds.size})
              </button>
            )}
          </div>
        </div>

        {/* Contacts Checkbox List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              <span className="text-xs font-medium">Loading contacts...</span>
            </div>
          ) : filteredConvs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-xs">
              No matching contacts found.
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const selected = selectedIds.has(conv.id)
              const active = is24hActive(conv)

              return (
                <div
                  key={conv.id}
                  onClick={() => toggleSelect(conv.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    selected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-gray-800/40 border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 dark:text-blue-400">
                      {selected ? (
                        <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                        {conv.name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                        {conv.phone_number}
                      </p>
                    </div>
                  </div>

                  {/* 24h Window Badge */}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                    active 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {active ? '24h Active' : '24h Expired'}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col gap-2 shrink-0">
          {resultMsg && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center">
              {resultMsg}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleForwardSubmit}
              disabled={selectedIds.size === 0 || forwarding}
              className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {forwarding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Forwarding...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Forward Message to {selectedIds.size} Contact{selectedIds.size === 1 ? '' : 's'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
