'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrg } from '@/contexts/OrgContext'
import { Capacitor } from '@capacitor/core'

export default function DashboardPage() {
  const { profile, loading, user } = useOrg()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login')
        return
      }

      const isMobileApp = typeof window !== 'undefined' && (
        Capacitor.isNativePlatform() ||
        (window as any).Capacitor?.isNativePlatform?.() ||
        navigator.userAgent.includes('Capacitor') ||
        navigator.userAgent.includes('voxai-mobile') ||
        window.location.search.includes('app=true') ||
        window.innerWidth < 768
      )

      const search = typeof window !== 'undefined' ? window.location.search : ''

      if (profile) {
        // On mobile app, default to /chats for instant access; on desktop, admin/owner goes to /analytics
        if (profile.role === 'employee' || isMobileApp) {
          router.replace(`/chats${search}`)
        } else {
          router.replace(search ? `/chats${search}` : '/analytics')
        }
      } else {
        // Fallback: If user is authenticated, send to /chats rather than leaving on spinner
        router.replace(`/chats${search}`)
      }
    }
  }, [user, profile, loading, router])

  // Watchdog timer: If loading takes more than 2 seconds, navigate forward safely
  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/chats')
      } else if (!loading) {
        router.replace('/login')
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [user, loading, router])

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading your workspace...</p>
      </div>
    </div>
  )
}