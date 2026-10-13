'use client'

import React, { useState, useEffect } from 'react'
import { X, UserPlus, Send, Loader2, Sparkles, MessageSquare, ChevronDown, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { LeadStage } from '@/hooks/useLeadStages'
import { useOrg } from '@/contexts/OrgContext'

interface CreateLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result?: any) => void
  stages?: LeadStage[]
  staffList?: { id: string; name: string; email: string; role?: string }[]
  initialCategory?: string
}

const CATEGORY_OPTIONS = [
  { value: 'unfiltered', label: 'Unfiltered' },
  { value: 'dealer', label: 'Dealer' },
  { value: 'customer', label: 'Customer' },
  { value: 'osmo_dealer', label: 'Osmo Dealer' },
  { value: 'hot', label: 'Hot Lead' },
  { value: 'warm', label: 'Warm Lead' },
  { value: 'cold', label: 'Cold Lead' },
]

export default function CreateLeadModal({
  isOpen,
  onClose,
  onSuccess,
  stages = [],
  staffList = [],
  initialCategory = 'unfiltered'
}: CreateLeadModalProps) {
  const { profile } = useOrg()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [stage, setStage] = useState('new')
  const [assignedTo, setAssignedTo] = useState('')
  const [notes, setNotes] = useState('')

  // Template sending state (optional)
  const [sendWhatsApp, setSendWhatsApp] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null)
  const [variables, setVariables] = useState<string[]>([])

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load templates when WhatsApp toggle is checked
  useEffect(() => {
    if (!sendWhatsApp || templates.length > 0) return

    async function loadTemplates() {
      setLoadingTemplates(true)
      setError(null)
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
  }, [sendWhatsApp, templates.length])

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setName('')
      setPhone('')
      setCategory(initialCategory || 'unfiltered')
      setStage('new')
      setAssignedTo(profile?.id || '')
      setNotes('')
      setSendWhatsApp(false)
      setSelectedTemplate(null)
      setVariables([])
      setError(null)
    }
  }, [isOpen, initialCategory, profile?.id])

  if (!isOpen) return null

  const handleTemplateChange = (templateName: string) => {
    const tmpl = templates.find(t => t.name === templateName)
    setSelectedTemplate(tmpl || null)
    if (tmpl && tmpl.variables) {
      setVariables(new Array(tmpl.variables.length).fill(''))
    } else {
      setVariables([])
    }
  }

  const handleVariableChange = (index: number, val: string) => {
    setVariables(prev => {
      const next = [...prev]
      next[index] = val
      return next
    })
  }

  const getPreviewText = () => {
    if (!selectedTemplate) return ''
    let text = selectedTemplate.body || ''
    variables.forEach((val, i) => {
      text = text.replace(`{{${i + 1}}}`, val || `[Variable ${i + 1}]`)
    })
    return text
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Lead name is required')
      return
    }

    const cleanDigits = phone.replace(/\D/g, '')
    if (cleanDigits.length < 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    if (sendWhatsApp && !selectedTemplate) {
      setError('Please select a WhatsApp template or uncheck "Send WhatsApp Message"')
      return
    }

    setSubmitting(true)

    try {
      let previewMessage = ''
      let sanitizedVars: string[] = []

      if (sendWhatsApp && selectedTemplate) {
        previewMessage = selectedTemplate.body || ''
        variables.forEach((val, i) => {
          previewMessage = previewMessage.replace(`{{${i + 1}}}`, val?.trim() || ' ')
        })

        sanitizedVars = variables.map((v) => {
          const val = v !== undefined && v !== null ? v.trim() : ''
          return val.length > 0 ? val : ' '
        })
      }

      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/conversations/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({
          phone: cleanDigits,
          name: name.trim(),
          stage: stage || 'new',
          category: category || 'unfiltered',
          notes: notes.trim() || undefined,
          userId: assignedTo || undefined,
          ...(sendWhatsApp && selectedTemplate ? {
            template_name: selectedTemplate.name,
            template_lang: selectedTemplate.language || 'en',
            variables: sanitizedVars,
            message_text: previewMessage,
          } : {})
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lead')
      }

      onSuccess(data.conversation)
      onClose()
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the lead')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Add New Lead</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manually register a lead into your CRM & Chat Dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {/* Name & Phone in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                LEAD NAME *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                PHONE NUMBER *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Stage & Category in 2 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                STAGE
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {stages && stages.length > 0 ? (
                  stages.map(st => (
                    <option key={st.name} value={st.name}>{st.label}</option>
                  ))
                ) : (
                  <>
                    <option value="new">New</option>
                    <option value="interested">Interested</option>
                    <option value="followup">Followup</option>
                    <option value="booking">Booking</option>
                    <option value="confirmed">Confirmed</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                CATEGORY
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Assign to Employee */}
          {staffList && staffList.length > 0 && (
            <div>
              <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                ASSIGN TO EMPLOYEE (OPTIONAL)
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Unassigned --</option>
                {staffList.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.name || st.email} {st.role ? `(${st.role})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Internal Operator Notes */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
              INTERNAL NOTES (OPTIONAL)
            </label>
            <textarea
              rows={2}
              placeholder="Add internal notes about this lead..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Optional WhatsApp Template Section */}
          <div className="p-3.5 bg-gray-50 dark:bg-gray-950/60 rounded-2xl border border-gray-200/80 dark:border-gray-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  Send Initial WhatsApp Template
                </span>
              </label>
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/50">
                Optional
              </span>
            </div>

            {sendWhatsApp && (
              <div className="space-y-3 pt-2 border-t border-gray-200/60 dark:border-gray-800/60">
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 dark:text-gray-400 mb-1">
                    CHOOSE WHATSAPP TEMPLATE
                  </label>
                  {loadingTemplates ? (
                    <div className="text-xs text-gray-400 animate-pulse py-2">Loading templates...</div>
                  ) : (
                    <select
                      value={selectedTemplate?.name || ''}
                      onChange={(e) => handleTemplateChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Choose Template --</option>
                      {templates.map(t => (
                        <option key={t.id || t.name} value={t.name}>
                          {t.name} ({t.language})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedTemplate && selectedTemplate.variables?.length > 0 && (
                  <div className="space-y-2 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      Template Variables
                    </h5>
                    {selectedTemplate.variables.map((v: string, i: number) => (
                      <div key={i}>
                        <label className="block text-[10px] text-gray-500 mb-0.5">
                          Variable {i + 1} ({v})
                        </label>
                        <input
                          type="text"
                          placeholder={`Value for ${v}`}
                          value={variables[i] || ''}
                          onChange={(e) => handleVariableChange(i, e.target.value)}
                          className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedTemplate && (
                  <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                      Preview:
                    </span>
                    <p className="whitespace-pre-wrap">{getPreviewText()}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{sendWhatsApp ? 'Sending...' : 'Adding Lead...'}</span>
                </>
              ) : (
                <>
                  {sendWhatsApp ? <Send className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>{sendWhatsApp ? 'Send & Add Lead' : 'Add Lead'}</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
