'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Users, Brain, Send, Menu } from 'lucide-react'
import { useOrg } from '@/contexts/OrgContext'
import { supabase } from '@/lib/supabaseClient'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { user, profile } = useOrg()
  const [unreadCount, setUnreadCount] = useState(0)
  const [hidden, setHidden] = useState(false)

  // Listen to toggle-bottom-nav custom events (e.g. when typing inside an active chat)
  useEffect(() => {
    const handleToggle = (e: CustomEvent) => {
      if (typeof e.detail?.show === 'boolean') {
        setHidden(!e.detail.show)
      }
    }
    window.addEventListener('toggle-bottom-nav' as any, handleToggle)
    return () => window.removeEventListener('toggle-bottom-nav' as any, handleToggle)
  }, [])

  // Check body class mutation as well
  useEffect(() => {
    const checkClass = () => {
      setHidden(document.body.classList.contains('hide-bottom-nav'))
    }
    const observer = new MutationObserver(checkClass)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Fetch unread count for chats badge
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
        console.error('Failed to fetch unread count for mobile nav:', err)
      }
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 15000)
    return () => clearInterval(interval)
  }, [profile?.org_id])

  // Don't render if user not logged in or on auth pages, or if pathname is not yet resolved
  if (!user || !pathname || pathname === '/login' || pathname === '/register' || pathname === '/') {
    return null
  }

  if (hidden) {
    return null
  }

  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent('open-sidebar'))
  }

  const tabs = [
    {
      name: 'Chats',
      href: '/chats',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : null,
      isActive: Boolean(pathname?.startsWith('/chats'))
    },
    {
      name: 'Leads',
      href: '/leads',
      icon: Users,
      badge: null,
      isActive: Boolean(pathname?.startsWith('/leads'))
    },
    {
      name: 'Bot Brain',
      href: '/bot-brain',
      icon: Brain,
      badge: null,
      isActive: Boolean(pathname?.startsWith('/bot-brain'))
    },
    {
      name: 'Broadcast',
      href: '/bulk',
      icon: Send,
      badge: null,
      isActive: Boolean(pathname?.startsWith('/bulk'))
    },
    {
      name: 'Menu',
      href: '#',
      icon: Menu,
      badge: null,
      onClick: openSidebar,
      isActive: false
    }
  ]

  return (
    <nav 
      aria-label="Mobile Navigation Bar" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/90 dark:border-slate-800/90 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] transition-all select-none"
    >
      <div className="flex items-center justify-around h-14 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const content = (
            <div className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-90 ${
              tab.isActive 
                ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-200'
            }`}>
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${tab.isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center shadow-xs">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 tracking-tight leading-none ${tab.isActive ? 'font-extrabold' : 'font-medium'}`}>
                {tab.name}
              </span>
              {tab.isActive && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-emerald-500" />
              )}
            </div>
          )

          if (tab.onClick) {
            return (
              <button 
                key={tab.name} 
                onClick={tab.onClick}
                className="flex-1 flex items-center justify-center py-1 cursor-pointer"
                title={tab.name}
              >
                {content}
              </button>
            )
          }

          return (
            <Link 
              key={tab.name} 
              href={tab.href}
              className="flex-1 flex items-center justify-center py-1 cursor-pointer"
              title={tab.name}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
