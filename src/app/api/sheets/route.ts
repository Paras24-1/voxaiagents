import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    // ─────────────────────────────────────
    // Get org_id from authenticated user
    // ─────────────────────────────────────
    const orgId = await getOrgId(req)

    if (!orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ─────────────────────────────────────
    // Get phone
    // ─────────────────────────────────────
    const { searchParams } = new URL(req.url)

    const rawPhone = searchParams.get('phone') || ''
    const phone = rawPhone.replace(/\D/g, '').slice(-10)

    console.log('🔍 Looking for phone:', rawPhone, '→ normalized:', phone)

    // ─────────────────────────────────────
    // Get organization sheet settings
    // ─────────────────────────────────────
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('organization_settings')
      .select(`
        google_sheet_id,
        google_sheet_name,
        google_sheets_api_key
      `)
      .eq('org_id', orgId)
      .single()

    if (settingsError || !settings) {
      console.error('❌ Organization settings not found')

      return NextResponse.json(
        { error: 'Organization settings not found' },
        { status: 404 }
      )
    }

    const apiKey =
      settings.google_sheets_api_key ||
      process.env.GOOGLE_SHEETS_API_KEY

    const sheetId = settings.google_sheet_id

    const sheetName =
      settings.google_sheet_name || 'LEADS'

    // ─────────────────────────────────────
    // Validate config
    // ─────────────────────────────────────
    if (!apiKey || !sheetId) {
      console.error('❌ Missing Google Sheets config')

      return NextResponse.json(
        { error: 'Missing Google Sheets configuration' },
        { status: 500 }
      )
    }

    // ─────────────────────────────────────
    // Fetch sheet data
    // ─────────────────────────────────────
    const range = `${encodeURIComponent(sheetName)}!A:Z`

    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`

    const res = await fetch(url)

    const data = await res.json()

    // ─────────────────────────────────────
    // Google API error
    // ─────────────────────────────────────
    if (data.error) {
      console.error('❌ Google API error:', data.error)

      return NextResponse.json(
        { error: data.error.message },
        { status: 500 }
      )
    }

    // ─────────────────────────────────────
    // Empty sheet
    // ─────────────────────────────────────
    if (!data.values || data.values.length < 2) {
      return NextResponse.json(
        { error: 'No data in sheet' },
        { status: 404 }
      )
    }

    const headers: string[] = data.values[0]

    const rows: string[][] = data.values.slice(1)

    // ─────────────────────────────────────
    // Find phone column
    // ─────────────────────────────────────
    const phoneIndex = headers.findIndex((h) =>
      h.toLowerCase().includes('phone')
    )

    if (phoneIndex === -1) {
      return NextResponse.json(
        { error: 'No phone column in sheet' },
        { status: 500 }
      )
    }

    // ─────────────────────────────────────
    // Match lead
    // ─────────────────────────────────────
    const matchedRow = rows.find((row) => {
      const rowPhone = (row[phoneIndex] || '')
        .replace(/\D/g, '')
        .slice(-10)

      return rowPhone === phone
    })

    if (!matchedRow) {
      return NextResponse.json(
        {
          error: 'No matching lead found',
          debug: {
            searched: phone,
            totalRows: rows.length
          }
        },
        { status: 404 }
      )
    }

    // ─────────────────────────────────────
    // Convert row to object
    // ─────────────────────────────────────
    const lead: Record<string, string> = {}

    headers.forEach((header, i) => {
      lead[header] = matchedRow[i] || ''
    })

    return NextResponse.json(lead)

  } catch (err) {
    console.error('💥 Exception:', err)

    return NextResponse.json(
      { error: String(err) },
      { status: 500 }
    )
  }
}