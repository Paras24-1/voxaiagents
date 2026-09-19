import { createClient } from '@supabase/supabase-js';
import { classifyOsmoContact } from './src/lib/osmoPhonebooks';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase credentials in environment");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Starting backfill for 54,000 leads...');
  let from = 0;
  let step = 1000;
  let hasMore = true;
  let updatedCount = 0;

  while (hasMore) {
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*, conversations(*)')
      .range(from, from + step - 1)
      .order('id');
      
    if (error) {
      console.error('Fetch error:', error);
      break;
    }

    if (!leads || leads.length === 0) {
      hasMore = false;
      break;
    }

    const updates = [];

    for (const lead of leads) {
      const conv = lead.conversations && lead.conversations.length > 0 ? lead.conversations[0] : null;
      const itemToClassify = conv ? { ...conv, lead: lead } : lead;
      const category = classifyOsmoContact(itemToClassify);

      let meta = lead.metadata;
      if (typeof meta === 'string') {
        try { meta = JSON.parse(meta); } catch(e) { meta = {}; }
      } else if (!meta || typeof meta !== 'object') {
        meta = {};
      }

      // Always push to ensure we backfill EVERYTHING
      meta.lead_type = category;
      meta.category = category;
      
      updates.push({
        id: lead.id,
        phone_number: lead.phone_number,
        org_id: lead.org_id,
        metadata: meta,
        lead_temperature: lead.lead_temperature || 'COLD'
      });
    }

    if (updates.length > 0) {
      const { error: updateErr } = await supabase
        .from('leads')
        .upsert(updates, { onConflict: 'id' });
        
      if (updateErr) {
        console.error('Update error:', updateErr);
      } else {
        updatedCount += updates.length;
      }
    }

    console.log(`Processed ${from + leads.length} rows, updated ${updatedCount} records so far...`);
    
    from += step;
    if (leads.length < step) {
      hasMore = false;
    }
  }
  console.log(`Finished! Total leads newly classified and updated: ${updatedCount}`);
}

run().catch(console.error);
