import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { 
  UserCheck, 
  Camera, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  Phone, 
  ExternalLink 
} from 'lucide-react';

export const OfficialsSection = () => {
  const { 
    referees, 
    deleteReferee, 
    setActiveRefEdit,
    photographers, 
    deletePhotographer, 
    setActivePhotoEdit 
  } = useApp();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Wasit PSSI */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-palette-dark flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-palette-primary" /> Wasit Berlisensi PSSI
              </h3>
              <p className="text-[11px] text-gray-500">Perangkat pertandingan resmi bersertifikat</p>
            </div>
            <button
              onClick={() => setActiveRefEdit({ isNew: true })}
              className="py-1.5 px-3 bg-palette-primary text-white font-bold text-xs rounded-xl hover:bg-palette-primaryDark flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Wasit
            </button>
          </div>

          <div className="space-y-3">
            {referees.map(r => (
              <div key={r.id} className="p-3.5 rounded-2xl bg-palette-bg border border-palette-subtle flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-palette-dark flex items-center gap-1.5">
                    {r.name}
                    <span className="flex items-center text-amber-500 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-amber-500" /> {r.rating || 5.0}
                    </span>
                  </div>
                  <div className="text-[11px] text-palette-primary font-semibold">{r.license}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{r.phone} • Honor: {formatIDR(r.rate)}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveRefEdit(r)}
                    className="p-1.5 rounded-lg bg-white hover:bg-palette-subtle text-palette-dark border border-palette-subtle"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus wasit "${r.name}"?`)) deleteReferee(r.id);
                    }}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Fotografer Matchday */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-palette-dark flex items-center gap-2">
                <Camera className="w-4 h-4 text-palette-primary" /> Fotografer Matchday Pro
              </h3>
              <p className="text-[11px] text-gray-500">Dokumentasi aksi pemain resolusi tinggi</p>
            </div>
            <button
              onClick={() => setActivePhotoEdit({ isNew: true })}
              className="py-1.5 px-3 bg-palette-primary text-white font-bold text-xs rounded-xl hover:bg-palette-primaryDark flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Fotografer
            </button>
          </div>

          <div className="space-y-3">
            {photographers.map(p => (
              <div key={p.id} className="p-3.5 rounded-2xl bg-palette-bg border border-palette-subtle flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-palette-dark flex items-center gap-1.5">
                    {p.name}
                    <span className="flex items-center text-amber-500 text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-amber-500" /> {p.rating || 5.0}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">{p.category}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{p.phone} • Honor: {formatIDR(p.rate)}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActivePhotoEdit(p)}
                    className="p-1.5 rounded-lg bg-white hover:bg-palette-subtle text-palette-dark border border-palette-subtle"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus fotografer "${p.name}"?`)) deletePhotographer(p.id);
                    }}
                    className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
