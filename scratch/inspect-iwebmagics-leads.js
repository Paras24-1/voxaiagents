const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let supabaseUrl = '';
let supabaseKey = '';

try {
  const envText = fs.readFileSync('.env.local', 'utf8');
  for (const line of envText.split('\n')) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseKey = line.split('=')[1].trim().replace(/^["']|["']$/g, '');
    }
  }
} catch (e) {}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectIwebmagicsLeads() {
  // 1. Get org_id for iwebmagics
  const { data: orgs } = await supabase.from('organizations').select('id, name, slug').or('name.ilike.%iwebmagics%,slug.ilike.%iwebmagics%');
  console.log('Orgs matching iwebmagics:', orgs);

  let orgId = orgs?.[0]?.id;
  if (!orgId) {
    const { data: allOrgs } = await supabase.from('organizations').select('id, name, slug').limit(10);
    console.log('All orgs:', allOrgs);
    orgId = allOrgs?.[0]?.id;
  }

  // Fetch leads for this org
  const { data: leads, error } = await supabase
    .from('leads')
    .select('id, name, phone_number, stage, lead_quality, lead_temperature, lead_score, metadata, org_id')
    .eq('org_id', orgId)
    .limit(20);

  if (error) {
    console.error('Error fetching leads:', error);
  } else {
    console.log(`Found ${leads.length} leads for org ${orgId}:`);
    leads.forEach(l => {
      console.log(`- Lead: ${l.name} | Phone: ${l.phone_number} | Stage: ${l.stage} | Quality: ${l.lead_quality} | Temp: ${l.lead_temperature} | Score: ${l.lead_score} | Meta:`, JSON.stringify(l.metadata || {}));
    });
  }
}

inspectIwebmagicsLeads().catch(console.error);
