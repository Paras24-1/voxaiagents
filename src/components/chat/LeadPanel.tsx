'use client'

import { useState, useEffect } from 'react'
import { Conversation, Lead } from '@/types'
import { RefreshCw } from 'lucide-react'
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


export default function LeadPanel({ conversation, lead, onLeadUpdate }: {
  conversation: Conversation | null
  lead: Lead | null
  onLeadUpdate: (updates: Partial<Lead>) => void
}) {
  const [loading, setLoading] = useState(false)
  const [sheetData, setSheetData] = useState<any>(null)

  useEffect(() => {
    if (!conversation) return
  
    const fetchLeadData = async () => {
      try {
        setLoading(true)
  
        const {
          data: { session }
        } = await supabase.auth.getSession()
  
        const res = await fetch(
          `/api/sheets?phone=${conversation.phone_number}`,
          {
            headers: session?.access_token
              ? {
                  Authorization: `Bearer ${session.access_token}`
                }
              : {}
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

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-sm">
        Select a conversation
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    )
  }

  const data = sheetData || {}

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Lead Information</h3>
        <p className="text-xs text-gray-500 mt-0.5">Synced from Google Sheets</p>
      </div>

      {/* Fields */}
<div className="p-4 space-y-4">
  {Object.entries(data)
    .filter(([key, value]) =>
      value &&
      key.toLowerCase() !== 'summary' &&
      !HIDDEN_FIELDS.includes(key.toLowerCase())
    )
    .map(([key, value]) => (
      <Field
        key={key}
        label={key.replace(/_/g, ' ')}
        value={String(value)}
        badge={
          key.toLowerCase().includes('quality') ||
          key.toLowerCase().includes('ready') ||
          key.toLowerCase().includes('status')
        }
      />
    ))}

  {data.Summary && (
    <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
        Chat Summary
      </p>

      <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {data.Summary}
        </p>
      </div>
    </div>
  )}

  {!Object.keys(data).length && !loading && (
    <div className="text-center py-8">
      <p className="text-xs text-gray-400">
        No lead data found in Google Sheets
      </p>
    </div>
  )}
</div>
    </div>
  )
}

function Field({ label, value, badge }: { label: string; value?: string; badge?: boolean }) {
  if (!value) return null

  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      {badge ? (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          value.toLowerCase() === 'yes' || value.toLowerCase() === 'high'
            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : value.toLowerCase() === 'medium'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            : value.toLowerCase() === 'no' || value.toLowerCase() === 'low'
            ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
        }`}>
          {value}
        </span>
      ) : (
        <p className="text-sm text-gray-900 dark:text-white font-medium">{value}</p>
      )}
    </div>
  )
}
