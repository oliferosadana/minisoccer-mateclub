import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fxmyzwlfjygedsdbumjc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_67NPniejBv4sxFpZL3OKmA_NWmenhwT';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project'));

export const supabase = (() => {
  if (!isSupabaseConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  } catch (err) {
    console.warn('[Supabase] Init error:', err);
    return null;
  }
})();

/**
 * Format currency to IDR
 */
export const formatIDR = (num) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(num || 0);
};

/**
 * Generate unique Booking Code
 */
export const generateBookingId = () => {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const rand = Math.floor(100 + Math.random() * 900);
  return `BK-${datePart}-${rand}`;
};

/**
 * Generate unique Ticket Code
 */
export const generateTicketCode = (name = 'USER') => {
  const initials = (name || 'MC').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TK-${rand}-${initials}`;
};

// =========================================================================
// SUPABASE CLOUD DATA BRIDGES
// =========================================================================

export async function fetchUsersFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(u => ({
      ...u,
      balance: Number(u.balance || 0)
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch users:', err.message);
    return null;
  }
}

export async function upsertUserToSupabase(user) {
  if (!supabase) return null;
  try {
    const payload = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      password: user.password,
      role: user.role || 'player',
      preferred_position: user.preferredPosition || 'Pemain Lapangan',
      club_origin: user.clubOrigin || 'Komunitas MATE CLUB',
      jersey_number: user.jerseyNumber || '10',
      balance: Number(user.balance || 0),
      caps: user.caps || 0,
      goals: user.goals || 0,
      mvp_count: user.mvpCount || 0,
      status: user.status || 'active',
      last_login_at: user.lastLoginAt || new Date().toISOString()
    };
    const { data, error } = await supabase.from('users').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert user:', err.message);
    return null;
  }
}

export async function fetchWalletTransactionsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(tx => ({
      id: tx.id,
      userId: tx.user_id,
      phone: tx.phone,
      type: tx.type,
      amount: Number(tx.amount || 0),
      description: tx.description,
      bookingId: tx.booking_id,
      balanceAfter: Number(tx.balance_after || 0),
      createdAt: tx.created_at
    }));
  } catch (err) {
    // If table doesn't exist in Supabase yet, fallback gracefully
    console.warn('[Supabase] Failed to fetch wallet transactions:', err.message);
    return null;
  }
}

export async function upsertWalletTransactionToSupabase(tx) {
  if (!supabase) return null;
  try {
    const payload = {
      id: tx.id,
      user_id: tx.userId,
      phone: tx.phone,
      type: tx.type,
      amount: Number(tx.amount || 0),
      description: tx.description,
      booking_id: tx.bookingId || null,
      balance_after: Number(tx.balanceAfter || 0),
      created_at: tx.createdAt || new Date().toISOString()
    };
    const { data, error } = await supabase.from('wallet_transactions').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert wallet transaction:', err.message);
    return null;
  }
}

export async function fetchBookingsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(b => ({
      id: b.id,
      matchId: b.match_id,
      playerName: b.player_name,
      phone: b.phone,
      position: b.position,
      jerseySize: b.jersey_size || 'L',
      baseAmount: Number(b.base_amount || b.amount),
      uniqueCode: Number(b.unique_code || 0),
      amount: Number(b.amount),
      paymentMethod: b.payment_method || 'qris',
      paymentStatus: b.payment_status || 'waiting_verification',
      ticketCode: b.ticket_code,
      proofImage: b.proof_image,
      createdAt: b.created_at
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch bookings:', err.message);
    return null;
  }
}

export async function upsertBookingToSupabase(booking) {
  if (!supabase) return null;
  try {
    const payload = {
      id: booking.id,
      match_id: booking.matchId,
      player_name: booking.playerName,
      phone: booking.phone,
      booking_type: booking.bookingType || 'solo',
      position: booking.position,
      jersey_size: booking.jerseySize || 'L',
      base_amount: booking.baseAmount || booking.amount,
      unique_code: booking.uniqueCode || 0,
      amount: booking.amount,
      payment_method: booking.paymentMethod || 'qris',
      payment_status: booking.paymentStatus || 'waiting_verification',
      proof_image: booking.proofImage || null,
      ticket_code: booking.ticketCode
    };
    const { data, error } = await supabase.from('bookings').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert booking:', err.message);
    return null;
  }
}

export async function fetchVenuesFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('venues').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(v => ({
      id: v.id,
      name: v.name,
      location: v.location,
      ratePerHour: Number(v.rate_per_hour),
      playerSlotFee: Number(v.player_slot_fee),
      keeperSlotFee: Number(v.keeper_slot_fee),
      image: v.image,
      specs: v.specs,
      facilities: v.facilities || [],
      status: v.status || 'active'
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch venues:', err.message);
    return null;
  }
}

export async function upsertVenueToSupabase(venue) {
  if (!supabase) return null;
  try {
    const payload = {
      id: venue.id,
      name: venue.name,
      location: venue.location,
      rate_per_hour: venue.ratePerHour,
      player_slot_fee: venue.playerSlotFee,
      keeper_slot_fee: venue.keeperSlotFee,
      image: venue.image,
      specs: venue.specs,
      facilities: venue.facilities,
      status: venue.status
    };
    const { data, error } = await supabase.from('venues').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert venue:', err.message);
    return null;
  }
}

export async function fetchFacilitiesFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('facilities').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(f => ({
      id: f.id,
      name: f.name,
      icon: f.icon,
      category: f.category,
      badgeColor: f.badge_color,
      description: f.description,
      isDefault: f.is_default_match,
      status: f.status
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch facilities:', err.message);
    return null;
  }
}

export async function fetchRefereesFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('referees').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(r => ({
      id: r.id,
      name: r.name,
      license: r.license,
      phone: r.phone,
      rate: Number(r.rate),
      status: r.status,
      rating: Number(r.rating || 5.0)
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch referees:', err.message);
    return null;
  }
}

export async function fetchPhotographersFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('photographers').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      phone: p.phone,
      rate: Number(p.rate),
      portfolioUrl: p.portfolio_url,
      status: p.status,
      rating: Number(p.rating || 5.0)
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch photographers:', err.message);
    return null;
  }
}

export async function fetchSponsorsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('sponsors').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const tierDisplayMap = {
      platinum: 'Platinum Sponsor',
      gold: 'Gold Sponsor',
      silver: 'Silver Sponsor',
      bronze: 'Bronze Sponsor'
    };
    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      tier: tierDisplayMap[s.tier] || s.tier,
      category: s.category,
      logo: s.logo,
      website: s.website_url,
      promoText: s.promo_text,
      status: s.status
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch sponsors:', err.message);
    return null;
  }
}

export async function fetchCommunityPostsFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(cp => ({
      id: cp.id,
      title: cp.title,
      summary: cp.summary,
      content: cp.content,
      category: cp.category,
      authorName: cp.author,
      readTime: cp.read_time,
      date: cp.date,
      image: cp.image,
      likes: cp.likes || 0,
      status: cp.status
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch community posts:', err.message);
    return null;
  }
}

export async function fetchMatchesFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('matches').select('*').order('date', { ascending: true });
    if (error) throw error;
    return (data || []).map(m => ({
      id: m.id,
      type: m.type,
      title: m.title,
      date: m.date,
      dateLabel: m.date_label,
      timeSlot: m.time_slot,
      fieldId: m.field_id,
      refereeId: m.referee_id,
      photographerId: m.photographer_id,
      playerFee: Number(m.player_fee),
      keeperFee: Number(m.keeper_fee),
      slotFee: Number(m.slot_fee),
      positionPricing: m.position_pricing,
      status: m.status,
      level: m.level,
      levelBadge: m.level_badge,
      facilities: m.facilities || [],
      totalSlots: m.total_slots,
      playerSlots: m.player_slots,
      gkSlots: m.gk_slots,
      registeredPlayers: m.registered_players || []
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch matches:', err.message);
    return null;
  }
}

export async function upsertMatchToSupabase(match) {
  if (!supabase) return null;
  try {
    const payload = {
      id: match.id,
      type: match.type || 'fun_football',
      title: match.title,
      date: match.date,
      date_label: match.dateLabel || match.date,
      time_slot: match.timeSlot || '19:00 - 21:00 WITA',
      field_id: match.fieldId && String(match.fieldId).trim() !== '' ? match.fieldId : null,
      referee_id: match.refereeId && String(match.refereeId).trim() !== '' ? match.refereeId : null,
      photographer_id: match.photographerId && String(match.photographerId).trim() !== '' ? match.photographerId : null,
      player_fee: Number(match.playerFee || match.slotFee || 50000),
      keeper_fee: Number(match.keeperFee || 25000),
      slot_fee: Number(match.slotFee || match.playerFee || 50000),
      position_pricing: match.positionPricing || {
        'GK': Number(match.keeperFee || 25000),
        'DEF': Number(match.playerFee || 50000),
        'MID': Number(match.playerFee || 50000),
        'FWD': Number(match.playerFee || 50000),
        'ALL': Number(match.playerFee || 50000)
      },
      status: match.status || 'open',
      level: match.level || 'Medium / Menengah',
      level_badge: match.levelBadge || '⚡ Medium',
      facilities: match.facilities || [],
      total_slots: Number(match.totalSlots || 24),
      player_slots: Number(match.playerSlots || 22),
      gk_slots: Number(match.gkSlots || 2),
      registered_players: match.registeredPlayers || []
    };
    const { data, error } = await supabase.from('matches').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert match:', err.message);
    return null;
  }
}

export async function deleteUserFromSupabase(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete user:', err.message);
    return null;
  }
}

export async function deleteBookingFromSupabase(bookingId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete booking:', err.message);
    return null;
  }
}

export async function deleteMatchFromSupabase(matchId) {
  if (!supabase) return null;
  try {
    // Delete associated bookings first to prevent foreign key violations or orphaned bookings
    await supabase.from('bookings').delete().eq('match_id', matchId);
    const { data, error } = await supabase.from('matches').delete().eq('id', matchId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete match:', err.message);
    return null;
  }
}

export async function deleteVenueFromSupabase(venueId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('venues').delete().eq('id', venueId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete venue:', err.message);
    return null;
  }
}

export async function upsertRefereeToSupabase(referee) {
  if (!supabase) return null;
  try {
    const payload = {
      id: referee.id,
      name: referee.name,
      license: referee.license,
      phone: referee.phone,
      rate: referee.rate,
      status: referee.status || 'active',
      rating: referee.rating || 5.0
    };
    const { data, error } = await supabase.from('referees').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert referee:', err.message);
    return null;
  }
}

export async function deleteRefereeFromSupabase(refereeId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('referees').delete().eq('id', refereeId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete referee:', err.message);
    return null;
  }
}

export async function upsertPhotographerToSupabase(photo) {
  if (!supabase) return null;
  try {
    const payload = {
      id: photo.id,
      name: photo.name,
      category: photo.category,
      phone: photo.phone,
      rate: photo.rate,
      portfolio_url: photo.portfolioUrl,
      status: photo.status || 'active',
      rating: photo.rating || 5.0
    };
    const { data, error } = await supabase.from('photographers').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert photographer:', err.message);
    return null;
  }
}

export async function deletePhotographerFromSupabase(photoId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('photographers').delete().eq('id', photoId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete photographer:', err.message);
    return null;
  }
}

export async function upsertFacilityToSupabase(facility) {
  if (!supabase) return null;
  try {
    const payload = {
      id: facility.id,
      name: facility.name,
      icon: facility.icon || 'fa-futbol',
      category: facility.category || 'match',
      badge_color: facility.badgeColor || '#3f72af',
      description: facility.description || '',
      is_default_match: facility.isDefault ?? true,
      status: facility.status || 'active'
    };
    const { data, error } = await supabase.from('facilities').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert facility:', err.message);
    return null;
  }
}

export async function deleteFacilityFromSupabase(facilityId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('facilities').delete().eq('id', facilityId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete facility:', err.message);
    return null;
  }
}

export async function upsertSponsorToSupabase(sponsor) {
  if (!supabase) return null;
  try {
    const tierMap = {
      'Platinum Sponsor': 'platinum',
      'Gold Sponsor': 'gold',
      'Silver Sponsor': 'silver',
      'Bronze Sponsor': 'bronze'
    };
    const payload = {
      id: sponsor.id,
      name: sponsor.name,
      tier: tierMap[sponsor.tier] || sponsor.tier?.toLowerCase() || 'gold',
      category: sponsor.category || 'sports',
      logo: sponsor.logo,
      website_url: sponsor.website || sponsor.websiteUrl || null,
      promo_text: sponsor.promoText || null,
      status: sponsor.status || 'active'
    };
    const { data, error } = await supabase.from('sponsors').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert sponsor:', err.message);
    return null;
  }
}

export async function deleteSponsorFromSupabase(sponsorId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('sponsors').delete().eq('id', sponsorId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete sponsor:', err.message);
    return null;
  }
}

export async function upsertCommunityPostToSupabase(post) {
  if (!supabase) return null;
  try {
    const payload = {
      id: post.id,
      title: post.title || 'Postingan Komunitas',
      summary: post.summary || (post.content ? post.content.slice(0, 80) + '...' : 'Info komunitas'),
      content: post.content || '',
      category: post.category || 'Komunitas',
      author: post.authorName || post.author || 'Admin MATE CLUB',
      read_time: post.readTime || '3 min baca',
      date: post.date || new Date().toISOString().slice(0, 10),
      image: post.image || null,
      status: post.status || 'active'
    };
    const { data, error } = await supabase.from('community_posts').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert community post:', err.message);
    return null;
  }
}

export async function deleteCommunityPostFromSupabase(postId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('community_posts').delete().eq('id', postId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete community post:', err.message);
    return null;
  }
}

export async function upsertTopPerformerToSupabase(player) {
  if (!supabase) return null;
  try {
    const payload = {
      id: player.id,
      name: player.name,
      club: player.club || 'MATE CLUB',
      avatar: player.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
      goals: Number(player.goals || 0),
      assists: Number(player.assists || 0),
      mvp: Number(player.mvp || 0),
      caps: Number(player.caps || 0),
      type: player.category || player.type || 'striker',
      status: player.status || 'active'
    };
    const { data, error } = await supabase.from('top_performers').upsert(payload);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to upsert top performer:', err.message);
    return null;
  }
}

export async function fetchTopPerformersFromSupabase() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('top_performers').select('*').order('goals', { ascending: false });
    if (error) throw error;
    return (data || []).map(tp => ({
      id: tp.id,
      name: tp.name,
      club: tp.club,
      avatar: tp.avatar,
      goals: Number(tp.goals || 0),
      assists: Number(tp.assists || 0),
      mvp: Number(tp.mvp || 0),
      mvpCount: Number(tp.mvp || 0),
      caps: Number(tp.caps || 0),
      category: tp.type,
      status: tp.status
    }));
  } catch (err) {
    console.warn('[Supabase] Failed to fetch top performers:', err.message);
    return null;
  }
}

export async function deleteTopPerformerFromSupabase(playerId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('top_performers').delete().eq('id', playerId);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Supabase] Failed to delete top performer:', err.message);
    return null;
  }
}
