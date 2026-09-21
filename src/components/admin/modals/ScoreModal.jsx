import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Trophy, Award } from 'lucide-react';

export const ScoreModal = () => {
  const { activeScoreMatch, setActiveScoreMatch, updateMatch, showToast } = useApp();

  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [mvp, setMvp] = useState('Rifki Pratama');
  const [status, setStatus] = useState('completed');

  if (!activeScoreMatch) return null;

  const teamAName = activeScoreMatch.teamA?.name || (activeScoreMatch.type === 'fun_football' ? 'Tim Rompi Merah' : 'Tim A');
  const teamBName = activeScoreMatch.teamB?.name || (activeScoreMatch.type === 'fun_football' ? 'Tim Rompi Hitam' : 'Tim B');

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMatch(activeScoreMatch.id, {
      status,
      matchStats: {
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
        mvp: mvp.trim(),
        teamAName,
        teamBName,
        completedAt: new Date().toISOString()
      }
    });

    showToast(`Skor pertandingan ${activeScoreMatch.id} berhasil disimpan! (${scoreA} - ${scoreB})`);
    setActiveScoreMatch(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up">
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-sm text-white">Input Skor & Statistik Pertandingan</h3>
          </div>
          <button
            onClick={() => setActiveScoreMatch(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Score Input Matchup */}
          <div className="bg-palette-bg p-4 rounded-2xl border border-palette-subtle flex items-center justify-between gap-3 text-center">
            <div className="flex-1">
              <div className="font-bold text-palette-dark text-xs mb-1 truncate">{teamAName}</div>
              <input
                type="number"
                min="0"
                value={scoreA}
                onChange={(e) => setScoreA(e.target.value)}
                className="w-16 h-12 text-center text-2xl font-black font-mono rounded-xl border border-palette-subtle bg-white text-palette-dark mx-auto block"
              />
            </div>

            <div className="text-sm font-black text-gray-400 font-mono">VS</div>

            <div className="flex-1">
              <div className="font-bold text-palette-dark text-xs mb-1 truncate">{teamBName}</div>
              <input
                type="number"
                min="0"
                value={scoreB}
                onChange={(e) => setScoreB(e.target.value)}
                className="w-16 h-12 text-center text-2xl font-black font-mono rounded-xl border border-palette-subtle bg-white text-palette-dark mx-auto block"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Pemain Terbaik (MVP Matchday)</label>
            <input
              type="text"
              placeholder="Contoh: Rifki Pratama (Persiba Fans Club)"
              value={mvp}
              onChange={(e) => setMvp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Status Game</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white font-bold"
            >
              <option value="completed">COMPLETED (Pertandingan Selesai)</option>
              <option value="confirmed">CONFIRMED (Live In-Game)</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveScoreMatch(null)}
              className="flex-1 py-2.5 bg-palette-bg text-palette-dark font-bold rounded-xl border border-palette-subtle"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-palette-primary text-white font-bold rounded-xl hover:bg-palette-primaryDark shadow-xs"
            >
              Simpan Skor & Selesai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
