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

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function debug() {
  console.log("=== STEP 1: Fetching Osmo Organization ===")
  const { data: orgs, error: orgErr } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .or('name.ilike.%osmo%,slug.ilike.%osmo%')

  console.log("Orgs found:", orgs, "Error:", orgErr)
  if (!orgs || orgs.length === 0) {
    console.log("No Osmo org found directly by name/slug. Checking users with email paanifilter9@gmail.com...")
    const { data: users } = await supabase.from('users').select('org_id, email').eq('email', 'paanifilter9@gmail.com')
    console.log("Users found:", users)
    if (users && users.length > 0) {
      orgs.push({ id: users[0].org_id, name: 'PaaniFilter Org', slug: 'paanifilter' })
    }
  }

  const orgId = orgs?.[0]?.id
  if (!orgId) {
    console.error("Could not determine orgId")
    return
  }

  console.log(`\n=== STEP 2: Fetching Conversations for orgId: ${orgId} ===`)
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('id, phone_number, name, metadata, lead_type, stage, updated_at')
    .eq('org_id', orgId)
    .order('updated_at', { ascending: false })
    .limit(10)

  console.log("Conversations count:", convs?.length, "Error:", convErr)
  if (convs && convs.length > 0) {
    console.log("Sample conversation[0]:", JSON.stringify(convs[0], null, 2))
  }

  console.log(`\n=== STEP 3: Fetching Leads for orgId: ${orgId} ===`)
  const { data: leads, error: leadErr } = await supabase
    .from('leads')
    .select('id, conversation_id, phone_number, name, lead_type, metadata, created_at')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(10)

  console.log("Leads count:", leads?.length, "Error:", leadErr)
  if (leads && leads.length > 0) {
    console.log("Sample lead[0]:", JSON.stringify(leads[0], null, 2))
  }

  console.log(`\n=== STEP 4: Running fetchUnifiedOsmoContacts for orgId: ${orgId} ===`)
  const { fetchUnifiedOsmoContacts } = require('../src/lib/osmoPhonebooks')
  const unified = await fetchUnifiedOsmoContacts(orgId)
  console.log("Unified contacts count:", unified.length)
  console.log("First 5 unified contacts categories:")
  unified.slice(0, 5).forEach((u, idx) => {
    console.log(`  [${idx}] phone=${u.phone} category=${u.category} lead_type=${u.lead_type} hasLead=${!!u.lead} hasConv=${!!u.conversation}`)
  })
}

debug().catch(console.error)
