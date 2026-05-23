import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const baseFilename = searchParams.get('filename') || `bulk-headers/${Date.now()}.jpg`
    
    // Prefix the upload path with orgId to scope files per tenant
    const filename = `${orgId}/${baseFilename.replace(/^(\/|\\)+/, '')}`

    const buffer = await req.arrayBuffer()
    const contentType = req.headers.get('content-type') || 'image/jpeg'

    const { error } = await supabaseAdmin.storage
      .from('chat-media')
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      })

    if (error) throw error

    const { data } = supabaseAdmin.storage
      .from('chat-media')
      .getPublicUrl(filename)

    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('[upload-image]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
