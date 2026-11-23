import { supabaseAdmin } from '@/lib/supabase'

// Debounce map to prevent hammering DB when Meta sends bursts of delivery receipts
const debounceTimers = new Map<string, NodeJS.Timeout>()
const DEBOUNCE_MS = 3000 // 3 seconds window

/**
 * Recalculates campaign counts (sent, delivered, failed) efficiently.
 * Uses PostgreSQL stored procedure `recalc_campaign_stats` and debounces
 * high-frequency status webhooks from Meta WhatsApp.
 */
export async function recalcCampaign(campaignId: string, immediate = false) {
  if (!campaignId) return

  if (immediate) {
    if (debounceTimers.has(campaignId)) {
      clearTimeout(debounceTimers.get(campaignId)!)
      debounceTimers.delete(campaignId)
    }
    return executeRecalc(campaignId)
  }

  // If already queued, let the timer fire for the batch
  if (debounceTimers.has(campaignId)) {
    return
  }

  const timer = setTimeout(() => {
    debounceTimers.delete(campaignId)
    executeRecalc(campaignId).catch((err) =>
      console.error(`[campaigns] Debounced recalc error for ${campaignId}:`, err)
    )
  }, DEBOUNCE_MS)

  debounceTimers.set(campaignId, timer)
}

async function executeRecalc(campaignId: string) {
  try {
    // 1. Try fast atomic PostgreSQL stored procedure first (<2ms, 0 rows transferred)
    const { error: rpcErr } = await supabaseAdmin.rpc('recalc_campaign_stats', {
      p_campaign_id: campaignId,
    })

    if (!rpcErr) return

    // 2. Fallback to aggregate counts if RPC not available
    console.warn('[campaigns] RPC failed, falling back to direct queries:', rpcErr.message)

    const [sentRes, deliveredRes, failedRes, pendingRes] = await Promise.all([
      supabaseAdmin
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'sent'),
      supabaseAdmin
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .in('status', ['delivered', 'read']),
      supabaseAdmin
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'failed'),
      supabaseAdmin
        .from('campaign_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('campaign_id', campaignId)
        .eq('status', 'pending'),
    ])

    const sent = sentRes.count || 0
    const delivered = deliveredRes.count || 0
    const failed = failedRes.count || 0
    const pending = pendingRes.count || 0

    await supabaseAdmin
      .from('campaigns')
      .update({
        sent,
        delivered,
        failed,
        status: pending === 0 ? 'completed' : 'sending',
        completed_at: pending === 0 ? new Date().toISOString() : null,
      })
      .eq('id', campaignId)
  } catch (err) {
    console.error(`[campaigns] executeRecalc failed for ${campaignId}:`, err)
  }
}

