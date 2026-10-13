'use client'

import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Brain,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Cpu,
  Database,
  ExternalLink,
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
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sliders,
  Sparkles,
  Terminal,
  TrendingUp,
  Users,
  Volume2,
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

const WHATSAPP_CTA = `https://wa.me/917015551637?text=${encodeURIComponent("Hello Vox AI team! I want to deploy a custom AI Representative for my business.")}`
const CALL_CTA = "tel:+918708551637"
const CALENDLY_CTA = `https://wa.me/917015551637?text=${encodeURIComponent("Hi! I would like to schedule an AI System Discovery call.")}`

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
    const points = Array.from({ length: 48 }).map(() => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
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
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.22
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(a.x * w, a.y * h)
            ctx.lineTo(b.x * w, b.y * h)
            ctx.stroke()
          }
        }
      }

      for (const p of points) {
        ctx.fillStyle = "rgba(6, 182, 212, 0.5)"
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
  const [activeIndustry, setActiveIndustry] = useState(0)
  const [activeQueryIndex, setActiveQueryIndex] = useState(0)
  const [isQueryTyping, setIsQueryTyping] = useState(false)

  const handleQuerySelect = (index: number) => {
    setActiveQueryIndex(index)
    setIsQueryTyping(true)
    setTimeout(() => setIsQueryTyping(false), 300)
  }

  // ─── 4 Channels Data ───────────────────────────────────────────────────────
  const channelData = {
    voice: {
      name: "AI Voice Agent",
      badge: "SUB-450ms TELEPHONY",
      icon: PhoneCall,
      accent: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30",
      pill: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
      description:
        "Seamless inbound & outbound voice calling that sounds human. Continues conversations from chat, asks structured qualification questions, clarifies requirements, and instantly transfers high-intent buyers to your team.",
      highlights: [
        "Inbound receptionist & outbound follow-up calls",
        "Natural tone, pauses, human pacing & zero awkward delays",
        "Understands accents, pricing objections & timeline needs",
        "Direct warm-transfer to live human sales rep",
      ],
      sampleDialog: [
        { sender: "caller", text: "Hey, I saw your commercial automation package online. Do you do custom ERP integrations?" },
        { sender: "ai", text: "Yes, absolutely! We connect directly to your ERP, custom database, and CRM. What system is your team currently running?" },
        { sender: "caller", text: "We use SAP and manage about 2,500 inventory units across three warehouses." },
        { sender: "ai", text: "Got it. That fits our custom enterprise pipeline. Let me transfer you directly to our lead technical architect to review your schema." },
      ],
      stats: { latency: "380ms", sentiment: "High Intent", status: "Requirement Confirmed" },
    },
    whatsapp: {
      name: "WhatsApp Sales Agent",
      badge: "OFFICIAL META CLOUD API",
      icon: MessageSquare,
      accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30",
      pill: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      description:
        "Your 24/7 multilingual sales engine on WhatsApp. Answers inquiries the second they land, shares product catalogues, calculates custom quotes, and schedules meetings into your calendar.",
      highlights: [
        "Instant reply in customer's preferred language (English, Hindi, etc.)",
        "Grounded in product catalogues, inventory & approved pricing",
        "Sends PDFs, invoices, location maps & payment links",
        "Enrolls unresponsive leads into polite, non-spam drip nurturing",
      ],
      sampleDialog: [
        { sender: "user", text: "Hi, what are the pricing options for the 3-channel AI setup?" },
        { sender: "ai", text: "Hello! Our core system includes full WhatsApp, Instagram & Voice integration at ₹20,000 one-time setup and ₹5,000/mo retainer. How many daily inquiries do you typically receive?" },
        { sender: "user", text: "Around 40 to 60 leads daily from Instagram ads." },
        { sender: "ai", text: "Perfect. That will save your team ~4 hours every day. Would you like me to send our architectural specification PDF or book an onboarding call?" },
      ],
      stats: { responseTime: "0.8s", language: "Auto-detected", status: "Lead Scored: 9.6/10" },
    },
    instagram: {
      name: "Instagram AI Representative",
      badge: "DM & COMMENT CONVERTER",
      icon: Instagram,
      accent: "from-pink-500/20 to-purple-500/10 border-pink-500/30",
      pill: "bg-pink-500/10 text-pink-400 border-pink-500/30",
      description:
        "Turns passive Instagram engagement into qualified pipeline. Automatically responds to Reel comments, handles story mentions, and initiates conversational sales sequences right inside the DMs.",
      highlights: [
        "Instant trigger: Comment 'PRICE' on any Reel sends an immediate DM",
        "Story reply & DM conversation management 24/7",
        "Filters spam and tire-kickers from high-value buyer inquiries",
        "Captures verified phone numbers and syncs straight into CRM",
      ],
      sampleDialog: [
        { sender: "user", text: "Sent you a message from your latest Reel! Do you build these AI employees for real estate brokers?" },
        { sender: "ai", text: "We sure do! In real estate, our AI employee qualifies buyer budgets, locations, and schedules property site visits automatically. What city are you operating in?" },
        { sender: "user", text: "Gurgaon and Delhi NCR. We get 100+ DMs on weekends." },
        { sender: "ai", text: "We can deploy your real estate representative in 72 hours. What's the best WhatsApp number to send our case studies to?" },
      ],
      stats: { conversionRate: "+42%", handoffTime: "< 2 mins", status: "Phone Captured" },
    },
    email: {
      name: "Executive Email AI",
      badge: "SMART INBOX & CRM ENGINE",
      icon: Mail,
      accent: "from-indigo-500/20 to-blue-500/10 border-indigo-500/30",
      pill: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
      description:
        "Autonomous email intelligence that triages inbound inquiries, synthesizes bespoke RFP responses based on approved documentation, and keeps long-cycle enterprise deals consistently warm.",
      highlights: [
        "Zero unread leads: Auto-triage and sentiment tagging",
        "Generates context-aware replies matching company executive tone",
        "Synchronizes every lead touchpoint with HubSpot / Google Sheets",
        "Re-engages dormant opportunities with contextual check-ins",
      ],
      sampleDialog: [
        { sender: "client", text: "Subject: Request for Proposal - AI Lead Pipeline for 12 Regional Clinics" },
        { sender: "ai", text: "Subject: Re: Vox AI Architecture for 12 Regional Clinics\n\nHi Dr. Sharma,\nThank you for reaching out. We have configured specialized patient triage and appointment booking workflows for medical networks. Attached is our architecture breakdown and data privacy compliance overview..." },
      ],
      stats: { triageSpeed: "1.2s", accuracy: "99.9%", status: "RFP Dispatched" },
    },
  }

  // ─── "Ask Your Sales Data" Queries ─────────────────────────────────────────
  const executiveQueries = [
    {
      query: "How many leads came from Instagram and WhatsApp this week?",
      answer:
        "Total 142 incoming inquiries this week: 86 from WhatsApp Ads, 41 from Instagram DMs/Reels, and 15 organic website calls. 64% have completed full qualification.",
      metrics: [
        { label: "Total Leads", val: "142" },
        { label: "Fully Qualified", val: "91 (64%)" },
        { label: "Avg First Response", val: "1.4 sec" },
      ],
      tag: "Weekly Growth Analysis",
    },
    {
      query: "Which leads are waiting for human sales handoff right now?",
      answer:
        "3 high-intent enterprise prospects confirmed their budgets and are awaiting your human closers: Rahul Verma (Manufacturing, ₹12L budget), Dr. Neha (Clinic Network, 4 locations), and Axis Infra (Commercial Realty).",
      metrics: [
        { label: "Ready to Close", val: "3 Leads" },
        { label: "Total Pipeline Value", val: "₹24,50,000" },
        { label: "Context Summary", val: "Attached in CRM" },
      ],
      tag: "Priority Handoffs",
    },
    {
      query: "Summarise today's voice calls and customer objections.",
      answer:
        "Completed 28 automated qualification calls today. Primary objection was whether telephony integrates with existing landline numbers (resolved: supported via SIP trunking). Average call duration: 2m 14s.",
      metrics: [
        { label: "Calls Completed", val: "28" },
        { label: "Positive Intent", val: "78%" },
        { label: "Transfer Rate", val: "11 to Humans" },
      ],
      tag: "Telephony Intelligence",
    },
    {
      query: "What are the most common customer requirements this month?",
      answer:
        "1. Instant price quoting without waiting for sales rep (62%)\n2. Weekend & after-hours lead response (49%)\n3. Automated calendar booking into Google Calendar (41%)",
      metrics: [
        { label: "Key Pattern", val: "After-Hours Inquiries" },
        { label: "Lost Leads Saved", val: "44 Leads" },
        { label: "Est. Revenue Saved", val: "₹8,80,000" },
      ],
      tag: "Market Demands",
    },
  ]

  // ─── 9 Core System Components (Proposal Page 16) ───────────────────────────
  const nineComponents = [
    {
      num: "01",
      title: "AI Chat Agent",
      desc: "Custom conversational AI trained and configured around your business knowledge, products, and policies.",
      icon: MessageSquare,
      badge: "Multilingual",
    },
    {
      num: "02",
      title: "Lead Qualification Engine",
      desc: "Customized qualification logic, scoring criteria, budget screening, and timeline validation.",
      icon: FilterIcon,
      badge: "Zero Tire-Kickers",
    },
    {
      num: "03",
      title: "AI Voice Agent",
      desc: "Automated inbound receptionist & outbound qualification calls with sub-450ms natural human cadence.",
      icon: PhoneCall,
      badge: "Real-time Audio",
    },
    {
      num: "04",
      title: "Human Handoff System",
      desc: "High-intent conversations seamlessly transferred to your human salespeople with full context already gathered.",
      icon: Users,
      badge: "Zero Dropoff",
    },
    {
      num: "05",
      title: "Automated Follow-Up",
      desc: "Structured multi-touch messaging and calling sequences for leads not ready to purchase on day one.",
      icon: RefreshCw,
      badge: "Non-Spam Cadence",
    },
    {
      num: "06",
      title: "Custom Business Dashboard",
      desc: "A business-specific command center for pipeline visibility, conversation transcripts, and conversion analytics.",
      icon: LayoutDashboard,
      badge: "Live Telemetry",
    },
    {
      num: "07",
      title: "AI Management Assistant",
      desc: "A natural-language intelligence layer inside your portal to query sales data, generate audits, and inspect operations.",
      icon: Terminal,
      badge: "Executive BI",
    },
    {
      num: "08",
      title: "Integrations & Automation",
      desc: "Direct bi-directional sync to WhatsApp, Instagram, Google Sheets, CRMs, Webhooks, and legacy databases.",
      icon: Network,
      badge: "Zero Silos",
    },
    {
      num: "09",
      title: "Monitoring & Maintenance",
      desc: "Continuous proactive monitoring, prompt engineering updates, edge-case troubleshooting, and support.",
      icon: ShieldCheck,
      badge: "Guaranteed Upkeep",
    },
  ]

  // ─── Industry Blueprints (Proposal Page 14) ────────────────────────────────
  const industries = [
    {
      name: "Real Estate",
      icon: Building2,
      subtitle: "Property Developers & Brokerages",
      flow: [
        { label: "Lead Entry", detail: "Instagram ad or portal inquiry for luxury villa / flat" },
        { label: "AI Qualification", detail: "Determines buyer budget, preferred sector, 2BHK/3BHK & financing status" },
        { label: "AI Voice Call", detail: "Calls lead to confirm site-visit slot & sends Google Maps location" },
        { label: "Handoff", detail: "Property sales advisor receives lead profile 10 mins before visit" },
      ],
      kpi: "3.8x More Site Visits Booked",
    },
    {
      name: "Manufacturing",
      icon: Server,
      subtitle: "B2B Producers & Distributors",
      flow: [
        { label: "Lead Entry", detail: "Inbound RFQ via website or WhatsApp catalogue inquiry" },
        { label: "AI Qualification", detail: "Extracts part specs, batch volume (MOQ), delivery timeline & export terms" },
        { label: "AI Follow-Up", detail: "Pings procurement officers when technical quotation is ready" },
        { label: "Handoff", detail: "Industrial sales engineering team takes over pricing negotiations" },
      ],
      kpi: "65% Reduction in Quoting Cycle",
    },
    {
      name: "Healthcare & Clinics",
      icon: HeartPulse,
      subtitle: "Dental, Aesthetic & Specialty Clinics",
      flow: [
        { label: "Lead Entry", detail: "Patient asks about treatment options, procedures & costs" },
        { label: "AI Qualification", detail: "Screens symptom urgency, previous records & doctor availability" },
        { label: "AI Confirmation", detail: "Instant calendar booking + automated pre-op instructions" },
        { label: "Handoff", detail: "Clinic front desk receives pre-filled patient intake sheet" },
      ],
      kpi: "Zero Missed After-Hours Inquiries",
    },
    {
      name: "Education & EdTech",
      icon: GraduationCap,
      subtitle: "Universities, Institutes & Coaching",
      flow: [
        { label: "Lead Entry", detail: "Student inquires about course curriculum and fees" },
        { label: "AI Qualification", detail: "Checks educational eligibility, batch timing & career goals" },
        { label: "AI Voice Call", detail: "Follows up on demo class registration and answers parent queries" },
        { label: "Handoff", detail: "Academic counselor receives warm call with parent profile" },
      ],
      kpi: "84% Demo Class Attendance",
    },
    {
      name: "Automotive",
      icon: Rocket,
      subtitle: "Dealerships & EV Showrooms",
      flow: [
        { label: "Lead Entry", detail: "Facebook / Instagram ad inquiry on new vehicle model" },
        { label: "AI Qualification", detail: "Identifies fuel preference, trade-in vehicle & downpayment budget" },
        { label: "AI Voice Call", detail: "Books weekend test drive and sends reminder on WhatsApp" },
        { label: "Handoff", detail: "Floor sales executive greets buyer with prepared vehicle key" },
      ],
      kpi: "45% Increase in Test Drive Conversions",
    },
    {
      name: "B2B Services",
      icon: CircuitBoard,
      subtitle: "Agencies, SaaS & Professional Firms",
      flow: [
        { label: "Lead Entry", detail: "High-ticket business owner seeks marketing or tech services" },
        { label: "AI Qualification", detail: "Screens annual revenue, current bottlenecks & decision timeframe" },
        { label: "AI Scheduling", detail: "Syncs with Google Calendar / Calendly for discovery call" },
        { label: "Handoff", detail: "Partner attends zoom call with fully populated briefing dossier" },
      ],
      kpi: "100% High-Intent Calendar Booking",
    },
  ]

  // ─── Before vs After (Proposal Page 13) ────────────────────────────────────
  const beforeSteps = [
    { text: "Lead enters through social ads or website", status: "neutral" },
    { text: "Sits unattended for hours waiting for someone to notice", status: "bad" },
    { text: "Delayed response: Prospect has already called a competitor", status: "bad" },
    { text: "Salesperson repeatedly types the same basic pricing FAQs", status: "bad" },
    { text: "Manual phone calls to tire-kickers who don't have budget", status: "bad" },
    { text: "Follow-ups forgotten; leads go completely cold", status: "bad" },
    { text: "Zero management visibility into what was said or lost", status: "bad" },
  ]

  const afterSteps = [
    { text: "Lead enters through Instagram, WhatsApp, Call, or Email", status: "good" },
    { text: "Instant AI response (< 2 seconds) in customer's preferred language", status: "good" },
    { text: "AI answers complex questions grounded in your approved business data", status: "good" },
    { text: "Automated qualification: confirms budget, timeline, and exact need", status: "good" },
    { text: "AI voice call seamlessly deepens the requirement", status: "good" },
    { text: "High-intent lead handed live to human closer with full summary", status: "good" },
    { text: "100% visibility in custom dashboard & conversational BI assistant", status: "good" },
  ]

  return (
    <div className="relative min-h-screen bg-[#030712] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden font-sans">
      {/* Background Cyber Glow Grids */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 h-[600px] w-[600px] rounded-full bg-cyan-600/15 blur-[160px]" />
        <div className="absolute bottom-10 left-1/3 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <NeuralSynapseField />

      {/* ─── Global Navbar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
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
                  SYSTEM v4.2
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wide">
                Custom Autonomous AI Business Employees
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-7 lg:flex text-sm font-medium text-slate-300">
            <a href="#overview" className="transition-colors hover:text-cyan-400">
              The AI Employee
            </a>
            <a href="#channels" className="transition-colors hover:text-cyan-400">
              Omnichannel
            </a>
            <a href="#intelligence" className="transition-colors hover:text-cyan-400">
              Ask AI (BI Layer)
            </a>
            <a href="#architecture" className="transition-colors hover:text-cyan-400">
              7-Step Journey
            </a>
            <a href="#modules" className="transition-colors hover:text-cyan-400">
              9 Modules
            </a>
            <a href="#industries" className="transition-colors hover:text-cyan-400">
              Industries
            </a>
            <a href="#pricing" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              Pricing
            </a>
          </nav>

          {/* Action Header CTAs */}
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href={user ? "/chats" : "/login"}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 hover:border-white/25"
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-cyan-400" />
              <span>{user ? "Client Portal" : "Client Login"}</span>
            </Link>

            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 via-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] hover:shadow-cyan-500/30"
            >
              <Zap className="h-3.5 w-3.5 text-yellow-300" />
              <span>Deploy AI System</span>
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
                  href="#overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  The AI Employee
                </a>
                <a
                  href="#channels"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  Omnichannel (Calls, WhatsApp, IG, Email)
                </a>
                <a
                  href="#intelligence"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  Ask Your Sales Data (BI)
                </a>
                <a
                  href="#architecture"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  7-Step Journey Flowchart
                </a>
                <a
                  href="#modules"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  9 System Modules
                </a>
                <a
                  href="#industries"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/5 hover:text-cyan-400"
                >
                  Industry Solutions
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 font-semibold text-cyan-400 hover:bg-white/5"
                >
                  Pricing & Commercials (₹20,000 Setup)
                </a>
                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={WHATSAPP_CTA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 py-2.5 text-xs font-semibold text-white"
                  >
                    <Zap className="h-4 w-4" /> Deploy Your AI Employee
                  </a>
                  <a
                    href={CALL_CTA}
                    className="flex items-center justify-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-semibold text-cyan-300"
                  >
                    <PhoneCall className="h-4 w-4" /> Call AI Voice Demo ({CALL_NUMBER})
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── Hero Section ──────────────────────────────────────────────────── */}
      <section id="overview" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            {/* Live Operational Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs text-cyan-300 backdrop-blur-md shadow-sm shadow-cyan-500/20"
            >
              <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span className="font-mono font-medium">AUTONOMOUS BUSINESS REPRESENTATIVE</span>
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              <span className="text-slate-400">INSTAGRAM · EMAIL · WHATSAPP · PHONE CALLS</span>
            </motion.div>

            {/* Master Proposition Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-display mt-6 max-w-5xl text-balance text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:leading-[1.1]"
            >
              From First Message to a{" "}
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
                Qualified Sales Conversation.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-3xl text-balance text-base text-slate-300 sm:text-xl font-light leading-relaxed"
            >
              We engineer <span className="text-white font-medium">custom AI Employees</span> that represent your business
              across Instagram, WhatsApp, Email, and Phone Calls — qualifying prospects, booking appointments, and
              reporting directly to you like an Executive Chief of Staff.
            </motion.p>

            {/* Action Bar */}
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
                <span>Build Your AI Employee</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href={CALL_CTA}
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-medium text-slate-200 backdrop-blur-md transition-all hover:bg-white/10 hover:border-cyan-500/40"
              >
                <PhoneCall className="h-4 w-4 text-cyan-400 animate-pulse" />
                <span>Call Voice AI Demo: <span className="font-mono text-cyan-300">{CALL_NUMBER}</span></span>
              </a>

              <a
                href="#channels"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-5 py-4 text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                <span>Live Interactive Demo</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </a>
            </motion.div>

            {/* Live Operational Telemetry Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 font-mono text-xs"
            >
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3.5 backdrop-blur-md">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Voice Latency</span>
                <span className="text-base font-semibold text-cyan-400">&lt; 380ms Sub-Second</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3.5 backdrop-blur-md">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Channel Synapse</span>
                <span className="text-base font-semibold text-emerald-400">4 Active Channels</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3.5 backdrop-blur-md">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Knowledge Truth</span>
                <span className="text-base font-semibold text-violet-400">99.8% Grounded</span>
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3.5 backdrop-blur-md">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Setup Guarantee</span>
                <span className="text-base font-semibold text-yellow-400">72-Hour Deployment</span>
              </div>
            </motion.div>
          </div>

          {/* ─── Hero Centerpiece: Omnichannel Cybernetic Terminal ─── */}
          <div className="mt-14 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-violet-600/30 to-blue-500/20 blur-xl opacity-70" />
            <div className="relative rounded-2xl border border-white/15 bg-slate-950/90 shadow-2xl backdrop-blur-2xl overflow-hidden">
              {/* Terminal Window Chrome */}
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-3 font-mono text-xs text-slate-400">
                    vox-rep-engine://central-cortex.sys
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs text-cyan-300">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE WORKFORCE ONLINE
                  </span>
                </div>
              </div>

              {/* Terminal Interactive Switcher */}
              <div className="grid grid-cols-2 md:grid-cols-4 border-b border-white/10 bg-slate-950/60 p-2 gap-2 text-xs">
                {(['voice', 'whatsapp', 'instagram', 'email'] as const).map((ch) => {
                  const data = channelData[ch]
                  const Icon = data.icon
                  const isActive = activeChannel === ch
                  return (
                    <button
                      key={ch}
                      onClick={() => setActiveChannel(ch)}
                      className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 font-medium transition-all ${
                        isActive
                          ? "bg-white/10 text-white shadow-sm border border-cyan-500/40"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-cyan-400" : "text-slate-500"}`} />
                      <span>{data.name}</span>
                    </button>
                  )
                })}
              </div>

              {/* Terminal Content Body */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: Channel Explanation */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-slate-300">
                      <span className="text-cyan-400 font-bold">MODE:</span>
                      <span>{channelData[activeChannel].badge}</span>
                    </div>

                    <h3 className="font-display text-2xl font-bold text-white">
                      {channelData[activeChannel].name}
                    </h3>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {channelData[activeChannel].description}
                    </p>

                    <div className="space-y-2 pt-2">
                      {channelData[activeChannel].highlights.map((hl, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>

                    {activeChannel === 'voice' && (
                      <div className="pt-3">
                        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/30 p-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-colors shadow-md"
                              aria-label="Play sample"
                            >
                              {isPlayingAudio ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                            </button>
                            <div>
                              <div className="text-xs font-semibold text-white">Sample Live Voice Call</div>
                              <div className="text-[10px] text-cyan-300 font-mono">
                                {isPlayingAudio ? "Simulating audio stream..." : "Click to inspect cadence"}
                              </div>
                            </div>
                          </div>
                          {/* Animated Audio Oscilloscope */}
                          <div className="flex items-center gap-1 h-6">
                            {[40, 75, 95, 60, 85, 30, 90, 50, 80, 45, 70, 35].map((h, idx) => (
                              <span
                                key={idx}
                                className={`w-1 rounded-full bg-cyan-400 transition-all duration-150 ${
                                  isPlayingAudio ? "animate-pulse" : "opacity-40"
                                }`}
                                style={{ height: isPlayingAudio ? `${h}%` : "30%" }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Live Conversation Simulation Card */}
                  <div className="lg:col-span-7">
                    <div className="rounded-xl border border-white/10 bg-slate-900/90 p-5 shadow-inner">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-mono font-medium text-slate-300">
                            Channel Stream: {channelData[activeChannel].name}
                          </span>
                        </div>
                        <span className="rounded bg-white/5 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-white/10">
                          {Object.entries(channelData[activeChannel].stats)[0][0]}:{" "}
                          {Object.entries(channelData[activeChannel].stats)[0][1]}
                        </span>
                      </div>

                      {/* Conversation thread */}
                      <div className="space-y-3 font-sans">
                        {channelData[activeChannel].sampleDialog.map((msg, i) => {
                          const isAI = msg.sender === "ai"
                          return (
                            <div
                              key={i}
                              className={`flex ${isAI ? "justify-start" : "justify-end"}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                                  isAI
                                    ? "bg-slate-800 text-slate-100 border border-cyan-500/20 shadow-md"
                                    : "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md"
                                }`}
                              >
                                {isAI && (
                                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-semibold text-cyan-400 mb-1">
                                    <Bot className="h-3 w-3" /> VOX AI REPRESENTATIVE
                                  </div>
                                )}
                                <p className="whitespace-pre-line">{msg.text}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Status Telemetry Footer */}
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <Check className="h-3 w-3" /> Memory state preserved across channels
                        </span>
                        <span className="text-cyan-400">Ready for Human Handoff</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Philosophy & 4-Stage Evolution (Proposal Pages 2 & 4) ─────────── */}
      <section className="relative py-20 border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 font-mono">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>01 — WHO WE ARE & HOW WE THINK</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              We don't just build AI bots.
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
                We build AI-powered sales systems around your business.
              </span>
            </h2>
            <p className="mt-4 text-base text-slate-300 leading-relaxed">
              Vox AI Agents builds custom AI solutions for businesses. We do not simply provide a chatbot or a voice bot.
              We design and implement end-to-end, AI-powered business systems that handle repetitive sales and customer communication:
              qualifying leads, conducting conversations, following up with prospects, and handing high-intent prospects to your human team at the right moment.
            </p>
          </div>

          {/* 3 Core Pillars (Proposal Page 2) */}
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="font-mono text-xs font-semibold text-cyan-400 mb-2">01 — END-TO-END</div>
              <h3 className="text-xl font-bold text-white mb-2">From First Message to Closed Deal</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connects initial ad discovery, conversation qualification, instant telephony, calendar scheduling, human handover, and executive intelligence into one unbroken loop.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="font-mono text-xs font-semibold text-violet-400 mb-2">02 — CUSTOM-BUILT</div>
              <h3 className="text-xl font-bold text-white mb-2">Built Around Your Process, Not a Template</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Every system is shaped around your organization — products, service catalog, sales scripts, CRM schema, inventory, and qualification criteria.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="font-mono text-xs font-semibold text-emerald-400 mb-2">03 — HUMAN + AI</div>
              <h3 className="text-xl font-bold text-white mb-2">AI Handles Repetition, People Close</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Your AI employee absorbs the tiring, repetitive qualification work 24/7. Your human sales closers spend their valuable hours closing already-convinced buyers.
              </p>
            </div>
          </div>

          {/* 4-Stage Evolution Ladder (Proposal Page 4) */}
          <div className="mt-16 rounded-2xl border border-white/10 bg-slate-900/40 p-6 md:p-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">EVOLUTIONARY FRAMEWORK</span>
              <h3 className="font-display mt-2 text-2xl font-bold text-white">From Isolated AI Tools to AI Employees</h3>
              <p className="text-xs text-slate-400 mt-1">Individual AI tools are easy to find. A working sales system is what businesses actually need.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="font-mono text-[10px] text-slate-400">STAGE 01</span>
                <h4 className="font-bold text-white text-base mt-1">AI Tool</h4>
                <p className="text-xs text-slate-300 mt-2">A single isolated capability: a standalone chatbot, a voice bot, or a one-off script.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="font-mono text-[10px] text-slate-400">STAGE 02</span>
                <h4 className="font-bold text-white text-base mt-1">AI Agent</h4>
                <p className="text-xs text-slate-300 mt-2">Handles one defined task or customer conversation autonomously.</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="font-mono text-[10px] text-slate-400">STAGE 03</span>
                <h4 className="font-bold text-white text-base mt-1">AI Workflow</h4>
                <p className="text-xs text-slate-300 mt-2">Agents connected in sequence with rules, conditional logic, and handoffs.</p>
              </div>

              <div className="rounded-xl border border-cyan-500/50 bg-gradient-to-br from-cyan-950/60 to-violet-950/60 p-4 shadow-lg shadow-cyan-500/10 relative overflow-hidden">
                <div className="absolute top-2 right-2 rounded bg-cyan-500 px-1.5 py-0.5 text-[9px] font-bold text-slate-950">WHERE VOX WORKS</div>
                <span className="font-mono text-[10px] text-cyan-300">STAGE 04</span>
                <h4 className="font-bold text-white text-base mt-1">AI-Powered Business System</h4>
                <p className="text-xs text-slate-200 mt-2">Workflow, memory, omni-channel data, dashboard, and human collaboration built completely around your business.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Operational Problem (Proposal Page 3) ───────────────────────── */}
      <section className="relative py-20 border-t border-white/10 bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-950/30 px-3 py-1 text-xs text-rose-300 font-mono">
              <HelpCircle className="h-3.5 w-3.5 text-rose-400" />
              <span>02 — THE PROBLEM BUSINESSES FACE</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Where sales pipelines quietly lose momentum.
            </h2>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              Six operational gaps we see repeatedly between a lead arriving and a sale being made.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                num: "01",
                title: "Slow lead response",
                desc: "Leads wait for a salesperson to notice and reply. Interest fades while the enquiry sits unanswered in the inbox.",
              },
              {
                num: "02",
                title: "Repetitive questions",
                desc: "Salespeople repeatedly answer the same basic questions about products, availability, and pricing instead of selling.",
              },
              {
                num: "03",
                title: "Poor qualification",
                desc: "Sales teams spend valuable time on low-intent tire-kickers before establishing whether a real requirement exists.",
              },
              {
                num: "04",
                title: "Leads lost after first contact",
                desc: "Follow-up is inconsistent. Leads that are interested but not ready quietly go cold with no re-engagement.",
              },
              {
                num: "05",
                title: "No structured lead journey",
                desc: "Lead information is scattered across chats, calls, and spreadsheets, with no single connected view of each lead.",
              },
              {
                num: "06",
                title: "Limited management visibility",
                desc: "Business owners cannot see what is happening across large volumes of conversations and calls.",
              },
            ].map((prob, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 hover:border-rose-500/30 transition-colors"
              >
                <div className="font-mono text-sm font-bold text-rose-400 mb-2">{prob.num}</div>
                <h3 className="text-lg font-bold text-white mb-2">{prob.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{prob.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 text-center">
            <span className="font-mono text-xs font-semibold text-cyan-300 tracking-wide">
              ⚡ VOX AI AGENTS CONNECTS THESE FRAGMENTED ACTIVITIES INTO ONE AUTOMATED SALES WORKFLOW.
            </span>
          </div>
        </div>
      </section>

      {/* ─── Star Feature: "Ask Your Sales Data" (Proposal Page 11) ─────────── */}
      <section id="intelligence" className="relative py-24 border-t border-white/10 bg-gradient-to-b from-slate-950 to-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-950/40 px-3.5 py-1 text-xs text-violet-300 font-mono">
              <Terminal className="h-3.5 w-3.5 text-violet-400" />
              <span>10 — AI BUSINESS ASSISTANT & INTELLIGENCE LAYER</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Ask your sales data a question.
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              An AI assistant inside your management portal lets executives query lead and sales data in plain natural language.
              No complex dashboards — just ask what is going on.
            </p>
          </div>

          {/* Interactive Natural Language Query Terminal */}
          <div className="mt-12 mx-auto max-w-4xl">
            <div className="rounded-2xl border border-violet-500/30 bg-slate-950/90 shadow-2xl overflow-hidden backdrop-blur-2xl">
              {/* Terminal Header */}
              <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/90 px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-violet-500/80" />
                  <span className="font-mono text-xs text-slate-300">
                    vox-executive-debrief://query-engine
                  </span>
                </div>
                <span className="font-mono text-[11px] text-violet-400">
                  REAL-TIME SYNAPSE CONNECTED
                </span>
              </div>

              {/* Preset Clickable Executive Prompts */}
              <div className="border-b border-white/10 bg-slate-900/40 p-4">
                <div className="text-[11px] font-mono uppercase text-slate-400 mb-2">
                  Click a sample executive query:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {executiveQueries.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuerySelect(idx)}
                      className={`text-left rounded-xl p-3 text-xs transition-all border ${
                        activeQueryIndex === idx
                          ? "border-violet-500/60 bg-violet-950/40 text-white shadow-md"
                          : "border-white/5 bg-white/[0.02] text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-[10px] text-violet-400 font-semibold">{q.tag}</span>
                        {activeQueryIndex === idx && (
                          <span className="h-2 w-2 rounded-full bg-violet-400 animate-ping" />
                        )}
                      </div>
                      <p className="line-clamp-1 italic text-slate-200">“{q.query}”</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Answer Box */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Active Question Bar */}
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-3">
                  <Search className="h-4 w-4 text-violet-400 shrink-0" />
                  <span className="text-sm font-medium text-white italic">
                    “{executiveQueries[activeQueryIndex].query}”
                  </span>
                </div>

                {/* Synthesis Output */}
                <div className="rounded-xl border border-violet-500/20 bg-slate-900/50 p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-violet-400">
                    <Brain className="h-4 w-4" />
                    <span>EXECUTIVE SYNTHESIS & AUDIT REPORT</span>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {isQueryTyping ? "Querying unified vector storage and compiling data..." : executiveQueries[activeQueryIndex].answer}
                  </p>

                  {/* Dynamic KPI Badges */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/10">
                    {executiveQueries[activeQueryIndex].metrics.map((m, i) => (
                      <div key={i} className="rounded-lg bg-black/40 p-3 border border-white/5 text-center">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">{m.label}</span>
                        <span className="text-sm sm:text-base font-bold text-cyan-300 mt-1 block">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Pipeline Diagram Strip (Proposal Page 11 Diagram) */}
                <div className="rounded-xl border border-white/10 bg-slate-950 p-4 font-mono text-[11px] text-slate-400">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Connected Data Pipeline:</div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-center">
                    <span className="rounded bg-white/5 px-2.5 py-1 text-slate-300">Customer Chats</span>
                    <span className="text-violet-400">➔</span>
                    <span className="rounded bg-white/5 px-2.5 py-1 text-slate-300">Call Recordings</span>
                    <span className="text-violet-400">➔</span>
                    <span className="rounded bg-white/5 px-2.5 py-1 text-slate-300">Centralized Data Layer</span>
                    <span className="text-violet-400">➔</span>
                    <span className="rounded bg-violet-500/20 border border-violet-500/40 px-2.5 py-1 text-violet-300 font-semibold">
                      Management Insights
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Complete Lead-to-Sales Journey Flowchart (Proposal Page 5) ──────── */}
      <section id="architecture" className="relative py-24 border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-300 font-mono">
              <Workflow className="h-3.5 w-3.5 text-cyan-400" />
              <span>04 — COMPLETE LEAD-TO-SALES FLOWCHART</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              One connected workflow, from first message to closed sale.
            </h2>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              A high-intent lead reaches your salesperson as a live conversation, with all context already gathered.
            </p>
          </div>

          {/* Interactive Process Pipeline */}
          <div className="mt-14 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                {
                  step: "01",
                  title: "Lead Enters",
                  sub: "Meta Ads · Instagram · WhatsApp · Organic Website",
                  color: "border-cyan-500/30",
                },
                {
                  step: "02",
                  title: "Instant AI Response",
                  sub: "Replies in <2 sec in customer's preferred language",
                  color: "border-cyan-500/30",
                },
                {
                  step: "03",
                  title: "AI Qualification",
                  sub: "Consultation, budget, quantity, timeline discovery",
                  color: "border-cyan-500/30",
                },
                {
                  step: "04",
                  title: "AI Voice Call",
                  sub: "Continues journey on phone, confirms requirements",
                  color: "border-cyan-500/30",
                },
                {
                  step: "05",
                  title: "Detailed Qualification",
                  sub: "Intent confirmed, recorded in centralized database",
                  color: "border-violet-500/40",
                },
              ].map((st, i) => (
                <div key={i} className={`rounded-2xl border ${st.color} bg-slate-900/60 p-5 relative backdrop-blur-md`}>
                  <span className="font-mono text-xs font-bold text-cyan-400">STEP {st.step}</span>
                  <h3 className="text-base font-bold text-white mt-1">{st.title}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{st.sub}</p>
                </div>
              ))}
            </div>

            {/* Fork Paths: Qualified vs Not-Ready */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Path 1: Qualified High Intent */}
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 shadow-lg shadow-emerald-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 font-mono text-xs font-bold text-emerald-300">
                    QUALIFIED PATH (HIGH INTENT)
                  </span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>
                <h4 className="text-lg font-bold text-white">Live Transfer to Human Closer</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  A high-intent prospect reaches your salesperson as a live, warm conversation.
                  Your salesperson receives the stated requirement, answers already captured, qualification status, and summary of the call.
                </p>
                <div className="mt-4 rounded-xl bg-black/40 p-3 text-xs font-mono text-emerald-300 border border-emerald-500/20">
                  ⚡ Result: Salespeople spend 80% of their time closing instead of qualifying.
                </div>
              </div>

              {/* Path 2: Not-Ready Nurturing */}
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 shadow-lg shadow-amber-500/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                    NOT-READY PATH (AUTOMATED NURTURING)
                  </span>
                  <RefreshCw className="h-5 w-5 text-amber-400" />
                </div>
                <h4 className="text-lg font-bold text-white">Automated Follow-up Sequences</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Leads that need more time are parked, not lost. The system initiates structured WhatsApp follow-up messages and courteous check-in calls over 7 to 30 days until they are ready to purchase.
                </p>
                <div className="mt-4 rounded-xl bg-black/40 p-3 text-xs font-mono text-amber-300 border border-amber-500/20">
                  ⚡ Result: Zero lead leakage. Up to 40% of dormant leads re-activate.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9 Core System Components (Proposal Page 16) ─────────────────────── */}
      <section id="modules" className="relative py-24 border-t border-white/10 bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-300 font-mono">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>15 — WHAT YOU GET IN THE BUILD</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Nine components. One connected system.
            </h2>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              Everything required to run an autonomous sales operation without buying 10 disconnected subscriptions.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nineComponents.map((item, idx) => {
              const Icon = item.icon
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 hover:border-cyan-500/40 hover:bg-slate-900/80 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-bold text-slate-500 group-hover:text-cyan-400 transition-colors">
                      MODULE {item.num}
                    </span>
                    <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
                      {item.badge}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── Before vs After Comparison (Proposal Page 13) ───────────────────── */}
      <section className="relative py-24 border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 font-mono">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
              <span>12 — BEFORE VS AFTER</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The same lead. A completely different journey.
            </h2>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              See the direct difference between traditional sales friction and Vox AI autonomy.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Traditional Column */}
            <div className="rounded-2xl border border-rose-500/20 bg-rose-950/10 p-6 md:p-8">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-rose-400 uppercase tracking-wider mb-6">
                <X className="h-4 w-4" /> TRADITIONAL SALES PROCESS
              </div>
              <div className="space-y-4">
                {beforeSteps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono">
                      ✕
                    </span>
                    <span className="pt-0.5">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI-Powered Column */}
            <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-6 md:p-8 shadow-xl shadow-cyan-500/5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-6">
                <Check className="h-4 w-4 text-cyan-400" /> AI-POWERED BUSINESS SYSTEM
              </div>
              <div className="space-y-4">
                {afterSteps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs text-slate-200">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                      ✓
                    </span>
                    <span className="pt-0.5 font-medium">{s.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Industry Blueprints (Proposal Page 14) ──────────────────────────── */}
      <section id="industries" className="relative py-24 border-t border-white/10 bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs text-cyan-300 font-mono">
              <Building2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>13 — INDUSTRY BLUEPRINTS</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              One system. Configured for your exact industry.
            </h2>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              The qualification criteria, conversation logic, and handoff rules are customized for how your market operates.
            </p>
          </div>

          {/* Industry Tab Selector */}
          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {industries.map((ind, i) => {
              const Icon = ind.icon
              const isActive = activeIndustry === i
              return (
                <button
                  key={i}
                  onClick={() => setActiveIndustry(i)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{ind.name}</span>
                </button>
              )
            })}
          </div>

          {/* Active Industry Showcase Card */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-slate-900/70 p-6 md:p-8 max-w-4xl mx-auto backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-2">
              <div>
                <h3 className="text-xl font-bold text-white">{industries[activeIndustry].name} Pipeline</h3>
                <p className="text-xs text-cyan-300 font-mono">{industries[activeIndustry].subtitle}</p>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono font-semibold text-emerald-400">
                {industries[activeIndustry].kpi}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {industries[activeIndustry].flow.map((st, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-black/40 p-4">
                  <span className="font-mono text-[10px] text-cyan-400 font-bold block mb-1">STAGE 0{idx + 1}</span>
                  <div className="font-bold text-white text-sm mb-1">{st.label}</div>
                  <p className="text-xs text-slate-300 leading-relaxed">{st.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing & Commercials Section (Proposal Page 18, 19, 20) ───────── */}
      <section id="pricing" className="relative py-24 border-t border-white/10 bg-gradient-to-b from-slate-950 via-[#030712] to-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs text-emerald-300 font-mono">
              <Zap className="h-3.5 w-3.5 text-emerald-400" />
              <span>17 — PRICING & COMMERCIALS</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
              A clear, two-part investment.
            </h2>
            <p className="mt-4 text-base text-slate-300 sm:text-lg">
              A custom-built business automation system, implemented once and supported continuously.
            </p>
          </div>

          {/* Pricing Cards (Proposal Page 18) */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1: One-Time Setup */}
            <div className="relative rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    ONE-TIME IMPLEMENTATION
                  </span>
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/30 px-3 py-0.5 text-xs font-mono text-cyan-300">
                    TURNKEY DEPLOYMENT
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-5xl font-extrabold text-white">₹20,000</span>
                  <span className="text-slate-400 text-sm font-mono">one-time</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Covers the complete architecture, engineering, and deployment of your custom AI representative.
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {[
                    "Full discovery & engineering of your agreed system scope",
                    "Configuration of AI agents (Voice, WhatsApp, Instagram, Email)",
                    "Custom qualification logic, scoring criteria & objection handling",
                    "Design of your custom business management dashboard",
                    "Configuration of agreed integrations (CRM, Meta, APIs, Sheets)",
                    "Rigorous edge-case testing & production deployment",
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
                  <span>Book Initial Setup (₹20,000)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Card 2: Monthly Retainer */}
            <div className="relative rounded-3xl border border-violet-500/30 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-violet-400">
                    MONTHLY UPKEEP & OPTIMIZATION
                  </span>
                  <span className="rounded-full bg-violet-500/10 border border-violet-500/30 px-3 py-0.5 text-xs font-mono text-violet-300">
                    CONTINUOUS EVOLUTION
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-display text-5xl font-extrabold text-white">₹5,000</span>
                  <span className="text-slate-400 text-sm font-mono">per month</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Covers ongoing uptime support, technical monitoring, and prompt refinements of your live system.
                </p>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  {[
                    "Proactive system monitoring & uptime assurance",
                    "Ongoing troubleshooting & technical service support",
                    "Minor workflow adjustments & logic calibrations",
                    "Agent prompt engineering & knowledge base updates",
                    "Integration maintenance & API compatibility updates",
                    "Continuous conversion optimization where applicable",
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
                  <span>Lock In Retainer Support (₹5,000/mo)</span>
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Third-Party Costs & Transparency Breakdown (Proposal Page 19 & 20) */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl border border-white/10 bg-black/50 p-6 md:p-8">
            <h3 className="font-mono text-xs uppercase tracking-wider text-cyan-400 mb-2">
              18 — THIRD-PARTY & USAGE-BASED COSTS TRANSPARENCY
            </h3>
            <p className="text-xs text-slate-300 mb-6">
              External platforms carry their own usage fees depending on your volume, passed through directly with zero markup:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-[11px]">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                <span className="text-slate-400 block">WhatsApp / Meta</span>
                <span className="text-white font-bold mt-1 block">At Meta Rates</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                <span className="text-slate-400 block">Telephony / SIP</span>
                <span className="text-white font-bold mt-1 block">Per Min Call</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                <span className="text-slate-400 block">AI Model APIs</span>
                <span className="text-white font-bold mt-1 block">OpenAI / Gemini</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                <span className="text-slate-400 block">Cloud Hosting</span>
                <span className="text-white font-bold mt-1 block">Supabase / Vercel</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                <span className="text-slate-400 block">Third-Party SaaS</span>
                <span className="text-white font-bold mt-1 block">Client Owned</span>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-center">
                <span className="text-slate-400 block">Ad Spend</span>
                <span className="text-white font-bold mt-1 block">Client Direct</span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>
                  <strong>Predictable Commercials:</strong> Vox AI Agents charge is strictly ₹20,000 Setup + ₹5,000/mo. You retain 100% ownership of your customer data, keys, and phone numbers.
                </span>
              </div>
              <a
                href={CALENDLY_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20"
              >
                Discuss Commercials
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5-Step Implementation Journey (Proposal Page 15) ────────────────── */}
      <section className="relative py-24 border-t border-white/10 bg-[#030712]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400 font-mono">
              <Rocket className="h-3.5 w-3.5 text-cyan-400" />
              <span>14 — IMPLEMENTATION PROCESS</span>
            </div>
            <h2 className="font-display mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              A structured path from first meeting to live system.
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { num: "01", name: "Discover", desc: "Understand your business, products, customer journey, and existing sales process." },
              { num: "02", name: "Design", desc: "Map the exact customer conversation logic, qualification criteria, and automation architecture." },
              { num: "03", name: "Build", desc: "Develop and configure AI agents, workflows, API integrations, and the management dashboard." },
              { num: "04", name: "Test", desc: "Simulate edge-cases, audio latencies, qualification accuracy, and human handoff routing." },
              { num: "05", name: "Deploy & Support", desc: "Launch the live system and provide continuous maintenance, monitoring, and tuning." },
            ].map((p, idx) => (
              <div key={idx} className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                <span className="font-mono text-xs font-bold text-cyan-400">PHASE {p.num}</span>
                <h3 className="font-bold text-white text-base mt-1">{p.name}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Security & Data Trust (Proposal Page 21) ────────────────────────── */}
      <section className="relative py-16 border-t border-white/10 bg-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-cyan-400">
                  <Lock className="h-4 w-4" /> 20 — SECURITY, PRIVACY & DATA TRUST
                </div>
                <h3 className="font-display text-2xl font-bold text-white">Your Customer Data Stays Isolated & Private</h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Enterprise-grade encryption, authenticated API webhooks, role-based access control, and zero training of public models on your private customer interactions.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-xs text-slate-300">
                <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">✓ Strict Tenant Isolation</div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">✓ Token Authentication</div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">✓ Zero Public Training</div>
                <div className="rounded-lg bg-white/5 border border-white/10 p-2.5">✓ Audit Logs Retained</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Master Final CTA & Official Contact Footer (Proposal Page 23) ───── */}
      <footer className="relative border-t border-white/10 bg-[#02050c] pt-20 pb-12 overflow-hidden">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-cyan-600/10 blur-[180px]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Big CTA Banner */}
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-8 sm:p-14 text-center max-w-5xl mx-auto shadow-2xl backdrop-blur-xl">
            <span className="font-mono text-xs uppercase tracking-widest text-cyan-400 font-semibold">
              NEXT STEP — INITIATE IMPLEMENTATION
            </span>
            <h2 className="font-display mt-3 text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to build your AI sales system?
            </h2>
            <p className="mt-4 text-base text-slate-300 max-w-2xl mx-auto">
              Let’s turn your existing sales process into an intelligent, automated customer journey.
              Deploy your custom AI Employee across Calls, WhatsApp, Instagram, and Email.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-cyan-500/25 hover:scale-105 transition-transform"
              >
                <Zap className="h-4 w-4 text-yellow-300" />
                <span>Deploy AI System on WhatsApp</span>
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

          {/* Official Contact Matrix (Exact Data from Master Proposal Page 23) */}
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

          {/* Copyright and Signature */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 border-t border-white/5 pt-6 gap-4">
            <p>© {new Date().getFullYear()} Vox AI Agents. Custom AI Solutions for Business. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy.html" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link href="/login" className="hover:text-slate-400 transition-colors">Client Portal</Link>
              <span className="font-mono text-cyan-400">ENGINEERED FOR AUTONOMY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FilterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}