import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Shield, Trophy, Check, Hash, Activity } from 'lucide-react';

export const ClubStandingModal = () => {
  const { activeClubEdit, setActiveClubEdit, tournaments, addStandingClub, updateStandingClub, showToast } = useApp();

  const [name, setName] = useState('');
  const [tournamentId, setTournamentId] = useState('trn-1');
  const [logo, setLogo] = useState('');
  const [rank, setRank] = useState(1);
  const [played, setPlayed] = useState(0);
  const [won, setWon] = useState(0);
  const [drawn, setDrawn] = useState(0);
  const [lost, setLost] = useState(0);
  const [goalsFor, setGoalsFor] = useState(0);
  const [goalsAgainst, setGoalsAgainst] = useState(0);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (activeClubEdit) {
      if (activeClubEdit.isNew) {
        setName('');
        setTournamentId(tournaments[0]?.id || 'trn-1');
        setLogo('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80');
        setRank(1);
        setPlayed(0);
        setWon(0);
        setDrawn(0);
        setLost(0);
        setGoalsFor(0);
        setGoalsAgainst(0);
        setStatus('active');
      } else {
        setName(activeClubEdit.name || '');
        setTournamentId(activeClubEdit.tournamentId || 'trn-1');
        setLogo(activeClubEdit.logo || '');
        setRank(activeClubEdit.rank || 1);
        setPlayed(activeClubEdit.played || 0);
        setWon(activeClubEdit.won || 0);
        setDrawn(activeClubEdit.drawn || 0);
        setLost(activeClubEdit.lost || 0);
        setGoalsFor(activeClubEdit.goalsFor || 0);
        setGoalsAgainst(activeClubEdit.goalsAgainst || 0);
        setStatus(activeClubEdit.status || 'active');
      }
    }
  }, [activeClubEdit, tournaments]);

  if (!activeClubEdit) return null;

  // Auto-calculated fields
  const calculatedPlayed = Number(won) + Number(drawn) + Number(lost);
  const goalDiff = Number(goalsFor) - Number(goalsAgainst);
  const points = (Number(won) * 3) + (Number(drawn) * 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama klub wajib diisi!', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      tournamentId,
      logo: logo.trim() || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
      rank: Number(rank) || 1,
      played: calculatedPlayed,
      won: Number(won) || 0,
      drawn: Number(drawn) || 0,
      lost: Number(lost) || 0,
      goalsFor: Number(goalsFor) || 0,
      goalsAgainst: Number(goalsAgainst) || 0,
      status
    };

    if (activeClubEdit.isNew) {
      addStandingClub(payload);
    } else {
      updateStandingClub(activeClubEdit.id, payload);
    }

    setActiveClubEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
        
        {/* Header Modal */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between border-b border-palette-primaryDark">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              MANAJEMEN KLASEMEN KLUB
            </span>
            <h3 className="text-base font-black text-white mt-0.5">
              {activeClubEdit.isNew ? 'Tambah Tim / Klub ke Klasemen' : `Edit Tim: ${name || activeClubEdit.id}`}
            </h3>
          </div>
          <button
            onClick={() => setActiveClubEdit(null)}
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
                {status === 'active' ? '✓ Status Klub: AKTIF (Ditampilkan di Klasemen)' : '✗ Status Klub: NON-AKTIF (Disembunyikan)'}
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

          {/* Club Name & Logo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-palette-dark mb-1">Nama Tim / Klub Komunitas *</label>
              <input
                type="text"
                required
                placeholder="Contoh: Garuda Muda BPP FC"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
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

          {/* Logo URL */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">URL Logo / Lambang Tim</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono"
            />
          </div>

          {/* Match Record Stats Grid (W, D, L) */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1.5">
              Rekor Pertandingan & Statistik Match
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Menang (W)</span>
                <input
                  type="number"
                  min="0"
                  value={won}
                  onChange={(e) => setWon(e.target.value)}
                  className="w-full text-center font-mono font-black text-sm text-emerald-800 bg-white rounded-lg p-1.5 border border-emerald-300 outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">Seri (D)</span>
                <input
                  type="number"
                  min="0"
                  value={drawn}
                  onChange={(e) => setDrawn(e.target.value)}
                  className="w-full text-center font-mono font-black text-sm text-amber-800 bg-white rounded-lg p-1.5 border border-amber-300 outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-center">
                <span className="text-[10px] font-bold text-red-800 uppercase block mb-1">Kalah (L)</span>
                <input
                  type="number"
                  min="0"
                  value={lost}
                  onChange={(e) => setLost(e.target.value)}
                  className="w-full text-center font-mono font-black text-sm text-red-800 bg-white rounded-lg p-1.5 border border-red-300 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Goals (GF, GA) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Gol Memasukkan (GF)</label>
              <input
                type="number"
                min="0"
                value={goalsFor}
                onChange={(e) => setGoalsFor(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono text-center font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Gol Kebobolan (GA)</label>
              <input
                type="number"
                min="0"
                value={goalsAgainst}
                onChange={(e) => setGoalsAgainst(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono text-center font-bold"
              />
            </div>
          </div>

          {/* Computed Summary Preview Card */}
          <div className="p-3.5 bg-palette-dark text-white rounded-2xl border border-palette-primary/30 flex items-center justify-between text-xs font-mono">
            <div>
              <span className="text-gray-400 text-[10px] block uppercase">Total Main (MP)</span>
              <strong className="text-sm font-black text-white">{calculatedPlayed} Laga</strong>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] block uppercase">Selisih Gol (GD)</span>
              <strong className={`text-sm font-black ${goalDiff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {goalDiff > 0 ? `+${goalDiff}` : goalDiff}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-[10px] block uppercase">Total Poin (Pts)</span>
              <strong className="text-lg font-black text-palette-primary">{points} Poin</strong>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-palette-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveClubEdit(null)}
              className="px-4 py-2 bg-palette-bg text-gray-700 font-bold text-xs rounded-xl border border-palette-subtle hover:bg-gray-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{activeClubEdit.isNew ? 'Simpan Tim Klasemen' : 'Perbarui Tim'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
