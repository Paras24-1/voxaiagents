import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf-8').split('\n')
const getEnv = (key) => env.find(l => l.startsWith(key + '='))?.split('=')[1]?.trim()

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'))

async function check() {
  // Find Osmo RO org
  const { data: orgs } = await supabase.from('organizations').select('id, name, slug')
  console.log('All orgs:', orgs?.map(o => `${o.id} | ${o.name} | ${o.slug}`))

  const osmoOrg = orgs?.find(o => 
    o.name?.toLowerCase().includes('osmo') || 
    o.slug?.toLowerCase().includes('osmo')
  )
  if (!osmoOrg) {
    // Try finding by user email
    const { data: user } = await supabase.from('users').select('org_id').eq('email', 'paanifilter9@gmail.com').maybeSingle()
    console.log('User org_id:', user?.org_id)
    return
  }
  console.log('\nOsmo org:', osmoOrg)

  // Get employees
  const { data: employees } = await supabase.from('users').select('id, name, email, role').eq('org_id', osmoOrg.id)
  console.log('\nAll users:', employees?.map(e => `${e.name} | ${e.email} | ${e.role}`))

  // Get unassigned conversations
  const { count } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('org_id', osmoOrg.id).is('assigned_to', null)
  console.log('\nUnassigned conversations:', count)
}

check()
