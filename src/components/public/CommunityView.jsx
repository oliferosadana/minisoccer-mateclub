import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  Flame, 
  Award, 
  Camera, 
  Users, 
  Sparkles, 
  ExternalLink,
  Newspaper,
  Calendar,
  MapPin,
  Pin,
  ChevronRight,
  Shield,
  Eye,
  Megaphone,
  BookOpen,
  Info
} from 'lucide-react';

export const CommunityView = () => {
  const { 
    sponsors = [], 
    communityPosts = [], 
    standingsClubs = [], 
    topPerformers = [], 
    tournaments = [],
    communityMenuConfig = {
      showStandings: true,
      showTopPerformers: true,
      showArticles: true,
      showGallery: true,
      showSponsors: true
    }
  } = useApp();

  const [activeTab, setActiveTab] = useState('standings'); // 'standings' | 'articles' | 'gallery'
  const [selectedTournament, setSelectedTournament] = useState(tournaments[0]?.id || 'trn-1');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');

  // Filter Active Community Posts
  const activePosts = communityPosts.filter(p => p.status === 'active');

  // Filter Active Standings Clubs (sorted by points, GD, goals)
  const activeClubs = standingsClubs
    .filter(c => c.status === 'active' && (c.tournamentId === selectedTournament || !c.tournamentId))
    .sort((a, b) => {
      const ptsA = (Number(a.won || 0) * 3) + (Number(a.drawn || 0) * 1);
      const ptsB = (Number(b.won || 0) * 3) + (Number(b.drawn || 0) * 1);
      if (ptsB !== ptsA) return ptsB - ptsA;
      const gdA = Number(a.goalsFor || 0) - Number(a.goalsAgainst || 0);
      const gdB = Number(b.goalsFor || 0) - Number(b.goalsAgainst || 0);
      if (gdB !== gdA) return gdB - gdA;
      return Number(b.goalsFor || 0) - Number(a.goalsFor || 0);
    });

  // Filter Active Top Performers
  const activePerformers = topPerformers
    .filter(tp => tp.status === 'active' && (tp.tournamentId === selectedTournament || !tp.tournamentId))
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));

  // Categorized Posts
  const articlesList = activePosts.filter(p => p.type !== 'gallery');
  const galleryList = activePosts.filter(p => p.type === 'gallery');

  const filteredArticles = activeCategoryFilter === 'all' 
    ? articlesList 
    : articlesList.filter(a => a.category === activeCategoryFilter);

  const currentTournamentData = tournaments.find(t => t.id === selectedTournament) || tournaments[0] || {
    name: 'Balikpapan Mini Soccer Super League',
    season: 'Musim 2026/2027',
    venue: 'Balikpapan Soccer Field (BSF)'
  };

  // Build Dynamic Available Tabs based on communityMenuConfig
  const availableTabs = [];
  if (communityMenuConfig.showStandings || communityMenuConfig.showTopPerformers) {
    let tabLabel = 'Klasemen & Top Skor';
    if (communityMenuConfig.showStandings && !communityMenuConfig.showTopPerformers) tabLabel = 'Papan Klasemen';
    if (!communityMenuConfig.showStandings && communityMenuConfig.showTopPerformers) tabLabel = 'Top Skor & MVP';

    availableTabs.push({
      id: 'standings',
      label: tabLabel,
      icon: Trophy,
      badgeColor: 'text-amber-400'
    });
  }

  if (communityMenuConfig.showArticles) {
    availableTabs.push({
      id: 'articles',
      label: `Berita & Event (${articlesList.length})`,
      icon: Newspaper,
      badgeColor: 'text-blue-400'
    });
  }

  if (communityMenuConfig.showGallery) {
    availableTabs.push({
      id: 'gallery',
      label: `Galeri Foto HD (${galleryList.length})`,
      icon: Camera,
      badgeColor: 'text-emerald-400'
    });
  }

  // Fallback to first active tab if current tab is disabled
  const effectiveTab = availableTabs.some(t => t.id === activeTab)
    ? activeTab
    : (availableTabs[0]?.id || 'none');

  const isAllDisabled = availableTabs.length === 0 && !communityMenuConfig.showSponsors;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Hero Banner */}
      <div className="bg-palette-dark text-white p-6 sm:p-8 rounded-3xl border border-palette-primary/20 shadow-card text-center relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-palette-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-palette-primary/20 border border-palette-primary/30 text-palette-primary text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MATE CLUB BALIKPAPAN ECOSYSTEM</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
            Pusat Komunitas & Klasemen Liga
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Pantau statistik klasemen turnamen terkini, galeri dokumentasi foto HD matchday, berita tips & trik, serta promo resmi mitra sponsor.
          </p>

          {/* Navigation Pill Switcher (Render only enabled menu tabs) */}
          {availableTabs.length > 0 && (
            <div className="pt-3 flex flex-wrap items-center justify-center gap-2">
              {availableTabs.map(tab => {
                const Icon = tab.icon;
                const isSelected = effectiveTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'bg-palette-primary text-white shadow-lg scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-gray-200'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${tab.badgeColor}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* When all community modules are disabled by admin */}
      {isAllDisabled && (
        <div className="bg-white p-12 sm:p-16 rounded-3xl border border-palette-subtle shadow-card text-center max-w-2xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-palette-dark">
            Modul Komunitas Sedang Diperbarui
          </h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
            Menu klasemen, berita artikel, galeri foto, dan mitra sponsor sedang dalam pemeliharaan berkala oleh pengelola MATE CLUB.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: KLASEMEN LIGA & TOP PERFORMERS */}
      {/* ========================================================================= */}
      {effectiveTab === 'standings' && (
        <div className="space-y-6">
          {/* Tournament Header Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-palette-subtle shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-black">
                🏆
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-palette-dark">
                  {currentTournamentData.name}
                </h3>
                <div className="text-[11px] text-gray-500 font-semibold flex items-center gap-2 mt-0.5">
                  <span className="text-palette-primary">{currentTournamentData.season}</span>
                  <span>•</span>
                  <span>{currentTournamentData.venue || 'Balikpapan'}</span>
                </div>
              </div>
            </div>

            {tournaments.length > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">Pilih Liga:</span>
                <select
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className="text-xs font-bold p-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                >
                  {tournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.season})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={`grid gap-6 items-start ${
            communityMenuConfig.showStandings && communityMenuConfig.showTopPerformers
              ? 'grid-cols-1 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {/* Main Standings Table (Render only if showStandings is true) */}
            {communityMenuConfig.showStandings && (
              <div className={`${
                communityMenuConfig.showTopPerformers ? 'lg:col-span-2' : 'w-full'
              } bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-palette-dark flex items-center gap-2">
                    <Shield className="w-4 h-4 text-palette-primary" /> Tabel Peringkat Klub
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-palette-bg text-palette-dark border border-palette-subtle">
                    LIVE STANDINGS
                  </span>
                </div>

                {activeClubs.length === 0 ? (
                  <div className="text-center py-10 border-2 border-dashed border-palette-subtle rounded-2xl bg-palette-bg/40">
                    <Trophy className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold">Belum ada tim yang dipublikasikan pada liga ini.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-palette-subtle">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-palette-bg/90 border-b border-palette-subtle text-gray-500 font-bold uppercase text-[10px]">
                          <th className="py-2.5 px-3 text-center w-10">Pos</th>
                          <th className="py-2.5 px-3">Klub</th>
                          <th className="py-2.5 px-2 text-center" title="Main">MP</th>
                          <th className="py-2.5 px-2 text-center text-emerald-700" title="Menang">M</th>
                          <th className="py-2.5 px-2 text-center text-amber-700" title="Seri">S</th>
                          <th className="py-2.5 px-2 text-center text-red-700" title="Kalah">K</th>
                          <th className="py-2.5 px-2 text-center" title="Gol Masuk">GM</th>
                          <th className="py-2.5 px-2 text-center" title="Gol Kemasukan">GK</th>
                          <th className="py-2.5 px-2 text-center" title="Selisih Gol">GD</th>
                          <th className="py-2.5 px-3 text-center text-palette-primary font-black" title="Poin Total">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-palette-subtle">
                        {activeClubs.map((club, idx) => {
                          const played = Number(club.won || 0) + Number(club.drawn || 0) + Number(club.lost || 0);
                          const gd = Number(club.goalsFor || 0) - Number(club.goalsAgainst || 0);
                          const pts = (Number(club.won || 0) * 3) + (Number(club.drawn || 0) * 1);

                          return (
                            <tr 
                              key={club.id} 
                              className={`hover:bg-palette-bg/60 transition-colors ${
                                idx === 0 ? 'bg-amber-50/40 font-semibold' : ''
                              }`}
                            >
                              <td className="py-3 px-3 text-center font-mono font-black">
                                {idx === 0 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-400 text-amber-950 text-[11px] shadow-xs">
                                    1
                                  </span>
                                ) : idx === 1 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300 text-slate-900 text-[11px]">
                                    2
                                  </span>
                                ) : idx === 2 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-700 text-white text-[11px]">
                                    3
                                  </span>
                                ) : (
                                  <span className="text-gray-500">{idx + 1}</span>
                                )}
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={club.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80'}
                                    alt={club.name}
                                    className="w-7 h-7 rounded-full object-cover border border-palette-subtle shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-palette-dark text-xs">{club.name}</div>
                                    {idx === 0 && <span className="text-[9px] text-amber-700 font-extrabold uppercase">Pemuncak Klasemen</span>}
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-2 text-center font-mono font-bold text-gray-700">{played}</td>
                              <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700">{club.won || 0}</td>
                              <td className="py-3 px-2 text-center font-mono font-bold text-amber-700">{club.drawn || 0}</td>
                              <td className="py-3 px-2 text-center font-mono font-bold text-red-700">{club.lost || 0}</td>
                              <td className="py-3 px-2 text-center font-mono text-gray-600">{club.goalsFor || 0}</td>
                              <td className="py-3 px-2 text-center font-mono text-gray-600">{club.goalsAgainst || 0}</td>
                              <td className="py-3 px-2 text-center font-mono font-bold">
                                <span className={gd > 0 ? 'text-emerald-600 font-black' : gd < 0 ? 'text-red-600' : 'text-gray-400'}>
                                  {gd > 0 ? `+${gd}` : gd}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-mono font-black text-sm text-palette-primary bg-palette-bg/40">
                                {pts}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Top Performers Leaderboard (Render only if showTopPerformers is true) */}
            {communityMenuConfig.showTopPerformers && (
              <div className={`${
                !communityMenuConfig.showStandings ? 'w-full' : ''
              } bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm sm:text-base text-palette-dark flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-500" /> Top Performers & MVP
                  </h3>
                </div>

                {activePerformers.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    Belum ada statistik individu yang dipublikasikan.
                  </div>
                ) : (
                  <div className={`space-y-2.5 ${!communityMenuConfig.showStandings ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 space-y-0' : ''}`}>
                    {activePerformers.map((tp, idx) => (
                      <div
                        key={tp.id}
                        className="p-3 rounded-2xl bg-palette-bg border border-palette-subtle hover:border-palette-primary/30 transition-all flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-mono font-black text-xs text-palette-primary w-5 text-center">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </div>
                          <div>
                            <div className="font-bold text-xs text-palette-dark">{tp.name}</div>
                            <div className="text-[10px] text-gray-500 font-semibold">{tp.club}</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {tp.category === 'cleansheet' ? (
                            <div className="font-mono font-black text-xs text-indigo-700">
                              {tp.cleanSheet || 0} Clean Sheet
                            </div>
                          ) : tp.category === 'mvp' ? (
                            <div className="font-mono font-black text-xs text-amber-700">
                              {tp.mvpCount || 0}x MVP
                            </div>
                          ) : (
                            <div className="font-mono font-black text-xs text-emerald-700">
                              {tp.goals || 0} Gol
                            </div>
                          )}
                          <div className="text-[9px] text-gray-400 font-bold">
                            {tp.caps || 0} Caps • {tp.assists || 0} Assist
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ARTIKEL & PENGUMUMAN KOMUNITAS */}
      {/* ========================================================================= */}
      {effectiveTab === 'articles' && communityMenuConfig.showArticles && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap bg-white p-3 rounded-2xl border border-palette-subtle shadow-card">
            <span className="text-xs font-bold text-gray-500 pl-1">Filter Kategori:</span>
            {['all', 'Dokumentasi Match', 'Tips & Trik', 'Pengumuman Event'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategoryFilter === cat
                    ? 'bg-palette-primary text-white shadow-xs'
                    : 'bg-palette-bg hover:bg-palette-subtle text-gray-700'
                }`}
              >
                {cat === 'all' ? 'Semua Artikel' : cat}
              </button>
            ))}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-palette-subtle text-center text-gray-400">
              <Newspaper className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-bold text-sm text-palette-dark">Belum ada artikel pada kategori ini</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map(article => (
                <div
                  key={article.id}
                  className="bg-white rounded-3xl border border-palette-subtle shadow-card overflow-hidden flex flex-col justify-between group hover:border-palette-primary/40 transition-all"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative h-44 w-full overflow-hidden bg-palette-dark">
                      <img
                        src={article.coverImage || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80'}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-palette-primary text-white text-[10px] font-bold shadow-xs">
                          {article.category}
                        </span>
                        {article.isPinned && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 left-3 text-[11px] text-white/90 font-medium">
                        {article.dateLabel || article.date}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-2.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-palette-dark leading-snug group-hover:text-palette-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                        {article.summary || article.content}
                      </p>

                      {/* Tags */}
                      {article.tags && article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {article.tags.map((t, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-palette-bg text-gray-600 text-[10px] font-bold border border-palette-subtle">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-palette-bg/60 border-t border-palette-subtle flex items-center justify-between text-xs">
                    <div className="text-[11px] text-gray-500">
                      Oleh: <strong className="text-palette-dark">{article.author || 'MATE CLUB'}</strong>
                    </div>

                    {article.externalUrl ? (
                      <a
                        href={article.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-palette-primary font-bold text-xs hover:underline"
                      >
                        Selengkapnya <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-palette-primary font-bold text-xs inline-flex items-center gap-0.5">
                        Baca <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: GALERI FOTO MATCHDAY HD */}
      {/* ========================================================================= */}
      {effectiveTab === 'gallery' && communityMenuConfig.showGallery && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-palette-subtle shadow-card flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-palette-dark">Dokumentasi Matchday & Sparring HD</h3>
                <p className="text-xs text-gray-500">Akses album resolusi tinggi tanpa kompresi via Google Photos resmi.</p>
              </div>
            </div>
          </div>

          {galleryList.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-palette-subtle text-center text-gray-400">
              <Camera className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="font-bold text-sm text-palette-dark">Belum ada album galeri foto yang aktif</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryList.map(gal => (
                <div
                  key={gal.id}
                  className="bg-white rounded-3xl border border-palette-subtle shadow-card overflow-hidden flex flex-col justify-between group hover:border-palette-primary/40 transition-all"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-palette-dark">
                      <img
                        src={gal.coverImage || 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=600&q=80'}
                        alt={gal.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold">
                        📸 {gal.photosCount || 50}+ Foto HD
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-[11px] text-gray-300">{gal.dateLabel || gal.date}</div>
                        {gal.venue && (
                          <div className="text-xs font-semibold text-palette-primary flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {gal.venue}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-1.5">
                      <h4 className="font-extrabold text-sm text-palette-dark group-hover:text-palette-primary transition-colors">
                        {gal.title}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {gal.summary || gal.content}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-palette-bg/60 border-t border-palette-subtle">
                    <a
                      href={gal.externalUrl || 'https://photos.google.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-palette-primary text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-palette-primaryDark transition-all shadow-xs"
                    >
                      Buka Album Google Photos <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MITRA & SPONSOR RESMI (Render only if showSponsors is true) */}
      {/* ========================================================================= */}
      {communityMenuConfig.showSponsors && (() => {
        const activeSponsors = sponsors.filter(sp => sp.status === 'active');
        if (activeSponsors.length === 0) return null;

        return (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-palette-subtle shadow-card space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-palette-primary/10 text-palette-primary text-[10px] font-mono font-black uppercase tracking-widest mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" /> OFFICIAL PARTNERS & SPONSORS
              </div>
              <h3 className="text-lg sm:text-xl font-black text-palette-dark">
                Mitra Sponsor & Kolaborasi Eksklusif
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Gunakan kode voucher promo resmi member MATE CLUB untuk mendapatkan diskon dan benefit khusus di merchant partner.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {activeSponsors.map(sp => (
                <div
                  key={sp.id}
                  className="rounded-2xl border border-palette-subtle bg-palette-bg hover:bg-white hover:border-palette-primary/40 hover:shadow-card transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Header Image / Logo with Gradient */}
                    <div className="relative h-28 w-full overflow-hidden bg-palette-dark">
                      <img
                        src={sp.logo || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=300&q=80'}
                        alt={sp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-palette-primary text-white text-[10px] font-bold shadow-xs">
                          {sp.category || 'Official Partner'}
                        </span>
                      </div>

                      {sp.discountPercent > 0 && (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-black shadow-xs">
                          Hemat {sp.discountPercent}%
                        </div>
                      )}

                      <div className="absolute bottom-2 left-3 right-3 text-white text-[11px] font-bold truncate">
                        {sp.tier}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-4 space-y-2">
                      <div className="font-extrabold text-sm text-palette-dark group-hover:text-palette-primary transition-colors">
                        {sp.name}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                        {sp.offer}
                      </p>
                    </div>
                  </div>

                  {/* Promo Code & Action Bar */}
                  <div className="p-4 bg-white border-t border-palette-subtle space-y-2.5">
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-palette-bg border border-palette-subtle">
                      <div className="text-[10px] text-gray-500 font-bold uppercase pl-1">VOUCHER:</div>
                      <div className="font-mono font-black text-xs text-palette-primary bg-white px-2 py-0.5 rounded border border-palette-subtle shadow-2xs">
                        {sp.promoCode}
                      </div>
                    </div>

                    {sp.websiteUrl && (
                      <a
                        href={sp.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 rounded-xl bg-palette-bg hover:bg-palette-primary hover:text-white text-palette-dark font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-palette-subtle"
                      >
                        Kunjungi Merchant / Store <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
