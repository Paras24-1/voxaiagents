import React from 'react'
import { motion } from 'framer-motion'
import { User, Bot, Sparkles } from 'lucide-react'

interface MessageBubbleProps {
  role: 'user' | 'bot'
  text: string
  isTestMode?: boolean
}

export default function MessageBubble({ role, text, isTestMode = false }: MessageBubbleProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`flex items-end gap-2 group w-full ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center border shadow-sm ${
          isTestMode 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
        }`}>
          {isTestMode ? <Bot className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
        </div>
      )}

      {/* Message Content */}
      <div className={`relative max-w-[75%] px-4 py-3 text-sm leading-relaxed shadow-sm transition-all ${
        isUser
          ? isTestMode 
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl rounded-tr-sm shadow-emerald-500/20'
            : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-purple-500/20'
          : 'bg-slate-800/60 backdrop-blur-md text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700/50 hover:bg-slate-800/80'
      }`}>
        <p className="whitespace-pre-wrap">{text}</p>
        
        {/* Timestamp on hover */}
        <div className={`absolute -bottom-5 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity ${
          isUser ? 'right-1' : 'left-1'
        }`}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="shrink-0 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shadow-sm">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  )
}
