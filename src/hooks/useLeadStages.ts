'use client'

import { useState, useEffect } from 'react'
import { supabase, fetchWithAuth } from '@/lib/supabaseClient'

export interface LeadStage {
  id: string
  name: string
  label: string
  color: string
  isCustom?: boolean
}

export const DEFAULT_STAGES: LeadStage[] = [
  { id: 'new', name: 'new', label: 'New Lead', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { id: 'interested', name: 'interested', label: 'Interested', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50' },
  { id: 'booking', name: 'booking', label: 'Booking', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50' },
  { id: 'confirmed', name: 'confirmed', label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50' },
  { id: 'cancelled', name: 'cancelled', label: 'Cancelled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50' },
  { id: 'completed', name: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50' },
  { id: 'followup', name: 'followup', label: 'Followup', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/50' },
  { id: 'not_interested', name: 'not_interested', label: 'Not Interested', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/50' },
  { id: 'call_done', name: 'call_done', label: 'Call Done', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/50' },
  { id: 'low_budget', name: 'low_budget', label: 'Low Budget', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50' },
  { id: 'hot_customer', name: 'hot_customer', label: 'Hot Customer', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/50' },
  { id: 'not_connected', name: 'not_connected', label: 'Not Connected', color: 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300' },
  { id: 'joined', name: 'joined', label: 'Joined', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200' },
  { id: 'not_joined', name: 'not_joined', label: 'Not Joined', color: 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200' },
  { id: 'contact_save', name: 'contact_save', label: 'Contact Save', color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/80 dark:text-lime-200' },
  { id: 'contact_not_save', name: 'contact_not_save', label: 'Contact Not Save', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-200' },
  { id: 'unknown', name: 'unknown', label: 'Unknown', color: 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400' }
]

// Singleton module cache to deduplicate API calls across 1000s of components
let globalStages: LeadStage[] = DEFAULT_STAGES
let globalCustomStages: LeadStage[] = []
let globalLoading = true
let fetchInFlight: Promise<any> | null = null
let hasAuthListener = false
let hasFetchedSuccessfully = false
let lastFetchTime = 0

const listeners = new Set<() => void>()

const notifyListeners = () => {
  listeners.forEach(cb => cb())
}

async function sharedFetchStages(force = false) {
  const now = Date.now()
  if (!force && hasFetchedSuccessfully) return
  if (!force && now - lastFetchTime < 10000) return
  if (fetchInFlight && !force) return fetchInFlight

  lastFetchTime = now
  fetchInFlight = (async () => {
    try {
      const res = await fetchWithAuth('/api/leads/stages')

      if (res.ok) {
        const data = await res.json()
        globalStages = data.stages && data.stages.length > 0 ? data.stages : DEFAULT_STAGES
        globalCustomStages = data.customStages || []
        globalLoading = false
        hasFetchedSuccessfully = true
        notifyListeners()
      } else {
        globalLoading = false
        notifyListeners()
      }
    } catch (err) {
      console.error('Failed to load lead stages:', err)
    } finally {
      fetchInFlight = null
    }
  })()

  return fetchInFlight
}

export function useLeadStages() {
  const [stages, setStages] = useState<LeadStage[]>(globalStages)
  const [customStages, setCustomStages] = useState<LeadStage[]>(globalCustomStages)
  const [loading, setLoading] = useState(globalLoading)

  useEffect(() => {
    const handleChange = () => {
      setStages(globalStages)
      setCustomStages(globalCustomStages)
      setLoading(globalLoading)
    }

    listeners.add(handleChange)
    sharedFetchStages()

    if (!hasAuthListener) {
      hasAuthListener = true
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token) {
          sharedFetchStages(true)
        }
      })
    }

    return () => {
      listeners.delete(handleChange)
    }
  }, [])

  const addCustomStage = async (label: string, color?: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error('Not authenticated')

    const res = await fetch('/api/leads/stages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ label, color })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to add custom stage')

    globalStages = data.stages || []
    globalCustomStages = data.customStages || []
    notifyListeners()
    return data.newStage
  }

  const deleteCustomStage = async (name: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) throw new Error('Not authenticated')

    const res = await fetch('/api/leads/stages', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete custom stage')

    globalStages = data.stages || []
    globalCustomStages = data.customStages || []
    notifyListeners()
  }

  return {
    stages,
    customStages,
    loading,
    refreshStages: () => sharedFetchStages(true),
    addCustomStage,
    deleteCustomStage
  }
}
