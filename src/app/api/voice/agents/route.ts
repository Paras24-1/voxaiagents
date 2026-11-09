import { NextRequest, NextResponse } from 'next/server'
import { supabaseVoiceAdmin, supabaseAdmin, getOrgId } from '@/lib/supabase'

// GET: Fetch all voice agents for the authenticated organization
export async function GET(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Try local Main Supabase database first (Unified Architecture)
    const { data: localAgents, error: localError } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })

    if (!localError && localAgents) {
      return NextResponse.json(localAgents)
    }

    // 2. Fallback to Voice Supabase (Account B) if local table is not yet migrated
    if (supabaseVoiceAdmin) {
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('voice_org_id')
        .eq('id', orgId)
        .maybeSingle()

      if (orgData?.voice_org_id) {
        const { data: agentsData, error: agentsError } = await supabaseVoiceAdmin
          .from('agents')
          .select('*')
          .eq('organization_id', orgData.voice_org_id)
          .order('created_at', { ascending: false })

        if (!agentsError && agentsData) {
          return NextResponse.json(agentsData)
        }
      }
    }

    return NextResponse.json([])
  } catch (err: any) {
    console.error('[API/voice/agents GET]', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch voice agents' }, { status: 500 })
  }
}

// POST: Create a new voice agent in the main database
export async function POST(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      id,
      name,
      language = 'English',
      lang_code = 'US',
      voice_profile = 'Aoede',
      active = true,
      system_prompt = '',
      inbound_system_prompt = '',
      outbound_system_prompt = '',
      temperature = 0.70,
      speech_threshold = -42,
      silence_detection = 600,
      telephone_number = '',
      transfer_number = '',
      notification_email = '',
      avatar_url = null,
      description = null,
      emotion_tone = 'professional'
    } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }

    const payload = {
      ...(id ? { id } : {}),
      organization_id: orgId,
      name: name.trim(),
      language,
      lang_code,
      voice_id: voice_profile,
      voice_profile,
      active,
      system_prompt: outbound_system_prompt || system_prompt || '',
      inbound_system_prompt: inbound_system_prompt || '',
      outbound_system_prompt: outbound_system_prompt || '',
      temperature: Number(temperature) || 0.70,
      speech_threshold: Number(speech_threshold) || -42,
      silence_detection: Number(silence_detection) || 600,
      telephone_number: telephone_number ? telephone_number.trim() : '',
      transfer_number: transfer_number ? transfer_number.trim() : '',
      notification_email: notification_email ? notification_email.trim() : '',
      avatar_url,
      description,
      emotion_tone,
      updated_at: new Date().toISOString()
    }

    // 1. Upsert into Main Supabase
    let { data: newAgent, error: saveErr } = await supabaseAdmin
      .from('agents')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()

    // Fallback: If local table fails because migration hasn't run yet, save to Account B
    if (saveErr && supabaseVoiceAdmin) {
      console.warn('[API/voice/agents POST] Local agents table failed, trying voice DB:', saveErr.message)
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('voice_org_id')
        .eq('id', orgId)
        .maybeSingle()

      if (orgData?.voice_org_id) {
        const voicePayload = { ...payload, organization_id: orgData.voice_org_id }
        const { data: vAgent, error: vErr } = await supabaseVoiceAdmin
          .from('agents')
          .upsert(voicePayload, { onConflict: 'id' })
          .select()
          .single()
        if (vErr) throw vErr
        newAgent = vAgent
        saveErr = null
      }
    }

    if (saveErr) throw saveErr

    // 2. Track prompt version
    if (newAgent) {
      const activePrompt = outbound_system_prompt || system_prompt || ''
      try {
        await supabaseAdmin.from('script_versions').insert({
          agent_id: newAgent.id,
          version: 1,
          system_prompt: activePrompt,
          inbound_system_prompt: inbound_system_prompt || '',
          outbound_system_prompt: outbound_system_prompt || ''
        })
      } catch (verErr) {
        // Non-critical if table not yet migrated
        console.warn('[script_versions]', verErr)
      }
    }

    return NextResponse.json({ success: true, agent: newAgent })
  } catch (err: any) {
    console.error('[API/voice/agents POST]', err)
    return NextResponse.json({ error: err?.message || 'Failed to create voice agent' }, { status: 500 })
  }
}

// PUT: Update an existing voice agent
export async function PUT(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })

    const updatePayload: Record<string, any> = {
      ...updates,
      updated_at: new Date().toISOString()
    }
    if (updates.voice_profile) {
      updatePayload.voice_id = updates.voice_profile
    }

    // Update in local Main DB
    let { data: updatedAgent, error: updateErr } = await supabaseAdmin
      .from('agents')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle()

    // Fallback to Account B if not found locally
    if ((updateErr || !updatedAgent) && supabaseVoiceAdmin) {
      const { data: vAgent, error: vErr } = await supabaseVoiceAdmin
        .from('agents')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .maybeSingle()
      if (!vErr && vAgent) {
        updatedAgent = vAgent
        updateErr = null
      }
    }

    if (updateErr) throw updateErr

    // If outbound prompt was updated, insert new script version
    if (updates.outbound_system_prompt || updates.system_prompt) {
      try {
        const { data: latestVer } = await supabaseAdmin
          .from('script_versions')
          .select('version, system_prompt')
          .eq('agent_id', id)
          .order('version', { ascending: false })
          .limit(1)
          .maybeSingle()

        const nextVer = latestVer ? latestVer.version + 1 : 1;
        const newPrompt = updates.outbound_system_prompt || updates.system_prompt || '';

        if (!latestVer || latestVer.system_prompt !== newPrompt) {
          await supabaseAdmin.from('script_versions').insert({
            agent_id: id,
            version: nextVer,
            system_prompt: newPrompt,
            inbound_system_prompt: updates.inbound_system_prompt || '',
            outbound_system_prompt: updates.outbound_system_prompt || ''
          })
        }
      } catch (vErr) {
        console.warn('[script_versions version bump]', vErr)
      }
    }

    return NextResponse.json({ success: true, agent: updatedAgent })
  } catch (err: any) {
    console.error('[API/voice/agents PUT]', err)
    return NextResponse.json({ error: err?.message || 'Failed to update agent' }, { status: 500 })
  }
}

// DELETE: Remove a voice agent
export async function DELETE(req: NextRequest) {
  try {
    const orgId = await getOrgId(req)
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const agentId = searchParams.get('id')
    if (!agentId) return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 })

    // Delete in local DB
    const { error: localDelErr } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', agentId)

    // Also delete in Account B if present
    if (supabaseVoiceAdmin) {
      try {
        await supabaseVoiceAdmin.from('agents').delete().eq('id', agentId)
      } catch (e) {
        // ignore fallback errors
      }
    }

    if (localDelErr) throw localDelErr

    return NextResponse.json({ success: true, deleted_id: agentId })
  } catch (err: any) {
    console.error('[API/voice/agents DELETE]', err)
    return NextResponse.json({ error: err?.message || 'Failed to delete agent' }, { status: 500 })
  }
}
