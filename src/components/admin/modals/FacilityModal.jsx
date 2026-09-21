import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, ListChecks, Check } from 'lucide-react';

export const FacilityModal = () => {
  const { activeFacilityEdit, setActiveFacilityEdit, addFacility, updateFacility } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('match');
  const [badgeColor, setBadgeColor] = useState('#3f72af');
  const [description, setDescription] = useState('');
  const [isDefaultMatch, setIsDefaultMatch] = useState(false);
  const [status, setStatus] = useState('active');

  useEffect(() => {
    if (activeFacilityEdit && !activeFacilityEdit.isNew) {
      setName(activeFacilityEdit.name || '');
      setCategory(activeFacilityEdit.category || 'match');
      setBadgeColor(activeFacilityEdit.badgeColor || '#3f72af');
      setDescription(activeFacilityEdit.description || '');
      setIsDefaultMatch(Boolean(activeFacilityEdit.isDefaultMatch));
      setStatus(activeFacilityEdit.status || 'active');
    } else {
      setName('');
      setCategory('match');
      setBadgeColor('#3f72af');
      setDescription('');
      setIsDefaultMatch(false);
      setStatus('active');
    }
  }, [activeFacilityEdit]);

  if (!activeFacilityEdit) return null;

  const isEdit = !activeFacilityEdit.isNew;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Harap lengkapi nama fasilitas dan deskripsinya!');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      badgeColor,
      description: description.trim(),
      isDefaultMatch,
      status
    };

    if (isEdit) {
      updateFacility(activeFacilityEdit.id, payload);
    } else {
      addFacility(payload);
    }

    setActiveFacilityEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up">
        {/* Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-palette-primary" />
            <h3 className="font-extrabold text-sm text-white">
              {isEdit ? `Edit Fasilitas: ${activeFacilityEdit.name}` : 'Tambah Fasilitas Baru'}
            </h3>
          </div>
          <button
            onClick={() => setActiveFacilityEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-palette-dark mb-1">Nama Fasilitas / Layanan *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Wasit Berlisensi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">Kategori *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white"
              >
                <option value="match">Matchday (Game)</option>
                <option value="venue">Venue (Lapangan)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Warna Aksen</label>
              <select
                value={badgeColor}
                onChange={(e) => setBadgeColor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white"
              >
                <option value="#3f72af">Biru Navy (#3f72af)</option>
                <option value="#16a34a">Hijau Sport (#16a34a)</option>
                <option value="#ea580c">Oranye (#ea580c)</option>
                <option value="#dc2626">Merah (#dc2626)</option>
                <option value="#8b5cf6">Ungu (#8b5cf6)</option>
                <option value="#64748b">Slate Gray (#64748b)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Deskripsi Singkat *</label>
            <textarea
              required
              rows={2}
              placeholder="Contoh: Pertandingan dipimpin langsung oleh wasit bersertifikat PSSI resmi."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div className="p-3 bg-palette-bg rounded-xl border border-palette-subtle">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-palette-dark">
              <input
                type="checkbox"
                checked={isDefaultMatch}
                onChange={(e) => setIsDefaultMatch(e.target.checked)}
                className="accent-palette-primary w-4 h-4"
              />
              <span>Otomatis sertakan sebagai fasilitas default di game baru</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveFacilityEdit(null)}
              className="flex-1 py-2.5 bg-palette-bg text-palette-dark font-bold rounded-xl border border-palette-subtle hover:bg-palette-subtle/50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-palette-primary text-white font-bold rounded-xl hover:bg-palette-primaryDark shadow-xs"
            >
              {isEdit ? 'Simpan Perubahan' : 'Tambah Fasilitas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
