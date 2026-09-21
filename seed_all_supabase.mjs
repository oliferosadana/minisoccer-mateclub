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

async function seed() {
  console.log('=== SEEDING ALL DATASETS TO SUPABASE CLOUD ===');

  // 1. Users
  try {
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
  } catch (e) {
    console.log('1. Users Error:', e.message);
  }

  // 2. Venues
  try {
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
  } catch (e) {
    console.log('2. Venues Error:', e.message);
  }

  // 3. Facilities
  try {
    const facilityPayloads = INITIAL_FACILITIES.map(f => ({
      id: f.id,
      name: f.name,
      category: f.category,
      icon_name: f.iconName || f.icon,
      is_default: f.isDefault ?? true
    }));
    const { error: errFac } = await supabase.from('facilities').upsert(facilityPayloads);
    console.log('3. Facilities:', errFac ? `GAGAL: ${errFac.message}` : `BERHASIL (${facilityPayloads.length} facilities)`);
  } catch (e) {
    console.log('3. Facilities Error:', e.message);
  }

  // 4. Referees
  try {
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
  } catch (e) {
    console.log('4. Referees Error:', e.message);
  }

  // 5. Photographers
  try {
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
  } catch (e) {
    console.log('5. Photographers Error:', e.message);
  }

  // 6. Matches
  try {
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
  } catch (e) {
    console.log('6. Matches Error:', e.message);
  }

  // 7. Bookings
  try {
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
  } catch (e) {
    console.log('7. Bookings Error:', e.message);
  }

  // 8. Sponsors
  try {
    const sponsorPayloads = INITIAL_SPONSORS.map(s => ({
      id: s.id,
      name: s.name,
      tier: s.tier,
      logo: s.logo,
      website: s.website,
      status: s.status
    }));
    const { error: errSponsors } = await supabase.from('sponsors').upsert(sponsorPayloads);
    console.log('8. Sponsors:', errSponsors ? `GAGAL: ${errSponsors.message}` : `BERHASIL (${sponsorPayloads.length} sponsors)`);
  } catch (e) {
    console.log('8. Sponsors Error:', e.message);
  }

  // 9. Top Performers
  try {
    const tpPayloads = INITIAL_TOP_PERFORMERS.map(tp => ({
      id: tp.id,
      name: tp.name,
      club: tp.club,
      goals: tp.goals || 0,
      assists: tp.assists || 0,
      mvp: tp.mvp || 0,
      rating: tp.rating || 5.0,
      category: tp.category
    }));
    const { error: errTP } = await supabase.from('top_performers').upsert(tpPayloads);
    console.log('9. Top Performers:', errTP ? `GAGAL: ${errTP.message}` : `BERHASIL (${tpPayloads.length} top performers)`);
  } catch (e) {
    console.log('9. Top Performers Error:', e.message);
  }

  // 10. Community Posts
  try {
    const cpPayloads = INITIAL_COMMUNITY_POSTS.map(cp => ({
      id: cp.id,
      author_name: cp.authorName,
      author_avatar: cp.authorAvatar,
      author_role: cp.authorRole,
      content: cp.content,
      image: cp.image,
      likes: cp.likes || 0,
      comments_count: cp.commentsCount || 0,
      created_at: cp.createdAt || new Date().toISOString()
    }));
    const { error: errCP } = await supabase.from('community_posts').upsert(cpPayloads);
    console.log('10. Community Posts:', errCP ? `GAGAL: ${errCP.message}` : `BERHASIL (${cpPayloads.length} community posts)`);
  } catch (e) {
    console.log('10. Community Posts Error:', e.message);
  }
}

seed();
