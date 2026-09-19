import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const env = fs.readFileSync('.env.local', 'utf-8').split('\n')
const getEnv = (key) => env.find(l => l.startsWith(key + '='))?.split('=')[1]

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('conversations').update({}).eq('id', 'non-existent-id')
  if (error) console.error("ERROR:", error.message)
  else console.log("SUCCESS:", data)
}
test()
