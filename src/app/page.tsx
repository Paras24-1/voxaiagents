'use client'

import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Headphones,
  Instagram,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Phone,
  PhoneCall,
  Play,
  Pause,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { useOrg } from "@/contexts/OrgContext"

// Official Contact Credentials & Demo Endpoints
const WHATSAPP_NUMBER = "+91 7015551637"
const CALL_NUMBER = "+91 8708551637"
const EMAIL_ADDRESS = "voxai4278@gmail.com"
const LOCATION = "Model Town, Rohtak, Haryana"
const INSTAGRAM_HANDLE = "voxai.agents"
const WEBSITE_URL = "voxaiagents.com"

const WHATSAPP_CTA = `https://wa.me/917015551637?text=${encodeURIComponent(
  "Hello! I want to deploy a custom AI Employee for my business across Calls, WhatsApp, Instagram, and Email."
)}`
const CALL_CTA = "tel:+918708551637"
const CALENDLY_CTA = `https://wa.me/917015551637?text=${encodeURIComponent(
  "Hi! I would like to schedule an AI Employee architecture session."
)}`

// Client Logos for Carousel Showcase
const clientLogos = [
  {
    name: "DAMAC Properties",
    category: "Luxury Real Estate & Towers",
    logo: "/clients/damac.png",
  },
  {
    name: "Innoveg",
    category: "Wholesale & Fresh Agritech",
    logo: "/clients/innoveg.jpeg",
  },
  {
    name: "Nelson Business School",
    category: "Higher & Executive Education",
    logo: "/clients/nelson-business-school.jpeg",
  },
  {
    name: "Osmo RO Care",
    category: "Pan-India Water Systems",
    logo: "/clients/osmo-ro-care.jpg",
  },
  {
    name: "Printevr",
    category: "Digital Printing & Merchandise",
    logo: "/clients/printevr.jpeg",
  },
  {
    name: "SME Network",
    category: "SMB Advisory & Enterprise",
    logo: "/clients/sme.jpeg",
  },
]

export default function LandingPage() {
  const { user } = useOrg()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioTranscriptIndex, setAudioTranscriptIndex] = useState(0)

  // ─── Executive Briefing Demo Queries ─────────────────────────────────────────
  const executivePrompts = [
    {
      id: "summary",
      label: "Today's Briefing",
      question: "Hey Nova, give me a complete debrief of today's business activity.",
      response: {
        headline: "Operational Debrief for Today Across All 4 Channels",
        bullets: [
          "Phone Calls: 42 inbound calls handled autonomously with 0 dropped sessions. 9 qualified prospects scheduled direct sales meetings on Google Calendar; 4 high-budget leads were warm-transferred live to human closers.",
          "WhatsApp: 114 prospective conversations engaged in Hindi and English. Generated ₹5,80,000 in customized PDF quotations with zero human manual intervention.",
          "Instagram: Auto-responded to 68 Reel comments, converted 23 direct DMs into verified Indian phone numbers automatically pushed to CRM.",
          "Email: Cleaned incoming inbox to Inbox Zero, categorized 14 wholesale partner inquiries, and pre-drafted 3 enterprise RFP proposals awaiting your 1-click approval.",
        ],
        kpis: [
          { label: "Leads Captured", val: "179 Leads" },
          { label: "Avg Response", val: "1.2 sec" },
          { label: "Qualified Pipeline", val: "₹18.4 Lakh" },
          { label: "Hours Saved", val: "7.5 hrs" },
        ],
        alert: "Action Required: 2 high-ticket wholesale distributors requested custom ERP API integration. Briefing dossiers and call recordings are pre-loaded in your dashboard.",
      },
    },
    {
      id: "leads",
      label: "Hot Leads to Close",
      question: "Which high-intent leads are ready for my human closers right now?",
      response: {
        headline: "High-Intent Prospects Awaiting Immediate Human Handoff",
        bullets: [
          "1. Rajesh Singhania (Industrial Manufacturing): Confirmed ₹15L budget for 4-factory automated order intake. Requested contract closing call tomorrow at 3 PM.",
          "2. Dr. Ananya Verma (Clinic Network, 6 branches): Fully qualified for multi-doctor patient triage & WhatsApp booking. Complete symptom questionnaire and call recording attached.",
          "3. Vikram Mehta (Luxury Real Estate): Ready to deploy Instagram Reel DM lead automation for 3 luxury residential towers in Gurgaon. Verified phone number synced to CRM.",
        ],
        kpis: [
          { label: "Ready Deals", val: "3 Buyers" },
          { label: "Deal Pipeline", val: "₹28.5 Lakh" },
          { label: "Quality Score", val: "9.8 / 10" },
          { label: "CRM Status", val: "Auto Synced" },
        ],
        alert: "All 3 prospect summaries, audio recordings, and WhatsApp chat transcripts are pre-loaded on your dashboard with full context.",
      },
    },
    {
      id: "voice",
      label: "Voice Calls & Objections",
      question: "Summarise the phone calls and customer objections from today.",
      response: {
        headline: "Voice Telephony Sentiment & Objection Analysis (Sub-350ms Latency)",
        bullets: [
          "Total Call Minutes: 94 minutes across 42 automated phone calls with zero dropped calls and 100% audio clarity.",
          "Primary Question (58% of callers): 'Can your AI employee speak both Hindi and English fluently?' — AI confirmed fluently and switched languages mid-sentence with natural inflection.",
          "Second Question (34% of callers): 'Can it connect directly to my existing office phone number?' — AI explained SIP trunking and instant call forwarding without buying new SIM cards.",
        ],
        kpis: [
          { label: "Speech Latency", val: "340ms" },
          { label: "Human Cadence", val: "99.4%" },
          { label: "Objections Won", val: "31 / 34" },
          { label: "Warm Transferred", val: "4 Callers" },
        ],
        alert: "Zero robotic tone complaints. 92% of callers believed they were speaking with an in-office human customer representative.",
      },
    },
    {
      id: "social",
      label: "Instagram & WhatsApp Ads",
      question: "How are our Instagram ads and WhatsApp campaigns converting today?",
      response: {
        headline: "Social Omnichannel Conversion & Speed-to-Lead Velocity",
        bullets: [
          "Meta Ads: 86 ad clicks triggered instant WhatsApp conversations within 1.5 seconds, preventing lead drop-off.",
          "Instagram Reel 'How AI Replaces 5 Employees' generated 140 comments with keyword 'DEMO', instantly triggering automated private DM sales sequences.",
          "Conversion Velocity: 26.7% of all social interactions progressed to verified phone extraction and budget qualification stage.",
        ],
        kpis: [
          { label: "Ad Clicks", val: "86 Leads" },
          { label: "Reel DMs Sent", val: "140 Chats" },
          { label: "Phones Saved", val: "54 Numbers" },
          { label: "CPA Reduction", val: "-38% Cost" },
        ],
        alert: "Zero lead leakage: Even night-time leads (11 PM - 4 AM) were fully qualified and booked into your calendar while your human team slept.",
      },
    },
  ]

  const [activePromptIndex, setActivePromptIndex] = useState(0)
  const [customInput, setCustomInput] = useState("")
  const [isTypingTerminal, setIsTypingTerminal] = useState(false)

  const handleSelectPrompt = (idx: number) => {
    setActivePromptIndex(idx)
    setIsTypingTerminal(true)
    setTimeout(() => setIsTypingTerminal(false), 240)
  }

  // ─── Real Speech Synthesis Audio Simulation ─────────────────────────────────
  const audioSamplePhrases = [
    "Hello! I am your company's custom AI Employee. I answer customer phone calls in under 350 milliseconds.",
    "I handle inquiries across WhatsApp and Instagram simultaneously, qualifying budgets, sharing catalogs, and calculating quotes.",
    "When a high-intent prospect is ready to buy, I transfer them straight to your human closers with full audio briefings.",
  ]

  const toggleVoicePlayback = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel()
        setIsPlayingAudio(false)
      } else {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(audioSamplePhrases[audioTranscriptIndex % audioSamplePhrases.length])
        utterance.rate = 1.02
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

  // ─── Live Activity Feed Ticker ─────────────────────────────────────────────
  const [tickerItems, setTickerItems] = useState([
    { channel: "WHATSAPP", text: "Sent customized PDF quotation (₹4,20,000 value) to wholesale distributor in Pune", time: "42s ago" },
    { channel: "PHONE CALL", text: "Completed 2m 45s inbound qualification in Hindi — meeting booked on Google Calendar", time: "18s ago" },
    { channel: "INSTAGRAM", text: "Auto-converted Reel comment into verified WhatsApp lead (+91 98XXX)", time: "Just now" },
    { channel: "EMAIL", text: "Auto-triaged inbound enterprise RFP and generated executive draft proposal for review", time: "1m ago" },
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

  return (
    <div className="vox-landing-theme min-h-screen bg-[var(--bg)] text-[var(--ink)] paper-grain selection:bg-[var(--brand-soft)] selection:text-[var(--brand)] font-sans antialiased relative overflow-x-hidden">
      {/* ─── 1. Minimal Sticky Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#F6F1E7]/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)] text-[#F6F1E7] shadow-sm transition-transform group-hover:scale-105">
              <span className="font-serif text-xl font-bold tracking-tight">V</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">
                  VOX AI AGENTS
                </span>
                <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[11px] font-mono font-medium text-[var(--brand-soft-text)]">
                  AI Employee
                </span>
              </div>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Autonomous Business Representatives for Indian SMBs
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links — Strictly 4 links as required */}
          <nav className="hidden items-center gap-8 lg:flex text-sm font-medium text-[var(--ink-muted)]">
            <a href="#how-it-works" className="hover:text-[var(--ink)] transition-colors">
              How it works
            </a>
            <a href="#channels" className="hover:text-[var(--ink)] transition-colors">
              Channels
            </a>
            <a href="#pricing" className="hover:text-[var(--ink)] transition-colors">
              Pricing
            </a>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="hover:text-[var(--ink)] transition-colors flex items-center gap-1.5"
            >
              <span>{user ? "Dashboard" : "Login"}</span>
            </Link>
          </nav>

          {/* Primary CTA Button */}
          <div className="hidden items-center gap-3 sm:flex">
            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Deploy AI Employee</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] lg:hidden"
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
              className="border-b border-[var(--line)] bg-[var(--surface)] px-4 pt-3 pb-6 shadow-xl lg:hidden"
            >
              <div className="flex flex-col space-y-3 text-sm font-medium text-[var(--ink)]">
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  How it works
                </a>
                <a
                  href="#channels"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  Channels (Calls, WhatsApp, Instagram, Email)
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  Pricing (₹20,000 setup)
                </a>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  {user ? "Dashboard" : "Login"}
                </Link>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={WHATSAPP_CTA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3 text-xs font-semibold text-white shadow-sm"
                  >
                    <span>Deploy AI Employee</span>
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={CALL_CTA}
                    className="flex items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] py-2.5 text-xs font-semibold text-[var(--ink)]"
                  >
                    <PhoneCall className="h-4 w-4 text-[var(--brand)]" />
                    <span>Call Live Voice AI ({CALL_NUMBER})</span>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── 2. Hero Section ────────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Category pill */}
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs text-[var(--ink-muted)] shadow-xs mb-6"
              >
                <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                <span className="font-medium text-[var(--ink)]">Custom AI Employees for Indian Businesses</span>
              </motion.div>

              {/* Oversized Serif Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="font-serif text-[42px] sm:text-6xl lg:text-[74px] leading-[1.05] tracking-[-0.02em] font-normal text-[var(--ink)] text-balance"
              >
                Your business, <em className="italic font-normal text-[var(--brand)]">cloned</em> into an autonomous AI employee.
              </motion.h1>

              {/* Comprehensive Subcopy for Indian SMBs */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="mt-6 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed max-w-xl font-normal"
              >
                We engineer custom AI employees that answer inbound phone calls, WhatsApp messages, Instagram DMs, and emails 24/7. Trained on your exact product catalog, pricing, and objection playbook to qualify leads, send instant quotations, and book high-ticket deals while you sleep.
              </motion.p>

              {/* Primary Actions & Voice Audio Link */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6"
              >
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-[var(--accent)] px-7 py-4 text-sm font-semibold text-white shadow-md hover:bg-[var(--accent-hover)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <span>Deploy Your AI Employee</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>

                <a
                  href="#voice-audio"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--ink)] hover:text-[var(--brand)] transition-colors py-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-alt)] border border-[var(--line)]">
                    <Headphones className="h-4 w-4 text-[var(--brand)]" />
                  </div>
                  <span>Hear the voice</span>
                </a>

                <a
                  href={CALL_CTA}
                  className="text-xs sm:text-sm text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-1.5"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-[var(--brand)]" />
                  <span>or call <strong className="font-semibold text-[var(--ink)]">{CALL_NUMBER}</strong></span>
                </a>
              </motion.div>

              {/* Thin Row of Trust Stats with Context */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="mt-12 pt-6 border-t border-[var(--line)] w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
              >
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">1.2s</div>
                  <div className="text-xs text-[var(--ink-muted)]">Avg response time</div>
                  <div className="text-[10px] text-[var(--ink-faint)]">Across all channels</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">24/7/365</div>
                  <div className="text-xs text-[var(--ink-muted)]">Always answering</div>
                  <div className="text-[10px] text-[var(--ink-faint)]">Zero lead leakage</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">72 hours</div>
                  <div className="text-xs text-[var(--ink-muted)]">Live deployment</div>
                  <div className="text-[10px] text-[var(--ink-faint)]">Keep existing phone</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">4 channels</div>
                  <div className="text-xs text-[var(--ink-muted)]">Unified coverage</div>
                  <div className="text-[10px] text-[var(--ink-faint)]">Calls, WA, IG, Email</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Realistic Phone Mockup (Above the fold product preview) */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Soft background aura */}
              <div className="absolute -inset-4 rounded-full bg-[var(--brand-soft)]/50 blur-3xl -z-10" />

              {/* Phone Frame */}
              <div className="relative w-full max-w-[350px] rounded-[40px] border-[8px] border-[#16211C] bg-[#ECE5DD] shadow-2xl overflow-hidden text-[var(--ink)]">
                {/* Speaker pill */}
                <div className="h-6 bg-[#16211C] flex items-center justify-center">
                  <div className="w-16 h-3 bg-[#0C120F] rounded-full" />
                </div>

                {/* WhatsApp Chat App Bar */}
                <div className="bg-[var(--brand)] text-[#F6F1E7] px-4 py-3.5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] font-bold text-xs">
                      VA
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[var(--brand)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight text-[#F6F1E7]">Vox AI Employee</div>
                      <div className="text-[10px] text-[var(--brand-soft)]">Online · Answers in &lt; 1 sec</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#F6F1E7]/80">
                    <Phone className="h-4 w-4" />
                  </div>
                </div>

                {/* Chat Messages Canvas with comfortable padding */}
                <div className="p-4 space-y-3.5 text-xs min-h-[430px] flex flex-col justify-end bg-[#ECE5DD]">
                  {/* Date badge */}
                  <div className="flex justify-center mb-1">
                    <span className="rounded-md bg-white/80 px-2.5 py-0.5 text-[10px] font-mono text-[var(--ink-muted)] shadow-xs">
                      Today · Live Chat
                    </span>
                  </div>

                  {/* Customer Question */}
                  <div className="flex justify-start">
                    <div className="max-w-[86%] rounded-2xl rounded-tl-xs bg-white p-3.5 text-[12px] leading-relaxed shadow-xs text-[#14170F]">
                      <p>Hi, we run a multi-doctor clinic in Haryana. Can your AI answer patient queries on WhatsApp, explain consultation fees, and book appointment slots?</p>
                      <div className="text-[10px] text-[#8E9285] text-right mt-1 font-mono">10:14 AM</div>
                    </div>
                  </div>

                  {/* AI Response in Mint Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[var(--brand-soft)] p-3.5 text-[12px] leading-relaxed shadow-xs text-[var(--brand-soft-text)]">
                      <p>Namaste! Yes, absolutely. We sync directly with your doctor calendar, triage inquiries in English and Hindi, and confirm slots instantly with automated WhatsApp reminders.</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-[var(--brand)] mt-1 font-mono">
                        <span>10:14 AM</span>
                        <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />
                      </div>
                    </div>
                  </div>

                  {/* Customer Followup */}
                  <div className="flex justify-start">
                    <div className="max-w-[86%] rounded-2xl rounded-tl-xs bg-white p-3 text-[12px] leading-relaxed shadow-xs text-[#14170F]">
                      <p>Sounds perfect. What is the setup cost and how soon can we go live?</p>
                      <div className="text-[10px] text-[#8E9285] text-right mt-1 font-mono">10:15 AM</div>
                    </div>
                  </div>

                  {/* AI Pricing Quote in Mint Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[var(--brand-soft)] p-3 text-[12px] leading-relaxed shadow-xs text-[var(--brand-soft-text)]">
                      <p>Implementation is ₹20,000 one-time and ₹5,000/month retainer. We launch your clinic AI employee in 72 hours. Shall I connect you with our deployment team?</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-[var(--brand)] mt-1 font-mono">
                        <span>10:15 AM</span>
                        <CheckCheck className="h-3.5 w-3.5 text-[#34B7F1]" />
                      </div>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex items-center gap-1.5 bg-white w-fit px-3 py-2 rounded-2xl rounded-tl-xs shadow-xs text-[#5B5F54]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] font-mono ml-1 text-[#5B5F54]">AI Employee is typing...</span>
                  </div>
                </div>

                {/* Bottom home indicator */}
                <div className="h-4 bg-[#16211C] flex items-center justify-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Floating Social Proof Card with ample breathing room */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xl z-20 min-w-[240px] sm:min-w-[260px]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                      <TrendingUp className="h-3 w-3" />
                    </span>
                    <span className="text-[11px] font-medium text-[var(--ink-muted)]">Live SMB Activity</span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md font-semibold">
                    +42% Today
                  </span>
                </div>
                <div className="font-serif text-2xl font-bold text-[var(--ink)]">₹5,80,000</div>
                <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                  Automated quotations generated today via WhatsApp & Calls
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Client Logo Carousel Section ───────────────────────────────────── */}
      <section className="relative py-12 border-y border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 text-center">
          <p className="text-[11px] font-mono tracking-widest uppercase text-[var(--ink-muted)]">
            Trusted by fast-growing Indian businesses & enterprises
          </p>
        </div>

        {/* Continuous Marquee Track */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex items-center gap-6 py-2">
            {[...clientLogos, ...clientLogos].map((client, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] hover:bg-white hover:border-[var(--brand)]/30 px-5 py-3 transition-all duration-200 shadow-xs shrink-0 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-[var(--line)] p-1.5 shrink-0 overflow-hidden shadow-xs">
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[var(--ink)] tracking-tight whitespace-nowrap">
                    {client.name}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--ink-muted)] whitespace-nowrap">
                    {client.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Telemetry Strip ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 my-14">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3.5 sm:py-3.5 sm:px-6 shadow-xs flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[var(--brand)] text-[11px] tracking-wide uppercase">Live Stream</span>
          </div>
          <div className="truncate text-[var(--ink)]">
            <span className="font-bold text-[var(--brand)] mr-2">[{tickerItems[0].channel}]</span>
            <span className="text-[var(--ink-muted)]">{tickerItems[0].text}</span>
          </div>
          <span className="text-[10px] text-[var(--ink-faint)] shrink-0 hidden sm:inline">{tickerItems[0].time}</span>
        </div>
      </div>

      {/* ─── 3. "Ask your AI Employee" Briefing Demo ────────────────────────── */}
      <section id="chat-with-ai" className="relative py-16 md:py-24 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span>Founder Briefing Interface</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Ask your AI Employee anything.
            </h2>
            <p className="mt-3 text-base text-[var(--ink-muted)]">
              Your AI Employee doesn't just talk to customers—it keeps you briefed. Click any executive question below to see how it synthesizes performance across Calls, WhatsApp, Instagram, and Email into a clear management debrief.
            </p>
          </div>

          {/* Clean Chat-App Window */}
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xl overflow-hidden">
            {/* Window Title Bar */}
            <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--surface-alt)] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-[#E58072] inline-block" />
                  <span className="h-3 w-3 rounded-full bg-[#E5BF72] inline-block" />
                  <span className="h-3 w-3 rounded-full bg-[#82C99B] inline-block" />
                </div>
                <span className="text-xs text-[var(--ink)] font-medium flex items-center gap-1.5 ml-2">
                  <Bot className="h-4 w-4 text-[var(--brand)]" />
                  <span className="font-semibold">Executive Briefing Dashboard</span>
                  <span className="text-[var(--ink-muted)] hidden sm:inline">· Vox AI Employee</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--brand)]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--brand-soft-text)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                  4 Channels Synced
                </span>
              </div>
            </div>

            {/* Query Chips as Pill Buttons */}
            <div className="p-4 sm:p-6 border-b border-[var(--line)] bg-[var(--surface)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {executivePrompts.map((p, idx) => {
                  const isSelected = activePromptIndex === idx
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPrompt(idx)}
                      className={`text-left rounded-xl p-3.5 text-xs transition-all border ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--brand)] text-[#F6F1E7] shadow-sm"
                          : "border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] hover:border-[var(--ink-muted)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-bold ${isSelected ? "text-emerald-200" : "text-[var(--brand)]"}`}>
                          {p.label}
                        </span>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
                      </div>
                      <p className={`line-clamp-2 text-[11px] ${isSelected ? "text-[#F6F1E7]/80" : "text-[var(--ink-muted)]"}`}>
                        “{p.question}”
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Chat Thread Dialogue Display */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Founder Query Bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl bg-[var(--brand)] px-5 py-3.5 text-sm text-[#F6F1E7] shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-200 mb-1">
                    <Users className="h-3 w-3" /> YOU (FOUNDER / BUSINESS OWNER)
                  </div>
                  <p className="font-medium">“{executivePrompts[activePromptIndex].question}”</p>
                </div>
              </div>

              {/* AI Structured Synthesis Response Card */}
              <div className="flex justify-start">
                <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-5 sm:p-6 space-y-5">
                  {/* Synthesis Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--line)] pb-3 gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--brand)] text-[#F6F1E7]">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-[var(--brand)] font-semibold block">AI EXECUTIVE SUMMARY</span>
                        <span className="text-sm text-[var(--ink)] font-bold">{executivePrompts[activePromptIndex].response.headline}</span>
                      </div>
                    </div>
                    <span className="rounded-md bg-[var(--surface)] border border-[var(--line)] px-2.5 py-1 text-[11px] font-mono text-[var(--ink-muted)]">
                      Synthesized in 240ms from 4 live channels
                    </span>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-3">
                    {isTypingTerminal ? (
                      <div className="text-xs text-[var(--ink-muted)] italic flex items-center gap-2 py-4">
                        <RefreshCw className="h-4 w-4 animate-spin text-[var(--brand)]" />
                        <span>Synthesizing today's business activity across channels...</span>
                      </div>
                    ) : (
                      executivePrompts[activePromptIndex].response.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
                          <span className="text-[var(--brand)] shrink-0 font-bold mt-0.5">•</span>
                          <span>{bullet}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 4 KPI Tiles in Bento Layout — Clean numbers with zero text overflow */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--line)]">
                    {executivePrompts[activePromptIndex].response.kpis.map((kpi, idx) => (
                      <div key={idx} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center shadow-xs">
                        <span className="text-[10px] font-mono text-[var(--ink-muted)] block uppercase tracking-wider">{kpi.label}</span>
                        <span className="font-serif text-lg sm:text-xl font-bold text-[var(--brand)] mt-1 block truncate">{kpi.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Priority Alert Box in refined warm forest-mint callout */}
                  <div className="rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)]/60 p-4 text-xs text-[var(--brand-soft-text)] flex items-start gap-2.5">
                    <Zap className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{executivePrompts[activePromptIndex].response.alert}</span>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex gap-2 text-xs font-mono">
                      <span className="rounded bg-[var(--surface)] px-2.5 py-1 text-[var(--ink-muted)] border border-[var(--line)]">Live Data Verified</span>
                      <span className="rounded bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-2.5 py-1 font-medium">Ready for Human Handoff</span>
                    </div>
                    <a
                      href={WHATSAPP_CTA}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:text-[var(--accent)] transition-colors"
                    >
                      <span>Deploy This AI Assistant For Your Business</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Simulated Custom Prompt Bar */}
              <div className="relative pt-2">
                <div className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-sm">
                  <Search className="h-4 w-4 text-[var(--ink-muted)] shrink-0" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Ask your AI Employee anything (e.g. 'How many leads did Instagram bring last night?')..."
                    className="w-full bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (customInput.trim()) {
                        handleSelectPrompt((activePromptIndex + 1) % executivePrompts.length)
                        setCustomInput("")
                      }
                    }}
                    className="rounded-xl bg-[var(--brand)] px-4 py-2 text-xs font-semibold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    <span>Ask</span>
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Omnichannel Bento Grid Section ──────────────────────────────── */}
      <section id="channels" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <span>Omnichannel Coverage</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              One unified AI brain. Four channels covered.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)] leading-relaxed">
              Your AI Employee doesn’t live in an isolated silo. If a customer leaves a comment on an Instagram Reel, messages your WhatsApp business number, and later calls your office landline, your AI remembers their entire history, previous quotes, and preferences.
            </p>
          </div>

          {/* Asymmetric Bento Grid in Unified Warm Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured Card 1: AI Voice Employee (Wide Card with simulated call dialog) */}
            <div className="lg:col-span-7 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <PhoneCall className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-mono font-medium text-[var(--brand-soft-text)]">
                    Sub-350ms Latency · 99.4% Human Cadence
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  AI Voice Employee
                </h3>
                <p className="text-xs font-mono font-semibold text-[var(--brand)] mt-1">
                  Ultra-realistic phone reception & proactive outbound lead caller
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  Sounds identical to your highest-performing in-house sales closer. Answers inbound phone calls within one ring, calls web leads back within 45 seconds, understands colloquial Indian English and Hindi seamlessly, and warm-transfers hot deals to your human reps with an audio debrief.
                </p>

                {/* Simulated Call Transcript as Chat Bubbles */}
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 space-y-2.5 text-xs">
                  <div className="text-[10px] font-mono text-[var(--ink-muted)] border-b border-[var(--line)] pb-1.5 flex items-center justify-between">
                    <span>Live Call Stream Simulation</span>
                    <span className="text-[var(--brand)] font-semibold">Active Inbound Telephony</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl bg-white p-3 text-[var(--ink)] shadow-xs">
                        <div className="text-[9px] font-mono opacity-70 mb-0.5">CALLER</div>
                        <p>Hi, I saw your package. Do you do custom ERP integrations for wholesale distributors with multiple warehouses?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[var(--brand-soft)] p-3 text-[var(--brand-soft-text)] font-medium shadow-xs">
                        <div className="text-[9px] font-mono opacity-70 mb-0.5">VOX AI VOICE</div>
                        <p>Yes, absolutely! We connect directly with SAP, Tally, Zoho, and custom PostgreSQL databases. How many SKUs and warehouse locations are you managing?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl bg-white p-3 text-[var(--ink)] shadow-xs">
                        <div className="text-[9px] font-mono opacity-70 mb-0.5">CALLER</div>
                        <p>Around 12,000 SKUs across four warehouses in North India.</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[var(--brand-soft)] p-3 text-[var(--brand-soft-text)] font-medium shadow-xs">
                        <div className="text-[9px] font-mono opacity-70 mb-0.5">VOX AI VOICE</div>
                        <p>Got it. That fits our custom multi-warehouse workflow. Let me connect you directly with our senior solutions architect right now.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <a
                  href={CALL_CTA}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Call Voice AI Demo: {CALL_NUMBER}</span>
                </a>
                <span className="text-xs font-mono text-[var(--ink-muted)]">WebRTC + SIP Trunk Ready</span>
              </div>
            </div>

            {/* Card 2: WhatsApp AI Employee */}
            <div className="lg:col-span-5 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-3 py-1 text-xs font-mono font-medium">
                    Official Meta Cloud API
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  WhatsApp AI Employee
                </h3>
                <p className="text-xs font-mono font-semibold text-[var(--brand)] mt-1">
                  Your 24/7 multilingual conversational sales closer
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  An autonomous salesperson on WhatsApp that never sleeps. Qualifies buyers, shares product catalogs, calculates customized estimates in Hindi & English, sends PDF brochures, and schedules appointments right into your team's calendar.
                </p>

                {/* Simulated WhatsApp Interaction */}
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-start">
                    <div className="rounded-xl bg-white p-2.5 shadow-xs text-[var(--ink)] max-w-[90%]">
                      <p>“What is the pricing for clinic onboarding?”</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-xl bg-[var(--brand-soft)] p-2.5 shadow-xs text-[var(--brand-soft-text)] font-medium max-w-[90%]">
                      <p>“Setup is ₹20,000 one-time and ₹5,000/mo retainer. Includes 24/7 patient triage and doctor scheduling.”</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    "Instant bilingual reply (English, Hindi, and regional slang)",
                    "Dispatches payment links, PDF brochures, and location maps",
                    "Direct Google Calendar booking with WhatsApp confirmation",
                    "Polite, non-spam drip follow-ups on unresponsive leads",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  <span>Deploy WhatsApp AI Closer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: Instagram AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-3 py-1 text-xs font-mono font-medium">
                    &lt; 1.5s Comment-to-DM Trigger
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  Instagram AI Employee
                </h3>
                <p className="text-xs font-mono font-semibold text-[var(--brand)] mt-1">
                  Turns Reel comments & DMs into paying customers
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  Never miss a viral Reel spike. When followers comment keywords on your Reels or reply to Stories, your AI employee replies in milliseconds, opens a DM conversation, extracts their verified phone number, and syncs them to your CRM.
                </p>

                {/* Simulated Instagram Flow */}
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-1 text-[10px] font-mono text-[var(--ink-muted)]">
                    <span>Reel Comment: "PRICE"</span>
                    <span className="text-[var(--brand)]">Auto-DM in 1.2s</span>
                  </div>
                  <p className="text-[11px] text-[var(--ink)] italic">
                    “Hey Vikram! The 4BHK luxury penthouses start at ₹4.2 Cr. What is your WhatsApp number so I can send the video walk-through?”
                  </p>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    "Reel Comment trigger: Automatically sends instant DM with pricing",
                    "Story reply and direct message triage 24 hours a day",
                    "Screens out casual scrollers and converts high-intent buyers",
                    "Extracts verified phone numbers into CRM automatically",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  <span>Connect Instagram Graph API</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Card 4: Executive Email AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-3 py-1 text-xs font-mono font-medium">
                    Inbox Zero · 1.2s Triage
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  Executive Email AI Employee
                </h3>
                <p className="text-xs font-mono font-semibold text-[var(--brand)] mt-1">
                  Hyper-personalized triage & enterprise proposal drafting
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  An executive email partner that reads incoming enterprise inquiries, categorizes high-value opportunities, generates bespoke context-aware replies matching your company voice, and keeps sales pipelines warm.
                </p>

                {/* Simulated Email Flow */}
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-1 text-[10px] font-mono text-[var(--ink-muted)]">
                    <span>Subject: Enterprise Franchise Proposal (18 Outlets)</span>
                    <span className="text-[var(--brand)]">Draft Prepared</span>
                  </div>
                  <p className="text-[11px] text-[var(--ink)] italic line-clamp-2">
                    “Dear Director Chopra, We have prepared specialized retail routing for your 18 outlets. Attached is the architectural breakdown...”
                  </p>
                </div>

                <div className="mt-5 space-y-2">
                  {[
                    "Inbox Zero triage: separates critical client deals from junk mail",
                    "Pre-drafts context-aware, hyper-personalized email proposals",
                    "Synchronizes lead touchpoints with Google Sheets and CRM",
                    "Re-engages dormant client opportunities with contextual follow-ups",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  <span>Set Up Enterprise Email Triage</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Refined Audio Voice Demo Section ────────────────────────────── */}
      <section id="voice-audio" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <Headphones className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span>Sub-350ms Voice Telephony Engine</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Hear what your AI Employee sounds like.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)] leading-relaxed">
              Indistinguishable from an experienced sales representative. Natural breathing, pauses, tone variation, and sub-350ms response latency so there are never awkward robotic delays.
            </p>
          </div>

          {/* Refined Audio Player Card */}
          <div className="max-w-3xl mx-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10 shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-[var(--line)]">
              <div className="flex items-center gap-4">
                {/* Large Round Coral Play Button */}
                <button
                  onClick={toggleVoicePlayback}
                  className={`flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md transition-all hover:scale-105 active:scale-95 shrink-0 ${
                    isPlayingAudio ? "ring-4 ring-[var(--accent)]/30 animate-pulse" : ""
                  }`}
                  aria-label="Play spoken audio sample"
                >
                  {isPlayingAudio ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 ml-0.5" />}
                </button>
                <div>
                  <div className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                    <span>Vox Voice Model v4 (Ultra-Low Latency)</span>
                    <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--brand-soft-text)] font-semibold">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] mt-1">
                    {isPlayingAudio ? "Speaking live via Web Audio Synthesis..." : "Click play to listen to spoken speech sample"}
                  </p>
                </div>
              </div>

              {/* Direct Call Button */}
              <a
                href={CALL_CTA}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              >
                <PhoneCall className="h-3.5 w-3.5 text-[var(--brand)]" />
                <span>Call Phone Demo: {CALL_NUMBER}</span>
              </a>
            </div>

            {/* Animated Waveform in Forest Green */}
            <div className="py-8">
              <div className="flex items-end justify-between h-20 gap-1 sm:gap-1.5 px-2">
                {[
                  32, 65, 80, 45, 95, 30, 85, 60, 100, 75, 40, 90, 50, 85, 35, 70, 95, 40, 60, 80, 45, 90, 65, 35, 75, 50, 85, 40,
                ].map((val, idx) => (
                  <span
                    key={idx}
                    className={`w-full rounded-full transition-all duration-150 ${
                      isPlayingAudio ? "bg-[var(--brand)]" : "bg-[var(--ink-faint)]/25"
                    }`}
                    style={{
                      height: isPlayingAudio ? `${Math.max(16, val * (idx % 2 === 0 ? 1 : 0.82))}%` : "16%",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Spoken Transcript Preview */}
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 sm:p-5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-muted)] block mb-1">
                Transcript Preview
              </span>
              <p className="text-sm font-medium text-[var(--ink)] italic">
                “{audioSamplePhrases[audioTranscriptIndex % audioSamplePhrases.length]}”
              </p>
            </div>

            {/* 3 Simple Stat Tiles */}
            <div className="mt-6 pt-5 border-t border-[var(--line)] grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] font-mono text-[var(--ink-muted)] block uppercase">Response Cadence</span>
                <span className="font-serif text-lg font-bold text-[var(--brand)]">340ms Latency</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[var(--ink-muted)] block uppercase">Voice Naturalness</span>
                <span className="font-serif text-lg font-bold text-[var(--brand)]">99.4% Human Score</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[var(--ink-muted)] block uppercase">Telephony Type</span>
                <span className="font-serif text-lg font-bold text-[var(--brand)]">WebRTC + SIP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. How We Build It (Stepper 01-04 Expanded) ─────────────────────── */}
      <section id="how-it-works" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <span>Engineering Process</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              How we build your custom AI Employee.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)] leading-relaxed">
              Not a generic template. We extract your proprietary business knowledge, calibrate voice and sales demeanor, configure strict safety guardrails, and hook directly into your phone and social channels.
            </p>
          </div>

          {/* Stepper with connecting line on desktop */}
          <div className="relative">
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-[1px] bg-[var(--line)] -z-0" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                {
                  step: "01",
                  title: "Knowledge Ingestion",
                  sub: "We extract your business DNA",
                  desc: "Our engineers ingest your product catalogs, SKU pricing tables, past WhatsApp conversations, sales call recordings, website FAQs, and PDFs. We map every objection your buyers throw at you so the AI never stumbles.",
                  deliverables: ["Product catalogs & price tiers", "Historical call transcripts", "Objection handling playbook"],
                },
                {
                  step: "02",
                  title: "Voice & Persona Tuning",
                  sub: "Trained to match your best closer",
                  desc: "We calibrate the exact accent, speaking rhythm, natural pauses, polite Hindi-English code-switching, and tone of your top closer. Callers feel like they are speaking with a seasoned, courteous in-office executive.",
                  deliverables: ["Bilingual Hindi-English fluency", "Sub-350ms natural cadence", "Tone & politeness guardrails"],
                },
                {
                  step: "03",
                  title: "Safety & Guardrails",
                  sub: "Zero hallucinations, zero false promises",
                  desc: "Strict logic boundaries prevent the AI from quoting unapproved discounts or inventing terms. When high-ticket negotiations or sensitive inquiries arise, it smoothly transfers the live call or chat to you with an executive dossier.",
                  deliverables: ["100% price integrity", "Instant live human warm-transfer", "Audit logs & recording storage"],
                },
                {
                  step: "04",
                  title: "Omnichannel Deployment",
                  sub: "Live on your phone & social numbers",
                  desc: "We wire the AI into your official WhatsApp Cloud API, Instagram Graph API, and existing office phone line via SIP forwarding. In 72 hours, your new employee is handling live customer inquiries without changing SIM cards.",
                  deliverables: ["WhatsApp Cloud API verification", "Retain existing phone SIM", "CRM & Google Sheets instant sync"],
                },
              ].map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="font-serif text-4xl font-normal text-[var(--brand)] mb-3">
                      {st.step}
                    </div>
                    <h3 className="text-base font-bold text-[var(--ink)] mb-1">
                      {st.title}
                    </h3>
                    <p className="text-xs font-mono text-[var(--brand)] mb-3">
                      {st.sub}
                    </p>
                    <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed mb-4">
                      {st.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--line)] space-y-1.5">
                    {st.deliverables.map((d, di) => (
                      <div key={di} className="text-[11px] text-[var(--ink)] flex items-center gap-1.5 font-medium">
                        <Check className="h-3 w-3 text-[var(--brand)] shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Clear Commercials & Pricing Section ─────────────────────────── */}
      <section id="pricing" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <span>Transparent Commercials</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              A clear, two-part investment.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)] leading-relaxed">
              One custom implementation fee to build your digital employee from scratch, and a predictable monthly retainer to keep it learning, updating, and running 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: Implementation Card in White */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-10 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-[var(--brand)] uppercase tracking-wider">
                    One-Time Implementation
                  </span>
                  <span className="rounded-full bg-[var(--brand-soft)] px-3 py-0.5 text-xs font-mono text-[var(--brand-soft-text)] font-medium">
                    Full Build & Deploy
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-5xl font-bold text-[var(--ink)]">₹20,000</span>
                  <span className="text-[var(--ink-muted)] text-sm font-mono">one-time setup</span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed mb-6">
                  Complete custom engineering of your business AI Employee across Phone Calls, WhatsApp, Instagram, and Email. Dedicated solutions architect assigned to your account.
                </p>

                <div className="space-y-3 pt-6 border-t border-[var(--line)]">
                  {[
                    "Complete business discovery & knowledge extraction from your catalogs",
                    "Voice AI configuration with sub-350ms natural cadence & accent tuning",
                    "Official WhatsApp Cloud API & Instagram DM automation setup",
                    "Email inbox triage and auto-drafting integration for Inbox Zero",
                    "Custom qualification scoring & objection-handling playbook",
                    "Executive debrief portal to chat with your AI in natural English/Hindi",
                    "Custom CRM & Google Sheets automated lead sync integration",
                    "End-to-end edge testing & 72-hour production launch guarantee",
                    "Staff training and founder onboarding walk-through session",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--ink)]">
                      <Check className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] py-3.5 text-xs font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-all shadow-sm"
                >
                  <span>Build Your AI Employee (₹20,000)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Card 2: Monthly Retainer in Deep Forest Green */}
            <div className="rounded-3xl border border-[var(--brand)] bg-[var(--brand)] text-[#F6F1E7] p-8 sm:p-10 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Monthly Support & Retainer
                  </span>
                  <span className="rounded-full bg-[var(--brand-surface)] border border-emerald-500/30 px-3 py-0.5 text-xs font-mono text-emerald-200">
                    Continuous Upkeep
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-serif text-5xl font-bold text-[#F6F1E7]">₹5,000</span>
                  <span className="text-emerald-200/80 text-sm font-mono">per month · pause anytime</span>
                </div>

                <p className="text-xs sm:text-sm text-[#F6F1E7]/80 leading-relaxed mb-6">
                  24/7 uptime monitoring, continuous prompt optimization, model retraining, and technical maintenance so your employee never breaks or goes offline.
                </p>

                <div className="space-y-3 pt-6 border-t border-white/10">
                  {[
                    "24/7 autonomous uptime monitoring & automated health checks",
                    "Continuous prompt engineering and response tuning as your business grows",
                    "Monthly knowledge base updates (new products, price changes, promos)",
                    "API compatibility upkeep (Meta Cloud, WhatsApp, telephony updates)",
                    "Minor workflow adjustments as your sales process evolves",
                    "Direct technical assistance & bug resolution via private WhatsApp group",
                    "Weekly lead conversion & speed-to-lead audit report",
                    "Priority emergency response hotline for your team",
                  ].map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#F6F1E7]">
                      <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-3.5 text-xs font-bold text-white shadow-md transition-all"
                >
                  <span>Lock In Retainer (₹5,000/mo)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Detailed Pass-Through Transparency Callout */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-xs text-xs text-[var(--ink-muted)]">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-[var(--brand)]" />
              <strong className="text-sm font-bold text-[var(--ink)]">100% Direct Pass-Through Transparency: Zero Markup on Platform Usage</strong>
            </div>
            <p className="leading-relaxed">
              Unlike traditional agencies that mark up utility fees by 300%, Vox AI has zero markup on third-party platform costs. You pay actual provider costs directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-[var(--line)] font-mono text-[11px]">
              <div>
                <span className="font-bold text-[var(--ink)] block">Meta WhatsApp API</span>
                <span className="text-[var(--ink-muted)]">~₹0.70 to ₹0.85 per 24-hour service conversation directly to Meta</span>
              </div>
              <div>
                <span className="font-bold text-[var(--ink)] block">Telephony Minutes</span>
                <span className="text-[var(--ink-muted)]">Actual telecom SIP trunk rates (~₹0.50/min for domestic Indian calls)</span>
              </div>
              <div>
                <span className="font-bold text-[var(--ink)] block">AI Model Tokens</span>
                <span className="text-[var(--ink-muted)]">Billed directly by OpenAI / Gemini at actual token consumption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. Final CTA (Full-Width Forest-Green Block) ───────────────────── */}
      <section className="relative bg-[var(--brand)] text-[#F6F1E7] py-20 md:py-28 overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-mono text-xs uppercase tracking-widest text-emerald-300 font-semibold">
            Next Step — Initiate Your AI Build
          </span>
          <h2 className="font-serif mt-4 text-3xl sm:text-6xl font-normal text-[#F6F1E7] tracking-tight">
            Ready to hire your first AI Employee?
          </h2>
          <p className="mt-5 text-base sm:text-lg text-[#F6F1E7]/80 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop letting after-hours leads go cold. Deploy a dedicated AI employee trained on your products, answering on Instagram, WhatsApp, Email, and Calls in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-emerald-200">
            <span>✓ 72-Hour Deployment Guarantee</span>
            <span>•</span>
            <span>✓ Retain Existing Phone & SIM</span>
            <span>•</span>
            <span>✓ Live Human Handoff Anytime</span>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-[var(--accent-hover)] transition-all hover:scale-105 active:scale-95"
            >
              <span>Deploy AI Employee on WhatsApp</span>
              <ArrowRight className="h-4 w-4" />
            </a>

            <a
              href={CALL_CTA}
              className="inline-flex items-center gap-2 rounded-xl border border-[#F6F1E7]/30 bg-white/5 px-6 py-4 text-sm font-semibold text-[#F6F1E7] hover:bg-white/10 transition-colors"
            >
              <PhoneCall className="h-4 w-4 text-emerald-300" />
              <span>Call Voice AI: {CALL_NUMBER}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 9. Footer (Organized Columns, Muted Ink on Cream) ──────────────── */}
      <footer className="border-t border-[var(--line)] bg-[#EFE8DA] pt-16 pb-12 text-xs text-[var(--ink-muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Official Contact Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-[var(--line)]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-1.5">WEBSITE</span>
              <a
                href={`https://${WEBSITE_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {WEBSITE_URL}
              </a>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-1.5">DIRECT EMAIL</span>
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="font-medium text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {EMAIL_ADDRESS}
              </a>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-1.5">PHONE CALLS</span>
              <a
                href={CALL_CTA}
                className="font-medium text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {CALL_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-1.5">WHATSAPP</span>
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {WHATSAPP_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-1.5">HEADQUARTERS</span>
              <span className="font-medium text-[var(--ink)] block">
                {LOCATION}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-1.5">INSTAGRAM</span>
              <a
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                @{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© {new Date().getFullYear()} Vox AI Agents. Custom AI Solutions for Business. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy.html" className="hover:text-[var(--ink)] transition-colors">
                Privacy Policy
              </Link>
              <Link href={user ? "/dashboard" : "/login"} className="hover:text-[var(--ink)] transition-colors">
                {user ? "Dashboard" : "Login"}
              </Link>
              <span className="font-mono text-[var(--brand)]">Autonomous Workforce Engine</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}