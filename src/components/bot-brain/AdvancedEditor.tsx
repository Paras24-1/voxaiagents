'use client'

import React, { useRef, useState } from 'react'
import { AlertCircle, ExternalLink, Key, Eye, EyeOff, Plus, FileCode2, Info } from 'lucide-react'

interface AdvancedEditorProps {
  systemPrompt: string
  setSystemPrompt: (val: string) => void
  geminiApiKey: string
  setGeminiApiKey: (val: string) => void
  openaiApiKey: string
  setOpenaiApiKey: (val: string) => void
  n8nWebhookUrl: string
  setN8nWebhookUrl: (val: string) => void
}

const VARIABLES = [
  { tag: '{{lead_name}}', desc: 'Customer name' },
  { tag: '{{phone_number}}', desc: 'Customer phone' },
  { tag: '{{assigned_employee}}', desc: 'Assigned Agent' },
  { tag: '{{assigned_employee_phone}}', desc: 'Agent Phone' },
  { tag: '{{stage}}', desc: 'Pipeline stage' }
]

export default function AdvancedEditor({
  systemPrompt, setSystemPrompt,
  geminiApiKey, setGeminiApiKey,
  openaiApiKey, setOpenaiApiKey,
  n8nWebhookUrl, setN8nWebhookUrl
}: AdvancedEditorProps) {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showGeminiKey, setShowGeminiKey] = useState(false)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)

  const handleInsertVariable = (tag: string) => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || 0
      const end = textareaRef.current.selectionEnd || 0
      const textBefore = systemPrompt.substring(0, start)
      const textAfter = systemPrompt.substring(end)
      const newText = `${textBefore}${tag}${textAfter}`
      setSystemPrompt(newText)
      setTimeout(() => {
        textareaRef.current?.focus()
        textareaRef.current?.setSelectionRange(start + tag.length, start + tag.length)
      }, 10)
    } else {
      setSystemPrompt(systemPrompt + ` ${tag}`)
    }
  }

  const lineCount = systemPrompt.split('\n').length

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Alert Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-200/90 flex items-start gap-3 shadow-inner">
        <AlertCircle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-400 text-sm">Advanced Raw System Editor</p>
          <p className="leading-relaxed text-slate-300">
            You are editing the technical prompt directly. Make sure to preserve template variables like <code className="text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">{"{{lead_name}}"}</code> and any JSON output constraints required by your workflows.
          </p>
        </div>
      </div>

      {/* API Key Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Gemini API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              Gemini API Key
            </label>
            <span className="text-[10px] text-slate-400">Primary Model Provider</span>
          </div>
          <div className="relative group">
            <input
              type={showGeminiKey ? 'text' : 'password'}
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy... (Leave empty to use global system key)"
              className="w-full pl-4 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 hover:border-purple-500/50 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 transition-all shadow-inner font-mono"
            />
            <button
              type="button"
              onClick={() => setShowGeminiKey(!showGeminiKey)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-200 transition-colors"
            >
              {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* OpenAI API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-400" />
              OpenAI / Groq API Key
            </label>
            <span className="text-[10px] text-slate-400">Optional Fallback Provider</span>
          </div>
          <div className="relative group">
            <input
              type={showOpenAIKey ? 'text' : 'password'}
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-... or gsk_..."
              className="w-full pl-4 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner font-mono"
            />
            <button
              type="button"
              onClick={() => setShowOpenAIKey(!showOpenAIKey)}
              className="absolute right-3 top-3 text-slate-500 hover:text-slate-200 transition-colors"
            >
              {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* n8n Webhook URL */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
            n8n Hybrid Inbound Webhook URL
          </label>
          <span className="text-[10px] text-slate-400">Triggers n8n AI workflows</span>
        </div>
        <input
          type="text"
          value={n8nWebhookUrl}
          onChange={(e) => setN8nWebhookUrl(e.target.value)}
          placeholder="https://n8n.yourdomain.com/webhook/..."
          className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700/80 hover:border-blue-500/50 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/80 focus:ring-1 focus:ring-blue-500/30 transition-all shadow-inner font-mono"
        />
      </div>

      {/* Insert Variables Tool */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            Insert Template Variables:
          </span>
          <span className="text-[10px] text-slate-400">Click variable to insert into prompt</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {VARIABLES.map((v) => (
            <button
              key={v.tag}
              type="button"
              onClick={() => handleInsertVariable(v.tag)}
              className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-[11px] font-mono text-emerald-400 hover:text-emerald-300 transition-all active:scale-95 shadow-sm flex items-center gap-1.5 group"
            >
              <span>+ {v.tag}</span>
              <span className="text-[9px] text-slate-500 group-hover:text-slate-400">({v.desc})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Raw Prompt Textarea */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
            System Prompt Editor
          </label>
          <span className="text-[11px] text-slate-400 font-mono">{lineCount} lines</span>
        </div>

        <textarea
          ref={textareaRef}
          rows={14}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Enter the AI agent system prompt instructions..."
          className="w-full p-5 bg-[#080c16] border border-slate-700/80 hover:border-purple-500/50 rounded-2xl text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/80 focus:ring-1 focus:ring-purple-500/30 leading-relaxed font-mono shadow-2xl resize-y transition-all"
          spellCheck={false}
        />
      </div>
    </div>
  )
}
