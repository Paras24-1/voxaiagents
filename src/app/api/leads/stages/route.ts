import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const DEFAULT_STAGES = [
  { id: 'new', name: 'new', label: 'New Lead', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  { id: 'interested', name: 'interested', label: 'Interested', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50' },
  { id: 'booking', name: 'booking', label: 'Booking', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50' },
  { id: 'confirmed', name: 'confirmed', label: 'Confirmed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50' },
  { id: 'cancelled', name: 'cancelled', label: 'Cancelled', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200/50' },
  { id: 'completed', name: 'completed', label: 'Completed', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50' },
  { id: 'followup', name: 'followup', label: 'Followup', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border border-cyan-200/50' },
  { id: 'not_interested', name: 'not_interested', label: 'Not Interested', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/50' },
  { id: 'call_done', name: 'call_done', label: 'Call Done', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200/50' },
  { id: 'low_budget', name: 'low_budget', label: 'Low Budget', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50' },
  { id: 'hot_customer', name: 'hot_customer', label: 'Hot Customer', color: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200/50' },
  { id: 'not_connected', name: 'not_connected', label: 'Not Connected', color: 'bg-stone-100 text-stone-700 dark:bg-stone-900 dark:text-stone-300' },
  { id: 'joined', name: 'joined', label: 'Joined', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200' },
  { id: 'not_joined', name: 'not_joined', label: 'Not Joined', color: 'bg-red-100 text-red-800 dark:bg-red-900/80 dark:text-red-200' },
  { id: 'contact_save', name: 'contact_save', label: 'Contact Save', color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/80 dark:text-lime-200' },
  { id: 'contact_not_save', name: 'contact_not_save', label: 'Contact Not Save', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/80 dark:text-yellow-200' },
  { id: 'unknown', name: 'unknown', label: 'Unknown', color: 'bg-gray-100 text-gray-500 dark:bg-gray-900 dark:text-gray-400' }
]

// Helper to parse organization settings JSON
function parseSettings(aiSystemPrompt: any) {
  if (!aiSystemPrompt) return {}
  if (typeof aiSystemPrompt === 'object') return aiSystemPrompt
  if (typeof aiSystemPrompt === 'string') {
    try {
      if (aiSystemPrompt.trim().startsWith('{')) {
        return JSON.parse(aiSystemPrompt)
      }
    } catch (e) {
      return { system_prompt: aiSystemPrompt }
    }
  }
  return { system_prompt: String(aiSystemPrompt) }
}

export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('ai_system_prompt')
      .eq('org_id', orgId)
      .maybeSingle()

    const parsedObj = parseSettings(settings?.ai_system_prompt || null)
    const customStages = Array.isArray(parsedObj.custom_lead_stages) ? parsedObj.custom_lead_stages : []

    const allStages = [...DEFAULT_STAGES, ...customStages]

    return NextResponse.json({
      defaultStages: DEFAULT_STAGES,
      customStages,
      stages: allStages
    })
  } catch (err: any) {
    console.error('[GET /api/leads/stages error]:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { label, color } = await req.json()
    if (!label || !label.trim()) {
      return NextResponse.json({ error: 'Stage label is required' }, { status: 400 })
    }

    const trimmedLabel = label.trim()
    const stageName = trimmedLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')

    // Fetch current settings
    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle()

    const parsedObj = parseSettings(settings?.ai_system_prompt || null)
    const existingCustom: any[] = Array.isArray(parsedObj.custom_lead_stages) ? parsedObj.custom_lead_stages : []

    // Check if stage already exists (in defaults or custom)
    const existsInDefault = DEFAULT_STAGES.some(s => s.name === stageName)
    const existsInCustom = existingCustom.some(s => s.name === stageName)

    if (existsInDefault || existsInCustom) {
      return NextResponse.json({ error: 'A stage with this name already exists' }, { status: 400 })
    }

    // Default badge color themes for custom stages
    const badgeColor = color || 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/50'

    const newStage = {
      id: `custom_${stageName}`,
      name: stageName,
      label: trimmedLabel,
      color: badgeColor,
      isCustom: true,
      created_at: new Date().toISOString()
    }

    const updatedCustom = [...existingCustom, newStage]
    parsedObj.custom_lead_stages = updatedCustom

    const newSystemPromptStr = JSON.stringify(parsedObj)

    if (settings) {
      await supabaseAdmin
        .from('organization_settings')
        .update({ ai_system_prompt: newSystemPromptStr })
        .eq('org_id', orgId)
    } else {
      await supabaseAdmin
        .from('organization_settings')
        .insert({ org_id: orgId, ai_system_prompt: newSystemPromptStr })
    }

    const allStages = [...DEFAULT_STAGES, ...updatedCustom]

    return NextResponse.json({
      success: true,
      newStage,
      customStages: updatedCustom,
      stages: allStages
    })
  } catch (err: any) {
    console.error('[POST /api/leads/stages error]:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()
    if (!name) return NextResponse.json({ error: 'Stage name required' }, { status: 400 })

    const { data: settings } = await supabaseAdmin
      .from('organization_settings')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle()

    if (!settings) {
      return NextResponse.json({ error: 'No settings found' }, { status: 404 })
    }

    const parsedObj = parseSettings(settings.ai_system_prompt)
    const existingCustom: any[] = Array.isArray(parsedObj.custom_lead_stages) ? parsedObj.custom_lead_stages : []

    const updatedCustom = existingCustom.filter(s => s.name !== name)
    parsedObj.custom_lead_stages = updatedCustom

    await supabaseAdmin
      .from('organization_settings')
      .update({ ai_system_prompt: JSON.stringify(parsedObj) })
      .eq('org_id', orgId)

    const allStages = [...DEFAULT_STAGES, ...updatedCustom]

    return NextResponse.json({
      success: true,
      customStages: updatedCustom,
      stages: allStages
    })
  } catch (err: any) {
    console.error('[DELETE /api/leads/stages error]:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
