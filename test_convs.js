import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const fetchAll = async (query) => {
      let allData = []
      let from = 0
      let step = 1000
      let hasMore = true
      while (hasMore) {
        const { data, error } = await query.range(from, from + step - 1)
        if (error) { console.log('ERROR:', error); throw error; }
        if (data && data.length > 0) {
          allData = allData.concat(data)
          from += step
          if (data.length < step) hasMore = false
        } else {
          hasMore = false
        }
      }
      return allData
  }

  console.time('fetchConvs');
  const query = supabase.from('conversations').select('id, metadata, lead_type, platform, phone_number, name');
  try {
    const res = await fetchAll(query);
    console.timeEnd('fetchConvs');
    console.log("length:", res.length);
  } catch (err) {
    console.error("Caught error:", err);
  }
}

test();
