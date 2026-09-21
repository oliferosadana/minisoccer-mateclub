import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Trophy, Award, Flame, Check } from 'lucide-react';

export const TopPerformerModal = () => {
  const { activePerformerEdit, setActivePerformerEdit, tournaments, addTopPerformer, updateTopPerformer, showToast } = useApp();

  const [name, setName] = useState('');
  const [club, setClub] = useState('');
  const [tournamentId, setTournamentId] = useState('trn-1');
  const [category, setCategory] = useState('goal'); // 'goal' | 'cleansheet' | 'mvp'
  const [rank, setRank] = useState(1);
  const [caps, setCaps] = useState(0);
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [cleanSheet, setCleanSheet] = useState(0);
  const [mvpCount, setMvpCount] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (activePerformerEdit) {
      if (activePerformerEdit.isNew) {
        setName('');
        setClub('');
        setTournamentId(tournaments[0]?.id || 'trn-1');
        setCategory('goal');
        setRank(1);
        setCaps(0);
        setGoals(0);
        setAssists(0);
        setCleanSheet(0);
        setMvpCount(0);
        setStatus('active');
      } else {
        setName(activePerformerEdit.name || '');
        setClub(activePerformerEdit.club || '');
        setTournamentId(activePerformerEdit.tournamentId || 'trn-1');
        setCategory(activePerformerEdit.category || 'goal');
        setRank(activePerformerEdit.rank || 1);
        setCaps(activePerformerEdit.caps || 0);
        setGoals(activePerformerEdit.goals || 0);
        setAssists(activePerformerEdit.assists || 0);
        setCleanSheet(activePerformerEdit.cleanSheet || 0);
        setMvpCount(activePerformerEdit.mvpCount || 0);
        setStatus(activePerformerEdit.status || 'active');
      }
    }
  }, [activePerformerEdit, tournaments]);

  if (!activePerformerEdit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama pemain wajib diisi!', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      club: club.trim() || 'MATE CLUB Balikpapan',
      tournamentId,
      category,
      rank: Number(rank) || 1,
      caps: Number(caps) || 0,
      goals: Number(goals) || 0,
      assists: Number(assists) || 0,
      cleanSheet: Number(cleanSheet) || 0,
      mvpCount: Number(mvpCount) || 0,
      status
    };

    if (activePerformerEdit.isNew) {
      addTopPerformer(payload);
    } else {
      updateTopPerformer(activePerformerEdit.id, payload);
    }

    setActivePerformerEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
        
        {/* Header Modal */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between border-b border-palette-primaryDark">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              MANAJEMEN TOP PERFORMER & MVP
            </span>
            <h3 className="text-base font-black text-white mt-0.5">
              {activePerformerEdit.isNew ? 'Tambah Top Skor / MVP Pemain' : `Edit Pemain: ${name || activePerformerEdit.id}`}
            </h3>
          </div>
          <button
            onClick={() => setActivePerformerEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status Switch */}
          <div className="p-3 bg-palette-bg rounded-2xl border border-palette-subtle flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-extrabold text-palette-dark cursor-pointer">
              <input
                type="checkbox"
                checked={status === 'active'}
                onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                className="w-4 h-4 accent-emerald-600 rounded"
              />
              <span className={status === 'active' ? 'text-emerald-700' : 'text-gray-500'}>
                {status === 'active' ? '✓ Status: AKTIF (Ditampilkan di Leaderboard)' : '✗ Status: NON-AKTIF (Disembunyikan)'}
              </span>
            </label>
          </div>

          {/* Tournament Selection */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">Turnamen / Musim Liga *</label>
            <select
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-white focus:border-palette-primary outline-none font-bold"
            >
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.season})</option>
              ))}
            </select>
          </div>

          {/* Player Name & Club */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Nama Lengkap Pemain *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Rifki Pratama"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Klub / Tim Asal</label>
              <input
                type="text"
                placeholder="Contoh: Persiba Fans Club BPP"
                value={club}
                onChange={(e) => setClub(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Category & Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Fokus Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-white focus:border-palette-primary outline-none font-bold"
              >
                <option value="goal">⚽ Top Skor (Pencetak Gol)</option>
                <option value="cleansheet">🧤 Top Kiper (Clean Sheets)</option>
                <option value="mvp">⭐ Top MVP Match</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Peringkat (Rank)</label>
              <input
                type="number"
                min="1"
                placeholder="1"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono font-bold text-center"
              />
            </div>
          </div>

          {/* Player Statistics Grid (Caps, Goals, Assists, CS, MVP) */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1.5">
              Statistik Performa Pemain
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div className="p-2 rounded-xl bg-palette-bg border border-palette-subtle text-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Caps (Main)</span>
                <input
                  type="number"
                  min="0"
                  value={caps}
                  onChange={(e) => setCaps(e.target.value)}
                  className="w-full text-center font-mono font-black text-xs text-palette-dark bg-white rounded-lg p-1 border border-palette-subtle outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Gol (Goals)</span>
                <input
                  type="number"
                  min="0"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  className="w-full text-center font-mono font-black text-xs text-emerald-800 bg-white rounded-lg p-1 border border-emerald-300 outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-800 uppercase block mb-1">Assist</span>
                <input
                  type="number"
                  min="0"
                  value={assists}
                  onChange={(e) => setAssists(e.target.value)}
                  className="w-full text-center font-mono font-black text-xs text-blue-800 bg-white rounded-lg p-1 border border-blue-300 outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                <span className="text-[10px] font-bold text-indigo-800 uppercase block mb-1">Clean Sheet</span>
                <input
                  type="number"
                  min="0"
                  value={cleanSheet}
                  onChange={(e) => setCleanSheet(e.target.value)}
                  className="w-full text-center font-mono font-black text-xs text-indigo-800 bg-white rounded-lg p-1 border border-indigo-300 outline-none"
                />
              </div>

              <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">MVP Count</span>
                <input
                  type="number"
                  min="0"
                  value={mvpCount}
                  onChange={(e) => setMvpCount(e.target.value)}
                  className="w-full text-center font-mono font-black text-xs text-amber-800 bg-white rounded-lg p-1 border border-amber-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-palette-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActivePerformerEdit(null)}
              className="px-4 py-2 bg-palette-bg text-gray-700 font-bold text-xs rounded-xl border border-palette-subtle hover:bg-gray-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{activePerformerEdit.isNew ? 'Simpan Top Performer' : 'Perbarui Data'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
