import React, { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
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
  children?: React.ReactNode // For suggestion chips
}

export default function ChatPanel({
  messages,
  input,
  onInputChange,
  onSend,
  isLoading,
  isTestMode = false,
  loadingText = 'Generating response...',
  placeholder = 'Type your message...',
  children
}: ChatPanelProps) {
  const endRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom when messages change or loading state toggles
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const accentColor = isTestMode ? 'emerald' : 'purple'

  return (
    <div className="flex flex-col h-[calc(100vh-210px)] min-h-[420px] max-h-[750px] rounded-xl overflow-hidden bg-slate-950/40 border border-slate-800/60 relative shadow-inner">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-6">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className={`bg-slate-800/60 backdrop-blur-md border border-slate-700/50 text-slate-300 p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-3 shadow-sm`}>
              <Loader2 className={`w-4 h-4 animate-spin text-${accentColor}-400`} />
              <span className="font-medium tracking-wide">{loadingText}</span>
            </div>
          </motion.div>
        )}
        <div ref={endRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-slate-800/60 bg-slate-900/90 backdrop-blur-xl shrink-0">
        {children}
        
        <div className="flex items-end gap-2 relative">
          <textarea
            rows={1}
            placeholder={placeholder}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className={`flex-1 min-h-[44px] max-h-[120px] px-4 py-3 bg-slate-950/80 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-${accentColor}-500/80 focus:ring-1 focus:ring-${accentColor}-500/50 disabled:opacity-50 transition-all shadow-inner resize-none overflow-y-auto`}
            style={{ 
              height: input ? `${Math.min(120, Math.max(44, input.split('\n').length * 24 + 20))}px` : '44px' 
            }}
          />
          <button
            onClick={onSend}
            disabled={isLoading || !input.trim()}
            className={`p-3 shrink-0 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed
              ${isTestMode 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/25 hover:scale-105' 
                : 'bg-purple-500 hover:bg-purple-400 text-white hover:shadow-purple-500/25 hover:scale-105'
              }`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
