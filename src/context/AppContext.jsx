import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_VENUES,
  INITIAL_REFEREES,
  INITIAL_PHOTOGRAPHERS,
  INITIAL_FACILITIES,
  INITIAL_MATCHES,
  INITIAL_BOOKINGS,
  INITIAL_SPONSORS,
  INITIAL_PAYMENT_GATEWAYS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_WHATSAPP_CONFIG,
  INITIAL_TOURNAMENTS,
  INITIAL_STANDINGS_CLUBS,
  INITIAL_TOP_PERFORMERS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_COMMUNITY_MENU_CONFIG
} from '../lib/mockData';
import { 
  generateBookingId, 
  generateTicketCode,
  isSupabaseConfigured,
  supabase,
  fetchBookingsFromSupabase,
  upsertBookingToSupabase,
  deleteBookingFromSupabase,
  fetchMatchesFromSupabase,
  upsertMatchToSupabase,
  deleteMatchFromSupabase,
  fetchVenuesFromSupabase,
  upsertVenueToSupabase,
  deleteVenueFromSupabase,
  fetchFacilitiesFromSupabase,
  upsertFacilityToSupabase,
  deleteFacilityFromSupabase,
  fetchRefereesFromSupabase,
  upsertRefereeToSupabase,
  deleteRefereeFromSupabase,
  fetchPhotographersFromSupabase,
  upsertPhotographerToSupabase,
  deletePhotographerFromSupabase,
  fetchSponsorsFromSupabase,
  upsertSponsorToSupabase,
  deleteSponsorFromSupabase,
  fetchCommunityPostsFromSupabase,
  upsertCommunityPostToSupabase,
  deleteCommunityPostFromSupabase,
  fetchTopPerformersFromSupabase,
  upsertTopPerformerToSupabase,
  deleteTopPerformerFromSupabase
} from '../lib/supabase';

import { sendWahaTextMessage, parseWhatsAppTemplate } from '../lib/wahaGateway';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const { creditUserBalance, debitUserBalance } = useAuth();

  // Role & Navigation States
  const [role, setRole] = useState('public'); // 'public' | 'admin'
  const [publicTab, setPublicTab] = useState('schedule'); // 'schedule' | 'tracker' | 'venues' | 'community' | 'profile'
  const [adminSection, setAdminSection] = useState('overview'); // 'overview' | 'bookings' | 'matches' | 'venues' | 'officials' | 'facilities' | 'sponsors' | 'content_management' | 'tools'

  // Data Collections with LocalStorage Persistence
  const [matches, setMatches] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_matches');
      return s ? JSON.parse(s) : INITIAL_MATCHES;
    } catch { return INITIAL_MATCHES; }
  });

  const [venues, setVenues] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_venues');
      return s ? JSON.parse(s) : INITIAL_VENUES;
    } catch { return INITIAL_VENUES; }
  });

  const [referees, setReferees] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_referees');
      return s ? JSON.parse(s) : INITIAL_REFEREES;
    } catch { return INITIAL_REFEREES; }
  });

  const [photographers, setPhotographers] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_photographers');
      return s ? JSON.parse(s) : INITIAL_PHOTOGRAPHERS;
    } catch { return INITIAL_PHOTOGRAPHERS; }
  });

  const [facilities, setFacilities] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_facilities');
      return s ? JSON.parse(s) : INITIAL_FACILITIES;
    } catch { return INITIAL_FACILITIES; }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_bookings');
      return s ? JSON.parse(s) : INITIAL_BOOKINGS;
    } catch { return INITIAL_BOOKINGS; }
  });

  const [paymentGateways, setPaymentGateways] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_payment_gateways');
      const parsed = s ? JSON.parse(s) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(pg => {
          if (pg.provider === 'gopay') {
            return {
              ...pg,
              serverUrl: pg.serverUrl || 'https://gopay.masondo.dev',
              apiKey: (pg.apiKey && pg.apiKey !== 'gopay_secret_api_key_mateclub_2026') 
                ? pg.apiKey 
                : '382050b0c6f03386901e040efd9182b56021c43e3e2932260142cbcaf3729144',
              merchantId: pg.merchantId && !pg.merchantId.includes('MATECLUB') ? pg.merchantId : 'ID1026519799096',
              qrisStatic: (pg.qrisStatic && !pg.qrisStatic.includes('ID1020304050607'))
                ? pg.qrisStatic
                : '00020101021126610014COM.GO-JEK.WWW01189360091435670878450210G5670878450303UMI51440014ID.CO.QRIS.WWW0215ID10265197990960303UMI5204566153033605802ID5924Zolix shoes care, BLKPPN6010BALIKPAPAN61057613462140703A0111036216304'
            };
          }
          return pg;
        });
      }
      return INITIAL_PAYMENT_GATEWAYS;
    } catch { return INITIAL_PAYMENT_GATEWAYS; }
  });

  const [bankAccounts, setBankAccounts] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_bank_accounts');
      return s ? JSON.parse(s) : INITIAL_BANK_ACCOUNTS;
    } catch { return INITIAL_BANK_ACCOUNTS; }
  });

  const [whatsappConfig, setWhatsappConfig] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_whatsapp_config');
      const parsed = s ? JSON.parse(s) : null;
      if (parsed && parsed.provider) {
        const config = { ...INITIAL_WHATSAPP_CONFIG, ...parsed };
        if (config.serverUrl === 'http://localhost:3000') {
          config.serverUrl = 'http://localhost:3005';
        }
        return config;
      }
      return INITIAL_WHATSAPP_CONFIG;
    } catch { return INITIAL_WHATSAPP_CONFIG; }
  });

  const [sponsors, setSponsors] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_sponsors');
      return s ? JSON.parse(s) : INITIAL_SPONSORS;
    } catch { return INITIAL_SPONSORS; }
  });

  // Content Management: Tournaments, Standings, Top Performers, Community Posts
  const [tournaments, setTournaments] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_tournaments');
      return s ? JSON.parse(s) : INITIAL_TOURNAMENTS;
    } catch { return INITIAL_TOURNAMENTS; }
  });

  const [standingsClubs, setStandingsClubs] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_standings_clubs');
      return s ? JSON.parse(s) : INITIAL_STANDINGS_CLUBS;
    } catch { return INITIAL_STANDINGS_CLUBS; }
  });

  const [topPerformers, setTopPerformers] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_top_performers');
      return s ? JSON.parse(s) : INITIAL_TOP_PERFORMERS;
    } catch { return INITIAL_TOP_PERFORMERS; }
  });

  const [communityPosts, setCommunityPosts] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_community_posts');
      return s ? JSON.parse(s) : INITIAL_COMMUNITY_POSTS;
    } catch { return INITIAL_COMMUNITY_POSTS; }
  });

  const [communityMenuConfig, setCommunityMenuConfig] = useState(() => {
    try {
      const s = localStorage.getItem('mateclub_community_menu_config');
      return s ? JSON.parse(s) : INITIAL_COMMUNITY_MENU_CONFIG;
    } catch { return INITIAL_COMMUNITY_MENU_CONFIG; }
  });

  // Active Checkout & Modal States
  const [activeBookingMatch, setActiveBookingMatch] = useState(null);
  const [activeTicketBooking, setActiveTicketBooking] = useState(null);
  const [activeProofBooking, setActiveProofBooking] = useState(null);
  const [activeMatchEdit, setActiveMatchEdit] = useState(null);
  const [activeFieldEdit, setActiveFieldEdit] = useState(null);
  const [activeRefEdit, setActiveRefEdit] = useState(null);
  const [activePhotoEdit, setActivePhotoEdit] = useState(null);
  const [activeFacilityEdit, setActiveFacilityEdit] = useState(null);
  const [activeScoreMatch, setActiveScoreMatch] = useState(null);
  const [activeRosterMatch, setActiveRosterMatch] = useState(null);
  const [activeGatewayEdit, setActiveGatewayEdit] = useState(null);
  const [activeBankEdit, setActiveBankEdit] = useState(null);
  const [activeUserEdit, setActiveUserEdit] = useState(null);
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);

  // Active CMS Modals
  const [activeCommunityEdit, setActiveCommunityEdit] = useState(null);
  const [activeClubEdit, setActiveClubEdit] = useState(null);
  const [activePerformerEdit, setActivePerformerEdit] = useState(null);
  const [activeTournamentEdit, setActiveTournamentEdit] = useState(null);
  const [activeSponsorEdit, setActiveSponsorEdit] = useState(null);

  // Toast System
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem('mateclub_matches', JSON.stringify(matches));
  }, [matches]);
  useEffect(() => {
    localStorage.setItem('mateclub_venues', JSON.stringify(venues));
  }, [venues]);
  useEffect(() => {
    localStorage.setItem('mateclub_referees', JSON.stringify(referees));
  }, [referees]);
  useEffect(() => {
    localStorage.setItem('mateclub_photographers', JSON.stringify(photographers));
  }, [photographers]);
  useEffect(() => {
    localStorage.setItem('mateclub_facilities', JSON.stringify(facilities));
  }, [facilities]);
  useEffect(() => {
    localStorage.setItem('mateclub_bookings', JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem('mateclub_tournaments', JSON.stringify(tournaments));
  }, [tournaments]);
  useEffect(() => {
    localStorage.setItem('mateclub_standings_clubs', JSON.stringify(standingsClubs));
  }, [standingsClubs]);
  useEffect(() => {
    localStorage.setItem('mateclub_top_performers', JSON.stringify(topPerformers));
  }, [topPerformers]);
  useEffect(() => {
    localStorage.setItem('mateclub_community_posts', JSON.stringify(communityPosts));
  }, [communityPosts]);
  useEffect(() => {
    localStorage.setItem('mateclub_sponsors', JSON.stringify(sponsors));
  }, [sponsors]);
  useEffect(() => {
    localStorage.setItem('mateclub_community_menu_config', JSON.stringify(communityMenuConfig));
  }, [communityMenuConfig]);

  // Initial Fetch & Realtime for Bookings & Matches from Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Fetch remote data collections
    fetchMatchesFromSupabase().then(remoteMatches => {
      if (Array.isArray(remoteMatches)) {
        setMatches(remoteMatches);
      }
    });

    fetchBookingsFromSupabase().then(remoteBookings => {
      if (Array.isArray(remoteBookings)) {
        setBookings(remoteBookings);
      }
    });

    fetchVenuesFromSupabase().then(remoteVenues => {
      if (Array.isArray(remoteVenues)) {
        setVenues(remoteVenues);
      }
    });

    fetchFacilitiesFromSupabase().then(remoteFac => {
      if (Array.isArray(remoteFac)) {
        setFacilities(remoteFac);
      }
    });

    fetchRefereesFromSupabase().then(remoteRef => {
      if (Array.isArray(remoteRef)) {
        setReferees(remoteRef);
      }
    });

    fetchPhotographersFromSupabase().then(remotePhoto => {
      if (Array.isArray(remotePhoto)) {
        setPhotographers(remotePhoto);
      }
    });

    fetchSponsorsFromSupabase().then(remoteSponsors => {
      if (Array.isArray(remoteSponsors)) {
        setSponsors(remoteSponsors);
      }
    });

    fetchCommunityPostsFromSupabase().then(remotePosts => {
      if (Array.isArray(remotePosts)) {
        setCommunityPosts(remotePosts);
      }
    });

    fetchTopPerformersFromSupabase().then(remoteTop => {
      if (Array.isArray(remoteTop)) {
        setTopPerformers(remoteTop);
      }
    });

    // 2. Realtime subscription for bookings
    const bookingSub = supabase
      .channel('public:bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newB = {
            id: payload.new.id,
            matchId: payload.new.match_id,
            playerName: payload.new.player_name,
            phone: payload.new.phone,
            position: payload.new.position,
            jerseySize: payload.new.jersey_size || 'L',
            baseAmount: Number(payload.new.base_amount || payload.new.amount),
            uniqueCode: Number(payload.new.unique_code || 0),
            amount: Number(payload.new.amount),
            paymentMethod: payload.new.payment_method || 'qris',
            paymentStatus: payload.new.payment_status || 'waiting_verification',
            ticketCode: payload.new.ticket_code,
            proofImage: payload.new.proof_image,
            createdAt: payload.new.created_at
          };
          setBookings(prev => [newB, ...prev.filter(b => b.id !== newB.id)]);
          
          // Instantly sync registered players on target match in real-time
          setMatches(prev => prev.map(m => {
            if (m.id === newB.matchId) {
              const players = m.registeredPlayers || [];
              if (!players.some(p => p.phone === newB.phone || p.id === newB.id)) {
                return {
                  ...m,
                  registeredPlayers: [...players, {
                    id: newB.id,
                    name: newB.playerName,
                    phone: newB.phone,
                    pos: newB.position,
                    jerseySize: newB.jerseySize,
                    fee: newB.amount,
                    status: newB.paymentStatus
                  }]
                };
              }
            }
            return m;
          }));
        } else if (payload.eventType === 'UPDATE') {
          setBookings(prev => prev.map(b => b.id === payload.new.id ? {
            ...b,
            paymentStatus: payload.new.payment_status,
            proofImage: payload.new.proof_image
          } : b));

          setMatches(prev => prev.map(m => {
            if (m.registeredPlayers && m.registeredPlayers.some(p => p.id === payload.new.id || p.phone === payload.new.phone)) {
              return {
                ...m,
                registeredPlayers: m.registeredPlayers.map(p => 
                  (p.id === payload.new.id || p.phone === payload.new.phone) 
                    ? { ...p, status: payload.new.payment_status } 
                    : p
                )
              };
            }
            return m;
          }));
        } else if (payload.eventType === 'DELETE') {
          setBookings(prev => prev.filter(b => b.id !== payload.old.id));
        }
      })
      .subscribe();

    // 3. Realtime subscription for matches
    const matchSub = supabase
      .channel('public:matches')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, payload => {
        if (payload.eventType === 'INSERT') {
          const m = payload.new;
          const mappedMatch = {
            id: m.id,
            type: m.type || 'fun_football',
            title: m.title,
            date: m.date,
            dateLabel: m.date_label || m.date,
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
            totalSlots: Number(m.total_slots || 24),
            playerSlots: Number(m.player_slots || 22),
            gkSlots: Number(m.gk_slots || 2),
            registeredPlayers: m.registered_players || []
          };
          setMatches(prev => [mappedMatch, ...prev.filter(x => x.id !== mappedMatch.id)]);
        } else if (payload.eventType === 'UPDATE') {
          const m = payload.new;
          setMatches(prev => prev.map(x => {
            if (x.id === m.id) {
              return {
                ...x,
                type: m.type || x.type,
                title: m.title || x.title,
                date: m.date || x.date,
                dateLabel: m.date_label || x.dateLabel,
                timeSlot: m.time_slot || x.timeSlot,
                fieldId: m.field_id,
                refereeId: m.referee_id,
                photographerId: m.photographer_id,
                playerFee: Number(m.player_fee || x.playerFee),
                keeperFee: Number(m.keeper_fee || x.keeperFee),
                slotFee: Number(m.slot_fee || x.slotFee),
                positionPricing: m.position_pricing || x.positionPricing,
                status: m.status || x.status,
                level: m.level || x.level,
                levelBadge: m.level_badge || x.levelBadge,
                facilities: m.facilities || x.facilities,
                totalSlots: Number(m.total_slots || x.totalSlots || 24),
                playerSlots: Number(m.player_slots || x.playerSlots || 22),
                gkSlots: Number(m.gk_slots || x.gkSlots || 2),
                registeredPlayers: m.registered_players || x.registeredPlayers || []
              };
            }
            return x;
          }));
        } else if (payload.eventType === 'DELETE') {
          setMatches(prev => prev.filter(x => x.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      try {
        if (bookingSub && supabase) {
          supabase.removeChannel(bookingSub);
        }
        if (matchSub && supabase) {
          supabase.removeChannel(matchSub);
        }
      } catch (err) {
        console.warn('[Supabase] Cleanup error:', err);
      }
    };
  }, []);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Helper Lookups
  const getVenueById = (id) => venues.find(v => v.id === id) || venues[0];
  const getRefereeById = (id) => referees.find(r => r.id === id) || referees[0];
  const getPhotographerById = (id) => photographers.find(p => p.id === id) || photographers[0];
  const getMatchById = (id) => matches.find(m => m.id === id);
  const getFacilityById = (id) => facilities.find(f => f.id === id);

  // Real-time deduplicated registered player lookup per match
  const getMatchRegisteredPlayers = (matchId) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return [];
    const matchBookings = (bookings || []).filter(b => b.matchId === matchId);
    const rawPlayers = match.registeredPlayers || [];

    const playerMap = new Map();
    rawPlayers.forEach((p, idx) => {
      const key = p.phone || p.id || `player-${idx}`;
      playerMap.set(key, p);
    });

    matchBookings.forEach((b, idx) => {
      const key = b.phone || b.id || `booking-${idx}`;
      if (!playerMap.has(key)) {
        playerMap.set(key, {
          id: b.id,
          name: b.playerName,
          phone: b.phone,
          pos: b.position,
          jerseySize: b.jerseySize || 'L',
          fee: b.amount,
          status: b.paymentStatus
        });
      }
    });

    return Array.from(playerMap.values());
  };

  // --- MATCH CRUD ---
  const addMatch = (matchData) => {
    const newMatch = {
      ...matchData,
      id: matchData.id || `M-BPP-${Math.floor(100 + Math.random() * 900)}`,
      registeredPlayers: matchData.registeredPlayers || [],
      status: matchData.status || 'open'
    };
    setMatches(prev => [newMatch, ...prev]);
    upsertMatchToSupabase(newMatch).catch(() => {});
    showToast(`Slot pertandingan "${newMatch.title}" berhasil diterbitkan!`);
    return newMatch;
  };

  const updateMatch = (id, updatedData) => {
    let updatedObj = null;
    setMatches(prev => prev.map(m => {
      if (m.id === id) {
        updatedObj = { ...m, ...updatedData };
        return updatedObj;
      }
      return m;
    }));
    if (updatedObj) {
      upsertMatchToSupabase(updatedObj).catch(() => {});
    }
    showToast(`Jadwal pertandingan ${id} berhasil diperbarui!`);
  };

  const deleteMatch = (id) => {
    setMatches(prev => prev.filter(m => m.id !== id));
    setBookings(prev => prev.filter(b => b.matchId !== id));
    deleteMatchFromSupabase(id).catch(() => {});
    showToast(`Slot pertandingan ${id} berhasil dihapus.`);
  };

  // --- BOOKING CREATION & VALIDATION ---
  const createBooking = (bookingData) => {
    const id = generateBookingId();
    const ticketCode = generateTicketCode(bookingData.playerName);
    
    // Automatically mark as paid if verified via GoPay QRIS or paymentMethod is dynamic QRIS
    const isPaid = bookingData.isAutoVerified || bookingData.paymentStatus === 'paid';
    const status = isPaid ? 'paid' : (bookingData.paymentStatus || 'waiting_verification');

    const newBooking = {
      ...bookingData,
      id,
      ticketCode,
      jerseySize: bookingData.jerseySize || 'L',
      baseAmount: bookingData.baseAmount || bookingData.amount,
      uniqueCode: bookingData.uniqueCode || 0,
      paymentStatus: status,
      createdAt: new Date().toISOString()
    };

    setBookings(prev => [newBooking, ...prev]);
    upsertBookingToSupabase(newBooking).catch(() => {});

    // Update match registered players and sync to Supabase
    let updatedMatchToSave = null;
    setMatches(prev => prev.map(m => {
      if (m.id === bookingData.matchId) {
        const players = m.registeredPlayers || [];
        const isAlready = players.some(p => p.phone === bookingData.phone);
        const updatedPlayers = isAlready
          ? players.map(p => p.phone === bookingData.phone ? { ...p, status: status, jerseySize: bookingData.jerseySize || p.jerseySize || 'L', fee: newBooking.amount } : p)
          : [...players, {
              id: id,
              name: bookingData.playerName,
              phone: bookingData.phone,
              pos: bookingData.position,
              jerseySize: bookingData.jerseySize || 'L',
              fee: newBooking.amount,
              status: status
            }];

        updatedMatchToSave = { ...m, registeredPlayers: updatedPlayers };
        return updatedMatchToSave;
      }
      return m;
    }));

    if (updatedMatchToSave) {
      upsertMatchToSupabase(updatedMatchToSave).catch(() => {});
    }

    // Process User Wallet adjustments
    if (bookingData.usedWalletBalance > 0 && typeof debitUserBalance === 'function') {
      debitUserBalance(newBooking.phone, bookingData.usedWalletBalance, `Pembayaran Sebagian/Penuh Booking #${id}`, id);
    }
    if (isPaid && newBooking.uniqueCode > 0 && typeof creditUserBalance === 'function') {
      creditUserBalance(newBooking.phone, newBooking.uniqueCode, `Cashback Kelebihan Kode Unik (Booking #${id})`, id);
    }

    showToast(isPaid 
      ? `Booking ${id} terverifikasi LUNAS!${newBooking.uniqueCode > 0 ? ` (Kelebihan kode unik +Rp ${newBooking.uniqueCode} masuk ke saldo dompet Anda)` : ''}` 
      : `Booking ${id} berhasil dibuat! Segera lakukan pembayaran.`);

    // --- AUTOMATIC WHATSAPP NOTIFICATIONS (PLAYER & ADMIN) ---
    const match = matches.find(m => m.id === bookingData.matchId);
    const venue = match ? getVenueById(match.fieldId) : null;
    const templateData = {
      playerName: newBooking.playerName,
      bookingId: newBooking.id,
      ticketCode: newBooking.ticketCode,
      phone: newBooking.phone,
      position: newBooking.position,
      jerseySize: newBooking.jerseySize || 'L',
      baseAmount: newBooking.baseAmount,
      uniqueCode: newBooking.uniqueCode,
      matchTitle: match?.title || 'Pertandingan Mini Soccer',
      dateLabel: match?.dateLabel || match?.date || 'Matchday',
      timeSlot: match?.timeSlot || '19:00 WITA',
      venueName: venue?.name || 'Lapangan Mini Soccer',
      amount: newBooking.amount,
      status: newBooking.paymentStatus,
      ticketUrl: typeof window !== 'undefined' ? `${window.location.origin}` : 'https://mate-club.masondo.dev'
    };

    const templates = whatsappConfig?.templates || INITIAL_WHATSAPP_CONFIG.templates;

    // 1. Send to Player
    if (whatsappConfig?.playerNotifyEnabled !== false && newBooking.phone) {
      const targetTplId = isPaid ? 'tpl_approved' : 'tpl_invoice';
      const playerTpl = templates.find(t => t.id === targetTplId && t.enabled !== false);
      if (playerTpl) {
        const msg = parseWhatsAppTemplate(playerTpl.content, templateData);
        sendWahaTextMessage({
          serverUrl: whatsappConfig?.serverUrl || 'http://localhost:3005',
          sessionName: whatsappConfig?.sessionName || 'default',
          apiKey: whatsappConfig?.apiKey || '',
          phone: newBooking.phone,
          text: msg
        }).then(res => {
          if (res.success) {
            console.log(`[WAHA] Notification dispatched to player (${newBooking.phone})`);
          }
        }).catch(() => {});
      }
    }

    // 2. Send to Admin
    const adminPhone = whatsappConfig?.adminPhone || whatsappConfig?.deviceNumber || '081251234567';
    if (whatsappConfig?.adminNotifyEnabled !== false && adminPhone) {
      const adminTpl = templates.find(t => t.id === 'tpl_admin_notify' && t.enabled !== false);
      const defaultAdminTpl = `⚽ *NOTIFIKASI TRANSAKSI BOOKING BARU (ADMIN)*\n━━━━━━━━━━━━━━━━━━━━━\nAda pemain baru yang melakukan booking slot pertandingan!\n\n📋 *Data Peserta & Transaksi:*\n• ID Booking: *{kode_booking}*\n• Kode Tiket: *{kode_tiket}*\n• Nama Pemain: *{nama_pemain}*\n• WhatsApp: *{no_wa}*\n• Posisi: *{posisi}* ({ukuran_baju})\n• Sesi: *{judul_game}*\n• Jadwal: *{tanggal} ({jam})*\n• Venue: *{nama_lapangan}*\n• Biaya Slot: *{biaya_slot}*\n• Kode Unik: *{kode_unik}*\n• Total Transfer: *{total_bayar}*\n• Status Pembayaran: *{status_pembayaran}*\n\nSilakan pantau keterisian slot di Manajemen Jadwal Dashboard Admin.`;
      const adminMsg = parseWhatsAppTemplate(adminTpl ? adminTpl.content : defaultAdminTpl, templateData);

      sendWahaTextMessage({
        serverUrl: whatsappConfig?.serverUrl || 'http://localhost:3005',
        sessionName: whatsappConfig?.sessionName || 'default',
        apiKey: whatsappConfig?.apiKey || '',
        phone: adminPhone,
        text: adminMsg
      }).then(res => {
        if (res.success) {
          console.log(`[WAHA] Notification dispatched to admin (${adminPhone})`);
        }
      }).catch(() => {});
    }

    return newBooking;
  };

  const updateBookingStatus = (bookingId, status, rejectionReason = '') => {
    let updatedBookingObj = null;
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        updatedBookingObj = { ...b, paymentStatus: status };
        return updatedBookingObj;
      }
      return b;
    }));

    if (updatedBookingObj) {
      upsertBookingToSupabase(updatedBookingObj).catch(() => {});
    }

    // Update status in match players
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      let updatedMatchObj = null;
      setMatches(prev => prev.map(m => {
        if (m.id === booking.matchId) {
          const players = (m.registeredPlayers || []).map(p => {
            if (p.phone === booking.phone || p.id === booking.id) {
              return { ...p, status };
            }
            return p;
          });
          updatedMatchObj = { ...m, registeredPlayers: players };
          return updatedMatchObj;
        }
        return m;
      }));
      if (updatedMatchObj) {
        upsertMatchToSupabase(updatedMatchObj).catch(() => {});
      }

      const match = matches.find(m => m.id === booking.matchId);
      const venue = match ? getVenueById(match.fieldId) : null;
      const templateData = {
        playerName: booking.playerName,
        bookingId: booking.id,
        ticketCode: booking.ticketCode,
        phone: booking.phone,
        position: booking.position,
        jerseySize: booking.jerseySize || 'L',
        matchTitle: match?.title || 'Pertandingan Mini Soccer',
        dateLabel: match?.dateLabel || match?.date || 'Matchday',
        timeSlot: match?.timeSlot || '19:00 WITA',
        venueName: venue?.name || 'Lapangan Mini Soccer',
        amount: booking.amount,
        status: status,
        rejectionReason: rejectionReason || 'Bukti transfer tidak terbaca / nominal tidak sesuai',
        ticketUrl: typeof window !== 'undefined' ? `${window.location.origin}` : 'https://mate-club.masondo.dev'
      };

      const templates = whatsappConfig?.templates || INITIAL_WHATSAPP_CONFIG.templates;

      // Send confirmed notification to player if status changed to 'paid'
      if (status === 'paid') {
        if (booking.uniqueCode > 0 && typeof creditUserBalance === 'function') {
          creditUserBalance(booking.phone, booking.uniqueCode, `Cashback Kelebihan Kode Unik (Booking #${booking.id})`, booking.id);
        }

        const playerTpl = templates.find(t => t.id === 'tpl_approved' && t.enabled !== false);
        if (playerTpl && booking.phone) {
          const msg = parseWhatsAppTemplate(playerTpl.content, templateData);
          sendWahaTextMessage({
            serverUrl: whatsappConfig?.serverUrl || 'http://localhost:3005',
            sessionName: whatsappConfig?.sessionName || 'default',
            apiKey: whatsappConfig?.apiKey || '',
            phone: booking.phone,
            text: msg
          }).catch(() => {});
        }
      } else if (status === 'rejected') {
        // Send rejection notification to player
        const rejectTpl = templates.find(t => t.id === 'tpl_rejected' && t.enabled !== false);
        if (rejectTpl && booking.phone) {
          const msg = parseWhatsAppTemplate(rejectTpl.content, templateData);
          sendWahaTextMessage({
            serverUrl: whatsappConfig?.serverUrl || 'http://localhost:3005',
            sessionName: whatsappConfig?.sessionName || 'default',
            apiKey: whatsappConfig?.apiKey || '',
            phone: booking.phone,
            text: msg
          }).catch(() => {});
        }
      }
    }

    const statusLabels = {
      paid: 'Lunas & Terverifikasi',
      waiting_verification: 'Menunggu Verifikasi',
      rejected: 'Ditolak'
    };
    showToast(`Status booking ${bookingId} diubah menjadi: ${statusLabels[status] || status}`);
  };

  // Broadcast WhatsApp to all registered players of a match
  const broadcastMatchNotification = async (matchId, customText = '') => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return { success: false, error: 'Match tidak ditemukan' };

    const recipients = (match.registeredPlayers || [])
      .map(p => p.phone)
      .filter(phone => Boolean(phone));

    if (recipients.length === 0) {
      showToast('Tidak ada peserta dengan nomor WhatsApp terdaftar di match ini.', 'warning');
      return { success: false, error: 'Tidak ada nomor WhatsApp penerima' };
    }

    const venue = getVenueById(match.fieldId);
    const templateData = {
      matchTitle: match.title,
      dateLabel: match.dateLabel || match.date,
      timeSlot: match.timeSlot,
      venueName: venue?.name || 'Lapangan Mini Soccer',
      ticketUrl: typeof window !== 'undefined' ? `${window.location.origin}` : 'https://mate-club.masondo.dev'
    };

    const templates = whatsappConfig?.templates || INITIAL_WHATSAPP_CONFIG.templates;
    const reminderTpl = templates.find(t => t.id === 'tpl_reminder' && t.enabled !== false);
    const textToSend = customText || (reminderTpl ? parseWhatsAppTemplate(reminderTpl.content, templateData) : `⚽ Pengingat Jadwal Match: ${match.title} pada ${match.dateLabel} (${match.timeSlot}).`);

    const { sendWahaBulkMessages } = await import('../lib/wahaGateway');
    const res = await sendWahaBulkMessages({
      serverUrl: whatsappConfig?.serverUrl || 'http://localhost:3005',
      recipients,
      text: textToSend,
      apiKey: whatsappConfig?.apiKey || ''
    });

    if (res.success) {
      showToast(`Broadcast terkirim ke ${res.sentCount || recipients.length} peserta match!`, 'success');
    } else {
      showToast(res.error || 'Gagal mengirim broadcast', 'error');
    }
    return res;
  };


  const deleteBooking = (bookingId) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    deleteBookingFromSupabase(bookingId).catch(() => {});
    showToast(`Booking ${bookingId} berhasil dihapus.`);
  };

  // --- VENUE CRUD ---
  const addVenue = (venueData) => {
    const newVenue = {
      ...venueData,
      id: `f${Date.now().toString().slice(-3)}`
    };
    setVenues(prev => [...prev, newVenue]);
    upsertVenueToSupabase(newVenue).catch(() => {});
    showToast(`Lapangan "${newVenue.name}" berhasil ditambahkan!`);
  };

  const updateVenue = (id, updatedData) => {
    let updatedObj = null;
    setVenues(prev => prev.map(v => {
      if (v.id === id) {
        updatedObj = { ...v, ...updatedData };
        return updatedObj;
      }
      return v;
    }));
    if (updatedObj) {
      upsertVenueToSupabase(updatedObj).catch(() => {});
    }
    showToast(`Data lapangan berhasil diperbarui!`);
  };

  const deleteVenue = (id) => {
    setVenues(prev => prev.filter(v => v.id !== id));
    deleteVenueFromSupabase(id).catch(() => {});
    showToast(`Lapangan berhasil dihapus.`);
  };

  // --- REFEREE CRUD ---
  const addReferee = (refData) => {
    const newRef = { ...refData, id: `r${Date.now().toString().slice(-3)}` };
    setReferees(prev => [...prev, newRef]);
    upsertRefereeToSupabase(newRef).catch(() => {});
    showToast(`Wasit "${newRef.name}" berhasil ditambahkan!`);
  };

  const updateReferee = (id, updatedData) => {
    let updatedObj = null;
    setReferees(prev => prev.map(r => {
      if (r.id === id) {
        updatedObj = { ...r, ...updatedData };
        return updatedObj;
      }
      return r;
    }));
    if (updatedObj) {
      upsertRefereeToSupabase(updatedObj).catch(() => {});
    }
    showToast(`Data wasit berhasil diperbarui!`);
  };

  const deleteReferee = (id) => {
    setReferees(prev => prev.filter(r => r.id !== id));
    deleteRefereeFromSupabase(id).catch(() => {});
    showToast(`Wasit berhasil dihapus.`);
  };

  // --- PHOTOGRAPHER CRUD ---
  const addPhotographer = (photoData) => {
    const newPhoto = { ...photoData, id: `p${Date.now().toString().slice(-3)}` };
    setPhotographers(prev => [...prev, newPhoto]);
    upsertPhotographerToSupabase(newPhoto).catch(() => {});
    showToast(`Fotografer "${newPhoto.name}" berhasil ditambahkan!`);
  };

  const updatePhotographer = (id, updatedData) => {
    let updatedObj = null;
    setPhotographers(prev => prev.map(p => {
      if (p.id === id) {
        updatedObj = { ...p, ...updatedData };
        return updatedObj;
      }
      return p;
    }));
    if (updatedObj) {
      upsertPhotographerToSupabase(updatedObj).catch(() => {});
    }
    showToast(`Data fotografer berhasil diperbarui!`);
  };

  const deletePhotographer = (id) => {
    setPhotographers(prev => prev.filter(p => p.id !== id));
    deletePhotographerFromSupabase(id).catch(() => {});
    showToast(`Fotografer berhasil dihapus.`);
  };

  // --- FACILITY CRUD ---
  const addFacility = (facData) => {
    const newFac = {
      ...facData,
      id: `fac-${Date.now().toString().slice(-4)}`
    };
    setFacilities(prev => [...prev, newFac]);
    upsertFacilityToSupabase(newFac).catch(() => {});
    showToast(`Fasilitas "${newFac.name}" berhasil ditambahkan!`);
  };

  const updateFacility = (id, updatedData) => {
    let updatedObj = null;
    setFacilities(prev => prev.map(f => {
      if (f.id === id) {
        updatedObj = { ...f, ...updatedData };
        return updatedObj;
      }
      return f;
    }));
    if (updatedObj) {
      upsertFacilityToSupabase(updatedObj).catch(() => {});
    }
    showToast(`Data fasilitas berhasil diperbarui!`);
  };

  const toggleFacilityStatus = (id) => {
    let toggledObj = null;
    setFacilities(prev => prev.map(f => {
      if (f.id === id) {
        const newStatus = f.status === 'active' ? 'inactive' : 'active';
        toggledObj = { ...f, status: newStatus };
        showToast(`Status fasilitas "${f.name}" diubah ke: ${newStatus === 'active' ? 'Aktif' : 'Non-Aktif'}`);
        return toggledObj;
      }
      return f;
    }));
    if (toggledObj) {
      upsertFacilityToSupabase(toggledObj).catch(() => {});
    }
  };

  const deleteFacility = (id) => {
    if (facilities.length <= 1) {
      showToast('Minimal harus ada 1 fasilitas terdaftar!', 'error');
      return;
    }
    setFacilities(prev => prev.filter(f => f.id !== id));
    deleteFacilityFromSupabase(id).catch(() => {});
    showToast('Fasilitas berhasil dihapus.');
  };

  useEffect(() => {
    localStorage.setItem('mateclub_payment_gateways', JSON.stringify(paymentGateways));
  }, [paymentGateways]);
  useEffect(() => {
    localStorage.setItem('mateclub_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);
  useEffect(() => {
    localStorage.setItem('mateclub_whatsapp_config', JSON.stringify(whatsappConfig));
  }, [whatsappConfig]);

  // --- BANK ACCOUNTS MANAGEMENT (MANUAL VERIFICATION) ---
  const addBankAccount = (accData) => {
    const newAcc = {
      id: accData.id || `bank-${Date.now().toString().slice(-6)}`,
      bankName: accData.bankName?.trim() || 'Bank BCA',
      bankCode: accData.bankCode?.trim() || (accData.bankName?.toLowerCase().replace(/\s+/g, '') || 'bank'),
      accountNumber: accData.accountNumber?.trim() || '0000-0000-0000',
      accountHolder: accData.accountHolder?.trim() || 'MATE CLUB BALIKPAPAN',
      branch: accData.branch?.trim() || '',
      isActive: accData.isActive !== false,
      color: accData.color || '#005baa',
      notes: accData.notes?.trim() || 'Transfer Bank Manual'
    };
    setBankAccounts(prev => [...prev, newAcc]);
    showToast(`Rekening ${newAcc.bankName} (${newAcc.accountNumber}) berhasil ditambahkan!`, 'success');
    return newAcc;
  };

  const updateBankAccount = (id, updatedData) => {
    setBankAccounts(prev => prev.map(b => b.id === id ? { ...b, ...updatedData } : b));
    showToast(`Rekening bank berhasil diperbarui!`, 'success');
  };

  const deleteBankAccount = (id) => {
    if (bankAccounts.length <= 1) {
      showToast('Minimal harus ada 1 rekening bank terdaftar di sistem!', 'error');
      return;
    }
    setBankAccounts(prev => prev.filter(b => b.id !== id));
    showToast('Rekening bank berhasil dihapus.', 'info');
  };

  const toggleBankAccountStatus = (id) => {
    setBankAccounts(prev => prev.map(b => {
      if (b.id === id) {
        const nextStatus = !b.isActive;
        showToast(`Status rekening ${b.bankName} diubah menjadi: ${nextStatus ? 'AKTIF' : 'NONAKTIF'}`);
        return { ...b, isActive: nextStatus };
      }
      return b;
    }));
  };

  // --- PAYMENT GATEWAY MANAGEMENT (SUPERADMIN) ---
  const updatePaymentGateway = (id, updatedData) => {
    setPaymentGateways(prev => prev.map(pg => pg.id === id ? { ...pg, ...updatedData } : pg));
    showToast(`Konfigurasi ${id} berhasil disimpan!`);
  };

  const toggleGatewayStatus = (id) => {
    setPaymentGateways(prev => prev.map(pg => {
      if (pg.id === id) {
        const nextStatus = pg.status === 'active' ? 'inactive' : 'active';
        showToast(`Gateway ${pg.name} diubah menjadi: ${nextStatus.toUpperCase()}`);
        return { ...pg, status: nextStatus };
      }
      return pg;
    }));
  };

  const toggleGatewayChannel = (gatewayId, channelId) => {
    setPaymentGateways(prev => prev.map(pg => {
      if (pg.id === gatewayId) {
        const updatedChannels = pg.channels.map(ch => 
          ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
        );
        return { ...pg, channels: updatedChannels };
      }
      return pg;
    }));
    showToast('Kanal pembayaran diperbarui.');
  };

  // --- WHATSAPP GATEWAY MANAGEMENT (SUPERADMIN) ---
  const updateWhatsAppConfig = (updatedData) => {
    setWhatsappConfig(prev => ({ ...prev, ...updatedData }));
    showToast('Konfigurasi WhatsApp Gateway berhasil diperbarui!');
  };

  const updateWhatsAppTemplate = (templateId, newContent) => {
    setWhatsappConfig(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === templateId ? { ...t, content: newContent } : t)
    }));
    showToast('Template pesan WhatsApp berhasil disimpan!');
  };

  const toggleWhatsAppTemplate = (templateId) => {
    setWhatsappConfig(prev => ({
      ...prev,
      templates: prev.templates.map(t => t.id === templateId ? { ...t, enabled: !t.enabled } : t)
    }));
  };

  const testSendWhatsAppMessage = (phone, _message) => {
    showToast(`[SIMULASI WA] Pesan uji coba berhasil dikirimkan ke ${phone}!`);
    return { success: true, timestamp: new Date().toISOString() };
  };

  // --- COMMUNITY CONTENT CRUD ---
  const addCommunityPost = (postData) => {
    const newPost = {
      ...postData,
      id: postData.id || `post-${Date.now().toString().slice(-4)}`,
      date: postData.date || new Date().toISOString().split('T')[0],
      dateLabel: postData.dateLabel || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: postData.status || 'active',
      isPinned: !!postData.isPinned,
      tags: postData.tags || []
    };
    setCommunityPosts(prev => [newPost, ...prev]);
    upsertCommunityPostToSupabase(newPost).catch(() => {});
    showToast(`Konten "${newPost.title}" berhasil diterbitkan!`);
    return newPost;
  };

  const updateCommunityPost = (id, updatedData) => {
    let updatedObj = null;
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === id) {
        updatedObj = { ...p, ...updatedData };
        return updatedObj;
      }
      return p;
    }));
    if (updatedObj) {
      upsertCommunityPostToSupabase(updatedObj).catch(() => {});
    }
    showToast(`Konten komunitas berhasil diperbarui!`);
  };

  const toggleCommunityPostStatus = (id) => {
    let toggledObj = null;
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === id) {
        const next = p.status === 'active' ? 'inactive' : 'active';
        toggledObj = { ...p, status: next };
        showToast(`Status konten diubah menjadi: ${next === 'active' ? 'Aktif' : 'Non-Aktif'}`);
        return toggledObj;
      }
      return p;
    }));
    if (toggledObj) {
      upsertCommunityPostToSupabase(toggledObj).catch(() => {});
    }
  };

  const deleteCommunityPost = (id) => {
    setCommunityPosts(prev => prev.filter(p => p.id !== id));
    deleteCommunityPostFromSupabase(id).catch(() => {});
    showToast('Konten komunitas berhasil dihapus.');
  };

  // --- KLASEMEN & KLUB STANDINGS CRUD ---
  const addStandingClub = (clubData) => {
    const gf = Number(clubData.goalsFor || 0);
    const ga = Number(clubData.goalsAgainst || 0);
    const w = Number(clubData.won || 0);
    const d = Number(clubData.drawn || 0);
    const l = Number(clubData.lost || 0);
    const played = Number(clubData.played || (w + d + l));

    const newClub = {
      ...clubData,
      id: clubData.id || `club-${Date.now().toString().slice(-4)}`,
      tournamentId: clubData.tournamentId || 'trn-1',
      rank: clubData.rank || standingsClubs.length + 1,
      played,
      won: w,
      drawn: d,
      lost: l,
      goalsFor: gf,
      goalsAgainst: ga,
      status: clubData.status || 'active'
    };
    setStandingsClubs(prev => [...prev, newClub]);
    showToast(`Tim "${newClub.name}" berhasil ditambahkan ke klasemen!`);
    return newClub;
  };

  const updateStandingClub = (id, updatedData) => {
    setStandingsClubs(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
    showToast('Data statistik tim klasemen berhasil diperbarui!');
  };

  const toggleStandingClubStatus = (id) => {
    setStandingsClubs(prev => prev.map(c => {
      if (c.id === id) {
        const next = c.status === 'active' ? 'inactive' : 'active';
        showToast(`Status klub "${c.name}" diubah ke: ${next === 'active' ? 'Aktif' : 'Non-Aktif'}`);
        return { ...c, status: next };
      }
      return c;
    }));
  };

  const deleteStandingClub = (id) => {
    setStandingsClubs(prev => prev.filter(c => c.id !== id));
    showToast('Tim klasemen berhasil dihapus.');
  };

  // --- TOP PERFORMERS (TOP SKOR & MVP) CRUD ---
  const addTopPerformer = (performerData) => {
    const newPerformer = {
      ...performerData,
      id: performerData.id || `top-${Date.now().toString().slice(-4)}`,
      tournamentId: performerData.tournamentId || 'trn-1',
      rank: performerData.rank || topPerformers.length + 1,
      caps: Number(performerData.caps || 0),
      goals: Number(performerData.goals || 0),
      assists: Number(performerData.assists || 0),
      cleanSheet: Number(performerData.cleanSheet || 0),
      mvpCount: Number(performerData.mvpCount || performerData.mvp || 0),
      status: performerData.status || 'active'
    };
    setTopPerformers(prev => [...prev, newPerformer]);
    upsertTopPerformerToSupabase(newPerformer).catch(() => {});
    showToast(`Top performer "${newPerformer.name}" berhasil ditambahkan!`);
    return newPerformer;
  };

  const updateTopPerformer = (id, updatedData) => {
    let updatedObj = null;
    setTopPerformers(prev => prev.map(tp => {
      if (tp.id === id) {
        updatedObj = { ...tp, ...updatedData };
        return updatedObj;
      }
      return tp;
    }));
    if (updatedObj) {
      upsertTopPerformerToSupabase(updatedObj).catch(() => {});
    }
    showToast('Data top performer berhasil diperbarui!');
  };

  const toggleTopPerformerStatus = (id) => {
    let toggledObj = null;
    setTopPerformers(prev => prev.map(tp => {
      if (tp.id === id) {
        const next = tp.status === 'active' ? 'inactive' : 'active';
        toggledObj = { ...tp, status: next };
        showToast(`Status top performer "${tp.name}" diubah ke: ${next === 'active' ? 'Aktif' : 'Non-Aktif'}`);
        return toggledObj;
      }
      return tp;
    }));
    if (toggledObj) {
      upsertTopPerformerToSupabase(toggledObj).catch(() => {});
    }
  };

  const deleteTopPerformer = (id) => {
    setTopPerformers(prev => prev.filter(tp => tp.id !== id));
    deleteTopPerformerFromSupabase(id).catch(() => {});
    showToast('Top performer berhasil dihapus.');
  };

  // --- TOURNAMENTS CRUD ---
  const addTournament = (trnData) => {
    const newTrn = {
      ...trnData,
      id: trnData.id || `trn-${Date.now().toString().slice(-3)}`,
      status: trnData.status || 'active'
    };
    setTournaments(prev => [...prev, newTrn]);
    showToast(`Turnamen "${newTrn.name}" berhasil dibuat!`);
  };

  const updateTournament = (id, updatedData) => {
    setTournaments(prev => prev.map(t => t.id === id ? { ...t, ...updatedData } : t));
    showToast('Turnamen berhasil diperbarui!');
  };

  const toggleTournamentStatus = (id) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === id) {
        const next = t.status === 'active' ? 'inactive' : 'active';
        showToast(`Turnamen diubah ke: ${next === 'active' ? 'Aktif' : 'Non-Aktif'}`);
        return { ...t, status: next };
      }
      return t;
    }));
  };

  // --- SPONSORS & PARTNERS CRUD ---
  const addSponsor = (spData) => {
    const newSp = {
      ...spData,
      id: spData.id || `sp-${Date.now().toString().slice(-4)}`,
      status: spData.status || 'active',
      isFeatured: spData.isFeatured !== undefined ? spData.isFeatured : true
    };
    setSponsors(prev => [...prev, newSp]);
    upsertSponsorToSupabase(newSp).catch(() => {});
    showToast(`Mitra sponsor "${newSp.name}" berhasil ditambahkan!`);
    return newSp;
  };

  const updateSponsor = (id, updatedData) => {
    let updatedObj = null;
    setSponsors(prev => prev.map(sp => {
      if (sp.id === id) {
        updatedObj = { ...sp, ...updatedData };
        return updatedObj;
      }
      return sp;
    }));
    if (updatedObj) {
      upsertSponsorToSupabase(updatedObj).catch(() => {});
    }
    showToast('Data mitra sponsor berhasil diperbarui!');
  };

  const toggleSponsorStatus = (id) => {
    let toggledObj = null;
    setSponsors(prev => prev.map(sp => {
      if (sp.id === id) {
        const next = sp.status === 'active' ? 'inactive' : 'active';
        toggledObj = { ...sp, status: next };
        showToast(`Status sponsor diubah ke: ${next === 'active' ? 'Aktif' : 'Non-Aktif'}`);
        return toggledObj;
      }
      return sp;
    }));
    if (toggledObj) {
      upsertSponsorToSupabase(toggledObj).catch(() => {});
    }
  };

  const deleteSponsor = (id) => {
    setSponsors(prev => prev.filter(sp => sp.id !== id));
    deleteSponsorFromSupabase(id).catch(() => {});
    showToast('Mitra sponsor berhasil dihapus.');
  };

  // --- COMMUNITY MODULE VISIBILITY SETTINGS ---
  const toggleCommunityMenu = (menuKey) => {
    const labels = {
      showStandings: 'Tabel Klasemen',
      showTopPerformers: 'Top Skor & MVP',
      showArticles: 'Berita & Pengumuman',
      showGallery: 'Galeri Foto Matchday',
      showSponsors: 'Mitra Sponsor & Kolaborasi'
    };

    setCommunityMenuConfig(prev => {
      const next = { ...prev, [menuKey]: !prev[menuKey] };
      showToast(`${labels[menuKey] || menuKey} diubah ke: ${next[menuKey] ? 'Aktif (Tampil)' : 'Non-Aktif (Sembunyi)'}`);
      return next;
    });
  };

  const updateCommunityMenuConfig = (newConfig) => {
    setCommunityMenuConfig(prev => ({ ...prev, ...newConfig }));
    showToast('Pengaturan tampilan menu komunitas diperbarui!');
  };

  // Reset to default demo data
  const resetDemoData = () => {
    setMatches(INITIAL_MATCHES);
    setVenues(INITIAL_VENUES);
    setReferees(INITIAL_REFEREES);
    setPhotographers(INITIAL_PHOTOGRAPHERS);
    setFacilities(INITIAL_FACILITIES);
    setBookings(INITIAL_BOOKINGS);
    setPaymentGateways(INITIAL_PAYMENT_GATEWAYS);
    setBankAccounts(INITIAL_BANK_ACCOUNTS);
    setWhatsappConfig(INITIAL_WHATSAPP_CONFIG);
    setSponsors(INITIAL_SPONSORS);
    setTournaments(INITIAL_TOURNAMENTS);
    setStandingsClubs(INITIAL_STANDINGS_CLUBS);
    setTopPerformers(INITIAL_TOP_PERFORMERS);
    setCommunityPosts(INITIAL_COMMUNITY_POSTS);
    setCommunityMenuConfig(INITIAL_COMMUNITY_MENU_CONFIG);
    showToast('Data demo berhasil di-reset ke kondisi awal!');
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        publicTab,
        setPublicTab,
        adminSection,
        setAdminSection,
        matches,
        venues,
        referees,
        photographers,
        facilities,
        bookings,
        paymentGateways,
        bankAccounts,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        toggleBankAccountStatus,
        whatsappConfig,
        sponsors,
        tournaments,
        standingsClubs,
        topPerformers,
        communityPosts,
        communityMenuConfig,
        toggleCommunityMenu,
        updateCommunityMenuConfig,
        toasts,
        showToast,
        getVenueById,
        getRefereeById,
        getPhotographerById,
        getMatchById,
        getFacilityById,
        getMatchRegisteredPlayers,
        addMatch,
        updateMatch,
        deleteMatch,
        createBooking,
        updateBookingStatus,
        deleteBooking,
        addVenue,
        updateVenue,
        deleteVenue,
        addReferee,
        updateReferee,
        deleteReferee,
        addPhotographer,
        updatePhotographer,
        deletePhotographer,
        addFacility,
        updateFacility,
        toggleFacilityStatus,
        deleteFacility,
        updatePaymentGateway,
        toggleGatewayStatus,
        toggleGatewayChannel,
        updateWhatsAppConfig,
        updateWhatsAppTemplate,
        toggleWhatsAppTemplate,
        testSendWhatsAppMessage,
        broadcastMatchNotification,
        // Content Management functions
        addCommunityPost,
        updateCommunityPost,
        toggleCommunityPostStatus,
        deleteCommunityPost,
        addStandingClub,
        updateStandingClub,
        toggleStandingClubStatus,
        deleteStandingClub,
        addTopPerformer,
        updateTopPerformer,
        toggleTopPerformerStatus,
        deleteTopPerformer,
        addTournament,
        updateTournament,
        toggleTournamentStatus,
        addSponsor,
        updateSponsor,
        toggleSponsorStatus,
        deleteSponsor,
        resetDemoData,
        // Modal states
        activeBookingMatch,
        setActiveBookingMatch,
        activeTicketBooking,
        setActiveTicketBooking,
        activeProofBooking,
        setActiveProofBooking,
        activeMatchEdit,
        setActiveMatchEdit,
        activeFieldEdit,
        setActiveFieldEdit,
        activeRefEdit,
        setActiveRefEdit,
        activePhotoEdit,
        setActivePhotoEdit,
        activeFacilityEdit,
        setActiveFacilityEdit,
        activeScoreMatch,
        setActiveScoreMatch,
        activeRosterMatch,
        setActiveRosterMatch,
        activeGatewayEdit,
        setActiveGatewayEdit,
        activeBankEdit,
        setActiveBankEdit,
        activeUserEdit,
        setActiveUserEdit,
        isTopUpModalOpen,
        setIsTopUpModalOpen,
        // CMS Modal states
        activeCommunityEdit,
        setActiveCommunityEdit,
        activeClubEdit,
        setActiveClubEdit,
        activePerformerEdit,
        setActivePerformerEdit,
        activeTournamentEdit,
        setActiveTournamentEdit,
        activeSponsorEdit,
        setActiveSponsorEdit
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
