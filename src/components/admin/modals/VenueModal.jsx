import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, MapPin, Check, Image as ImageIcon, Link as LinkIcon, Sparkles } from 'lucide-react';

export const VenueModal = () => {
  const { activeFieldEdit, setActiveFieldEdit, facilities, addVenue, updateVenue } = useApp();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [ratePerHour, setRatePerHour] = useState(350000);
  const [playerSlotFee, setPlayerSlotFee] = useState(55000);
  const [keeperSlotFee, setKeeperSlotFee] = useState(25000);
  const [image, setImage] = useState('');
  const [specs, setSpecs] = useState('');
  const [selectedFacilities, setSelectedFacilities] = useState([]);

  useEffect(() => {
    if (activeFieldEdit && !activeFieldEdit.isNew) {
      setName(activeFieldEdit.name || '');
      setLocation(activeFieldEdit.location || '');
      setRatePerHour(activeFieldEdit.ratePerHour || 350000);
      setPlayerSlotFee(activeFieldEdit.playerSlotFee || 50000);
      setKeeperSlotFee(activeFieldEdit.keeperSlotFee || 25000);
      setImage(activeFieldEdit.image || 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80');
      setSpecs(activeFieldEdit.specs || '');
      setSelectedFacilities(activeFieldEdit.facilities || []);
    } else {
      setName('');
      setLocation('');
      setRatePerHour(350000);
      setPlayerSlotFee(55000);
      setKeeperSlotFee(25000);
      setImage('https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80');
      setSpecs('Rumput Sintetis Monofilament FIFA Grade, Lampu Sorot LED 1000 Lux, Tribun, Shower.');
      setSelectedFacilities(['Rumput Sintetis Standar FIFA', 'Lampu Sorot LED 1000 Lux', 'Tribun Penonton']);
    }
  }, [activeFieldEdit]);

  if (!activeFieldEdit) return null;

  const isEdit = !activeFieldEdit.isNew;

  const sampleImages = [
    { label: 'BSF Stadium', url: 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80' },
    { label: 'Borneo Night Lights', url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80' },
    { label: 'Arena FIFA Grade', url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80' },
    { label: 'Green Valley Pitch', url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleFacilityToggle = (facName) => {
    if (selectedFacilities.includes(facName)) {
      setSelectedFacilities(prev => prev.filter(f => f !== facName));
    } else {
      setSelectedFacilities(prev => [...prev, facName]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      alert('Harap isi nama lapangan dan lokasi!');
      return;
    }

    const payload = {
      name: name.trim(),
      location: location.trim(),
      ratePerHour: Number(ratePerHour),
      playerSlotFee: Number(playerSlotFee),
      keeperSlotFee: Number(keeperSlotFee),
      image: image.trim() || 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80',
      specs: specs.trim(),
      facilities: selectedFacilities,
      status: 'active'
    };

    if (isEdit) {
      updateVenue(activeFieldEdit.id, payload);
    } else {
      addVenue(payload);
    }

    setActiveFieldEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-6 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-palette-primary" />
            <h3 className="font-extrabold text-sm text-white">
              {isEdit ? `Edit Lapangan: ${activeFieldEdit.name}` : 'Tambah Lapangan Rekanan Baru'}
            </h3>
          </div>
          <button
            onClick={() => setActiveFieldEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {/* Nama Lapangan */}
          <div>
            <label className="block font-bold text-palette-dark mb-1">Nama Lapangan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Balikpapan Soccer Field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          {/* Alamat / Lokasi */}
          <div>
            <label className="block font-bold text-palette-dark mb-1">Alamat / Lokasi *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Jl. MT Haryono, Balikpapan Selatan"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          {/* Link Input Gambar / Foto Lapangan */}
          <div className="space-y-2 p-3 rounded-2xl bg-palette-bg border border-palette-subtle">
            <label className="block font-bold text-palette-dark flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-palette-primary" /> Link / URL Foto Lapangan *
              </span>
              <span className="text-[10px] text-gray-400 font-normal">URL Langsung (HTTPS)</span>
            </label>

            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-white focus:border-palette-primary outline-none text-xs font-mono"
              />
            </div>

            {/* Live Preview Container */}
            {image && (
              <div className="relative h-28 w-full rounded-xl overflow-hidden border border-palette-subtle bg-palette-dark mt-1">
                <img
                  src={image}
                  alt="Preview Lapangan"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80';
                  }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                  <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                    ✓ Preview Foto Lapangan
                  </span>
                </div>
              </div>
            )}

            {/* Sample Image Presets */}
            <div className="pt-1">
              <div className="text-[10px] font-bold text-gray-500 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Pilihan Gambar Preset:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sampleImages.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(s.url)}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-palette-primary hover:text-white text-gray-700 text-[10px] font-bold border border-palette-subtle transition-all"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tarif Sewa, Slot Pemain, Slot Kiper */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Tarif Sewa/Jam (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="Min. 1"
                value={ratePerHour}
                onChange={(e) => setRatePerHour(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Slot Pemain (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="Min. 1"
                value={playerSlotFee}
                onChange={(e) => setPlayerSlotFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle font-mono text-palette-primary font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Slot Kiper (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="Min. 1"
                value={keeperSlotFee}
                onChange={(e) => setKeeperSlotFee(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle font-mono text-emerald-700 font-bold"
              />
            </div>
          </div>

          {/* Fasilitas */}
          <div>
            <label className="block font-bold text-palette-dark mb-1">Fasilitas Venue Lapangan</label>
            <div className="grid grid-cols-2 gap-2 bg-palette-bg p-3 rounded-2xl border border-palette-subtle max-h-32 overflow-y-auto">
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

          {/* Spesifikasi */}
          <div>
            <label className="block font-bold text-palette-dark mb-1">Spesifikasi Rumput & Fasilitas *</label>
            <textarea
              required
              rows={2}
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveFieldEdit(null)}
              className="flex-1 py-2.5 bg-palette-bg text-palette-dark font-bold rounded-xl border border-palette-subtle hover:bg-palette-subtle/50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-palette-primary text-white font-bold rounded-xl hover:bg-palette-primaryDark shadow-xs transition-all"
            >
              {isEdit ? 'Simpan Data Lapangan' : 'Tambah Lapangan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
