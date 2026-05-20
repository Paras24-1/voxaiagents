import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data || [])
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { email, password, name, role } = await req.json()

    // Get org's max_users limit
    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('max_users, name')
      .eq('id', orgId)
      .single()

    const maxUsers = org?.max_users ?? 3

    // Count current employees in this org
    const { count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('role', 'employee')

    if ((count ?? 0) >= maxUsers) {
      return NextResponse.json({
        error: `Your plan includes ${maxUsers} users. To add more users contact voxai4278@gmail.com`
      }, { status: 403 })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (authError) throw authError

    // Insert into users table with org_id
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert({ id: authData.user.id, org_id: orgId, email, name, role })
    if (profileError) throw profileError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId } = await req.json()

    // Make sure user belongs to this org
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('org_id')
      .eq('id', userId)
      .single()

    if (user?.org_id !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authError) throw authError

    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId, is_active } = await req.json()

    // Make sure user belongs to this org
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('org_id')
      .eq('id', userId)
      .single()

    if (user?.org_id !== orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_active })
      .eq('id', userId)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}