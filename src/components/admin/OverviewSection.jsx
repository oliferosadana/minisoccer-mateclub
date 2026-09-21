import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowUpRight 
} from 'lucide-react';

export const OverviewSection = () => {
  const { matches, bookings, venues, setAdminSection, getMatchRegisteredPlayers } = useApp();

  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const pendingRevenue = bookings
    .filter(b => b.paymentStatus === 'waiting_verification')
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const activeMatchesCount = matches.filter(m => m.status === 'open' || m.status === 'confirmed').length;

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-palette-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Omset Lunas Masuk</div>
            <div className="text-xl font-black text-palette-dark font-mono mt-1">{formatIDR(totalRevenue)}</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Transaksi Terverifikasi
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            💰
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white p-5 rounded-2xl border border-palette-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Pending Validasi</div>
            <div className="text-xl font-black text-amber-600 font-mono mt-1">{formatIDR(pendingRevenue)}</div>
            <div className="text-[11px] text-amber-700 font-semibold mt-1">
              {bookings.filter(b => b.paymentStatus === 'waiting_verification').length} Struk Menunggu
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl">
            ⏳
          </div>
        </div>

        {/* Active Matches */}
        <div className="bg-white p-5 rounded-2xl border border-palette-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Jadwal Aktif</div>
            <div className="text-xl font-black text-palette-primary font-mono mt-1">{activeMatchesCount} Game</div>
            <div className="text-[11px] text-gray-500 font-semibold mt-1">
              {matches.length} Total Sesi Diterbitkan
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-palette-primary flex items-center justify-center font-bold text-xl">
            ⚽
          </div>
        </div>

        {/* Total Venues */}
        <div className="bg-white p-5 rounded-2xl border border-palette-subtle shadow-card flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Venue Rekanan</div>
            <div className="text-xl font-black text-palette-dark font-mono mt-1">{venues.length} Lapangan</div>
            <div className="text-[11px] text-gray-500 font-semibold mt-1">
              Balikpapan & Sekitarnya
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl">
            🏟️
          </div>
        </div>
      </div>

      {/* Quick Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Transactions */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-palette-dark flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Transaksi Perlu Validasi
            </h3>
            <button
              onClick={() => setAdminSection('bookings')}
              className="text-xs font-bold text-palette-primary hover:underline flex items-center gap-0.5"
            >
              Lihat Semua <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {bookings.filter(b => b.paymentStatus === 'waiting_verification').length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400 font-medium">
                Semua transaksi booking saat ini telah terverifikasi lunas.
              </div>
            ) : (
              bookings
                .filter(b => b.paymentStatus === 'waiting_verification')
                .slice(0, 4)
                .map(b => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-palette-bg border border-palette-subtle flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-palette-dark">{b.playerName} ({b.position})</div>
                      <div className="text-[10px] text-gray-500 font-mono">{b.id} • {b.phone}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-palette-primary">{formatIDR(b.amount)}</div>
                      <span className="text-[10px] font-bold text-amber-700">Verifikasi</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Live Active Match Sessions */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-sm text-palette-dark flex items-center gap-2">
              <Calendar className="w-4 h-4 text-palette-primary" /> Jadwal Matchday Terdekat
            </h3>
            <button
              onClick={() => setAdminSection('matches')}
              className="text-xs font-bold text-palette-primary hover:underline flex items-center gap-0.5"
            >
              Kelola Jadwal <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {matches.slice(0, 4).map(m => {
              const regPlayers = getMatchRegisteredPlayers ? getMatchRegisteredPlayers(m.id) : (m.registeredPlayers || []);
              const regCount = regPlayers.length;
              const tot = m.totalSlots || 24;
              return (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-palette-bg border border-palette-subtle flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-palette-dark truncate max-w-[200px] sm:max-w-xs">{m.title}</div>
                    <div className="text-[10px] text-gray-500">{m.dateLabel} ({m.timeSlot})</div>
                  </div>
                  <div className="text-right font-mono font-bold text-palette-dark text-xs">
                    {regCount}/{tot} Slot
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
