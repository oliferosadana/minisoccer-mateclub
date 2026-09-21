import { createClient } from '@supabase/supabase-js';

const url = 'https://fxmyzwlfjygedsdbumjc.supabase.co';
const key = 'sb_publishable_67NPniejBv4sxFpZL3OKmA_NWmenhwT';
const supabase = createClient(url, key);

async function check() {
  const tables = [
    'users', 
    'matches', 
    'bookings', 
    'venues', 
    'fields', 
    'facilities', 
    'sponsors', 
    'referees', 
    'photographers', 
    'community_posts', 
    'club_standings', 
    'top_performers'
  ];

  console.log('--- Checking Supabase Cloud Database Tables ---');
  for (const t of tables) {
    try {
      const { data, error } = await supabase.from(t).select('*');
      if (error) {
        console.log(`[x] ${t.padEnd(18)} : GAGAL/TIDAK ADA TABEL (${error.message})`);
      } else {
        console.log(`[v] ${t.padEnd(18)} : ADA (${data.length} baris data)`);
      }
    } catch (e) {
      console.log(`[!] ${t.padEnd(18)} : EXCEPTION (${e.message})`);
    }
  }
}

check();
