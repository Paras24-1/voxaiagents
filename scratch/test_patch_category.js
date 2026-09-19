const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const envText = fs.readFileSync('.env.local', 'utf-8')
const env = {}
envText.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim()
  }
})

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL']
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY']
const supabase = createClient(supabaseUrl, supabaseKey)

async function testPatch() {
  console.log("=== Testing Lead Category Save ===")
  
  // 1. Get sample lead for OSMO RO 2
  const { data: orgs } = await supabase.from('organizations').select('id').eq('slug', 'osmo-ro-2')
  const orgId = orgs[0].id
  
  const { data: leads } = await supabase.from('leads').select('id, metadata, phone_number').eq('org_id', orgId).limit(1)
  const sampleLead = leads[0]
  console.log("Sample lead ID:", sampleLead.id)
  console.log("Existing metadata:", sampleLead.metadata)

  // 2. Prepare updated metadata (ONLY updating metadata JSONB column on leads)
  let currentMeta = sampleLead.metadata || {}
  if (typeof currentMeta === 'string') {
    try { currentMeta = JSON.parse(currentMeta) } catch {}
  }

  const updatedMeta = {
    ...currentMeta,
    category: 'customer',
    lead_type: 'customer',
    user_type: 'customer',
    Lead_Type: 'customer'
  }

  console.log("Attempting to update leads.metadata with:", updatedMeta)
  const { data: updatedLead, error: updateErr } = await supabase
    .from('leads')
    .update({ metadata: updatedMeta })
    .eq('id', sampleLead.id)
    .select()

  console.log("Update Result:", updatedLead, "Error:", updateErr)

  // 3. Verify fetching back
  const { data: refetched } = await supabase
    .from('leads')
    .select('id, metadata')
    .eq('id', sampleLead.id)
    .single()

  console.log("Refetched lead metadata:", refetched.metadata)
}

testPatch()
