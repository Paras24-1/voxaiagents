const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function run() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  console.log('Testing connection & checking voice_wallet_credits column...');
  
  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, voice_wallet_credits')
    .limit(1);
    
  if (error) {
    if (error.message.includes('voice_wallet_credits')) {
      console.log('❌ COLUMN NOT FOUND: The voice_wallet_credits column does not exist in the organizations table yet.');
      console.log('Please execute the migration script in supabase/migration_add_voice_wallet.sql in the Supabase SQL editor.');
    } else {
      console.error('Database connection/query error:', error);
    }
  } else {
    console.log('✅ COLUMN FOUND! The voice_wallet_credits column is already present.');
    console.log('Available organization data sample:');
    console.table(data);
  }
}

run();
