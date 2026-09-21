import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Gauge, 
  FileCheck2, 
  CalendarDays, 
  MapPin, 
  UserCheck, 
  ListChecks, 
  Handshake, 
  Bot, 
  PlusCircle, 
  RotateCcw,
  User,
  CreditCard,
  Users,
  MessageSquare,
  ShieldAlert,
  Newspaper,
  Landmark
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = () => {
  const { 
    adminSection, 
    setAdminSection, 
    setRole, 
    matches, 
    bookings, 
    venues, 
    referees, 
    facilities, 
    bankAccounts = [],
    resetDemoData, 
    setActiveMatchEdit,
    communityPosts = [],
    standingsClubs = []
  } = useApp();
  const { currentUser, isSuperAdmin, allUsers } = useAuth();

  const pendingBookingsCount = bookings.filter(b => b.paymentStatus === 'waiting_verification').length;
  const activeBanksCount = bankAccounts.filter(b => b.isActive).length;

  const operationalNavItems = [
    { id: 'overview', label: 'Overview (Mode Pantau)', icon: Gauge },
    { id: 'bookings', label: 'Validasi Transaksi', icon: FileCheck2, badge: pendingBookingsCount, badgeColor: 'bg-red-500 text-white' },
    { id: 'bank_accounts', label: 'Rekening Bank Manual', icon: Landmark, badge: activeBanksCount, badgeColor: 'bg-emerald-600 text-white' },
    { id: 'matches', label: 'Jadwal & Slot Game', icon: CalendarDays, badge: matches.length },
    { id: 'content_management', label: 'Manajemen Konten', icon: Newspaper, badge: communityPosts.length + standingsClubs.length, badgeColor: 'bg-emerald-600 text-white' },
    { id: 'venues', label: 'Venue Lapangan', icon: MapPin, badge: venues.length },
    { id: 'officials', label: 'Wasit & Fotografer', icon: UserCheck, badge: referees.length },
    { id: 'facilities', label: 'Manajemen Fasilitas', icon: ListChecks, badge: facilities.length, badgeColor: 'bg-palette-primary text-white' },
    { id: 'sponsors', label: 'Mitra Sponsor', icon: Handshake },
    { id: 'tools', label: 'WA Bot & Tools', icon: Bot }
  ];

  const superadminNavItems = [
    { id: 'payment_gateways', label: 'Payment Gateway', icon: CreditCard, superBadge: 'SUPER' },
    { id: 'users', label: 'Kelola User & Role', icon: Users, badge: allUsers.length, badgeColor: 'bg-purple-700 text-white' },
    { id: 'whatsapp_gateway', label: 'WAHA Gateway', icon: MessageSquare, superBadge: 'WAHA' }
  ];

  return (
    <aside className="w-full lg:w-64 bg-white rounded-3xl border border-palette-subtle shadow-card p-4 sm:p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-5">
        {/* Admin Profile Widget */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-palette-bg border border-palette-subtle">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base shadow-xs text-white ${
            isSuperAdmin ? 'bg-purple-800' : 'bg-palette-dark'
          }`}>
            {isSuperAdmin ? '👑' : '🛡️'}
          </div>
          <div className="truncate">
            <div className="font-extrabold text-xs text-palette-dark truncate">
              {currentUser?.name || 'Admin Panel'}
            </div>
            <div className="text-[10px] font-bold mt-0.5 flex items-center gap-1">
              <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider font-extrabold ${
                isSuperAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {currentUser?.role || 'admin'}
              </span>
              <span className="text-gray-400">• Balikpapan</span>
            </div>
          </div>
        </div>

        {/* Superadmin Exclusive Section */}
        {isSuperAdmin && (
          <div className="p-2.5 rounded-2xl bg-purple-50/70 border border-purple-200/80">
            <div className="text-[9px] font-black text-purple-900 uppercase tracking-wider px-1.5 mb-1.5 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-purple-700" /> KONTROL SUPERADMIN
            </div>
            <nav className="space-y-1">
              {superadminNavItems.map(item => {
                const Icon = item.icon;
                const isActive = adminSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminSection(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-purple-950 hover:bg-purple-100/80'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-purple-700'}`} />
                      <span className="truncate whitespace-nowrap text-[11px]">{item.label}</span>
                    </div>
                    {item.badge !== undefined ? (
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black shrink-0 ${
                        isActive ? 'bg-white text-purple-700' : item.badgeColor
                      }`}>
                        {item.badge}
                      </span>
                    ) : item.superBadge ? (
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                        isActive ? 'bg-white text-purple-700' : 'bg-purple-200 text-purple-900'
                      }`}>
                        {item.superBadge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Operational Navigation Menu Links */}
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2">
            MODUL OPERASIONAL
          </div>
          <nav className="space-y-1">
            {operationalNavItems.map(item => {
              const Icon = item.icon;
              const isActive = adminSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setAdminSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-palette-primary text-white shadow-xs'
                      : 'text-gray-600 hover:bg-palette-bg hover:text-palette-dark'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-palette-primary'}`} />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black shrink-0 ${
                      isActive
                        ? 'bg-white text-palette-primary'
                        : item.badgeColor || 'bg-palette-bg text-palette-dark border border-palette-subtle'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Action Widget */}
        <div className="pt-2 border-t border-palette-subtle space-y-2">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-1">
            AKSI CEPAT
          </div>
          <button
            onClick={() => {
              setActiveMatchEdit({ isNew: true });
            }}
            className="w-full py-2 px-3 bg-palette-primary text-white font-bold text-xs rounded-xl hover:bg-palette-primaryDark shadow-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Terbitkan Slot Game
          </button>
          <button
            onClick={resetDemoData}
            className="w-full py-2 px-3 bg-palette-bg hover:bg-palette-subtle text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle flex items-center justify-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Demo Data
          </button>
        </div>
      </div>

      {/* Back to Public button */}
      <div className="pt-6">
        <button
          onClick={() => setRole('public')}
          className="w-full py-2.5 px-3 bg-palette-bg hover:bg-white text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle flex items-center justify-center gap-1.5 transition-all shadow-xs"
        >
          <User className="w-3.5 h-3.5 text-palette-primary" /> Kembali ke Tampilan Pemain
        </button>
      </div>
    </aside>
  );
};
