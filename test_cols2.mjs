import { createClient } from '@supabase/supabase-js';

const url = 'https://fxmyzwlfjygedsdbumjc.supabase.co';
const key = 'sb_publishable_67NPniejBv4sxFpZL3OKmA_NWmenhwT';
const supabase = createClient(url, key);

async function testCols2() {
  // Test sponsors with tier: 'platinum'
  const { error: spErr, data: spData } = await supabase.from('sponsors').upsert({
    id: 'sp-test',
    name: 'Hydro Coco Official',
    category: 'beverage',
    tier: 'platinum',
    logo: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5',
    status: 'active'
  }).select('*');
  console.log('Sponsor upsert:', spErr ? spErr.message : 'SUCCESS', spData);

  // Test top_performers without rating
  const { error: tpErr, data: tpData } = await supabase.from('top_performers').upsert({
    id: 'tp-test',
    name: 'Farhan Ramadhan',
    club: 'Garuda Muda FC',
    goals: 12,
    assists: 8,
    mvp: 4
  }).select('*');
  console.log('TP upsert:', tpErr ? tpErr.message : 'SUCCESS', tpData);

  // Test community_posts with minimal
  const { error: cpErr, data: cpData } = await supabase.from('community_posts').upsert({
    id: 'cp-test',
    title: 'Matchday Seru Semalam!',
    content: 'Terima kasih teman-teman yang sudah join match di BSF.',
    author: 'Captain Reza'
  }).select('*');
  console.log('CP upsert:', cpErr ? cpErr.message : 'SUCCESS', cpData);
}

testCols2();
