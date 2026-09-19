const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

const env = fs.readFileSync('.env.local', 'utf-8').split('\n')
const getEnv = (key) => env.find(l => l.startsWith(key + '='))?.split('=')[1]

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const supabaseKey = getEnv('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseKey)

async function check() {
  const { data, error } = await supabase.from('conversations').select('*').limit(1)
  if (error) {
    console.error(error)
  } else {
    console.log(Object.keys(data[0]))
  }
}
check()
