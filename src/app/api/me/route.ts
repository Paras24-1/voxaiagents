import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getUserProfile } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const userProf = await getUserProfile(req)
    if (!userProf) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('*, organization:organizations(*)')
      .eq('id', userProf.userId)
      .single()

    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const org = profile.organization || null
    delete profile.organization

    return NextResponse.json({ profile, org })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}