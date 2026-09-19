const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: orgs } = await supabase.from('organizations').select('id, slug, name').ilike('name', '%paani%');
  if (orgs && orgs.length > 0) {
    const orgId = orgs[0].id;
    console.log('Org:', orgs[0].name);

    // check conversations count
    const { count: convCount } = await supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('org_id', orgId);
    console.log('Total Conversations:', convCount);

    const { data: convData } = await supabase.from('conversations').select('id').eq('org_id', orgId);
    console.log('Conversations fetched without limit:', convData ? convData.length : 0);

    // check leads count
    const { count: leadCount } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('org_id', orgId);
    console.log('Total Leads:', leadCount);

    const { data: leadData } = await supabase.from('leads').select('id').eq('org_id', orgId);
    console.log('Leads fetched without limit:', leadData ? leadData.length : 0);
  }
}
run();
