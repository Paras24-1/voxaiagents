'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { supabase } from '@/lib/supabaseClient'
import { motion } from 'framer-motion'
import { Brain, Save, Check, Loader2, Sparkles, RefreshCw } from 'lucide-react'

// Modular Components
import ModelSelect from '@/components/bot-brain/ModelSelect'
import StatusBadge from '@/components/bot-brain/StatusBadge'
import ChatPanel, { Message } from '@/components/bot-brain/ChatPanel'
import SuggestionChips from '@/components/bot-brain/SuggestionChips'
import AdvancedEditor from '@/components/bot-brain/AdvancedEditor'

export default function BotBrainPage() {
  const [engineMode, setEngineMode] = useState<'native' | 'hybrid_n8n'>('native')
  const [aiProvider, setAiProvider] = useState('gemini')
  const [aiModelName, setAiModelName] = useState('gemini-3.7-flash')
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
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [builderInput, setBuilderInput] = useState('')
  const [builderMessages, setBuilderMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hi! I am your AI Prompt Engineer. Tell me how you want your bot to behave, and I will configure it for you!' }
  ])
  const [isBuilding, setIsBuilding] = useState(false)

  // AI Sandbox Chat Testing State
  const [sandboxInput, setSandboxInput] = useState('')
  const [sandboxMessages, setSandboxMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am your Bot Brain AI assistant. How can I help you today?' }
  ])
  const [testingAi, setTestingAi] = useState(false)

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
        // Automatically upgrade deprecated models to current valid ones
        let model = data.ai_model_name || 'gemini-3.7-flash'
        if (model.includes('1.5') || model.includes('2.5') || model.includes('3.6')) {
          model = 'gemini-3.7-flash' 
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

  // Sandbox Test AI Response
  const handleTestSandboxSend = () => {
    if (!sandboxInput.trim()) return
    const userMsg = sandboxInput.trim()
    setSandboxInput('')

    setSandboxMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setTestingAi(true)

    setTimeout(() => {
      // Simulate AI response using System Prompt
      let replyText = `I have received your query: "${userMsg}". `
      replyText += `(Bot Brain prompt is configured for ${engineMode === 'native' ? 'Native Dashboard AI' : 'Hybrid n8n'}).`

      setSandboxMessages(prev => [...prev, { role: 'bot', text: replyText }])
      setTestingAi(false)
    }, 600)
  }

  const handleClearSandbox = () => {
    setSandboxMessages([{ role: 'bot', text: 'Hello! I am your Bot Brain AI assistant. How can I help you today?' }])
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#020617] text-slate-100 relative selection:bg-purple-500/30">
      {/* Background Animated Gradient Meshes */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[20%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Top Header Banner with Hamburger Menu */}
      <header className="sticky top-0 z-50 w-full px-6 py-3.5 border-b border-slate-800/80 bg-[#020617]/90 backdrop-blur-2xl flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-4">
          <Sidebar />
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Bot Brain Configuration
              </h1>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">Configure AI Prompt, Model, and test it live</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleSaveSettings()}
          disabled={saveStatus === 'saving'}
          className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
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
      </header>

      {/* Scrollable Workspace */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 relative z-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
            <span className="text-sm font-medium">Initializing Workspace...</span>
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto space-y-4">
            
            {/* Prompt Builder & Settings Workspace */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col space-y-4"
            >
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-inner">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <h2 className="text-lg font-bold text-white tracking-tight">AI System Prompt & Intelligence</h2>
                  <StatusBadge status={saveStatus} label={saveStatus === 'saving' ? 'Saving' : 'Prompt Updated'} />
                </div>
                <ModelSelect
                  value={aiModelName}
                  onChange={setAiModelName}
                  isAdvanced={isAdvancedMode}
                  onToggleAdvanced={() => setIsAdvancedMode(!isAdvancedMode)}
                />
              </div>

              {isAdvancedMode ? (
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl p-6 shadow-2xl">
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
                </div>
              ) : (
                <div className="shadow-2xl rounded-xl">
                  <ChatPanel
                    messages={builderMessages}
                    input={builderInput}
                    onInputChange={setBuilderInput}
                    onSend={() => handleBuilderSend()}
                    isLoading={isBuilding}
                    loadingText="Prompt Engineer is updating your bot..."
                    placeholder="E.g. Make the bot offer a 10% discount on first orders..."
                  >
                    <SuggestionChips onSelect={handleSuggestionClick} />
                  </ChatPanel>
                </div>
              )}
            </motion.div>

          </div>
        )}
      </div>
    </div>
  )
}
