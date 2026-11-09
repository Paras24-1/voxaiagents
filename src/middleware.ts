import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  
  // Get hostname (e.g. 'voxaiagents.com', 'dashboard.client.com', 'localhost:3000')
  const hostname = req.headers.get('host') || ''
  
  // Define our primary domains that SHOULD see the marketing landing page
  const isPrimaryDomain = 
    hostname.includes('voxaiagents.com') || 
    hostname.includes('localhost') || 
    hostname.includes('vercel.app') // Vercel staging domains

  // Native Mobile App Detection: If the native app opens '/', redirect directly to '/dashboard' on the server
  const userAgent = req.headers.get('user-agent') || ''
  const requestedWith = req.headers.get('x-requested-with') || ''
  const isNativeApp = 
    userAgent.includes('Capacitor') || 
    requestedWith.includes('com.voxai.dashboard') || 
    url.searchParams.get('app') === 'true' ||
    req.cookies.get('is_native_app')?.value === 'true'

  if (url.pathname === '/' && isNativeApp) {
    const res = NextResponse.redirect(new URL('/dashboard', req.url))
    res.cookies.set('is_native_app', 'true', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return res
  }

  // If someone visits the root '/' on a CUSTOM white-label domain
  if (!isPrimaryDomain && url.pathname === '/') {
    // Redirect them straight to the login page so they don't see the marketing site
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  const res = NextResponse.next()
  if (isNativeApp) {
    res.cookies.set('is_native_app', 'true', { path: '/', maxAge: 60 * 60 * 24 * 365 })
  }
  return res
}

// Only run middleware on the root path and main pages, ignore static files and API
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}