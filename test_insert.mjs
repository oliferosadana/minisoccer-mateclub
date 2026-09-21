import { createClient } from '@supabase/supabase-js';

const url = 'https://fxmyzwlfjygedsdbumjc.supabase.co';
const key = 'sb_publishable_67NPniejBv4sxFpZL3OKmA_NWmenhwT';
const supabase = createClient(url, key);

async function checkInsert() {
  // Check sponsors
  const { error: spErr } = await supabase.from('sponsors').insert({
    id: 'sp-1',
    name: 'Hydro Coco Official',
    logo_url: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5',
    tier: 'Platinum Sponsor',
    status: 'active'
  });
  console.log('Sponsor insert:', spErr ? spErr.message : 'SUCCESS');

  // Check top_performers
  const { error: tpErr } = await supabase.from('top_performers').insert({
    id: 'tp-1',
    player_name: 'Farhan Ramadhan',
    team_name: 'Garuda Muda FC',
    goals: 12,
    assists: 8,
    matches_played: 10,
    rating: 4.9
  });
  console.log('Top Performers insert:', tpErr ? tpErr.message : 'SUCCESS');

  // Check community_posts
  const { error: cpErr } = await supabase.from('community_posts').insert({
    id: 'cp-1',
    user_name: 'Captain Reza',
    user_role: 'Player / Striker',
    title: 'Matchday Seru Semalam!',
    content: 'Terima kasih teman-teman yang sudah join match di BSF.',
    likes_count: 24,
    comments_count: 5
  });
  console.log('Community Posts insert:', cpErr ? cpErr.message : 'SUCCESS');
}

checkInsert();
