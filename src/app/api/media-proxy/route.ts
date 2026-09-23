import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function createSvgPlaceholder(text: string): Response {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180" fill="none">
    <rect width="320" height="180" rx="12" fill="#1e293b"/>
    <path d="M110 110L135 85L160 110M150 100L170 80L210 120" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="125" cy="70" r="10" stroke="#64748b" stroke-width="2"/>
    <text x="160" y="145" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#94a3b8" text-anchor="middle">${text}</text>
  </svg>`
  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    let targetUrl = searchParams.get('url')
    const msgId = searchParams.get('msg_id')

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    // 1. If it's an old Supabase project URL, rewrite domain to current active project
    if (targetUrl.includes('jncmizoejeaclpnfxazg.supabase.co')) {
      targetUrl = targetUrl.replace('jncmizoejeaclpnfxazg.supabase.co', 'jadyvppkmxhsnrmqshbr.supabase.co')
    }

    // 2. If it's already a public active Supabase URL, redirect directly
    if (targetUrl.includes('jadyvppkmxhsnrmqshbr.supabase.co') && !targetUrl.includes('lookaside') && !targetUrl.includes('fbsbx')) {
      return NextResponse.redirect(targetUrl)
    }

    console.log('[media-proxy] Processing media URL:', targetUrl)
    
    // 3. Attempt fetch
    let res = await fetch(targetUrl)

    // 4. If fetch failed (e.g. 401 Unauthorized for Facebook lookaside), try with tokens
    if (!res.ok && (targetUrl.includes('lookaside') || targetUrl.includes('fbsbx') || res.status === 401 || res.status === 403)) {
      console.warn('[media-proxy] Unauthenticated fetch failed:', res.status, res.statusText)
      
      const tokensToTry: string[] = []
      
      if (process.env.META_ACCESS_TOKEN) tokensToTry.push(process.env.META_ACCESS_TOKEN)
      if (process.env.WHATSAPP_TOKEN) tokensToTry.push(process.env.WHATSAPP_TOKEN)
      if (process.env.WHATSAPP_API_TOKEN) tokensToTry.push(process.env.WHATSAPP_API_TOKEN)
      if (process.env.SYSTEM_META_TOKEN) tokensToTry.push(process.env.SYSTEM_META_TOKEN)

      // Fetch org tokens if available
      const { data: orgSettings } = await supabaseAdmin
        .from('organization_settings')
        .select('whatsapp_token')
        .not('whatsapp_token', 'is', null)

      if (orgSettings) {
        orgSettings.forEach(s => {
          if (s.whatsapp_token) tokensToTry.push(s.whatsapp_token)
        })
      }

      for (const token of Array.from(new Set(tokensToTry))) {
        try {
          const authenticatedRes = await fetch(targetUrl, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (authenticatedRes.ok) {
            res = authenticatedRes
            break
          }
        } catch (authErr) {
          console.error('[media-proxy] Token fetch attempt error:', authErr)
        }
      }
    }

    if (!res.ok) {
      console.error('[media-proxy] Failed to fetch external media:', res.status, res.statusText)
      return createSvgPlaceholder('Media attachment unavailable')
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg'
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 5. Upload to active Supabase Storage asynchronously for direct CDN caching
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : contentType.includes('pdf') ? 'pdf' : contentType.includes('ogg') || contentType.includes('audio') ? 'ogg' : 'jpg'
    const fileName = `proxy-media/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    supabaseAdmin.storage
      .from('chat-media')
      .upload(fileName, buffer, { contentType, upsert: true })
      .then(async ({ data, error }) => {
        if (error && (error.message?.includes('Bucket not found') || String(error).includes('not found'))) {
          await supabaseAdmin.storage.createBucket('chat-media', { public: true })
          const retry = await supabaseAdmin.storage.from('chat-media').upload(fileName, buffer, { contentType, upsert: true })
          if (retry.data) {
            const { data: pUrl } = supabaseAdmin.storage.from('chat-media').getPublicUrl(fileName)
            if (pUrl?.publicUrl && msgId) {
              await supabaseAdmin.from('messages').update({ media_url: pUrl.publicUrl }).eq('id', msgId)
            }
          }
        } else if (data) {
          const { data: pUrl } = supabaseAdmin.storage.from('chat-media').getPublicUrl(fileName)
          if (pUrl?.publicUrl && msgId) {
            await supabaseAdmin.from('messages').update({ media_url: pUrl.publicUrl }).eq('id', msgId)
          }
        }
      })
      .catch((e) => console.error('[media-proxy background upload error]:', e))

    // 6. Return image buffer directly to browser
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (err: any) {
    console.error('[media-proxy error]:', err)
    return createSvgPlaceholder('Media processing error')
  }
}

