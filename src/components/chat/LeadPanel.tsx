'use client'

import React, { useState, useEffect } from 'react'
import { Conversation, Lead } from '@/types'
import { 
  RefreshCw, Phone, User, Target, MapPin, Wrench, 
  Star, CheckCircle, MessageSquare, TrendingUp, StickyNote, Save 
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

const HIDDEN_FIELDS = [
  'last_message',
  'last_bot_message',
  'updated_at',
  'last_incoming_timestamp',
  'last_outgoing_timestamp',
  'nudge1_sent',
  'nudge2_sent',
  'final_followup_sent',
]

const FIELD_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  phone_number: Phone,
  name: User,
  customer_name: User,
  lead_type: Target,
  city: MapPin,
  location: MapPin,
  machine_interest: Wrench,
  course_interest: Wrench,
  lead_quality: Star,
  lead_score: TrendingUp,
  callback_ready: CheckCircle,
  lead_ready: CheckCircle,
  intent: Target,
  previous_qualification: Star,
  year_of_passing: CheckCircle,
  work_experience: CheckCircle,
  send_prospectus: CheckCircle,
  prospectus_type: Target
}

export default function LeadPanel({ conversation, lead, onLeadUpdate }: {
  conversation: Conversation | null
  lead: Lead | null
  onLeadUpdate: (updates: Partial<Lead>) => void
}) {
  const [loading, setLoading] = useState(false)
  const [sheetData, setSheetData] = useState<any>(null)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSaved, setNotesSaved] = useState(false)

  useEffect(() => {
    if (!conversation) return
  
    const fetchLeadData = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
  
        const res = await fetch(
          `/api/sheets?phone=${conversation.phone_number}`,
          {
            headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}
          }
        )
  
        const data = res.ok ? await res.json() : null
  
        if (data && !data.error) {
          setSheetData(data)
          onLeadUpdate(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  
    fetchLeadData()
  }, [conversation?.phone_number])

  // Load existing notes when conversation changes
  useEffect(() => {
    if (!conversation) return
    setNotes(conversation.notes || '')
    setNotesSaved(false)
  }, [conversation?.id, conversation?.notes])

  const handleSaveNotes = async () => {
    if (!conversation) return
    setSavingNotes(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`/api/conversations/${conversation.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ notes })
      })
      if (res.ok) {
        // Also update conversation object locally if needed, but the parent manages it
        setNotesSaved(true)
        setTimeout(() => setNotesSaved(false), 2000)
      } else {
        alert('Failed to save notes')
      }
    } catch (err) {
      console.error('Failed to save notes:', err)
    } finally {
      setSavingNotes(false)
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-sm">
        <div className="text-center">
          <User className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Select a conversation</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" />
      </div>
    )
  }

  const data = sheetData || {}

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Lead Details</h3>
        </div>
        <p className="text-xs text-gray-500 ml-10">Live sync from CRM Database</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {Object.keys(data).length > 0 ? (
          <>
            {Object.entries(data)
              .filter(([key, value]) =>
                value &&
                key.toLowerCase() !== 'summary' &&
                !HIDDEN_FIELDS.includes(key.toLowerCase())
              )
              .map(([key, value]) => {
                const cleanKey = key.toLowerCase();
                const Icon = FIELD_ICONS[cleanKey] || FIELD_ICONS[cleanKey.replace(/_/g, '')] || Target;
                const isBadge = cleanKey.includes('quality') || cleanKey.includes('ready') || cleanKey.includes('status');
                const isColored = cleanKey.includes('quality') || cleanKey.includes('score');
                return (
                  <InfoCard 
                    key={key} 
                    icon={Icon} 
                    label={key.replace(/_/g, ' ')} 
                    value={String(value)} 
                    badge={isBadge} 
                    colored={isColored} 
                  />
                );
              })}

            {data.Summary && (
              <div className="mt-5 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">Conversation Summary</p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {data.Summary}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">No lead data found</p>
            <p className="text-xs text-gray-500">Data will appear once synced from CRM Database</p>
          </div>
        )}

        {/* Notes Section */}
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center">
                <StickyNote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">Notes</p>
            </div>
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                notesSaved
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-emerald-100 hover:text-emerald-700'
              }`}
            >
              {savingNotes ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
              {notesSaved ? 'Saved!' : 'Save'}
            </button>
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this lead..."
            rows={4}
            className="w-full text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder-gray-400 border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, badge, colored }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value?: string
  badge?: boolean
  colored?: boolean
}) {
  if (!value) return null

  return (
    <div className="p-3.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-900 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
          <Icon className="w-3 h-3" />
        </div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{label}</p>
      </div>
      {badge ? (
        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
          colored
            ? value.toLowerCase() === 'high' || parseInt(value) >= 80
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
              : value.toLowerCase() === 'medium' || (parseInt(value) >= 50 && parseInt(value) < 80)
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            : value.toLowerCase() === 'yes'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {value}
        </span>
      ) : (
        <p className="text-sm text-gray-900 dark:text-white font-medium break-words">{value}</p>
      )}
    </div>
  )
}
