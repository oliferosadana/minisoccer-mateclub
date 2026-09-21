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
      {/* PREMIUM STADIUM HERO BANNER */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07172b] via-[#0d2744] to-[#063327] text-white p-6 sm:p-8 lg:p-10 border border-white/10 shadow-2xl">
        {/* Ambient Glows & Soccer Pitch Geometry Background */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle Pitch Lines SVG Texture */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT COLUMN: Hero Copy & CTAs (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Live Season Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>MATCHDAY SEASON 2026 • MATE CLUB BALIKPAPAN</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white">
                Main Mini Soccer <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                  Lebih Seru & Teratur.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
                Platform reservasi matchday mini soccer #1 di Balikpapan. Booking 1-klik, sistem E-Ticket QR instan, wasit berlisensi PSSI, fotografer HD di setiap laga, serta pencatatan statistik pemain.
              </p>
            </div>

            {/* Action Buttons Group */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={scrollToSearch}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Cari & Amankan Slot</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setPublicTab('tracker')}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>Cek E-Ticket Saya</span>
              </button>
            </div>

            {/* Quick Live Stats Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-gray-400 font-medium">Slot Terbuka</div>
                <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5 font-mono flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{totalOpenSlots} Slot</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-gray-400 font-medium">Venue Rekanan</div>
                <div className="text-sm sm:text-base font-black text-white mt-0.5 font-mono flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{venues.length} Lapangan</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-gray-400 font-medium">Wasit Resmi</div>
                <div className="text-sm sm:text-base font-black text-white mt-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Lisensi PSSI</span>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <div className="text-[10px] text-gray-400 font-medium">Dokumentasi</div>
                <div className="text-sm sm:text-base font-black text-white mt-0.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  <span>Fotografer HD</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Featured Next Match Card (5 Cols Glassmorphism) */}
          <div className="lg:col-span-5">
            {nextFeaturedMatch ? (
              <div className="relative group bg-gradient-to-b from-white/15 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl transition-all duration-300 hover:border-emerald-400/50">
                {/* Top Badge on Featured Card */}
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Laga Terdekat Minggu Ini
                  </span>
                  <span className="text-[10px] font-bold text-gray-400 font-mono">
                    {nextFeaturedMatch.type === 'fun_football' ? '⚽ Open Play Solo' : '⚔️ Sparring Tim'}
                  </span>
                </div>

                {/* Match Title & Venue */}
                <div className="space-y-1 mb-3.5">
                  <h3 className="text-lg font-black text-white leading-tight line-clamp-1 group-hover:text-emerald-300 transition-colors">
                    {nextFeaturedMatch.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="line-clamp-1">{featuredVenue?.name || 'Balikpapan Mini Soccer Arena'}</span>
                  </div>
                </div>

                {/* Match Info Grid */}
                <div className="grid grid-cols-2 gap-2 bg-black/25 p-3 rounded-xl border border-white/10 text-xs mb-3.5">
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-emerald-400" /> Tanggal
                    </div>
                    <div className="font-bold text-white font-mono text-[11px] truncate">
                      {nextFeaturedMatch.dateLabel || nextFeaturedMatch.date}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" /> Jam Main
                    </div>
                    <div className="font-bold text-white font-mono text-[11px] truncate">
                      {nextFeaturedMatch.timeSlot}
                    </div>
                  </div>
                </div>

                {/* Slot Progress Indicator */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 text-[11px]">Kapasitas Pemain:</span>
                    <span className="font-mono font-bold text-white text-[11px]">
                      <strong className="text-emerald-400">{featuredFilled}</strong> / {featuredTotal} ({featuredRemaining} Tersisa)
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
                      style={{ width: `${featuredProgress}%` }}
                    />
                  </div>
                </div>

                {/* Book Action Button */}
                <button
                  type="button"
                  onClick={() => setActiveBookingMatch(nextFeaturedMatch)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <span>Amankan Slot Sesi Ini</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-6 text-center text-gray-300">
                <Calendar className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-bold text-white">Jadwal Baru Segera Hadir</div>
                <div className="text-xs text-gray-400 mt-1">Pantau terus kalender matchday MATE CLUB.</div>
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
