import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const {
      companyName,
      yourName,
      email,
      password,
      whatsappPhoneId,
      whatsappToken,
      n8nWebhookUrl,
      n8nReplyWebhookUrl,
      googleSheetId,
      googleSheetName
    } = await req.json()

    if (!companyName || !yourName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate slug from company name
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

    // Check slug is unique
    const { data: existing } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Company name already taken' }, { status: 400 })
    }

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    if (authError) throw authError

    // 2. Create organization
    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({ name: companyName, slug, plan: 'trial' })
      .select()
      .single()
    if (orgError) throw orgError

    // 3. Create user profile as owner
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        org_id: org.id,
        email,
        name: yourName,
        role: 'owner'
      })
    if (userError) throw userError

    // 4. Save org settings
    const { error: settingsError } = await supabaseAdmin
  .from('organization_settings')
  .insert({
    org_id: org.id,
    whatsapp_phone_id: whatsappPhoneId || null,
    whatsapp_token: whatsappToken || null,
    n8n_webhook_url: n8nWebhookUrl || null,
    n8n_reply_webhook_url: n8nReplyWebhookUrl || null,

    google_sheet_id: googleSheetId || null,
    google_sheet_name: googleSheetName || 'LEADS',
  })
    if (settingsError) throw settingsError

    return NextResponse.json({ success: true, orgSlug: slug })

  } catch (err: any) {
    console.error('[register]', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}