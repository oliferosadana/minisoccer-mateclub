import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { 
  FileCheck2, 
  Search, 
  Eye, 
  Check, 
  RotateCcw, 
  Trash2, 
  Phone, 
  ExternalLink 
} from 'lucide-react';

export const BookingsSection = () => {
  const { bookings, getMatchById, updateBookingStatus, deleteBooking, setActiveProofBooking } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'waiting_verification' | 'paid'

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.paymentStatus !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        b.id.toLowerCase().includes(q) ||
        b.playerName.toLowerCase().includes(q) ||
        b.phone.includes(q) ||
        b.ticketCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-palette-dark flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-palette-primary" /> Validasi Pembayaran & Transaksi
          </h2>
          <p className="text-xs text-gray-500">Verifikasi bukti transfer QRIS/Bank pemain untuk penerbitan E-Ticket lunas.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-palette-bg p-1 rounded-xl border border-palette-subtle text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'all' ? 'bg-white text-palette-primary shadow-xs' : 'text-gray-500'}`}
          >
            Semua ({bookings.length})
          </button>
          <button
            onClick={() => setStatusFilter('waiting_verification')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'waiting_verification' ? 'bg-white text-amber-600 shadow-xs' : 'text-gray-500'}`}
          >
            Menunggu ({bookings.filter(b => b.paymentStatus === 'waiting_verification').length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg transition-all ${statusFilter === 'paid' ? 'bg-white text-emerald-600 shadow-xs' : 'text-gray-500'}`}
          >
            Lunas ({bookings.filter(b => b.paymentStatus === 'paid').length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Cari Booking ID, nama pemain, WhatsApp, tiket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
        />
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-palette-subtle text-gray-400 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Booking ID & Tiket</th>
              <th className="py-2.5 px-3">Pemain & Posisi</th>
              <th className="py-2.5 px-3">Sesi Pertandingan</th>
              <th className="py-2.5 px-3">Total Bayar</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3 text-right">Aksi Validasi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-palette-subtle">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400">
                  Tidak ada transaksi booking yang ditemukan.
                </td>
              </tr>
            ) : (
              filtered.map(b => {
                const match = getMatchById(b.matchId) || { title: 'Pertandingan' };
                const isPaid = b.paymentStatus === 'paid';
                return (
                  <tr key={b.id} className="hover:bg-palette-bg/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-palette-primary">{b.id}</div>
                      <div className="font-mono text-[10px] text-gray-500">{b.ticketCode}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-palette-dark">{b.playerName}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="font-semibold text-palette-primary">{b.position}</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 font-mono font-bold text-[9px] border border-indigo-200">
                          Size {b.jerseySize || 'L'}
                        </span>
                        <span>• {b.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-palette-dark truncate max-w-[160px]">{match.title}</div>
                      <div className="text-[10px] text-gray-400 uppercase">{b.paymentMethod}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="font-bold text-palette-dark">{formatIDR(b.amount)}</div>
                      {b.uniqueCode ? (
                        <div className="text-[10px] text-emerald-700 font-semibold">
                          Kode: +{b.uniqueCode}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPaid ? '✓ Lunas' : '⏳ Menunggu'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setActiveProofBooking(b)}
                          className="p-1.5 rounded-lg bg-palette-bg hover:bg-palette-subtle text-palette-dark border border-palette-subtle transition-all"
                          title="Lihat Bukti Transfer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {!isPaid ? (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'paid')}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs"
                            title="Konfirmasi Lunas"
                          >
                            <Check className="w-3.5 h-3.5" /> Lunas
                          </button>
                        ) : (
                          <button
                            onClick={() => updateBookingStatus(b.id, 'waiting_verification')}
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600"
                            title="Set Menunggu"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            if (confirm(`Hapus booking ${b.id}?`)) deleteBooking(b.id);
                          }}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600"
                          title="Hapus"
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
    </div>
  );
};
