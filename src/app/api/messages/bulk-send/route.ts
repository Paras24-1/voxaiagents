import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    const authHeader = req.headers.get('authorization')
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { conversation_ids, message, media_url, media_type, filename } = body

    if (!Array.isArray(conversation_ids) || conversation_ids.length === 0) {
      return NextResponse.json({ error: 'At least one conversation_id must be provided' }, { status: 400 })
    }

    if (!message && !media_url) {
      return NextResponse.json({ error: 'Message or media content is required' }, { status: 400 })
    }

    // 1. Fetch conversations from Supabase
    const { data: convs, error: fetchErr } = await supabaseAdmin
      .from('conversations')
      .select('id, name, phone_number, platform, last_incoming_message_at, provider_phone_id')
      .in('id', conversation_ids)
      .eq('org_id', orgId)

    if (fetchErr) throw fetchErr
    if (!convs || convs.length === 0) {
      return NextResponse.json({ error: 'No matching conversations found' }, { status: 404 })
    }

    const nowTime = Date.now()
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000

    const results: Array<{
      conversation_id: string
      phone_number: string
      name?: string
      status: 'sent' | 'skipped_24h_expired' | 'error'
      error?: string
    }> = []

    // 2. Identify host origin for calling reply API
    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const replyApiUrl = `${protocol}://${host}/api/reply`

    // Process sending concurrently in batches of 5
    const batchSize = 5
    for (let i = 0; i < convs.length; i += batchSize) {
      const batch = convs.slice(i, i + batchSize)

      await Promise.all(
        batch.map(async (conv) => {
          const platform = conv.platform || 'whatsapp'
          const lastIncoming = conv.last_incoming_message_at
            ? new Date(conv.last_incoming_message_at).getTime()
            : 0

          const is24hExpired = platform === 'whatsapp' && (nowTime - lastIncoming > TWENTY_FOUR_HOURS)

          if (is24hExpired) {
            results.push({
              conversation_id: conv.id,
              phone_number: conv.phone_number,
              name: conv.name,
              status: 'skipped_24h_expired',
              error: '24-hour messaging window has expired'
            })
            return
          }

          try {
            const replyRes = await fetch(replyApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': process.env.N8N_WEBHOOK_SECRET || 'internal-ai-reply',
                ...(authHeader ? { Authorization: authHeader } : {})
              },
              body: JSON.stringify({
                conversation_id: conv.id,
                phone_number: conv.phone_number,
                message: message || '',
                media_url: media_url || null,
                media_type: media_type || null,
                filename: filename || null,
                org_id: orgId
              })
            })

            const replyData = await replyRes.json()

            if (replyRes.ok && replyData.success) {
              results.push({
                conversation_id: conv.id,
                phone_number: conv.phone_number,
                name: conv.name,
                status: 'sent'
              })
            } else {
              results.push({
                conversation_id: conv.id,
                phone_number: conv.phone_number,
                name: conv.name,
                status: 'error',
                error: replyData.error || 'Failed to dispatch reply'
              })
            }
          } catch (err: any) {
            results.push({
              conversation_id: conv.id,
              phone_number: conv.phone_number,
              name: conv.name,
              status: 'error',
              error: err?.message || String(err)
            })
          }
        })
      )
    }

    const sentCount = results.filter(r => r.status === 'sent').length
    const skippedCount = results.filter(r => r.status === 'skipped_24h_expired').length
    const errorCount = results.filter(r => r.status === 'error').length

    return NextResponse.json({
      success: true,
      total: convs.length,
      sentCount,
      skippedCount,
      errorCount,
      results
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
