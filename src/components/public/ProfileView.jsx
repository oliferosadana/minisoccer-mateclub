import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { 
  User, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Trophy, 
  Flame, 
  Calendar, 
  Ticket, 
  Sparkles,
  Award,
  KeyRound,
  LogOut,
  CheckCircle2,
  Lock,
  Edit2,
  Save,
  Shield,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  History,
  PlusCircle
} from 'lucide-react';

export const ProfileView = () => {
  const { currentUser, openLogin, logout, changePassword, updateUser, getUserWalletTransactions } = useAuth();
  const { bookings, getMatchById, setActiveTicketBooking, showToast, setRole, setIsTopUpModalOpen } = useApp();

  const [activeTab, setActiveTab] = useState('wallet'); // 'wallet' | 'tickets' | 'profile' | 'security'
  
  // Password Change Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Edit Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [preferredPosition, setPreferredPosition] = useState(currentUser?.preferredPosition || 'Pemain Lapangan');
  const [jerseyNumber, setJerseyNumber] = useState(currentUser?.jerseyNumber || '10');
  const [clubOrigin, setClubOrigin] = useState(currentUser?.clubOrigin || '');
  const [profileLoading, setProfileLoading] = useState(false);

  if (!currentUser) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-palette-subtle max-w-md mx-auto shadow-card">
        <User className="w-12 h-12 text-palette-primary mx-auto mb-3" />
        <h3 className="text-lg font-black text-palette-dark">Silakan Masuk ke Akun Anda</h3>
        <p className="text-xs text-gray-500 mt-1 mb-6">
          Masuk atau daftar untuk melihat kartu member digital MATE CLUB, jumlah penampilan (caps), dan riwayat booking tiket pertandingan Anda.
        </p>
        <button
          onClick={() => openLogin()}
          className="w-full py-2.5 bg-palette-primary text-white font-bold text-xs rounded-xl hover:bg-palette-primaryDark shadow-sm"
        >
          Masuk / Daftar Sekarang
        </button>
      </div>
    );
  }

  const myBookings = bookings.filter(b => b.phone === currentUser.phone || b.playerName === currentUser.name);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('Harap lengkapi semua kolom password!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter!', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi password tidak cocok!', 'error');
      return;
    }

    setPasswordLoading(true);
    const res = await changePassword(currentUser.id, oldPassword, newPassword);
    setPasswordLoading(false);

    if (res.success) {
      showToast(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama lengkap wajib diisi!', 'error');
      return;
    }

    setProfileLoading(true);
    updateUser(currentUser.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      preferredPosition,
      jerseyNumber,
      clubOrigin: clubOrigin.trim()
    });
    setProfileLoading(false);
    showToast('Profil akun berhasil diperbarui!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Digital Member Card */}
      <div className="bg-gradient-to-br from-palette-dark via-palette-darker to-[#091b30] text-white p-6 sm:p-8 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-palette-primary text-white flex items-center justify-center font-black text-2xl border-2 border-white/20 shadow-lg">
              {currentUser?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white">{currentUser.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  currentUser.role === 'superadmin'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    : currentUser.role === 'admin'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <div className="text-xs text-palette-subtle mt-0.5 flex items-center gap-2">
                <span>{currentUser.clubOrigin || 'Komunitas MATE CLUB'}</span>
                <span>•</span>
                <span className="text-amber-300 font-bold">No. #{currentUser.jerseyNumber || '10'}</span>
              </div>
              <div className="text-[11px] text-gray-400 mt-1">{currentUser.phone} • {currentUser.email}</div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full sm:w-auto text-center">
            <button
              onClick={() => setIsTopUpModalOpen(true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 p-2.5 sm:p-3 rounded-2xl transition-all cursor-pointer text-center group"
              title="Klik untuk isi / top up saldo"
            >
              <div className="text-[10px] text-emerald-300 uppercase font-bold flex items-center justify-center gap-1">
                <Wallet className="w-3 h-3 text-emerald-400" /> Saldo Dompet
              </div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-0.5">
                {formatIDR(currentUser.balance || 0)}
              </div>
              <div className="text-[9px] text-emerald-300 font-bold mt-0.5 group-hover:underline flex items-center justify-center gap-0.5">
                <PlusCircle className="w-2.5 h-2.5" /> + Isi Saldo
              </div>
            </button>
            <div className="bg-white/5 border border-white/10 p-2.5 sm:p-3 rounded-2xl">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Caps Main</div>
              <div className="text-base sm:text-lg font-black font-mono text-white mt-0.5">{currentUser.caps || myBookings.length}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-2.5 sm:p-3 rounded-2xl">
              <div className="text-[10px] text-gray-400 uppercase font-bold">Total Gol</div>
              <div className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-0.5">{currentUser.goals || 0}</div>
            </div>
            <div className="bg-white/5 border border-white/10 p-2.5 sm:p-3 rounded-2xl">
              <div className="text-[10px] text-gray-400 uppercase font-bold">MVP Awards</div>
              <div className="text-base sm:text-lg font-black font-mono text-amber-400 mt-0.5">{currentUser.mvpCount || 0}</div>
            </div>
          </div>
        </div>

        {/* Action strip inside header */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {(currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
              <button
                onClick={() => setRole('admin')}
                className="px-3 py-1.5 rounded-xl bg-palette-primary text-white font-bold hover:bg-palette-primaryDark transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Shield className="w-3.5 h-3.5" /> Buka Dashboard Admin
              </button>
            )}
          </div>

          <button
            onClick={() => {
              if (confirm('Keluar dari akun Anda?')) {
                logout();
                showToast('Anda telah keluar dari akun.');
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500/30 font-bold border border-red-500/30 transition-all flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar (Logout)
          </button>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="bg-white p-2 rounded-2xl border border-palette-subtle shadow-card flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'wallet'
              ? 'bg-palette-primary text-white shadow-xs'
              : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Dompet & Saldo ({formatIDR(currentUser.balance || 0)})</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'tickets'
              ? 'bg-palette-primary text-white shadow-xs'
              : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Tiket & Riwayat Match ({myBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-palette-primary text-white shadow-xs'
              : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
          }`}
        >
          <Edit2 className="w-4 h-4" />
          <span>Edit Biodata Akun</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'security'
              ? 'bg-palette-primary text-white shadow-xs'
              : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Keamanan & Password</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: DOMPET & SALDO MATE (CASHBACK KODE UNIK) */}
      {/* ========================================================================= */}
      {activeTab === 'wallet' && (() => {
        const myWalletTxs = getUserWalletTransactions ? getUserWalletTransactions(currentUser.id || currentUser.phone) : [];
        return (
          <div className="space-y-6">
            {/* Visual Digital Wallet Card */}
            <div className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#0f172a] text-white p-6 sm:p-7 rounded-3xl border border-emerald-500/30 shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-400/30 uppercase tracking-wider">
                      MATE CLUB DIGITAL WALLET
                    </span>
                    <span className="text-emerald-300 text-xs">•</span>
                    <span className="text-emerald-200 text-xs font-semibold">Saldo Resmi Pemain</span>
                  </div>
                  <div className="text-xs text-emerald-200/80 font-medium">Total Saldo Aktif</div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-white mt-1 tracking-tight">
                    {formatIDR(currentUser.balance || 0)}
                  </div>
                  <div className="text-xs text-emerald-200/90 mt-2 flex items-center gap-2">
                    <span>Pemilik Akun: <strong>{currentUser.name}</strong></span>
                    <span>•</span>
                    <span className="font-mono">{currentUser.phone}</span>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={() => setIsTopUpModalOpen(true)}
                      className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-950" />
                      <span>+ Isi Saldo Dompet (Top Up)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-black/30 backdrop-blur-xs p-4 rounded-2xl border border-white/10 text-xs max-w-xs space-y-1.5">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Keuntungan Saldo MATE</span>
                  </div>
                  <p className="text-[11px] text-gray-200 leading-relaxed">
                    Saldo dapat digunakan otomatis untuk memotong biaya booking matchday berikutnya atau bayar lunas instan 1-klik!
                  </p>
                </div>
              </div>
            </div>

            {/* Explanatory Info Card */}
            <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-2xl flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs space-y-1">
                <h4 className="font-extrabold text-emerald-950">
                  Bagaimana Saldo Ini Bertambah?
                </h4>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Setiap kali Anda memesan tiket pertandingan dengan 3-digit kode unik transfer (misal <strong>+Rp 312</strong>), seluruh kelebihan kode unik tersebut akan <strong>100% otomatis masuk kembali ke Saldo Dompet</strong> Anda begitu transaksi terverifikasi Lunas oleh sistem.
                </p>
              </div>
            </div>

            {/* Riwayat Mutasi Saldo */}
            <div className="bg-white p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-palette-dark flex items-center gap-2">
                  <History className="w-4 h-4 text-palette-primary" /> Riwayat Mutasi & Transaksi Saldo
                </h3>
                <span className="text-xs font-bold text-gray-400">Total {myWalletTxs.length} Transaksi</span>
              </div>

              {myWalletTxs.length === 0 ? (
                <div className="text-center py-12 text-xs text-gray-500 border-2 border-dashed border-palette-subtle rounded-2xl bg-palette-bg/40">
                  <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <div className="font-bold text-palette-dark">Belum ada riwayat mutasi saldo</div>
                  <p className="mt-1">Kelebihan transfer kode unik pada saat booking akan tercatat otomatis di sini.</p>
                </div>
              ) : (
                <div className="divide-y divide-palette-subtle border border-palette-subtle rounded-2xl overflow-hidden">
                  {myWalletTxs.map((tx) => {
                    const isCredit = tx.type === 'credit';
                    return (
                      <div
                        key={tx.id}
                        className="p-4 bg-white hover:bg-palette-bg/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isCredit ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isCredit ? '+ Saldo Masuk (Cashback)' : '- Saldo Keluar (Pakai)'}
                              </span>
                              {tx.bookingId && (
                                <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                  {tx.bookingId}
                                </span>
                              )}
                            </div>
                            <div className="font-extrabold text-palette-dark mt-1 text-xs">{tx.description}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1.5 font-mono">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(tx.createdAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right pl-12 sm:pl-0">
                          <div className={`text-base font-black font-mono ${
                            isCredit ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {isCredit ? `+${formatIDR(tx.amount)}` : `-${formatIDR(tx.amount)}`}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Saldo akhir: <strong className="font-mono text-gray-600">{formatIDR(tx.balanceAfter)}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* TAB 1: TIKET & RIWAYAT BOOKING */}
      {/* ========================================================================= */}
      {activeTab === 'tickets' && (
        <div className="bg-white p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-palette-dark flex items-center gap-2">
              <Ticket className="w-4 h-4 text-palette-primary" /> Tiket & Riwayat Pertandingan Anda
            </h3>
            <span className="text-xs font-bold text-gray-400">Total {myBookings.length} Match</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 border-2 border-dashed border-palette-subtle rounded-2xl bg-palette-bg/40">
              <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <div className="font-bold text-palette-dark">Belum ada riwayat booking tiket pertandingan</div>
              <p className="mt-1">Pilih jadwal slot game yang tersedia di halaman Jadwal Main.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map(b => {
                const match = getMatchById(b.matchId) || { title: 'Pertandingan Mini Soccer', dateLabel: 'Matchday', timeSlot: '-' };
                const isPaid = b.paymentStatus === 'paid';
                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-2xl bg-palette-bg border border-palette-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-palette-primary/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-palette-primary">{b.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {isPaid ? '✓ Lunas Terverifikasi' : '⏳ Menunggu Verifikasi'}
                        </span>
                        {b.jerseySize && (
                          <span className="px-2 py-0.5 rounded-md bg-white border border-palette-subtle text-[10px] font-bold font-mono">
                            Size: {b.jerseySize}
                          </span>
                        )}
                      </div>
                      <div className="font-extrabold text-xs text-palette-dark">{match.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{match.dateLabel} ({match.timeSlot}) • {b.position}</div>
                    </div>

                    <button
                      onClick={() => setActiveTicketBooking(b)}
                      className="px-4 py-2 bg-palette-primary hover:bg-palette-primaryDark text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                    >
                      Buka E-Ticket
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: EDIT BIODATA AKUN */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          <h3 className="font-black text-base text-palette-dark flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-palette-primary" /> Perbarui Biodata Member
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-palette-dark mb-1">Nomor WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-palette-dark mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-palette-dark mb-1">Posisi Utama Favorit</label>
                <select
                  value={preferredPosition}
                  onChange={(e) => setPreferredPosition(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                >
                  <option value="Pemain Lapangan">Pemain Lapangan (Outfield)</option>
                  <option value="Penjaga Gawang">Penjaga Gawang (Kiper)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-palette-dark mb-1">No. Punggung</label>
                <input
                  type="text"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-palette-dark mb-1">Klub / Komunitas Asal</label>
              <input
                type="text"
                value={clubOrigin}
                onChange={(e) => setClubOrigin(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="px-5 py-2.5 bg-palette-primary text-white font-extrabold rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: KEAMANAN & UBAH PASSWORD */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          <div>
            <h3 className="font-black text-base text-palette-dark flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-palette-primary" /> Keamanan & Ganti Password Akun
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Gunakan kombinasi minimal 6 karakter demi menjaga keamanan akun Anda.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-md">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Password Saat Ini *</label>
              <input
                type="password"
                required
                placeholder="Masukkan password lama"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-palette-dark mb-1">Password Baru *</label>
              <input
                type="password"
                required
                placeholder="Min. 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-palette-dark mb-1">Konfirmasi Password Baru *</label>
              <input
                type="password"
                required
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="px-5 py-2.5 bg-palette-primary text-white font-extrabold rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4" />
              {passwordLoading ? 'Memperbarui...' : 'Perbarui Password Sekarang'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
