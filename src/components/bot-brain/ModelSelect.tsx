'use client'

import React from 'react'
import { Cpu, ChevronDown, Sparkles } from 'lucide-react'

interface ModelSelectProps {
  value?: string
  onChange?: (val: string) => void
}

const MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', provider: 'Google (Recommended)' },
  { id: 'gemini-1.5-flash-latest', name: 'Gemini 1.5 Flash', provider: 'Google' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  { id: 'openai/gpt-oss-120b', name: 'Llama 3 70B (Groq)', provider: 'Groq' }
]

export default function ModelSelect({ value = 'gemini-3.6-flash', onChange }: ModelSelectProps) {
  const currentModel = MODELS.find(m => m.id === value) || MODELS[0]

  return (
    <div className="flex items-center gap-2">
      <div className="relative group">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="appearance-none pl-9 pr-8 py-1.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 hover:border-purple-500/50 rounded-xl text-xs font-bold text-purple-300 focus:outline-none focus:border-purple-500/80 cursor-pointer transition-all shadow-sm"
        >
          {MODELS.map(m => (
            <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
              {m.name} ({m.provider})
            </option>
          ))}
        </select>
        <Sparkles className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-2.5 pointer-events-none group-hover:scale-110 transition-transform" />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
      </div>
    </div>
  )
}
