import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bot, FileSpreadsheet, Printer, Send, MessageSquare, Check, Sparkles } from 'lucide-react';

export const ToolsSection = () => {
  const { bookings, matches, venues, showToast } = useApp();
  const [template, setTemplate] = useState('ticket_confirmed');
  const [targetPhone, setTargetPhone] = useState('081234567890');

  const latestBooking = bookings[0] || { id: 'BK-260920-001', playerName: 'Budi Santoso', ticketCode: 'TK-8891' };
  const match = matches[0] || { title: 'Sunset Fun Football', dateLabel: 'Minggu, 20 Sep 2026', timeSlot: '16:30 WITA' };
  const venue = venues[0] || { name: 'Balikpapan Soccer Field' };

  let previewMsg = '';
  if (template === 'ticket_confirmed') {
    previewMsg = `Halo *${latestBooking.playerName}*! ⚽\n\nPembayaran slot pertandinganmu telah *LUNAS & TERKONFIRMASI*.\n\n📋 *Rincian Tiket Pertandingan:*\n• Booking ID: *${latestBooking.id}*\n• Kode Tiket: *${latestBooking.ticketCode}*\n• Game: ${match.title}\n• Waktu: ${match.dateLabel} (${match.timeSlot})\n• Venue: ${venue.name}\n\nHarap tunjukkan Kode Tiket kepada panitia saat tiba di lapangan. Sampai jumpa di lapangan!\n\n_MATE CLUB Balikpapan_`;
  } else if (template === 'h1_reminder') {
    previewMsg = `🔔 *PENGINGAT MATCHDAY H-1* 🔔\n\nHalo *${latestBooking.playerName}*, game sepak bolamu dijadwalkan besok!\n\n📅 Tanggal: *${match.dateLabel}*\n⏰ Jam: *${match.timeSlot}*\n📍 Venue: *${venue.name}*\n\n💡 *Tips Penting:*\n1. Datang 15 menit lebih awal untuk pemanasan & pembagian rompi.\n2. Bawa sepatu mini soccer (TF/AG) & pelindung tulang kering.\n3. Air mineral dan wasit telah disiapkan panitia.\n\n_MATE CLUB Balikpapan_`;
  } else if (template === 'photos_ready') {
    previewMsg = `📸 *FOTO MATCH HD SUDAH SIAP!* 📸\n\nHalo *${latestBooking.playerName}*! Terima kasih sudah berpartisipasi di sesi *${match.title}*.\n\nDokumentasi foto aksi resolusi tinggi sudah diunggah oleh fotografer resmi. Kamu bisa mengunduhnya di:\n👉 https://photos.google.com/mateclub-balikpapan\n\nJangan lupa tag kami di IG *@mateclub.bpp*! Sampai ketemu di game berikutnya! ⚽🔥`;
  }

  const exportCSV = () => {
    let csv = "Booking ID,Nama Pemain,Phone,Posisi,Nominal,Status,Kode Tiket,Tanggal\n";
    bookings.forEach(b => {
      csv += `"${b.id}","${b.playerName}","${b.phone}","${b.position}","${b.amount}","${b.paymentStatus}","${b.ticketCode}","${b.createdAt}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MATECLUB_Bookings_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data booking berhasil di-export ke format CSV!');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WhatsApp Bot Notification Engine */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
              💬
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-palette-dark">WhatsApp Bot Notification Simulator</h3>
              <p className="text-[11px] text-gray-500">Kirim template pengingat tiket, H-1, atau link foto ke pemain.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Pilih Template Pesan</label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:border-palette-primary outline-none"
              >
                <option value="ticket_confirmed">Konfirmasi Tiket Lunas & QR</option>
                <option value="h1_reminder">Pengingat H-1 Matchday</option>
                <option value="photos_ready">Pemberitahuan Album Foto HD Siap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Nomor WhatsApp Tujuan</label>
              <input
                type="tel"
                value={targetPhone}
                onChange={(e) => setTargetPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:border-palette-primary outline-none"
              />
            </div>

            {/* WA Preview Bubble */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1">Preview Tampilan Pesan:</label>
              <div className="bg-[#E5DDD5] p-3.5 rounded-2xl border border-gray-300 text-xs font-sans text-gray-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-xs border border-gray-200">
                  {previewMsg}
                </div>
              </div>
            </div>

            <a
              href={`https://wa.me/${targetPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(previewMsg)}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Send className="w-4 h-4" /> Buka & Kirim via WhatsApp Web / App
            </a>
          </div>
        </div>

        {/* Export & Print Reports Card */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-palette-subtle shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-palette-primary/10 text-palette-primary flex items-center justify-center font-bold text-lg">
                📊
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-palette-dark">Export & Laporan Keuangan</h3>
                <p className="text-[11px] text-gray-500">Download data transaksi untuk pembukuan panitia.</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-palette-bg border border-palette-subtle space-y-2">
                <div className="font-bold text-palette-dark">Export Format Excel / CSV</div>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Unduh seluruh daftar transaksi booking, detail pemain, nomor telepon, nominal, dan status pembayaran dalam satu file CSV.
                </p>
                <button
                  onClick={exportCSV}
                  className="py-2 px-3.5 bg-palette-primary hover:bg-palette-primaryDark text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Download CSV Transaksi
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-palette-bg border border-palette-subtle space-y-2">
                <div className="font-bold text-palette-dark">Cetak Ringkasan Matchday</div>
                <p className="text-gray-500 text-[11px] leading-relaxed">
                  Cetak daftar hadir roster pemain matchday untuk diserahkan ke wasit dan panitia lapangan.
                </p>
                <button
                  onClick={() => window.print()}
                  className="py-2 px-3.5 bg-palette-dark hover:bg-palette-darker text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Cetak / Print Ringkasan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
