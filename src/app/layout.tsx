import type { Metadata, Viewport } from 'next'
import { ThemeProvider } from 'next-themes'
import OrgProvider from '@/contexts/OrgContext'
import './globals.css'
import CapacitorBridge from '@/components/CapacitorBridge'

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

import { headers } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  let host = headersList.get('x-forwarded-host') || headersList.get('host') || ''
  
  // Clean the host (remove port, http://, etc.)
  host = host.replace('https://', '').replace('http://', '').split(':')[0]
  
  // Default metadata
  let title = 'VOX AI — Intelligent WhatsApp AI Agents'
  let description = 'VOX AI builds intelligent WhatsApp AI agents that qualify leads, automate bookings, drive sales, and support customers 24/7.'
  let icon = '/vox_ai_favicon.svg'

  try {
    // Check specific domains first
    if (host.includes('10xyourbusiness')) {
      icon = '/10x_favicon.jpeg'
    } else if (host.includes('iwebmagics')) {
      icon = '/iwebmagics_favicon.png' // fallback if we have it
    }

    // Look up custom domain in organizations
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('brand_title')
      .ilike('custom_domain', `%${host}%`) // use ilike to be forgiving
      .maybeSingle()
      
    if (org && org.brand_title) {
      title = org.brand_title
      // If we add custom favicon support later, we can set icon = org.favicon_url here
    }
  } catch (err) {
    console.error('Failed to fetch metadata for domain', host, err)
  }

  return {
    title,
    description,
    icons: {
      icon,
      apple: '/favicon.png',
    },
    manifest: '/manifest.json',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'black-translucent',
      title: 'VOX AI',
    },
  }
}

import FollowupNotifier from '@/components/FollowupNotifier'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Inter:wght@300..800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-[#0B0F19] text-gray-900 dark:text-gray-100 min-h-[100dvh] overscroll-none">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <OrgProvider>
            {children}
            <FollowupNotifier />
            <CapacitorBridge />
          </OrgProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
