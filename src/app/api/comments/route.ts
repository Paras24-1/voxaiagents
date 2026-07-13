import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    // 1. Fetch Comments
    let query = supabaseAdmin
      .from('social_comments')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (statusFilter) {
      query = query.eq('status', statusFilter)
    }

    const { data: comments, error: fetchErr } = await query
    if (fetchErr) throw fetchErr

    // 2. Fetch Stats Metrics
    const { data: countData, error: statsErr } = await supabaseAdmin
      .from('social_comments')
      .select('status, dm_sent')
      .eq('org_id', orgId)

    if (statsErr) throw statsErr

    const stats = {
      total: countData?.length || 0,
      replied: countData?.filter(c => c.status === 'replied').length || 0,
      hidden: countData?.filter(c => c.status === 'hidden').length || 0,
      dm_sent: countData?.filter(c => c.dm_sent === true).length || 0
    }

    return NextResponse.json({ comments: comments || [], stats })
  } catch (err) {
    console.error('[comments-get]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, status, ai_reply, dm_sent } = body

    if (!id) return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 })

    const updateData: Record<string, any> = {}
    if (status !== undefined) updateData.status = status
    if (ai_reply !== undefined) updateData.ai_reply = ai_reply
    if (dm_sent !== undefined) updateData.dm_sent = dm_sent

    // Update in Supabase
    const { data: updatedComment, error: updateErr } = await supabaseAdmin
      .from('social_comments')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (updateErr) throw updateErr

    // Fetch n8n Webhook to forward moderator actions (like Hide/Unhide)
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('n8n_reply_webhook_url')
      .eq('org_id', orgId)
      .maybeSingle()

    if (settings?.n8n_reply_webhook_url && status === 'hidden') {
      try {
        // Forward event to n8n to execute the Meta API Hide Comment action
        await fetch(settings.n8n_reply_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'hide_comment',
            comment_id: updatedComment.comment_id,
            platform: updatedComment.platform || 'instagram',
            org_id: orgId
          })
        })
      } catch (webhookErr) {
        console.warn('[comments-patch-n8n-trigger-fail]', webhookErr)
      }
    }

    return NextResponse.json(updatedComment)
  } catch (err) {
    console.error('[comments-patch]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Webhook receiver (called by n8n to log comments)
    // We secure this using org query param validation or secret keys
    const { searchParams } = new URL(req.url)
    const orgSlug = searchParams.get('org')

    if (!orgSlug) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 })
    }

    // Resolve orgId
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .maybeSingle()

    if (!org?.id) {
      return NextResponse.json({ error: 'Invalid organization slug' }, { status: 404 })
    }

    const body = await req.json()
    const {
      platform,
      comment_id,
      media_id,
      username,
      user_avatar,
      comment_text,
      sentiment,
      status,
      ai_reply,
      dm_sent
    } = body

    if (!comment_id) {
      return NextResponse.json({ error: 'comment_id is required' }, { status: 400 })
    }

    const { data: comment, error: upsertErr } = await supabaseAdmin
      .from('social_comments')
      .upsert({
        org_id: org.id,
        platform: platform || 'instagram',
        comment_id,
        media_id,
        username,
        user_avatar,
        comment_text,
        sentiment: sentiment || 'neutral',
        status: status || 'pending',
        ai_reply,
        dm_sent: !!dm_sent
      }, { onConflict: 'comment_id' })
      .select()
      .single()

    if (upsertErr) throw upsertErr
    return NextResponse.json(comment)
  } catch (err) {
    console.error('[comments-post]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
