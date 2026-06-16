import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const MIME_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/mp4': 'm4a',
  'audio/amr': 'amr',
  'video/mp4': 'mp4',
  'video/3gpp': '3gp',
  'application/pdf': 'pdf',
  'application/msword': 'doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const orgSlug = searchParams.get('org') || ''

    const body = await req.json()
    const { media_id, whatsapp_token, org_id } = body

    if (!media_id || !whatsapp_token) {
      return NextResponse.json(
        { error: 'Missing media_id or whatsapp_token' },
        { status: 400 }
      )
    }

    // 1. Resolve orgId
    let resolvedOrgId = org_id || null
    if (!resolvedOrgId && orgSlug) {
      const { data: org } = await supabaseAdmin
        .from('organizations')
        .select('id')
        .eq('slug', orgSlug)
        .single()
      resolvedOrgId = org?.id || null
    }

    if (!resolvedOrgId) {
      return NextResponse.json(
        { error: 'Could not resolve org_id' },
        { status: 400 }
      )
    }

    // 2. Fetch media metadata from Meta API
    const metaMetaRes = await fetch(`https://graph.facebook.com/v19.0/${media_id}`, {
      headers: {
        Authorization: `Bearer ${whatsapp_token}`,
      },
    })

    if (!metaMetaRes.ok) {
      const errorText = await metaMetaRes.text()
      console.error('[media-sync] Meta metadata fetch failed:', errorText)
      return NextResponse.json(
        { error: `Meta API metadata query failed: ${metaMetaRes.statusText}` },
        { status: 502 }
      )
    }

    const metadata = await metaMetaRes.json()
    const mediaUrl = metadata.url
    const mimeType = metadata.mime_type

    if (!mediaUrl) {
      return NextResponse.json(
        { error: 'Media URL not returned by Meta API' },
        { status: 502 }
      )
    }

    // 3. Download the binary file from Meta's CDN
    const fileDownloadRes = await fetch(mediaUrl, {
      headers: {
        Authorization: `Bearer ${whatsapp_token}`,
      },
    })

    if (!fileDownloadRes.ok) {
      console.error('[media-sync] Meta file download failed:', fileDownloadRes.statusText)
      return NextResponse.json(
        { error: `Failed to download file from Meta: ${fileDownloadRes.statusText}` },
        { status: 502 }
      )
    }

    const arrayBuffer = await fileDownloadRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 4. Determine extension and upload path
    const extension = MIME_MAP[mimeType] || mimeType.split('/')[1] || 'bin'
    const filename = `${resolvedOrgId}/whatsapp-media/${media_id}.${extension}`

    // 5. Upload to Supabase Storage 'chat-media' bucket
    const { error: uploadError } = await supabaseAdmin.storage
      .from('chat-media')
      .upload(filename, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('[media-sync] Supabase upload error:', uploadError)
      throw uploadError
    }

    // 6. Get the public URL for the saved asset
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('chat-media')
      .getPublicUrl(filename)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      media_id,
      mime_type: mimeType,
    })

  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    console.error('[media-sync]', err)
    return NextResponse.json({ error }, { status: 500 })
  }
}
