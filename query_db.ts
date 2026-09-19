import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  const id = '4de96384-d67f-487d-8193-4b2d5b30c42e'
  const { data: conv } = await supabase.from('conversations').select('id, org_id').eq('id', id)
  console.log('Conversations:', conv)
  
  const { data: lead } = await supabase.from('leads').select('id, org_id, conversation_id').eq('id', id)
  console.log('Leads:', lead)
}
main()
