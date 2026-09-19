import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf-8').split('\n')
const getEnv = (key) => env.find(l => l.startsWith(key + '='))?.split('=')[1]?.trim()

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'))

const ORG_ID = 'e7c673e9-818e-4dd3-818e-7dfb51a1007b'

async function assign() {
  // Get all employees (not owner)
  const { data: employees } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('org_id', ORG_ID)
    .eq('role', 'employee')
    .order('name')

  console.log(`Found ${employees.length} employees:`)
  employees.forEach(e => console.log(`  - ${e.name} (${e.email})`))

  // Get all unassigned conversations
  const { data: unassigned } = await supabase
    .from('conversations')
    .select('id, phone_number, name')
    .eq('org_id', ORG_ID)
    .is('assigned_to', null)
    .order('created_at', { ascending: true })

  console.log(`\nFound ${unassigned.length} unassigned conversations`)

  // Distribute equally round-robin
  const perEmployee = Math.floor(unassigned.length / employees.length)
  const remainder = unassigned.length % employees.length
  console.log(`\nDistribution: ${perEmployee} each, ${remainder} extra for first ${remainder} employees`)
  console.log('\nAssigning...')

  let idx = 0
  for (let i = 0; i < employees.length; i++) {
    const emp = employees[i]
    const count = perEmployee + (i < remainder ? 1 : 0)
    const batch = unassigned.slice(idx, idx + count)
    idx += count

    for (const conv of batch) {
      const { error } = await supabase
        .from('conversations')
        .update({ 
          assigned_to: emp.id,
          assignment_status: 'assigned'
        })
        .eq('id', conv.id)
        .eq('org_id', ORG_ID)

      if (error) {
        console.error(`  ERROR assigning ${conv.id} to ${emp.name}:`, error.message)
      }
    }

    console.log(`  ✅ ${emp.name}: ${count} leads assigned`)
  }

  // Verify
  const { count: remaining } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', ORG_ID)
    .is('assigned_to', null)

  console.log(`\n✅ Done! Remaining unassigned: ${remaining}`)
}

assign()
