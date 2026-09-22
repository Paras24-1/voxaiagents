import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, getOrgId } from '@/lib/supabase'

export const dynamic = 'force-dynamic'


export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: settings, error } = await supabaseAdmin
      .from('organization_settings')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle()

    if (error) throw error

    let parsedPromptObj: any = {}
    if (settings?.ai_system_prompt) {
      try {
        if (settings.ai_system_prompt.startsWith('{')) {
          parsedPromptObj = JSON.parse(settings.ai_system_prompt)
        }
      } catch (e) {
        parsedPromptObj = { system_prompt: settings.ai_system_prompt }
      }
    }

    const currentModel = (parsedPromptObj.ai_model_name && !['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'].includes(parsedPromptObj.ai_model_name))
      ? parsedPromptObj.ai_model_name
      : 'gemini-3.6-flash'

    return NextResponse.json({
      engine_mode: parsedPromptObj.engine_mode || (settings?.n8n_inbound_webhook_url ? 'hybrid_n8n' : 'native'),
      ai_provider: parsedPromptObj.ai_provider || 'gemini',
      ai_model_name: currentModel,
      system_prompt: parsedPromptObj.system_prompt || settings?.ai_system_prompt || 'You are an intelligent WhatsApp AI assistant.',
      gemini_api_key: settings?.gemini_api_key || '',
      openai_api_key: settings?.openai_api_key || '',
      n8n_inbound_webhook_url: settings?.n8n_inbound_webhook_url || ''
    })
  } catch (err: any) {
    console.error('[bot-brain GET error]:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action } = body

    // 2. Action: Save Bot Brain Settings
    const {
      engine_mode,
      ai_provider,
      ai_model_name,
      system_prompt,
      gemini_api_key,
      openai_api_key,
      n8n_inbound_webhook_url
    } = body

    const { data: existing } = await supabaseAdmin
      .from('organization_settings')
      .select('*')
      .eq('org_id', orgId)
      .maybeSingle()

    let promptObj: any = {}
    if (existing?.ai_system_prompt && existing.ai_system_prompt.startsWith('{')) {
      try { promptObj = JSON.parse(existing.ai_system_prompt) } catch (e) {}
    }

    promptObj.engine_mode = engine_mode || 'native'
    promptObj.ai_provider = ai_provider || 'gemini'
    promptObj.ai_model_name = (ai_model_name && !['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-3.7-flash'].includes(ai_model_name))
      ? ai_model_name
      : 'gemini-3.6-flash'
    promptObj.system_prompt = system_prompt || ''

    const serializedPrompt = JSON.stringify(promptObj)

    const payload: any = {
      ai_system_prompt: serializedPrompt,
      n8n_inbound_webhook_url: n8n_inbound_webhook_url || null
    }

    if (gemini_api_key !== undefined) payload.gemini_api_key = gemini_api_key
    if (openai_api_key !== undefined) payload.openai_api_key = openai_api_key

    if (existing) {
      await supabaseAdmin.from('organization_settings').update(payload).eq('org_id', orgId)
    } else {
      await supabaseAdmin.from('organization_settings').insert({ org_id: orgId, ...payload })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[bot-brain POST error]:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
