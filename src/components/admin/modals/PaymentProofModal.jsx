import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatIDR } from '../../../lib/supabase';
import { X, Check, RotateCcw, Share2, Receipt, AlertCircle, Ban } from 'lucide-react';

export const PaymentProofModal = () => {
  const { activeProofBooking, setActiveProofBooking, updateBookingStatus, getMatchById } = useApp();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Bukti transfer buram / tidak terbaca');

  if (!activeProofBooking) return null;

  const match = getMatchById(activeProofBooking.matchId) || { title: 'Pertandingan' };
  const isPaid = activeProofBooking.paymentStatus === 'paid';
  const isRejected = activeProofBooking.paymentStatus === 'rejected';
  const cleanPhone = (activeProofBooking.phone || '').replace(/[^0-9]/g, '');

  const REJECTION_REASONS = [
    'Bukti transfer buram / tidak terbaca',
    'Nominal transfer kurang / tidak sesuai dengan total tagihan',
    'Nama pengirim / nomor rekening tidak cocok',
    'Waktu transfer telah melewati batas pembayaran slot'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up">
        {/* Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-palette-primary" />
            <h3 className="font-extrabold text-sm text-white">Verifikasi Bukti Pembayaran</h3>
          </div>
          <button
            onClick={() => {
              setActiveProofBooking(null);
              setShowRejectForm(false);
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold">Rincian Peserta</span>
              <h4 className="font-extrabold text-sm text-palette-dark">{activeProofBooking.playerName}</h4>
              <div className="text-gray-500 text-[11px]">{activeProofBooking.phone} • {activeProofBooking.position}</div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
              isPaid 
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                : isRejected 
                ? 'bg-red-100 text-red-800 border border-red-300' 
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              {isPaid ? '✓ Lunas' : isRejected ? '✗ Ditolak' : '⏳ Menunggu'}
            </span>
          </div>

          <div className="p-3 bg-palette-bg rounded-2xl border border-palette-subtle grid grid-cols-2 gap-2 text-[11px]">
            <div>Booking ID: <strong className="font-mono text-palette-primary block">{activeProofBooking.id}</strong></div>
            <div>Total Bayar: <strong className="font-mono text-palette-dark block">{formatIDR(activeProofBooking.amount)}</strong></div>
            <div>Metode: <strong className="uppercase block">{activeProofBooking.paymentMethod}</strong></div>
            <div>Game: <strong className="truncate block">{match.title}</strong></div>
          </div>

          {/* Struk Image Container */}
          <div>
            <div className="text-[10px] text-gray-400 font-bold uppercase mb-1">Foto Struk / Bukti Transfer:</div>
            <div className="bg-gray-900 rounded-2xl overflow-hidden p-2 text-center border border-gray-200 shadow-inner">
              <img
                src={activeProofBooking.proofImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'}
                alt="Struk Transfer"
                className="max-h-56 mx-auto object-contain rounded-xl"
              />
            </div>
          </div>

          {/* Rejection Form Box */}
          {showRejectForm && (
            <div className="p-3.5 bg-red-50 rounded-2xl border border-red-200 space-y-2 animate-fade-in text-red-900">
              <div className="font-extrabold flex items-center gap-1.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600" /> Pilih Alasan Penolakan:
              </div>
              <select
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full text-xs p-2 rounded-xl border border-red-300 bg-white text-gray-800 outline-none"
              >
                {REJECTION_REASONS.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
              <div className="text-[10px] text-red-700">
                * Notifikasi penolakan &amp; instruksi upload ulang otomatis dikirim ke nomor WhatsApp pemain via WAHA Gateway.
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    updateBookingStatus(activeProofBooking.id, 'rejected', rejectionReason);
                    setActiveProofBooking(null);
                    setShowRejectForm(false);
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                >
                  <Ban className="w-3.5 h-3.5" /> Konfirmasi Tolak &amp; Kirim WA
                </button>
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-2 bg-white text-gray-700 font-bold rounded-xl text-xs border border-gray-300"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          {!showRejectForm && (
            <div className="flex flex-col gap-2 pt-1">
              <div className="flex gap-2">
                {!isPaid ? (
                  <>
                    <button
                      onClick={() => {
                        updateBookingStatus(activeProofBooking.id, 'paid');
                        setActiveProofBooking(null);
                      }}
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Check className="w-4 h-4" /> Konfirmasi Lunas &amp; Kirim Tiket
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="px-3 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center justify-center gap-1 border border-red-200"
                      title="Tolak Bukti Pembayaran"
                    >
                      <Ban className="w-4 h-4" /> Tolak
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      updateBookingStatus(activeProofBooking.id, 'waiting_verification');
                      setActiveProofBooking(null);
                    }}
                    className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Set Kembali Menunggu
                  </button>
                )}

                {cleanPhone && (
                  <a
                    href={`https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=Halo%20${encodeURIComponent(activeProofBooking.playerName)},%20terkait%20booking%20MATE%20CLUB%20ID%20${activeProofBooking.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl hover:bg-emerald-100 flex items-center justify-center shrink-0"
                    title="Chat Langsung via WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveProofBooking(null)}
                className="w-full py-2 bg-palette-bg text-palette-dark font-bold rounded-xl border border-palette-subtle"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

