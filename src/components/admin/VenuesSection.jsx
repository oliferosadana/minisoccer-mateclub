import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { MapPin, Plus, Search, Edit3, Trash2, CalendarPlus, Image as ImageIcon, ExternalLink, Check } from 'lucide-react';

export const VenuesSection = () => {
  const { venues, deleteVenue, setActiveFieldEdit, setActiveMatchEdit } = useApp();
  const [search, setSearch] = useState('');

  const filtered = venues.filter(v => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return v.name.toLowerCase().includes(q) || v.location.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-palette-dark flex items-center gap-2">
            <MapPin className="w-5 h-5 text-palette-primary" /> Master Data Venue & Lapangan Rekanan
          </h2>
          <p className="text-xs text-gray-500">Pengaturan foto lapangan, tarif sewa per jam, tarif slot pemain & kiper, serta spesifikasi fasilitas lapangan.</p>
        </div>

        <button
          onClick={() => setActiveFieldEdit({ isNew: true })}
          className="py-2.5 px-4 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Tambah Lapangan Baru
        </button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Cari nama lapangan, lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="rounded-2xl border border-palette-subtle bg-white shadow-2xs overflow-hidden flex flex-col justify-between group">
            <div>
              {/* Image Banner Header */}
              <div className="relative h-36 w-full overflow-hidden bg-palette-dark">
                <img
                  src={v.image || 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80'}
                  alt={v.name}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                    ✓ {v.status || 'Aktif'}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h4 className="font-extrabold text-sm text-white">{v.name}</h4>
                  <div className="text-[11px] text-gray-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-palette-primary" /> {v.location}
                  </div>
                </div>
              </div>

              {/* Rates Grid */}
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-palette-bg border border-palette-subtle text-center text-xs">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Sewa/Jam</div>
                    <div className="font-mono font-bold text-palette-dark">{formatIDR(v.ratePerHour)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Slot Pemain</div>
                    <div className="font-mono font-bold text-palette-primary">{formatIDR(v.playerSlotFee)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Slot Kiper</div>
                    <div className="font-mono font-bold text-emerald-700">{formatIDR(v.keeperSlotFee)}</div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                  {v.specs}
                </p>

                {/* Facilities Badges */}
                {v.facilities && v.facilities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {v.facilities.slice(0, 3).map((fac, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-palette-bg text-gray-600 text-[10px] font-semibold border border-palette-subtle">
                        {fac}
                      </span>
                    ))}
                    {v.facilities.length > 3 && (
                      <span className="px-2 py-0.5 rounded-md bg-palette-bg text-palette-primary text-[10px] font-bold border border-palette-subtle">
                        +{v.facilities.length - 3} lagi
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="p-3 bg-palette-bg/70 border-t border-palette-subtle flex items-center justify-between">
              <button
                onClick={() => setActiveMatchEdit({ isNew: true, defaultFieldId: v.id })}
                className="py-1.5 px-3 bg-palette-primary text-white font-bold text-[11px] rounded-lg hover:bg-palette-primaryDark flex items-center gap-1 shadow-xs transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> Buat Game
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveFieldEdit(v)}
                  className="p-1.5 rounded-lg bg-white hover:bg-palette-primary hover:text-white text-palette-dark border border-palette-subtle transition-colors flex items-center gap-1 text-[11px] font-bold"
                  title="Edit Data Lapangan & Foto"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Hapus lapangan "${v.name}"?`)) deleteVenue(v.id);
                  }}
                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                  title="Hapus Lapangan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
