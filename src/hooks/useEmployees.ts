'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export interface Employee {
  id: string
  name: string
  email: string
}

let globalEmployees: Employee[] = []
let fetchInFlight: Promise<any> | null = null
let hasFetched = false
const listeners = new Set<() => void>()

const notify = () => listeners.forEach(cb => cb())

export async function fetchSharedEmployees(orgId?: string, force = false) {
  if (hasFetched && !force) return globalEmployees
  if (fetchInFlight && !force) return fetchInFlight

  fetchInFlight = (async () => {
    try {
      let targetOrgId = orgId
      if (!targetOrgId) {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return
        const { data: userProf } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', session.user.id)
          .single()
        targetOrgId = userProf?.org_id
      }
      if (!targetOrgId) return

      const { data } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'employee')
        .eq('org_id', targetOrgId)
        .order('name')

      if (data) {
        globalEmployees = data
        hasFetched = true
        notify()
      }
    } catch (err) {
      console.error('Fetch employees error:', err)
    } finally {
      fetchInFlight = null
    }
  })()

  return fetchInFlight
}

export function useEmployees(orgId?: string) {
  const [employees, setEmployees] = useState<Employee[]>(globalEmployees)

  useEffect(() => {
    const onChange = () => setEmployees(globalEmployees)
    listeners.add(onChange)
    if (orgId) fetchSharedEmployees(orgId)
    return () => {
      listeners.delete(onChange)
    }
  }, [orgId])

  return {
    employees,
    refetch: () => fetchSharedEmployees(orgId, true)
  }
}
