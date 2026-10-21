import { supabaseAdmin } from '@/lib/supabase'

/**
 * Recalculates campaign counts (sent, delivered, failed) with full pagination
 * across all campaign_contacts rows, ensuring campaigns with >1000 contacts
 * are never truncated by Supabase's default 1000 row limit.
 */
export async function recalcCampaign(campaignId: string) {
  if (!campaignId) return

  let allContacts: { status: string }[] = []
  let from = 0

  while (true) {
    const { data, error } = await supabaseAdmin
      .from('campaign_contacts')
      .select('status')
      .eq('campaign_id', campaignId)
      .range(from, from + 999)

    if (error || !data || data.length === 0) break
    allContacts.push(...data)
    if (data.length < 1000) break
    from += 1000
  }

  if (allContacts.length === 0) return

  const sent = allContacts.filter((c) => c.status === 'sent').length
  const delivered = allContacts.filter((c) => c.status === 'delivered' || c.status === 'read').length
  const failed = allContacts.filter((c) => c.status === 'failed').length
  const pending = allContacts.filter((c) => c.status === 'pending').length

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
}
