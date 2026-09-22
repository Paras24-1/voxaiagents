import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  return handleProcess(req)
}

export async function POST(req: NextRequest) {
  return handleProcess(req)
}

async function handleProcess(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const secretHeader = req.headers.get('x-internal-secret')
    const cronSecret = process.env.CRON_SECRET || process.env.N8N_WEBHOOK_SECRET || 'internal-ai-reply'

    // Allow internal runner, cron authorization, or bearer token
    const isAuthorized = 
      secretHeader === cronSecret || 
      authHeader === `Bearer ${cronSecret}` ||
      authHeader?.startsWith('Bearer ')

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized schedule runner' }, { status: 401 })
    }

    const nowIso = new Date().toISOString()

    // 1. Fetch pending scheduled messages whose execution time has arrived
    const { data: pendingMsgs, error: fetchErr } = await supabaseAdmin
      .from('scheduled_messages')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', nowIso)
      .order('scheduled_at', { ascending: true })
      .limit(50)

    if (fetchErr) throw fetchErr
    if (!pendingMsgs || pendingMsgs.length === 0) {
      return NextResponse.json({ message: 'No pending scheduled messages ready for execution', processed: 0 })
    }

    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const replyApiUrl = `${protocol}://${host}/api/reply`

    const results: Array<{ id: string; status: 'sent' | 'failed'; error?: string }> = []

    for (const msg of pendingMsgs) {
      try {
        const replyRes = await fetch(replyApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-secret': cronSecret,
            ...(authHeader ? { Authorization: authHeader } : {})
          },
          body: JSON.stringify({
            conversation_id: msg.conversation_id,
            phone_number: msg.phone_number,
            message: msg.message,
            media_url: msg.media_url,
            media_type: msg.media_type,
            filename: msg.filename,
            org_id: msg.org_id
          })
        })

        const replyData = await replyRes.json()

        if (replyRes.ok && replyData.success) {
          await supabaseAdmin
            .from('scheduled_messages')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', msg.id)

          results.push({ id: msg.id, status: 'sent' })
        } else {
          const errMsg = replyData.error || 'Failed to dispatch reply'
          await supabaseAdmin
            .from('scheduled_messages')
            .update({
              status: 'failed',
              error_message: errMsg
            })
            .eq('id', msg.id)

          results.push({ id: msg.id, status: 'failed', error: errMsg })
        }
      } catch (err: any) {
        const errMsg = err?.message || String(err)
        await supabaseAdmin
          .from('scheduled_messages')
          .update({
            status: 'failed',
            error_message: errMsg
          })
          .eq('id', msg.id)

        results.push({ id: msg.id, status: 'failed', error: errMsg })
      }
    }

    const sentCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
      success: true,
      processed: pendingMsgs.length,
      sentCount,
      failedCount,
      results
    })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
