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

async function testUnified() {
  const { data: orgs } = await supabase.from('organizations').select('id').eq('slug', 'osmo-ro-2')
  const orgId = orgs[0].id

  // Load leads and convs
  const { data: leads } = await supabase.from('leads').select('*').eq('org_id', orgId).limit(5)
  const { data: convs } = await supabase.from('conversations').select('*').eq('org_id', orgId).limit(5)

  console.log("Leads sample:")
  leads.forEach(l => {
    let meta = l.metadata
    if (typeof meta === 'string') try { meta = JSON.parse(meta) } catch {}
    console.log(`Lead ID=${l.id} Phone=${l.phone_number} MetaCategory=${meta?.category}`)
  })
}

testUnified()
