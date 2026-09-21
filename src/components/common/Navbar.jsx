import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../lib/supabase';
import { 
  Calendar, 
  Search, 
  MapPin, 
  Users, 
  User, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  Sparkles,
  ChevronDown,
  Wallet
} from 'lucide-react';

export const Navbar = () => {
  const { role, setRole, publicTab, setPublicTab } = useApp();
  const { currentUser, logout, openLogin, openRegister, switchDemoAccount, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-palette-subtle shadow-xs">
      {/* Top Banner Notice - Clean Anti-Slop */}
      <div className="bg-palette-dark text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2 border-b border-palette-darker">
        <span className="text-palette-subtle font-mono text-[11px] uppercase tracking-wider">MATE CLUB BALIKPAPAN</span>
        <span className="hidden md:inline text-gray-500">•</span>
        <span className="hidden md:inline text-gray-300">Sistem Reservasi Matchday Mini Soccer & Komunitas Terbuka</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setRole('public'); setPublicTab('schedule'); }}>
            <img 
              src="/logo.png" 
              alt="MATE CLUB Balikpapan" 
              className="h-10 w-auto object-contain drop-shadow-xs" 
            />
            <div>
              <div className="font-extrabold text-base tracking-tight text-palette-dark leading-none">
                MATE CLUB
              </div>
              <div className="text-[11px] text-gray-500 font-medium mt-0.5">Mini Soccer Management</div>
            </div>
          </div>

          {/* Navigation Links for Public */}
          {role === 'public' && (
            <nav className="hidden md:flex items-center gap-1 bg-palette-bg p-1 rounded-xl border border-palette-subtle">
              <button
                onClick={() => setPublicTab('schedule')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  publicTab === 'schedule'
                    ? 'bg-white text-palette-primary shadow-xs'
                    : 'text-gray-600 hover:text-palette-dark'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Jadwal Game
              </button>
              <button
                onClick={() => setPublicTab('tracker')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  publicTab === 'tracker'
                    ? 'bg-white text-palette-primary shadow-xs'
                    : 'text-gray-600 hover:text-palette-dark'
                }`}
              >
                <Search className="w-3.5 h-3.5" /> Cek Tiket
              </button>
              <button
                onClick={() => setPublicTab('venues')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  publicTab === 'venues'
                    ? 'bg-white text-palette-primary shadow-xs'
                    : 'text-gray-600 hover:text-palette-dark'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" /> Venue Lapangan
              </button>
              <button
                onClick={() => setPublicTab('community')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  publicTab === 'community'
                    ? 'bg-white text-palette-primary shadow-xs'
                    : 'text-gray-600 hover:text-palette-dark'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Komunitas & Klasemen
              </button>
            </nav>
          )}

          {/* Right Action Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Role Switcher Button - Hanya Tampil untuk Admin & Superadmin */}
            {isAdmin && (
              role === 'public' ? (
                <button
                  onClick={() => setRole('admin')}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-palette-dark text-white hover:bg-palette-darker transition-all shadow-xs"
                  title="Buka Admin Control Panel"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Admin Hub</span>
                </button>
              ) : (
                <button
                  onClick={() => setRole('public')}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-palette-bg text-palette-dark border border-palette-subtle hover:bg-white transition-all shadow-xs"
                >
                  <User className="w-3.5 h-3.5 text-palette-primary" />
                  <span className="hidden sm:inline">Mode Pemain</span>
                </button>
              )
            )}

            {/* Auth Buttons & User Saldo */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Saldo Dompet Pill */}
                <button
                  onClick={() => { setRole('public'); setPublicTab('profile'); }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200 transition-all font-mono text-xs font-black shadow-2xs cursor-pointer"
                  title="Saldo Dompet MATE Anda (Klik untuk lihat mutasi)"
                >
                  <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline font-sans text-[11px] text-emerald-700 font-semibold">Saldo:</span>
                  <span>{formatIDR(currentUser.balance || 0)}</span>
                </button>

                <button
                  onClick={() => { setRole('public'); setPublicTab('profile'); }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-palette-bg hover:bg-white border border-palette-subtle transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-palette-primary text-white flex items-center justify-center font-bold text-xs">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <div className="text-xs font-bold text-palette-dark leading-tight">
                      {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
                    </div>
                    <div className="text-[10px] text-gray-500 capitalize">{currentUser?.role || 'player'}</div>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={openLogin}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-palette-primary hover:bg-palette-subtle/40 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" /> Masuk
                </button>
                <button
                  onClick={openRegister}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg bg-palette-primary text-white hover:bg-palette-primaryDark transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Daftar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation for Public */}
      {role === 'public' && (
        <div className="md:hidden flex items-center justify-around bg-white border-t border-palette-subtle py-2 px-2 text-[11px] font-bold text-gray-600">
          <button
            onClick={() => setPublicTab('schedule')}
            className={`flex flex-col items-center gap-0.5 ${publicTab === 'schedule' ? 'text-palette-primary font-black' : ''}`}
          >
            <Calendar className="w-4 h-4" /> Jadwal
          </button>
          <button
            onClick={() => setPublicTab('tracker')}
            className={`flex flex-col items-center gap-0.5 ${publicTab === 'tracker' ? 'text-palette-primary font-black' : ''}`}
          >
            <Search className="w-4 h-4" /> Cek Tiket
          </button>
          <button
            onClick={() => setPublicTab('venues')}
            className={`flex flex-col items-center gap-0.5 ${publicTab === 'venues' ? 'text-palette-primary font-black' : ''}`}
          >
            <MapPin className="w-4 h-4" /> Lapangan
          </button>
          <button
            onClick={() => setPublicTab('community')}
            className={`flex flex-col items-center gap-0.5 ${publicTab === 'community' ? 'text-palette-primary font-black' : ''}`}
          >
            <Users className="w-4 h-4" /> Komunitas
          </button>
          <button
            onClick={() => setPublicTab('profile')}
            className={`flex flex-col items-center gap-0.5 ${publicTab === 'profile' ? 'text-palette-primary font-black' : ''}`}
          >
            <User className="w-4 h-4" /> Profil
          </button>
        </div>
      )}
    </header>
  );
};
