import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Camera } from 'lucide-react';

export const PhotographerModal = () => {
  const { activePhotoEdit, setActivePhotoEdit, addPhotographer, updatePhotographer } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Vendor Resmi MATE CLUB');
  const [phone, setPhone] = useState('');
  const [rate, setRate] = useState(100000);
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    if (activePhotoEdit && !activePhotoEdit.isNew) {
      setName(activePhotoEdit.name || '');
      setCategory(activePhotoEdit.category || 'Vendor Resmi MATE CLUB');
      setPhone(activePhotoEdit.phone || '');
      setRate(activePhotoEdit.rate || 100000);
      setPortfolioUrl(activePhotoEdit.portfolioUrl || '');
    } else {
      setName('');
      setCategory('Vendor Resmi MATE CLUB');
      setPhone('0812-xxxx-xxxx');
      setRate(100000);
      setPortfolioUrl('https://instagram.com/mateclub_photos');
    }
  }, [activePhotoEdit]);

  if (!activePhotoEdit) return null;

  const isEdit = !activePhotoEdit.isNew;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Harap lengkapi nama dan nomor WhatsApp fotografer!');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      phone: phone.trim(),
      rate: Number(rate),
      portfolioUrl: portfolioUrl.trim(),
      status: 'active',
      rating: 5.0
    };

    if (isEdit) {
      updatePhotographer(activePhotoEdit.id, payload);
    } else {
      addPhotographer(payload);
    }

    setActivePhotoEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up">
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-palette-primary" />
            <h3 className="font-extrabold text-sm text-white">
              {isEdit ? `Edit Fotografer: ${activePhotoEdit.name}` : 'Tambah Fotografer Baru'}
            </h3>
          </div>
          <button
            onClick={() => setActivePhotoEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-palette-dark mb-1">Nama Fotografer / Studio *</label>
            <input
              type="text"
              required
              placeholder="Contoh: ActionShots BPP Matchday"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Kategori / Afiliasi *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none bg-white"
            >
              <option value="Vendor Resmi MATE CLUB">Vendor Resmi MATE CLUB</option>
              <option value="Vendor Eksternal Rekanan">Vendor Eksternal Rekanan</option>
              <option value="Freelance Matchday Pro">Freelance Matchday Pro</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">WhatsApp Aktif *</label>
              <input
                type="tel"
                required
                placeholder="0812-9988-7766"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Honor per Sesi (Rp) *</label>
              <input
                type="number"
                required
                min="1"
                step="1"
                placeholder="Min. 1"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Link Portofolio (Instagram / Google Photos)</label>
            <input
              type="url"
              placeholder="https://instagram.com/actionshots.bpp"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActivePhotoEdit(null)}
              className="flex-1 py-2.5 bg-palette-bg text-palette-dark font-bold rounded-xl border border-palette-subtle hover:bg-palette-subtle/50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-palette-primary text-white font-bold rounded-xl hover:bg-palette-primaryDark shadow-xs"
            >
              {isEdit ? 'Simpan Fotografer' : 'Tambah Fotografer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
