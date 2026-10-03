import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Auto-expire stuck jobs older than 5 minutes (300 seconds) so UI never freezes infinitely
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    await supabaseAdmin
      .from('scraping_jobs')
      .update({ 
        status: 'failed', 
        error_message: 'Scraper worker timeout (worker process offline). Please ensure runner.py is active.' 
      })
      .eq('org_id', orgId)
      .in('status', ['pending', 'scraping'])
      .lt('updated_at', fiveMinutesAgo)

    const { data, error } = await supabaseAdmin
      .from('scraping_jobs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { query, max_results } = await req.json()
    if (!query) return NextResponse.json({ error: 'Query is required' }, { status: 400 })

    const maxResultsNum = parseInt(max_results) || 50

    const { data, error } = await supabaseAdmin
      .from('scraping_jobs')
      .insert({
        org_id: orgId,
        query: query.trim(),
        max_results: maxResultsNum,
        status: 'pending',
        scraped_count: 0
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
