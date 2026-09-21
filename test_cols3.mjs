import { createClient } from '@supabase/supabase-js';

const url = 'https://fxmyzwlfjygedsdbumjc.supabase.co';
const key = 'sb_publishable_67NPniejBv4sxFpZL3OKmA_NWmenhwT';
const supabase = createClient(url, key);

async function testCols3() {
  // Test top_performers with avatar
  const { error: tpErr, data: tpData } = await supabase.from('top_performers').upsert({
    id: 'tp-test',
    name: 'Farhan Ramadhan',
    club: 'Garuda Muda FC',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    goals: 12,
    assists: 8,
    mvp: 4
  }).select('*');
  console.log('TP upsert:', tpErr ? tpErr.message : 'SUCCESS', tpData);

  // Test community_posts with summary
  const { error: cpErr, data: cpData } = await supabase.from('community_posts').upsert({
    id: 'cp-test',
    title: 'Matchday Seru Semalam!',
    summary: 'Highlight keseruan matchday bersama komunitas Mate Club.',
    content: 'Terima kasih teman-teman yang sudah join match di BSF.',
    author: 'Captain Reza'
  }).select('*');
  console.log('CP upsert:', cpErr ? cpErr.message : 'SUCCESS', cpData);
}

testCols3();
