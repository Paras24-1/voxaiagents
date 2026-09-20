import React, { useRef } from 'react'
import { AlertCircle, ExternalLink, Key } from 'lucide-react'

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

const VARIABLES = ['{{lead_name}}', '{{phone_number}}', '{{assigned_employee}}', '{{assigned_employee_phone}}', '{{stage}}']

export default function AdvancedEditor({
  systemPrompt, setSystemPrompt,
  geminiApiKey, setGeminiApiKey,
  openaiApiKey, setOpenaiApiKey,
  n8nWebhookUrl, setN8nWebhookUrl
}: AdvancedEditorProps) {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  return (
    <div className="space-y-5 pt-3 border-t border-slate-800/50 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-200/90 flex items-start gap-3 shadow-inner">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-amber-400">Advanced Mode:</strong> You are directly editing the raw technical System Prompt. Do not remove routing instructions, JSON formats, or API keys unless you know what you are doing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Gemini API Key</label>
          <div className="relative group">
            <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">OpenAI API Key (Optional)</label>
          <div className="relative group">
            <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            <input
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">n8n Hybrid Webhook URL</label>
        <div className="relative group">
          <ExternalLink className="absolute left-3.5 top-3 w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          <input
            type="text"
            value={n8nWebhookUrl}
            onChange={(e) => setN8nWebhookUrl(e.target.value)}
            placeholder="https://n8n.yourdomain.com/webhook/..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/60 hover:border-emerald-500/50 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider ml-1 mr-2">Insert Variables:</span>
        {VARIABLES.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleInsertVariable(tag)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-[11px] font-mono text-emerald-400 hover:border-emerald-400 hover:text-emerald-300 transition-all active:scale-95 shadow-sm"
          >
            + {tag}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        rows={16}
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        placeholder="Enter the AI agent system prompt instructions..."
        className="w-full p-5 bg-[#0A0D14] border border-slate-700/80 hover:border-emerald-500/50 rounded-xl text-[13px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 leading-relaxed font-mono shadow-inner resize-y transition-all"
        spellCheck={false}
      />
    </div>
  )
}
