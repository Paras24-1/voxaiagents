'use client'

import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Sparkles, Trash2, Bot } from 'lucide-react'
import MessageBubble from './MessageBubble'

export interface Message {
  role: 'user' | 'bot'
  text: string
}

interface ChatPanelProps {
  messages: Message[]
  input: string
  onInputChange: (val: string) => void
  onSend: () => void
  isLoading: boolean
  isTestMode?: boolean
  loadingText?: string
  placeholder?: string
  onClearChat?: () => void
  children?: React.ReactNode // For suggestion chips
}

export default function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading,
  isTestMode = false,
  loadingText = 'AI is configuring your bot...',
  placeholder = 'Type your instructions (e.g., Make the bot friendlier and offer 10% discount)...',
  onClearChat,
  children
}: ChatPanelProps) {
  const endRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex flex-col h-[580px] rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 relative shadow-2xl">
      {/* Top Panel Bar */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">AI Prompt Engineer Assistant</h3>
            <p className="text-[10px] text-slate-400">Talk in plain English to craft & refine your system prompt</p>
          </div>
        </div>

        {onClearChat && (
          <button
            onClick={onClearChat}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            title="Reset Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages Feed Area */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <MessageBubble 
              key={idx} 
              role={msg.role} 
              text={msg.text} 
              isTestMode={isTestMode} 
            />
          ))}
        </AnimatePresence>
        
        {/* Loading Indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 text-slate-200 px-4 py-3 rounded-2xl rounded-tl-xs text-xs flex items-center gap-3 shadow-xl">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span className="font-medium tracking-wide">{loadingText}</span>
            </div>
          </motion.div>
        )}
        <div ref={endRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-2xl shrink-0 space-y-3">
        {children}
        
        <div className="flex items-end gap-2.5 relative">
          <textarea
            rows={1}
            placeholder={placeholder}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1 min-h-[48px] max-h-[120px] px-4 py-3 bg-slate-900/90 border border-slate-700/80 hover:border-purple-500/50 rounded-xl text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/40 disabled:opacity-50 transition-all shadow-inner resize-none overflow-y-auto"
            style={{ 
              height: input ? `${Math.min(120, Math.max(48, input.split('\n').length * 24 + 22))}px` : '48px' 
            }}
          />
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-3.5 shrink-0 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
