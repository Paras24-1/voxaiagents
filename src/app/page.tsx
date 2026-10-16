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

  // Real Inbound Call Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(170) // ~2m 50s total call duration

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

  // Real-time Chatbot state connected to /api/ask-ai (Gemini 3.5 Flash)
  const suggestedQueries = [
    {
      id: "q-pricing",
      label: "Pricing & Pass-Through",
      query: "What is your total setup cost and monthly retainer? Are there any hidden platform charges?",
    },
    {
      id: "q-sim",
      label: "Keep Existing SIM & Number",
      query: "Can I retain my existing SIM card, WhatsApp Business number, and personal phone?",
    },
    {
      id: "q-languages",
      label: "Hindi & Hinglish Fluency",
      query: "Does the voice AI employee speak natural conversational Hindi and Hinglish with zero robotic lag?",
    },
    {
      id: "q-summary",
      label: "Executive 4-Channel Briefing",
      query: "Give me an executive summary of today's inbound activity across Calls, WhatsApp, Instagram, and Email.",
    },
    {
      id: "q-booking",
      label: "Appointment Booking",
      query: "How does the AI employee book customer appointments and sync with Google Calendar / CRM?",
    },
    {
      id: "q-transfer",
      label: "Warm Transfer to Human",
      query: "What happens when a high-value customer asks to speak with a human executive?",
    },
  ]

  const [chatMessages, setChatMessages] = useState<Array<{
    id: string
    role: "user" | "assistant"
    headline?: string
    text: string
    time: string
    bullets?: string[]
    kpis?: Array<{ label: string; val: string }>
    alert?: string
  }>>([
    {
      id: "init-brief",
      role: "assistant",
      headline: "Executive Briefing: Multichannel Activity",
      text: "Namaste! I am Nova, your 24/7 autonomous AI Employee for VOX AI. I continuously qualify leads, calculate price quotations, and book appointments across Phone Calls, WhatsApp, Instagram, and Email. Here is your synthesized performance snapshot:",
      time: "Just now",
      bullets: [
        "Inbound Phone Calls: 42 calls handled with sub-350ms natural speech cadence; 31 customer queries answered autonomously.",
        "WhatsApp Business API: 98 chats responded to within 1.2s; 14 quotation PDFs delivered; 6 appointments locked.",
        "Instagram Graph API: 140 Reel keyword comments answered via instant DM; 54 verified mobile numbers captured.",
        "Deployment Guarantee: ₹20,000 setup + ₹5,000/mo flat retainer. 100% existing SIM retention. 72-hour launch.",
      ],
      kpis: [
        { label: "Leads Captured", val: "179 Leads" },
        { label: "Speech Cadence", val: "340ms" },
        { label: "SIM Retained", val: "100%" },
        { label: "Setup Cost", val: "₹20,000" },
      ],
      alert: "Powered by Gemini 3.5 Flash: Click any query chip below or type any custom question to test my real-time reasoning and response capabilities.",
    },
  ])

  const [activeChipIndex, setActiveChipIndex] = useState(0)
  const [customInput, setCustomInput] = useState("")
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)

  const askAiEmployee = async (queryText: string, chipIdx?: number) => {
    if (!queryText.trim() || isGeneratingResponse) return

    if (chipIdx !== undefined) {
      setActiveChipIndex(chipIdx)
    }

    const trimmed = queryText.trim()
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

    // Append user message immediately
    const userMsg = {
      id: "user-" + Date.now(),
      role: "user" as const,
      text: trimmed,
      time: nowTime,
    }

    setChatMessages((prev) => [...prev, userMsg])
    setCustomInput("")
    setIsGeneratingResponse(true)

    try {
      const history = chatMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.text,
      }))

      const res = await fetch("/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
      })

      const data = await res.json()
      const reply = data.reply || "I am here to assist. Could you please specify further details?"

      const aiMsg = {
        id: "ai-" + Date.now(),
        role: "assistant" as const,
        headline: "Nova AI Executive Response",
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        alert: "Verified Live Response · Powered by Gemini 3.5 Flash",
      }

      setChatMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error("Ask AI error:", err)
      setChatMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          role: "assistant" as const,
          headline: "Nova AI Executive Response",
          text: "VOX AI builds custom 24/7 AI Employees for Indian businesses at ₹20,000 one-time setup + ₹5,000/mo retainer. You keep your existing SIM and number. We launch in 72 hours with zero platform markup. How can I help you deploy today?",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ])
    } finally {
      setIsGeneratingResponse(false)
    }
  }

  // ─── Real Inbound AI Agent Call Recording & Interactive Moments ─────────────
  const callHighlights = [
    {
      time: 0,
      label: "0:00 - Greeting & Intent",
      stage: "Bilingual Welcome & Discovery",
      quote: "“Namaste, RERA Filing Karnataka mein aapka swagat hai, main Riya bol rahi hoon. Kaise madad kar sakti hoon aapki? ... Achha, agent registration! Pehle yeh bataiye aap individual capacity mein karenge ya company ke naam par?”",
    },
    {
      time: 38,
      label: "0:38 - Fee & Docs Breakdown",
      stage: "₹2 Lakh Govt Fee & Timelines",
      quote: "“Puneet Kumar ji, company ke naam ke liye har partner ya director ka Aadhaar, PAN, registration certificate, GST... Government fee ₹2,00,000 (5 saal valid), professional fee ₹10,000 + GST. Timeline 6 se 10 working days.”",
    },
    {
      time: 85,
      label: "1:25 - WhatsApp & Email Sync",
      stage: "Objection Handling & CRM Sync",
      quote: "“Individual mein govt fee ₹25,000 hai, company mein ₹2 Lakh. Kya aap comparison note karna chahte hain ya main WhatsApp par bhej doon? ... Ek baar email ID confirm kar lijiye: puneetkumar@gmail.com. Perfect!”",
    },
    {
      time: 130,
      label: "2:10 - Live Warm Transfer",
      stage: "Patch to Human Consultant",
      quote: "“Kya aap chahenge main abhi hamare consultant se connect kar doon? ... Ji bilkul ho sakta hai, ek second rukiye main aapko connect kar rahi hoon. (Please hold while I connect you to a human agent...)”",
    },
  ]

  const toggleVoicePlayback = () => {
    if (!audioRef.current) return
    if (isPlayingAudio) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    } else {
      audioRef.current.play().then(() => {
        setIsPlayingAudio(true)
      }).catch((err) => {
        console.error("Audio playback error:", err)
      })
    }
  }

  const handleSeek = (timeInSeconds: number) => {
    if (!audioRef.current) return
    audioRef.current.currentTime = timeInSeconds
    setAudioCurrentTime(timeInSeconds)
    if (!isPlayingAudio) {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(console.error)
    }
  }

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioDuration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newFraction = Math.max(0, Math.min(1, clickX / rect.width))
    handleSeek(newFraction * audioDuration)
  }

  const formatAudioTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const getActiveHighlight = () => {
    if (audioCurrentTime < 38) return callHighlights[0]
    if (audioCurrentTime < 85) return callHighlights[1]
    if (audioCurrentTime < 130) return callHighlights[2]
    return callHighlights[3]
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
    <div className="vox-landing-theme min-h-screen bg-[#F8F9FC] text-slate-900 selection:bg-slate-200 selection:text-slate-900 font-sans antialiased relative overflow-x-hidden text-[17px] sm:text-[18px]">
      {/* ─── Sarvam AI Sovereign Announcement Strip ─────────────────────────── */}
      <div className="border-b border-slate-200/80 bg-slate-950 text-white text-sm sm:text-base py-3 px-4 text-center flex items-center justify-center gap-2 font-medium">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 text-emerald-300 px-3 py-0.5 text-xs font-mono font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          SOVEREIGN AI
        </span>
        <span className="text-slate-200">
          Deploy India's First Autonomous Voice & WhatsApp AI Employee in 72 Hours
        </span>
        <a
          href={WHATSAPP_CTA}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 text-emerald-300 hover:text-white underline font-semibold ml-2 transition-colors"
        >
          <span>Launch Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* ─── 1. Minimal Sticky Header (Sarvam AI Glass Aesthetic) ──────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-colors">
        <div className="mx-auto flex h-20 max-w-[1380px] items-center justify-between px-6 sm:px-10 lg:px-12 gap-5">
          {/* Brand Logo — Clean, Sovereign & Confident */}
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-transform group-hover:scale-105">
              <span className="font-serif text-2xl font-bold tracking-tight">V</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-serif text-2xl font-bold tracking-tight text-slate-900 group-hover:text-black transition-colors whitespace-nowrap">
                VOX AI
              </span>
              <span className="hidden xl:inline-block rounded-full bg-slate-100 border border-slate-200 px-3 py-0.5 text-xs font-mono font-semibold text-slate-700">
                AI Employee
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-5 xl:gap-8 lg:flex text-base xl:text-[17px] font-semibold text-slate-600">
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              How it works
            </a>
            <a href="#channels" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Channels
            </a>
            <a href="#chat-with-ai" className="hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-1.5">
              <span>Ask AI</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </a>
            <a href="#roi-calculator" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Calculator
            </a>
            <a href="#comparison" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Comparison
            </a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-900 transition-colors whitespace-nowrap">
              FAQ
            </a>
          </nav>

          {/* Action Buttons — Sarvam Signature Pill Buttons */}
          <div className="hidden items-center gap-3 sm:flex shrink-0">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm xl:text-base font-semibold text-slate-800 shadow-xs transition-all hover:bg-slate-50 hover:border-slate-400 group whitespace-nowrap"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <LayoutDashboard className="h-4 w-4 text-slate-700 group-hover:text-slate-900 transition-colors" />
              <span>{user ? "Dashboard" : "Client Portal"}</span>
            </Link>

            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2.5 text-sm xl:text-base font-semibold text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              <span>Deploy AI Employee</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </a>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 lg:hidden shadow-xs"
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
              className="border-b border-slate-200 bg-white px-5 pt-4 pb-6 shadow-xl lg:hidden"
            >
              <div className="flex flex-col space-y-3 text-base font-semibold text-slate-900">
                <a
                  href="#how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50"
                >
                  How it works
                </a>
                <a
                  href="#channels"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50"
                >
                  Channels (Calls, WhatsApp, Instagram, Email)
                </a>
                <a
                  href="#chat-with-ai"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50 text-emerald-700 font-bold"
                >
                  Ask AI Employee (Gemini Live)
                </a>
                <a
                  href="#roi-calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50 flex items-center justify-between"
                >
                  <span>ROI & Cost Calculator</span>
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">Save 80%+</span>
                </a>
                <a
                  href="#comparison"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50"
                >
                  AI Employee vs. Telecallers
                </a>
                <a
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50"
                >
                  Pricing (₹20,000 setup)
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 hover:bg-slate-50"
                >
                  Frequently Asked Questions
                </a>
                <div className="pt-2 flex flex-col gap-2.5">
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white py-3 text-sm font-bold text-slate-900 shadow-xs hover:bg-slate-50 transition-all"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <LayoutDashboard className="h-4 w-4" />
                    <span>{user ? "Open Dashboard" : "Client Portal / Login"}</span>
                  </Link>
                  <a
                    href={WHATSAPP_CTA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-slate-900 py-3.5 text-sm font-bold text-white shadow-sm"
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

      {/* ─── 2. Hero Section (Sarvam AI Centered Sovereign Layout) ───────────── */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12 text-center">
          {/* Centered Sovereign Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200/90 bg-white/90 backdrop-blur-md px-5 py-2 text-sm sm:text-base text-slate-700 shadow-xs mb-8">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-900">Frontier Voice & WhatsApp AI</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 font-mono text-xs sm:text-sm">Sub-350ms Indian Cadence</span>
          </div>

          {/* Sarvam Sovereign Display Headline */}
          <h1 className="font-serif text-[46px] sm:text-7xl lg:text-[86px] leading-[1.05] tracking-[-0.025em] font-normal text-slate-900 max-w-6xl mx-auto text-balance">
            Your business, <em className="italic font-normal text-slate-900 underline decoration-slate-300 underline-offset-8">cloned</em> into an autonomous AI employee.
          </h1>

          {/* Clear, Understandable Subcopy */}
          <p className="mt-8 text-lg sm:text-2xl text-slate-600 leading-relaxed max-w-4xl mx-auto font-normal">
            We build a custom AI employee that answers your phone calls, WhatsApp messages, Instagram DMs, and emails 24/7. Trained on your exact catalog prices and business rules to qualify buyers, generate quotations, and close sales while you sleep. Keep your existing phone number with zero platform markup.
          </p>

          {/* Sarvam Signature Action Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3.5 sm:gap-5">
            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="sarvam-btn-primary shadow-sm"
            >
              <span>Deploy Your AI Employee (72h Guarantee)</span>
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href="#voice-audio"
              className="sarvam-btn-secondary"
            >
              <Headphones className="h-5 w-5 text-slate-700" />
              <span>Hear Real Voice Demo (2m 50s)</span>
            </a>

            <a
              href="#chat-with-ai"
              className="sarvam-btn-secondary"
            >
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <span>Ask Nova AI Anything</span>
            </a>
          </div>

          <div className="mt-5">
            <a
              href={CALL_CTA}
              className="text-sm sm:text-base text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-2 font-medium"
            >
              <PhoneCall className="h-4 w-4 text-slate-700" />
              <span>or call live demo line: <strong className="font-bold text-slate-800">{CALL_NUMBER}</strong></span>
            </a>
          </div>

          {/* Sarvam Trust Metrics Strip — Expanded & Balanced */}
          <div className="mt-16 max-w-6xl lg:max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 sm:p-8 rounded-3xl border border-slate-200/90 bg-white/90 backdrop-blur-md shadow-sm">
            <div className="text-center px-4 py-2 border-r border-slate-100 last:border-none">
              <div className="font-mono text-3xl sm:text-5xl font-black text-slate-900">&lt;350ms</div>
              <div className="text-sm sm:text-base text-slate-600 font-semibold mt-1">Speech Cadence</div>
            </div>
            <div className="text-center px-4 py-2 border-r border-slate-100 last:border-none">
              <div className="font-mono text-3xl sm:text-5xl font-black text-slate-900">100%</div>
              <div className="text-sm sm:text-base text-slate-600 font-semibold mt-1">SIM & Number Retention</div>
            </div>
            <div className="text-center px-4 py-2 border-r border-slate-100 last:border-none">
              <div className="font-mono text-3xl sm:text-5xl font-black text-slate-900">72 Hours</div>
              <div className="text-sm sm:text-base text-slate-600 font-semibold mt-1">Go-Live Guarantee</div>
            </div>
            <div className="text-center px-4 py-2">
              <div className="font-mono text-3xl sm:text-5xl font-black text-slate-900">₹0 Markup</div>
              <div className="text-sm sm:text-base text-slate-600 font-semibold mt-1">Direct Pass-Through</div>
            </div>
          </div>

          {/* Showcase Preview: Phone Mockup & Live SMB Activity Card */}
          <div className="mt-16 max-w-6xl lg:max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-left">
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative w-full max-w-[430px] rounded-[44px] border-[8px] border-slate-900 bg-[#ECE5DD] shadow-2xl overflow-hidden text-slate-900">
                <div className="h-7 bg-slate-900 flex items-center justify-center">
                  <div className="w-20 h-3 bg-slate-950 rounded-full" />
                </div>
                <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3.5">
                    <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-sm border border-slate-700">
                      VA
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-slate-900" />
                    </div>
                    <div>
                      <div className="text-base font-bold leading-tight text-white">Vox AI Employee</div>
                      <div className="text-xs text-emerald-400 font-medium">Online · Answers in &lt; 1 sec</div>
                    </div>
                  </div>
                  <Phone className="h-5 w-5 text-white/80" />
                </div>
                <div className="p-4 sm:p-5 space-y-3.5 min-h-[420px] flex flex-col justify-end bg-[#ECE5DD]">
                  <div className="flex justify-center mb-1">
                    <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-mono text-slate-600 shadow-xs font-medium">
                      Today · Verified Customer Lead
                    </span>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-white p-3.5 text-sm sm:text-[15px] leading-relaxed shadow-xs text-slate-900">
                      <p>Hi, we run a diagnostic clinic network in Haryana. Can your AI answer patient inquiries on WhatsApp, quote scan fees, and schedule doctor appointments?</p>
                      <div className="text-xs text-slate-400 text-right mt-1.5 font-mono">10:14 AM</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-emerald-100/90 border border-emerald-200/60 p-3.5 text-sm sm:text-[15px] leading-relaxed shadow-xs text-emerald-950 font-medium">
                      <p>Namaste! Yes, absolutely. We sync directly with your doctor calendar, answer in Hindi and English, and confirm appointment slots instantly with automated WhatsApp reminders.</p>
                      <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-800 mt-1.5 font-mono">
                        <span>10:14 AM</span>
                        <CheckCheck className="h-4 w-4 text-sky-500" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[88%] rounded-2xl rounded-tl-xs bg-white p-3.5 text-sm sm:text-[15px] leading-relaxed shadow-xs text-slate-900">
                      <p>Sounds perfect. What is the setup cost and how soon can we go live?</p>
                      <div className="text-xs text-slate-400 text-right mt-1.5 font-mono">10:15 AM</div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[88%] rounded-2xl rounded-tr-xs bg-emerald-100/90 border border-emerald-200/60 p-3.5 text-sm sm:text-[15px] leading-relaxed shadow-xs text-emerald-950 font-medium">
                      <p>Implementation is ₹20,000 one-time, and ₹5,000/month flat retainer. We deploy your clinic AI employee in 72 hours. Shall I connect you with our deployment team?</p>
                      <div className="flex items-center justify-end gap-1.5 text-xs text-emerald-800 mt-1.5 font-mono">
                        <span>10:15 AM</span>
                        <CheckCheck className="h-4 w-4 text-sky-500" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-4 bg-slate-900 flex items-center justify-center">
                  <div className="w-24 h-1.5 bg-white/30 rounded-full" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                      <TrendingUp className="h-4.5 w-4.5" />
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">Live SMB Multichannel Activity</span>
                  </div>
                  <span className="text-xs sm:text-sm font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                    +42% Today
                  </span>
                </div>
                <div className="font-mono text-4xl sm:text-5xl font-black text-slate-900">₹5,80,000</div>
                <p className="text-base sm:text-lg text-slate-600 mt-1.5 leading-relaxed">
                  Automated sales quotations and appointment value generated across WhatsApp & Phone Calls today.
                </p>
                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900 text-base sm:text-lg">1.2s</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Avg WA Reply</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900 text-base sm:text-lg">340ms</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Speech Cadence</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="font-bold text-slate-900 text-base sm:text-lg">100%</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">SIM Retained</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-base sm:text-lg font-bold text-slate-900">Want to test Nova with your questions?</div>
                    <div className="text-sm text-slate-500 mt-0.5">Ask about pricing, Hindi speech, or custom integrations.</div>
                  </div>
                </div>
                <a href="#chat-with-ai" className="sarvam-btn-primary px-6 py-3 text-sm sm:text-base shrink-0">
                  <span>Try Chatbot</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Client Logo Carousel Section ───────────────────────────────────── */}
      <section className="relative py-16 border-y border-[var(--line)] bg-[var(--surface)] overflow-hidden">
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12 mb-8 text-center">
          <p className="text-sm sm:text-base font-mono tracking-widest uppercase text-[var(--ink-muted)] font-semibold">
            Trusted by fast-growing Indian businesses & enterprises
          </p>
        </div>

        {/* Continuous Marquee Track */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <div className="animate-marquee flex items-center gap-6 py-2">
            {[...clientLogos, ...clientLogos].map((client, idx) => (
              <div
                key={idx}
                className="flex items-center gap-5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] hover:bg-white hover:border-[var(--brand)]/30 px-7 py-4 transition-all duration-200 shadow-xs shrink-0 group"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-[var(--line)] p-2 shrink-0 overflow-hidden shadow-xs">
                  <img
                    src={client.logo}
                    alt={`${client.name} logo`}
                    className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="text-left">
                  <div className="text-base font-bold text-[var(--ink)] tracking-tight whitespace-nowrap">
                    {client.name}
                  </div>
                  <div className="text-xs sm:text-sm font-mono text-[var(--ink-muted)] whitespace-nowrap mt-0.5">
                    {client.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Telemetry Strip ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl lg:max-w-7xl px-6 sm:px-10 my-16">
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 sm:py-5 sm:px-8 shadow-xs flex items-center justify-between gap-5 text-sm sm:text-base font-mono">
          <div className="flex items-center gap-3 shrink-0">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-[var(--brand)] text-xs sm:text-sm uppercase tracking-wide">Live Activity</span>
          </div>
          <div className="truncate text-[var(--ink)] text-sm sm:text-base">
            <span className="font-bold text-[var(--brand)] mr-2">[{tickerItems[0].channel}]</span>
            <span className="text-[var(--ink-muted)]">{tickerItems[0].text}</span>
          </div>
          <span className="text-xs sm:text-sm text-[var(--ink-faint)] shrink-0 hidden sm:inline">{tickerItems[0].time}</span>
        </div>
      </div>

      {/* ─── 3. "Ask your AI Employee" Briefing Demo (Sarvam AI Model Playground) ─ */}
      <section id="chat-with-ai" className="relative py-20 md:py-28 border-t border-slate-200/80 bg-slate-50/70">
        <div className="mx-auto max-w-6xl lg:max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-5 py-2 text-xs sm:text-sm text-slate-700 font-semibold mb-4 shadow-xs">
              <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
              <span>Real-Time Interactive AI Terminal</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-slate-900">
              Ask your AI Employee anything.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Experience the reasoning power of our frontier voice and multichannel models. Click any question below or type your custom inquiry to test real-time pricing, SIM retention, Hindi/Hinglish speech, and catalog workflows.
            </p>
          </div>

          {/* Sarvam AI Model Playground Container */}
          <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xl overflow-hidden">
            {/* Playground Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 bg-slate-100/70 px-8 py-5 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="flex gap-2">
                  <span className="h-3.5 w-3.5 rounded-full bg-[#E58072] inline-block" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#E5BF72] inline-block" />
                  <span className="h-3.5 w-3.5 rounded-full bg-[#82C99B] inline-block" />
                </div>
                <div className="flex items-center gap-2.5 text-base sm:text-lg text-slate-900 font-bold ml-2">
                  <Bot className="h-5 w-5 text-slate-900" />
                  <span>Nova 3.5</span>
                  <span className="text-slate-400 font-normal hidden sm:inline">· Voice & Multimodal Enterprise Brain</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 font-semibold text-emerald-800">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Gemini 3.5 Flash · 240ms Latency
                </span>
              </div>
            </div>

            {/* Suggested Question Chips (Sarvam pill buttons) */}
            <div className="p-6 sm:p-8 border-b border-slate-200/80 bg-slate-50/50">
              <div className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center justify-between">
                <span>Select a query to test instant live response:</span>
                <span className="text-emerald-700 hidden sm:inline font-semibold">6 Pre-Trained Executive Benchmarks</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {suggestedQueries.map((q, idx) => {
                  const isSelected = activeChipIndex === idx
                  return (
                    <button
                      key={q.id}
                      onClick={() => askAiEmployee(q.query, idx)}
                      disabled={isGeneratingResponse}
                      className={`text-left rounded-2xl p-4 sm:p-5 text-sm transition-all border ${
                        isSelected
                          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                          : "border-slate-200/90 bg-white text-slate-800 hover:border-slate-400 hover:shadow-xs"
                      } ${isGeneratingResponse ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`font-bold text-base ${isSelected ? "text-emerald-300" : "text-slate-900"}`}>
                          {q.label}
                        </span>
                        {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />}
                      </div>
                      <p className={`line-clamp-2 leading-relaxed text-xs sm:text-sm ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                        “{q.query}”
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Chat Thread Messages Canvas */}
            <div className="p-6 sm:p-10 space-y-7 max-h-[620px] overflow-y-auto">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="max-w-[85%] rounded-3xl rounded-tr-xs bg-slate-900 px-6 py-4 text-base sm:text-lg text-white shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 mb-1.5">
                        <Users className="h-4 w-4" /> YOU (EXECUTIVE / FOUNDER)
                      </div>
                      <p className="font-medium text-slate-100">“{msg.text}”</p>
                      <div className="text-xs text-slate-400 text-right mt-1.5 font-mono">{msg.time}</div>
                    </div>
                  ) : (
                    <div className="w-full rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 sm:p-9 space-y-6">
                      {/* Response Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
                        <div className="flex items-center gap-3.5">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shrink-0">
                            <Bot className="h-6 w-6" />
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-mono text-slate-500 font-bold block uppercase tracking-wide">
                              Nova AI Executive Response
                            </span>
                            <span className="text-lg sm:text-xl text-slate-900 font-bold">
                              {msg.headline || "Live Multichannel Intelligence"}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs sm:text-sm font-mono text-slate-600">
                          {msg.time} · Gemini 3.5 Flash
                        </span>
                      </div>

                      {/* Main Message Body */}
                      <p className="text-base sm:text-lg text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                        {msg.text}
                      </p>

                      {/* Bullet points if present */}
                      {msg.bullets && msg.bullets.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-slate-200/60">
                          {msg.bullets.map((bullet, i) => (
                            <div key={i} className="flex items-start gap-3 text-base sm:text-lg text-slate-700 leading-relaxed">
                              <span className="text-emerald-600 shrink-0 font-bold text-lg mt-0.5">•</span>
                              <span>{bullet}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* KPI Grid if present */}
                      {msg.kpis && msg.kpis.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
                          {msg.kpis.map((kpi, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-xs">
                              <span className="text-xs sm:text-sm font-mono text-slate-500 block uppercase tracking-wider font-semibold">
                                {kpi.label}
                              </span>
                              <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 mt-1 block truncate">
                                {kpi.val}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Callout Alert Badge */}
                      {msg.alert && (
                        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 sm:p-5 text-sm sm:text-base text-emerald-950 flex items-start gap-3">
                          <Zap className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{msg.alert}</span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
                        <div className="flex gap-2.5 text-xs sm:text-sm font-mono">
                          <span className="rounded-full bg-white px-4 py-1.5 text-slate-600 border border-slate-200 font-semibold">
                            Live Inference Verified
                          </span>
                          <span className="rounded-full bg-slate-900 text-white px-4 py-1.5 font-bold">
                            Zero Platform Markup
                          </span>
                        </div>
                        <a
                          href={WHATSAPP_CTA}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                        >
                          <span>Deploy This AI Employee For Your Business</span>
                          <ArrowUpRight className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Live Loading Typing Indicator */}
              {isGeneratingResponse && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-2 flex items-center gap-3.5 text-base text-slate-700 font-medium">
                    <RefreshCw className="h-5 w-5 text-slate-900 animate-spin shrink-0" />
                    <span>Nova is synthesizing live multichannel data with Gemini 3.5 Flash...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Interactive Input Prompt Bar */}
            <div className="p-6 sm:p-8 border-t border-slate-200/80 bg-slate-50/60">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (customInput.trim() && !isGeneratingResponse) {
                    askAiEmployee(customInput)
                  }
                }}
                className="flex items-center gap-4 rounded-2xl border-2 border-slate-300 bg-white px-5 py-3.5 shadow-sm focus-within:border-slate-900 focus-within:ring-2 focus-within:ring-slate-900/10 transition-all"
              >
                <Search className="h-6 w-6 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ask Nova anything (e.g. 'How do you handle doctor appointments and Hindi calls?')..."
                  className="w-full bg-transparent text-base sm:text-lg text-slate-900 placeholder-slate-400 focus:outline-none"
                  disabled={isGeneratingResponse}
                />
                <button
                  type="submit"
                  disabled={!customInput.trim() || isGeneratingResponse}
                  className={`sarvam-btn-primary px-7 py-3 text-sm sm:text-base shrink-0 flex items-center gap-2 ${
                    !customInput.trim() || isGeneratingResponse ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <span>Ask Nova</span>
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <div className="flex items-center justify-between mt-3 px-2 text-xs sm:text-sm text-slate-500 font-mono">
                <span>Direct integration with Gemini 3.5 Flash API</span>
                <span>Press Enter to send question</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4. Omnichannel Bento Grid Section ──────────────────────────────── */}
      <section id="channels" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-4 shadow-xs">
              <span>Omnichannel Coverage</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[var(--ink)]">
              One unified AI brain. Four channels covered.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed">
              Your AI Employee doesn’t live in an isolated silo. If a customer leaves a comment on an Instagram Reel, messages your WhatsApp business number, and later calls your office landline, your AI remembers their entire history, previous quotes, and preferences.
            </p>
          </div>

          {/* Asymmetric Bento Grid in Unified Warm Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Featured Card 1: AI Voice Employee (Wide Card with simulated call dialog) */}
            <div className="lg:col-span-7 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-11 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7] shadow-sm">
                    <PhoneCall className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] px-4 py-1.5 text-xs sm:text-sm font-mono font-bold text-[var(--brand-soft-text)]">
                    Sub-350ms Latency · 99.4% Human Cadence
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--ink)]">
                  AI Voice Employee
                </h3>
                <p className="text-base font-mono font-bold text-[var(--brand)] mt-2">
                  Ultra-realistic phone reception & proactive outbound lead caller
                </p>
                <p className="text-base sm:text-lg text-[var(--ink-muted)] mt-3.5 leading-relaxed">
                  Sounds identical to your highest-performing in-house sales closer. Answers inbound phone calls within one ring, calls web leads back within 45 seconds, understands colloquial Indian English and Hindi seamlessly, and warm-transfers hot deals to your human reps with an audio debrief.
                </p>

                {/* 3D Realistic Phone Telephony UI Mockup */}
                <div className="mt-7 rounded-2xl overflow-hidden border border-[var(--line)] bg-[#F1F4F9] shadow-sm">
                  <img
                    src="/images/voice-call-mockup.png"
                    alt="VOX AI Inbound Phone Telephony Mockup with Sub-350ms Indian Voice Cadence"
                    className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                {/* Simulated Call Transcript as Chat Bubbles */}
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 space-y-3.5 text-base">
                  <div className="text-xs sm:text-sm font-mono text-[var(--ink-muted)] border-b border-[var(--line)] pb-2.5 flex items-center justify-between font-bold">
                    <span>Live Call Stream Simulation</span>
                    <span className="text-[var(--brand)]">Active Inbound Telephony</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-2xl bg-white p-4 text-[var(--ink)] shadow-xs">
                        <div className="text-xs font-mono opacity-70 mb-1 font-bold">CALLER</div>
                        <p className="text-sm sm:text-base leading-relaxed">Hi, I saw your package. Do you do custom ERP integrations for wholesale distributors with multiple warehouses?</p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-[var(--brand-soft)] p-4 text-[var(--brand-soft-text)] font-semibold shadow-xs">
                        <div className="text-xs font-mono opacity-70 mb-1 font-bold">VOX AI VOICE</div>
                        <p className="text-sm sm:text-base leading-relaxed">Yes, absolutely! We connect directly with SAP, Tally, Zoho, and custom PostgreSQL databases. How many SKUs and warehouse locations are you managing?</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--line)] flex items-center justify-between">
                <a
                  href={CALL_CTA}
                  className="inline-flex items-center gap-2 text-base font-bold text-[var(--brand)] hover:underline"
                >
                  <PhoneCall className="h-5 w-5" />
                  <span>Call Voice AI Demo: {CALL_NUMBER}</span>
                </a>
                <span className="text-xs sm:text-sm font-mono text-[var(--ink-muted)]">WebRTC + SIP Trunk Ready</span>
              </div>
            </div>

            {/* Card 2: WhatsApp AI Employee */}
            <div className="lg:col-span-5 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-11 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7] shadow-sm">
                    <MessageSquare className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-4 py-1.5 text-xs sm:text-sm font-mono font-bold">
                    Official Meta Cloud API
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--ink)]">
                  WhatsApp AI Employee
                </h3>
                <p className="text-base font-mono font-bold text-[var(--brand)] mt-2">
                  Your 24/7 multilingual conversational sales closer
                </p>
                <p className="text-base sm:text-lg text-[var(--ink-muted)] mt-3.5 leading-relaxed">
                  An autonomous salesperson on WhatsApp that never sleeps. Qualifies buyers, shares product catalogs, calculates customized estimates in Hindi & English, sends PDF brochures, and schedules appointments right into your team's calendar.
                </p>

                {/* Simulated WhatsApp Interaction */}
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-5 space-y-3 text-sm sm:text-base">
                  <div className="flex justify-start">
                    <div className="rounded-xl bg-white p-3.5 shadow-xs text-[var(--ink)] max-w-[90%]">
                      <p>“What is the pricing for clinic onboarding?”</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-xl bg-[var(--brand-soft)] p-3.5 shadow-xs text-[var(--brand-soft-text)] font-semibold max-w-[90%]">
                      <p>“Setup is ₹20,000 one-time and ₹5,000/mo retainer. Includes 24/7 patient triage and doctor scheduling.”</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Instant bilingual reply (English, Hindi, and regional slang)",
                    "Dispatches payment links, PDF brochures, and location maps",
                    "Direct Google Calendar booking with WhatsApp confirmation",
                    "Polite, non-spam drip follow-ups on unresponsive leads",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-[var(--ink)] font-medium">
                      <CheckCircle2 className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base font-bold text-[var(--brand)] hover:underline"
                >
                  <span>Deploy WhatsApp AI Closer</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Card 3: Instagram AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-11 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7] shadow-sm">
                    <Instagram className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-4 py-1.5 text-xs sm:text-sm font-mono font-bold">
                    &lt; 1.5s Comment-to-DM Trigger
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--ink)]">
                  Instagram AI Employee
                </h3>
                <p className="text-base font-mono font-bold text-[var(--brand)] mt-2">
                  Turns Reel comments & DMs into paying customers
                </p>
                <p className="text-base sm:text-lg text-[var(--ink-muted)] mt-3.5 leading-relaxed">
                  Never miss a viral Reel spike. When followers comment keywords on your Reels or reply to Stories, your AI employee replies in milliseconds, opens a DM conversation, extracts their verified phone number, and syncs them to your CRM.
                </p>

                {/* 3D Realistic Instagram Reel & Auto-DM Mockup */}
                <div className="mt-6 rounded-2xl overflow-hidden border border-[var(--line)] bg-[#F1F4F9] shadow-sm">
                  <img
                    src="/images/instagram-dm-mockup.png"
                    alt="Instagram Reel Comment to Automated DM Conversion Mockup"
                    className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
                    loading="lazy"
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Reel Comment trigger: Automatically sends instant DM with pricing",
                    "Story reply and direct message triage 24 hours a day",
                    "Screens out casual scrollers and converts high-intent buyers",
                    "Extracts verified phone numbers into CRM automatically",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-[var(--ink)] font-medium">
                      <CheckCircle2 className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base font-bold text-[var(--brand)] hover:underline"
                >
                  <span>Connect Instagram Graph API</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Card 4: Executive Email AI Employee */}
            <div className="lg:col-span-6 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-11 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)] text-[#F6F1E7] shadow-sm">
                    <Mail className="h-7 w-7" />
                  </div>
                  <span className="rounded-full bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-4 py-1.5 text-xs sm:text-sm font-mono font-bold">
                    Inbox Zero · 1.2s Triage
                  </span>
                </div>

                <h3 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--ink)]">
                  Executive Email AI Employee
                </h3>
                <p className="text-base font-mono font-bold text-[var(--brand)] mt-2">
                  Hyper-personalized triage & enterprise proposal drafting
                </p>
                <p className="text-base sm:text-lg text-[var(--ink-muted)] mt-3.5 leading-relaxed">
                  An executive email partner that reads incoming enterprise inquiries, categorizes high-value opportunities, generates bespoke context-aware replies matching your company voice, and keeps sales pipelines warm.
                </p>

                {/* Simulated Email Flow */}
                <div className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] p-5 space-y-2.5 text-sm sm:text-base">
                  <div className="flex items-center justify-between border-b border-[var(--line)] pb-2 text-xs sm:text-sm font-mono text-[var(--ink-muted)] font-semibold">
                    <span>Subject: Enterprise Franchise Proposal (18 Outlets)</span>
                    <span className="text-[var(--brand)]">Draft Prepared</span>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--ink)] italic line-clamp-2 leading-relaxed">
                    “Dear Director Chopra, We have prepared specialized retail routing for your 18 outlets. Attached is the architectural breakdown and pricing...”
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    "Inbox Zero triage: separates critical client deals from junk mail",
                    "Pre-drafts context-aware, hyper-personalized email proposals",
                    "Synchronizes lead touchpoints with Google Sheets and CRM",
                    "Re-engages dormant client opportunities with contextual follow-ups",
                  ].map((cap, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm sm:text-base text-[var(--ink)] font-medium">
                      <CheckCircle2 className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-base font-bold text-[var(--brand)] hover:underline"
                >
                  <span>Set Up Enterprise Email Triage</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. Real Inbound AI Agent Call Recording Section ───────────────── */}
      <section id="voice-audio" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        {/* Hidden HTML5 Audio Element */}
        <audio
          ref={audioRef}
          src="/audio/sample-call.mp3"
          preload="metadata"
          onTimeUpdate={() => {
            if (audioRef.current) {
              setAudioCurrentTime(audioRef.current.currentTime)
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setAudioDuration(audioRef.current.duration)
            }
          }}
          onEnded={() => {
            setIsPlayingAudio(false)
            setAudioCurrentTime(0)
          }}
        />

        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-4 shadow-xs">
              <Headphones className="h-4.5 w-4.5 text-[var(--brand)]" />
              <span>Real Customer Call Recording (Bilingual Hindi & English)</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[var(--ink)]">
              Listen to a real inbound customer call.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed">
              No actors, no script simulation. Listen to our AI Agent (Riya) handle an inbound Karnataka RERA registration inquiry, quote ₹2,00,000 government fees, capture Puneet Kumar's email, offer WhatsApp documentation, and initiate a live human warm-transfer.
            </p>
          </div>

          {/* Refined Audio Player Card — Widen to 6xl/7xl */}
          <div className="max-w-6xl lg:max-w-7xl mx-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-12 shadow-xl">
            {/* Player Header & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-7 border-b border-[var(--line)]">
              <div className="flex items-center gap-5">
                {/* Large Round Coral Play Button */}
                <button
                  onClick={toggleVoicePlayback}
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg transition-all hover:scale-105 active:scale-95 shrink-0 ${
                    isPlayingAudio ? "ring-4 ring-[var(--accent)]/30 animate-pulse" : ""
                  }`}
                  aria-label={isPlayingAudio ? "Pause sample call audio" : "Play sample call audio"}
                >
                  {isPlayingAudio ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </button>
                <div>
                  <div className="text-lg sm:text-2xl font-bold text-[var(--ink)] flex items-center gap-3 flex-wrap">
                    <span>Live Call: Karnataka RERA Registration</span>
                    <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs sm:text-sm font-mono text-[var(--brand-soft-text)] font-bold">
                      REAL RECORDING
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[var(--ink-muted)] mt-1.5 font-mono">
                    AI Agent: <strong className="text-[var(--brand)] font-semibold">Riya</strong> · Caller: <strong className="text-[var(--ink)] font-semibold">Puneet Kumar</strong> · Duration: 2m 50s
                  </p>
                </div>
              </div>

              {/* Direct Call Button */}
              <a
                href={CALL_CTA}
                className="shrink-0 inline-flex items-center gap-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface-alt)] px-6 py-3.5 text-sm sm:text-base font-bold text-[var(--ink)] hover:bg-[var(--surface)] transition-colors shadow-xs"
              >
                <PhoneCall className="h-5 w-5 text-[var(--brand)]" />
                <span>Call Phone Demo: {CALL_NUMBER}</span>
              </a>
            </div>

            {/* Clickable Progress Scrubber Bar */}
            <div className="pt-8 pb-3">
              <div
                onClick={handleProgressBarClick}
                className="h-4 w-full bg-[var(--surface-alt)] rounded-full overflow-hidden cursor-pointer relative group"
                title="Click anywhere to jump in the audio"
              >
                <div
                  className="h-full bg-[var(--brand)] rounded-full transition-all duration-100 relative"
                  style={{
                    width: `${Math.min(100, (audioCurrentTime / (audioDuration || 170)) * 100)}%`,
                  }}
                >
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[var(--accent)] shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Time Indicators */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-[var(--ink-muted)] mt-2.5">
                <span className="font-bold text-[var(--ink)]">{formatAudioTime(audioCurrentTime)}</span>
                <span className="text-xs sm:text-sm font-mono text-[var(--brand)] font-semibold">Click bar or waveform to scrub</span>
                <span>{formatAudioTime(audioDuration || 170)}</span>
              </div>
            </div>

            {/* Animated Interactive Waveform in Forest Green */}
            <div className="py-5">
              <div className="flex items-end justify-between h-24 sm:h-28 gap-1.5 sm:gap-2 px-1">
                {[
                  32, 65, 80, 45, 95, 30, 85, 60, 100, 75, 40, 90, 50, 85, 35, 70, 95, 40, 60, 80, 45, 90, 65, 35, 75, 50, 85, 40, 90, 60, 75, 45
                ].map((val, idx) => {
                  const progressFraction = audioCurrentTime / (audioDuration || 170)
                  const barFraction = idx / 32
                  const isPassed = barFraction <= progressFraction

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSeek(barFraction * (audioDuration || 170))}
                      className="w-full flex items-end h-full group focus:outline-none"
                      title={`Jump to ${formatAudioTime(barFraction * (audioDuration || 170))}`}
                      aria-label={`Jump to audio timestamp`}
                    >
                      <span
                        className={`w-full rounded-full transition-all duration-150 ${
                          isPassed
                            ? "bg-[var(--brand)] group-hover:bg-[var(--accent)]"
                            : "bg-[var(--ink-faint)]/20 group-hover:bg-[var(--brand)]/50"
                        }`}
                        style={{
                          height: isPlayingAudio
                            ? `${Math.max(16, val * (idx % 2 === 0 ? 1 : 0.82))}%`
                            : `${Math.max(16, val * 0.7)}%`,
                        }}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Interactive Call Key Moments (Click to Jump) */}
            <div className="my-6 pt-5 border-t border-[var(--line)]">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-muted)] block mb-3 font-bold">
                Jump to Key Call Moments (Click to Listen):
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {callHighlights.map((moment, idx) => {
                  const isActive =
                    (idx === 0 && audioCurrentTime < 38) ||
                    (idx === 1 && audioCurrentTime >= 38 && audioCurrentTime < 85) ||
                    (idx === 2 && audioCurrentTime >= 85 && audioCurrentTime < 130) ||
                    (idx === 3 && audioCurrentTime >= 130)

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSeek(moment.time)}
                      className={`p-3.5 sm:p-4 rounded-2xl text-left border transition-all text-sm ${
                        isActive
                          ? "border-[var(--brand)] bg-[var(--brand-soft)] shadow-xs"
                          : "border-[var(--line)] bg-[var(--surface-alt)] hover:bg-white hover:border-[var(--brand)]/40"
                      }`}
                    >
                      <span className={`font-mono font-bold block ${isActive ? "text-[var(--brand)]" : "text-[var(--ink)]"}`}>
                        {moment.label}
                      </span>
                      <span className="text-xs sm:text-sm text-[var(--ink-muted)] line-clamp-1 mt-1 font-medium">
                        {moment.stage}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Live Synchronized Transcript Box */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface-alt)] p-6 sm:p-8 mt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs sm:text-sm uppercase tracking-wider text-[var(--ink-muted)] font-bold">
                  Live Synchronized Transcript
                </span>
                <span className="text-xs sm:text-sm font-mono font-bold bg-[var(--brand)] text-[#F6F1E7] px-3 py-1 rounded-full">
                  {getActiveHighlight().stage}
                </span>
              </div>
              <p className="text-lg sm:text-xl font-medium text-[var(--ink)] italic leading-relaxed">
                {getActiveHighlight().quote}
              </p>
            </div>

            {/* 3 Call Highlights Stat Tiles */}
            <div className="mt-8 pt-6 border-t border-[var(--line)] grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-xs sm:text-sm font-mono text-[var(--ink-muted)] block uppercase font-semibold">Turnaround Latency</span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)] mt-1.5 block">340ms Cadence</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-mono text-[var(--ink-muted)] block uppercase font-semibold">Language Fluency</span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)] mt-1.5 block">Hindi + English</span>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-mono text-[var(--ink-muted)] block uppercase font-semibold">Automated Outcome</span>
                <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--brand)] mt-1.5 block">Live Patch to Human</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Interactive ROI / Cost Savings Calculator ────────────────────── */}
      <section id="roi-calculator" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-4 shadow-xs">
              <Calculator className="h-4.5 w-4.5 text-[var(--brand)]" />
              <span>Interactive ROI & Financial Impact</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[var(--ink)]">
              Calculate how much you save every month.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed">
              Compare your current human telecalling desk against a dedicated 24/7 AI employee that never sleeps, never takes Sunday off, and responds in 1.2 seconds.
            </p>

            {/* Quick Industry Presets */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-muted)] mr-1 font-bold">Quick Presets:</span>
              {roiPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInquiriesPerDay(preset.inquiries)
                    setTelecallerCount(preset.staff)
                    setSalaryPerCaller(preset.salary)
                    setActivePresetIndex(idx)
                  }}
                  className={`rounded-full px-5 py-2 text-sm sm:text-base font-semibold transition-all ${
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl lg:max-w-7xl mx-auto items-stretch">
            {/* Left Card: Interactive Sliders & Controls */}
            <div className="lg:col-span-7 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-11 shadow-xs flex flex-col justify-between">
              <div className="space-y-9">
                {/* Control 1: Daily Customer Inquiries */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
                      <MessageSquare className="h-5 w-5 text-[var(--brand)]" />
                      <span>Daily Customer Inquiries / Leads</span>
                    </label>
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-4 py-1.5 rounded-xl">
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
                    className="w-full h-3.5 bg-[var(--surface-alt)] rounded-lg appearance-none cursor-pointer accent-[var(--brand)]"
                  />
                  <div className="flex justify-between text-xs sm:text-sm font-mono text-[var(--ink-muted)] mt-2">
                    <span>15 inquiries</span>
                    <span>120 inquiries</span>
                    <span>250+ inquiries</span>
                  </div>
                </div>

                {/* Control 2: Number of Human Telecallers */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
                      <Users className="h-5 w-5 text-[var(--brand)]" />
                      <span>Telecallers / Staff Currently Hired</span>
                    </label>
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-4 py-1.5 rounded-xl">
                      {telecallerCount} {telecallerCount === 1 ? "staff" : "telecallers"}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-2.5 mt-3">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setTelecallerCount(num)
                          setActivePresetIndex(null)
                        }}
                        className={`py-3 rounded-xl text-base font-bold transition-all ${
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
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base sm:text-lg font-bold text-[var(--ink)] flex items-center gap-2.5">
                      <Clock className="h-5 w-5 text-[var(--brand)]" />
                      <span>Monthly Salary per Telecaller</span>
                    </label>
                    <span className="font-mono text-base sm:text-lg font-bold text-[var(--brand)] bg-[var(--brand-soft)] px-4 py-1.5 rounded-xl">
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
                    className="w-full h-3.5 bg-[var(--surface-alt)] rounded-lg appearance-none cursor-pointer accent-[var(--brand)]"
                  />
                  <div className="flex justify-between text-xs sm:text-sm font-mono text-[var(--ink-muted)] mt-2">
                    <span>₹12,000/mo</span>
                    <span>₹22,000/mo</span>
                    <span>₹35,000/mo</span>
                  </div>
                </div>
              </div>

              {/* Current Cost Summary Strip */}
              <div className="mt-9 pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-base">
                <span className="text-[var(--ink-muted)] font-medium">
                  Current Human Telecaller Payroll:
                </span>
                <span className="font-mono text-base sm:text-lg font-bold text-rose-800 bg-rose-50 border border-rose-200 px-4 py-1.5 rounded-xl">
                  ₹{monthlyHumanPayroll.toLocaleString("en-IN")} / month
                </span>
              </div>
            </div>

            {/* Right Card: Dynamic Output & Savings Bento in Forest Green */}
            <div className="lg:col-span-5 rounded-3xl border border-[var(--brand)] bg-[var(--brand)] text-[#F6F1E7] p-8 sm:p-11 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Projected Return on Investment
                  </span>
                  <span className="rounded-full bg-[var(--brand-surface)] border border-emerald-500/30 px-3.5 py-1 text-xs sm:text-sm font-mono text-emerald-200 font-bold">
                    Save {savingsPercentage}%
                  </span>
                </div>

                <div className="mb-7">
                  <span className="text-xs sm:text-sm font-mono text-emerald-200 block mb-1.5">
                    Your Net Annual Cost Savings:
                  </span>
                  <div className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-[#F6F1E7]">
                    ₹{annualSavings.toLocaleString("en-IN")}
                  </div>
                  <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 font-mono">
                    (₹{monthlySavings.toLocaleString("en-IN")} saved every month compared to human staff)
                  </p>
                </div>

                {/* Breakdown Tiles */}
                <div className="space-y-3.5 pt-6 border-t border-white/10 text-base">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-emerald-100">Human Desk Payroll:</span>
                    <span className="font-mono text-rose-300 font-bold line-through">₹{monthlyHumanPayroll.toLocaleString("en-IN")}/mo</span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/10 border border-emerald-400/30">
                    <span className="text-white font-semibold">VOX AI Employee Retainer:</span>
                    <span className="font-mono text-emerald-300 font-bold">₹{monthlyVoxCost.toLocaleString("en-IN")}/mo</span>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/20 text-sm sm:text-base leading-relaxed text-emerald-100">
                    <div className="flex items-center gap-2 font-bold text-emerald-300 mb-1.5">
                      <Sparkles className="h-4.5 w-4.5" />
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
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-4.5 text-base sm:text-lg font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-4 shadow-xs">
              <Scale className="h-4.5 w-4.5 text-[var(--brand)]" />
              <span>Head-to-Head Comparison</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[var(--ink)]">
              Why Indian businesses are replacing telecaller desks.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed">
              Managing human callers means dealing with hiring, training, leaves, and missed night inquiries. Here is how a dedicated AI Employee changes the game.
            </p>
          </div>

          {/* Comparison Matrix Table */}
          <div className="max-w-6xl lg:max-w-7xl mx-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] shadow-xs overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-[var(--surface-alt)] border-b border-[var(--line)] p-5 sm:p-7 text-sm sm:text-base font-bold text-[var(--ink)]">
              <div className="col-span-12 sm:col-span-4 font-mono uppercase tracking-wider text-[var(--ink-muted)] mb-2 sm:mb-0">
                Operational Factor
              </div>
              <div className="col-span-6 sm:col-span-4 text-left text-rose-900 font-mono uppercase tracking-wider flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>Human Telecallers</span>
              </div>
              <div className="col-span-6 sm:col-span-4 text-left text-[var(--brand)] font-mono uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold">VOX AI Employee</span>
                </div>
                <span className="hidden md:inline-block rounded-full bg-[var(--brand-soft)] px-3 py-0.5 text-xs text-[var(--brand-soft-text)] font-bold">
                  Recommended
                </span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[var(--line)]">
              {comparisonRows.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 p-5 sm:p-7 items-center hover:bg-[var(--surface-alt)]/40 transition-colors gap-4 sm:gap-5"
                >
                  <div className="col-span-12 sm:col-span-4 font-bold text-base sm:text-lg text-[var(--ink)]">
                    {row.feature}
                  </div>

                  <div className="col-span-12 sm:col-span-4 text-sm sm:text-base text-[var(--ink-muted)] flex items-start gap-2.5 bg-rose-50/60 sm:bg-transparent p-3.5 sm:p-0 rounded-xl sm:rounded-none border border-rose-100 sm:border-0">
                    <span className="text-rose-600 font-bold shrink-0 mt-0.5">✕</span>
                    <span className="leading-relaxed">{row.human}</span>
                  </div>

                  <div className="col-span-12 sm:col-span-4 text-sm sm:text-base text-[var(--ink)] font-semibold flex items-start gap-2.5 bg-emerald-50/70 sm:bg-transparent p-3.5 sm:p-0 rounded-xl sm:rounded-none border border-emerald-100 sm:border-0">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="leading-relaxed block">{row.vox}</span>
                      <span className="inline-block sm:hidden text-xs font-mono font-bold bg-[var(--brand-soft)] text-[var(--brand-soft-text)] px-2.5 py-0.5 rounded mt-1.5">
                        ✓ {row.voxBadge}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Table Strip */}
            <div className="p-7 sm:p-8 bg-[var(--surface-alt)] border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-3">
                <span className="h-3.5 w-3.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-base sm:text-lg font-semibold text-[var(--ink)]">
                  Ready to eliminate hiring headaches and scale customer response?
                </span>
              </div>
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-[var(--brand)] px-8 py-3.5 text-base font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-all shadow-xs"
              >
                <span>Hire Your AI Employee (₹20,000 setup)</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. How We Build It (Stepper 01-04 Expanded) ─────────────────────── */}
      <section id="how-it-works" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-4 shadow-xs">
              <span>Engineering Process</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[var(--ink)]">
              How we build your custom AI Employee.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed">
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
                  image: "/images/knowledge-ingestion-cube.jpg",
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
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-10 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {'image' in st && st.image && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-[var(--line)] bg-white shadow-xs">
                        <img
                          src={st.image}
                          alt={st.title}
                          className="w-full h-44 object-contain p-2 hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="font-serif text-6xl font-normal text-[var(--brand)] mb-4">
                      {st.step}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-1.5">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm font-mono text-[var(--brand)] mb-3.5 font-bold">
                      {st.sub}
                    </p>
                    <p className="text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed mb-6">
                      {st.desc}
                    </p>
                  </div>

                  <div className="pt-5 border-t border-[var(--line)] space-y-2.5">
                    {st.deliverables.map((d, di) => (
                      <div key={di} className="text-sm sm:text-base text-[var(--ink)] flex items-center gap-2.5 font-medium">
                        <Check className="h-4.5 w-4.5 text-[var(--brand)] shrink-0" />
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
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-4 shadow-xs">
              <span>Transparent Commercials</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[var(--ink)]">
              A clear, two-part investment.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed">
              One custom implementation fee to build your digital employee from scratch, and a predictable monthly retainer to keep it learning, updating, and running 24/7.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl lg:max-w-7xl mx-auto">
            {/* Card 1: Implementation Card in White */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-12 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs sm:text-sm font-mono font-bold text-[var(--brand)] uppercase tracking-wider">
                    One-Time Implementation
                  </span>
                  <span className="rounded-full bg-[var(--brand-soft)] px-4 py-1 text-xs sm:text-sm font-mono text-[var(--brand-soft-text)] font-bold">
                    Full Build & Deploy
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-serif text-6xl sm:text-7xl font-bold text-[var(--ink)]">₹20,000</span>
                  <span className="text-[var(--ink-muted)] text-base sm:text-lg font-mono">one-time setup</span>
                </div>

                <p className="text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed mb-7">
                  Complete custom engineering of your business AI Employee across Phone Calls, WhatsApp, Instagram, and Email. Dedicated solutions architect assigned to your account.
                </p>

                <div className="space-y-4 pt-6 border-t border-[var(--line)]">
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
                    <div key={i} className="flex items-start gap-3 text-base sm:text-lg text-[var(--ink)]">
                      <Check className="h-5 w-5 text-[var(--brand)] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-9 pt-6 border-t border-[var(--line)]">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--brand)] py-4.5 text-base sm:text-lg font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-all shadow-sm"
                >
                  <span>Build Your AI Employee (₹20,000)</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Card 2: Monthly Retainer in Deep Forest Green */}
            <div className="rounded-3xl border border-[var(--brand)] bg-[var(--brand)] text-[#F6F1E7] p-8 sm:p-12 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs sm:text-sm font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Monthly Support & Retainer
                  </span>
                  <span className="rounded-full bg-[var(--brand-surface)] border border-emerald-500/30 px-4 py-1 text-xs sm:text-sm font-mono text-emerald-200 font-bold">
                    Continuous Upkeep
                  </span>
                </div>

                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-serif text-6xl sm:text-7xl font-bold text-[#F6F1E7]">₹5,000</span>
                  <span className="text-emerald-200/90 text-base sm:text-lg font-mono">per month · pause anytime</span>
                </div>

                <p className="text-base sm:text-lg text-[#F6F1E7]/90 leading-relaxed mb-7">
                  24/7 uptime monitoring, continuous prompt optimization, model retraining, and technical maintenance so your employee never breaks or goes offline.
                </p>

                <div className="space-y-4 pt-6 border-t border-white/10">
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
                    <div key={i} className="flex items-start gap-3 text-base sm:text-lg text-[#F6F1E7]">
                      <Check className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-9 pt-6 border-t border-white/10">
                <a
                  href={WHATSAPP_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] py-4.5 text-base sm:text-lg font-bold text-white shadow-md transition-all"
                >
                  <span>Lock In Retainer (₹5,000/mo)</span>
                  <ArrowRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Detailed Pass-Through Transparency Callout */}
          <div className="mt-14 max-w-6xl lg:max-w-7xl mx-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-10 shadow-xs text-base text-[var(--ink-muted)]">
            <div className="flex items-center gap-3 mb-2.5">
              <ShieldCheck className="h-6 w-6 text-[var(--brand)]" />
              <strong className="text-lg sm:text-xl font-bold text-[var(--ink)]">100% Direct Pass-Through Transparency: Zero Markup on Platform Usage</strong>
            </div>
            <p className="leading-relaxed text-base sm:text-lg">
              Unlike traditional marketing agencies that add 300% markups on third-party software, Vox AI charges zero markup on platform costs. You pay actual provider fees directly:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-5 border-t border-[var(--line)] font-mono text-sm sm:text-base">
              <div>
                <span className="font-bold text-[var(--ink)] block text-base sm:text-lg">Meta WhatsApp API</span>
                <span className="text-[var(--ink-muted)] mt-1 block">~₹0.70 to ₹0.85 per 24-hour service conversation directly to Meta</span>
              </div>
              <div>
                <span className="font-bold text-[var(--ink)] block text-base sm:text-lg">Telephony Minutes</span>
                <span className="text-[var(--ink-muted)] mt-1 block">Actual telecom SIP trunk rates (~₹0.50/min for domestic Indian calls)</span>
              </div>
              <div>
                <span className="font-bold text-[var(--ink)] block text-base sm:text-lg">AI Model Tokens</span>
                <span className="text-[var(--ink-muted)] mt-1 block">Billed directly by OpenAI / Gemini at actual token consumption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 9. Frequently Asked Questions (FAQ Accordion) ─────────────────── */}
      <section id="faq" className="relative py-20 md:py-28 border-t border-[var(--line)] bg-[var(--surface-alt)]">
        <div className="mx-auto max-w-5xl lg:max-w-6xl px-6 sm:px-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-5 py-2 text-xs sm:text-sm text-[var(--ink-muted)] font-semibold mb-4 shadow-xs">
              <HelpCircle className="h-4.5 w-4.5 text-[var(--brand)]" />
              <span>Questions & Doubts Answered</span>
            </div>
            <h2 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-[var(--ink)]">
              Frequently asked questions.
            </h2>
            <p className="mt-4 text-lg sm:text-xl text-[var(--ink-muted)] leading-relaxed">
              No hidden clauses, no lock-in traps. Direct answers to the most common questions from Indian business owners.
            </p>
          </div>

          <div className="space-y-4">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx
              return (
                <div
                  key={idx}
                  className="rounded-3xl border border-[var(--line)] bg-[var(--surface)] transition-all duration-200 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-7 sm:p-8 text-left gap-5 hover:bg-[var(--surface-alt)]/30 transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span className="text-lg sm:text-xl font-bold text-[var(--ink)] pr-2">
                      {item.q}
                    </span>
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-alt)] border border-[var(--line)] text-[var(--brand)] transition-transform duration-200 ${
                        isOpen ? "rotate-180 bg-[var(--brand-soft)]" : ""
                      }`}
                    >
                      <ChevronDown className="h-5 w-5" />
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
                        <div className="px-7 pb-7 sm:px-8 sm:pb-8 pt-1 text-base sm:text-lg text-[var(--ink-muted)] leading-relaxed border-t border-[var(--line)]/50">
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
          <div className="mt-14 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 sm:p-10 text-center shadow-xs">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] mb-2.5">
              Have a custom business question or special workflow requirement?
            </h3>
            <p className="text-base sm:text-lg text-[var(--ink-muted)] max-w-2xl mx-auto mb-7">
              Our engineering team is ready to discuss your specific ERP, CRM, phone forwarding setup, or product catalog structure.
            </p>
            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[var(--brand)] px-8 py-4 text-base font-bold text-[#F6F1E7] hover:bg-[var(--brand-hover)] transition-all shadow-sm"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Ask Our Engineers on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 10. Final CTA (Full-Width Forest-Green Block) ──────────────────── */}
      <section className="relative bg-[var(--brand)] text-[#F6F1E7] py-24 md:py-32 overflow-hidden">
        <div className="relative mx-auto max-w-6xl lg:max-w-7xl px-6 sm:px-10 lg:px-12 text-center">
          <span className="font-mono text-xs sm:text-sm uppercase tracking-widest text-emerald-300 font-bold">
            Next Step — Initiate Your AI Build
          </span>
          <h2 className="font-serif mt-5 text-4xl sm:text-6xl lg:text-7xl font-normal text-[#F6F1E7] tracking-tight">
            Ready to hire your first AI Employee?
          </h2>
          <p className="mt-6 text-xl sm:text-2xl text-[#F6F1E7]/90 max-w-3xl mx-auto font-normal leading-relaxed">
            Stop letting after-hours leads go cold. Deploy a dedicated AI employee trained on your products, answering on Instagram, WhatsApp, Email, and Calls in seconds.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-4 text-sm sm:text-base font-mono text-emerald-200">
            <span>✓ 72-Hour Deployment Guarantee</span>
            <span>•</span>
            <span>✓ Retain Existing Phone & SIM</span>
            <span>•</span>
            <span>✓ Live Human Handoff Anytime</span>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-5">
            <a
              href={WHATSAPP_CTA}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-2xl bg-[var(--accent)] px-9 py-5 text-lg sm:text-xl font-bold text-white shadow-xl hover:bg-[var(--accent-hover)] transition-all hover:scale-105 active:scale-95"
            >
              <span>Deploy AI Employee on WhatsApp</span>
              <ArrowRight className="h-5 w-5" />
            </a>

            <a
              href={CALL_CTA}
              className="inline-flex items-center gap-3 rounded-2xl border border-[#F6F1E7]/30 bg-white/5 px-8 py-5 text-lg sm:text-xl font-bold text-[#F6F1E7] hover:bg-white/10 transition-colors"
            >
              <PhoneCall className="h-5 w-5 text-emerald-300" />
              <span>Call Voice AI: {CALL_NUMBER}</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─── 9. Footer (Organized Columns, Muted Ink on Cream) ──────────────── */}
      <footer className="border-t border-[var(--line)] bg-[#EFE8DA] pt-18 pb-14 text-base text-[var(--ink-muted)]">
        <div className="mx-auto max-w-[1380px] px-6 sm:px-10 lg:px-12">
          {/* Official Contact Columns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 pb-14 border-b border-[var(--line)]">
            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2.5 font-bold">WEBSITE</span>
              <a
                href={`https://${WEBSITE_URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {WEBSITE_URL}
              </a>
            </div>

            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2.5 font-bold">DIRECT EMAIL</span>
              <a
                href={`mailto:${EMAIL_ADDRESS}`}
                className="font-semibold text-base text-[var(--ink)] hover:text-[var(--brand)] transition-colors truncate block"
              >
                {EMAIL_ADDRESS}
              </a>
            </div>

            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2.5 font-bold">PHONE CALLS</span>
              <a
                href={CALL_CTA}
                className="font-semibold text-base text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {CALL_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2.5 font-bold">WHATSAPP</span>
              <a
                href={WHATSAPP_CTA}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                {WHATSAPP_NUMBER}
              </a>
            </div>

            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2.5 font-bold">HEADQUARTERS</span>
              <span className="font-semibold text-base text-[var(--ink)] block">
                {LOCATION}
              </span>
            </div>

            <div>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-wider text-[var(--ink-faint)] block mb-2.5 font-bold">INSTAGRAM</span>
              <a
                href={`https://instagram.com/${INSTAGRAM_HANDLE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-base text-[var(--ink)] hover:text-[var(--brand)] transition-colors"
              >
                @{INSTAGRAM_HANDLE}
              </a>
            </div>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-9 flex flex-col sm:flex-row items-center justify-between gap-5 text-sm sm:text-base">
            <p>© {new Date().getFullYear()} Vox AI Agents. Custom AI Solutions for Business. All rights reserved.</p>
            <div className="flex items-center gap-7">
              <Link href="/privacy-policy.html" className="hover:text-[var(--ink)] transition-colors">
                Privacy Policy
              </Link>
              <Link
                href={user ? "/dashboard" : "/login"}
                className="font-bold text-[var(--brand)] hover:underline flex items-center gap-2 transition-colors"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
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