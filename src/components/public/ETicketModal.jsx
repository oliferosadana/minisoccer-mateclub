import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { X, QrCode, Calendar, Clock, MapPin, User, CheckCircle2, Clock3, Share2 } from 'lucide-react';

export const ETicketModal = () => {
  const { activeTicketBooking, setActiveTicketBooking, getMatchById, getVenueById } = useApp();

  if (!activeTicketBooking) return null;

  const match = getMatchById(activeTicketBooking.matchId) || { title: 'Pertandingan Mini Soccer', dateLabel: 'Matchday', timeSlot: '19:00 WITA' };
  const venue = getVenueById(match.fieldId) || { name: 'Balikpapan Soccer Arena', location: 'Balikpapan' };
  const isPaid = activeTicketBooking.paymentStatus === 'paid';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up">
        {/* Ticket Header */}
        <div className="bg-palette-dark text-white p-6 text-center relative">
          <button
            onClick={() => setActiveTicketBooking(null)}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center p-2 shadow-md mb-2 border border-white/15">
            <img src="/logo.png" alt="MATE CLUB" className="w-full h-full object-contain" />
          </div>
          <div className="text-[11px] uppercase tracking-widest text-palette-subtle font-bold">Official Matchday Pass</div>
          <h3 className="text-base font-black text-white mt-1 leading-snug">{match.title}</h3>
        </div>

        {/* Ticket Perforation Notch */}
        <div className="relative flex items-center justify-between px-4 py-2 bg-palette-bg border-y border-dashed border-palette-subtle">
          <div className="w-5 h-5 rounded-full bg-black/60 -ml-6.5"></div>
          <div className="text-[10px] font-mono text-gray-400 font-bold tracking-widest uppercase">MATE CLUB ACCESS PASS</div>
          <div className="w-5 h-5 rounded-full bg-black/60 -mr-6.5"></div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-4">
          <div className="text-center">
            <div className="inline-block p-3 bg-white rounded-2xl border-2 border-dashed border-palette-subtle shadow-xs mb-2">
              <QRCodeCanvas
                value={activeTicketBooking.ticketCode || activeTicketBooking.id}
                size={130}
                logo="/logo.png"
                alt="Ticket QR"
              />
            </div>
            <div className="font-mono text-xs font-black text-palette-dark tracking-wider">
              {activeTicketBooking.ticketCode || 'TK-8891-MC'}
            </div>
            <div className="mt-1">
              {isPaid ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Lunas & Terverifikasi
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  <Clock3 className="w-3.5 h-3.5" /> Menunggu Verifikasi Panitia
                </span>
              )}
            </div>
          </div>

          <div className="bg-palette-bg p-3.5 rounded-2xl border border-palette-subtle text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Nama Pemain:</span>
              <strong className="text-palette-dark">{activeTicketBooking.playerName}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Posisi:</span>
              <strong className="text-palette-primary font-bold">{activeTicketBooking.position}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Ukuran Baju/Rompi:</span>
              <strong className="text-indigo-600 font-mono font-black bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Size {activeTicketBooking.jerseySize || 'L'}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Venue:</span>
              <strong className="text-palette-dark truncate max-w-[150px]">{venue.name}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Waktu:</span>
              <strong className="text-palette-dark">{match.timeSlot}</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Metode Bayar:</span>
              <span className="text-xs font-bold text-palette-dark flex items-center gap-1">
                {activeTicketBooking.paymentMethod === 'wallet'
                  ? '🪙 Saldo Dompet'
                  : activeTicketBooking.paymentMethod === 'qris_gopay' || activeTicketBooking.paymentMethod === 'qris'
                  ? '📱 GoPay QRIS'
                  : '🏦 Transfer ' + (activeTicketBooking.paymentMethod || 'Bank').toUpperCase()}
              </span>
            </div>
            {activeTicketBooking.usedWalletBalance > 0 && (
              <div className="flex items-center justify-between text-[11px] text-emerald-800">
                <span>Potongan Saldo:</span>
                <strong className="font-mono font-bold">- {formatIDR(activeTicketBooking.usedWalletBalance)}</strong>
              </div>
            )}
            <div className="flex items-center justify-between pt-1 border-t border-palette-subtle">
              <span className="text-gray-500">Total Biaya:</span>
              <div className="text-right">
                <strong className="text-emerald-700 font-mono font-black">{formatIDR(activeTicketBooking.amount)}</strong>
                {activeTicketBooking.uniqueCode ? (
                  <span className="text-[10px] text-emerald-700 font-mono block">
                    (Kode Unik +{activeTicketBooking.uniqueCode} {isPaid ? '✓ Masuk Saldo' : ''})
                  </span>
                ) : null}
              </div>
            </div>
            {isPaid && activeTicketBooking.uniqueCode > 0 && (
              <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[10px] text-emerald-800 text-center font-semibold">
                🎁 Kelebihan kode unik (+{formatIDR(activeTicketBooking.uniqueCode)}) telah dikembalikan ke Saldo Dompet Anda.
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTicketBooking(null)}
            className="w-full py-2.5 bg-palette-primary text-white font-bold text-xs rounded-xl hover:bg-palette-primaryDark transition-all"
          >
            Tutup Tiket
          </button>
        </div>
      </div>
    </div>
  );
};
