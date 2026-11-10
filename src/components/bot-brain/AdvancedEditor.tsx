'use client'

import React, { useRef, useState } from 'react'
import { AlertCircle, ExternalLink, Key, Eye, EyeOff, Plus, FileCode2, Info, Bot, UserCheck, ShieldAlert, Sparkles } from 'lucide-react'

interface AdvancedEditorProps {
  systemPrompt: string
  setSystemPrompt: (val: string) => void
  geminiApiKey: string
  setGeminiApiKey: (val: string) => void
  openaiApiKey: string
  setOpenaiApiKey: (val: string) => void
  n8nWebhookUrl: string
  setN8nWebhookUrl: (val: string) => void
  defaultAiMode?: boolean
  setDefaultAiMode?: (val: boolean) => void
  globalAiEnabled?: boolean
  setGlobalAiEnabled?: (val: boolean) => void
  autoTakeoverOnReply?: boolean
  setAutoTakeoverOnReply?: (val: boolean) => void
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
  n8nWebhookUrl, setN8nWebhookUrl,
  defaultAiMode = true, setDefaultAiMode,
  globalAiEnabled = true, setGlobalAiEnabled,
  autoTakeoverOnReply = true, setAutoTakeoverOnReply
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

      {/* Human Takeover & AI Automation Controls */}
      <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Human Takeover & AI Mode Controls
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold">
                  Dashboard Managed
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Manage automated AI responses and human staff takeover without configuring checks in external workflows.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Control 1: Global AI Kill Switch */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                  Global AI Status
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  globalAiEnabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {globalAiEnabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                When paused, all incoming automated AI replies are silenced across this tenant.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setGlobalAiEnabled && setGlobalAiEnabled(!globalAiEnabled)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                globalAiEnabled
                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {globalAiEnabled ? 'Pause AI Across Org' : 'Resume AI Automation'}
            </button>
          </div>

          {/* Control 2: Default Mode for New Chats */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Default New Chat Mode
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  defaultAiMode 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}>
                  {defaultAiMode ? 'AI First' : 'Manual First'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Choose if new incoming conversations start handled by AI or waiting for human takeover.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setDefaultAiMode && setDefaultAiMode(true)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                  defaultAiMode 
                    ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                AI Mode
              </button>
              <button
                type="button"
                onClick={() => setDefaultAiMode && setDefaultAiMode(false)}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                  !defaultAiMode 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Manual Takeover
              </button>
            </div>
          </div>

          {/* Control 3: Auto-Takeover on Human Staff Reply */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  Auto-Takeover on Reply
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  autoTakeoverOnReply 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {autoTakeoverOnReply ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                When human staff sends a message from the chat dashboard, automatically silence AI for that customer.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setAutoTakeoverOnReply && setAutoTakeoverOnReply(!autoTakeoverOnReply)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                autoTakeoverOnReply
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {autoTakeoverOnReply ? '✓ Auto-Switch to Manual' : 'Keep Current AI Mode'}
            </button>
          </div>
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
