import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawPhone = searchParams.get('phone') || ''
    const phone = rawPhone.replace(/\D/g, '').slice(-10)

    console.log('🔍 Looking for phone:', rawPhone, '→ normalized:', phone)

    const apiKey    = process.env.GOOGLE_SHEETS_API_KEY
    const sheetId   = process.env.GOOGLE_SHEET_ID
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'LEADS'

    if (!apiKey || !sheetId) {
      console.error('❌ Missing config:', { hasKey: !!apiKey, hasId: !!sheetId })
      return NextResponse.json({ error: 'Missing config' }, { status: 500 })
    }

    const range = `${encodeURIComponent(sheetName)}!A:Z`
    const url   = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`

    const res  = await fetch(url)
    const data = await res.json()

    if (data.error) {
      console.error('❌ Google API error:', data.error)
      return NextResponse.json({ error: data.error.message }, { status: 500 })
    }

    if (!data.values || data.values.length < 2) {
      console.error('❌ No data in sheet')
      return NextResponse.json({ error: 'No data in sheet' }, { status: 404 })
    }

    const headers: string[] = data.values[0]
    const rows: string[][]  = data.values.slice(1)

    console.log('📋 Headers:', headers)
    console.log('📊 Total rows:', rows.length)

    const phoneIndex = headers.findIndex((h) => h.toLowerCase().includes('phone'))
    console.log('📞 Phone column index:', phoneIndex, '→', headers[phoneIndex])

    if (phoneIndex === -1) {
      console.error('❌ No phone column found in headers')
      return NextResponse.json({ error: 'No phone column in sheet' }, { status: 500 })
    }

    // Debug: log first 3 phone numbers
    rows.slice(0, 3).forEach((row, i) => {
      const rowPhone = (row[phoneIndex] || '').replace(/\D/g, '').slice(-10)
      console.log(`Row ${i}: ${row[phoneIndex]} → normalized: ${rowPhone}`)
    })

    const matchedRow = rows.find((row) => {
      const rowPhone = (row[phoneIndex] || '').replace(/\D/g, '').slice(-10)
      return rowPhone === phone
    })

    if (!matchedRow) {
      console.error('❌ No match found for:', phone)
      return NextResponse.json({ 
        error: 'No matching lead found',
        debug: { searched: phone, totalRows: rows.length }
      }, { status: 404 })
    }

    console.log('✅ Match found!')

    const lead: Record<string, string> = {}
    headers.forEach((header, i) => {
      lead[header] = matchedRow[i] || ''
    })

    return NextResponse.json(lead)

  } catch (err) {
    console.error('💥 Exception:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
