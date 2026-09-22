'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Save, Check, Loader2, Sparkles, Sliders, Play, Code2, RefreshCw } from 'lucide-react'

// Modular Components
import ModelSelect from '@/components/bot-brain/ModelSelect'
import StatusBadge from '@/components/bot-brain/StatusBadge'
import ChatPanel, { Message } from '@/components/bot-brain/ChatPanel'
import SuggestionChips from '@/components/bot-brain/SuggestionChips'
import AdvancedEditor from '@/components/bot-brain/AdvancedEditor'
import PromptInspector from '@/components/bot-brain/PromptInspector'
import SandboxSimulator from '@/components/bot-brain/SandboxSimulator'

type ActiveTab = 'builder' | 'simulator' | 'advanced'

export default function BotBrainPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('builder')
  const [engineMode, setEngineMode] = useState<'native' | 'hybrid_n8n'>('native')
  const [aiProvider, setAiProvider] = useState('gemini')
  const [aiModelName, setAiModelName] = useState('gemini-3.6-flash')
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful and polite WhatsApp AI sales consultant for Kataria Herbal Remedies.\n\nUse the Knowledge Base price list below to answer user queries accurately. Keep answers concise.'
  )
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Status states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'updated' | 'error'>('idle')

  // AI Prompt Builder State
  const [builderInput, setBuilderInput] = useState('')
  const [builderMessages, setBuilderMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hi! I am your AI Prompt Engineer. Tell me how you want your WhatsApp bot to behave, and I will write and refine your system prompt automatically!' }
  ])
  const [isBuilding, setIsBuilding] = useState(false)

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || ''
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await fetch('/api/bot-brain', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setEngineMode(data.engine_mode || 'native')
        setAiProvider(data.ai_provider || 'gemini')
        let model = data.ai_model_name || 'gemini-3.6-flash'
        if (model.includes('1.5') || model.includes('2.5') || model.includes('3.7') || model.includes('2.0')) {
          model = 'gemini-3.6-flash' 
        }
        setAiModelName(model)
        if (data.system_prompt) setSystemPrompt(data.system_prompt)
        setGeminiApiKey(data.gemini_api_key || '')
        setOpenaiApiKey(data.openai_api_key || '')
        setN8nWebhookUrl(data.n8n_inbound_webhook_url || '')
      }
    } catch (err) {
      console.error('Fetch bot brain error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (overridePrompt?: string) => {
    setSaveStatus('saving')
    try {
      const token = await getToken()
      const res = await fetch('/api/bot-brain', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          engine_mode: engineMode,
          ai_provider: aiProvider,
          ai_model_name: aiModelName,
          system_prompt: overridePrompt || systemPrompt,
          gemini_api_key: geminiApiKey,
          openai_api_key: openaiApiKey,
          n8n_inbound_webhook_url: n8nWebhookUrl
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to save settings')
      }

      setSaveStatus('updated')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err: any) {
      console.error('Save error:', err)
      setSaveStatus('error')
      alert(`Failed to save Bot Brain settings: ${err.message || String(err)}`)
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }

  // AI Prompt Builder Logic
  const handleBuilderSend = async (overrideInput?: string) => {
    const userMsg = (overrideInput || builderInput).trim()
    if (!userMsg || isBuilding) return
    setBuilderInput('')

    setBuilderMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setIsBuilding(true)

    try {
      const token = await getToken()
      const res = await fetch('/api/bot-brain/builder', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          current_prompt: systemPrompt,
          api_key: geminiApiKey,
          openai_api_key: openaiApiKey
        })
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to reach Prompt Engineer AI')
      }

      const data = await res.json()
      
      setBuilderMessages(prev => [...prev, { role: 'bot', text: data.friendly_message }])
      setSystemPrompt(data.technical_prompt)
      
      // Auto-save the new prompt immediately
      await handleSaveSettings(data.technical_prompt)
    } catch (err: any) {
      console.error('Builder error:', err)
      setBuilderMessages(prev => [...prev, { role: 'bot', text: `Sorry, I encountered an error: ${err.message}` }])
    } finally {
      setIsBuilding(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleBuilderSend(suggestion)
  }

  const handlePresetSelect = (presetPrompt: string) => {
    setSystemPrompt(presetPrompt)
    handleSaveSettings(presetPrompt)
    setBuilderMessages(prev => [
      ...prev,
      { role: 'bot', text: 'Preset system prompt loaded and updated successfully!' }
    ])
  }

  const handleClearBuilderChat = () => {
    setBuilderMessages([
      { role: 'bot', text: 'Hi! I am your AI Prompt Engineer. Tell me how you want your WhatsApp bot to behave!' }
    ])
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 relative selection:bg-purple-500/30 font-sans">
      {/* Background Animated Gradient Meshes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Top Header Banner */}
      <header className="sticky top-0 z-50 w-full px-6 py-3.5 border-b border-slate-800/80 bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-between shrink-0 shadow-xl">
        <div className="flex items-center gap-4">
          <Sidebar />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Bot Brain Intelligence Hub
                <StatusBadge status={saveStatus} />
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Configure System Prompt, test live responses, and fine-tune AI logic</p>
            </div>
          </div>
        </div>

        {/* Action Controls Header */}
        <div className="flex items-center gap-3">
          {/* Active Model Selector */}
          <ModelSelect
            value={aiModelName}
            onChange={setAiModelName}
          />

          {/* Save Button */}
          <button
            onClick={() => handleSaveSettings()}
            disabled={saveStatus === 'saving'}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === 'updated' ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saveStatus === 'updated' ? 'Settings Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full relative z-10 space-y-6">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[500px] text-slate-400 space-y-4">
            <Loader2 className="w-9 h-9 animate-spin text-purple-400" />
            <span className="text-sm font-medium tracking-wide">Initializing Bot Brain Studio...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Workspace Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2 p-1 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl">
                {/* Tab 1: AI Builder */}
                <button
                  onClick={() => setActiveTab('builder')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'builder'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Prompt Engineer</span>
                </button>

                {/* Tab 2: Live Simulator */}
                <button
                  onClick={() => setActiveTab('simulator')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'simulator'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Live Simulator Playground</span>
                </button>

                {/* Tab 3: Advanced Raw Editor */}
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    activeTab === 'advanced'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Advanced Technical Editor</span>
                </button>
              </div>

              {/* Engine Mode Pill Toggle */}
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-xl p-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Engine Mode:</span>
                <button
                  onClick={() => setEngineMode('native')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    engineMode === 'native'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Native AI
                </button>
                <button
                  onClick={() => setEngineMode('hybrid_n8n')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    engineMode === 'hybrid_n8n'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hybrid n8n
                </button>
              </div>
            </div>

            {/* TAB CONTENTS */}
            <AnimatePresence mode="wait">
              {/* TAB 1: BUILDER */}
              {activeTab === 'builder' && (
                <motion.div
                  key="builder"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                >
                  {/* Left Column: Interactive Chat Panel */}
                  <div className="lg:col-span-7">
                    <ChatPanel
                      messages={builderMessages}
                      input={builderInput}
                      onInputChange={setBuilderInput}
                      onSend={() => handleBuilderSend()}
                      isLoading={isBuilding}
                      loadingText="Prompt Engineer is refining your system prompt..."
                      placeholder="Tell the AI how you want your bot to behave..."
                      onClearChat={handleClearBuilderChat}
                    >
                      <SuggestionChips onSelect={handleSuggestionClick} />
                    </ChatPanel>
                  </div>

                  {/* Right Column: Live Prompt Inspector & Preset Loader */}
                  <div className="lg:col-span-5 h-[580px]">
                    <PromptInspector
                      systemPrompt={systemPrompt}
                      onSelectPreset={handlePresetSelect}
                      onSavePrompt={handleSaveSettings}
                    />
                  </div>
                </motion.div>
              )}

              {/* TAB 2: LIVE SIMULATOR */}
              {activeTab === 'simulator' && (
                <motion.div
                  key="simulator"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  <SandboxSimulator
                    systemPrompt={systemPrompt}
                    engineMode={engineMode}
                    geminiApiKey={geminiApiKey}
                    openaiApiKey={openaiApiKey}
                  />
                </motion.div>
              )}

              {/* TAB 3: ADVANCED RAW EDITOR */}
              {activeTab === 'advanced' && (
                <motion.div
                  key="advanced"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl"
                >
                  <AdvancedEditor
                    systemPrompt={systemPrompt}
                    setSystemPrompt={setSystemPrompt}
                    geminiApiKey={geminiApiKey}
                    setGeminiApiKey={setGeminiApiKey}
                    openaiApiKey={openaiApiKey}
                    setOpenaiApiKey={setOpenaiApiKey}
                    n8nWebhookUrl={n8nWebhookUrl}
                    setN8nWebhookUrl={setN8nWebhookUrl}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
