import { createClient } from '@supabase/supabase-js';

const url = 'https://fxmyzwlfjygedsdbumjc.supabase.co';
const key = 'sb_publishable_67NPniejBv4sxFpZL3OKmA_NWmenhwT';
const supabase = createClient(url, key);

async function checkColumns() {
  // Test sponsors with just id and name
  const { error: spErr } = await supabase.from('sponsors').insert({ id: 'sp-test', name: 'Test Sponsor' });
  console.log('Sponsor insert id+name:', spErr ? spErr.message : 'SUCCESS');

  // Test top_performers with id and name
  const { error: tpErr } = await supabase.from('top_performers').insert({ id: 'tp-test', name: 'Test Player' });
  console.log('TP insert id+name:', tpErr ? tpErr.message : 'SUCCESS');

  // Test community_posts with id and content
  const { error: cpErr } = await supabase.from('community_posts').insert({ id: 'cp-test', content: 'Test Content' });
  console.log('CP insert id+content:', cpErr ? cpErr.message : 'SUCCESS');
}

checkColumns();
