'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Conversation, Message } from '@/types'

// ----------------------------------------------------------------
// useConversations — fetches + subscribes to all conversations
// ----------------------------------------------------------------
export function useConversations(filters: {
  search?: string
  stage?: string
  unread?: boolean
  assignFilter?: string
  userId?: string
  isAdmin?: boolean
  userRole?: string
  selectedId?: string | null
} = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [orgId, setOrgId] = useState<string | null>(null)
  const tokenRef = useRef<string | null>(null)
  const selectedIdRef = useRef<string | null>(filters.selectedId || null)

  // Persist read IDs/phones in sessionStorage so they survive page refresh
  const readIdsRef = useRef<Set<string>>((() => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const saved = sessionStorage.getItem('chat_read_ids')
      return new Set<string>(saved ? JSON.parse(saved) : [])
    } catch { return new Set<string>() }
  })())
  const readPhonesRef = useRef<Set<string>>((() => {
    if (typeof window === 'undefined') return new Set<string>()
    try {
      const saved = sessionStorage.getItem('chat_read_phones')
      return new Set<string>(saved ? JSON.parse(saved) : [])
    } catch { return new Set<string>() }
  })())

  const persistReadState = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      // Keep only last 200 ids/phones to prevent unbounded growth
      const ids = Array.from(readIdsRef.current).slice(-200)
      const phones = Array.from(readPhonesRef.current).slice(-200)
      sessionStorage.setItem('chat_read_ids', JSON.stringify(ids))
      sessionStorage.setItem('chat_read_phones', JSON.stringify(phones))
    } catch {}
  }, [])

  const markAsRead = useCallback(async (conversationId: string) => {
    if (!conversationId) return
    readIdsRef.current.add(conversationId)

    // Optimistic update (both ID and phone variants)
    setConversations(prev => {
      const target = prev.find(c => c.id === conversationId)
      const targetPhone = target?.phone_number ? target.phone_number.replace(/\D/g, '').slice(-10) : ''
      if (targetPhone) readPhonesRef.current.add(targetPhone)
      persistReadState()

      return prev.map(c => {
        if (c.id === conversationId) return { ...c, unread_count: 0 }
        if (targetPhone && c.phone_number && c.phone_number.replace(/\D/g, '').slice(-10) === targetPhone) {
          return { ...c, unread_count: 0 }
        }
        return c
      })
    })

    // DB update — use the messages API which also clears unread in DB
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const headers = {
        'Content-Type': 'application/json',
        ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
      }
      // PATCH the conversation to set unread_count: 0 in DB
      await fetch(`/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ unread_count: 0 })
      })
    } catch (err) {
      console.error('Failed to mark conversation as read:', err)
    }
  }, [persistReadState])

  const markAllAsRead = useCallback(async () => {
    // Optimistically clear all unread
    setConversations(prev => {
      prev.forEach(c => {
        readIdsRef.current.add(c.id)
        if (c.phone_number) {
          const p = c.phone_number.replace(/\D/g, '').slice(-10)
          if (p) readPhonesRef.current.add(p)
        }
      })
      persistReadState()
      return prev.map(c => ({ ...c, unread_count: 0 }))
    })

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/conversations/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        }
      })
    } catch (err) {
      console.error('Failed to mark all conversations as read:', err)
    }
  }, [persistReadState])

  useEffect(() => {
    selectedIdRef.current = filters.selectedId || null
    if (filters.selectedId) {
      readIdsRef.current.add(filters.selectedId)
      persistReadState()
      markAsRead(filters.selectedId)
    }
  }, [filters.selectedId, markAsRead, persistReadState])

  const fetchConversations = useCallback(async (showLoading = true) => {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || null
    tokenRef.current = token
    if (!token) { setLoading(false); return }
    if (showLoading) setLoading(true)

    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.stage)  params.set('stage',  filters.stage)
    if (filters.unread) params.set('unread', 'true')

    if (filters.userRole === 'employee' && filters.userId) {
      params.set('assigned_to', filters.userId)
    } else if (
      (filters.userRole === 'admin' || filters.userRole === 'owner') &&
      filters.assignFilter &&
      filters.assignFilter !== 'all'
    ) {
      params.set('assign_filter', filters.assignFilter)
    }

    params.append('_t', Date.now().toString())

    const res = await fetch(`/api/conversations?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` },
      cache: 'no-store'
    })
    const data = await res.json()
    if (Array.isArray(data)) {
      const toReZeroInDB: string[] = []
      const normalized = data.map(c => {
        const cleanP = (c.phone_number || '').replace(/\D/g, '').slice(-10)
        const isRead = 
          readIdsRef.current.has(c.id) || 
          (cleanP && readPhonesRef.current.has(cleanP)) ||
          (selectedIdRef.current && c.id === selectedIdRef.current)
        
        if (isRead) {
          // If the DB still thinks this is unread, re-zero it silently in background
          if ((c.unread_count || 0) > 0) {
            toReZeroInDB.push(c.id)
          }
          return { ...c, unread_count: 0 }
        }
        return c
      })
      setConversations(normalized)
      if (data.length > 0 && data[0].org_id) setOrgId(data[0].org_id)

      // Background cleanup: re-zero DB for any stale conversations that are in our read set
      if (toReZeroInDB.length > 0 && token) {
        toReZeroInDB.forEach(convId => {
          fetch(`/api/conversations/${convId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ unread_count: 0 })
          }).catch(() => {})
        })
      }
    }
    setLoading(false)
  }, [filters.search, filters.stage, filters.unread, filters.assignFilter, filters.userId, filters.userRole])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Silent background poll every 20s — catches any leads missed by realtime
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations(false) // false = no loading spinner
    }, 20_000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  useEffect(() => {
    const handleLocalUpdate = (e: any) => {
      const updatedConv = e.detail
      if (!updatedConv || !updatedConv.id) return
      if (updatedConv.unread_count === 0) {
        readIdsRef.current.add(updatedConv.id)
        if (updatedConv.phone_number) {
          const p = updatedConv.phone_number.replace(/\D/g, '').slice(-10)
          if (p) readPhonesRef.current.add(p)
        }
        persistReadState()
      }
      setConversations(prev => {
        const list = prev.map(c => c.id === updatedConv.id ? { ...c, ...updatedConv } : c)
        return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      })
    }
    window.addEventListener('update-conversation', handleLocalUpdate)
    return () => window.removeEventListener('update-conversation', handleLocalUpdate)
  }, [persistReadState])

  // Realtime subscription filtered to this org only
  useEffect(() => {
    if (!orgId) return

    const channel = supabase
      .channel(`conversations-changes-${orgId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
        filter: `org_id=eq.${orgId}`
      },
        (payload) => {
          const isStaffEmployee = filters.userRole && filters.userRole !== 'admin' && filters.userRole !== 'owner'
          
          if (payload.eventType === 'INSERT') {
            const newConv = payload.new as Conversation
            if (isStaffEmployee && filters.userId && newConv.assigned_to !== filters.userId) {
              return
            }
            setConversations(prev => {
              if (prev.some(c => c.id === newConv.id)) return prev
              return [newConv, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedConv = payload.new as Conversation
            if (isStaffEmployee && filters.userId && updatedConv.assigned_to !== filters.userId) {
              setConversations(prev => prev.filter(c => c.id !== updatedConv.id))
              return
            }
            const cleanP = (updatedConv.phone_number || '').replace(/\D/g, '').slice(-10)
            const isRead = 
              updatedConv.id === selectedIdRef.current || 
              readIdsRef.current.has(updatedConv.id) ||
              (cleanP && readPhonesRef.current.has(cleanP))

            if (isRead) {
              const previousUnread = updatedConv.unread_count
              updatedConv.unread_count = 0
              if (previousUnread > 0) {
                markAsRead(updatedConv.id)
              }
            }
            setConversations(prev => {
              const list = prev.map(c => {
                if (c.id === updatedConv.id) {
                  return { 
                    ...c, 
                    ...updatedConv,
                    unread_count: isRead ? 0 : updatedConv.unread_count,
                    lead_type: c.lead_type ?? updatedConv.lead_type,
                    category: (c as any).category ?? (updatedConv as any).category
                  }
                }
                return c
              })
              return [...list].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            })
          } else if (payload.eventType === 'DELETE') {
            const oldConv = payload.old as Conversation
            setConversations(prev => prev.filter(c => c.id !== oldConv.id))
          }
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [orgId, filters.userRole, filters.userId, markAsRead])

  return { conversations, loading, refetch: fetchConversations, markAsRead, markAllAsRead }
}


// ----------------------------------------------------------------
// useMessages — fetches + subscribes to conversation messages
// ----------------------------------------------------------------
export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const addOptimisticMessage = useCallback((msg: Message) => {
    setMessages(prev => [...prev, msg])
  }, [])

  const reconcileOptimisticMessage = useCallback((tempId: string, confirmedMsg: Message | null) => {
    setMessages(prev => {
      if (!confirmedMsg) {
        return prev.map(m => m.id === tempId ? { ...m, failed: true, pending: false } : m)
      }
      return prev.map(m => m.id === tempId ? { ...confirmedMsg, pending: false } : m)
    })
  }, [])

  const fetchMessages = useCallback(async (showLoading = true) => {
    if (!conversationId) return

    try {
      if (showLoading) setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(
        `/api/messages?conversation_id=${conversationId}&_t=${Date.now()}`,
        {
          headers: session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {},
          cache: 'no-store'
        }
      )

      const data = await res.json()
      if (Array.isArray(data)) {
        setMessages(prev => {
          // Merge by ID
          const existingMap = new Map(prev.map(m => [m.id, m]))
          // Keep optimistic messages that aren't in the DB yet
          const pendingMessages = prev.filter(m => m.pending || m.failed)
          
          data.forEach((newMsg: Message) => {
            existingMap.set(newMsg.id, newMsg)
          })
          
          pendingMessages.forEach(pMsg => {
            if (!existingMap.has(pMsg.id)) {
              existingMap.set(pMsg.id, pMsg)
            }
          })
          
          return Array.from(existingMap.values()).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        })
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }
    fetchMessages(true)
  }, [conversationId, fetchMessages])

  // Background polling (5s) + window focus listener to catch any missed realtime events
  useEffect(() => {
    if (!conversationId) return

    const interval = setInterval(() => {
      fetchMessages(false)
    }, 5000)

    const handleFocus = () => fetchMessages(false)
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [conversationId, fetchMessages])

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as Message
            setMessages((prev) => {
              if (prev.some(m => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            setTimeout(() => {
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 50)
            if (newMsg.direction === 'incoming') {
              window.dispatchEvent(new CustomEvent('update-conversation', { detail: { id: conversationId, unread_count: 0 } }))
              supabase.auth.getSession().then(({ data: { session } }) => {
                fetch(`/api/conversations/${conversationId}`, {
                  method: 'PATCH',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
                  },
                  body: JSON.stringify({ unread_count: 0 })
                }).catch(() => {})
              })
            }
          } else if (payload.eventType === 'UPDATE') {
            setMessages((prev) => prev.map(msg => msg.id === payload.new.id ? { ...msg, ...(payload.new as Partial<Message>) } : msg))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  // Auto-scroll when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return { messages, loading, bottomRef, refetch: fetchMessages, addOptimisticMessage, reconcileOptimisticMessage }
}

// ----------------------------------------------------------------
// useSendMessage — handles sending replies
// ----------------------------------------------------------------
export function useSendMessage() {
  const [sending, setSending] = useState(false)

  const sendMessage = useCallback(
    async (
      conversationId: string,
      phoneNumber: string,
      message: string,
      mediaUrl?: string | null,
      mediaType?: string | null,
      extraOptions?: {
        type?: string
        template_name?: string
        template_language?: string
        template_components?: any[]
        filename?: string
        location_data?: any
      }
    ): Promise<Message | null> => {
      if (!message.trim() && !mediaUrl && !extraOptions?.template_name && !extraOptions?.location_data) return null
      setSending(true)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch('/api/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            phone_number: phoneNumber,
            message: message.trim(),
            media_url: mediaUrl,
            media_type: mediaType,
            ...extraOptions
          }),
        })
        const data = await res.json()
        if (res.ok && data.success) {
          return data.message
        }
        return null
      } catch (error) {
        console.error('Error sending message:', error)
        return null
      } finally {
        setSending(false)
      }
    },
    []
  )

  return { sendMessage, sending }
}

// ----------------------------------------------------------------
// useToggleAI — handles AI/human takeover toggle
// ----------------------------------------------------------------
export function useToggleAI() {
  const toggleAI = useCallback(
    async (conversationId: string, aiMode: boolean) => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await fetch('/api/takeover', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            ai_mode: aiMode,
          }),
        })
      } catch (error) {
        console.error('Error toggling AI mode:', error)
      }
    },
    []
  )

  return { toggleAI }
}