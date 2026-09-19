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

async function testCategoryAPI() {
  console.log("=== Testing Atomic Category Route Execution ===")
  const { data: orgs } = await supabase.from('organizations').select('id').eq('slug', 'osmo-ro-2')
  const orgId = orgs[0].id

  const { data: convs } = await supabase.from('conversations').select('id, phone_number').eq('org_id', orgId).limit(1)
  const conv = convs[0]
  console.log("Testing on conversation ID:", conv.id, "Phone:", conv.phone_number)

  // Simulate updating category to 'customer'
  const targetCategory = 'customer'

  // Update lead metadata
  const { data: lead } = await supabase.from('leads').select('id, metadata').eq('conversation_id', conv.id).maybeSingle()
  let leadMeta = lead?.metadata || {}
  if (typeof leadMeta === 'string') try { leadMeta = JSON.parse(leadMeta) } catch {}

  leadMeta = {
    ...leadMeta,
    category: targetCategory,
    lead_type: targetCategory,
    user_type: targetCategory
  }

  const { error: updateErr } = await supabase.from('leads').update({ metadata: leadMeta }).eq('id', lead.id)
  console.log("Lead update error:", updateErr)

  // Verify fetchUnifiedOsmoContacts
  const { fetchUnifiedOsmoContacts } = require('../src/lib/osmoPhonebooks')
  const unified = await fetchUnifiedOsmoContacts(orgId)
  const contact = unified.find(u => u.conversation?.id === conv.id || u.phone === conv.phone_number.replace(/\D/g, '').slice(-10))
  console.log("Unified contact result after refresh:", contact?.category)
}

testCategoryAPI().catch(console.error)
