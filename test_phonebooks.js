import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: phonebooks } = await supabase.from('phonebooks').select('*');
  for (const pb of phonebooks || []) {
    const { count } = await supabase.from('phonebook_contacts').select('*', { count: 'exact', head: true }).eq('phonebook_id', pb.id);
    console.log(`${pb.name}: ${count}`);
  }
}
test();
