const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkMessages() {
  // Get the most recent conversation for Iwebmagics (or just the latest messages)
  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, org_id, message, direction, provider_message_id, created_at, platform')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching messages:', error);
    return;
  }
  
  console.log('Recent Messages:');
  messages.forEach(m => {
    console.log(`[${m.created_at}] Org: ${m.org_id} | Dir: ${m.direction} | WAMID: ${m.provider_message_id ? 'YES' : 'NO'}`);
    console.log(`Msg: ${m.message.substring(0, 80).replace(/\n/g, ' ')}...`);
    console.log('---');
  });
}

checkMessages();
