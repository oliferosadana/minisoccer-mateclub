import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, CalendarPlus, Check, Trash2 } from 'lucide-react';

export const MatchModal = () => {
  const { 
    activeMatchEdit, 
    setActiveMatchEdit, 
    venues, 
    referees, 
    photographers, 
    facilities, 
    addMatch, 
    updateMatch,
    deleteMatch
  } = useApp();

  const [type, setType] = useState('fun_football');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('19:00 - 21:00 WITA');
  const [fieldId, setFieldId] = useState('');
  const [refereeId, setRefereeId] = useState('');
  const [photographerId, setPhotographerId] = useState('');
  const [playerFee, setPlayerFee] = useState(55000);
  const [keeperFee, setKeeperFee] = useState(25000);
  const [level, setLevel] = useState('Medium / Menengah');
  const [playerSlots, setPlayerSlots] = useState(22);
  const [gkSlots, setGkSlots] = useState(2);
  const [totalSlots, setTotalSlots] = useState(24);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [status, setStatus] = useState('open');

  useEffect(() => {
    if (activeMatchEdit && !activeMatchEdit.isNew) {
      setType(activeMatchEdit.type || 'fun_football');
      setTitle(activeMatchEdit.title || '');
      setDate(activeMatchEdit.date || '');
      setTimeSlot(activeMatchEdit.timeSlot || '19:00 - 21:00 WITA');
      setFieldId(activeMatchEdit.fieldId || (venues[0]?.id || ''));
      setRefereeId(activeMatchEdit.refereeId || (referees[0]?.id || ''));
      setPhotographerId(activeMatchEdit.photographerId || (photographers[0]?.id || ''));
      setPlayerFee(activeMatchEdit.playerFee || activeMatchEdit.slotFee || 50000);
      setKeeperFee(activeMatchEdit.keeperFee || 25000);
      setLevel(activeMatchEdit.level || 'Medium / Menengah');
      setPlayerSlots(activeMatchEdit.playerSlots || 22);
      setGkSlots(activeMatchEdit.gkSlots !== undefined ? activeMatchEdit.gkSlots : 2);
      setTotalSlots(activeMatchEdit.totalSlots || 24);
      setSelectedFacilities(activeMatchEdit.facilities || []);
      setStatus(activeMatchEdit.status || 'open');
    } else {
      setType('fun_football');
      setTitle('Sunset Weekend Fun Football');
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
      setTimeSlot('19:00 - 21:00 WITA');
      const defField = activeMatchEdit?.defaultFieldId || venues[0]?.id || '';
      setFieldId(defField);
      setRefereeId(referees[0]?.id || '');
      setPhotographerId(photographers[0]?.id || '');

      const v = venues.find(ven => ven.id === defField) || venues[0];
      setPlayerFee(v ? v.playerSlotFee : 55000);
      setKeeperFee(v ? v.keeperSlotFee : 25000);
      setLevel('Medium / Menengah');
      setPlayerSlots(22);
      setGkSlots(2);
      setTotalSlots(24);

      // Default facilities
      const defFacs = facilities.filter(f => f.isDefaultMatch).map(f => f.name);
      setSelectedFacilities(defFacs.length > 0 ? defFacs : ['Wasit Berlisensi PSSI', 'Dokumentasi Foto HD', 'Rompi Bersih & Higienis', 'Air Mineral & Hidrasi']);
      setStatus('open');
    }
  }, [activeMatchEdit, venues, referees, photographers, facilities]);

  if (!activeMatchEdit) return null;

  const isEdit = !activeMatchEdit.isNew;

  const handleFieldChange = (newFieldId) => {
    setFieldId(newFieldId);
    const v = venues.find(ven => ven.id === newFieldId);
    if (v) {
      setPlayerFee(v.playerSlotFee || 50000);
      setKeeperFee(v.keeperSlotFee || 25000);
    }
  };

  const handleFacilityToggle = (facName) => {
    if (selectedFacilities.includes(facName)) {
      setSelectedFacilities(prev => prev.filter(f => f !== facName));
    } else {
      setSelectedFacilities(prev => [...prev, facName]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert('Harap isi judul game dan tanggal!');
      return;
    }

    const payload = {
      type,
      title: title.trim(),
      date,
      dateLabel: date,
      timeSlot: timeSlot.trim(),
      fieldId,
      refereeId,
      photographerId,
      playerFee: Number(playerFee),
      keeperFee: Number(keeperFee),
      slotFee: Number(playerFee),
      positionPricing: {
        'GK': Number(keeperFee),
        'DEF': Number(playerFee),
        'MID': Number(playerFee),
        'FWD': Number(playerFee),
        'ALL': Number(playerFee)
      },
      dpRequired: type === 'fun_football' ? Number(playerFee) : Math.round(Number(playerFee) / 2),
      level,
      levelBadge: level.includes('Casual') ? '🌟 Fun' : (level.includes('Medium') ? '⚡ Medium' : '🏆 Kompetitif'),
      facilities: selectedFacilities,
      totalSlots: Number(totalSlots),
      playerSlots: Number(playerSlots),
      gkSlots: Number(gkSlots),
      status,
      summary: `Sesi ${title} di venue rekanan resmi.`
    };

    if (isEdit) {
      updateMatch(activeMatchEdit.id, payload);
    } else {
      addMatch(payload);
    }

    setActiveMatchEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-palette-primary" />
            <h3 className="font-extrabold text-sm text-white">
              {isEdit ? `Edit Jadwal Game: ${activeMatchEdit.id}` : 'Terbitkan Slot Game Baru'}
            </h3>
          </div>
          <button
            onClick={() => setActiveMatchEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Format Pertandingan *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white"
              >
                <option value="fun_football">Open Play Solo (Solo Player)</option>
                <option value="sparring">Sparring 2 Tim Resmi</option>
                <option value="trofeo">Trofeo (3 Tim)</option>
              </select>
            </div>
            {isEdit && (
              <div>
                <label className="block font-bold text-palette-dark mb-1">Status Pertandingan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white font-bold"
                >
                  <option value="open">OPEN (Pendaftaran Dibuka)</option>
                  <option value="confirmed">CONFIRMED (Slot Terkunci)</option>
                  <option value="completed">COMPLETED (Selesai)</option>
                  <option value="cancelled">CANCELLED (Dibatalkan)</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Nama / Sesi Pertandingan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Weekend Sunset Open Play BSF"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Tanggal *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Jam Main *</label>
              <input
                type="text"
                required
                placeholder="19:00 - 21:00 WITA"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Pilih Venue Lapangan Rekanan *</label>
            <select
              value={fieldId}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white font-semibold"
            >
              {venues.map(v => (
                <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Assign Wasit Resmi</label>
              <select
                value={refereeId}
                onChange={(e) => setRefereeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white"
              >
                {referees.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.license})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Assign Fotografer</label>
              <select
                value={photographerId}
                onChange={(e) => setPhotographerId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white"
              >
                {photographers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Biaya Pemain (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="Min. 1"
                value={playerFee}
                onChange={(e) => setPlayerFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono text-palette-primary font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Biaya Kiper (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="Min. 1"
                value={keeperFee}
                onChange={(e) => setKeeperFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono text-emerald-700 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Tingkat Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white"
              >
                <option value="Casual / Santai / Open">Casual / Santai</option>
                <option value="Medium / Menengah">Medium / Menengah</option>
                <option value="Kompetitif">Kompetitif</option>
              </select>
            </div>
          </div>

          {/* Facilities Dynamic Checkboxes */}
          <div>
            <label className="block font-bold text-palette-dark mb-1.5">
              Fasilitas & Layanan Matchday (Benefit Pemain)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-palette-bg p-3 rounded-2xl border border-palette-subtle max-h-36 overflow-y-auto">
              {facilities.map(fac => {
                const checked = selectedFacilities.includes(fac.name);
                return (
                  <label
                    key={fac.id}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-all ${
                      checked
                        ? 'bg-white border-palette-primary text-palette-primary font-bold shadow-xs'
                        : 'bg-white/60 border-palette-subtle text-gray-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleFacilityToggle(fac.name)}
                      className="accent-palette-primary w-3.5 h-3.5"
                    />
                    <span className="truncate text-[11px]">{fac.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Roster Config */}
          <div className="p-3.5 bg-palette-bg rounded-2xl border border-palette-subtle space-y-2">
            <div className="font-bold text-palette-dark">Pengaturan Kuota Roster</div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Pemain Outfield</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={playerSlots}
                  onChange={(e) => {
                    const pl = Number(e.target.value);
                    setPlayerSlots(pl);
                    setTotalSlots(pl + Number(gkSlots));
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-palette-subtle text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Kiper (GK)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={gkSlots}
                  onChange={(e) => {
                    const gk = Number(e.target.value);
                    setGkSlots(gk);
                    setTotalSlots(Number(playerSlots) + gk);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-palette-subtle text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 font-bold mb-0.5">Total Kapasitas</label>
                <input
                  type="number"
                  readOnly
                  value={totalSlots}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-palette-subtle bg-white text-xs font-mono font-bold text-palette-primary"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-palette-subtle">
            {isEdit && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Yakin ingin menghapus jadwal pertandingan "${activeMatchEdit.title}"? Semua data peserta pada sesi ini juga akan dihapus.`)) {
                    deleteMatch(activeMatchEdit.id);
                    setActiveMatchEdit(null);
                  }
                }}
                className="py-2.5 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl border border-red-200 transition-all flex items-center justify-center gap-1.5 text-xs"
              >
                <Trash2 className="w-4 h-4" /> Hapus Jadwal Ini
              </button>
            )}
            <div className="flex-1 flex gap-2">
              <button
                type="button"
                onClick={() => setActiveMatchEdit(null)}
                className="flex-1 py-2.5 bg-palette-bg text-palette-dark font-bold rounded-xl border border-palette-subtle hover:bg-palette-subtle/50 text-xs"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-palette-primary text-white font-bold rounded-xl hover:bg-palette-primaryDark shadow-xs text-xs"
              >
                {isEdit ? 'Simpan Perubahan Jadwal' : 'Publikasikan Slot Game'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
