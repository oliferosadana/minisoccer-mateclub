import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { formatIDR } from '../../../lib/supabase';
import { 
  X, 
  Users, 
  CheckCircle2, 
  Clock, 
  Phone, 
  CalendarDays, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Copy, 
  Check, 
  Search, 
  ExternalLink,
  UserCheck,
  Award,
  Shirt
} from 'lucide-react';

export const MatchRosterModal = () => {
  const { 
    activeRosterMatch, 
    setActiveRosterMatch, 
    bookings, 
    getVenueById, 
    showToast 
  } = useApp();

  const [tabFilter, setTabFilter] = useState('verified'); // 'verified' | 'all'
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  if (!activeRosterMatch) return null;

  const venue = getVenueById(activeRosterMatch.fieldId);
  const matchBookings = bookings.filter(b => b.matchId === activeRosterMatch.id);
  const rawPlayers = activeRosterMatch.registeredPlayers || [];

  // Combine and deduplicate players from match.registeredPlayers and matchBookings
  const playerMap = new Map();

  // Add from registeredPlayers
  rawPlayers.forEach((p, idx) => {
    const key = p.phone || p.id || `player-${idx}`;
    const matchingBooking = matchBookings.find(b => b.phone === p.phone || b.id === p.id);
    playerMap.set(key, {
      id: p.id || matchingBooking?.id || `RP-${idx + 1}`,
      name: p.name || matchingBooking?.playerName || 'Pemain Anonim',
      phone: p.phone || matchingBooking?.phone || '-',
      pos: p.pos || matchingBooking?.position || 'Pemain Lapangan',
      jerseySize: p.jerseySize || matchingBooking?.jerseySize || 'L',
      fee: p.fee || matchingBooking?.amount || (p.pos?.toLowerCase().includes('gawang') ? activeRosterMatch.keeperFee : activeRosterMatch.playerFee) || 0,
      status: p.status || matchingBooking?.paymentStatus || 'waiting_verification',
      paymentMethod: matchingBooking?.paymentMethod || (p.status === 'paid' ? 'QRIS GoPay (Auto Verified)' : 'Transfer Bank'),
      ticketCode: matchingBooking?.ticketCode || `TK-${(p.name || 'USER').toUpperCase().slice(0, 4)}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: matchingBooking?.createdAt || activeRosterMatch.createdAt || new Date().toISOString()
    });
  });

  // Add from bookings if not yet in playerMap
  matchBookings.forEach((b, idx) => {
    const key = b.phone || b.id || `booking-${idx}`;
    if (!playerMap.has(key)) {
      playerMap.set(key, {
        id: b.id,
        name: b.playerName,
        phone: b.phone,
        pos: b.position || 'Pemain Lapangan',
        jerseySize: b.jerseySize || 'L',
        fee: b.amount || 0,
        status: b.paymentStatus || 'waiting_verification',
        paymentMethod: b.paymentMethod || 'QRIS GoPay',
        ticketCode: b.ticketCode || b.id,
        createdAt: b.createdAt
      });
    }
  });

  const allPlayers = Array.from(playerMap.values());
  const verifiedPlayers = allPlayers.filter(p => p.status === 'paid');
  const pendingPlayers = allPlayers.filter(p => p.status !== 'paid');

  const displayedPlayers = (tabFilter === 'verified' ? verifiedPlayers : allPlayers).filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.pos.toLowerCase().includes(q) ||
      (p.jerseySize && p.jerseySize.toLowerCase().includes(q)) ||
      (p.ticketCode && p.ticketCode.toLowerCase().includes(q))
    );
  });

  const totalSlots = activeRosterMatch.totalSlots || 24;
  const verifiedFieldPlayers = verifiedPlayers.filter(p => !p.pos?.toLowerCase().includes('gawang')).length;
  const verifiedGoalkeepers = verifiedPlayers.filter(p => p.pos?.toLowerCase().includes('gawang')).length;
  const totalVerifiedRevenue = verifiedPlayers.reduce((sum, p) => sum + Number(p.fee || 0), 0);
  const remainingSlots = Math.max(0, totalSlots - verifiedPlayers.length);

  // Calculate Jersey Sizes Breakdown
  const jerseyCounts = verifiedPlayers.reduce((acc, p) => {
    const sz = p.jerseySize || 'L';
    acc[sz] = (acc[sz] || 0) + 1;
    return acc;
  }, {});

  // Copy roster to WhatsApp friendly format
  const handleCopyRosterWA = () => {
    const fieldList = verifiedPlayers.filter(p => !p.pos?.toLowerCase().includes('gawang'));
    const gkList = verifiedPlayers.filter(p => p.pos?.toLowerCase().includes('gawang'));

    let text = `⚽ *ROSTER PEMAIN TERVERIFIKASI SISTEM*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `🏆 *${activeRosterMatch.title}*\n`;
    text += `📅 *Jadwal:* ${activeRosterMatch.dateLabel || activeRosterMatch.date} (${activeRosterMatch.timeSlot})\n`;
    text += `🏟️ *Venue:* ${venue?.name || 'Balikpapan Mini Soccer'}\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `🧤 *PENJAGA GAWANG (${gkList.length} Pemain):*\n`;
    if (gkList.length === 0) {
      text += `_Belum ada kiper terdaftar_\n`;
    } else {
      gkList.forEach((p, i) => {
        text += `${i + 1}. ${p.name} [Size: ${p.jerseySize || 'L'}] ✅ (Lunas - ${p.ticketCode})\n`;
      });
    }

    text += `\n🏃 *PEMAIN LAPANGAN (${fieldList.length} Pemain):*\n`;
    if (fieldList.length === 0) {
      text += `_Belum ada pemain lapangan terdaftar_\n`;
    } else {
      fieldList.forEach((p, i) => {
        text += `${i + 1}. ${p.name} [Size: ${p.jerseySize || 'L'}] ✅ (Lunas - ${p.ticketCode})\n`;
      });
    }

    // Jersey summary
    const sizeSummary = ['S', 'M', 'L', 'XL', 'XXL']
      .filter(s => jerseyCounts[s])
      .map(s => `${s}: ${jerseyCounts[s]} pcs`)
      .join(', ');

    if (sizeSummary) {
      text += `\n👕 *Rekap Ukuran Rompi/Jersey Matchday:*\n${sizeSummary}\n`;
    }

    text += `\n📊 *Ringkasan Keterisian:* ${verifiedPlayers.length}/${totalSlots} Slot (${remainingSlots} Sisa Slot)\n`;
    text += `Terverifikasi otomatis via MateClub Mini Soccer Management.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Daftar roster WhatsApp & ukuran baju berhasil disalin ke clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const getWaLink = (phone, name, size) => {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    const msg = encodeURIComponent(`Halo Bro ${name}, konfirmasi slot main untuk jadwal "${activeRosterMatch.title}" (${activeRosterMatch.dateLabel || activeRosterMatch.date} - ${activeRosterMatch.timeSlot}). Tiket Anda sudah TERVERIFIKASI SISTEM (Ukuran Baju/Rompi: Size ${size || 'L'}). Sampai jumpa di lapangan! ⚽👕`);
    return `https://wa.me/${clean}?text=${msg}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden flex flex-col relative animate-scale-up">
        
        {/* Header Modal */}
        <div className="bg-palette-dark text-white p-4 sm:p-5 flex items-center justify-between border-b border-palette-primaryDark">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-palette-primary/20 border border-palette-primary/40 flex items-center justify-center text-palette-primary">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Daftar Pemain & Roster Terverifikasi
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-extrabold border border-emerald-500/30">
                  {verifiedPlayers.length} Lunas
                </span>
              </div>
              <p className="text-[11px] text-gray-300 flex items-center gap-2 mt-0.5">
                <span>{activeRosterMatch.title}</span>
                <span>•</span>
                <span className="font-mono text-palette-primary">{activeRosterMatch.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRosterWA}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
              title="Salin daftar pemain untuk dibagikan ke WhatsApp group"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Tersalin!' : 'Salin WA Roster'}
            </button>
            <button
              onClick={() => setActiveRosterMatch(null)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Match Quick Info Strip */}
        <div className="bg-palette-bg/80 border-b border-palette-subtle px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-palette-primary" />
              <span className="font-bold text-palette-dark">{activeRosterMatch.dateLabel || activeRosterMatch.date}</span>
              <span className="text-gray-400">({activeRosterMatch.timeSlot})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-palette-primary" />
              <span className="font-semibold text-palette-dark">{venue?.name || 'Lapangan Mini Soccer'}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pemain: <strong>{formatIDR(activeRosterMatch.playerFee || activeRosterMatch.slotFee)}</strong></span>
              {activeRosterMatch.keeperFee && (
                <span className="text-emerald-700 ml-1">(Kiper: <strong>{formatIDR(activeRosterMatch.keeperFee)}</strong>)</span>
              )}
            </div>
          </div>

          <button
            onClick={handleCopyRosterWA}
            className="sm:hidden flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px]"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} Salin WA
          </button>
        </div>

        {/* Stats Overview Cards */}
        <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border-b border-palette-subtle">
          <div className="bg-palette-bg p-3 rounded-2xl border border-palette-subtle">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Terverifikasi Sistem</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-emerald-600 font-mono">{verifiedPlayers.length}</span>
              <span className="text-xs text-gray-500 font-bold">/ {totalSlots} Slot</span>
            </div>
          </div>

          <div className="bg-palette-bg p-3 rounded-2xl border border-palette-subtle">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Posisi Roster</span>
            <div className="flex items-center gap-2 mt-1 text-xs font-bold text-palette-dark">
              <span>🏃 {verifiedFieldPlayers} Lapangan</span>
              <span>•</span>
              <span className="text-emerald-700">🧤 {verifiedGoalkeepers} GK</span>
            </div>
          </div>

          <div className="bg-palette-bg p-3 rounded-2xl border border-palette-subtle">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block flex items-center gap-1">
              <Shirt className="w-3 h-3 text-palette-primary" />
              <span>Rekap Ukuran Rompi</span>
            </span>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {['S', 'M', 'L', 'XL', 'XXL'].map(size => {
                const count = jerseyCounts[size] || 0;
                return (
                  <span
                    key={size}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      count > 0 
                        ? 'bg-palette-primary/10 text-palette-primary border border-palette-primary/20' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {size}:{count}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-palette-bg p-3 rounded-2xl border border-palette-subtle">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Total Dana Terverifikasi</span>
            <div className="text-base sm:text-lg font-black text-palette-dark font-mono mt-1 truncate">
              {formatIDR(totalVerifiedRevenue)}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 pb-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs Filter */}
          <div className="flex items-center gap-1 bg-palette-bg p-1 rounded-xl border border-palette-subtle text-xs font-bold self-start">
            <button
              onClick={() => setTabFilter('verified')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                tabFilter === 'verified' ? 'bg-white text-emerald-700 shadow-xs font-extrabold' : 'text-gray-500 hover:text-palette-dark'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Terverifikasi Lunas ({verifiedPlayers.length})
            </button>
            <button
              onClick={() => setTabFilter('all')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                tabFilter === 'all' ? 'bg-white text-palette-primary shadow-xs font-extrabold' : 'text-gray-500 hover:text-palette-dark'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Semua Pendaftar ({allPlayers.length})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama, WA, ukuran baju, tiket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
            />
          </div>
        </div>

        {/* Players List Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {displayedPlayers.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-palette-subtle rounded-2xl bg-palette-bg/40">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h4 className="font-bold text-sm text-palette-dark">
                {tabFilter === 'verified' 
                  ? 'Belum ada pemain yang terverifikasi sistem' 
                  : 'Belum ada data pendaftar pada jadwal ini'}
              </h4>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                {tabFilter === 'verified'
                  ? 'Pemain yang melakukan pembayaran otomatis via QRIS GoPay atau transfer bank yang telah tervalidasi akan otomatis muncul di sini.'
                  : 'Slot pertandingan ini masih terbuka untuk pemesanan publik.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-palette-subtle bg-white">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-palette-bg/90 border-b border-palette-subtle text-gray-500 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 text-center w-10">No</th>
                    <th className="py-2.5 px-3">Nama Pemain & Kontak</th>
                    <th className="py-2.5 px-3">Posisi</th>
                    <th className="py-2.5 px-3 text-center">Ukuran Baju</th>
                    <th className="py-2.5 px-3">Kode Tiket</th>
                    <th className="py-2.5 px-3">Biaya Slot</th>
                    <th className="py-2.5 px-3">Status Verifikasi</th>
                    <th className="py-2.5 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-palette-subtle">
                  {displayedPlayers.map((player, idx) => {
                    const isGK = player.pos?.toLowerCase().includes('gawang');
                    const isPaid = player.status === 'paid';
                    const size = player.jerseySize || 'L';

                    return (
                      <tr key={player.id || idx} className="hover:bg-palette-bg/50 transition-colors">
                        {/* No */}
                        <td className="py-3 px-3 text-center font-mono font-bold text-gray-400">
                          {idx + 1}
                        </td>

                        {/* Player Info */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                              isGK 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}>
                              {player.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-palette-dark text-xs">{player.name}</div>
                              <div className="text-[10px] text-gray-500 flex items-center gap-1 font-mono">
                                <Phone className="w-3 h-3 text-gray-400" />
                                <span>{player.phone}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Posisi */}
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            isGK
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {isGK ? '🧤 Kiper (GK)' : '🏃 Pemain Lapangan'}
                          </span>
                        </td>

                        {/* Ukuran Baju */}
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-palette-bg text-palette-dark font-mono font-black text-[11px] border border-palette-subtle shadow-2xs">
                            <Shirt className="w-3 h-3 text-palette-primary" />
                            <span>{size}</span>
                          </span>
                        </td>

                        {/* Kode Tiket */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-[11px] font-bold text-palette-primary bg-palette-bg px-2 py-0.5 rounded border border-palette-subtle">
                            {player.ticketCode || player.id}
                          </span>
                        </td>

                        {/* Biaya */}
                        <td className="py-3 px-3 font-mono font-bold text-palette-dark">
                          <div>{formatIDR(player.fee)}</div>
                          <span className="text-[9px] text-gray-500 font-normal block truncate max-w-[120px]">
                            {player.paymentMethod}
                          </span>
                        </td>

                        {/* Status Verifikasi */}
                        <td className="py-3 px-3">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200 shadow-2xs">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Terverifikasi Sistem
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] border border-amber-200">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu Verifikasi
                            </span>
                          )}
                        </td>

                        {/* Action WhatsApp */}
                        <td className="py-3 px-3 text-right">
                          {player.phone && player.phone !== '-' ? (
                            <a
                              href={getWaLink(player.phone, player.name, size)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] border border-emerald-200 transition-all"
                              title="Kirim pesan WhatsApp ke pemain ini"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span className="hidden md:inline">Chat WA</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-[10px]">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-palette-bg border-t border-palette-subtle px-4 sm:px-6 py-3 flex items-center justify-between gap-3 text-xs">
          <div className="text-gray-500 text-[11px] hidden sm:block">
            Menampilkan <strong>{displayedPlayers.length}</strong> pemain terdaftar.
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setActiveRosterMatch(null)}
              className="px-4 py-2 bg-white text-palette-dark font-extrabold rounded-xl border border-palette-subtle hover:bg-palette-subtle transition-all shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
