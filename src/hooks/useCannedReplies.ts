'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export interface CannedReply {
  id: string
  shortcut: string
  title: string
  type: string
  content: string
  media_url?: string | null
  filename?: string | null
  location_data?: any
  created_at?: string
}

let globalReplies: CannedReply[] = []
let globalLoading = true
let fetchInFlight: Promise<any> | null = null
const listeners = new Set<() => void>()

const notify = () => listeners.forEach(cb => cb())

export async function fetchSharedCannedReplies(force = false) {
  if (globalReplies.length > 0 && !force) return globalReplies
  if (fetchInFlight && !force) return fetchInFlight

  fetchInFlight = (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const res = await fetch('/api/canned-replies', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          globalReplies = data
          globalLoading = false
          notify()
        }
      }
    } catch (err) {
      console.error('Fetch canned replies error:', err)
    } finally {
      fetchInFlight = null
    }
  })()

  return fetchInFlight
}

export function useCannedReplies() {
  const [replies, setReplies] = useState<CannedReply[]>(globalReplies)
  const [loading, setLoading] = useState<boolean>(globalLoading)

  useEffect(() => {
    const onChange = () => {
      setReplies(globalReplies)
      setLoading(globalLoading)
    }
    listeners.add(onChange)
    fetchSharedCannedReplies()
    return () => {
      listeners.delete(onChange)
    }
  }, [])

  return {
    replies,
    loading,
    refetch: () => fetchSharedCannedReplies(true)
  }
}
