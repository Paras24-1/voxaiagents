'use client'

import React, { useState } from 'react'
import { Copy, Check, Sparkles, FileText, RotateCcw, ChevronDown, Code2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface PromptInspectorProps {
  systemPrompt: string
  onSelectPreset: (promptText: string) => void
  onSavePrompt?: (promptText: string) => void
}

const PRESETS = [
  {
    name: 'Kataria Sales Consultant',
    description: 'Friendly WhatsApp sales advisor for Kataria Herbal products.',
    prompt: `You are a helpful and polite WhatsApp AI sales consultant for Kataria Herbal Remedies.

Use the Knowledge Base price list to answer user queries accurately. Keep answers concise, polite, and persuasive.
Always use customer's name {{lead_name}} when available.`
  },
  {
    name: 'E-Commerce Order Assistant',
    description: 'Specializes in product recommendations and order placement.',
    prompt: `You are an expert E-Commerce Sales Assistant on WhatsApp.

Goal: Help customer choose products, calculate total order cost, and offer a 10% first-order discount code "WELCOME10".
Format: Short bullet points, clear pricing in INR (₹).`
  },
  {
    name: 'Lead Qualification Specialist',
    description: 'Gathers key lead details like requirement, budget, and timeline.',
    prompt: `You are an AI Lead Qualification Specialist on WhatsApp.

Goal: Collect 3 key pieces of information from customer {{lead_name}}:
1. What specific products/services they need.
2. Estimated budget range.
3. Purchase timeline (e.g. immediate vs next month).

Tone: Professional, warm, and structured.`
  },
  {
    name: 'Support & FAQ Bot',
    description: 'Concise customer support bot answering FAQs instantly.',
    prompt: `You are a 24/7 Customer Support AI Assistant on WhatsApp.

Instructions: Answer customer queries concisely (1-3 sentences max). If query is complex, notify customer that representative {{assigned_employee}} will contact them shortly.`
  }
]

export default function PromptInspector({ systemPrompt, onSelectPreset }: PromptInspectorProps) {
  const [copied, setCopied] = useState(false)
  const [showPresets, setShowPresets] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(systemPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = systemPrompt.trim() ? systemPrompt.trim().split(/\s+/).length : 0
  const charCount = systemPrompt.length

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl flex flex-col h-full space-y-4 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Active System Prompt</h3>
            <p className="text-[11px] text-slate-400">Live prompt used by AI model</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-[11px] font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
            title="Copy Prompt"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quick Presets Dropdown Selector */}
      <div className="relative">
        <button
          onClick={() => setShowPresets(!showPresets)}
          className="w-full px-3.5 py-2.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-xl text-xs text-slate-300 font-medium flex items-center justify-between transition-all group shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span>Load Prompt Preset...</span>
          </div>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showPresets ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute left-0 right-0 top-12 z-30 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2 space-y-1 backdrop-blur-2xl max-h-64 overflow-y-auto"
            >
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectPreset(preset.prompt)
                    setShowPresets(false)
                  }}
                  className="w-full p-2.5 rounded-lg text-left hover:bg-slate-800/80 transition-colors flex flex-col space-y-0.5 group"
                >
                  <span className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[11px] text-slate-400 leading-tight">
                    {preset.description}
                  </span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt Code View Box */}
      <div className="flex-1 bg-slate-950/90 rounded-xl border border-slate-800/80 p-4 font-mono text-xs text-slate-300 overflow-y-auto max-h-[360px] leading-relaxed shadow-inner space-y-2 relative group">
        <div className="whitespace-pre-wrap selection:bg-purple-500/30 font-sans">
          {systemPrompt}
        </div>
      </div>

      {/* Statistics Footer */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <div className="flex items-center gap-3">
          <span>{wordCount} words</span>
          <span>•</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-1.5 text-purple-400/80">
          <Code2 className="w-3.5 h-3.5" />
          <span className="text-[10px] uppercase tracking-wider font-semibold">Live Model Ready</span>
        </div>
      </div>
    </div>
  )
}
