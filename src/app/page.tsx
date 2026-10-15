'use client'

import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Calculator,
  Calendar,
  Check,
  CheckCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  FileText,
  Headphones,
  HelpCircle,
  Instagram,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Minus,
  Phone,
  PhoneCall,
  Play,
  Pause,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sliders,
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
    category: "Wholesale & Fresh Produce",
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

// ROI Calculator Industry Presets
const roiPresets = [
  { label: "Retail & Wholesaler", inquiries: 40, staff: 2, salary: 18000 },
  { label: "Clinic & Hospital", inquiries: 80, staff: 3, salary: 22000 },
  { label: "Real Estate & Builders", inquiries: 120, staff: 4, salary: 25000 },
  { label: "Coaching & Education", inquiries: 60, staff: 2, salary: 20000 },
]

// Head-to-Head Comparison: Traditional Telecallers vs. VOX AI Employee
const comparisonRows = [
  {
    feature: "Working Hours & Availability",
    human: "10:00 AM – 7:00 PM (Takes Sundays, festivals & bank holidays off)",
    humanIcon: "bad",
    vox: "24/7/365 — Answers instantly at 2:00 AM, Sunday night, or festival holidays",
    voxBadge: "Always Active",
  },
  {
    feature: "Speed to Lead (Response Time)",
    human: "15 mins to 4+ hours (often delayed during lunch, meetings, or peak rush)",
    humanIcon: "bad",
    vox: "1.2 seconds across Calls, WhatsApp, Instagram & Email simultaneously",
    voxBadge: "1.2s Instant",
  },
  {
    feature: "Call Concurrency & Capacity",
    human: "1 customer at a time. Callers 2, 3, and 4 receive a busy tone or disconnect",
    humanIcon: "bad",
    vox: "100+ simultaneous phone calls and WhatsApp chats with zero busy tone",
    voxBadge: "Unlimited Lines",
  },
  {
    feature: "Monthly Cost (Fixed Overhead)",
    human: "₹20,000 – ₹35,000 per telecaller + PF, office space, incentives & bonus",
    humanIcon: "bad",
    vox: "₹5,000 / month flat retainer for unlimited automated conversations",
    voxBadge: "Flat ₹5,000/mo",
  },
  {
    feature: "Staff Training & Turnover",
    human: "3–4 weeks to train each person; high attrition (quits unexpectedly after months)",
    humanIcon: "bad",
    vox: "Trained once in 72 hours on your exact catalog; never quits, never forgets",
    voxBadge: "Zero Attrition",
  },
  {
    feature: "Language & Dialect Fluency",
    human: "Usually 1 or 2 languages; tone and grammar vary with staff mood or stress",
    humanIcon: "warning",
    vox: "Fluent bilingual Indian English, pure Hindi, and natural everyday Hinglish",
    voxBadge: "Bilingual Natural",
  },
  {
    feature: "Lead Logging & CRM Sync",
    human: "Manual entry into Excel or paper diaries; leads often forgotten or misrecorded",
    humanIcon: "bad",
    vox: "100% automated logging in Google Sheets & CRM with call recordings attached",
    voxBadge: "Instant CRM Sync",
  },
  {
    feature: "Demeanor & Politeness",
    human: "Gets fatigued or irritable after 40 calls; quality drops towards evening",
    humanIcon: "warning",
    vox: "100% patient, courteous, energetic, and professional on every single interaction",
    voxBadge: "100% Consistent",
  },
]

// Frequently Asked Questions (Overcoming Buyer Objections)
const faqItems = [
  {
    q: "Will I lose my existing WhatsApp number or SIM card?",
    a: "No, never. You retain 100% physical ownership of your phone and existing SIM card. We configure your AI Employee using official Meta WhatsApp Cloud API credentials or smart telecom call-forwarding. Your personal contacts and private WhatsApp chats remain completely untouched on your device.",
  },
  {
    q: "What happens if a customer asks a complex question the AI doesn't know?",
    a: "The AI operates under strict boundary guardrails and never guesses or makes up false information. When a high-ticket customer requests custom pricing or asks an edge-case question, the AI politely replies: 'Let me connect you directly with our senior director.' It instantly fires an urgent notification to your personal WhatsApp with the customer's full dossier, audio call recording, and chat transcript so your team can close the deal effortlessly.",
  },
  {
    q: "Can it speak natural conversational Hindi and Hinglish without sounding robotic?",
    a: "Yes! Our voice and text AI models are specifically calibrated for the Indian business ecosystem. It naturally understands and speaks fluent conversational Hindi, clean Indian English, and everyday colloquial Hinglish with natural breathing pauses, courteous cadence, and zero robotic monotone IVR sound.",
  },
  {
    q: "What is included in the ₹20,000 setup fee and the ₹5,000 monthly retainer?",
    a: "The ₹20,000 is a one-time engineering implementation fee covering complete business knowledge extraction, voice persona tuning, Meta Cloud API verification, CRM/Google Sheets sync, and comprehensive edge testing. The predictable ₹5,000/month retainer covers continuous 24/7 uptime monitoring, prompt optimizations, monthly catalog/pricing updates, API compatibility upkeep, and private WhatsApp engineering support.",
  },
  {
    q: "Are there any hidden markups or surprise charges?",
    a: "None. Vox AI practices 100% direct pass-through transparency with zero agency markup. You pay underlying infrastructure providers at direct wholesale cost: Meta charges approximately ₹0.70 to ₹0.85 per 24-hour service conversation, and telecom telephony minutes cost ~₹0.50/min for domestic Indian calls.",
  },
  {
    q: "How fast can we go live after signing up?",
    a: "We guarantee a 72-hour turnaround. Once you provide your product catalog, website, or brochure, our engineers calibrate your custom AI employee, conduct comprehensive edge testing with you, and launch it live on your channels within 3 business days.",
  },
  {
    q: "Is my customer data, pricing list, and lead database confidential?",
    a: "100% confidential and secure. Your business data is stored in isolated, encrypted cloud databases. We never share your leads, never sell your customer phonebook, and never train public models on your proprietary business conversations. You own 100% of your data.",
  },
]

export default function LandingPage() {
  const { user } = useOrg()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioTranscriptIndex, setAudioTranscriptIndex] = useState(0)

  // Interactive ROI Calculator State
  const [inquiriesPerDay, setInquiriesPerDay] = useState(50)
  const [telecallerCount, setTelecallerCount] = useState(2)
  const [salaryPerCaller, setSalaryPerCaller] = useState(20000)
  const [activePresetIndex, setActivePresetIndex] = useState<number | null>(0)

  // Dynamic ROI Calculations
  const monthlyHumanPayroll = telecallerCount * salaryPerCaller
  const monthlyVoxCost = 5000
  const monthlySavings = Math.max(0, monthlyHumanPayroll - monthlyVoxCost)
  const annualSavings = monthlySavings * 12
  const savingsPercentage = Math.round((monthlySavings / Math.max(1, monthlyHumanPayroll)) * 100)
  const afterHoursLeadsCaptured = Math.round(inquiriesPerDay * 0.38 * 30)

  // FAQ Accordion State (first item open by default)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

  // ─── Executive Briefing Demo Queries ─────────────────────────────────────────
  const executivePrompts = [
    {
      id: "summary",
      label: "Today's Briefing",
      question: "Hey Nova, give me a complete debrief of today's business activity.",
      response: {
        headline: "Today's Business Summary (Calls, WhatsApp, Instagram, Email)",
        bullets: [
          "Phone Calls: 42 customer calls answered automatically without missing a single ring. 9 qualified buyers booked a direct sales meeting on Google Calendar, and 4 high-budget leads were transferred live to your sales team.",
          "WhatsApp: 114 prospective customers answered in English and Hindi. Sent ₹5,80,000 in customized PDF quotations automatically with zero manual effort from your staff.",
          "Instagram: Automatically replied to 68 Reel comments, and sent private DMs that saved 23 verified Indian phone numbers directly into your CRM.",
          "Email: Sorted all incoming emails to Inbox Zero, categorized 14 wholesale inquiries, and pre-drafted 3 formal proposal quotes ready for your 1-click approval.",
        ],
        kpis: [
          { label: "Leads Captured", val: "179 Leads" },
          { label: "Avg Response", val: "1.2 sec" },
          { label: "Pipeline Value", val: "₹18.4 Lakh" },
          { label: "Hours Saved", val: "7.5 hrs" },
        ],
        alert: "Ready for Action: 2 high-value wholesale buyers requested custom order integrations. Their full details and audio call recordings are waiting in your dashboard.",
      },
    },
    {
      id: "leads",
      label: "Hot Leads to Close",
      question: "Which high-intent leads are ready for my human closers right now?",
      response: {
        headline: "Hot Prospects Ready for Human Closing Right Now",
        bullets: [
          "1. Rajesh Singhania (Industrial Manufacturing): Confirmed ₹15 Lakh budget for automated order intake across 4 factories. Requested a contract closing call tomorrow at 3 PM.",
          "2. Dr. Ananya Verma (Clinic Network, 6 branches): Fully qualified for doctor scheduling and patient triage on WhatsApp. Complete patient questionnaire and phone recording attached.",
          "3. Vikram Mehta (Luxury Real Estate): Ready to deploy Instagram Reel DM automation for 3 luxury towers in Gurgaon. Verified mobile number already synced to your Google Sheet.",
        ],
        kpis: [
          { label: "Ready Buyers", val: "3 High-Intent" },
          { label: "Deal Pipeline", val: "₹28.5 Lakh" },
          { label: "Lead Quality", val: "9.8 / 10" },
          { label: "CRM Sync", val: "Instant" },
        ],
        alert: "All 3 prospect summaries, audio call recordings, and WhatsApp chat transcripts are prepared on your dashboard with full customer context.",
      },
    },
    {
      id: "voice",
      label: "Voice Calls & Objections",
      question: "Summarise the phone calls and customer objections from today.",
      response: {
        headline: "Summary of Today's Phone Calls & Common Customer Questions",
        bullets: [
          "Total Call Time: 94 minutes across 42 automated phone calls with zero dropped calls and 100% crystal-clear audio.",
          "Most Common Question (58% of callers): 'Can your AI employee speak both Hindi and English fluently?' — The AI replied smoothly in natural Hindi-English without robotic lag.",
          "Second Question (34% of callers): 'Can it connect directly to our existing office phone number?' — The AI explained call forwarding and SIP trunking without changing existing SIM cards.",
        ],
        kpis: [
          { label: "Speech Latency", val: "340ms" },
          { label: "Human Cadence", val: "99.4%" },
          { label: "Questions Solved", val: "31 / 34" },
          { label: "Live Transferred", val: "4 Calls" },
        ],
        alert: "Zero robotic complaints. 92% of callers felt they were speaking with a polite, professional in-office executive.",
      },
    },
    {
      id: "social",
      label: "Instagram & WhatsApp Ads",
      question: "How are our Instagram ads and WhatsApp campaigns converting today?",
      response: {
        headline: "Social Media & WhatsApp Ad Conversion Report",
        bullets: [
          "Meta Ads: 86 ad clicks started an immediate WhatsApp conversation within 1.5 seconds, preventing visitors from leaving.",
          "Instagram Reel 'How AI Replaces 5 Employees': 140 viewers commented 'DEMO', instantly receiving an automated private DM with pricing and catalog links.",
          "Conversion Rate: 26.7% of all social interactions shared their verified phone number and requested a price quotation.",
        ],
        kpis: [
          { label: "Ad Clicks", val: "86 Leads" },
          { label: "Reel DMs Sent", val: "140 Chats" },
          { label: "Numbers Saved", val: "54 Verified" },
          { label: "Ad Cost Saved", val: "38% Lower" },
        ],
        alert: "Zero missed inquiries: Even night-time inquiries (11 PM to 4 AM) were fully answered, qualified, and booked into your calendar while your team was asleep.",
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
    <div className="vox-landing-theme min-h-screen bg-[var(--bg)] text-[var(--ink)] paper-grain selection:bg-[var(--brand-soft)] selection:text-[var(--brand)] font-sans antialiased relative overflow-x-hidden text-[16px]">
      {/* ─── 1. Minimal Sticky Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#F6F1E7]/95 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
          {/* Brand Logo — Clean, Tight & Uncluttered */}
          <Link href="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)] text-[#F6F1E7] shadow-sm transition-transform group-hover:scale-105">
              <span className="font-serif text-xl font-bold tracking-tight">V</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors whitespace-nowrap">
                VOX AI
              </span>
              <span className="hidden xl:inline-block rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-mono font-semibold text-[var(--brand-soft-text)]">
                AI Employee
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links — Single-line, No Wrapping, Evenly Spaced */}
          <nav className="hidden items-center gap-4 xl:gap-7 lg:flex text-sm xl:text-[15px] font-semibold text-[var(--ink-muted)]">
            <a href="#how-it-works" className="hover:text-[var(--ink)] transition-colors whitespace-nowrap">
              How it works
            </a>
            <a href="#channels" className="hover:text-[var(--ink)] transition-colors whitespace-nowrap">
              Channels
            </a>
            <a href="#roi-calculator" className="hover:text-[var(--ink)] transition-colors whitespace-nowrap">
              Calculator
            </a>
            <a href="#comparison" className="hover:text-[var(--ink)] transition-colors whitespace-nowrap">
              Comparison
            </a>
            <a href="#pricing" className="hover:text-[var(--ink)] transition-colors whitespace-nowrap">
              Pricing
            </a>
            <a href="#faq" className="hover:text-[var(--ink)] transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>

          {/* Action Buttons — Clean, Highlighted Login + Primary Coral CTA */}
          <div className="hidden items-center gap-2.5 xl:gap-3 sm:flex shrink-0">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--brand)]/25 bg-white px-3.5 xl:px-4 py-2 text-xs xl:text-sm font-bold text-[var(--brand)] shadow-xs transition-all hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)] hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 group whitespace-nowrap"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <LayoutDashboard className="h-3.5 w-3.5 xl:h-4 xl:w-4 text-[var(--brand)] group-hover:text-white transition-colors" />
              <span>{user ? "Dashboard" : "Client Portal"}</span>
            </Link>

            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 xl:gap-2 rounded-xl bg-[var(--accent)] px-4 xl:px-5 py-2 text-xs xl:text-sm font-bold text-white shadow-sm transition-all hover:bg-[var(--accent-hover)] hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
            >
              <span>Deploy AI Employee</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] lg:hidden"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-[var(--line)] bg-[var(--surface)] px-5 pt-4 pb-6 shadow-xl lg:hidden"
            >
              <div className="flex flex-col space-y-3 text-base font-semibold text-[var(--ink)]">
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  How it works
                </a>
                <a
                  href="#channels"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  Channels (Calls, WhatsApp, Instagram, Email)
                </a>
                <a
                  href="#roi-calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-[var(--surface-alt)] text-[var(--brand)] font-bold flex items-center justify-between"
                >
                  <span>ROI & Cost Calculator</span>
                  <span className="text-xs bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-2 py-0.5 rounded-full font-mono font-bold">Save 80%+</span>
                </a>
                <a
                  href="#comparison"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  AI Employee vs. Telecallers
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  Pricing (₹20,000 setup)
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-[var(--surface-alt)]"
                >
                  Frequently Asked Questions
                </a>
                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--brand)]/35 bg-[var(--surface-alt)] py-3 text-sm font-bold text-[var(--brand)] shadow-xs hover:bg-[var(--brand)] hover:text-white transition-all"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{user ? "Open Dashboard" : "Client Portal / Login"}</span>
                  </Link>
                  <a
                    href={WHATSAPP_CTA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-3.5 text-sm font-bold text-white shadow-sm"
                  >
                    <span>Deploy AI Employee</span>
                    <ArrowRight className="h-4 w-4" />
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
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-sm text-[var(--ink-muted)] shadow-xs mb-6">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--brand)]" />
                <span className="font-semibold text-[var(--ink)]">Custom AI Employees for Indian Businesses</span>
              </div>

              {/* Oversized Serif Headline */}
              <h1 className="font-serif text-[44px] sm:text-6xl lg:text-[76px] leading-[1.05] tracking-[-0.02em] font-normal text-[var(--ink)] text-balance">
                Your business, <em className="italic font-normal text-[var(--brand)]">cloned</em> into an autonomous AI employee.
              </h1>

              {/* Clear, Understandable Subcopy for Indian Business Owners */}
              <p className="mt-6 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed max-w-xl font-normal">
                We build a custom AI employee that answers your phone calls, WhatsApp messages, Instagram DMs, and emails 24/7. Trained on your exact products, catalog prices, and sales objections to qualify buyers, calculate quotations, and book revenue deals while you sleep.
              </p>

              {/* Primary Actions & Voice Audio Link */}
              <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 rounded-xl bg-[var(--accent)] px-8 py-4.5 text-base sm:text-lg font-bold text-white shadow-md hover:bg-[var(--accent-hover)] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  <span>Deploy Your AI Employee</span>
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>

                <a
                  href="#voice-audio"
                  className="inline-flex items-center gap-2.5 text-base font-bold text-[var(--ink)] hover:text-[var(--brand)] transition-colors py-2"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-alt)] border border-[var(--line)]">
                    <Headphones className="h-4.5 w-4.5 text-[var(--brand)]" />
                  </div>
                  <span>Hear the voice demo</span>
                </a>

                <a
                  href={CALL_CTA}
                  className="text-sm sm:text-base text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors inline-flex items-center gap-2"
                >
                  <PhoneCall className="h-4 w-4 text-[var(--brand)]" />
                  <span>or call direct: <strong className="font-bold text-[var(--ink)]">{CALL_NUMBER}</strong></span>
                </a>
              </div>

              {/* Thin Row of Trust Stats with Context */}
              <div className="mt-12 pt-6 border-t border-[var(--line)] w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)]">1.2s</div>
                  <div className="text-sm font-semibold text-[var(--ink)]">Instant Reply</div>
                  <div className="text-xs text-[var(--ink-muted)]">Across all 4 channels</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)]">24/7/365</div>
                  <div className="text-sm font-semibold text-[var(--ink)]">Always Working</div>
                  <div className="text-xs text-[var(--ink-muted)]">Zero missed inquiries</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)]">72 Hours</div>
                  <div className="text-sm font-semibold text-[var(--ink)]">Fast Launch</div>
                  <div className="text-xs text-[var(--ink-muted)]">Keep existing SIM</div>
                </div>
                <div>
                  <div className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)]">4 Channels</div>
                  <div className="text-sm font-semibold text-[var(--ink)]">One Unified Brain</div>
                  <div className="text-xs text-[var(--ink-muted)]">Calls, WA, IG, Email</div>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Phone Mockup (Clear readable text) */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Soft background aura */}
              <div className="absolute -inset-4 rounded-full bg-[var(--brand-soft)]/50 blur-3xl -z-10" />

              {/* Phone Frame */}
              <div className="relative w-full max-w-[370px] rounded-[42px] border-[8px] border-[#16211C] bg-[#ECE5DD] shadow-2xl overflow-hidden text-[var(--ink)]">
                {/* Speaker pill */}
                <div className="h-6 bg-[#16211C] flex items-center justify-center">
                  <div className="w-16 h-3 bg-[#0C120F] rounded-full" />
                </div>

                {/* WhatsApp Chat App Bar */}
                <div className="bg-[var(--brand)] text-[#F6F1E7] px-4 py-3.5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] font-bold text-sm">
                      VA
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[var(--brand)]" />
                    </div>
                    <div>
                      <div className="text-sm font-bold leading-tight text-[#F6F1E7]">Vox AI Employee</div>
                      <div className="text-xs text-[var(--brand-soft)]">Online · Answers in &lt; 1 sec</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[#F6F1E7]/80">
                    <Phone className="h-5 w-5" />
                  </div>
                </div>

                {/* Chat Messages Canvas with comfortable, readable font */}
                <div className="p-4 space-y-4 min-h-[440px] flex flex-col justify-end bg-[#ECE5DD]">
                  {/* Date badge */}
                  <div className="flex justify-center mb-1">
                    <span className="rounded-md bg-white/80 px-3 py-1 text-xs font-mono text-[var(--ink-muted)] shadow-xs">
                      Today · Customer Inquiry
                    </span>
                  </div>

                  {/* Customer Question */}
                  <div className="flex justify-start">
                    <div className="max-w-[86%] rounded-2xl rounded-tl-xs bg-white p-3.5 text-[14px] leading-relaxed shadow-xs text-[#14170F]">
                      <p>Hi, we run a multi-doctor clinic in Haryana. Can your AI answer patient questions on WhatsApp, share fees, and book doctor appointments?</p>
                      <div className="text-xs text-[#8E9285] text-right mt-1 font-mono">10:14 AM</div>
                    </div>
                  </div>

                  {/* AI Response in Mint Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[var(--brand-soft)] p-3.5 text-[14px] leading-relaxed shadow-xs text-[var(--brand-soft-text)] font-medium">
                      <p>Namaste! Yes, absolutely. We sync directly with your doctor calendar, answer in Hindi and English, and confirm appointment slots instantly with automated WhatsApp reminders.</p>
                      <div className="flex items-center justify-end gap-1 text-xs text-[var(--brand)] mt-1 font-mono">
                        <span>10:14 AM</span>
                        <CheckCheck className="h-4 w-4 text-[#34B7F1]" />
                      </div>
                    </div>
                  </div>

                  {/* Customer Followup */}
                  <div className="flex justify-start">
                    <div className="max-w-[86%] rounded-2xl rounded-tl-xs bg-white p-3.5 text-[14px] leading-relaxed shadow-xs text-[#14170F]">
                      <p>Sounds perfect. What is the setup cost and how soon can we go live?</p>
                      <div className="text-xs text-[#8E9285] text-right mt-1 font-mono">10:15 AM</div>
                    </div>
                  </div>

                  {/* AI Pricing Quote in Mint Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[var(--brand-soft)] p-3.5 text-[14px] leading-relaxed shadow-xs text-[var(--brand-soft-text)] font-medium">
                      <p>Implementation is ₹20,000 one-time, and ₹5,000/month retainer. We deploy your clinic AI employee in 72 hours. Shall I connect you with our deployment team?</p>
                      <div className="flex items-center justify-end gap-1 text-xs text-[var(--brand)] mt-1 font-mono">
                        <span>10:15 AM</span>
                        <CheckCheck className="h-4 w-4 text-[#34B7F1]" />
                      </div>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex items-center gap-2 bg-white w-fit px-3.5 py-2 rounded-2xl rounded-tl-xs shadow-xs text-[#5B5F54]">
                    <span className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-2 w-2 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs font-semibold ml-1 text-[#5B5F54]">AI Employee is typing...</span>
                  </div>
                </div>

                {/* Bottom home indicator */}
                <div className="h-4 bg-[#16211C] flex items-center justify-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Floating Social Proof Card with ample breathing room */}
              <div className="absolute -bottom-6 -left-4 sm:-left-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 shadow-xl z-20 min-w-[260px] sm:min-w-[280px]">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)]">
                      <TrendingUp className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-xs font-semibold text-[var(--ink-muted)]">Live SMB Activity</span>
                  </div>
                  <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                    +42% Today
                  </span>
                </div>
                <div className="font-serif text-3xl font-bold text-[var(--ink)]">₹5,80,000</div>
                <p className="text-xs text-[var(--ink-muted)] mt-1 leading-normal">
                  Automated quotations generated today via WhatsApp & Phone Calls
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Client Logo Carousel Section ───────────────────────────────────── */}
      <section className="relative py-14 border-y border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6 text-center">
          <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-[var(--ink-muted)] font-semibold">
            Trusted by fast-growing Indian businesses & enterprises
          </p>
        </div>

        {/* Continuous Marquee Track */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex items-center gap-6 py-2">
            {[...clientLogos, ...clientLogos].map((client, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] hover:bg-white hover:border-[var(--brand)]/30 px-6 py-3.5 transition-all duration-200 shadow-xs shrink-0 group"
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
                  <div className="text-sm font-bold text-[var(--ink)] tracking-tight whitespace-nowrap">
                    {client.name}
                  </div>
                  <div className="text-xs font-mono text-[var(--ink-muted)] whitespace-nowrap mt-0.5">
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
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 sm:py-4 sm:px-6 shadow-xs flex items-center justify-between gap-4 text-sm font-mono">
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[var(--brand)] text-xs uppercase tracking-wide">Live Activity</span>
          </div>
          <div className="truncate text-[var(--ink)] text-xs sm:text-sm">
            <span className="font-bold text-[var(--brand)] mr-2">[{tickerItems[0].channel}]</span>
            <span className="text-[var(--ink-muted)]">{tickerItems[0].text}</span>
          </div>
          <span className="text-xs text-[var(--ink-faint)] shrink-0 hidden sm:inline">{tickerItems[0].time}</span>
        </div>
      </div>

      {/* ─── 3. "Ask your AI Employee" Briefing Demo ────────────────────────── */}
      <section id="chat-with-ai" className="relative py-16 md:py-24 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <Sparkles className="h-4 w-4 text-[var(--brand)]" />
              <span>Founder Briefing Interface</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Ask your AI Employee anything.
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
              Your AI Employee doesn't just talk to customers—it keeps you briefed. Click any executive question below to see how it summarizes business performance across Calls, WhatsApp, Instagram, and Email into a clear, instant management report.
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
                <span className="text-sm text-[var(--ink)] font-semibold flex items-center gap-2 ml-2">
                  <Bot className="h-4 w-4 text-[var(--brand)]" />
                  <span>Executive Briefing Dashboard</span>
                  <span className="text-[var(--ink-muted)] font-normal hidden sm:inline">· Vox AI Employee</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--brand)]">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand-soft-text)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                  All 4 Channels Working Together
                </span>
              </div>
            </div>

            {/* Query Chips as Pill Buttons */}
            <div className="p-4 sm:p-6 border-b border-[var(--line)] bg-[var(--surface)]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {executivePrompts.map((p, idx) => {
                  const isSelected = activePromptIndex === idx
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPrompt(idx)}
                      className={`text-left rounded-xl p-4 text-xs sm:text-sm transition-all border ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--brand)] text-[#F6F1E7] shadow-sm"
                          : "border-[var(--line)] bg-[var(--surface-alt)] text-[var(--ink)] hover:border-[var(--ink-muted)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold ${isSelected ? "text-emerald-200" : "text-[var(--brand)]"}`}>
                          {p.label}
                        </span>
                        {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-300" />}
                      </div>
                      <p className={`line-clamp-2 text-xs sm:text-[13px] leading-relaxed ${isSelected ? "text-[#F6F1E7]/90" : "text-[var(--ink-muted)]"}`}>
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
                <div className="max-w-[85%] rounded-2xl bg-[var(--brand)] px-6 py-4 text-sm sm:text-base text-[#F6F1E7] shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-200 mb-1">
                    <Users className="h-3.5 w-3.5" /> YOU (FOUNDER / BUSINESS OWNER)
                  </div>
                  <p className="font-semibold text-base sm:text-lg">“{executivePrompts[activePromptIndex].question}”</p>
                </div>
              </div>

              {/* AI Structured Synthesis Response Card */}
              <div className="flex justify-start">
                <div className="w-full rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 sm:p-7 space-y-6">
                  {/* Synthesis Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--line)] pb-4 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand)] text-[#F6F1E7]">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-[var(--brand)] font-bold block uppercase tracking-wide">AI Executive Summary</span>
                        <span className="text-base sm:text-lg text-[var(--ink)] font-bold">{executivePrompts[activePromptIndex].response.headline}</span>
                      </div>
                    </div>
                    <span className="rounded-lg bg-[var(--surface)] border border-[var(--line)] px-3 py-1 text-xs font-mono text-[var(--ink-muted)]">
                      Synthesized in 240ms from 4 live channels
                    </span>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-3.5">
                    {isTypingTerminal ? (
                      <div className="text-sm text-[var(--ink-muted)] italic flex items-center gap-2 py-4">
                        <RefreshCw className="h-4 w-4 animate-spin text-[var(--brand)]" />
                        <span>Gathering and summarizing today's business activity across channels...</span>
                      </div>
                    ) : (
                      executivePrompts[activePromptIndex].response.bullets.map((bullet, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-[var(--ink)] leading-relaxed">
                          <span className="text-[var(--brand)] shrink-0 font-bold text-lg mt-0.5">•</span>
                          <span>{bullet}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 4 KPI Tiles in Bento Layout — Clean numbers with zero text overflow */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[var(--line)]">
                    {executivePrompts[activePromptIndex].response.kpis.map((kpi, idx) => (
                      <div key={idx} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 text-center shadow-xs">
                        <span className="text-xs font-mono text-[var(--ink-muted)] block uppercase tracking-wider font-semibold">{kpi.label}</span>
                        <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)] mt-1.5 block truncate">{kpi.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Priority Alert Box in refined warm forest-mint callout */}
                  <div className="rounded-xl border border-[var(--brand)]/20 bg-[var(--brand-soft)]/60 p-4 text-sm text-[var(--brand-soft-text)] flex items-start gap-3">
                    <Zap className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{executivePrompts[activePromptIndex].response.alert}</span>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex gap-2.5 text-xs font-mono">
                      <span className="rounded-lg bg-[var(--surface)] px-3 py-1.5 text-[var(--ink-muted)] border border-[var(--line)] font-medium">Live Data Verified</span>
                      <span className="rounded-lg bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-3 py-1.5 font-bold">Ready for Human Handoff</span>
                    </div>
                    <a
                      href={WHATSAPP_CTA}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:text-[var(--accent)] transition-colors"
                    >
                      <span>Deploy This AI Assistant For Your Business</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Simulated Custom Prompt Bar */}
              <div className="relative pt-2">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4 shadow-sm">
                  <Search className="h-5 w-5 text-[var(--ink-muted)] shrink-0" />
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Ask your AI Employee anything (e.g. 'How many leads did Instagram bring last night?')..."
                    className="w-full bg-transparent text-sm sm:text-base text-[var(--ink)] placeholder-[var(--ink-faint)] focus:outline-none"
                  />
                  <button
                    onClick={() => {
                      if (customInput.trim()) {
                        handleSelectPrompt((activePromptIndex + 1) % executivePrompts.length)
                        setCustomInput("")
                      }
                    }}
                    className="rounded-xl bg-[var(--brand)] px-5 py-2.5 text-sm font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-colors shrink-0 flex items-center gap-2"
                  >
                    <span>Ask</span>
                    <Send className="h-4 w-4" />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <span>Omnichannel Coverage</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              One unified AI brain. Four channels covered.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
              Your AI Employee doesn’t live in an isolated silo. If a customer leaves a comment on an Instagram Reel, messages your WhatsApp business number, and later calls your office landline, your AI remembers their entire history, previous quotes, and preferences.
            </p>
          </div>

          {/* Asymmetric Bento Grid in Unified Warm Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured Card 1: AI Voice Employee (Wide Card with simulated call dialog) */}
            <div className="lg:col-span-7 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-9 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] px-3.5 py-1 text-xs sm:text-sm font-mono font-bold text-[var(--brand-soft-text)]">
                    Sub-350ms Latency · 99.4% Human Cadence
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  AI Voice Employee
                </h3>
                <p className="text-sm font-mono font-bold text-[var(--brand)] mt-1.5">
                  Ultra-realistic phone reception & proactive outbound lead caller
                </p>
                <p className="text-base text-[var(--ink-muted)] mt-3 leading-relaxed">
                  Sounds identical to your highest-performing in-house sales closer. Answers inbound phone calls within one ring, calls web leads back within 45 seconds, understands colloquial Indian English and Hindi seamlessly, and warm-transfers hot deals to your human reps with an audio debrief.
                </p>

                {/* Simulated Call Transcript as Chat Bubbles */}
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-5 space-y-3 text-sm">
                  <div className="text-xs font-mono text-[var(--ink-muted)] border-b border-[var(--line)] pb-2 flex items-center justify-between font-semibold">
                    <span>Live Call Stream Simulation</span>
                    <span className="text-[var(--brand)]">Active Inbound Telephony</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl bg-white p-3.5 text-[var(--ink)] shadow-xs">
                        <div className="text-[10px] font-mono opacity-70 mb-1 font-bold">CALLER</div>
                        <p>Hi, I saw your package. Do you do custom ERP integrations for wholesale distributors with multiple warehouses?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[var(--brand-soft)] p-3.5 text-[var(--brand-soft-text)] font-semibold shadow-xs">
                        <div className="text-[10px] font-mono opacity-70 mb-1 font-bold">VOX AI VOICE</div>
                        <p>Yes, absolutely! We connect directly with SAP, Tally, Zoho, and custom PostgreSQL databases. How many SKUs and warehouse locations are you managing?</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl bg-white p-3.5 text-[var(--ink)] shadow-xs">
                        <div className="text-[10px] font-mono opacity-70 mb-1 font-bold">CALLER</div>
                        <p>Around 12,000 SKUs across four warehouses in North India.</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[var(--brand-soft)] p-3.5 text-[var(--brand-soft-text)] font-semibold shadow-xs">
                        <div className="text-[10px] font-mono opacity-70 mb-1 font-bold">VOX AI VOICE</div>
                        <p>Got it. That fits our custom multi-warehouse workflow. Let me connect you directly with our senior solutions architect right now.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[var(--line)] flex items-center justify-between">
                <a
                  href={CALL_CTA}
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:underline"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call Voice AI Demo: {CALL_NUMBER}</span>
                </a>
                <span className="text-xs font-mono text-[var(--ink-muted)]">WebRTC + SIP Trunk Ready</span>
              </div>
            </div>

            {/* Card 2: WhatsApp AI Employee */}
            <div className="lg:col-span-5 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-9 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-3.5 py-1 text-xs sm:text-sm font-mono font-bold">
                    Official Meta Cloud API
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  WhatsApp AI Employee
                </h3>
                <p className="text-sm font-mono font-bold text-[var(--brand)] mt-1.5">
                  Your 24/7 multilingual conversational sales closer
                </p>
                <p className="text-base text-[var(--ink-muted)] mt-3 leading-relaxed">
                  An autonomous salesperson on WhatsApp that never sleeps. Qualifies buyers, shares product catalogs, calculates customized estimates in Hindi & English, sends PDF brochures, and schedules appointments right into your team's calendar.
                </p>

                {/* Simulated WhatsApp Interaction */}
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 space-y-2.5 text-sm">
                  <div className="flex justify-start">
                    <div className="rounded-xl bg-white p-3 shadow-xs text-[var(--ink)] max-w-[90%]">
                      <p>“What is the pricing for clinic onboarding?”</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-xl bg-[var(--brand-soft)] p-3 shadow-xs text-[var(--brand-soft-text)] font-semibold max-w-[90%]">
                      <p>“Setup is ₹20,000 one-time and ₹5,000/mo retainer. Includes 24/7 patient triage and doctor scheduling.”</p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2.5">
                  {[
                    "Instant bilingual reply (English, Hindi, and regional slang)",
                    "Dispatches payment links, PDF brochures, and location maps",
                    "Direct Google Calendar booking with WhatsApp confirmation",
                    "Polite, non-spam drip follow-ups on unresponsive leads",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--ink)] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:underline"
                >
                  <span>Deploy WhatsApp AI Closer</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Card 3: Instagram AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-9 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <Instagram className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-3.5 py-1 text-xs sm:text-sm font-mono font-bold">
                    &lt; 1.5s Comment-to-DM Trigger
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  Instagram AI Employee
                </h3>
                <p className="text-sm font-mono font-bold text-[var(--brand)] mt-1.5">
                  Turns Reel comments & DMs into paying customers
                </p>
                <p className="text-base text-[var(--ink-muted)] mt-3 leading-relaxed">
                  Never miss a viral Reel spike. When followers comment keywords on your Reels or reply to Stories, your AI employee replies in milliseconds, opens a DM conversation, extracts their verified phone number, and syncs them to your CRM.
                </p>

                {/* Simulated Instagram Flow */}
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5 text-xs font-mono text-[var(--ink-muted)] font-semibold">
                    <span>Reel Comment: "PRICE"</span>
                    <span className="text-[var(--brand)]">Auto-DM in 1.2s</span>
                  </div>
                  <p className="text-sm text-[var(--ink)] italic leading-relaxed">
                    “Hey Vikram! The 4BHK luxury penthouses start at ₹4.2 Cr. What is your WhatsApp number so I can send the video walk-through?”
                  </p>
                </div>

                <div className="mt-5 space-y-2.5">
                  {[
                    "Reel Comment trigger: Automatically sends instant DM with pricing",
                    "Story reply and direct message triage 24 hours a day",
                    "Screens out casual scrollers and converts high-intent buyers",
                    "Extracts verified phone numbers into CRM automatically",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--ink)] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:underline"
                >
                  <span>Connect Instagram Graph API</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Card 4: Executive Email AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-9 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7]">
                    <Mail className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-3.5 py-1 text-xs sm:text-sm font-mono font-bold">
                    Inbox Zero · 1.2s Triage
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  Executive Email AI Employee
                </h3>
                <p className="text-sm font-mono font-bold text-[var(--brand)] mt-1.5">
                  Hyper-personalized triage & enterprise proposal drafting
                </p>
                <p className="text-base text-[var(--ink-muted)] mt-3 leading-relaxed">
                  An executive email partner that reads incoming enterprise inquiries, categorizes high-value opportunities, generates bespoke context-aware replies matching your company voice, and keeps sales pipelines warm.
                </p>

                {/* Simulated Email Flow */}
                <div className="mt-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-1.5 text-xs font-mono text-[var(--ink-muted)] font-semibold">
                    <span>Subject: Enterprise Franchise Proposal (18 Outlets)</span>
                    <span className="text-[var(--brand)]">Draft Prepared</span>
                  </div>
                  <p className="text-sm text-[var(--ink)] italic line-clamp-2 leading-relaxed">
                    “Dear Director Chopra, We have prepared specialized retail routing for your 18 outlets. Attached is the architectural breakdown and pricing...”
                  </p>
                </div>

                <div className="mt-5 space-y-2.5">
                  {[
                    "Inbox Zero triage: separates critical client deals from junk mail",
                    "Pre-drafts context-aware, hyper-personalized email proposals",
                    "Synchronizes lead touchpoints with Google Sheets and CRM",
                    "Re-engages dormant client opportunities with contextual follow-ups",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm text-[var(--ink)] font-medium">
                      <CheckCircle2 className="h-4 w-4 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-[var(--brand)] hover:underline"
                >
                  <span>Set Up Enterprise Email Triage</span>
                  <ArrowRight className="h-4 w-4" />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <Headphones className="h-4 w-4 text-[var(--brand)]" />
              <span>Sub-350ms Voice Telephony Engine</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Hear what your AI Employee sounds like.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
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
                  <div className="text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2">
                    <span>Vox Voice Model v4 (Ultra-Low Latency)</span>
                    <span className="rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-xs font-mono text-[var(--brand-soft-text)] font-bold">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--ink-muted)] mt-1">
                    {isPlayingAudio ? "Speaking live via Web Audio Synthesis..." : "Click play to listen to spoken speech sample"}
                  </p>
                </div>
              </div>

              {/* Direct Call Button */}
              <a
                href={CALL_CTA}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[var(--surface-alt)] px-4.5 py-3 text-xs sm:text-sm font-bold text-[var(--ink)] hover:bg-[var(--surface)] transition-colors"
              >
                <PhoneCall className="h-4 w-4 text-[var(--brand)]" />
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
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-5 sm:p-6">
              <span className="font-mono text-xs uppercase tracking-wider text-[var(--ink-muted)] block mb-1.5 font-bold">
                Spoken Transcript Preview
              </span>
              <p className="text-base sm:text-lg font-medium text-[var(--ink)] italic leading-relaxed">
                “{audioSamplePhrases[audioTranscriptIndex % audioSamplePhrases.length]}”
              </p>
            </div>

            {/* 3 Simple Stat Tiles */}
            <div className="mt-6 pt-5 border-t border-[var(--line)] grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-xs font-mono text-[var(--ink-muted)] block uppercase font-semibold">Response Cadence</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[var(--brand)] mt-1 block">340ms Latency</span>
              </div>
              <div>
                <span className="text-xs font-mono text-[var(--ink-muted)] block uppercase font-semibold">Voice Naturalness</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[var(--brand)] mt-1 block">99.4% Human Score</span>
              </div>
              <div>
                <span className="text-xs font-mono text-[var(--ink-muted)] block uppercase font-semibold">Telephony Type</span>
                <span className="font-serif text-xl sm:text-2xl font-bold text-[var(--brand)] mt-1 block">WebRTC + SIP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Interactive ROI / Cost Savings Calculator ────────────────────── */}
      <section id="roi-calculator" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <Calculator className="h-4 w-4 text-[var(--brand)]" />
              <span>Interactive ROI & Financial Impact</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Calculate how much you save every month.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
              Compare your current human telecalling desk against a dedicated 24/7 AI employee that never sleeps, never takes Sunday off, and responds in 1.2 seconds.
            </p>

            {/* Quick Industry Presets */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-muted)] mr-1 font-bold">Quick Presets:</span>
              {roiPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInquiriesPerDay(preset.inquiries)
                    setTelecallerCount(preset.staff)
                    setSalaryPerCaller(preset.salary)
                    setActivePresetIndex(idx)
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    activePresetIndex === idx
                      ? "bg-[var(--brand)] text-[#F6F1E7] shadow-sm"
                      : "bg-[var(--surface)] text-[var(--ink)] border border-[var(--line)] hover:border-[var(--brand)]/40 hover:bg-white"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto items-stretch">
            {/* Left Card: Interactive Sliders & Controls */}
            <div className="lg:col-span-7 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-9 shadow-xs flex flex-col justify-between">
              <div className="space-y-8">
                {/* Control 1: Daily Customer Inquiries */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm sm:text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-[var(--brand)]" />
                      <span>Daily Customer Inquiries / Leads</span>
                    </label>
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-3 py-1 rounded-lg">
                      {inquiriesPerDay} inquiries / day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="250"
                    step="5"
                    value={inquiriesPerDay}
                    onChange={(e) => {
                      setInquiriesPerDay(Number(e.target.value))
                      setActivePresetIndex(null)
                    }}
                    className="w-full h-2.5 bg-[var(--surface-alt)] rounded-lg appearance-none cursor-pointer accent-[var(--brand)]"
                  />
                  <div className="flex justify-between text-xs font-mono text-[var(--ink-muted)] mt-1.5">
                    <span>15 inquiries</span>
                    <span>120 inquiries</span>
                    <span>250+ inquiries</span>
                  </div>
                </div>

                {/* Control 2: Number of Human Telecallers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm sm:text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <Users className="h-4 w-4 text-[var(--brand)]" />
                      <span>Telecallers / Staff Currently Hired</span>
                    </label>
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-3 py-1 rounded-lg">
                      {telecallerCount} {telecallerCount === 1 ? "staff" : "telecallers"}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setTelecallerCount(num)
                          setActivePresetIndex(null)
                        }}
                        className={`py-2 rounded-xl text-sm font-bold transition-all ${
                          telecallerCount === num
                            ? "bg-[var(--brand)] text-[#F6F1E7] shadow-sm"
                            : "bg-[var(--surface-alt)] text-[var(--ink)] border border-[var(--line)] hover:bg-white"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Control 3: Average Monthly Salary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm sm:text-base font-bold text-[var(--ink)] flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[var(--brand)]" />
                      <span>Monthly Salary per Telecaller</span>
                    </label>
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-3 py-1 rounded-lg">
                      ₹{salaryPerCaller.toLocaleString("en-IN")} / mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="12000"
                    max="35000"
                    step="1000"
                    value={salaryPerCaller}
                    onChange={(e) => {
                      setSalaryPerCaller(Number(e.target.value))
                      setActivePresetIndex(null)
                    }}
                    className="w-full h-2.5 bg-[var(--surface-alt)] rounded-lg appearance-none cursor-pointer accent-[var(--brand)]"
                  />
                  <div className="flex justify-between text-xs font-mono text-[var(--ink-muted)] mt-1.5">
                    <span>₹12,000/mo</span>
                    <span>₹22,000/mo</span>
                    <span>₹35,000/mo</span>
                  </div>
                </div>
              </div>

              {/* Current Cost Summary Strip */}
              <div className="mt-8 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <span className="text-[var(--ink-muted)] font-medium">
                  Current Human Telecaller Payroll:
                </span>
                <span className="font-mono text-base font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
                  ₹{monthlyHumanPayroll.toLocaleString("en-IN")} / month
                </span>
              </div>
            </div>

            {/* Right Card: Dynamic Output & Savings Bento in Forest Green */}
            <div className="lg:col-span-5 rounded-3xl border border-[var(--brand)] bg-[var(--brand)] text-[#F6F1E7] p-7 sm:p-9 shadow-xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Projected Return on Investment
                  </span>
                  <span className="rounded-full bg-[var(--brand-surface)] border border-emerald-500/30 px-3 py-0.5 text-xs font-mono text-emerald-200 font-bold">
                    Save {savingsPercentage}%
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-xs sm:text-sm font-mono text-emerald-200 block mb-1">
                    Your Net Annual Cost Savings:
                  </span>
                  <div className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F6F1E7]">
                    ₹{annualSavings.toLocaleString("en-IN")}
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 font-mono">
                    (₹{monthlySavings.toLocaleString("en-IN")} saved every month compared to human staff)
                  </p>
                </div>

                {/* Breakdown Tiles */}
                <div className="space-y-3 pt-6 border-t border-white/10 text-sm">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-emerald-100">Human Desk Payroll:</span>
                    <span className="font-mono text-rose-300 font-bold line-through">₹{monthlyHumanPayroll.toLocaleString("en-IN")}/mo</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/10 border border-emerald-400/30">
                    <span className="text-white font-semibold">VOX AI Employee Retainer:</span>
                    <span className="font-mono text-emerald-300 font-bold">₹{monthlyVoxCost.toLocaleString("en-IN")}/mo</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-xs sm:text-sm leading-relaxed text-emerald-100">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
                      <Sparkles className="h-4 w-4" />
                      <span>+{afterHoursLeadsCaptured} After-Hours Leads Captured / Mo</span>
                    </div>
                    <p className="text-emerald-200/80">
                      ~38% of inquiries arrive past 7 PM or on Sundays. While human desks miss these, VOX AI answers in 1.2s and books the order.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                <a
                  href={`https://wa.me/917015551637?text=${encodeURIComponent(
                    `Hello! I calculated that VOX AI will save my business ₹${annualSavings.toLocaleString("en-IN")} per year. I have ${telecallerCount} staff and ${inquiriesPerDay} daily leads. Let's discuss deploying an AI Employee.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-4 text-sm sm:text-base font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Claim ₹{monthlySavings.toLocaleString("en-IN")}/mo Savings on WhatsApp</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 7. Head-to-Head Comparison: AI vs. Telecallers ─────────────────── */}
      <section id="comparison" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <Scale className="h-4 w-4 text-[var(--brand)]" />
              <span>Head-to-Head Comparison</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Why Indian businesses are replacing telecaller desks.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
              Managing human callers means dealing with hiring, training, leaves, and missed night inquiries. Here is how a dedicated AI Employee changes the game.
            </p>
          </div>

          {/* Comparison Matrix Table */}
          <div className="max-w-5xl mx-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[var(--surface-alt)] border-b border-[var(--line)] p-4 sm:p-6 text-xs sm:text-sm font-bold text-[var(--ink)]">
              <div className="col-span-12 sm:col-span-4 font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2 sm:mb-0">
                Operational Factor
              </div>
              <div className="col-span-6 sm:col-span-4 text-left text-rose-900 font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>Human Telecallers</span>
              </div>
              <div className="col-span-6 sm:col-span-4 text-left text-[var(--brand)] font-mono uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="font-bold">VOX AI Employee</span>
                </div>
                <span className="hidden md:inline-block rounded-full bg-[var(--brand-soft)] px-2.5 py-0.5 text-[11px] text-[var(--brand-soft-text)] font-bold">
                  Recommended
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[var(--line)]">
              {comparisonRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 p-4 sm:p-6 items-center hover:bg-[var(--surface-alt)]/40 transition-colors gap-3 sm:gap-4"
                >
                  <div className="col-span-12 sm:col-span-4 font-bold text-sm sm:text-base text-[var(--ink)]">
                    {row.feature}
                  </div>

                  <div className="col-span-12 sm:col-span-4 text-xs sm:text-sm text-[var(--ink-muted)] flex items-start gap-2 bg-rose-50/60 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-rose-100 sm:border-0">
                    <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
                    <span className="leading-relaxed">{row.human}</span>
                  </div>

                  <div className="col-span-12 sm:col-span-4 text-xs sm:text-sm text-[var(--ink)] font-semibold flex items-start gap-2 bg-emerald-50/70 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none border border-emerald-100 sm:border-0">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="leading-relaxed block">{row.vox}</span>
                      <span className="inline-block sm:hidden text-[11px] font-mono font-bold bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-2 py-0.5 rounded mt-1.5">
                        ✓ {row.voxBadge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Table Strip */}
            <div className="p-6 bg-[var(--surface-alt)] border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-semibold text-[var(--ink)]">
                  Ready to eliminate hiring headaches and scale customer response?
                </span>
              </div>
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3 text-xs sm:text-sm font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-all shadow-xs"
              >
                <span>Hire Your AI Employee (₹20,000 setup)</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. How We Build It (Stepper 01-04 Expanded) ─────────────────────── */}
      <section id="how-it-works" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <span>Engineering Process</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              How we build your custom AI Employee.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
              Not a generic template. We extract your proprietary business knowledge, calibrate voice and sales demeanor, configure strict safety guardrails, and hook directly into your phone and social channels.
            </p>
          </div>

          {/* Stepper with connecting line on desktop */}
          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-12 right-12 h-[1px] bg-[var(--line)] -z-0" />

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
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="font-serif text-5xl font-normal text-[var(--brand)] mb-3">
                      {st.step}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-[var(--ink)] mb-1">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-[var(--brand)] mb-3 font-semibold">
                      {st.sub}
                    </p>
                    <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed mb-5">
                      {st.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--line)] space-y-2">
                    {st.deliverables.map((d, di) => (
                      <div key={di} className="text-xs sm:text-sm text-[var(--ink)] flex items-center gap-2 font-medium">
                        <Check className="h-4 w-4 text-[var(--brand)] shrink-0" />
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <span>Transparent Commercials</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              A clear, two-part investment.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
              One custom implementation fee to build your digital employee from scratch, and a predictable monthly retainer to keep it learning, updating, and running 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: Implementation Card in White */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-11 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[var(--brand)] uppercase tracking-wider">
                    One-Time Implementation
                  </span>
                  <span className="rounded-full bg-[var(--brand-soft)] px-3.5 py-1 text-xs sm:text-sm font-mono text-[var(--brand-soft-text)] font-bold">
                    Full Build & Deploy
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-serif text-5xl sm:text-6xl font-bold text-[var(--ink)]">₹20,000</span>
                  <span className="text-[var(--ink-muted)] text-base font-mono">one-time setup</span>
                </div>

                <p className="text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed mb-6">
                  Complete custom engineering of your business AI Employee across Phone Calls, WhatsApp, Instagram, and Email. Dedicated solutions architect assigned to your account.
                </p>

                <div className="space-y-3.5 pt-6 border-t border-[var(--line)]">
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
                    <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-[var(--ink)]">
                      <Check className="h-4.5 w-4.5 text-[var(--brand)] shrink-0 mt-0.5" />
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--brand)] py-4 text-sm sm:text-base font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-all shadow-sm"
                >
                  <span>Build Your AI Employee (₹20,000)</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Card 2: Monthly Retainer in Deep Forest Green */}
            <div className="rounded-3xl border border-[var(--brand)] bg-[var(--brand)] text-[#F6F1E7] p-8 sm:p-11 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Monthly Support & Retainer
                  </span>
                  <span className="rounded-full bg-[var(--brand-surface)] border border-emerald-500/30 px-3.5 py-1 text-xs sm:text-sm font-mono text-emerald-200 font-bold">
                    Continuous Upkeep
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-2">
                  <span className="font-serif text-5xl sm:text-6xl font-bold text-[#F6F1E7]">₹5,000</span>
                  <span className="text-emerald-200/90 text-base font-mono">per month · pause anytime</span>
                </div>

                <p className="text-sm sm:text-base text-[#F6F1E7]/90 leading-relaxed mb-6">
                  24/7 uptime monitoring, continuous prompt optimization, model retraining, and technical maintenance so your employee never breaks or goes offline.
                </p>

                <div className="space-y-3.5 pt-6 border-t border-white/10">
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
                    <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-[#F6F1E7]">
                      <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-4 text-sm sm:text-base font-bold text-white shadow-md transition-all"
                >
                  <span>Lock In Retainer (₹5,000/mo)</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Detailed Pass-Through Transparency Callout */}
          <div className="mt-12 max-w-4xl mx-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7 shadow-xs text-sm text-[var(--ink-muted)]">
            <div className="flex items-center gap-2.5 mb-2">
              <ShieldCheck className="h-5 w-5 text-[var(--brand)]" />
              <strong className="text-base font-bold text-[var(--ink)]">100% Direct Pass-Through Transparency: Zero Markup on Platform Usage</strong>
            </div>
            <p className="leading-relaxed text-sm sm:text-base">
              Unlike traditional marketing agencies that add 300% markups on third-party software, Vox AI charges zero markup on platform costs. You pay actual provider fees directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-5 pt-4 border-t border-[var(--line)] font-mono text-xs sm:text-sm">
              <div>
                <span className="font-bold text-[var(--ink)] block text-sm">Meta WhatsApp API</span>
                <span className="text-[var(--ink-muted)]">~₹0.70 to ₹0.85 per 24-hour service conversation directly to Meta</span>
              </div>
              <div>
                <span className="font-bold text-[var(--ink)] block text-sm">Telephony Minutes</span>
                <span className="text-[var(--ink-muted)]">Actual telecom SIP trunk rates (~₹0.50/min for domestic Indian calls)</span>
              </div>
              <div>
                <span className="font-bold text-[var(--ink)] block text-sm">AI Model Tokens</span>
                <span className="text-[var(--ink-muted)]">Billed directly by OpenAI / Gemini at actual token consumption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. Frequently Asked Questions (FAQ Accordion) ─────────────────── */}
      <section id="faq" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-1.5 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-3">
              <HelpCircle className="h-4 w-4 text-[var(--brand)]" />
              <span>Questions & Doubts Answered</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Frequently asked questions.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed">
              No hidden clauses, no lock-in traps. Direct answers to the most common questions from Indian business owners.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] transition-all duration-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-6 sm:p-7 text-left gap-4 hover:bg-[var(--surface-alt)]/30 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-[var(--ink)] pr-2">
                      {item.q}
                    </span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--brand)] transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-[var(--brand-soft)]" : ""
                      }`}
                    >
                      <ChevronDown className="h-4.5 w-4.5" />
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-1 text-sm sm:text-base text-[var(--ink-muted)] leading-relaxed border-t border-[var(--line)]/50">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>

          {/* Additional Question Support Box */}
          <div className="mt-12 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-8 text-center shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--ink)] mb-2">
              Have a custom business question or special workflow requirement?
            </h3>
            <p className="text-sm sm:text-base text-[var(--ink-muted)] max-w-xl mx-auto mb-6">
              Our engineering team is ready to discuss your specific ERP, CRM, phone forwarding setup, or product catalog structure.
            </p>
            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3.5 text-sm font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-all shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Ask Our Engineers on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 10. Final CTA (Full-Width Forest-Green Block) ──────────────────── */}
      <section className="relative bg-[var(--brand)] text-[#F6F1E7] py-20 md:py-28 overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-emerald-300 font-bold">
            Next Step — Initiate Your AI Build
          </span>
          <h2 className="font-serif mt-4 text-3xl sm:text-6xl font-normal text-[#F6F1E7] tracking-tight">
            Ready to hire your first AI Employee?
          </h2>
          <p className="mt-5 text-lg sm:text-xl text-[#F6F1E7]/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop letting after-hours leads go cold. Deploy a dedicated AI employee trained on your products, answering on Instagram, WhatsApp, Email, and Calls in seconds.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-mono text-emerald-200">
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
              className="inline-flex items-center gap-2.5 rounded-xl bg-[var(--accent)] px-8 py-4.5 text-base sm:text-lg font-bold text-white shadow-lg hover:bg-[var(--accent-hover)] transition-all hover:scale-105 active:scale-95"
            >
              <span>Deploy AI Employee on WhatsApp</span>
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href={CALL_CTA}
              className="inline-flex items-center gap-2.5 rounded-xl border border-[#F6F1E7]/30 bg-white/5 px-7 py-4.5 text-base sm:text-lg font-bold text-[#F6F1E7] hover:bg-white/10 transition-colors"
            >
              <PhoneCall className="h-5 w-5 text-emerald-300" />
              <span>Call Voice AI: {CALL_NUMBER}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 9. Footer (Organized Columns, Muted Ink on Cream) ──────────────── */}
      <footer className="border-t border-[var(--line)] bg-[#EFE8DA] pt-16 pb-12 text-sm text-[var(--ink-muted)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Official Contact Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-12 border-b border-[var(--line)]">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2 font-bold">WEBSITE</span>
              <a
                href={`https://${WEBSITE_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {WEBSITE_URL}
              </a>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2 font-bold">DIRECT EMAIL</span>
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {EMAIL_ADDRESS}
              </a>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2 font-bold">PHONE CALLS</span>
              <a
                href={CALL_CTA}
                className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {CALL_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2 font-bold">WHATSAPP</span>
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {WHATSAPP_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2 font-bold">HEADQUARTERS</span>
              <span className="font-semibold text-sm text-[var(--ink)] block">
                {LOCATION}
              </span>
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2 font-bold">INSTAGRAM</span>
              <a
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sm text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                @{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <p>© {new Date().getFullYear()} Vox AI Agents. Custom AI Solutions for Business. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy.html" className="hover:text-[var(--ink)] transition-colors">
                Privacy Policy
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="font-bold text-[var(--brand)] hover:underline flex items-center gap-1.5 transition-colors"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span>{user ? "Client Dashboard" : "Client Portal / Login"}</span>
              </Link>
              <span className="font-mono text-[var(--brand)] font-semibold">Autonomous Workforce Engine</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}