import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../lib/supabase';
import { 
  Search, 
  Ticket, 
  CheckCircle2, 
  Clock3, 
  AlertCircle, 
  Phone, 
  Calendar, 
  MapPin, 
  Lock, 
  LogIn, 
  UserPlus, 
  Shirt,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const TrackerView = () => {
  const { bookings, getMatchById, getVenueById, setActiveTicketBooking, setPublicTab } = useApp();
  const { currentUser, openLogin, openRegister } = useAuth();
  const [keyword, setKeyword] = useState('');

  // When logged in, filter only bookings belonging to the current user
  const userBookings = currentUser
    ? bookings.filter(b => {
        const isOwner = (b.phone && currentUser.phone && b.phone.replace(/[^0-9]/g, '').endsWith(currentUser.phone.replace(/[^0-9]/g, '').slice(-8))) ||
          (b.playerName && currentUser.name && b.playerName.trim().toLowerCase() === currentUser.name.trim().toLowerCase());
        return isOwner;
      })
    : [];

  const searchResults = userBookings.filter(b => {
    if (!keyword.trim()) return true;
    const q = keyword.toLowerCase().trim();
    const match = getMatchById(b.matchId);
    return (
      b.id.toLowerCase().includes(q) ||
      b.ticketCode?.toLowerCase().includes(q) ||
      b.playerName.toLowerCase().includes(q) ||
      (match?.title && match.title.toLowerCase().includes(q)) ||
      (match?.dateLabel && match.dateLabel.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-palette-subtle shadow-card text-center relative overflow-hidden">
        <div className="w-14 h-14 bg-palette-primary/10 text-palette-primary rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Ticket className="w-7 h-7" />
        </div>
        
        <h2 className="text-xl sm:text-2xl font-black text-palette-dark">
          {currentUser ? 'E-Ticket & Riwayat Booking Saya' : 'Pelacakan Tiket Pertandingan'}
        </h2>
        
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1 leading-relaxed">
          {currentUser 
            ? `Menampilkan tiket pertandingan terdaftar untuk akun ${currentUser.name} (${currentUser.phone}).`
            : 'Untuk menjaga privasi & keamanan data peserta, silakan masuk ke akun Anda untuk melihat daftar tiket pertandingan resmi.'}
        </p>

        {/* Logged in Search Bar */}
        {currentUser && userBookings.length > 0 && (
          <div className="relative max-w-lg mx-auto mt-5">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Cari berdasarkan Booking ID, Kode Tiket, atau Nama Match..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border-2 border-palette-subtle focus:border-palette-primary outline-none transition-all shadow-xs bg-palette-bg/40 focus:bg-white"
            />
          </div>
        )}
      </div>

      {/* STATE 1: GUEST / NOT LOGGED IN */}
      {!currentUser && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-palette-subtle shadow-card text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto ring-8 ring-amber-50/50">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base sm:text-lg font-black text-palette-dark">
              Akses Tiket Terkunci (Wajib Masuk Akun)
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Daftar tiket yang valid tidak ditampilkan secara publik untuk melindungi kode QR tiket dan identitas pemain dari akses tidak sah.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto pt-2">
            <button
              onClick={() => openLogin()}
              className="w-full sm:w-auto flex-1 py-3 px-6 bg-palette-primary hover:bg-palette-primaryDark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" /> Masuk ke Akun
            </button>
            <button
              onClick={() => openRegister()}
              className="w-full sm:w-auto flex-1 py-3 px-6 bg-palette-bg hover:bg-palette-subtle text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-palette-primary" /> Daftar Akun Baru
            </button>
          </div>
        </div>
      )}

      {/* STATE 2: LOGGED IN BUT NO BOOKINGS */}
      {currentUser && userBookings.length === 0 && (
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-palette-subtle shadow-card text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-palette-primary/10 text-palette-primary flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="text-base font-black text-palette-dark">Belum Ada Tiket Pertandingan</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Anda belum memiliki riwayat pemesanan tiket di <strong>MATE CLUB</strong>. Silakan pilih sesi mabar yang tersedia dan amankan slot Anda sekarang!
            </p>
          </div>
          <button
            onClick={() => setPublicTab('matches')}
            className="py-2.5 px-6 bg-palette-primary hover:bg-palette-primaryDark text-white font-extrabold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2 mt-2 cursor-pointer"
          >
            <span>Lihat Jadwal Pertandingan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STATE 3: LOGGED IN WITH BOOKINGS */}
      {currentUser && userBookings.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-extrabold text-palette-dark">
              Total Tiket: <strong className="text-palette-primary font-mono">{searchResults.length}</strong> dari {userBookings.length}
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-palette-subtle text-center text-xs text-gray-500">
              Tidak ditemukan tiket Anda yang cocok dengan pencarian <strong>"{keyword}"</strong>.
            </div>
          ) : (
            searchResults.map(b => {
              const match = getMatchById(b.matchId) || { title: 'Pertandingan Mini Soccer', dateLabel: 'Matchday', timeSlot: '-' };
              const venue = getVenueById(match.fieldId) || { name: 'Venue Balikpapan' };
              const isPaid = b.paymentStatus === 'paid';

              return (
                <div
                  key={b.id}
                  className="bg-white p-4 sm:p-5 rounded-2xl border border-palette-subtle shadow-xs hover:border-palette-primary/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-palette-primary bg-palette-primary/5 px-2 py-0.5 rounded border border-palette-primary/20">
                        {b.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                        isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {isPaid ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock3 className="w-3 h-3 text-amber-600" />}
                        <span>{isPaid ? 'Lunas & Terverifikasi' : 'Menunggu Pembayaran'}</span>
                      </span>
                      {b.ticketCode && (
                        <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {b.ticketCode}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-palette-dark">
                      {match.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-palette-primary" /> 
                        {match.dateLabel || match.date} • {match.timeSlot}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-palette-primary" /> 
                        {venue.name}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-palette-dark">
                        <Shirt className="w-3.5 h-3.5 text-palette-primary" /> 
                        {b.position} (Size {b.jerseySize || 'L'})
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 font-mono pt-0.5 flex flex-wrap items-center gap-2">
                      <span>Total: <strong className="text-palette-dark font-black text-xs">{formatIDR(b.amount)}</strong></span>
                      {b.uniqueCode > 0 && isPaid && (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                          🎁 Cashback Saldo +{formatIDR(b.uniqueCode)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => setActiveTicketBooking(b)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-palette-primary hover:bg-palette-primaryDark text-white rounded-xl text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" /> Buka E-Ticket Pass
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
