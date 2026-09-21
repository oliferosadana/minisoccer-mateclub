import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, UserCheck } from 'lucide-react';

export const RefereeModal = () => {
  const { activeRefEdit, setActiveRefEdit, addReferee, updateReferee } = useApp();

  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [phone, setPhone] = useState('');
  const [rate, setRate] = useState(150000);

  useEffect(() => {
    if (activeRefEdit && !activeRefEdit.isNew) {
      setName(activeRefEdit.name || '');
      setLicense(activeRefEdit.license || '');
      setPhone(activeRefEdit.phone || '');
      setRate(activeRefEdit.rate || 150000);
    } else {
      setName('');
      setLicense('Lisensi C2 PSSI Balikpapan');
      setPhone('0812-xxxx-xxxx');
      setRate(150000);
    }
  }, [activeRefEdit]);

  if (!activeRefEdit) return null;

  const isEdit = !activeRefEdit.isNew;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Harap lengkapi nama wasit dan nomor WhatsApp!');
      return;
    }

    const payload = {
      name: name.trim(),
      license: license.trim(),
      phone: phone.trim(),
      rate: Number(rate),
      status: 'active',
      rating: 5.0
    };

    if (isEdit) {
      updateReferee(activeRefEdit.id, payload);
    } else {
      addReferee(payload);
    }

    setActiveRefEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up">
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-palette-primary" />
            <h3 className="font-extrabold text-sm text-white">
              {isEdit ? `Edit Wasit: ${activeRefEdit.name}` : 'Tambah Wasit PSSI Baru'}
            </h3>
          </div>
          <button
            onClick={() => setActiveRefEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-palette-dark mb-1">Nama Lengkap & Gelar *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Wasit Hendra Saputra"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-palette-dark mb-1">Lisensi & Asosiasi *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Lisensi C2 PSSI Balikpapan"
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-palette-dark mb-1">WhatsApp Aktif *</label>
              <input
                type="tel"
                required
                placeholder="0812-5123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-palette-dark mb-1">Honor per Game (Rp) *</label>
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

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setActiveRefEdit(null)}
              className="flex-1 py-2.5 bg-palette-bg text-palette-dark font-bold rounded-xl border border-palette-subtle hover:bg-palette-subtle/50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-palette-primary text-white font-bold rounded-xl hover:bg-palette-primaryDark shadow-xs"
            >
              {isEdit ? 'Simpan Data Wasit' : 'Tambah Wasit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
