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

async function checkColumns() {
  console.log("=== Checking CONVERSATIONS columns ===")
  const { data: conv, error: convErr } = await supabase.from('conversations').select('*').limit(1)
  if (convErr) console.error("Conv Err:", convErr)
  else if (conv && conv.length > 0) console.log("Conversations Keys:", Object.keys(conv[0]))
  else console.log("No conversations rows found")

  console.log("\n=== Checking LEADS columns ===")
  const { data: lead, error: leadErr } = await supabase.from('leads').select('*').limit(1)
  if (leadErr) console.error("Lead Err:", leadErr)
  else if (lead && lead.length > 0) {
    console.log("Leads Keys:", Object.keys(lead[0]))
    console.log("Sample lead raw object:", JSON.stringify(lead[0], null, 2))
  } else console.log("No leads rows found")
}

checkColumns()
