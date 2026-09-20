'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export interface LeadStage {
  id: string
  name: string
  label: string
  color: string
  isCustom?: boolean
}

export function useLeadStages() {
  const [stages, setStages] = useState<LeadStage[]>([])
  const [customStages, setCustomStages] = useState<LeadStage[]>([])
  const [loading, setLoading] = useState(true)

  const fetchStages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return

      const res = await fetch('/api/leads/stages', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setStages(data.stages || [])
        setCustomStages(data.customStages || [])
      }
    } catch (err) {
      console.error('Failed to load lead stages:', err)
    } finally {
      setLoading(false)
    }
  }

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

    setStages(data.stages || [])
    setCustomStages(data.customStages || [])
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

    setStages(data.stages || [])
    setCustomStages(data.customStages || [])
  }

  useEffect(() => {
    fetchStages()
  }, [])

  return {
    stages,
    customStages,
    loading,
    refreshStages: fetchStages,
    addCustomStage,
    deleteCustomStage
  }
}
