import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { MapPin, Check, ExternalLink, CalendarPlus, ShieldCheck } from 'lucide-react';

export const VenueListView = () => {
  const { venues, setPublicTab, setActiveBookingMatch, matches } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-palette-subtle shadow-card text-center max-w-3xl mx-auto">
        <div className="w-12 h-12 bg-palette-primary/10 text-palette-primary rounded-2xl flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-palette-dark">Venue & Lapangan Rekanan MATE CLUB</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
          Daftar lapangan mini soccer berstandar nasional dan bersertifikasi FIFA di wilayah Balikpapan dan sekitarnya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {venues.map(v => (
          <div key={v.id} className="bg-white rounded-3xl border border-palette-subtle shadow-card overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={v.image}
                  alt={v.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500 text-white inline-block mb-1">
                    ✓ Standar Nasional
                  </span>
                  <h3 className="font-extrabold text-base text-white">{v.name}</h3>
                  <div className="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-palette-subtle" /> {v.location}
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                {/* Rate details */}
                <div className="grid grid-cols-3 gap-2 bg-palette-bg p-3 rounded-2xl border border-palette-subtle text-center text-xs">
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Sewa / Jam</div>
                    <div className="font-black text-palette-dark font-mono mt-0.5">{formatIDR(v.ratePerHour)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Slot Pemain</div>
                    <div className="font-black text-palette-primary font-mono mt-0.5">{formatIDR(v.playerSlotFee)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Slot Kiper</div>
                    <div className="font-black text-emerald-700 font-mono mt-0.5">{formatIDR(v.keeperSlotFee)}</div>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {v.specs}
                </p>

                {/* Facilities List */}
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fasilitas Venue:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(v.facilities || []).map((fac, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-palette-bg text-[10px] font-semibold text-gray-700 border border-palette-subtle">
                        <Check className="w-3 h-3 text-emerald-600" /> {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(v.name + ' ' + v.location)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 bg-palette-bg hover:bg-palette-subtle text-palette-dark text-xs font-bold rounded-xl border border-palette-subtle text-center flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Peta Google Maps
              </a>
              <button
                onClick={() => setPublicTab('schedule')}
                className="flex-1 py-2.5 px-3 bg-palette-primary hover:bg-palette-primaryDark text-white text-xs font-bold rounded-xl text-center shadow-xs flex items-center justify-center gap-1"
              >
                <CalendarPlus className="w-3.5 h-3.5" /> Lihat Jadwal Main
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
