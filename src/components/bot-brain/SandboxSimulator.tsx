'use client'

import React, { useState } from 'react'
import { MessageBubble } from './MessageBubble'
import { Send, RefreshCw, Bot, Sparkles, User, Play, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Message {
  role: 'user' | 'bot'
  text: string
}

interface SandboxSimulatorProps {
  systemPrompt: string
  engineMode: 'native' | 'hybrid_n8n'
  geminiApiKey?: string
  openaiApiKey?: string
}

const SAMPLE_QUESTIONS = [
  "Hi! What products or services do you offer?",
  "Do you have any special discounts for first orders?",
  "How can I contact customer support?",
  "What is your pricing structure?"
]

export default function SandboxSimulator({ systemPrompt, engineMode, geminiApiKey, openaiApiKey }: SandboxSimulatorProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am your Bot Brain AI Assistant simulator. Send a test message below to see how I respond based on your active system prompt!' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async (overrideInput?: string) => {
    const textToSend = (overrideInput || input).trim()
    if (!textToSend || isLoading) return

    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', text: textToSend }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // Direct client-side simulation call to Gemini or fallback mock with real prompt context
      const key = geminiApiKey || ''
      if (key) {
        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: `System Context Prompt:\n"${systemPrompt}"\n\nCustomer Test Message:\n"${textToSend}"\n\nGenerate the AI bot response directly:` }]
            }
          ],
          generationConfig: { temperature: 0.2 }
        }

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (res.ok) {
          const data = await res.json()
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
          if (reply) {
            setMessages([...newMessages, { role: 'bot', text: reply.trim() }])
            setIsLoading(false)
            return
          }
        }
      }

      // Fallback simulation response
      setTimeout(() => {
        let simulated = `[Simulated Bot Reply]\nThank you for reaching out! `
        if (textToSend.toLowerCase().includes('discount')) {
          simulated += `We offer a special first-order discount! Use code WELCOME10 for 10% off.`
        } else {
          simulated += `I am configured using your active prompt: "${systemPrompt.substring(0, 60)}..."`
        }
        setMessages([...newMessages, { role: 'bot', text: simulated }])
        setIsLoading(false)
      }, 700)
    } catch (err) {
      setMessages([...newMessages, { role: 'bot', text: `Error simulating response: ${String(err)}` }])
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([{ role: 'bot', text: 'Hello! Simulator reset. Send a message to start a new test conversation!' }])
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Play className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              Live Sandbox Chat Simulator
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {engineMode === 'native' ? 'Native AI' : 'Hybrid n8n'}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Test bot responses against your active prompt in real-time</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="px-3 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Test</span>
        </button>
      </div>

      {/* Preset Test Prompts Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quick Sample Questions:</span>
        {SAMPLE_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-3 py-1 rounded-full bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-[11px] text-slate-300 hover:text-emerald-300 transition-all disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Simulator Message Feed */}
      <div className="h-[420px] overflow-y-auto p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-4 shadow-inner">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} role={msg.role} text={msg.text} isTestMode={true} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 bg-slate-800/80 rounded-2xl text-xs text-slate-300 flex items-center gap-2 border border-slate-700/60 animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Simulating bot response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a test customer message..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-slate-950/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 shadow-inner"
        />
        <button
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
