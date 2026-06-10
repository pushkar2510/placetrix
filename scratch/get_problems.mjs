import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function dump() {
  const { data, error } = await supabase.from('coding_problems').select('id, title, test_cases, driver_codes');
  if (error) throw error;
  
  const broken = data.filter(p => {
    let c = p.driver_codes;
    if (typeof c === 'string') {
      try { c = JSON.parse(c); } catch(e) { return false; }
    }
    return c && c['54'] && c['54'].includes('int main() { return 0; }');
  });
  
  fs.writeFileSync('scratch/broken_problems.json', JSON.stringify(broken, null, 2));
  console.log(`Dumped ${broken.length} problems to scratch/broken_problems.json`);
}

dump().catch(console.error);
