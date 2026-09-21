import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { 
  CalendarDays, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Trophy, 
  Users, 
  MapPin, 
  CheckCircle2,
  Clock,
  UserCheck,
  AlertTriangle,
  X
} from 'lucide-react';

export const MatchesSection = () => {
  const { 
    matches, 
    deleteMatch, 
    setActiveMatchEdit, 
    setActiveScoreMatch, 
    setActiveRosterMatch, 
    getVenueById,
    getMatchRegisteredPlayers
  } = useApp();
  const [search, setSearch] = useState('');
  const [matchToDelete, setMatchToDelete] = useState(null);

  const filtered = matches.filter(m => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      (m.dateLabel || m.date).toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q)
    );
  });

  const handleConfirmDelete = () => {
    if (matchToDelete) {
      deleteMatch(matchToDelete.id);
      setMatchToDelete(null);
    }
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
      {/* Header & New Match Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-palette-dark">Jadwal & Slot Pertandingan</h3>
          <p className="text-xs text-gray-500">Kelola slot mabar, sparring, roster pemain, dan penerbitan tiket pertandingan.</p>
        </div>

        <button
          onClick={() => setActiveMatchEdit({ isNew: true })}
          className="py-2.5 px-4 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" /> Terbitkan Slot Game Baru
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Cari pertandingan berdasarkan judul, tanggal, atau kode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 bg-palette-bg rounded-xl border border-palette-subtle focus:border-palette-primary outline-none transition-colors"
        />
      </div>

      {/* Matches Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-palette-subtle text-gray-500 text-[11px] font-bold">
              <th className="py-2.5 px-3">Pertandingan</th>
              <th className="py-2.5 px-3">Jadwal & Waktu</th>
              <th className="py-2.5 px-3">Venue Lapangan</th>
              <th className="py-2.5 px-3">Slot Terisi</th>
              <th className="py-2.5 px-3">Tarif / Slot</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-palette-subtle">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-gray-400 italic">
                  Tidak ada jadwal pertandingan ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const venue = getVenueById(m.fieldId);
                const regPlayers = getMatchRegisteredPlayers ? getMatchRegisteredPlayers(m.id) : (m.registeredPlayers || []);
                const verifiedCount = regPlayers.filter(p => p.status === 'paid').length;
                const totalSlots = m.totalSlots || 24;
                const isFull = verifiedCount >= totalSlots;

                return (
                  <tr key={m.id} className="hover:bg-palette-bg/40 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-palette-dark">{m.title}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span className="bg-palette-subtle/50 px-1.5 py-0.5 rounded text-palette-dark font-semibold">{m.id}</span>
                        <span>•</span>
                        <span className="capitalize">{m.type === 'sparring' ? 'Sparring 2 Tim' : 'Solo Player'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-700 flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-palette-primary" />
                        {m.dateLabel || m.date}
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {m.timeSlot}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-palette-primary" />
                        {venue?.name || 'Venue Lapangan'}
                      </div>
                      <div className="text-[10px] text-gray-400">{venue?.location || 'Balikpapan'}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isFull ? 'bg-red-500' : 'bg-palette-primary'}`}
                            style={{ width: `${Math.min(100, (verifiedCount / totalSlots) * 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold">
                          {verifiedCount}/{totalSlots}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-palette-primary">
                        {formatIDR(m.playerFee || m.slotFee || 50000)}
                      </div>
                      <div className="text-[10px] text-gray-400">Kiper: {formatIDR(m.keeperFee || 25000)}</div>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Detail Roster */}
                        <button
                          onClick={() => setActiveRosterMatch(m)}
                          className="px-2.5 py-1.5 rounded-lg bg-palette-primary/10 hover:bg-palette-primary hover:text-white text-palette-primary font-bold text-[11px] transition-all flex items-center gap-1"
                          title="Lihat Detail Peserta & Roster"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Detail ({verifiedCount})</span>
                          <span className="xl:hidden">Detail</span>
                        </button>

                        {/* Input Skor */}
                        <button
                          onClick={() => setActiveScoreMatch(m)}
                          className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all"
                          title="Input Skor & Statistik"
                        >
                          <Trophy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Match */}
                        <button
                          onClick={() => setActiveMatchEdit(m)}
                          className="p-1.5 rounded-lg bg-palette-bg hover:bg-palette-subtle text-palette-dark border border-palette-subtle transition-all"
                          title="Edit Jadwal"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Hapus Match */}
                        <button
                          onClick={() => setMatchToDelete(m)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                          title="Hapus Jadwal"
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

      {/* MODAL KONFIRMASI HAPUS JADWAL */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-100 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-palette-dark">Konfirmasi Hapus Jadwal</h3>
                  <p className="text-[11px] text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>
              <button 
                onClick={() => setMatchToDelete(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-red-50/70 border border-red-100 p-3.5 rounded-2xl space-y-2 text-xs">
              <div className="font-extrabold text-red-900">{matchToDelete.title}</div>
              <div className="text-[11px] text-red-700 space-y-1">
                <div>• ID Match: <span className="font-mono font-bold">{matchToDelete.id}</span></div>
                <div>• Tanggal & Jam: <span className="font-semibold">{matchToDelete.dateLabel || matchToDelete.date} ({matchToDelete.timeSlot})</span></div>
                <div>• Peserta Terdaftar: <span className="font-bold font-mono">{(matchToDelete.registeredPlayers || []).length} Orang</span></div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus jadwal pertandingan ini? Seluruh data booking dan slot terkait juga akan dihapus dari Cloud Database Supabase.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className="flex-1 py-2.5 bg-palette-bg hover:bg-palette-subtle/70 text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Ya, Hapus Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
