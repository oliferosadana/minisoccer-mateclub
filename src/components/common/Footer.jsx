import React from 'react';
import { ShieldCheck, Heart, Sparkles } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-palette-dark text-white border-t border-palette-darker mt-16 pt-10 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/logo.png"
                alt="MATE CLUB Balikpapan"
                className="h-10 w-auto object-contain bg-white/10 p-1.5 rounded-xl border border-white/10"
              />
              <span className="font-bold text-base tracking-tight">MATE CLUB BALIKPAPAN</span>
            </div>
            <p className="text-gray-300 max-w-sm leading-relaxed mb-4">
              Platform ekosistem komunitas sepak bola & mini soccer terbesar di Balikpapan. Menghubungkan solo player, tim amatir, wasit profesional, fotografer pro, dan venue rekanan.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" /> Sistem Pembayaran Terverifikasi & Bebas Calo
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm text-palette-subtle mb-3 uppercase tracking-wider text-[11px]">Jangkauan Venue</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Balikpapan Soccer Field (BSF)</li>
              <li>Borneo Mini Stadium Ringroad</li>
              <li>Batakan Mini Soccer Arena</li>
              <li>Sepinggan Pratama Stadium</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-palette-subtle mb-3 uppercase tracking-wider text-[11px]">Kontak & Bantuan</h4>
            <ul className="space-y-2 text-gray-300">
              <li>WhatsApp Admin: 0812-5123-4567</li>
              <li>Email: halo@mateclub.id</li>
              <li>Instagram: @mateclub.bpp</li>
              <li>Balikpapan, Kalimantan Timur</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-400 text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} MATE CLUB Mini Soccer Ecosystem. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Balikpapan Football Enthusiasts
          </div>
        </div>
      </div>
    </footer>
  );
};
