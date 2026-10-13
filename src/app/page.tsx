'use client'

import { motion, AnimatePresence } from "framer-motion"
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bot,
  Brain,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Database,
  ExternalLink,
  Filter,
  GraduationCap,
  Headphones,
  HeartPulse,
  HelpCircle,
  Instagram,
  Layers,
  LayoutDashboard,
  LineChart,
  Lock,
  Mail,
  Menu,
  MessageSquare,
  Mic,
  Network,
  Phone,
  PhoneCall,
  Play,
  Pause,
  Radio,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Server,
  ShieldCheck,
  Sliders,
  Sparkles,
  Terminal,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
  Workflow,
  X,
  Zap,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useOrg } from "@/contexts/OrgContext"

// Official Contact Credentials & Demo Endpoints
const WHATSAPP_NUMBER = "+91 7015551637"
const CALL_NUMBER = "+91 8708551637"
const EMAIL_ADDRESS = "voxai4278@gmail.com"
const LOCATION = "Model Town, Rohtak, Haryana"
const INSTAGRAM_HANDLE = "voxai.agents"
const WEBSITE_URL = "voxaiagents.com"

const WHATSAPP_CTA = `https://wa.me/917015551637?text=${encodeURIComponent("Hello! I want to deploy a custom AI Employee for my business across Calls, WhatsApp, Instagram, and Email.")}`
const CALL_CTA = "tel:+918708551637"
const CALENDLY_CTA = `https://wa.me/917015551637?text=${encodeURIComponent("Hi! I would like to schedule an AI Employee architecture session.")}`

// ─── Neural Particle Canvas Background ──────────────────────────────────────────

function NeuralSynapseField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const points = Array.from({ length: 55 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0004,
      vy: (Math.random() - 0.5) * 0.0004,
    }))

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr
      ctx.clearRect(0, 0, w, h)

      for (const p of points) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
      }

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i]
          const b = points[j]
          const dx = (a.x - b.x) * w
          const dy = (a.y - b.y) * h
          const dist = Math.hypot(dx, dy)
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.25
            ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x * w, a.y * h)
            ctx.lineTo(b.x * w, b.y * h)
            ctx.stroke()
          }
        }
      }

      for (const p of points) {
        ctx.fillStyle = "rgba(139, 92, 246, 0.6)"
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, 1.8, 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    draw()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
      aria-hidden
    />
  )
}

// ─── Main Landing Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useOrg()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState<'voice' | 'whatsapp' | 'instagram' | 'email'>('voice')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioTranscriptIndex, setAudioTranscriptIndex] = useState(0)

  // ─── "Chat with your AI Employee" Executive Queries ─────────────────────────
  const executivePrompts = [
    {
      id: "summary",
      label: "Today's Briefing",
      question: "Hey Nova, give me a complete debrief of today's business activity.",
      response: {
        headline: "Operational Debrief for Today (Unified Cortex)",
        bullets: [
          "📞 Phone Calls: 42 inbound/outbound calls handled autonomously. 9 booked for direct sales demo, 4 warm-transferred to human closers.",
          "💬 WhatsApp: 114 prospective conversations active. Generated ₹5,80,000 in customized quotes with zero human manual intervention.",
          "📸 Instagram: Auto-responded to 68 Reel comments, converted 23 direct DMs into verified phone numbers in CRM.",
          "✉️ Email: Cleaned incoming inbox, categorized 14 partner inquiries, and pre-drafted 3 enterprise RFP proposals for your 1-click approval.",
        ],
        kpis: [
          { label: "Leads Captured", val: "179" },
          { label: "Avg Response Time", val: "1.2 sec" },
          { label: "Qualified Pipeline", val: "₹18.4L" },
          { label: "Human Hours Saved", val: "7.5 hrs" },
        ],
        alert: "⚡ 2 high-ticket prospects requested custom ERP API integration. Briefing dossiers prepared on your desk.",
      },
    },
    {
      id: "leads",
      label: "Hot Leads to Close",
      question: "Which high-intent leads are ready for my human closers right now?",
      response: {
        headline: "High-Intent Prospects Awaiting Human Handoff",
        bullets: [
          "1. Rajesh Singhania (Industrial Manufacturing): Confirmed ₹15L budget for 4-factory automation. Wants contract call tomorrow at 3 PM.",
          "2. Dr. Ananya Verma (Clinic Network, 6 branches): Qualified for multi-doctor patient triage & WhatsApp booking. Call transcript attached.",
          "3. Vikram Mehta (Luxury Real Estate): Ready to deploy Instagram Reel DM automation for 3 luxury residential towers in Gurgaon.",
        ],
        kpis: [
          { label: "High-Intent Deals", val: "3" },
          { label: "Total Deal Value", val: "₹28,50,000" },
          { label: "Qualification Score", val: "9.8 / 10" },
          { label: "Handoff Status", val: "Context Pushed to CRM" },
        ],
        alert: "🎯 Full conversation summaries and audio call recordings are pre-loaded in your dashboard.",
      },
    },
    {
      id: "voice",
      label: "Voice Calls & Objections",
      question: "Summarise the phone calls and customer objections from today.",
      response: {
        headline: "Voice Telephony Sentiment & Objection Analysis",
        bullets: [
          "Total Call Minutes: 94 mins across 42 automated calls with 0 dropped sessions.",
          "Most Common Question (58%): 'Can your AI employee speak both Hindi and English?' — AI answered affirmatively and switched languages seamlessly.",
          "Second Question (34%): 'Can it connect directly to my existing phone number?' — AI explained SIP trunking and number forwarding without changing SIMs.",
        ],
        kpis: [
          { label: "Speech Latency", val: "340ms" },
          { label: "Human Cadence", val: "99.4%" },
          { label: "Objections Handled", val: "31 / 34" },
          { label: "Transferred Live", val: "4 to Closers" },
        ],
        alert: "🎙️ Zero robotic tone complaints. 92% of callers believed they were speaking to an in-office executive.",
      },
    },
    {
      id: "social",
      label: "Instagram & WhatsApp Ads",
      question: "How are our Instagram ads and WhatsApp campaigns converting today?",
      response: {
        headline: "Social Omnichannel Conversion Velocity",
        bullets: [
          "Meta Ads: 86 clicks triggered instant WhatsApp conversations within 1.5 seconds.",
          "Instagram Reel 'How AI Replaces 5 Employees' generated 140 comments with keyword 'DEMO', instantly triggering private DM sales sequences.",
          "Conversion Rate: 26.7% of all social interactions progressed to budget qualification stage.",
        ],
        kpis: [
          { label: "Ad Leads Engaged", val: "86" },
          { label: "Reel DMs Triggered", val: "140" },
          { label: "Phone Numbers Extracted", val: "54" },
          { label: "Ad CPA Reduction", val: "-38%" },
        ],
        alert: "🚀 Zero lead leakage: Even night-time leads (11 PM - 4 AM) were fully qualified and booked.",
      },
    },
  ]

  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [customInput, setCustomInput] = useState("")
  const [isTypingTerminal, setIsTypingTerminal] = useState(false)

  const handleSelectPrompt = (idx: number) => {
    setActivePromptIndex(idx)
    setIsTypingTerminal(true)
    setTimeout(() => setIsTypingTerminal(false), 250)
  }

  // ─── Real Speech Synthesis Audio Simulation ─────────────────────────────────
  const audioSamplePhrases = [
    "Hello! I am your company's custom AI Employee. I answer customer calls in under 350 milliseconds.",
    "I handle inquiries across WhatsApp and Instagram simultaneously, qualifying budgets and timelines.",
    "When a high-intent prospect is ready to buy, I transfer them straight to your human closers with full context.",
  ]

  const toggleVoicePlayback = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel()
        setIsPlayingAudio(false)
      } else {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(audioSamplePhrases[audioTranscriptIndex % audioSamplePhrases.length])
        utterance.rate = 1.05
        utterance.pitch = 1.0
        utterance.onend = () => {
          setIsPlayingAudio(false)
          setAudioTranscriptIndex((prev) => (prev + 1) % audioSamplePhrases.length)
        }
        utterance.onerror = () => setIsPlayingAudio(false)
        window.speechSynthesis.speak(utterance)
        setIsPlayingAudio(true)
      }
    } else {
      setIsPlayingAudio(!isPlayingAudio)
    }
  }

  // ─── Live Telemetry Stream Ticker ──────────────────────────────────────────
  const [tickerItems, setTickerItems] = useState([
    { channel: "INSTAGRAM", text: "Auto-converted Reel comment into qualified WhatsApp lead (+91 98XXX)", time: "Just now", color: "text-pink-400" },
    { channel: "PHONE CALL", text: "Completed 2m 45s inbound qualification — meeting scheduled on Google Calendar", time: "18s ago", color: "text-cyan-400" },
    { channel: "WHATSAPP", text: "Sent customized PDF quotation (₹4,20,000 value) to B2B distributor", time: "42s ago", color: "text-emerald-400" },
    { channel: "EMAIL", text: "Auto-triaged inbound enterprise RFP and generated executive draft for review", time: "1m ago", color: "text-violet-400" },
  ])

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerItems((prev) => {
        const copy = [...prev]
        const first = copy.shift()!
        copy.push(first)
        return copy
      })
    }, 4500)
    return () => clearInterval(timer)
  }, [])

  // ─── 4 Channels Data ───────────────────────────────────────────────────────
  const channelData = {
    voice: {
      name: "AI Voice Employee",
      tagline: "Ultra-Realistic Telephony with Zero Delay",
      badge: "SUB-350ms LATENCY",
      icon: PhoneCall,
      color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
      description:
        "Sounds like your highest-performing sales executive. Answers inbound phone calls within one ring, calls new leads within 45 seconds, understands interruptions and colloquial slang, and warm-transfers hot deals to your human team.",
      capabilities: [
        "Inbound receptionist & proactive outbound lead caller",
        "Sub-350ms response latency with natural breathing and pacing",
        "Multilingual speech: English, Hindi, and regional inflections",
        "Direct warm-transfer to live human sales reps with audio briefing",
      ],
      sampleDialog: [
        { sender: "caller", text: "Hi, I saw your automation package. Do you do custom ERP integrations for wholesale distributors?" },
        { sender: "ai", text: "Yes, absolutely! We connect directly with SAP, Tally, Zoho, and custom PostgreSQL databases. How many SKUs and warehouse locations are you managing?" },
        { sender: "caller", text: "Around 12,000 SKUs across four warehouses in North India." },
        { sender: "ai", text: "Got it. That fits our custom multi-warehouse workflow. Let me connect you directly with our senior solutions architect right now." },
      ],
      telemetry: { "Speech Engine": "Neural PCM Stream", Latency: "340ms", Intent: "Enterprise Lead" },
    },
    whatsapp: {
      name: "WhatsApp AI Employee",
      tagline: "Your 24/7 Multilingual Conversational Closer",
      badge: "OFFICIAL META CLOUD API",
      icon: MessageSquare,
      color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      description:
        "An autonomous salesperson on WhatsApp that never sleeps. Qualifies buyers, shares product catalogs, calculates customized estimates, sends PDF brochures, and schedules appointments right into your team's calendar.",
      capabilities: [
        "Instant reply in customer's preferred language (English, Hindi, etc.)",
        "Grounded in product specs, pricing guidelines, and live inventory",
        "Dispatches payment links, PDFs, catalog carousels, and location maps",
        "Enrolls unresponsive leads into polite, non-spam drip nurturing",
      ],
      sampleDialog: [
        { sender: "user", text: "Hi, what is the cost of deploying an AI employee for my clinic?" },
        { sender: "ai", text: "Hello! Our clinic setup handles patient triage, doctor appointment booking, and WhatsApp reminders at ₹20,000 one-time setup and ₹5,000/mo retainer. How many doctors practice at your clinic?" },
        { sender: "user", text: "We have 4 doctors and see about 50 patients daily." },
        { sender: "ai", text: "Perfect. We can have your patient booking system live in 72 hours. Would you like me to book an onboarding session or send our medical clinic case study?" },
      ],
      telemetry: { "Message Rate": "100+ msg/sec", "Token Speed": "92 tok/sec", Status: "Lead Scored: 9.8/10" },
    },
    instagram: {
      name: "Instagram AI Employee",
      tagline: "Turns Reel Comments & DMs into Paying Customers",
      badge: "DIRECT SOCIAL CONVERSION",
      icon: Instagram,
      color: "from-pink-500/20 to-purple-500/10 border-pink-500/30",
      description:
        "Never miss a viral Reel spike. When followers comment on your Reels or reply to your Stories, your AI employee replies in milliseconds, opens a DM conversation, extracts their phone number, and syncs them to your CRM.",
      capabilities: [
        "Comment 'INFO' trigger: Sends instant DM with pricing and links",
        "Story reply and direct message triage 24 hours a day",
        "Screens out spam and converts casual scrollers into warm buyers",
        "Captures verified contact details without hiring social media agencies",
      ],
      sampleDialog: [
        { sender: "user", text: "Saw your Reel on luxury villas! What is the price range for 4BHK in Sector 65?" },
        { sender: "ai", text: "Hey there! The 4BHK luxury residences start at ₹4.2 Cr with private elevators and golf view. Are you looking for self-use or high-yield investment?" },
        { sender: "user", text: "Self-use, planning to move in by next quarter." },
        { sender: "ai", text: "Wonderful. I have 2 ready-to-move penthouses available. What is your WhatsApp number so I can send the video walk-through and layout plans?" },
      ],
      telemetry: { "Comment-to-DM": "< 1.5s", "Lead Extraction": "Verified Phone", Status: "Site Visit Pending" },
    },
    email: {
      name: "Executive Email AI Employee",
      tagline: "Inbox Zero, Hyper-Personalized Triage & RFP Drafting",
      badge: "COGNITIVE INBOX ENGINE",
      icon: Mail,
      color: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30",
      description:
        "An executive email partner that reads incoming enterprise inquiries, categorizes opportunities, generates bespoke context-aware replies matching your company voice, and keeps high-value pipelines warm.",
      capabilities: [
        "Inbox Zero triage: separates critical client deals from junk mail",
        "Generates context-aware, hyper-personalized email drafts",
        "Synchronizes every lead touchpoint with your CRM and Google Sheets",
        "Re-engages dormant opportunities with contextual check-ins",
      ],
      sampleDialog: [
        { sender: "client", text: "Subject: Urgent: Custom AI employee for regional franchise network (18 outlets)" },
        { sender: "ai", text: "Subject: Re: Vox AI Architecture for 18 Franchise Outlets\n\nDear Director Chopra,\nThank you for reaching out. We have configured specialized multi-outlet retail routing. Attached is our architectural breakdown and security compliance framework for review..." },
      ],
      telemetry: { "Triage Speed": "1.2s", Grounding: "99.9% Factual", Status: "Proposal Dispatched" },
    },
  }

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Background Cyber Glow Grids */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-1/4 h-[550px] w-[550px] rounded-full bg-cyan-600/15 blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 h-[650px] w-[650px] rounded-full bg-violet-600/15 blur-[170px]" />
        <div className="absolute bottom-10 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <NeuralSynapseField />

      {/* ─── Global Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-500/40 bg-gradient-to-br from-cyan-500/20 via-violet-600/20 to-blue-600/20 shadow-lg shadow-cyan-500/10 transition-transform group-hover:scale-105">
              <Cpu className="h-6 w-6 text-cyan-400" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  VOX AI AGENTS
                </span>
                <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-mono font-medium tracking-wider text-cyan-300">
                  AI EMPLOYEE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide">
                Custom Autonomous Business Representatives
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 lg:flex text-sm font-medium text-slate-300">
            <a href="#chat-with-ai" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Chat With Your AI
            </a>
            <a href="#channels" className="transition-colors hover:text-cyan-400">
              Omnichannel (Calls, WA, IG, Email)
            </a>
            <a href="#voice-audio" className="transition-colors hover:text-cyan-400">
              Voice Audio Demo
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-cyan-400">
              How We Build It
            </a>
            <a href="#pricing" className="transition-colors hover:text-cyan-400">
              Pricing
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 hover:border-white/25"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
              <span>{user ? "Dashboard" : "Login"}</span>
            </Link>

            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] hover:shadow-cyan-500/30"
            >
              <Zap className="h-3.5 w-3.5 text-yellow-300" />
              <span>Deploy AI Employee</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 lg:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-[#030712]/95 px-4 pt-2 pb-6 backdrop-blur-2xl lg:hidden"
            >
              <div className="flex flex-col space-y-3 font-medium text-slate-300">
                <a
                  href="#chat-with-ai"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-cyan-400 font-semibold hover:bg-white/5"
                >
                  ⚡ Chat With Your AI Employee
                </a>
                <a
                  href="#channels"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  Omnichannel: Calls · WhatsApp · IG · Email
                </a>
                <a
                  href="#voice-audio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  Listen to Voice AI Audio Demo
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  How We Engineer Your AI
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  Commercials & Pricing (₹20,000 Setup)
                </a>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={WHATSAPP_CTA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 py-2.5 text-xs font-semibold text-white"
                  >
                    <Zap className="h-4 w-4" /> Deploy AI Employee
                  </a>
                  <a
                    href={CALL_CTA}
                    className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-semibold text-cyan-300"
                  >
                    <PhoneCall className="h-4 w-4" /> Call Voice AI ({CALL_NUMBER})
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Live Operational Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 px-4 py-1.5 text-xs text-cyan-300 backdrop-blur-md shadow-sm shadow-cyan-500/20"
            >
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="font-mono font-semibold">CUSTOM-BUILT AI EMPLOYEES</span>
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              <span className="text-slate-300">CALLS · WHATSAPP · INSTAGRAM · EMAIL</span>
            </motion.div>

            {/* Giant Futuristic Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display mt-6 max-w-5xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:leading-[1.1]"
            >
              Your Business, Cloned into an{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                Autonomous AI Employee.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-3xl text-balance text-base text-slate-300 sm:text-xl font-light leading-relaxed"
            >
              We engineer custom AI employees that represent your brand across <span className="text-white font-medium">Instagram, WhatsApp, Email, and Phone Calls 24/7</span>.
              It qualifies leads, books revenue deals, and you can chat with it in plain English to ask what’s happening in your business at any second.
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-4"
            >
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-7 py-4 text-sm font-semibold text-white shadow-xl shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-cyan-500/40"
              >
                <Zap className="h-4 w-4 text-yellow-300" />
                <span>Deploy Your AI Employee</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#voice-audio"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-medium text-slate-200 backdrop-blur-md transition-all hover:bg-white/10 hover:border-cyan-500/40"
              >
                <Headphones className="h-4 w-4 text-cyan-400" />
                <span>Hear Voice AI Audio</span>
              </a>

              <a
                href={CALL_CTA}
                className="inline-flex items-center gap-2.5 rounded-xl border border-slate-700/60 bg-slate-900/60 px-5 py-4 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-emerald-400 animate-pulse" />
                <span>Call Live: {CALL_NUMBER}</span>
              </a>
            </motion.div>
          </div>

          {/* ─── LIVE REAL-TIME TELEMETRY TICKER ────────────────────────────── */}
          <div className="mt-12 mx-auto max-w-4xl rounded-xl border border-white/10 bg-slate-950/80 p-3 shadow-lg backdrop-blur-md font-mono text-xs overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">LIVE CORTEX FEED</span>
              </div>
              <div className="truncate text-slate-300">
                <span className={`font-semibold mr-2 ${tickerItems[0].color}`}>[{tickerItems[0].channel}]</span>
                <span>{tickerItems[0].text}</span>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">{tickerItems[0].time}</span>
            </div>
          </div>

          {/* ─── HERO CENTERPIECE: "CHAT WITH YOUR AI EMPLOYEE" ─────────────── */}
          <div id="chat-with-ai" className="mt-14 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-violet-600/30 to-blue-500/20 blur-xl opacity-80" />
            
            <div className="relative rounded-3xl border border-cyan-500/40 bg-slate-950/95 shadow-2xl backdrop-blur-2xl overflow-hidden">
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-amber-500 inline-block" />
                    <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                  </div>
                  <span className="font-mono text-xs text-slate-300 flex items-center gap-1.5 ml-2">
                    <Bot className="h-4 w-4 text-cyan-400" />
                    <span className="font-bold text-white">YOUR AI EMPLOYEE</span> // Executive Management Terminal
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-cyan-300">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-emerald-300 text-[11px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    LIVE EXECUTIVE BRIEFING ONLINE
                  </span>
                </div>
              </div>

              {/* Sub-header instruction */}
              <div className="border-b border-white/10 bg-slate-900/50 px-6 py-3 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span>💬 <strong>Ask your AI Employee anything:</strong> Click an executive query below to watch it synthesize real-time business telemetry.</span>
                <span className="font-mono text-cyan-400 text-[11px]">SYNAPSE: 4 CHANNELS CONNECTED</span>
              </div>

              {/* Preset Query Chips */}
              <div className="p-4 sm:p-6 bg-slate-950/60 border-b border-white/10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {executivePrompts.map((p, idx) => {
                    const isSelected = activePromptIndex === idx
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPrompt(idx)}
                        className={`text-left rounded-xl p-3 text-xs transition-all border ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-950/50 text-white shadow-lg shadow-cyan-500/10"
                            : "border-white/10 bg-white/[0.02] text-slate-300 hover:bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-[10px] text-cyan-300 font-bold uppercase">{p.label}</span>
                          {isSelected && <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />}
                        </div>
                        <p className="line-clamp-2 text-[11px] text-slate-300 italic">“{p.question}”</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Chat Thread Simulation Display */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* User / Founder Question */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm text-white shadow-md">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-200 mb-1">
                      <Users className="h-3 w-3" /> YOU (FOUNDER / BUSINESS OWNER)
                    </div>
                    <p className="font-medium">“{executivePrompts[activePromptIndex].question}”</p>
                  </div>
                </div>

                {/* AI Employee Structured Answer Card */}
                <div className="flex justify-start">
                  <div className="w-full max-w-full rounded-2xl border border-cyan-500/30 bg-slate-900/90 p-5 sm:p-6 shadow-xl space-y-5">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="text-xs font-mono font-bold text-cyan-300 block">VOX AI EMPLOYEE // CORTEX SYNTHESIS</span>
                          <span className="text-xs text-white font-medium">{executivePrompts[activePromptIndex].response.headline}</span>
                        </div>
                      </div>
                      <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        Synthesized in 240ms
                      </span>
                    </div>

                    {/* Content Bullets */}
                    <div className="space-y-2.5">
                      {isTypingTerminal ? (
                        <div className="text-xs text-slate-400 italic flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                          <span>Querying unified multi-channel vector database...</span>
                        </div>
                      ) : (
                        executivePrompts[activePromptIndex].response.bullets.map((bullet, i) => (
                          <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 leading-relaxed">
                            <span className="text-cyan-400 shrink-0 font-bold">▸</span>
                            <span>{bullet}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Dynamic KPI Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10">
                      {executivePrompts[activePromptIndex].response.kpis.map((kpi, idx) => (
                        <div key={idx} className="rounded-xl border border-white/10 bg-black/40 p-3 text-center">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">{kpi.label}</span>
                          <span className="text-base font-bold text-cyan-300 mt-0.5 block">{kpi.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Priority Alert Box */}
                    <div className="rounded-xl border border-yellow-500/30 bg-yellow-950/20 p-3.5 text-xs text-yellow-200 flex items-start gap-2.5">
                      <Zap className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5" />
                      <span>{executivePrompts[activePromptIndex].response.alert}</span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex gap-2 text-xs font-mono">
                        <span className="rounded bg-white/5 px-2.5 py-1 text-slate-300 border border-white/10">Memory Key: #48192</span>
                        <span className="rounded bg-emerald-500/10 text-emerald-400 px-2.5 py-1 border border-emerald-500/30">Action Ready</span>
                      </div>
                      <a
                        href={WHATSAPP_CTA}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                      >
                        <span>Deploy This AI Assistant For Your Business</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Simulated Custom Input Prompt Bar */}
                <div className="relative pt-2">
                  <div className="flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/90 px-4 py-3 shadow-inner">
                    <Search className="h-4 w-4 text-slate-500 shrink-0" />
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Ask your AI Employee anything (e.g. 'How many leads did Instagram bring last night?')..."
                      className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (customInput.trim()) {
                          handleSelectPrompt((activePromptIndex + 1) % executivePrompts.length)
                          setCustomInput("")
                        }
                      }}
                      className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors shrink-0 flex items-center gap-1"
                    >
                      <span>Ask</span>
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The 4 Omnichannel Representative Hubs ──────────────────────────── */}
      <section id="channels" className="relative py-24 border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-300 font-mono">
              <Network className="h-3.5 w-3.5 text-cyan-400" />
              <span>THE OMNICHANNEL QUAD-ENGINE</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              One Unified AI Brain. Four Channels Covered.
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Your AI Employee doesn’t live in an isolated silo. If a customer leaves a comment on Instagram, messages on WhatsApp, and calls on the phone, your AI remembers their entire history.
            </p>
          </div>

          {/* Interactive Channel Selector Switchboard */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
            {(['voice', 'whatsapp', 'instagram', 'email'] as const).map((ch) => {
              const data = channelData[ch]
              const Icon = data.icon
              const isSelected = activeChannel === ch
              return (
                <button
                  key={ch}
                  onClick={() => setActiveChannel(ch)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? "border-cyan-400 bg-cyan-950/50 shadow-xl shadow-cyan-500/20 text-white"
                      : "border-white/10 bg-slate-900/50 text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className={`h-6 w-6 mb-2 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="font-bold text-sm text-center">{data.name}</span>
                  <span className="text-[10px] font-mono mt-1 text-slate-400">{data.badge}</span>
                </button>
              )
            })}
          </div>

          {/* Active Channel Display Showcase */}
          <div className="mt-8 rounded-3xl border border-white/15 bg-slate-950/90 p-6 md:p-10 max-w-5xl mx-auto backdrop-blur-2xl shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Channel Capabilities List */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono text-cyan-300">
                  <span>{channelData[activeChannel].badge}</span>
                </div>

                <h3 className="font-display text-3xl font-extrabold text-white">
                  {channelData[activeChannel].name}
                </h3>
                <p className="text-xs font-mono text-cyan-400 font-semibold">
                  {channelData[activeChannel].tagline}
                </p>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {channelData[activeChannel].description}
                </p>

                <div className="space-y-2.5 pt-2">
                  {channelData[activeChannel].capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <a
                    href={WHATSAPP_CTA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:scale-105 transition-transform"
                  >
                    <span>Deploy This Channel</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {/* Channel Live Mockup Terminal */}
              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-white/10 bg-slate-900/90 p-5 shadow-2xl">
                  {/* Mockup Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="text-slate-300 font-bold">Simulated Stream: {channelData[activeChannel].name}</span>
                    </div>
                    <span className="text-cyan-400">Status: Active 24/7</span>
                  </div>

                  {/* Thread Dialog */}
                  <div className="space-y-3 font-sans">
                    {channelData[activeChannel].sampleDialog.map((msg, i) => {
                      const isAI = msg.sender === "ai"
                      return (
                        <div key={i} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                              isAI
                                ? "bg-slate-800 text-slate-100 border border-cyan-500/20 shadow-md"
                                : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                            }`}
                          >
                            {isAI && (
                              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 mb-1">
                                <Bot className="h-3 w-3" /> VOX AI REPRESENTATIVE
                              </div>
                            )}
                            <p className="whitespace-pre-line">{msg.text}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Telemetry Footer */}
                  <div className="mt-5 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-400">
                    {Object.entries(channelData[activeChannel].telemetry).map(([k, v], idx) => (
                      <div key={idx} className="rounded bg-black/40 p-2 text-center border border-white/5">
                        <span className="block text-slate-500">{k}</span>
                        <span className="block font-bold text-cyan-300 mt-0.5">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Star Audio Feature: Interactive Voice AI Spectrogram ──────────── */}
      <section id="voice-audio" className="relative py-24 border-t border-white/10 bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-300 font-mono">
              <Headphones className="h-3.5 w-3.5 text-cyan-400" />
              <span>SUB-350MS SYNTHETIC VOICE ENGINE</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Hear What Your AI Employee Sounds Like.
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Indistinguishable from a human sales representative. Natural breathing, pauses, tone variation, and sub-350ms response latency so there are never awkward delays.
            </p>
          </div>

          {/* Interactive Audio Player Console */}
          <div className="mt-12 max-w-3xl mx-auto rounded-3xl border border-cyan-500/40 bg-slate-950/90 p-8 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleVoicePlayback}
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all shadow-xl ${
                    isPlayingAudio
                      ? "bg-rose-500 text-white shadow-rose-500/30 animate-pulse"
                      : "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/30 hover:scale-105"
                  }`}
                  aria-label="Play audio sample"
                >
                  {isPlayingAudio ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </button>
                <div>
                  <div className="text-base font-bold text-white flex items-center gap-2">
                    <span>Vox Voice Model v4 (Ultra-Low Latency)</span>
                    <span className="rounded bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    {isPlayingAudio ? "Speaking via Web Audio Synthesis..." : "Click play to listen to spoken speech sample"}
                  </p>
                </div>
              </div>

              {/* Call Demo Direct Action */}
              <a
                href={CALL_CTA}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-4 py-2.5 text-xs font-mono font-semibold text-cyan-300 hover:bg-cyan-900/40 transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-cyan-400" />
                <span>Call Phone Demo: {CALL_NUMBER}</span>
              </a>
            </div>

            {/* Live Audio Frequency Oscilloscope Visualizer */}
            <div className="py-6">
              <div className="flex items-end justify-between h-20 gap-1.5 px-2">
                {[
                  30, 65, 80, 45, 95, 30, 85, 60, 100, 75, 40, 90, 50, 85, 35, 70, 95, 40, 60, 80, 45, 90, 65, 35, 75, 50, 85, 40,
                ].map((val, idx) => (
                  <span
                    key={idx}
                    className={`w-full rounded-full transition-all duration-150 ${
                      isPlayingAudio
                        ? "bg-gradient-to-t from-cyan-500 to-violet-400 shadow-sm shadow-cyan-400"
                        : "bg-white/10"
                    }`}
                    style={{
                      height: isPlayingAudio ? `${Math.max(15, (val * (idx % 2 === 0 ? 1 : 0.8)))}%` : "18%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Live Spoken Transcript Box */}
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 block mb-1">
                TRANSCRIPT PREVIEW
              </span>
              <p className="text-sm font-medium text-slate-200 italic">
                “{audioSamplePhrases[audioTranscriptIndex % audioSamplePhrases.length]}”
              </p>
            </div>

            {/* Telemetry Stats Strip */}
            <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center font-mono text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Response Cadence</span>
                <span className="font-bold text-cyan-300">340ms Latency</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Voice Naturalness</span>
                <span className="font-bold text-emerald-300">99.4% Human Score</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase">Telephony Type</span>
                <span className="font-bold text-violet-300">WebRTC + SIP Trunk</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How We Build Your AI Employee (Digital DNA) ────────────────────── */}
      <section id="how-it-works" className="relative py-24 border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3 py-1 text-xs text-violet-300 font-mono">
              <CircuitBoard className="h-3.5 w-3.5 text-violet-400" />
              <span>THE ENGINEERING PROCESS</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              How We Build Your Custom AI Employee.
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              Not a generic template. We extract your business DNA, train custom memory models, configure safety guardrails, and hook directly into your phone and social channels.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Knowledge Ingestion",
                desc: "We ingest your product catalogs, past email threads, call recordings, website data, PDFs, and sales objection guides.",
                icon: Database,
                color: "text-cyan-400",
              },
              {
                step: "02",
                title: "Voice & Persona Tuning",
                desc: "We calibrate the exact tone, speaking cadence, vocabulary, and humor of your highest-performing in-house closer.",
                icon: Sparkles,
                color: "text-violet-400",
              },
              {
                step: "03",
                title: "Safety & Logic Guardrails",
                desc: "Strict enterprise boundaries: your AI never hallucinates, never makes up pricing, and strictly routes sensitive cases to humans.",
                icon: ShieldCheck,
                color: "text-emerald-400",
              },
              {
                step: "04",
                title: "Omnichannel Deployment",
                desc: "Hooked into Meta Cloud WhatsApp, Instagram Graph API, SIP Telephony, and your CRM (Google Sheets, HubSpot, Supabase) in 72 hours.",
                icon: Rocket,
                color: "text-yellow-400",
              },
            ].map((st, idx) => {
              const Icon = st.icon
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-500">STAGE {st.step}</span>
                    <Icon className={`h-5 w-5 ${st.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{st.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Clear Commercials & Pricing Section ───────────────────────────── */}
      <section id="pricing" className="relative py-24 border-t border-white/10 bg-gradient-to-b from-slate-950 via-[#030712] to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs text-emerald-300 font-mono">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>TRANSPARENT COMMERCIALS</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              A Clear, Two-Part Investment.
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              One custom implementation fee to build your digital employee, and a predictable monthly retainer to keep it learning and running 24/7.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* One-Time Setup */}
            <div className="relative rounded-3xl border border-cyan-500/40 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                    ONE-TIME IMPLEMENTATION
                  </span>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 text-xs font-mono text-cyan-300">
                    FULL BUILD & DEPLOY
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-5xl font-extrabold text-white">₹20,000</span>
                  <span className="text-slate-400 text-sm font-mono">one-time</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Complete custom engineering of your business AI Employee across Phone Calls, WhatsApp, Instagram, and Email.
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {[
                    "Complete business discovery & knowledge extraction",
                    "Voice AI configuration with sub-350ms natural cadence",
                    "Official WhatsApp Cloud API & Instagram DM automation setup",
                    "Email inbox triage and auto-drafting integration",
                    "Custom qualification scoring & objection-handling playbook",
                    "Executive debrief portal to chat with your AI in natural language",
                    "End-to-end edge testing & 72-hour production launch",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-slate-200">
                      <Check className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
                >
                  <span>Build Your AI Employee (₹20,000)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Monthly Retainer */}
            <div className="relative rounded-3xl border border-violet-500/40 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-violet-400">
                    MONTHLY SUPPORT & EVOLUTION
                  </span>
                  <span className="rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-0.5 text-xs font-mono text-violet-300">
                    CONTINUOUS UPKEEP
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-5xl font-extrabold text-white">₹5,000</span>
                  <span className="text-slate-400 text-sm font-mono">per month</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  24/7 uptime monitoring, continuous prompt optimization, and technical maintenance so your employee never breaks.
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {[
                    "24/7 autonomous uptime monitoring & health checks",
                    "Continuous prompt engineering and response tuning",
                    "Monthly knowledge base updates (new products, price changes)",
                    "API compatibility upkeep (Meta, WhatsApp, telephony updates)",
                    "Minor workflow adjustments as your sales process evolves",
                    "Direct technical assistance & bug resolution",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs text-slate-200">
                      <Check className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] transition-transform"
                >
                  <span>Lock In Retainer (₹5,000/mo)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Third-Party Costs Notice */}
          <div className="mt-10 max-w-4xl mx-auto rounded-2xl border border-white/10 bg-black/40 p-5 text-center text-xs text-slate-400 font-mono">
            <span className="text-cyan-400 font-bold mr-1">Direct Pass-Through Transparency:</span>
            External charges (Meta WhatsApp conversation fees, Telephony SIP minute costs, and OpenAI / Gemini token API usage) are paid directly at actual platform rates with zero markup from Vox AI.
          </div>
        </div>
      </section>

      {/* ─── Master Final CTA & Official Contact Footer ──────────────────────── */}
      <footer className="relative border-t border-white/10 bg-[#02050c] pt-20 pb-12 overflow-hidden">
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[450px] w-[850px] rounded-full bg-cyan-600/10 blur-[180px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Big CTA Banner */}
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 sm:p-14 text-center max-w-5xl mx-auto shadow-2xl backdrop-blur-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              NEXT STEP — INITIATE YOUR AI BUILD
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to hire your first AI Employee?
            </h2>
            <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
              Stop letting after-hours leads go cold. Deploy a dedicated AI employee trained on your products, answering on Instagram, WhatsApp, Email, and Calls in seconds.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:scale-105 transition-transform"
              >
                <Zap className="h-4 w-4 text-yellow-300" />
                <span>Deploy AI Employee on WhatsApp</span>
                <ArrowRight className="h-4 w-4" />
              </a>

              <a
                href={CALL_CTA}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-cyan-400" />
                <span>Call Voice AI: {CALL_NUMBER}</span>
              </a>
            </div>
          </div>

          {/* Official Contact Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pt-12 border-t border-white/10 text-xs">
            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-mono text-[10px]">WEBSITE</span>
              <a href={`https://${WEBSITE_URL}`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-cyan-400 font-semibold mt-1 block">
                {WEBSITE_URL}
              </a>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-mono text-[10px]">DIRECT EMAIL</span>
              <a href={`mailto:${EMAIL_ADDRESS}`} className="text-slate-200 hover:text-cyan-400 font-semibold mt-1 block">
                {EMAIL_ADDRESS}
              </a>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-mono text-[10px]">PHONE CALLS</span>
              <a href={`tel:${CALL_NUMBER.replace(/\s+/g, '')}`} className="text-slate-200 hover:text-cyan-400 font-semibold mt-1 block">
                {CALL_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-mono text-[10px]">WHATSAPP</span>
              <a href={WHATSAPP_CTA} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-cyan-400 font-semibold mt-1 block">
                {WHATSAPP_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-mono text-[10px]">HEADQUARTERS</span>
              <span className="text-slate-200 font-semibold mt-1 block">
                {LOCATION}
              </span>
            </div>

            <div>
              <span className="text-slate-500 uppercase tracking-wider block font-mono text-[10px]">INSTAGRAM</span>
              <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" rel="noopener noreferrer" className="text-slate-200 hover:text-cyan-400 font-semibold mt-1 block">
                @{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-white/5 pt-6 gap-4">
            <p>© {new Date().getFullYear()} Vox AI Agents. Custom AI Solutions for Business. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy.html" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link href="/dashboard" className="hover:text-slate-400 transition-colors">Dashboard</Link>
              <span className="font-mono text-cyan-400">AUTONOMOUS WORKFORCE ENGINE</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}