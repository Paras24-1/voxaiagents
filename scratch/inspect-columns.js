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

async function inspectColumns() {
  const { data, error } = await supabase.from('leads').select('*').limit(5);
  if (error) {
    console.error('Error selecting * from leads:', error);
  } else {
    console.log('Actual columns on leads table:', Object.keys(data[0] || {}));
    console.log('Sample rows:', data);
  }
}

inspectColumns().catch(console.error);
