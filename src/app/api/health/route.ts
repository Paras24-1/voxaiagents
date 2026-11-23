import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const startTime = Date.now()

  try {
    // Quick probe to verify database connectivity and response time
    const { data, error } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1)

    const latencyMs = Date.now() - startTime

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          database: 'unhealthy',
          error: error.message,
          latencyMs,
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        database: 'healthy',
        latencyMs,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    )
  } catch (err: any) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'down',
        error: err?.message || 'Unknown database connection failure',
        latencyMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
