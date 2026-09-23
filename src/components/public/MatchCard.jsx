import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../lib/supabase';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  Camera,
  Shirt,
  Check,
  Ticket,
  ChevronRight,
  Flame,
  Trophy
} from 'lucide-react';

export const MatchCard = ({ match }) => {
  const {
    getVenueById,
    getRefereeById,
    getPhotographerById,
    setActiveBookingMatch,
    bookings,
    setActiveTicketBooking,
    getMatchRegisteredPlayers
  } = useApp();
  const { currentUser } = useAuth();

  const venue = getVenueById(match.fieldId);
  const referee = getRefereeById(match.refereeId);
  const photographer = getPhotographerById(match.photographerId);

  // Dynamically compute real-time registered players across match registered_players & bookings
  const effectivePlayers = getMatchRegisteredPlayers ? getMatchRegisteredPlayers(match.id) : (match.registeredPlayers || []);
  const registered = effectivePlayers.length;
  const total = match.totalSlots || 24;
  const percent = Math.min(100, Math.round((registered / total) * 100));
  const remaining = Math.max(0, total - registered);

  // Count player vs GK
  const gkCount = effectivePlayers.filter(p => {
    const pos = (p.pos || '').toLowerCase();
    return pos.includes('gawang') || pos.includes('kiper') || pos.includes('gk');
  }).length;
  const plCount = Math.max(0, registered - gkCount);
  const maxGk = match.gkSlots !== undefined ? match.gkSlots : 2;
  const maxPl = match.playerSlots !== undefined ? match.playerSlots : (total - maxGk);

  // Check if current user already registered
  const userBooking = (bookings || []).find(b => b.matchId === match.id && currentUser && (b.phone === currentUser.phone || b.playerName === currentUser.name));

  const isSolo = match.type === 'fun_football';
  const isSparring = match.type === 'sparring';
  const isTrofeo = match.type === 'trofeo';

  return (
    <div className="bg-white rounded-2xl border border-palette-subtle overflow-hidden shadow-card hover:shadow-elevated transition-all flex flex-col justify-between group">
      <div>
        {/* Card Header & Cover Image */}
        <div className="relative h-44 w-full overflow-hidden bg-palette-dark">
          <img
            src={venue?.image || 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80'}
            alt={match.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

          {/* Type & Level Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-palette-primary text-white shadow-xs">
              {isSolo && 'Open Play Solo'}
              {isSparring && 'Sparring 2 Tim'}
              {isTrofeo && 'Trofeo 3 Tim'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
              {match.levelBadge || '⚡ Medium'}
            </span>
          </div>

          {/* Pricing Chips */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div>
              <div className="text-[10px] text-gray-300 font-medium">Tarif Pendaftaran</div>
              <div className="text-base font-black text-white font-mono">
                {formatIDR(match.playerFee || match.slotFee)}
                <span className="text-[10px] font-normal text-gray-300 ml-1">/ slot</span>
              </div>
            </div>
            {isSolo && match.keeperFee && (
              <div className="text-right bg-emerald-500/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-emerald-400/40">
                <div className="text-[10px] font-bold">Slot Kiper (Diskon)</div>
                <div className="text-xs font-black font-mono">{formatIDR(match.keeperFee)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5">
          <h3 className="font-extrabold text-base text-palette-dark leading-snug group-hover:text-palette-primary transition-colors line-clamp-1 mb-2.5">
            {match.title}
          </h3>

          {/* Match Details */}
          <div className="space-y-1.5 text-xs text-gray-600 mb-4 bg-palette-bg p-3 rounded-xl border border-palette-subtle">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-palette-primary shrink-0" />
              <span className="font-semibold text-palette-dark">{match.dateLabel || match.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-palette-primary shrink-0" />
              <span>{match.timeSlot}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-palette-primary shrink-0" />
              <span className="truncate">{venue?.name}</span>
            </div>
          </div>

          {/* Sparring Team Matchup */}
          {(isSparring || isTrofeo) && (
            <div className="mb-4 bg-palette-bg p-3 rounded-xl border border-palette-subtle flex items-center justify-between text-center">
              <div className="flex-1">
                <div className="font-extrabold text-xs text-palette-dark truncate">{match.teamA?.name || 'Tim Penyelenggara'}</div>
                <div className="text-[10px] text-gray-500">Jersey: {match.teamA?.jerseyColor || 'Bebas'}</div>
              </div>
              <div className="px-2 py-0.5 bg-white rounded-md text-[11px] font-black text-palette-primary border border-palette-subtle">VS</div>
              <div className="flex-1">
                <div className={`font-extrabold text-xs truncate ${match.teamB ? 'text-palette-dark' : 'text-amber-600'}`}>
                  {match.teamB?.name || 'Menunggu Lawan'}
                </div>
                <div className="text-[10px] text-gray-500">{match.teamB?.jerseyColor || 'Tersedia'}</div>
              </div>
            </div>
          )}

          {/* Solo Player Quota Progress Bar */}
          {isSolo && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-gray-700">
                  Terisi: <strong className="text-palette-dark">{registered}/{total} Slot</strong>
                </span>
                <span className={`font-extrabold text-[11px] ${remaining <= 3 ? 'text-red-600' : 'text-palette-primary'}`}>
                  {remaining > 0 ? `Sisa ${remaining} Slot` : 'Slot Penuh'}
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-palette-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-gray-500 mt-1">
                <span>Pemain: {plCount}/{maxPl}</span>
                <span>Kiper (GK): {gkCount}/{maxGk}</span>
              </div>
            </div>
          )}

          {/* Facility Chips */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {(match.facilities || ['Wasit Berlisensi', 'Dokumentasi Foto HD', 'Rompi Bersih', 'Air Mineral']).slice(0, 3).map((fac, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-palette-bg text-[10px] font-semibold text-gray-700 border border-palette-subtle">
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate max-w-[130px]">{fac}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-4 sm:p-5 pt-0">
        {userBooking ? (
          <button
            onClick={() => setActiveTicketBooking(userBooking)}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4 text-emerald-600" /> Lihat E-Ticket Anda
          </button>
        ) : remaining <= 0 ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-gray-400 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            Slot Penuh (Terkunci)
          </button>
        ) : (
          <button
            onClick={() => setActiveBookingMatch(match)}
            className="w-full py-2.5 px-4 rounded-xl bg-palette-primary text-white font-extrabold text-xs hover:bg-palette-primaryDark transition-all shadow-sm flex items-center justify-center gap-2 group-hover:gap-3"
          >
            <span>Amankan Slot Main</span>
            <ChevronRight className="w-4 h-4 transition-all" />
          </button>
        )}
      </div>
    </div>
  );
};
