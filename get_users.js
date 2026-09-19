const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: orgs } = await supabase.from('organizations').select('id, slug, name').ilike('name', '%paani%');
  console.log('Orgs:', orgs);
  if (orgs && orgs.length > 0) {
    const { data: users } = await supabase.from('users').select('id, email, name').eq('org_id', orgs[0].id);
    console.log('Users:', users);
  }
}
run();
