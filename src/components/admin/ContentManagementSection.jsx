import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Newspaper, 
  Trophy, 
  Award, 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  Camera, 
  Pin, 
  ExternalLink,
  Flame,
  Shield,
  Layers,
  Sparkles,
  Users,
  Handshake,
  Tag,
  Phone,
  Calendar
} from 'lucide-react';

export const ContentManagementSection = () => {
  const {
    communityPosts = [],
    toggleCommunityPostStatus,
    deleteCommunityPost,
    setActiveCommunityEdit,
    standingsClubs = [],
    toggleStandingClubStatus,
    deleteStandingClub,
    setActiveClubEdit,
    topPerformers = [],
    toggleTopPerformerStatus,
    deleteTopPerformer,
    setActivePerformerEdit,
    sponsors = [],
    toggleSponsorStatus,
    deleteSponsor,
    setActiveSponsorEdit,
    tournaments = [],
    communityMenuConfig = {
      showStandings: true,
      showTopPerformers: true,
      showArticles: true,
      showGallery: true,
      showSponsors: true
    },
    toggleCommunityMenu,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState('community'); // 'community' | 'standings' | 'performers' | 'sponsors'
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [selectedTournament, setSelectedTournament] = useState('trn-1');
  const [showConfigPanel, setShowConfigPanel] = useState(true);

  // Filtered Community Posts
  const filteredPosts = communityPosts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.author && p.author.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.venue && p.venue.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Filtered Standings Clubs
  const filteredClubs = standingsClubs
    .filter(c => c.tournamentId === selectedTournament || !c.tournamentId)
    .filter(c => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search.trim()) {
        return c.name.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));

  // Filtered Top Performers
  const filteredPerformers = topPerformers
    .filter(tp => tp.tournamentId === selectedTournament || !tp.tournamentId)
    .filter(tp => {
      if (statusFilter !== 'all' && tp.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return tp.name.toLowerCase().includes(q) || tp.club.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));

  // Filtered Sponsors
  const filteredSponsors = sponsors.filter(sp => {
    if (statusFilter !== 'all' && sp.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && sp.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        sp.name.toLowerCase().includes(q) ||
        (sp.tier && sp.tier.toLowerCase().includes(q)) ||
        (sp.promoCode && sp.promoCode.toLowerCase().includes(q)) ||
        (sp.offer && sp.offer.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const menuToggleItems = [
    { key: 'showStandings', label: 'Tabel Klasemen Liga', icon: Trophy, active: communityMenuConfig.showStandings, desc: 'Peringkat klub di halaman publik' },
    { key: 'showTopPerformers', label: 'Top Skor & MVP', icon: Award, active: communityMenuConfig.showTopPerformers, desc: 'Leaderboard individu pemain' },
    { key: 'showArticles', label: 'Berita & Artikel', icon: Newspaper, active: communityMenuConfig.showArticles, desc: 'Tips, pengumuman & berita' },
    { key: 'showGallery', label: 'Galeri Foto HD', icon: Camera, active: communityMenuConfig.showGallery, desc: 'Album matchday Google Photos' },
    { key: 'showSponsors', label: 'Mitra Sponsor', icon: Handshake, active: communityMenuConfig.showSponsors, desc: 'Voucher & promo partner resmi' }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-palette-dark text-white p-6 sm:p-7 rounded-3xl border border-palette-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-palette-primary/20 text-palette-primary font-mono text-[11px] font-bold border border-palette-primary/30 uppercase tracking-wider">
              CONTENT MANAGEMENT SYSTEM (CMS)
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-300 text-xs font-semibold">Komunitas, Klasemen & Mitra Sponsor</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Pusat Manajemen Konten & Kemitraan
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Kelola artikel berita, album galeri Google Photos, papan klasemen liga, leaderboard Top Skor & MVP, serta visibilitas modul publik.
          </p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'community' && (
            <button
              onClick={() => setActiveCommunityEdit({ isNew: true })}
              className="px-4 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Konten Komunitas
            </button>
          )}
          {activeTab === 'standings' && (
            <button
              onClick={() => setActiveClubEdit({ isNew: true })}
              className="px-4 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Tim Klasemen
            </button>
          )}
          {activeTab === 'performers' && (
            <button
              onClick={() => setActivePerformerEdit({ isNew: true })}
              className="px-4 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Top Performer
            </button>
          )}
          {activeTab === 'sponsors' && (
            <button
              onClick={() => setActiveSponsorEdit({ isNew: true })}
              className="px-4 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Tambah Mitra Sponsor
            </button>
          )}
        </div>
      </div>

      {/* Visibilitas & Fleksibilitas Menu Publik Controller */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-palette-subtle shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-palette-primary/10 text-palette-primary">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-palette-dark">
                Opsi Visibilitas Menu & Modul Publik (Fleksibel)
              </h3>
              <p className="text-[11px] text-gray-500">
                Aktifkan atau nonaktifkan menu secara instan tanpa menghapus data master.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="text-[11px] font-bold text-palette-primary hover:underline"
          >
            {showConfigPanel ? 'Sembunyikan Panel' : 'Tampilkan Panel'}
          </button>
        </div>

        {showConfigPanel && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
            {menuToggleItems.map(item => {
              const Icon = item.icon;
              const isEnabled = item.active;

              return (
                <div
                  key={item.key}
                  className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-2.5 ${
                    isEnabled
                      ? 'bg-palette-bg border-palette-primary/30 shadow-2xs'
                      : 'bg-gray-50/80 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        isEnabled ? 'bg-palette-primary text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-extrabold text-xs text-palette-dark leading-tight">
                        {item.label}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-500 line-clamp-1">
                    {item.desc}
                  </p>

                  <div className="pt-1.5 border-t border-palette-subtle flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-black ${
                      isEnabled ? 'text-emerald-700' : 'text-gray-400'
                    }`}>
                      {isEnabled ? 'Tampil' : 'Sembunyi'}
                    </span>

                    <button
                      onClick={() => toggleCommunityMenu(item.key)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${
                        isEnabled
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {isEnabled ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                      <span>{isEnabled ? 'Aktif' : 'Off'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Tab Controller */}
      <div className="bg-white p-2 rounded-2xl border border-palette-subtle shadow-card flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setActiveTab('community'); setSearch(''); setCategoryFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'community'
                ? 'bg-palette-primary text-white shadow-xs'
                : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Berita & Galeri ({communityPosts.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('standings'); setSearch(''); setCategoryFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'standings'
                ? 'bg-palette-primary text-white shadow-xs'
                : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Klasemen Klub ({standingsClubs.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('performers'); setSearch(''); setCategoryFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'performers'
                ? 'bg-palette-primary text-white shadow-xs'
                : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Top Skor & MVP ({topPerformers.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('sponsors'); setSearch(''); setCategoryFilter('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sponsors'
                ? 'bg-palette-primary text-white shadow-xs'
                : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>Mitra Sponsor ({sponsors.length})</span>
          </button>
        </div>

        {/* Global Status Filter */}
        <div className="flex items-center gap-1 bg-palette-bg p-1 rounded-xl border border-palette-subtle text-[11px] font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white text-palette-primary shadow-xs font-black' : 'text-gray-500'}`}
          >
            Semua Status
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-2.5 py-1 rounded-lg transition-all ${statusFilter === 'active' ? 'bg-white text-emerald-700 shadow-xs font-black' : 'text-gray-500'}`}
          >
            Aktif
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-2.5 py-1 rounded-lg transition-all ${statusFilter === 'inactive' ? 'bg-white text-gray-700 shadow-xs font-black' : 'text-gray-500'}`}
          >
            Non-Aktif
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MANAJEMEN KONTEN KOMUNITAS */}
      {/* ========================================================================= */}
      {activeTab === 'community' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500">Kategori:</span>
              {['all', 'Dokumentasi Match', 'Tips & Trik', 'Pengumuman Event'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    categoryFilter === cat
                      ? 'bg-palette-primary/10 text-palette-primary border-palette-primary/30 font-black'
                      : 'bg-palette-bg text-gray-600 border-palette-subtle hover:bg-gray-100'
                  }`}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari judul, kategori, penulis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Community Posts Grid / Cards */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-palette-subtle rounded-2xl bg-palette-bg/40">
              <Newspaper className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-palette-dark">Tidak ada konten komunitas yang sesuai</h4>
              <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci pencarian atau tambah konten artikel/galeri baru.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map(post => {
                const isActive = post.status === 'active';

                return (
                  <div
                    key={post.id}
                    className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden bg-white shadow-2xs ${
                      isActive ? 'border-palette-subtle hover:border-palette-primary/40' : 'border-gray-200 opacity-60 bg-gray-50'
                    }`}
                  >
                    <div>
                      {/* Image Thumbnail Header */}
                      <div className="relative h-40 w-full overflow-hidden bg-palette-dark">
                        <img
                          src={post.coverImage || 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80'}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white font-mono text-[10px] font-bold">
                            {post.type === 'gallery' ? '📸 Galeri Foto' : post.type === 'announcement' ? '📢 Pengumuman' : '📰 Artikel'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-palette-primary text-white text-[10px] font-bold shadow-xs">
                            {post.category}
                          </span>
                          {post.isPinned && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5" /> Pinned
                            </span>
                          )}
                        </div>

                        {/* Active/Inactive Switch in Banner */}
                        <div className="absolute top-2.5 right-2.5">
                          <button
                            onClick={() => toggleCommunityPostStatus(post.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 transition-all ${
                              isActive 
                                ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600' 
                                : 'bg-red-500/80 text-white hover:bg-red-600'
                            }`}
                            title={isActive ? 'Klik untuk non-aktifkan konten' : 'Klik untuk aktifkan konten'}
                          >
                            {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{isActive ? 'Aktif (Publik)' : 'Non-Aktif'}</span>
                          </button>
                        </div>

                        {/* Date & Location inside Banner */}
                        <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] flex items-center justify-between">
                          <span>{post.dateLabel || post.date}</span>
                          {post.photosCount > 0 && (
                            <span className="font-bold text-amber-300">📸 {post.photosCount} Foto HD</span>
                          )}
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-extrabold text-sm text-palette-dark leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                          {post.summary || post.content}
                        </p>

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {post.tags.map((t, idx) => (
                              <span key={idx} className="px-2 py-0.2 rounded bg-palette-bg text-palette-dark text-[10px] font-bold border border-palette-subtle">
                                #{t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-3 bg-palette-bg/70 border-t border-palette-subtle flex items-center justify-between text-xs">
                      <div className="text-[11px] text-gray-500 truncate max-w-[180px]">
                        Oleh: <strong>{post.author || 'MATE CLUB'}</strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {post.externalUrl && (
                          <a
                            href={post.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-palette-primary hover:bg-white rounded-lg transition-all border border-transparent hover:border-palette-subtle"
                            title="Buka Link Eksternal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setActiveCommunityEdit(post)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-palette-primary hover:text-white text-palette-primary font-bold text-[11px] border border-palette-subtle transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Hapus konten "${post.title}"?`)) deleteCommunityPost(post.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                          title="Hapus Konten"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAJEMEN PAPAN KLASEMEN KLUB */}
      {/* ========================================================================= */}
      {activeTab === 'standings' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          {/* Tournament Selector & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Pilih Turnamen:</span>
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

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama klub di klasemen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Standings Table */}
          <div className="overflow-x-auto rounded-2xl border border-palette-subtle">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-palette-bg/90 border-b border-palette-subtle text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3 text-center w-12">Pos</th>
                  <th className="py-2.5 px-3">Klub / Komunitas</th>
                  <th className="py-2.5 px-3 text-center">Main (MP)</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">M</th>
                  <th className="py-2.5 px-3 text-center text-amber-700">S</th>
                  <th className="py-2.5 px-3 text-center text-red-700">K</th>
                  <th className="py-2.5 px-3 text-center">GM</th>
                  <th className="py-2.5 px-3 text-center">GK</th>
                  <th className="py-2.5 px-3 text-center">Selisih (GD)</th>
                  <th className="py-2.5 px-3 text-center text-palette-primary">Poin (Pts)</th>
                  <th className="py-2.5 px-3 text-center">Status Tampil</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-palette-subtle">
                {filteredClubs.length === 0 ? (
                  <tr>
                    <td colSpan="12" className="text-center py-8 text-gray-400">
                      Belum ada data klub pada klasemen turnamen ini.
                    </td>
                  </tr>
                ) : (
                  filteredClubs.map((club, idx) => {
                    const isActive = club.status === 'active';
                    const played = Number(club.won || 0) + Number(club.drawn || 0) + Number(club.lost || 0);
                    const gd = Number(club.goalsFor || 0) - Number(club.goalsAgainst || 0);
                    const pts = (Number(club.won || 0) * 3) + (Number(club.drawn || 0) * 1);

                    return (
                      <tr key={club.id} className={`hover:bg-palette-bg/50 transition-colors ${!isActive ? 'opacity-50 bg-gray-50' : ''}`}>
                        <td className="py-3 px-3 text-center font-mono font-black text-palette-dark">
                          {idx + 1 === 1 ? '🥇 1' : idx + 1 === 2 ? '🥈 2' : idx + 1 === 3 ? '🥉 3' : `#${idx + 1}`}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={club.logo || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80'}
                              alt={club.name}
                              className="w-7 h-7 rounded-full object-cover border border-palette-subtle shrink-0"
                            />
                            <div className="font-extrabold text-palette-dark text-xs">{club.name}</div>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-center font-mono font-bold">{played}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">{club.won || 0}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">{club.drawn || 0}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-red-700">{club.lost || 0}</td>
                        <td className="py-3 px-3 text-center font-mono">{club.goalsFor || 0}</td>
                        <td className="py-3 px-3 text-center font-mono">{club.goalsAgainst || 0}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          <span className={gd > 0 ? 'text-emerald-600' : gd < 0 ? 'text-red-600' : 'text-gray-500'}>
                            {gd > 0 ? `+${gd}` : gd}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-sm text-palette-primary">
                          {pts}
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleStandingClubStatus(club.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 transition-all ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-gray-500'}`}></span>
                            <span>{isActive ? 'Aktif' : 'Non-Aktif'}</span>
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveClubEdit(club)}
                              className="p-1.5 rounded-lg bg-palette-bg hover:bg-palette-primary hover:text-white text-palette-dark border border-palette-subtle transition-all"
                              title="Edit Statistik Tim"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus tim "${club.name}" dari klasemen?`)) deleteStandingClub(club.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                              title="Hapus Tim"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MANAJEMEN TOP SKOR & MVP PEMAIN */}
      {/* ========================================================================= */}
      {activeTab === 'performers' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500">Pilih Turnamen:</span>
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

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama pemain / klub..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Performers Table */}
          <div className="overflow-x-auto rounded-2xl border border-palette-subtle">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-palette-bg/90 border-b border-palette-subtle text-gray-500 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3 text-center w-12">Rank</th>
                  <th className="py-2.5 px-3">Nama Pemain & Klub</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-center">Caps (Laga)</th>
                  <th className="py-2.5 px-3 text-center text-emerald-700">Gol</th>
                  <th className="py-2.5 px-3 text-center text-blue-700">Assist</th>
                  <th className="py-2.5 px-3 text-center text-indigo-700">Clean Sheet</th>
                  <th className="py-2.5 px-3 text-center text-amber-700">MVP Count</th>
                  <th className="py-2.5 px-3 text-center">Status Tampil</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-palette-subtle">
                {filteredPerformers.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-400">
                      Belum ada data top performer pada turnamen ini.
                    </td>
                  </tr>
                ) : (
                  filteredPerformers.map((tp, idx) => {
                    const isActive = tp.status === 'active';

                    return (
                      <tr key={tp.id} className={`hover:bg-palette-bg/50 transition-colors ${!isActive ? 'opacity-50 bg-gray-50' : ''}`}>
                        <td className="py-3 px-3 text-center font-mono font-black text-palette-dark">
                          {idx + 1 === 1 ? '🥇 1' : idx + 1 === 2 ? '🥈 2' : idx + 1 === 3 ? '🥉 3' : `#${idx + 1}`}
                        </td>

                        <td className="py-3 px-3">
                          <div className="font-extrabold text-palette-dark text-xs">{tp.name}</div>
                          <div className="text-[10px] text-gray-500">{tp.club}</div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tp.category === 'cleansheet'
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : tp.category === 'mvp'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {tp.category === 'cleansheet' ? '🧤 Top Kiper' : tp.category === 'mvp' ? '⭐ Top MVP' : '⚽ Top Skor'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-center font-mono">{tp.caps || 0}</td>
                        <td className="py-3 px-3 text-center font-mono font-black text-emerald-700">{tp.goals || 0}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-blue-700">{tp.assists || 0}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-indigo-700">{tp.cleanSheet || 0}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-700">{tp.mvpCount || 0}x</td>

                        {/* Status Toggle Switch */}
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => toggleTopPerformerStatus(tp.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 transition-all ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-600' : 'bg-gray-500'}`}></span>
                            <span>{isActive ? 'Aktif' : 'Non-Aktif'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActivePerformerEdit(tp)}
                              className="p-1.5 rounded-lg bg-palette-bg hover:bg-palette-primary hover:text-white text-palette-dark border border-palette-subtle transition-all"
                              title="Edit Data Pemain"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus top performer "${tp.name}"?`)) deleteTopPerformer(tp.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                              title="Hapus Pemain"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MANAJEMEN MITRA SPONSOR & KOLABORASI */}
      {/* ========================================================================= */}
      {activeTab === 'sponsors' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-gray-500">Filter Kategori:</span>
              {['all', 'Apparel & Equipment', 'Food & Beverage', 'Health & Recovery', 'Venue & Facilities'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    categoryFilter === cat
                      ? 'bg-palette-primary/10 text-palette-primary border-palette-primary/30 font-black'
                      : 'bg-palette-bg text-gray-600 border-palette-subtle hover:bg-gray-100'
                  }`}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama mitra, voucher, tier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Sponsor Cards Grid */}
          {filteredSponsors.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-palette-subtle rounded-2xl bg-palette-bg/40">
              <Handshake className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-palette-dark">Tidak ada data mitra sponsor</h4>
              <p className="text-xs text-gray-500 mt-1">Tambahkan sponsor baru untuk menampilkan promo voucher eksklusif.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSponsors.map(sp => {
                const isActive = sp.status === 'active';

                return (
                  <div
                    key={sp.id}
                    className={`rounded-2xl border transition-all flex flex-col justify-between overflow-hidden bg-white shadow-2xs ${
                      isActive ? 'border-palette-subtle hover:border-palette-primary/40' : 'border-gray-200 opacity-60 bg-gray-50'
                    }`}
                  >
                    <div>
                      {/* Banner / Logo Header */}
                      <div className="relative h-32 w-full overflow-hidden bg-palette-dark">
                        <img
                          src={sp.logo || 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=300&q=80'}
                          alt={sp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-palette-primary text-white text-[10px] font-bold shadow-xs">
                            {sp.category || 'Official Partner'}
                          </span>
                          {sp.isFeatured && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" /> Mitra Utama
                            </span>
                          )}
                        </div>

                        {/* Status Switch */}
                        <div className="absolute top-2.5 right-2.5">
                          <button
                            onClick={() => toggleSponsorStatus(sp.id)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 transition-all ${
                              isActive 
                                ? 'bg-emerald-500 text-white shadow-md hover:bg-emerald-600' 
                                : 'bg-red-500/80 text-white hover:bg-red-600'
                            }`}
                            title={isActive ? 'Klik untuk non-aktifkan sponsor' : 'Klik untuk aktifkan sponsor'}
                          >
                            {isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            <span>{isActive ? 'Aktif' : 'Non-Aktif'}</span>
                          </button>
                        </div>

                        <div className="absolute bottom-2.5 left-3 right-3 text-white text-[11px] truncate font-bold">
                          {sp.tier || 'Mitra Resmi'}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 space-y-2.5">
                        <div>
                          <h3 className="font-extrabold text-sm text-palette-dark leading-snug">
                            {sp.name}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
                            {sp.offer}
                          </p>
                        </div>

                        {/* Promo Code & Discount Tag */}
                        <div className="p-2.5 rounded-xl bg-palette-bg border border-palette-subtle flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-palette-primary" />
                            <span className="text-[10px] text-gray-500 font-semibold">Promo Code:</span>
                            <span className="font-mono font-black text-xs text-palette-dark">
                              {sp.promoCode}
                            </span>
                          </div>
                          {sp.discountPercent > 0 && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              Diskon {sp.discountPercent}%
                            </span>
                          )}
                        </div>

                        {/* Contact & Date */}
                        <div className="space-y-1 text-[11px] text-gray-500 pt-1">
                          {sp.validUntil && (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>Berlaku s/d: <strong className="text-palette-dark">{sp.validUntil}</strong></span>
                            </div>
                          )}
                          {sp.contactPhone && (
                            <div className="flex items-center gap-1.5 font-mono">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{sp.contactPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-3 bg-palette-bg/70 border-t border-palette-subtle flex items-center justify-between text-xs">
                      {sp.websiteUrl ? (
                        <a
                          href={sp.websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-palette-primary font-bold text-[11px] hover:underline"
                        >
                          Buka Link <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-[11px]">Mitra Resmi MATE</span>
                      )}

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setActiveSponsorEdit(sp)}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-palette-primary hover:text-white text-palette-primary font-bold text-[11px] border border-palette-subtle transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Hapus mitra sponsor "${sp.name}"?`)) deleteSponsor(sp.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                          title="Hapus Mitra"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
