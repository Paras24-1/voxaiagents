'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useOrg } from '@/contexts/OrgContext'
import { Clock, Phone, MessageSquare, X } from 'lucide-react'

interface DueFollowup {
  id: string
  conversation_id?: string | null
  phone_number: string
  name: string
  followup_date: string
  followup_notes?: string
}

// Option 2: Web Audio Chime (pleasant dual-harmonic bell tone, zero asset latency)
function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // Bell tone 1 (D5 ~587.33 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0.25, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.9)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.9)

    // Bell tone 2 (A5 ~880 Hz, harmonizing chime)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12)
    gain2.gain.setValueAtTime(0.3, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 1.2)
  } catch (err) {
    console.warn('[FollowupNotifier] Could not play chime:', err)
  }
}

export default function FollowupNotifier() {
  const router = useRouter()
  const { profile } = useOrg()
  const [activeAlerts, setActiveAlerts] = useState<DueFollowup[]>([])
  const alertedIdsRef = useRef<Set<string>>(new Set())

  // Poll for due follow-ups (every 25 seconds)
  const checkDueFollowups = useCallback(async () => {
    if (!profile?.id) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) return

      const res = await fetch('/api/followups/due', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        cache: 'no-store'
      })

      if (!res.ok) return
      const dueItems: DueFollowup[] = await res.json()
      if (!Array.isArray(dueItems) || dueItems.length === 0) return

      // Find items not yet alerted in this session
      const newDue = dueItems.filter(item => !alertedIdsRef.current.has(item.id))

      if (newDue.length > 0) {
        // Mark as alerted in memory
        newDue.forEach(item => alertedIdsRef.current.add(item.id))

        // Play Option 2 Audio Chime
        playNotificationChime()

        // Add to active Option 2 in-app alerts banner
        setActiveAlerts(prev => {
          const existingIds = new Set(prev.map(p => p.id))
          const additions = newDue.filter(item => !existingIds.has(item.id))
          return [...additions, ...prev].slice(0, 5) // Keep top 5 max
        })
      }
    } catch (err) {
      console.error('[FollowupNotifier] Error checking due followups:', err)
    }
  }, [profile?.id])

  useEffect(() => {
    if (!profile?.id) return

    checkDueFollowups()
    const interval = setInterval(checkDueFollowups, 25000)

    // Listen to manual update events across tabs / components
    const handleFollowupUpdate = () => {
      checkDueFollowups()
    }
    window.addEventListener('followup-updated', handleFollowupUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('followup-updated', handleFollowupUpdate)
    }
  }, [profile?.id, checkDueFollowups])

  // Dismiss / Mark as notified
  const handleDismiss = async (item: DueFollowup) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== item.id))

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/followups/due', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ lead_id: item.id, action: 'dismiss' })
      })
    } catch (err) {
      console.error('Failed to dismiss followup:', err)
    }
  }

  // Snooze 10 minutes
  const handleSnooze = async (item: DueFollowup) => {
    setActiveAlerts(prev => prev.filter(a => a.id !== item.id))
    // Remove from alerted set so it will alert again after 10m
    alertedIdsRef.current.delete(item.id)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/followups/due', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ lead_id: item.id, action: 'snooze_10m' })
      })
    } catch (err) {
      console.error('Failed to snooze followup:', err)
    }
  }

  const formatDueTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    } catch {
      return 'Now'
    }
  }

  if (activeAlerts.length === 0) return null

  return (
    /* Option 2: In-App Floating Alert Banners */
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-auto select-none">
      {activeAlerts.map(alert => {
        const cleanPhone = alert.phone_number.replace(/\D/g, '').slice(-10)
        return (
          <div
            key={alert.id}
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-2 border-emerald-500/80 rounded-2xl shadow-2xl shadow-emerald-500/20 p-4 animate-slide-up flex flex-col space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 animate-pulse">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Follow-up Due Now
                  </span>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight truncate max-w-[200px]">
                    {alert.name || alert.phone_number}
                  </h4>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                  {formatDueTime(alert.followup_date)}
                </span>
                <button
                  onClick={() => handleDismiss(alert)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Phone */}
            <div className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 font-mono">
              <Phone className="w-3 h-3 text-emerald-500" />
              <span>{alert.phone_number}</span>
            </div>

            {/* Notes */}
            {alert.followup_notes && (
              <div className="text-xs bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/60 p-2.5 rounded-xl text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
                <p className="text-[9px] uppercase font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">Note:</p>
                <p className="whitespace-pre-wrap">{alert.followup_notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  if (cleanPhone) router.push(`/chats?phone=${cleanPhone}`)
                  handleDismiss(alert)
                }}
                className="flex-1 py-1.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-102 cursor-pointer"
              >
                <MessageSquare className="w-3 h-3" />
                Chat
              </button>

              <button
                onClick={() => handleSnooze(alert)}
                className="py-1.5 px-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                title="Snooze for 10 minutes"
              >
                Snooze 10m
              </button>

              <button
                onClick={() => handleDismiss(alert)}
                className="py-1.5 px-2.5 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
