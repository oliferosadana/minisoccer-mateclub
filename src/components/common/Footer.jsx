import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Heart, MapPin } from 'lucide-react';

export const Footer = () => {
  const { venues } = useApp();

  const activeVenues = (venues && venues.length > 0)
    ? venues.filter(v => !v.status || v.status === 'active')
    : [];

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
            <div className="flex items-center gap-2 mb-3">
              <h4 className="font-bold text-sm text-palette-subtle uppercase tracking-wider text-[11px]">Jangkauan Venue</h4>
              {activeVenues.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold border border-emerald-500/30">
                  {activeVenues.length} Lapangan
                </span>
              )}
            </div>
            <ul className="space-y-2.5 text-gray-300">
              {activeVenues.length > 0 ? (
                activeVenues.map((v) => (
                  <li key={v.id || v.name} className="group">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-medium text-white/95 group-hover:text-emerald-300 transition-colors">
                          {v.name}
                        </div>
                        {v.location && (
                          <div className="text-[10px] text-gray-400">
                            {v.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-400 italic text-[11px]">Memuat daftar venue...</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-palette-subtle mb-3 uppercase tracking-wider text-[11px]">Kontak & Bantuan</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a
                  href="https://wa.me/6281251234567"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-emerald-400 font-bold">WA:</span> 0812-5123-4567
                </a>
              </li>
              <li>
                <a
                  href="mailto:halo@mateclub.id"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-gray-400 font-bold">Email:</span> halo@mateclub.id
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/mateclub.bpp"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-purple-400 transition-colors flex items-center gap-1.5"
                >
                  <span className="text-purple-400 font-bold">IG:</span> @mateclub.bpp
                </a>
              </li>
              <li className="text-gray-400 text-[11px] pt-1 border-t border-white/5">
                Balikpapan, Kalimantan Timur
              </li>
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
