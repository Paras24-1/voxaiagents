'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useOrg } from '@/contexts/OrgContext'
import { useTheme } from 'next-themes'
import AdminPanel from '@/components/admin/AdminPanel'
import SettingsPanel from '@/components/admin/SettingsPanel'
import { supabase } from '@/lib/supabaseClient'
import { 
  Menu, X, BarChart2, MessageSquare, Calendar, Users, 
  Send, Sun, Moon, Settings, LogOut, Package, PhoneCall, ShoppingBag, Mail, Shield, MessageCircle, Globe, GitBranch, Brain, Sparkles
} from 'lucide-react'

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [privacyUrl, setPrivacyUrl] = useState('/privacy-policy.html')
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('10xyourbusiness')) {
      setPrivacyUrl('https://app.10xyourbusiness.in/privacy-policy.html')
    }
  }, [])
  
  const { profile, org, signOut } = useOrg()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  
  const isAdmin = profile?.role === 'admin' || profile?.role === 'owner'
  const isDark = theme === 'dark'

  const toggleSidebar = () => setIsOpen(!isOpen)
  const closeSidebar = () => setIsOpen(false)

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  useEffect(() => {
    if (org?.name) {
      document.title = `${org.name} — Workspace Dashboard`
    }
  }, [org?.name])

  useEffect(() => {
    if (!profile?.org_id) return
    const fetchUnread = async () => {
      try {
        const { count } = await supabase
          .from('conversations')
          .select('id', { count: 'exact', head: true })
          .eq('org_id', profile.org_id)
          .gt('unread_count', 0)
        if (typeof count === 'number') {
          setUnreadCount(count)
        }
      } catch (err) {
        console.error('Failed to fetch unread count:', err)
      }
    }
    fetchUnread()
  }, [profile?.org_id])

  const navItems = [
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart2,
      visible: isAdmin
    },
    {
      name: 'Chats',
      href: '/chats',
      icon: MessageSquare,
      visible: true
    },
    {
      name: 'Canned Replies',
      href: '/canned-replies',
      icon: MessageCircle,
      visible: true
    },
    {
      name: 'Meta Templates',
      href: '/templates',
      icon: Sparkles,
      visible: true
    },
    {
      name: 'Bot Brain',
      href: '/bot-brain',
      icon: Brain,
      visible: true
    },
    {
      name: 'Voice AI',
      href: '/voice',
      icon: PhoneCall,
      visible: true
    },
    {
      name: 'Comments',
      href: '/comments',
      icon: MessageCircle,
      visible: Boolean(org?.has_comments_crm)
    },
    {
      name: 'Booking Calendar',
      href: '/calendar',
      icon: Calendar,
      visible: true
    },
    {
      name: 'Followups',
      href: '/followups',
      icon: Calendar,
      visible: true
    },
    {
      name: 'Followup Workflows',
      href: '/workflows',
      icon: GitBranch,
      visible: true
    },
    {
      name: 'Lead CRM',
      href: '/leads',
      icon: Users,
      visible: true
    },
    {
      name: 'Products',
      href: '/products',
      icon: Package,
      visible: true
    },
    {
      name: 'Orders & Status',
      href: '/orders',
      icon: ShoppingBag,
      visible: Boolean(org?.has_orders_crm)
    },
    {
      name: 'Email Inbox',
      href: '/emails',
      icon: Mail,
      visible: Boolean(org?.has_emails_crm)
    },
    {
      name: 'Bulk Message',
      href: '/bulk',
      icon: Send,
      visible: true
    },
    {
      name: 'Leads Scraper',
      href: '/scraper',
      icon: Globe,
      visible: true
    }
  ]

  return (
    <>
      {/* Hamburger Menu Trigger Button */}
      <button
        onClick={toggleSidebar}
        className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-emerald-400 border border-slate-700/80 hover:border-emerald-500/50 transition-all shadow-md shrink-0 flex items-center gap-2 group active:scale-95"
        title="Open navigation menu"
      >
        <Menu className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
      </button>

      {/* Slide-out Sidebar Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`
        fixed top-0 left-0 h-screen w-64 bg-slate-900 border-r border-slate-800 text-slate-100 z-[9999]
        transform transition-transform duration-300 ease-in-out flex flex-col justify-between shadow-2xl overflow-hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Top Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-emerald-600 text-white shrink-0">
          <span className="font-bold text-sm truncate pr-2">{org?.name || 'Navigation Menu'}</span>
          <button 
            onClick={closeSidebar}
            className="p-1 rounded-lg hover:bg-emerald-700 text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Middle Section: Nav Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <nav className="space-y-1">
            {navItems.filter(item => item.visible).map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeSidebar}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all
                    ${isActive 
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold' 
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.name === 'Chats' && unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-black rounded-full bg-red-500 text-white shadow-xs animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )
            })}

            {/* Team Option (Admin Panel Trigger) */}
            {isAdmin && (
              <button
                onClick={() => {
                  closeSidebar()
                  setShowAdmin(true)
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800/70 hover:text-white transition-all border border-transparent"
              >
                <Users className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Team</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950 shrink-0">
          
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* Settings Trigger */}
          {isAdmin && (
            <button
              onClick={() => {
                closeSidebar()
                setShowSettings(true)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings</span>
            </button>
          )}

          {/* Privacy Policy */}
          <Link
            href={privacyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Shield className="w-4 h-4 text-slate-400" />
            <span>Privacy Policy</span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* Shared Modals */}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}
