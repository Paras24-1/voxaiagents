import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0]
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    let startDate: string
    let endDate: string

    if (startParam && endParam) {
      startDate = startParam
      endDate = endParam
    } else {
      startDate = `${dateStr}T00:00:00.000Z`
      endDate = `${dateStr}T23:59:59.999Z`
    }

    let conversations: any[] = []
    let from = 0
    while (true) {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('id, name, phone_number, created_at, stage')
        .eq('org_id', orgId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .range(from, from + 999)

      if (error) throw error
      if (!data || data.length === 0) break
      conversations.push(...data)
      if (data.length < 1000) break
      from += 1000
    }

    return NextResponse.json({ leads: conversations })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error }, { status: 500 })
  }
}
