import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Handshake, 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  Tag, 
  Percent, 
  ExternalLink, 
  Phone, 
  Calendar, 
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export const SponsorsSection = () => {
  const { 
    sponsors = [], 
    toggleSponsorStatus, 
    deleteSponsor, 
    setActiveSponsorEdit 
  } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  const activeCount = sponsors.filter(s => s.status === 'active').length;
  const inactiveCount = sponsors.filter(s => s.status === 'inactive').length;

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-palette-dark text-white p-6 sm:p-7 rounded-3xl border border-palette-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-palette-primary/20 text-palette-primary font-mono text-[11px] font-bold border border-palette-primary/30 uppercase tracking-wider">
              PARTNERSHIP & SPONSORSHIP CMS
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-300 text-xs font-semibold">Mitra & Kolaborasi Resmi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
            <Handshake className="w-6 h-6 text-palette-primary" />
            Manajemen Mitra Sponsor & Kolaborasi
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Kelola data brand partner resmi apparel, hidrasi, fisioterapi, kupon diskon member MATE CLUB, dan status tampil di website.
          </p>
        </div>

        {/* Add Sponsor Button */}
        <div>
          <button
            onClick={() => setActiveSponsorEdit({ isNew: true })}
            className="px-4 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Tambah Mitra Sponsor Baru
          </button>
        </div>
      </div>

      {/* Stats Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-palette-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-500 font-bold uppercase">Total Mitra Sponsor</div>
            <div className="text-xl font-black text-palette-dark mt-0.5">{sponsors.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-palette-bg text-palette-dark flex items-center justify-center font-bold">
            🤝
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-palette-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-700 font-bold uppercase">Mitra Aktif (Live)</div>
            <div className="text-xl font-black text-emerald-700 mt-0.5">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-palette-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-[11px] text-gray-500 font-bold uppercase">Mitra Non-Aktif</div>
            <div className="text-xl font-black text-gray-700 mt-0.5">{inactiveCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold">
            <EyeOff className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
        {/* Filters & Search Toolbar */}
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

          <div className="flex items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-palette-bg p-1 rounded-xl border border-palette-subtle text-[11px] font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white text-palette-primary shadow-xs font-black' : 'text-gray-500'}`}
              >
                Semua
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

            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama, promo, tier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Sponsor Grid Cards */}
        {filteredSponsors.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-palette-subtle rounded-2xl bg-palette-bg/40">
            <Handshake className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h4 className="font-bold text-sm text-palette-dark">Tidak ada data mitra sponsor yang sesuai</h4>
            <p className="text-xs text-gray-500 mt-1">Coba sesuaikan kata kunci filter atau tambahkan mitra sponsor baru.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
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
                    {/* Card Header with Logo Image */}
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

                      {/* Active/Inactive Switch in Banner */}
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

                    {/* Body Details */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="font-extrabold text-sm text-palette-dark leading-snug">
                          {sp.name}
                        </h3>
                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mt-1">
                          {sp.offer}
                        </p>
                      </div>

                      {/* Promo Code & Discount Badge */}
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

                      {/* Contact & Validity Info */}
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
                        Buka Link Mitra <ExternalLink className="w-3 h-3" />
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
    </div>
  );
};
