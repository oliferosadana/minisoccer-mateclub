import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MatchCard } from './MatchCard';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Ticket, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Zap, 
  Award, 
  Trophy, 
  Clock, 
  ChevronRight,
  ShieldAlert,
  Wallet
} from 'lucide-react';

export const ScheduleView = () => {
  const { matches, venues, setPublicTab, setActiveBookingMatch, getVenueById } = useApp();

  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'fun_football' | 'sparring' | 'trofeo'
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Statistics calculation for live badges
  const openMatches = matches.filter(m => m.status === 'open');
  const totalOpenSlots = openMatches.reduce((acc, m) => {
    const filled = Array.isArray(m.registeredPlayers) ? m.registeredPlayers.length : 0;
    const total = m.totalSlots || 24;
    return acc + Math.max(0, total - filled);
  }, 0);

  const nextFeaturedMatch = openMatches[0] || matches[0];
  const featuredVenue = nextFeaturedMatch ? getVenueById(nextFeaturedMatch.fieldId) : null;
  const featuredFilled = nextFeaturedMatch && Array.isArray(nextFeaturedMatch.registeredPlayers) 
    ? nextFeaturedMatch.registeredPlayers.length 
    : 0;
  const featuredTotal = nextFeaturedMatch ? (nextFeaturedMatch.totalSlots || 24) : 24;
  const featuredRemaining = Math.max(0, featuredTotal - featuredFilled);
  const featuredProgress = Math.min(100, Math.round((featuredFilled / featuredTotal) * 100));

  const filteredMatches = matches.filter(m => {
    if (typeFilter !== 'all' && m.type !== typeFilter) return false;
    if (selectedVenue !== 'all' && m.fieldId !== selectedVenue) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = (m.title || '').toLowerCase();
      const dateStr = (m.dateLabel || m.date || '').toLowerCase();
      if (!matchTitle.includes(q) && !dateStr.includes(q)) return false;
    }
    return true;
  });

  const scrollToSearch = () => {
    const searchEl = document.getElementById('match-search-filter');
    if (searchEl) {
      searchEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* ANTI-SLOP CINEMATIC STADIUM HERO & TELEMETRY SECTION */}
      {/* ========================================================================= */}
      <div className="relative text-white rounded-3xl border border-white/15 shadow-2xl overflow-hidden bg-[#071322]">
        {/* Cinematic Stadium Background Image with Dynamic Lighting Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('https://i.pinimg.com/1200x/fe/6d/14/fe6d1PbWWqgKDBDorh525uecKaGZD21FGSoCeR.jpg'), url('/images/hero-stadium.jpg')` }}
        />
        {/* Layered Gradient & Vignette Overlay for High Readability & Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061220]/95 via-[#071526]/85 to-[#071322]/50 backdrop-blur-[0.5px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#061220] via-transparent to-[#061220]/40" />

        {/* Top Control & Operational Header */}
        <div className="relative z-10 px-6 py-3.5 bg-[#061220]/80 border-b border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px] font-bold text-gray-200 uppercase tracking-wider">
              Sistem Operasional Matchday • Balikpapan Musim 2026
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] text-gray-300">
            <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              <Zap className="w-3.5 h-3.5" /> {totalOpenSlots} Slot Tersedia
            </span>
            <span className="text-gray-500">|</span>
            <span className="bg-white/5 px-2 py-0.5 rounded border border-white/10">{venues.length} Venue Terverifikasi</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Direct Value, Specifications, & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-mono font-bold uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Platform Resmi Reservasi Pemain & Sparring</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] drop-shadow-md">
                Jadwal Pertandingan, <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Wasit PSSI & Transparansi Slot
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed max-w-xl font-normal drop-shadow-xs">
                Daftar sesi open play individu atau daftarkan tim sparring Anda tanpa perantara. Setiap pertandingan terintegrasi dengan wasit berlisensi PSSI, dokumentasi fotografer matchday HD, rompi steril per tim, dan penerbitan E-Ticket QR instan.
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={scrollToSearch}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Lihat Semua Jadwal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPublicTab('tracker')}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/25 backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>Cek & Unduh E-Ticket</span>
              </button>
            </div>

            {/* Architectural Feature Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/15">
              <div className="bg-[#061220]/75 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm">
                <div className="text-gray-400 text-[10px] font-mono uppercase">Format Laga</div>
                <div className="text-xs font-bold text-white mt-0.5">7 vs 7 & Trofeo 3 Tim</div>
                <div className="text-[10px] text-gray-300 mt-1">Alokasi posisi seimbang</div>
              </div>

              <div className="bg-[#061220]/75 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm">
                <div className="text-gray-400 text-[10px] font-mono uppercase">Standar Pertandingan</div>
                <div className="text-xs font-bold text-white mt-0.5">Wasit PSSI & Foto HD</div>
                <div className="text-[10px] text-gray-300 mt-1">Rompi bersih & bola match</div>
              </div>

              <div className="bg-[#061220]/75 backdrop-blur-md p-3 rounded-xl border border-white/15 shadow-sm">
                <div className="text-gray-400 text-[10px] font-mono uppercase">Transparansi Biaya</div>
                <div className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">Rp 25.000 – Rp 50.000</div>
                <div className="text-[10px] text-gray-300 mt-1">Cashback kode unik ke saldo</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Fixture Telemetry Terminal Glassmorphic Card (5 Cols) */}
          <div className="lg:col-span-5">
            {nextFeaturedMatch ? (
              <div className="bg-[#061220]/85 backdrop-blur-xl border border-white/20 rounded-2xl p-5 space-y-4 shadow-2xl hover:border-emerald-400/40 transition-all">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-emerald-400">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span>Laga Terdekat Berikutnya</span>
                  </div>
                  <span className="text-[10px] font-mono bg-white/10 text-gray-200 px-2 py-0.5 rounded border border-white/15">
                    {nextFeaturedMatch.type === 'fun_football' ? 'Solo Open Play' : 'Sparring Tim'}
                  </span>
                </div>

                {/* Match Title & Venue Info */}
                <div className="space-y-1">
                  <div className="text-base font-black text-white line-clamp-1">
                    {nextFeaturedMatch.title}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="line-clamp-1">{featuredVenue?.name || 'Balikpapan Soccer Field'}</span>
                  </div>
                </div>

                {/* Schedule Metric Box */}
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-2.5 rounded-xl border border-white/10 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-gray-400">Tanggal</div>
                    <div className="font-bold text-white text-[11px] truncate">
                      {nextFeaturedMatch.dateLabel || nextFeaturedMatch.date}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400">Waktu Kickoff</div>
                    <div className="font-bold text-white text-[11px] truncate">
                      {nextFeaturedMatch.timeSlot}
                    </div>
                  </div>
                </div>

                {/* Slot Capacity Status */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-300 font-mono">Kapasitas Slot:</span>
                    <span className="font-mono font-bold text-white">
                      <span className="text-emerald-400 font-extrabold">{featuredFilled}</span> / {featuredTotal} ({featuredRemaining} Kosong)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-white/10">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                      style={{ width: `${featuredProgress}%` }}
                    />
                  </div>
                </div>

                {/* Single Click Booking Action */}
                <button
                  type="button"
                  onClick={() => setActiveBookingMatch(nextFeaturedMatch)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <span>Reservasi Slot Laga Ini</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-[#061220]/80 backdrop-blur-md border border-white/15 rounded-2xl p-6 text-center text-gray-300 text-xs">
                <Calendar className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <div className="font-bold text-white">Belum Ada Jadwal Aktif</div>
                <div className="text-[11px] mt-1">Admin sedang menyusun jadwal matchday baru.</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div id="match-search-filter" className="bg-white p-4 sm:p-5 rounded-2xl border border-palette-subtle shadow-card space-y-3 scroll-mt-20">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari sesi jadwal, tanggal, atau venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none transition-all"
            />
          </div>

          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${typeFilter === 'all'
                  ? 'bg-palette-primary text-white shadow-xs'
                  : 'bg-palette-bg text-gray-600 hover:bg-palette-subtle/50'
                }`}
            >
              Semua Format
            </button>
            <button
              onClick={() => setTypeFilter('fun_football')}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${typeFilter === 'fun_football'
                  ? 'bg-palette-primary text-white shadow-xs'
                  : 'bg-palette-bg text-gray-600 hover:bg-palette-subtle/50'
                }`}
            >
              ⚽ Open Play Solo
            </button>
            <button
              onClick={() => setTypeFilter('sparring')}
              className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${typeFilter === 'sparring'
                  ? 'bg-palette-primary text-white shadow-xs'
                  : 'bg-palette-bg text-gray-600 hover:bg-palette-subtle/50'
                }`}
            >
              ⚔️ Sparring Tim
            </button>
          </div>
        </div>

        {/* Venue Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-palette-subtle text-xs">
          <span className="text-[11px] font-bold text-gray-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Venue:
          </span>
          <button
            onClick={() => setSelectedVenue('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${selectedVenue === 'all'
                ? 'bg-palette-dark text-white'
                : 'bg-palette-bg text-gray-600 hover:bg-palette-subtle'
              }`}
          >
            Semua Lapangan ({venues.length})
          </button>
          {venues.map(v => (
            <button
              key={v.id}
              onClick={() => setSelectedVenue(v.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all ${selectedVenue === v.id
                  ? 'bg-palette-dark text-white'
                  : 'bg-palette-bg text-gray-600 hover:bg-palette-subtle'
                }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards Grid */}
      {filteredMatches.length === 0 ? (
        <div className="bg-white border border-palette-subtle rounded-2xl p-12 text-center shadow-xs">
          <Calendar className="w-12 h-12 text-palette-primary mx-auto mb-3 opacity-60" />
          <h3 className="text-base font-extrabold text-palette-dark">Tidak Ada Jadwal yang Cocok</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            Coba ubah kata kunci pencarian atau ganti filter venue di atas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
};
