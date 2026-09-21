import { createClient } from '@supabase/supabase-js';
import {
  INITIAL_USERS,
  INITIAL_VENUES,
  INITIAL_REFEREES,
  INITIAL_PHOTOGRAPHERS,
  INITIAL_FACILITIES,
  INITIAL_MATCHES,
  INITIAL_BOOKINGS,
  INITIAL_SPONSORS,
  INITIAL_TOP_PERFORMERS,
  INITIAL_COMMUNITY_POSTS
} from './src/lib/mockData.js';

const url = 'https://fxmyzwlfjygedsdbumjc.supabase.co';
const key = 'sb_publishable_67NPniejBv4sxFpZL3OKmA_NWmenhwT';
const supabase = createClient(url, key);

async function fullSeed() {
  console.log('=== FULL SEEDING TO SUPABASE CLOUD DATABASE ===');

  // Clean test artifacts
  await supabase.from('sponsors').delete().eq('id', 'sp-test');
  await supabase.from('top_performers').delete().eq('id', 'tp-test');
  await supabase.from('community_posts').delete().eq('id', 'cp-test');

  // 1. Users
  const userPayloads = INITIAL_USERS.map(u => ({
    id: u.id,
    name: u.name,
    phone: u.phone,
    email: u.email,
    password: u.password || 'player123',
    role: u.role || 'player',
    preferred_position: u.preferredPosition || 'Pemain Lapangan',
    club_origin: u.clubOrigin || 'Komunitas MATE CLUB',
    jersey_number: u.jerseyNumber || '10',
    caps: u.caps || 0,
    goals: u.goals || 0,
    mvp_count: u.mvpCount || 0,
    status: u.status || 'active',
    last_login_at: new Date().toISOString()
  }));
  const { error: errUsers } = await supabase.from('users').upsert(userPayloads);
  console.log('1. Users:', errUsers ? `GAGAL: ${errUsers.message}` : `BERHASIL (${userPayloads.length} users)`);

  // 2. Venues
  const venuePayloads = INITIAL_VENUES.map(v => ({
    id: v.id,
    name: v.name,
    location: v.location,
    rate_per_hour: v.ratePerHour,
    player_slot_fee: v.playerSlotFee,
    keeper_slot_fee: v.keeperSlotFee,
    image: v.image,
    specs: v.specs,
    facilities: v.facilities,
    status: v.status
  }));
  const { error: errVenues } = await supabase.from('venues').upsert(venuePayloads);
  console.log('2. Venues:', errVenues ? `GAGAL: ${errVenues.message}` : `BERHASIL (${venuePayloads.length} venues)`);

  // 3. Facilities
  const facilityPayloads = INITIAL_FACILITIES.map(f => ({
    id: f.id,
    name: f.name,
    icon: f.icon || 'fa-futbol',
    category: f.category || 'match',
    badge_color: f.badgeColor || '#3f72af',
    description: f.description || '',
    is_default_match: f.isDefault ?? true,
    status: f.status || 'active'
  }));
  const { error: errFac } = await supabase.from('facilities').upsert(facilityPayloads);
  console.log('3. Facilities:', errFac ? `GAGAL: ${errFac.message}` : `BERHASIL (${facilityPayloads.length} facilities)`);

  // 4. Referees
  const refPayloads = INITIAL_REFEREES.map(r => ({
    id: r.id,
    name: r.name,
    license: r.license,
    phone: r.phone,
    rate: r.rate,
    status: r.status,
    rating: r.rating
  }));
  const { error: errRef } = await supabase.from('referees').upsert(refPayloads);
  console.log('4. Referees:', errRef ? `GAGAL: ${errRef.message}` : `BERHASIL (${refPayloads.length} referees)`);

  // 5. Photographers
  const photoPayloads = INITIAL_PHOTOGRAPHERS.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    phone: p.phone,
    rate: p.rate,
    portfolio_url: p.portfolioUrl,
    status: p.status,
    rating: p.rating
  }));
  const { error: errPhoto } = await supabase.from('photographers').upsert(photoPayloads);
  console.log('5. Photographers:', errPhoto ? `GAGAL: ${errPhoto.message}` : `BERHASIL (${photoPayloads.length} photographers)`);

  // 6. Matches
  const matchPayloads = INITIAL_MATCHES.map(m => ({
    id: m.id,
    type: m.type,
    title: m.title,
    date: m.date,
    date_label: m.dateLabel || m.date,
    time_slot: m.timeSlot,
    field_id: m.fieldId,
    referee_id: m.refereeId,
    photographer_id: m.photographerId,
    player_fee: m.playerFee,
    keeper_fee: m.keeperFee,
    slot_fee: m.slotFee,
    position_pricing: m.positionPricing,
    status: m.status,
    level: m.level,
    level_badge: m.levelBadge,
    facilities: m.facilities,
    total_slots: m.totalSlots,
    player_slots: m.playerSlots,
    gk_slots: m.gkSlots,
    registered_players: m.registeredPlayers
  }));
  const { error: errMatches } = await supabase.from('matches').upsert(matchPayloads);
  console.log('6. Matches:', errMatches ? `GAGAL: ${errMatches.message}` : `BERHASIL (${matchPayloads.length} matches)`);

  // 7. Bookings
  const bookingPayloads = INITIAL_BOOKINGS.map(b => ({
    id: b.id,
    match_id: b.matchId,
    player_name: b.playerName,
    phone: b.phone,
    booking_type: b.bookingType || 'solo',
    position: b.position,
    jersey_size: b.jerseySize || 'L',
    base_amount: b.baseAmount || b.amount,
    unique_code: b.uniqueCode || 0,
    amount: b.amount,
    payment_method: b.paymentMethod || 'qris',
    payment_status: b.paymentStatus || 'waiting_verification',
    proof_image: b.proofImage || null,
    ticket_code: b.ticketCode
  }));
  const { error: errBookings } = await supabase.from('bookings').upsert(bookingPayloads);
  console.log('7. Bookings:', errBookings ? `GAGAL: ${errBookings.message}` : `BERHASIL (${bookingPayloads.length} bookings)`);

  // 8. Sponsors
  const tierMap = {
    'Platinum Sponsor': 'platinum',
    'Gold Sponsor': 'gold',
    'Silver Sponsor': 'silver',
    'Bronze Sponsor': 'bronze'
  };
  const sponsorPayloads = INITIAL_SPONSORS.map((s, idx) => ({
    id: s.id,
    name: s.name,
    tier: tierMap[s.tier] || 'gold',
    category: s.category || 'sports',
    logo: s.logo,
    website_url: s.website || s.websiteUrl || null,
    promo_text: s.promoText || null,
    status: s.status || 'active',
    order_index: idx
  }));
  const { error: errSponsors } = await supabase.from('sponsors').upsert(sponsorPayloads);
  console.log('8. Sponsors:', errSponsors ? `GAGAL: ${errSponsors.message}` : `BERHASIL (${sponsorPayloads.length} sponsors)`);

  // 9. Top Performers
  const tpPayloads = INITIAL_TOP_PERFORMERS.map(tp => ({
    id: tp.id,
    name: tp.name,
    club: tp.club || 'MATE CLUB',
    avatar: tp.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
    goals: tp.goals || 0,
    assists: tp.assists || 0,
    mvp: tp.mvp || 0,
    caps: tp.caps || 0,
    type: tp.category || 'striker',
    status: 'active'
  }));
  const { error: errTP } = await supabase.from('top_performers').upsert(tpPayloads);
  console.log('9. Top Performers:', errTP ? `GAGAL: ${errTP.message}` : `BERHASIL (${tpPayloads.length} top performers)`);

  // 10. Community Posts
  const cpPayloads = INITIAL_COMMUNITY_POSTS.map(cp => ({
    id: cp.id,
    title: cp.title || 'Matchday Highlight MATE CLUB',
    summary: cp.summary || (cp.content ? cp.content.slice(0, 80) + '...' : 'Seputar info mini soccer'),
    content: cp.content || '',
    category: cp.category || 'Komunitas',
    author: cp.authorName || 'Admin MATE CLUB',
    read_time: cp.readTime || '3 min baca',
    date: cp.date || new Date().toISOString().slice(0, 10),
    image: cp.image || null,
    status: 'active'
  }));
  const { error: errCP } = await supabase.from('community_posts').upsert(cpPayloads);
  console.log('10. Community Posts:', errCP ? `GAGAL: ${errCP.message}` : `BERHASIL (${cpPayloads.length} community posts)`);
}

fullSeed();
