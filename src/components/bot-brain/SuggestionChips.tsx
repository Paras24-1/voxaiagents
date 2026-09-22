'use client'

import React from 'react'
import { Sparkles, MessageSquarePlus, Tag, Globe, Zap, ShieldAlert } from 'lucide-react'

interface SuggestionChipsProps {
  onSelect: (text: string) => void
}

const CATEGORIZED_SUGGESTIONS = [
  { icon: Sparkles, text: "Make tone warm, friendly, and empathetic" },
  { icon: Tag, text: "Add a 10% first-order discount code WELCOME10" },
  { icon: Globe, text: "Respond in Hinglish (Hindi + English mix)" },
  { icon: Zap, text: "Keep answers ultra-concise (under 2 sentences)" },
  { icon: ShieldAlert, text: "Instruct bot to collect customer phone & email" }
]

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {CATEGORIZED_SUGGESTIONS.map((item, idx) => {
        const Icon = item.icon
        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.text)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/40 text-[11px] font-medium text-slate-300 hover:text-purple-200 transition-all flex items-center gap-2 active:scale-95 shadow-sm group"
          >
            <Icon className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span>{item.text}</span>
          </button>
        )
      })}
    </div>
  )
}
