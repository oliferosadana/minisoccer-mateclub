import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MatchCard } from './MatchCard';
import { Calendar, Search, MapPin, Sparkles, Filter } from 'lucide-react';

export const ScheduleView = () => {
  const { matches, venues } = useApp();

  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'fun_football' | 'sparring' | 'trofeo'
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-6">
      {/* Hero Header Section - Anti-Slop: Clean, Architectural, Concrete Evidence */}
      <div className="bg-palette-dark text-white rounded-2xl p-6 sm:p-8 border border-palette-primary/20 shadow-sm">
        <div className="max-w-3xl">
          <div className="text-xs font-mono uppercase tracking-widest text-palette-subtle mb-2 font-semibold">
            Sistem Manajemen & Reservasi Matchday
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
            Jadwal Lapangan, Wasit Resmi, & Lawan Sparring Selevel
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6">
            Pilih sesi open play individu atau daftarkan tim sparring Anda. Semua pertandingan terintegrasi dengan wasit berlisensi, dokumentasi fotografer matchday, dan pencatatan statistik pemain.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-palette-darker">
            <div className="bg-palette-darker/70 p-3 rounded-xl border border-gray-700/50">
              <div className="text-palette-subtle text-[11px] font-medium">Format Pertandingan</div>
              <div className="text-sm font-bold text-white mt-0.5">7 vs 7 & Trofeo 3 Tim</div>
            </div>
            <div className="bg-palette-darker/70 p-3 rounded-xl border border-gray-700/50">
              <div className="text-palette-subtle text-[11px] font-medium">Fasilitas Matchday</div>
              <div className="text-sm font-bold text-white mt-0.5">wasit profesional & Rompi Bersih</div>
            </div>
            <div className="bg-palette-darker/70 p-3 rounded-xl border border-gray-700/50">
              <div className="text-palette-subtle text-[11px] font-medium">Transparansi Biaya</div>
              <div className="text-sm font-bold text-white mt-0.5">Mulai Rp 30.000 / Sesi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-palette-subtle shadow-card space-y-3">
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
