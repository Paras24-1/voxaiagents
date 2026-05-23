'use client'

import { motion, useScroll, useSpring, useTransform } from "framer-motion"
import {
  ArrowRight, BadgeCheck, BarChart3, Brain, Building2, CalendarDays,
  Check, ChevronRight, CircuitBoard, FileVideo2, Globe, GraduationCap,
  Headphones, HeartPulse, LineChart, Link2, Lock, MessagesSquare,
  PhoneCall, PlugZap, Rocket, ShieldCheck, ShoppingBag, Sparkles,
  Star, Stethoscope, Timer, Users, Wallet, LayoutDashboard, LogIn
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useOrg } from "@/contexts/OrgContext"

const WHATSAPP_DEMO = "wa.me/917889019602?text=Hi%20I%20want%20to%20test%20Vox%20AI"

function useCountUp(target: number, start: boolean, durationMs = 900) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / durationMs)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, start, durationMs])
  return value
}

function SectionHeading({ eyebrow, title, subtitle, id }: {
  eyebrow: string; title: string; subtitle: string; id?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
        <span>{eyebrow}</span>
      </div>
      <h2 className="font-display mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mt-3 text-balance text-sm leading-relaxed text-muted-foreground sm:text-base">{subtitle}</p>
    </div>
  )
}

function GradientOrb({ className, color }: { className: string; color: "primary" | "accent" }) {
  const c = color === "primary" ? "hsl(var(--primary) / .22)" : "hsl(var(--accent) / .20)"
  return (
    <div className={"pointer-events-none absolute rounded-full blur-3xl " + className}
      style={{ background: `radial-gradient(circle at 30% 30%, ${c}, transparent 60%)` }} aria-hidden />
  )
}

function NeuralField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let raf = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const points = Array.from({ length: 48 }).map(() => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00055,
      vy: (Math.random() - 0.5) * 0.00055,
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
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
      }
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j]
          const ax = a.x * w, ay = a.y * h, bx = b.x * w, by = b.y * h
          const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2)
          if (dist > 180) continue
          ctx.strokeStyle = `rgba(255,255,255,${(1 - dist / 180) * 0.28})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke()
        }
      }
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, "rgba(160, 85, 255, 0.35)")
      grad.addColorStop(1, "rgba(45, 212, 255, 0.25)")
      for (const p of points) {
        ctx.fillStyle = grad; ctx.globalAlpha = 0.9
        ctx.beginPath(); ctx.arc(p.x * w, p.y * h, 1.8, 0, Math.PI * 2); ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-60" aria-hidden />
}

function WhatsappMock() {
  const messages = useMemo(() => [
    { from: "lead", text: "Hi, do you handle dental bookings?", t: "10:14" },
    { from: "ai", text: "Yes. I can qualify you and book the next available slot.", t: "10:14" },
    { from: "lead", text: "Can you handle real estate leads?", t: "10:15" },
    { from: "ai", text: "Yes I can instantly book viewings, send reminders, handle follow-ups, and route hot prospects directly to your sales agent.", t: "10:15" },
    { from: "lead", text: "Is there anything that you can't do?", t: "10:15" },
    { from: "ai", text: "We handle the repetitive work so your team focuses on closing.", t: "10:16" },
  ], [])
  return (
    <div className="vox-glass vox-noise rounded-2xl p-4 md:p-5 vox-glow">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-[1px]">
            <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black/50">
              <MessagesSquare className="h-4 w-4 text-white" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Vox AI Agent</div>
            <div className="text-xs text-muted-foreground">Context-aware • Multi-language • 24/7</div>
          </div>
        </div>
        <span className="border border-white/10 bg-white/5 text-xs text-muted-foreground px-2 py-0.5 rounded-full">Live Demo</span>
      </div>
      <div className="mt-4 space-y-2.5">
        {messages.map((m, idx) => {
          const isAI = m.from === "ai"
          return (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={"flex " + (isAI ? "justify-start" : "justify-end")}>
              <div className={"max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed " +
                (isAI ? "bg-white/5 text-foreground border border-white/10"
                  : "bg-gradient-to-br from-[hsl(var(--primary)/.85)] to-[hsl(var(--accent)/.75)] text-white")}>
                <div>{m.text}</div>
                <div className={"mt-1 text-[11px] " + (isAI ? "text-muted-foreground" : "text-white/80")}>{m.t}</div>
              </div>
            </motion.div>
          )
        })}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
        <div className="h-2 w-2 rounded-full bg-[hsl(var(--accent))] shadow-[0_0_24px_hsl(var(--accent)/.8)]" />
        <div className="text-xs text-muted-foreground">AI is typing…</div>
      </div>
    </div>
  )
}

function Navbar() {
  const { user, loading } = useOrg()

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <a href="#" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-[1px]">
                <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black/55">
                  <Brain className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <div className="font-display text-sm font-semibold tracking-tight">VOX AI</div>
                <div className="text-xs text-muted-foreground">WhatsApp AI Agents</div>
              </div>
            </a>

            <div className="hidden items-center gap-6 md:flex">
              {[["Features", "#features"], ["How it works", "#process"], ["Industries", "#industries"], ["Pricing", "#pricing"], ["FAQ", "#faq"]].map(([label, href]) => (
                <a key={href} href={href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{label}</a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open("https://calendly.com/voxai4278/30min", "_blank")}
                className="hidden border border-white/10 bg-white/5 text-foreground hover:bg-white/10 md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-colors"
              >
                Book Strategy Call
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* LOGIN / DASHBOARD BUTTON */}
              {!loading && (
                user ? (
                  <Link href="/dashboard"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-95 transition-opacity">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/login"
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-95 transition-opacity">
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 20 })
  const [statsInView, setStatsInView] = useState(false)
  const statsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) setStatsInView(true)
    }, { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const s1 = useCountUp(60, statsInView)
  const s2 = useCountUp(40, statsInView)
  const s3 = useCountUp(80, statsInView)
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -40])

  return (
    <div className="dark min-h-screen bg-background text-foreground">

      <motion.div className="fixed left-0 top-0 h-1 w-full origin-left bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--primary))]"
        style={{ scaleX: progress }} aria-hidden />

      <Navbar />

      <main className="pt-28">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 vox-grid opacity-70" />
            <GradientOrb className="-top-24 left-[-10%] h-[520px] w-[520px]" color="primary" />
            <GradientOrb className="top-10 right-[-12%] h-[520px] w-[520px]" color="accent" />
            <div className="absolute inset-0 opacity-70"><NeuralField /></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black" />
          </div>
          <div className="vox-container vox-noise relative">
            <div className="grid items-center gap-12 pb-20 pt-10 md:grid-cols-2 md:pb-28 md:pt-16">
              <motion.div style={{ y: heroY }}>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                  Official WhatsApp Business API • GDPR-ready
                </div>
                <h1 className="font-display mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                  Your Business Deserves an{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">AI Employee</span>.
                </h1>
                <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Vox AI builds intelligent WhatsApp AI agents that handle leads, bookings, sales, support, and follow-ups — 24/7.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a href={`https://${WHATSAPP_DEMO}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center justify-center h-11 bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white px-6 rounded-xl font-medium text-sm hover:opacity-95 transition-opacity">
                    Test the AI Agent <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <a href="#contact"
                    className="inline-flex items-center justify-center h-11 border border-white/10 bg-white/5 text-foreground hover:bg-white/10 px-6 rounded-xl font-medium text-sm transition-colors">
                    Book Strategy Call
                  </a>
                </div>
                <div className="mt-7 grid grid-cols-2 gap-3 sm:max-w-lg sm:grid-cols-3">
                  {[{ icon: <Timer className="h-4 w-4" />, label: "24/7 Coverage" },
                    { icon: <PlugZap className="h-4 w-4" />, label: "Full Automation" },
                    { icon: <Lock className="h-4 w-4" />, label: "Secure by design" }].map((b, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 text-foreground/90">
                        <span className="text-[hsl(var(--accent))]">{b.icon}</span>
                        <span>{b.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
              <div className="relative"><WhatsappMock /></div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative py-20">
          <div className="vox-container">
            <SectionHeading eyebrow="What VOX AI does" title="Premium automation across the full customer journey"
              subtitle="From the first inbound message to booked appointments, payments, and support — Vox AI runs your WhatsApp channel like an elite team member." />
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <Users className="h-5 w-5" />, title: "24/7 Smart Lead Qualification", body: "Instantly responds, qualifies with intelligent questions, and routes high-intent leads to your team.", points: ["Automatically replies to new inquiries in seconds", "Qualifies by budget, urgency, and location", "Tags leads inside your CRM", "Sends qualified leads directly to sales team"] },
                { icon: <CalendarDays className="h-5 w-5" />, title: "Appointment & Calendar Automation", body: "Real-time scheduling that reduces no-shows and keeps calendars full.", points: ["Syncs with Google Calendar", "Checks real-time availability", "Books appointments automatically", "Sends reminders + follow-ups"] },
                { icon: <Brain className="h-5 w-5" />, title: "AI-Powered Conversations", body: "GPT-powered natural language conversations designed for results.", points: ["Natural responses with brand tone control", "Context memory across sessions", "Handles objections with dynamic reasoning", "Multi-language support"] },
                { icon: <Wallet className="h-5 w-5" />, title: "Sales Automation", body: "Drive revenue with product logic, payments, and retention triggers.", points: ["Product recommendations", "Payment link generation", "Abandoned cart recovery", "Upsell & cross-sell logic"] },
                { icon: <Link2 className="h-5 w-5" />, title: "CRM & System Integration", body: "Plug into your stack and automate end-to-end operations.", points: ["Integrates with n8n, Zapier, HubSpot", "Google Sheets + internal tools", "Custom APIs supported", "Real-time data sync"] },
                { icon: <BarChart3 className="h-5 w-5" />, title: "Analytics Dashboard", body: "Full visibility into conversations, sources, and ROI.", points: ["Conversation tracking", "Lead source tracking", "Conversion metrics", "ROI reporting"] },
              ].map((f, i) => (
                <div key={i} className="vox-glass vox-noise rounded-2xl p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[hsl(var(--accent))]">{f.icon}</div>
                    <div>
                      <div className="font-display text-lg font-semibold">{f.title}</div>
                      <div className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.body}</div>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {f.points.map((p, j) => (
                      <li key={j} className="flex gap-2 text-sm text-foreground/90">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" /><span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section id="process" className="relative py-20">
          <div className="vox-container">
            <SectionHeading eyebrow="How we develop your AI agent" title="A build process engineered for conversion, reliability, and safety"
              subtitle="We combine prompt engineering, conversation flow design, and secure automation to deliver WhatsApp agents that feel human — and perform like machines." />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <div className="vox-glass vox-noise rounded-2xl p-6">
                <div className="font-display text-lg font-semibold">Development Timeline</div>
                <div className="mt-4 space-y-3">
                  {["Business Deep Analysis", "AI Logic Architecture Design", "Conversation Flow Engineering", "API + Automation Integration", "WhatsApp Official API Setup", "Testing & Optimization", "Deployment & Monitoring"].map((v, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.35, delay: i * 0.05 }}
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-[1px]">
                          <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-black/55 text-xs font-semibold">{i + 1}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Step {i + 1}</div>
                          <div className="text-sm font-medium">{v}</div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="vox-glass vox-noise rounded-2xl p-6">
                <div className="font-display text-lg font-semibold">What's included</div>
                <ul className="mt-4 space-y-2">
                  {["Official WhatsApp Business API implementation", "Secure server architecture principles", "Prompt engineering logic + brand tone control", "Fallback handling for edge cases and handoff", "Custom business knowledge training", "Monitoring + optimization after launch"].map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <Star className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                      <span className="text-foreground/90">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-br from-[hsl(var(--primary)/.18)] via-white/5 to-[hsl(var(--accent)/.12)] p-5">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-[hsl(var(--accent))]" />
                    <div>
                      <div className="font-display text-base font-semibold">Built for enterprise trust</div>
                      <div className="mt-1 text-sm text-muted-foreground">Vox AI emphasizes safety, privacy, and compliance — so your automation never compromises customer experience.</div>
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  <a href={`https://${WHATSAPP_DEMO}`} target="_blank" rel="noreferrer"
                    className="inline-flex items-center bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-95 transition-opacity">
                    Chat on WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="relative py-20" ref={statsRef}>
          <div className="vox-container">
            <SectionHeading eyebrow="Results" title="Performance that compounds"
              subtitle="When your response speed hits seconds, your pipeline becomes predictable — and your team gets their time back." />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Faster Lead Response", value: `${s1}%`, icon: <Timer className="h-5 w-5" /> },
                { label: "Increase in Conversions", value: `${s2}%`, icon: <LineChart className="h-5 w-5" /> },
                { label: "Reduced Admin Work", value: `${s3}%`, icon: <Users className="h-5 w-5" /> },
                { label: "Availability", value: "24/7", icon: <Globe className="h-5 w-5" /> },
              ].map((s, i) => (
                <div key={i} className="vox-glass vox-noise rounded-2xl p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[hsl(var(--accent))]">{s.icon}</div>
                    <div className="text-right">
                      <div className="font-display text-2xl font-semibold">{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              <div className="vox-glass vox-noise rounded-2xl p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileVideo2 className="h-4 w-4 text-[hsl(var(--accent))]" /> N8N
                </div>
                <div className="font-display mt-2 text-lg font-semibold">How The Workflow in the Backend Will Look Like</div>
                <img src="/n8n-diagram.png" alt="n8n backend workflow" className="mt-4 aspect-video w-full rounded-xl border border-white/10 object-cover shadow-lg transition-transform duration-300 hover:scale-[1.02]" />
              </div>
              <div className="vox-glass vox-noise rounded-2xl p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-[hsl(var(--primary))]" /> Dashboard With CRM
                </div>
                <div className="font-display mt-2 text-lg font-semibold">WhatsApp Dashboard With Integrated CRM</div>
                <img src="/whatsapp-dashboard.png" alt="WhatsApp Dashboard" className="mt-4 aspect-video w-full rounded-xl border border-white/10 object-cover shadow-lg transition-transform duration-300 hover:scale-[1.02]" />
              </div>
            </div>
          </div>
        </section>

        {/* Industries */}
        <section id="industries" className="relative py-20">
          <div className="vox-container">
            <SectionHeading eyebrow="Industries we serve" title="Built for high-intent inbound businesses"
              subtitle="Vox AI is designed to qualify, book, and sell — across industries where speed and trust win deals." />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: <Stethoscope className="h-5 w-5" />, title: "Dental Clinics", body: "Automate booking, pre-qualification, reminders, and post-visit follow-ups." },
                { icon: <HeartPulse className="h-5 w-5" />, title: "Physiotherapy Clinics", body: "Reduce no-shows and keep schedules full with smart availability handling." },
                { icon: <Building2 className="h-5 w-5" />, title: "Real Estate", body: "Qualify by budget and location, schedule viewings, and route hot leads instantly." },
                { icon: <ShoppingBag className="h-5 w-5" />, title: "E-commerce", body: "Handle objections, generate payment links, recover abandoned carts, and upsell." },
                { icon: <GraduationCap className="h-5 w-5" />, title: "Coaching & Education", body: "Qualify prospects, deliver program info, and book calls automatically." },
                { icon: <Headphones className="h-5 w-5" />, title: "Service Businesses", body: "Quote, book, and support customers with high-quality conversational automation." },
              ].map((it, i) => (
                <div key={i} className="vox-glass vox-noise rounded-2xl p-6">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[hsl(var(--accent))]">{it.icon}</div>
                    <div>
                      <div className="font-display text-lg font-semibold">{it.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{it.body}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="relative py-20">
          <div className="vox-container">
            <SectionHeading eyebrow="Pricing" title="Choose the build level for your growth"
              subtitle="Transparent tiers for different stages — with custom integrations and enterprise requirements available." />
            <div className="mt-10 flex justify-center">
              <div className="vox-glass vox-noise vox-glow relative max-w-lg w-full rounded-2xl p-8">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-display text-2xl font-semibold">Custom AI Solutions</div>
                  <span className="border border-white/10 bg-white/5 text-muted-foreground text-xs px-2 py-1 rounded-full">Enterprise</span>
                </div>
                <div className="mt-6">
                  <div className="text-4xl font-semibold tracking-tight">Custom</div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Tailored AI architecture designed specifically for your business workflows, deep integrations, and custom logic requirements.</p>
                </div>
                <ul className="mt-8 space-y-3">
                  {["Custom conversation logic & flows", "Deep CRM & API integrations", "Official WhatsApp API setup", "Full testing & optimization", "Ongoing monitoring & support"].map((it, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent))]" />
                      <span className="text-foreground/90">{it}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-10">
                  <a href="https://calendly.com/voxai4278/30min" target="_blank" rel="noreferrer"
                    className="flex items-center justify-center w-full h-12 text-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white rounded-xl font-medium hover:opacity-95 transition-opacity">
                    Book a Strategy Call <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative py-20">
          <div className="vox-container">
            <SectionHeading eyebrow="FAQ" title="Everything leadership asks — answered"
              subtitle="If you want, we can tailor these answers to your exact compliance and tech requirements." />
            <div className="mx-auto mt-10 max-w-3xl vox-glass vox-noise rounded-2xl p-3 sm:p-4">
              {[
                { q: "Do you use the official WhatsApp Business API?", a: "Yes. Vox AI is designed around the official WhatsApp Business API so businesses can operate reliably and align with Meta's policies." },
                { q: "Can the agent integrate with our CRM and automations?", a: "Yes. We commonly integrate with n8n, Zapier, HubSpot, GoHighLevel, Google Sheets, and custom APIs for real-time sync." },
                { q: "How do you handle safety and edge cases?", a: "We implement fallback flows, guardrails, and human handoff rules. The goal is a great customer experience under all conditions." },
                { q: "Do you support multiple languages?", a: "Yes. Vox AI agents can detect language and respond appropriately while maintaining your brand tone." },
                { q: "Is this GDPR compliant?", a: "We design for privacy and compliance, including secure storage, controlled access, and data minimization principles." },
              ].map((f, i) => (
                <details key={i} className="border-b border-white/10 last:border-0">
                  <summary className="cursor-pointer py-4 text-sm font-medium text-foreground hover:text-[hsl(var(--accent))] transition-colors list-none flex items-center justify-between">
                    {f.q} <ChevronRight className="h-4 w-4 shrink-0" />
                  </summary>
                  <div className="pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="relative py-20">
          <div className="vox-container">
            <div className="vox-glass vox-noise rounded-3xl p-7 sm:p-10">
              <div className="grid gap-10 md:grid-cols-2">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                    <PhoneCall className="h-3.5 w-3.5 text-[hsl(var(--accent))]" /> Strategy call
                  </div>
                  <div className="font-display mt-4 text-3xl font-semibold tracking-tight">Stop Hiring More People. Deploy AI Instead.</div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Tell us your industry, your current lead flow, and what you want automated. We'll map a system that ships fast and performs.</p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button onClick={() => window.open("https://calendly.com/voxai4278/30min", "_blank")}
                      className="hidden border border-white/10 bg-white/5 text-foreground hover:bg-white/10 md:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm transition-colors">
                      Book Strategy Call <ChevronRight className="h-4 w-4" />
                    </button>
                    <a href={`https://${WHATSAPP_DEMO}`} target="_blank" rel="noreferrer"
                      className="inline-flex items-center justify-center h-11 border border-white/10 bg-white/5 text-foreground hover:bg-white/10 px-4 rounded-xl text-sm transition-colors">
                      Test AI on WhatsApp
                    </a>
                  </div>
                </div>
                <div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-8 text-center">
                    <div className="font-display text-lg font-semibold mb-3">Book a Strategy Call</div>
                    <p className="text-sm text-muted-foreground mb-6">Let's discuss how Vox AI can automate and scale your business.</p>
                    <a href="https://calendly.com/voxai4278/30min" target="_blank" rel="noreferrer"
                      className="inline-flex items-center bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-95 transition-opacity">
                      Book 30-Min Meeting <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[{ icon: <Globe className="h-5 w-5" />, label: "Location", value: "Ludhiana, India" },
                      { icon: <BadgeCheck className="h-5 w-5" />, label: "Focus", value: "Scalable AI systems" }].map((c, i) => (
                      <div key={i} className="vox-glass vox-noise rounded-2xl p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="text-[hsl(var(--accent))]">{c.icon}</span><span>{c.label}</span>
                        </div>
                        <div className="font-display mt-2 text-base font-semibold">{c.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-10 flex items-center justify-between gap-6 border-t border-white/10 pt-6 text-xs text-muted-foreground">
                <div>© {new Date().getFullYear()} VOX AI. All rights reserved.</div>
                <div className="hidden items-center gap-4 sm:flex">
  <Link
    href="/privacy-policy.html"
    target="_blank"
    className="hover:text-foreground"
  >
    Privacy Policy
  </Link>

  <a href="#" className="hover:text-foreground">
    Terms
  </a>

  <a href="#" className="hover:text-foreground">
    Security
  </a>
</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Floating WhatsApp */}
      <a href={`https://${WHATSAPP_DEMO}`} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50">
        <div className="group rounded-full border border-white/10 bg-black/35 p-1.5 backdrop-blur-xl">
          <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-4 py-3 text-sm font-semibold text-white shadow-[0_20px_70px_hsl(var(--primary)/.25)] transition-transform group-hover:scale-[1.02]">
            <MessagesSquare className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp Demo</span>
          </div>
        </div>
      </a>
    </div>
  )
}