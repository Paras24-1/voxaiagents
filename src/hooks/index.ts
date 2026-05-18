'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Conversation, Message } from '@/types'

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------
type ConversationFilters = {
  search?: string
  stage?: string
  unread?: boolean
  userRole?: 'admin' | 'employee'
  userId?: string
  assignFilter?: 'all' | 'assigned' | 'unassigned'
}

// ----------------------------------------------------------------
// useConversations — fetches + subscribes to all conversations
// ----------------------------------------------------------------
export function useConversations(filters: ConversationFilters = {}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)

      const params = new URLSearchParams()

      if (filters.search) {
        params.set('search', filters.search)
      }

      if (filters.stage) {
        params.set('stage', filters.stage)
      }

      if (filters.unread) {
        params.set('unread', 'true')
      }

      // Employee → only assigned conversations
      if (filters.userRole === 'employee' && filters.userId) {
        params.set('assigned_to', filters.userId)
      }

      // Admin → assignment filters
      if (
        filters.userRole === 'admin' &&
        filters.assignFilter &&
        filters.assignFilter !== 'all'
      ) {
        params.set('assign_filter', filters.assignFilter)
      }

      // Get Supabase session token
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(`/api/conversations?${params.toString()}`, {
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : {},
      })

      const data = await res.json()

      if (Array.isArray(data)) {
        setConversations(data)
      } else {
        console.error('Invalid conversations response:', data)
        setConversations([])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }, [
    filters.search,
    filters.stage,
    filters.unread,
    filters.userRole,
    filters.userId,
    filters.assignFilter,
  ])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // ----------------------------------------------------------------
  // Subscribe to real-time conversation updates
  // ----------------------------------------------------------------
  useEffect(() => {
    const channel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations])

  return {
    conversations,
    loading,
    refetch: fetchConversations,
  }
}

// ----------------------------------------------------------------
// useMessages — fetches + subscribes to conversation messages
// ----------------------------------------------------------------
export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return

    try {
      setLoading(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(
        `/api/messages?conversation_id=${conversationId}`,
        {
          headers: session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : {},
        }
      )

      const data = await res.json()

      if (Array.isArray(data)) {
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      return
    }

    fetchMessages()
  }, [conversationId, fetchMessages])

  // ----------------------------------------------------------------
  // Real-time message subscription
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [
            ...prev,
            payload.new as Message,
          ])

          setTimeout(() => {
            bottomRef.current?.scrollIntoView({
              behavior: 'smooth',
            })
          }, 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId])

  // ----------------------------------------------------------------
  // Auto-scroll when messages update
  // ----------------------------------------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages.length])

  return {
    messages,
    loading,
    bottomRef,
    refetch: fetchMessages,
  }
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
      message: string
    ) => {
      if (!message.trim()) return false

      setSending(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const res = await fetch('/api/reply', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? {
                  Authorization: `Bearer ${session.access_token}`,
                }
              : {}),
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            phone_number: phoneNumber,
            message: message.trim(),
          }),
        })

        return res.ok
      } catch (error) {
        console.error('Error sending message:', error)
        return false
      } finally {
        setSending(false)
      }
    },
    []
  )

  return {
    sendMessage,
    sending,
  }
}

// ----------------------------------------------------------------
// useToggleAI — handles AI/human takeover toggle
// ----------------------------------------------------------------
export function useToggleAI() {
  const toggleAI = useCallback(
    async (conversationId: string, aiMode: boolean) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        await fetch('/api/takeover', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? {
                  Authorization: `Bearer ${session.access_token}`,
                }
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

  return {
    toggleAI,
  }
}