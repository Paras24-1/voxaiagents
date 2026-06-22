'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/contexts/OrgContext'

export default function DashboardPage() {
  const { profile, loading, user } = useOrg()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (profile) {
        if (profile.role === 'employee') {
          router.push('/chats')
        } else {
          router.push('/analytics')
        }
      }
    }
  }, [user, profile, loading, router])

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your workspace...</p>
      </div>
    </div>
  )
}