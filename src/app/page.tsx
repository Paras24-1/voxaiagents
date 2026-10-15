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
  ChevronRight,
  Clock,
  ExternalLink,
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
    category: "Luxury Real Estate",
    logo: "/clients/damac.png",
  },
  {
    name: "Innoveg",
    category: "Wholesale & Agritech",
    logo: "/clients/innoveg.jpeg",
  },
  {
    name: "Nelson Business School",
    category: "Executive Education",
    logo: "/clients/nelson-business-school.jpeg",
  },
  {
    name: "Osmo RO Care",
    category: "Water Purification Systems",
    logo: "/clients/osmo-ro-care.jpg",
  },
  {
    name: "Printevr",
    category: "Digital Print & Merch",
    logo: "/clients/printevr.jpeg",
  },
  {
    name: "SME Network",
    category: "Enterprise Advisory",
    logo: "/clients/sme.jpeg",
  },
]

export default function LandingPage() {
  const { user } = useOrg()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState<'voice' | 'whatsapp' | 'instagram' | 'email'>('voice')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioTranscriptIndex, setAudioTranscriptIndex] = useState(0)

  // ─── Executive Briefing Demo Queries ─────────────────────────────────────────
  const executivePrompts = [
    {
      id: "summary",
      label: "Today's Briefing",
      question: "Hey Nova, give me a complete debrief of today's business activity.",
      response: {
        headline: "Operational Debrief for Today",
        bullets: [
          "Phone Calls: 42 inbound/outbound calls handled autonomously. 9 booked for direct sales demo, 4 warm-transferred to human closers.",
          "WhatsApp: 114 prospective conversations active. Generated ₹5,80,000 in customized quotes with zero human manual intervention.",
          "Instagram: Auto-responded to 68 Reel comments, converted 23 direct DMs into verified phone numbers in CRM.",
          "Email: Cleaned incoming inbox, categorized 14 partner inquiries, and pre-drafted 3 enterprise RFP proposals for your 1-click approval.",
        ],
        kpis: [
          { label: "Leads Captured", val: "179" },
          { label: "Avg Response Time", val: "1.2 sec" },
          { label: "Qualified Pipeline", val: "₹18.4L" },
          { label: "Human Hours Saved", val: "7.5 hrs" },
        ],
        alert: "2 high-ticket prospects requested custom ERP API integration. Briefing dossiers prepared on your desk.",
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
        alert: "Full conversation summaries and audio call recordings are pre-loaded in your dashboard.",
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
        alert: "Zero robotic tone complaints. 92% of callers believed they were speaking to an in-office executive.",
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
        alert: "Zero lead leakage: Even night-time leads (11 PM - 4 AM) were fully qualified and booked.",
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
    { channel: "WHATSAPP", text: "Sent customized PDF quotation (₹4,20,000 value) to wholesale distributor", time: "42s ago" },
    { channel: "PHONE CALL", text: "Completed 2m 45s inbound qualification — meeting booked on Google Calendar", time: "18s ago" },
    { channel: "INSTAGRAM", text: "Auto-converted Reel comment into qualified WhatsApp lead (+91 98XXX)", time: "Just now" },
    { channel: "EMAIL", text: "Auto-triaged inbound enterprise RFP and generated executive draft for review", time: "1m ago" },
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

  // ─── Channels Bento Data ───────────────────────────────────────────────────
  const channelData = {
    voice: {
      name: "AI Voice Employee",
      tagline: "Ultra-realistic telephony with zero awkward delay",
      badge: "Sub-350ms Latency",
      stat: "99.4% human score",
      icon: PhoneCall,
      description:
        "Sounds like your highest-performing sales executive. Answers inbound phone calls within one ring, calls new leads within 45 seconds, understands interruptions and colloquial slang, and warm-transfers hot deals to your human team.",
      capabilities: [
        "Inbound receptionist & proactive outbound lead caller",
        "Sub-350ms response latency with natural pacing and breath",
        "Multilingual speech: English, Hindi, and regional inflections",
        "Direct warm-transfer to live human sales reps with full audio briefing",
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
      tagline: "Your 24/7 multilingual conversational closer",
      badge: "Official Meta Cloud API",
      stat: "100+ msg/sec capacity",
      icon: MessageSquare,
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
      tagline: "Turns Reel comments and DMs into paying customers",
      badge: "Direct Social Conversion",
      stat: "< 1.5s comment to DM",
      icon: Instagram,
      description:
        "Never miss a viral Reel spike. When followers comment on your Reels or reply to your Stories, your AI employee replies in milliseconds, opens a DM conversation, extracts their phone number, and syncs them to your CRM.",
      capabilities: [
        "Comment keyword trigger: Sends instant DM with pricing and links",
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
      tagline: "Inbox Zero, hyper-personalized triage and RFP drafting",
      badge: "Cognitive Inbox Partner",
      stat: "1.2s triage speed",
      icon: Mail,
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
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] paper-grain selection:bg-[var(--brand-soft)] selection:text-[var(--brand)] font-sans antialiased relative overflow-x-hidden">
      {/* ─── 1. Minimal Sticky Header ───────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[#F6F1E7]/90 dark:bg-[#0A1410]/90 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand)] text-[#F6F1E7] shadow-sm transition-transform group-hover:scale-105">
              <span className="font-serif text-xl font-bold tracking-tight">V</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-tight text-[var(--ink)] group-hover:text-[var(--brand)] transition-colors">
                  VOX AI
                </span>
                <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[11px] font-mono font-medium text-[var(--brand-soft-text)]">
                  AI Employee
                </span>
              </div>
              <p className="text-[11px] text-[var(--ink-muted)]">
                Custom business representatives for Indian SMBs
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links — Only 4 links as required */}
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
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1 text-xs text-[var(--ink-muted)] shadow-sm mb-6"
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

              {/* Subcopy */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="mt-6 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed max-w-xl font-normal"
              >
                We build dedicated AI employees that answer calls, WhatsApp, Instagram DMs, and email 24/7 for Indian wholesale, clinics, real estate, and services. It qualifies leads, sends customized quotes, and books revenue deals while you sleep.
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

              {/* Thin Row of Trust Stats */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="mt-12 pt-6 border-t border-[var(--line)] w-full max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-left"
              >
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">1.2s</div>
                  <div className="text-xs text-[var(--ink-muted)]">Avg response time</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">24/7</div>
                  <div className="text-xs text-[var(--ink-muted)]">Always answering</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">72 hours</div>
                  <div className="text-xs text-[var(--ink-muted)]">Live launch</div>
                </div>
                <div>
                  <div className="font-mono text-lg font-bold text-[var(--brand)]">4 channels</div>
                  <div className="text-xs text-[var(--ink-muted)]">Calls, WA, IG, Email</div>
                </div>
              </motion.div>
            </div>

            {/* Right Column: Realistic Phone Mockup (Above the fold product preview) */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Soft background aura */}
              <div className="absolute -inset-4 rounded-full bg-[var(--brand-soft)]/40 blur-3xl -z-10" />

              {/* Phone Frame */}
              <div className="relative w-full max-w-[340px] rounded-[38px] border-[7px] border-[#16211C] bg-[#ECE5DD] shadow-2xl overflow-hidden text-[var(--ink)]">
                {/* Speaker pill */}
                <div className="h-5 bg-[#16211C] flex items-center justify-center">
                  <div className="w-14 h-3 bg-[#0C120F] rounded-full" />
                </div>

                {/* WhatsApp Chat App Bar */}
                <div className="bg-[var(--brand)] text-[#F6F1E7] px-4 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-soft)] text-[var(--brand)] font-bold text-xs">
                      VA
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[var(--brand)]" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold leading-tight text-[#F6F1E7]">Vox AI Employee</div>
                      <div className="text-[10px] text-emerald-200">Online · Instant Reply</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-100">
                    <Phone className="h-4 w-4" />
                  </div>
                </div>

                {/* Chat Messages Canvas */}
                <div className="p-3.5 space-y-3 text-xs min-h-[380px] flex flex-col justify-end bg-[#ECE5DD] dark:bg-[#111C17]">
                  {/* Date badge */}
                  <div className="flex justify-center mb-1">
                    <span className="rounded-md bg-white/70 dark:bg-black/40 px-2 py-0.5 text-[10px] font-mono text-[var(--ink-muted)] shadow-xs">
                      Today
                    </span>
                  </div>

                  {/* Customer Question */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-[var(--surface)] p-3 text-[12px] leading-relaxed shadow-sm text-[var(--ink)]">
                      <p>Hi, we run a clinic with 4 doctors in Rohtak. Can your AI answer WhatsApp patient queries and book appointment slots?</p>
                      <div className="text-[10px] text-[var(--ink-faint)] text-right mt-1 font-mono">10:14 AM</div>
                    </div>
                  </div>

                  {/* AI Response in Mint Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[var(--brand-soft)] p-3 text-[12px] leading-relaxed shadow-sm text-[var(--brand-soft-text)]">
                      <p>Namaste! Yes, absolutely. We sync with your appointment calendar, triage patient inquiries in English and Hindi, and confirm doctor slots with instant WhatsApp reminders.</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-[var(--brand)] mt-1 font-mono">
                        <span>10:14 AM</span>
                        <CheckCheck className="h-3.5 w-3.5 text-sky-600" />
                      </div>
                    </div>
                  </div>

                  {/* Customer Followup */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-xs bg-[var(--surface)] p-3 text-[12px] leading-relaxed shadow-sm text-[var(--ink)]">
                      <p>That sounds ideal. What is the onboarding cost and turnaround time?</p>
                      <div className="text-[10px] text-[var(--ink-faint)] text-right mt-1 font-mono">10:15 AM</div>
                    </div>
                  </div>

                  {/* AI Pricing Quote in Mint Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-[var(--brand-soft)] p-3 text-[12px] leading-relaxed shadow-sm text-[var(--brand-soft-text)]">
                      <p>Setup is ₹20,000 one-time and ₹5,000/month retainer. We deploy your clinic employee in 72 hours. Shall I connect you to our setup team?</p>
                      <div className="flex items-center justify-end gap-1 text-[10px] text-[var(--brand)] mt-1 font-mono">
                        <span>10:15 AM</span>
                        <CheckCheck className="h-3.5 w-3.5 text-sky-600" />
                      </div>
                    </div>
                  </div>

                  {/* Typing Indicator */}
                  <div className="flex items-center gap-1.5 bg-[var(--surface)] w-fit px-3 py-2 rounded-2xl rounded-tl-xs shadow-xs text-[var(--ink-muted)]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)] animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] font-mono ml-1 text-[var(--ink-muted)]">AI typing...</span>
                  </div>
                </div>

                {/* Bottom home indicator */}
                <div className="h-4 bg-[#16211C] flex items-center justify-center">
                  <div className="w-24 h-1 bg-white/30 rounded-full" />
                </div>
              </div>

              {/* Floating Social Proof Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute -bottom-5 -left-4 sm:-left-8 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-xl z-20 max-w-[210px]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                    <TrendingUp className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-[11px] font-medium text-[var(--ink-muted)]">Live Metrics</span>
                </div>
                <div className="font-serif text-lg font-bold text-[var(--ink)]">₹5,80,000</div>
                <p className="text-[11px] text-[var(--ink-muted)]">Quotes generated today autonomously</p>
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
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-[var(--line)] p-1.5 shrink-0 overflow-hidden shadow-xs">
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
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 sm:py-3 sm:px-5 shadow-xs flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-[var(--brand)] text-[11px] tracking-wide uppercase">Live Activity</span>
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <Sparkles className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span>Founder Briefing Interface</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Ask your AI Employee anything.
            </h2>
            <p className="mt-3 text-base text-[var(--ink-muted)]">
              Click any executive question below to see how your AI Employee synthesizes real-time business telemetry across Calls, WhatsApp, Instagram, and Email.
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
                      className={`text-left rounded-xl p-3 text-xs transition-all border ${
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
                <div className="max-w-[85%] rounded-2xl bg-[var(--brand)] px-5 py-3 text-sm text-[#F6F1E7] shadow-sm">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-200 mb-1">
                    <Users className="h-3 w-3" /> YOU (BUSINESS OWNER)
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
                      Synthesized in 240ms
                    </span>
                  </div>

                  {/* Bullet points */}
                  <div className="space-y-2.5">
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

                  {/* 4 KPI Tiles in Bento Layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[var(--line)]">
                    {executivePrompts[activePromptIndex].response.kpis.map((kpi, idx) => (
                      <div key={idx} className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-3 text-center shadow-xs">
                        <span className="text-[10px] font-mono text-[var(--ink-muted)] block">{kpi.label}</span>
                        <span className="font-serif text-xl font-bold text-[var(--brand)] mt-1 block">{kpi.val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Priority Alert Box */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                    <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{executivePrompts[activePromptIndex].response.alert}</span>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex gap-2 text-xs font-mono">
                      <span className="rounded bg-[var(--surface)] px-2.5 py-1 text-[var(--ink-muted)] border border-[var(--line)]">Verified Data</span>
                      <span className="rounded bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-2.5 py-1 font-medium">Ready for Handoff</span>
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <span>Omnichannel Coverage</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              One unified AI brain. Four channels covered.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)]">
              Your AI Employee doesn’t live in an isolated silo. If a customer leaves a comment on Instagram, messages on WhatsApp, and calls on the phone, your AI remembers their entire history.
            </p>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Featured Card 1: AI Voice Employee (Wide Card with simulated call dialog) */}
            <div className="lg:col-span-7 rounded-3xl border border-[var(--line)] bg-[#EBF5EE] dark:bg-[#10221A] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
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
                  Ultra-realistic telephony with zero delay
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  Sounds like your highest-performing sales executive. Answers inbound phone calls within one ring, calls new leads within 45 seconds, understands Hindi & English seamlessly, and warm-transfers hot deals to your human team.
                </p>

                {/* Simulated Call Transcript as Chat Bubbles */}
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 space-y-2.5 text-xs">
                  <div className="text-[10px] font-mono text-[var(--ink-muted)] border-b border-[var(--line)] pb-1.5 flex items-center justify-between">
                    <span>Live Call Stream Simulation</span>
                    <span className="text-emerald-600 font-semibold">Active Inbound</span>
                  </div>
                  {channelData.voice.sampleDialog.map((msg, i) => {
                    const isAI = msg.sender === "ai"
                    return (
                      <div key={i} className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed ${
                            isAI
                              ? "bg-[var(--brand-soft)] text-[var(--brand-soft-text)] font-medium"
                              : "bg-[var(--surface-alt)] text-[var(--ink)]"
                          }`}
                        >
                          <div className="text-[9px] font-mono opacity-70 mb-0.5">
                            {isAI ? "VOX AI VOICE" : "CALLER"}
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--line)] flex items-center justify-between">
                <a
                  href={CALL_CTA}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--brand)] hover:underline"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Call Voice AI: {CALL_NUMBER}</span>
                </a>
                <span className="text-xs font-mono text-[var(--ink-muted)]">WebRTC + SIP Ready</span>
              </div>
            </div>

            {/* Card 2: WhatsApp AI Employee */}
            <div className="lg:col-span-5 rounded-3xl border border-[var(--line)] bg-[#E8F5EB] dark:bg-[#0E2018] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-700 text-white">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-emerald-100 text-emerald-900 px-3 py-1 text-xs font-mono font-medium">
                    Official Meta Cloud API
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  WhatsApp AI Employee
                </h3>
                <p className="text-xs font-mono font-semibold text-emerald-800 dark:text-emerald-300 mt-1">
                  Your 24/7 multilingual conversational closer
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  An autonomous salesperson on WhatsApp that never sleeps. Qualifies buyers, shares product catalogs, calculates customized estimates, sends PDF brochures, and schedules appointments right into your team's calendar.
                </p>

                <div className="mt-5 space-y-2">
                  {channelData.whatsapp.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:underline"
                >
                  <span>Deploy WhatsApp AI Closer</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Card 3: Instagram AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[#FDF2F0] dark:bg-[#201416] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-rose-100 text-rose-900 px-3 py-1 text-xs font-mono font-medium">
                    &lt; 1.5s Comment-to-DM
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  Instagram AI Employee
                </h3>
                <p className="text-xs font-mono font-semibold text-rose-800 dark:text-rose-300 mt-1">
                  Turns Reel comments & DMs into paying customers
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  Never miss a viral Reel spike. When followers comment on your Reels or reply to Stories, your AI employee replies in milliseconds, opens a DM conversation, extracts their phone number, and syncs them to your CRM.
                </p>

                <div className="mt-5 space-y-2">
                  {channelData.instagram.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-rose-600 shrink-0 mt-0.5" />
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300 hover:underline"
                >
                  <span>Connect Instagram Graph API</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Card 4: Executive Email AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[#F0F4F8] dark:bg-[#121A22] p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-700 text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-blue-100 text-blue-900 px-3 py-1 text-xs font-mono font-medium">
                    Inbox Zero · 1.2s Triage
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--ink)]">
                  Executive Email AI Employee
                </h3>
                <p className="text-xs font-mono font-semibold text-blue-800 dark:text-blue-300 mt-1">
                  Hyper-personalized triage & proposal drafting
                </p>
                <p className="text-sm text-[var(--ink-muted)] mt-3 leading-relaxed">
                  An executive email partner that reads incoming enterprise inquiries, categorizes opportunities, generates bespoke context-aware replies matching your company voice, and keeps high-value pipelines warm.
                </p>

                <div className="mt-5 space-y-2">
                  {channelData.email.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[var(--ink)]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
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
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-800 dark:text-blue-300 hover:underline"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <Headphones className="h-3.5 w-3.5 text-[var(--brand)]" />
              <span>Sub-350ms Voice Telephony Engine</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              Hear what your AI Employee sounds like.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)]">
              Indistinguishable from an experienced sales representative. Natural breathing, pauses, tone variation, and sub-350ms response latency so there are never awkward delays.
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
                    <span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-mono text-[var(--brand-soft-text)] font-semibold">
                      LIVE
                    </span>
                  </div>
                  <p className="text-xs text-[var(--ink-muted)] mt-1">
                    {isPlayingAudio ? "Speaking via Web Audio Synthesis..." : "Click play to listen to spoken speech sample"}
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

      {/* ─── 6. How We Build It (Stepper) ───────────────────────────────────── */}
      <section id="how-it-works" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <span>Engineering Process</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              How we build your custom AI Employee.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)]">
              Not a generic template. We extract your business DNA, train custom memory models, configure safety guardrails, and hook directly into your phone and social channels.
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
                  desc: "We ingest your product catalogs, past email threads, call recordings, website data, PDFs, and sales objection guides.",
                },
                {
                  step: "02",
                  title: "Voice & Persona Tuning",
                  desc: "We calibrate the exact tone, speaking cadence, vocabulary, and humor of your highest-performing in-house closer.",
                },
                {
                  step: "03",
                  title: "Safety & Logic Guardrails",
                  desc: "Strict enterprise boundaries: your AI never hallucinates, never makes up pricing, and strictly routes sensitive cases to humans.",
                },
                {
                  step: "04",
                  title: "Omnichannel Deployment",
                  desc: "Hooked into Meta Cloud WhatsApp, Instagram Graph API, SIP Telephony, and your CRM (Google Sheets, HubSpot, Supabase) in 72 hours.",
                },
              ].map((st, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-7 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="font-serif text-4xl font-normal text-[var(--brand)] mb-4">
                      {st.step}
                    </div>
                    <h3 className="text-base font-bold text-[var(--ink)] mb-2">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed">
                      {st.desc}
                    </p>
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
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--ink-muted)] font-medium mb-3">
              <span>Transparent Commercials</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[var(--ink)]">
              A clear, two-part investment.
            </h2>
            <p className="mt-4 text-base text-[var(--ink-muted)]">
              One custom implementation fee to build your digital employee, and a predictable monthly retainer to keep it learning and running 24/7.
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
                  <span className="text-[var(--ink-muted)] text-sm font-mono">one-time</span>
                </div>

                <p className="text-xs sm:text-sm text-[var(--ink-muted)] leading-relaxed mb-6">
                  Complete custom engineering of your business AI Employee across Phone Calls, WhatsApp, Instagram, and Email.
                </p>

                <div className="space-y-3 pt-6 border-t border-[var(--line)]">
                  {[
                    "Complete business discovery & knowledge extraction",
                    "Voice AI configuration with sub-350ms natural cadence",
                    "Official WhatsApp Cloud API & Instagram DM automation setup",
                    "Email inbox triage and auto-drafting integration",
                    "Custom qualification scoring & objection-handling playbook",
                    "Executive debrief portal to chat with your AI in natural language",
                    "End-to-end edge testing & 72-hour production launch",
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
                  <span className="text-emerald-200/80 text-sm font-mono">per month</span>
                </div>

                <p className="text-xs sm:text-sm text-[#F6F1E7]/80 leading-relaxed mb-6">
                  24/7 uptime monitoring, continuous prompt optimization, and technical maintenance so your employee never breaks.
                </p>

                <div className="space-y-3 pt-6 border-t border-white/10">
                  {[
                    "24/7 autonomous uptime monitoring & health checks",
                    "Continuous prompt engineering and response tuning",
                    "Monthly knowledge base updates (new products, price changes)",
                    "API compatibility upkeep (Meta, WhatsApp, telephony updates)",
                    "Minor workflow adjustments as your sales process evolves",
                    "Direct technical assistance & bug resolution",
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

          {/* Pass-Through Transparency Callout */}
          <div className="mt-10 max-w-4xl mx-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 text-center text-xs text-[var(--ink-muted)]">
            <strong className="text-[var(--brand)] mr-1">Direct Pass-Through Transparency:</strong>
            External charges (Meta WhatsApp conversation fees, Telephony SIP minute costs, and AI token API usage) are paid directly at actual platform rates with zero markup from Vox AI.
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
          <p className="mt-5 text-base sm:text-lg text-[#F6F1E7]/80 max-w-2xl mx-auto font-normal">
            Stop letting after-hours leads go cold. Deploy a dedicated AI employee trained on your products, answering on Instagram, WhatsApp, Email, and Calls in seconds.
          </p>

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
      <footer className="border-t border-[var(--line)] bg-[#EFE8DA] dark:bg-[#0A1410] pt-16 pb-12 text-xs text-[var(--ink-muted)]">
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