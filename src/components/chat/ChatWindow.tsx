'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Conversation, Message } from '@/types'
import { useMessages, useSendMessage, useToggleAI } from '@/hooks'
import { format } from 'date-fns'
import { Send, Bot, User, Phone, RefreshCw, Paperclip, X, Tag } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Props {
  conversation: Conversation | null
  onAIToggle?: (conversationId: string, aiMode: boolean) => void
}

const STAGES = ['new', 'interested', 'booking', 'confirmed', 'cancelled', 'completed', 'followup', 'not_interested', 'call_done', 'low_budget', 'hot_customer'] as const

const STAGE_COLORS: Record<string, string> = {
  new:            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  interested:     'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  booking:        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  confirmed:      'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  cancelled:      'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
  completed:      'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  followup:       'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  not_interested: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  call_done:      'bg-lime-100 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300',
  low_budget:     'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  hot_customer:   'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
}

export default function ChatWindow({ conversation, onAIToggle }: Props) {
  const [input, setInput] = useState('')
  const [aiMode, setAiMode] = useState(conversation?.ai_mode ?? true)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [stage, setStage] = useState(conversation?.stage || 'new')
  const [savingStage, setSavingStage] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { messages, loading, bottomRef } = useMessages(conversation?.id ?? null)
  const { sendMessage, sending } = useSendMessage()
  const { toggleAI } = useToggleAI()

  useEffect(() => {
    if (conversation) {
      setAiMode(conversation.ai_mode)
      setStage(conversation.stage || 'new')
    }
    handleRemoveImage()
  }, [conversation])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image too large. Max 5MB.')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSend = async () => {
    if (!conversation || sending || uploading) return
    
    let mediaUrl = null
    let mediaType = null

    if (imageFile) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', imageFile)

        const { data: { session } } = await supabase.auth.getSession()
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {},
          body: formData
        })

        if (!uploadRes.ok) {
          const error = await uploadRes.json()
          throw new Error(error.error || 'Upload failed')
        }

        const uploadData = await uploadRes.json()
        mediaUrl = uploadData.url
        mediaType = imageFile.type

        handleRemoveImage()
      } catch (err: any) {
        alert(err.message || 'Failed to upload image')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    const text = input.trim()
    if (text || mediaUrl) {
      setInput('')
      const success = await sendMessage(conversation.id, conversation.phone_number, text, mediaUrl, mediaType)
      if (!success && text) {
        setInput(text) // Restore text on failure
      } else if (success && aiMode) {
        setAiMode(false) // Auto-disable AI mode on manual human reply
        onAIToggle?.(conversation.id, false)
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleToggleAI = async () => {
    if (!conversation) return
    const newMode = !aiMode
    setAiMode(newMode)
    await toggleAI(conversation.id, newMode)
    onAIToggle?.(conversation.id, newMode)
  }

  const handleStageChange = async (newStage: string) => {
    if (!conversation) return
    setSavingStage(true)
    setStage(newStage)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch(`/api/conversations/${conversation.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {})
        },
        body: JSON.stringify({ stage: newStage })
      })
    } catch (err) {
      console.error('Failed to update stage:', err)
    } finally {
      setSavingStage(false)
    }
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Phone className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">Select a conversation</p>
        <p className="text-sm text-gray-400 mt-1">Choose from the inbox to start monitoring</p>
      </div>
    )
  }

  const initials = (conversation.name || conversation.phone_number || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shrink-0 justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{conversation.name}</p>
            <p className="text-xs text-gray-500">{conversation.phone_number}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Stage Selector */}
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={stage}
              onChange={(e) => handleStageChange(e.target.value)}
              disabled={savingStage}
              className={`text-xs px-2 py-1 rounded-lg font-medium border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50 ${STAGE_COLORS[stage]}`}
            >
              {STAGES.map(s => (
                <option key={s} value={s} className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                  {s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* AI Toggle */}
          <button
            onClick={handleToggleAI}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              aiMode
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400'
            }`}
          >
            {aiMode ? <><Bot className="w-3.5 h-3.5" /> AI Mode ON</> : <><User className="w-3.5 h-3.5" /> Human Mode</>}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          <>
            <MessageGroups messages={messages} />
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 shrink-0">
          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-16 h-16 rounded-lg object-cover border-2 border-emerald-500"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{imageFile?.name}</p>
              <p className="text-[10px] text-gray-500">{((imageFile?.size || 0) / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 shrink-0">
        {!aiMode && (
          <div className="flex items-center gap-1.5 text-xs text-orange-600 dark:text-orange-400 mb-2 font-medium">
            <User className="w-3.5 h-3.5" />
            Human takeover active — you are replying directly
          </div>
        )}
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || sending || !!imageFile}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
            title="Attach image"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none px-3 py-2 text-sm rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-h-32 overflow-y-auto"
            style={{ minHeight: '40px' }}
          />
          
          <button
            onClick={handleSend}
            disabled={(!input.trim() && !imageFile) || sending || uploading}
            className="p-2.5 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {sending || uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

function MessageGroups({ messages }: { messages: Message[] }) {
  const groups: Message[][] = []
  let currentGroup: Message[] = []
  for (const msg of messages) {
    if (currentGroup.length === 0 || currentGroup[0].direction === msg.direction) {
      currentGroup.push(msg)
    } else {
      groups.push(currentGroup)
      currentGroup = [msg]
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup)
  return (
    <>
      {groups.map((group, gi) => (
        <MessageGroup key={gi} messages={group} />
      ))}
    </>
  )
}

function MessageGroup({ messages }: { messages: Message[] }) {
  const isOutgoing = messages[0].direction === 'outgoing'
  return (
    <div className={`flex flex-col gap-0.5 my-1 ${isOutgoing ? 'items-end' : 'items-start'}`}>
      {messages.map((msg, i) => (
        <MessageBubble key={msg.id} message={msg} isLast={i === messages.length - 1} />
      ))}
    </div>
  )
}

function MessageBubble({ message, isLast }: { message: Message; isLast: boolean }) {
  const isOutgoing = message.direction === 'outgoing'
  const time = format(new Date(message.timestamp), 'h:mm a')

  return (
    <div className={`max-w-[70%] flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}>
      <div className={`rounded-2xl overflow-hidden ${
        isOutgoing
          ? 'bg-emerald-500 text-white rounded-br-md'
          : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-bl-md border border-gray-100 dark:border-gray-800/80'
      }`}>
        {/* Image */}
        {message.media_url && message.media_type?.startsWith('image/') && (
          <a href={message.media_url} target="_blank" rel="noopener noreferrer">
            <img
              src={message.media_url}
              alt="Shared image"
              className="max-w-[260px] max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </a>
        )}

        {/* Document */}
        {message.media_url && message.media_type === 'document' && (
          <a href={message.media_url} target="_blank" rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3.5 py-2 text-sm ${isOutgoing ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
            <span className="text-lg">📄</span>
            <span className="underline">View Document</span>
          </a>
        )}

        {/* Audio */}
        {message.media_url && message.media_type === 'audio' && (
          <div className="px-3 py-2">
            <audio controls className="max-w-[220px] h-8">
              <source src={message.media_url} />
            </audio>
          </div>
        )}

        {/* Text */}
        {message.message && !['image', 'document', 'audio'].includes(message.media_type || '') && (
          <p className="px-3.5 py-2 text-sm leading-relaxed break-words">
            {message.message}
          </p>
        )}

        {/* Text caption below image */}
        {message.media_url && message.media_type?.startsWith('image/') && message.message && !message.message.startsWith('[') && (
          <p className="px-3.5 py-2 text-sm leading-relaxed break-words">
            {message.message}
          </p>
        )}
      </div>

      {isLast && (
        <span className="text-[10px] text-gray-400 mt-0.5 px-1">{time}</span>
      )}
    </div>
  )
}
