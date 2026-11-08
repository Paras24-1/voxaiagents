'use client'

import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useOrg } from '@/contexts/OrgContext'
import { useTheme } from 'next-themes'

export const dynamic = 'force-dynamic'

import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'
import LeadPanel from '@/components/chat/LeadPanel'
import Sidebar from '@/components/Sidebar'

import { Conversation, Lead } from '@/types'

import {
  MessageSquare,
  Moon,
  Sun,
  ArrowLeft,
  Info
} from 'lucide-react'

type MobileView = 'list' | 'chat' | 'lead'

function ChatsPageContent() {
  const {
    org,
    profile,
    signOut,
    user,
    loading
  } = useOrg()

  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get('phone')

  const { theme, setTheme } = useTheme()
  const dark = theme === 'dark'

  const [selected, setSelected] = useState<Conversation | null>(null)
  const [lead, setLead] = useState<Lead | null>(null)

  const [mobileView, setMobileView] =
    useState<MobileView>('list')

  // Auth protection
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const updated = e.detail
      if (!updated || !updated.id) return
      setSelected(prev => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev))
    }
    window.addEventListener('update-conversation', handleUpdate)
    return () => window.removeEventListener('update-conversation', handleUpdate)
  }, [])

  const handleSelect = useCallback(async (conv: Conversation) => {
    conv.unread_count = 0
    setSelected({ ...conv, unread_count: 0 })
    setMobileView('chat')
    window.dispatchEvent(new CustomEvent('update-conversation', { detail: { ...conv, unread_count: 0 } }))

    const cleanP = (conv.phone_number || '').replace(/\D/g, '').slice(-10)
    if (cleanP && typeof window !== 'undefined') {
      window.history.replaceState(null, '', `/chats?phone=${cleanP}`)
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token || ''
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }

      const res = await fetch(`/api/leads?conversation_id=${conv.id}`, { headers })
      if (res.ok) {
        const data = await res.json()
        setLead(data && data.id ? data : null)
      }
    } catch {
      setLead(null)
    }
  }, [])

  // Auto-focus selected lead's chat from URL query parameter
  useEffect(() => {
    if (!org?.id || !phone) return

    const loadDirectConversation = async () => {
      try {
        const isStaff = profile?.role !== 'admin' && profile?.role !== 'owner'
        const cleanP = phone.replace(/\D/g, '').slice(-10)
        let query = supabase
          .from('conversations')
          .select('*')
          .eq('org_id', org.id)
          .ilike('phone_number', `%${cleanP}`)
          .order('updated_at', { ascending: false })

        if (isStaff && profile?.id) {
          query = query.eq('assigned_to', profile.id)
        }

        const { data, error } = await query.limit(1).maybeSingle()

        if (error) throw error
        if (data) {
          // Only auto-select if we don't already have this phone number selected
          // to prevent overwriting the specific conversation ID the user clicked
          const currentCleanP = (selected?.phone_number || '').replace(/\D/g, '').slice(-10)
          if (currentCleanP !== cleanP) {
            handleSelect(data)
          }
        }
      } catch (err) {
        console.error('Failed to auto-select conversation by phone:', err)
      }
    }

    loadDirectConversation()
  }, [phone, org?.id, profile, handleSelect])

  const handleLeadUpdate = useCallback(
    (updates: Partial<Lead>) => {
      setLead(prev => prev ? { ...prev, ...updates } : (updates as Lead))
    },
    []
  )

  const handleDelete = useCallback(
    (id: string) => {
      if (selected?.id === id) {
        setSelected(null)
        setMobileView('list')
      }
    },
    [selected?.id]
  )

  // Hide bottom nav while inside active chat to maximize keyboard and input space
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (mobileView === 'chat') {
        document.body.classList.add('hide-bottom-nav')
      } else {
        document.body.classList.remove('hide-bottom-nav')
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('hide-bottom-nav')
      }
    }
  }, [mobileView])

  // Loading screen
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Prevent rendering before redirect
  if (!user) return null

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-gray-50/50 dark:bg-gray-950">

      {/* Header: Hidden on mobile when inside an active chat (ChatWindow displays the single native header) */}
      <header className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 pt-safe px-3 md:px-6 py-2.5 md:py-4 shrink-0 shadow-[0_2px_20px_rgba(0,0,0,0.02)] dark:shadow-[0_2px_20px_rgba(0,0,0,0.1)] z-10 ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} items-center justify-between gap-2`}>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
          <Sidebar />
          {mobileView !== 'list' && (
            <button
              onClick={() =>
                setMobileView(
                  mobileView === 'lead'
                    ? 'chat'
                    : 'list'
                )
              }
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 md:hidden transition-all shrink-0 active:scale-95"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
            <h1 className="text-xs sm:text-base font-extrabold text-gray-900 dark:text-white tracking-tight truncate">
              {mobileView === 'list' && (org?.name || 'Inbox Chats')}
              {mobileView === 'chat' && (selected?.name || selected?.phone_number || 'Chat')}
              {mobileView === 'lead' && 'Lead Info'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Lead info button on mobile */}
          {mobileView === 'chat' && selected && (
            <button
              onClick={() => setMobileView('lead')}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 md:hidden transition-colors shrink-0"
              title="View lead info"
            >
              <Info className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => setTheme(dark ? 'light' : 'dark')}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 transition-colors shrink-0"
            title="Toggle theme"
          >
            {dark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-blue-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* LEFT: Conversation list */}
        <div
          className={`
            flex flex-col overflow-hidden border-r border-gray-200/50 dark:border-gray-800/50
            ${mobileView === 'list' ? 'flex' : 'hidden'}
            md:flex md:w-80 md:shrink-0
            w-full pb-16 md:pb-0
          `}
        >
          <ConversationList
            selectedId={selected?.id ?? null}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        </div>

        {/* CENTER: Chat window */}
        <div
          className={`
            flex-1 flex flex-col overflow-hidden min-w-0
            ${mobileView === 'chat' ? 'flex' : 'hidden'}
            md:flex
          `}
        >
          <ChatWindow
            conversation={selected}
            onBack={() => setMobileView('list')}
            onViewLead={() => setMobileView('lead')}
            onAIToggle={(id, mode) => {
              if (selected?.id === id) {
                setSelected(prev =>
                  prev
                    ? {
                        ...prev,
                        ai_mode: mode
                      }
                    : null
                )
              }
            }}
          />
        </div>

        {/* RIGHT: Lead panel */}
        <div
          className={`
            flex flex-col overflow-hidden border-l border-gray-200/50 dark:border-gray-800/50
            ${mobileView === 'lead' ? 'flex' : 'hidden'}
            md:flex md:w-80 md:shrink-0
            w-full pb-16 md:pb-0
          `}
        >
          <LeadPanel
            conversation={selected}
            lead={lead}
            onLeadUpdate={handleLeadUpdate}
          />
        </div>
      </div>

      {/* MOBILE: Bottom nav */}
      {selected && (
        <div className="md:hidden flex border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 shrink-0 pb-safe">

          <button
            onClick={() =>
              setMobileView('list')
            }
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileView === 'list'
                ? 'text-emerald-600 border-t-2 border-emerald-500'
                : 'text-gray-500'
            }`}
          >
            Inbox
          </button>

          <button
            onClick={() =>
              setMobileView('chat')
            }
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileView === 'chat'
                ? 'text-emerald-600 border-t-2 border-emerald-500'
                : 'text-gray-500'
            }`}
          >
            Chat
          </button>

          <button
            onClick={() =>
              setMobileView('lead')
            }
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              mobileView === 'lead'
                ? 'text-emerald-600 border-t-2 border-emerald-500'
                : 'text-gray-500'
            }`}
          >
            Lead Info
          </button>
        </div>
      )}
    </div>
  )
}

export default function ChatsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50/50 dark:bg-gray-955">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatsPageContent />
    </Suspense>
  )
}
