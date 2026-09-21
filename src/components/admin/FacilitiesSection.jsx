import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ListChecks, 
  Plus, 
  Search, 
  Power, 
  Edit3, 
  Trash2, 
  Check, 
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';

export const FacilitiesSection = () => {
  const { facilities, toggleFacilityStatus, deleteFacility, setActiveFacilityEdit } = useApp();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'match' | 'venue' | 'active'

  const filtered = facilities.filter(f => {
    if (categoryFilter === 'match' && f.category !== 'match') return false;
    if (categoryFilter === 'venue' && f.category !== 'venue') return false;
    if (categoryFilter === 'active' && f.status !== 'active') return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.name.toLowerCase().includes(q) ||
        (f.description || '').toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-5">
      {/* Header & New Facility Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-palette-dark flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-palette-primary" /> Master Fasilitas & Layanan Pertandingan
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-palette-bg text-palette-primary border border-palette-subtle">
              {facilities.length} Fasilitas
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Konfigurasi fasilitas matchday dan sarana prasarana venue lapangan mini soccer.</p>
        </div>

        <button
          onClick={() => setActiveFacilityEdit({ isNew: true })}
          className="py-2.5 px-4 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Fasilitas Baru
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Cari fasilitas, kategori, deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-palette-bg p-1 rounded-xl border border-palette-subtle text-xs font-bold w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-all ${categoryFilter === 'all' ? 'bg-white text-palette-primary shadow-xs' : 'text-gray-500'}`}
          >
            Semua
          </button>
          <button
            onClick={() => setCategoryFilter('match')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-all ${categoryFilter === 'match' ? 'bg-white text-palette-primary shadow-xs' : 'text-gray-500'}`}
          >
            Matchday Game
          </button>
          <button
            onClick={() => setCategoryFilter('venue')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-all ${categoryFilter === 'venue' ? 'bg-white text-palette-primary shadow-xs' : 'text-gray-500'}`}
          >
            Venue Lapangan
          </button>
          <button
            onClick={() => setCategoryFilter('active')}
            className={`px-3 py-1.5 rounded-lg shrink-0 transition-all ${categoryFilter === 'active' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-500'}`}
          >
            Hanya Aktif
          </button>
        </div>
      </div>

      {/* Facility Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(fac => {
          const isActive = fac.status === 'active';
          const isMatch = fac.category === 'match';

          return (
            <div
              key={fac.id}
              className="p-4 rounded-2xl bg-white border border-palette-subtle shadow-xs hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border"
                      style={{
                        backgroundColor: `${fac.badgeColor || '#3f72af'}15`,
                        color: fac.badgeColor || '#3f72af',
                        borderColor: `${fac.badgeColor || '#3f72af'}30`
                      }}
                    >
                      {isMatch ? '⚽' : '🏟️'}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-palette-dark leading-tight">{fac.name}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          isMatch ? 'bg-blue-50 text-palette-primary' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {isMatch ? 'Matchday' : 'Venue'}
                        </span>
                        {fac.isDefaultMatch && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-orange-100 text-orange-800">
                            ★ Default Game
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isActive ? 'Aktif' : 'Off'}
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 line-clamp-2 my-2 min-h-[32px] leading-relaxed">
                  {fac.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-palette-subtle flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleFacilityStatus(fac.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-palette-bg hover:bg-palette-subtle text-palette-dark border border-palette-subtle'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  <Power className={`w-3 h-3 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {isActive ? 'Nonaktifkan' : 'Aktifkan'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveFacilityEdit(fac)}
                    className="p-1.5 rounded-lg bg-palette-bg hover:bg-palette-subtle text-palette-dark border border-palette-subtle"
                    title="Edit Fasilitas"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus fasilitas "${fac.name}"?`)) deleteFacility(fac.id);
                    }}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
