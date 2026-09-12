const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function check() {
  console.log('Fetching organization_settings...');
  const { data: settings, error } = await supabase
    .from('organization_settings')
    .select('org_id, whatsapp_phone_id, n8n_inbound_webhook_url, ai_system_prompt');

  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }

  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('id, name');
    
  if (orgError) {
    console.error('Error fetching orgs:', orgError);
    return;
  }

  const orgMap = {};
  orgs.forEach(o => orgMap[o.id] = o.name);

  console.log('\n--- Organization Settings Analysis ---\n');
  
  settings.forEach(s => {
    const orgName = orgMap[s.org_id] || s.org_id;
    console.log(`Org: ${orgName}`);
    console.log(`  whatsapp_phone_id: ${s.whatsapp_phone_id}`);
    console.log(`  n8n_webhook_url: ${s.n8n_inbound_webhook_url || 'None'}`);
    console.log(`  prompt snippet: ${s.ai_system_prompt ? s.ai_system_prompt.substring(0, 50).replace(/\n/g, ' ') + '...' : 'None'}`);
    console.log('----------------------------------------');
  });

  // Check for duplicates
  const phoneIds = {};
  const webhooks = {};
  
  settings.forEach(s => {
    if (s.whatsapp_phone_id) {
      if (phoneIds[s.whatsapp_phone_id]) phoneIds[s.whatsapp_phone_id].push(orgMap[s.org_id] || s.org_id);
      else phoneIds[s.whatsapp_phone_id] = [orgMap[s.org_id] || s.org_id];
    }
    if (s.n8n_inbound_webhook_url) {
      if (webhooks[s.n8n_inbound_webhook_url]) webhooks[s.n8n_inbound_webhook_url].push(orgMap[s.org_id] || s.org_id);
      else webhooks[s.n8n_inbound_webhook_url] = [orgMap[s.org_id] || s.org_id];
    }
  });

  console.log('\n--- Checking for duplicated Phone IDs ---');
  let duplicatePhoneIds = false;
  for (const [id, orgList] of Object.entries(phoneIds)) {
    if (orgList.length > 1) {
      console.log(`DUPLICATE PHONE ID FOUND: ${id} is shared by ${orgList.join(', ')}`);
      duplicatePhoneIds = true;
    }
  }
  if (!duplicatePhoneIds) console.log('No duplicated Phone IDs found.');

  console.log('\n--- Checking for duplicated Webhook URLs ---');
  let duplicateWebhooks = false;
  for (const [url, orgList] of Object.entries(webhooks)) {
    if (orgList.length > 1) {
      console.log(`DUPLICATE WEBHOOK URL FOUND: ${url} is shared by ${orgList.join(', ')}`);
      duplicateWebhooks = true;
    }
  }
  if (!duplicateWebhooks) console.log('No duplicated Webhook URLs found.');
}

check();
