'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Bot, Sparkles, Copy, Check } from 'lucide-react'

interface MessageBubbleProps {
  role: 'user' | 'bot'
  text: string
  isTestMode?: boolean
}

export function MessageBubble({ role, text, isTestMode = false }: MessageBubbleProps) {
  const isUser = role === 'user'
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`flex items-start gap-3 group w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border shadow-md ${
          isTestMode 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10' 
            : 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-purple-500/10'
        }`}>
          {isTestMode ? <Bot className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>
      )}

      {/* Message Content Bubble */}
      <div className={`relative max-w-[80%] md:max-w-[70%] px-4 py-3 text-xs md:text-sm leading-relaxed shadow-lg transition-all group ${
        isUser
          ? isTestMode 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-xs shadow-emerald-600/20'
            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-tr-xs shadow-purple-600/20'
          : 'bg-slate-900/90 backdrop-blur-xl text-slate-100 rounded-2xl rounded-tl-xs border border-slate-800/90 shadow-slate-950/50'
      }`}>
        <p className="whitespace-pre-wrap selection:bg-purple-500/40">{text}</p>

        {/* Action icons on hover */}
        {!isUser && (
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 shadow-md">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  )
}

export default MessageBubble
