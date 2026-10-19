import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const campaignId = searchParams.get('campaign_id')
    if (!campaignId) return NextResponse.json({ error: 'campaign_id required' }, { status: 400 })

    let allContacts: any[] = []
    let from = 0
    while (true) {
      const { data, error } = await supabaseAdmin
        .from('campaign_contacts')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('org_id', orgId)
        .order('created_at', { ascending: true })
        .range(from, from + 999)

      if (error) throw error
      if (!data || data.length === 0) break
      allContacts.push(...data)
      if (data.length < 1000) break
      from += 1000
    }

    return NextResponse.json(allContacts)
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}