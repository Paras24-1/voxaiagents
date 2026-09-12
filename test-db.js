const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: conv, error: convErr } = await supabase.from('conversations').select('*').eq('phone_number', '919826285201').limit(1);
  if (convErr) { console.error('Conv Err:', convErr); return; }
  console.log('Conversation:', conv);
  
  if (conv && conv.length > 0) {
    const { data: msgs, error: msgErr } = await supabase.from('messages').select('*').eq('conversation_id', conv[0].id);
    if (msgErr) { console.error('Msg Err:', msgErr); return; }
    console.log('Messages count:', msgs.length);
  }
}
run();
