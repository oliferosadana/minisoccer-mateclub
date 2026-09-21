import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useApp } from '../../../context/AppContext';
import { X, Save, UserPlus, ShieldAlert, User, Phone, Mail, Crown, Wallet } from 'lucide-react';

export const UserModal = () => {
  const { activeUserEdit, setActiveUserEdit, showToast } = useApp();
  const { addUser, updateUser, isSuperAdmin, currentUser } = useAuth();

  const isUserSuperAdmin = isSuperAdmin || currentUser?.role === 'superadmin';
  const isNew = activeUserEdit?.isNew;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'player',
    preferredPosition: 'Pemain Lapangan',
    clubOrigin: 'Komunitas MATE CLUB',
    jerseyNumber: '10',
    status: 'active',
    balance: 0,
    caps: 0,
    goals: 0,
    mvpCount: 0
  });

  useEffect(() => {
    if (activeUserEdit && !activeUserEdit.isNew) {
      setFormData({
        name: activeUserEdit.name || '',
        phone: activeUserEdit.phone || '',
        email: activeUserEdit.email || '',
        role: activeUserEdit.role || 'player',
        preferredPosition: activeUserEdit.preferredPosition || 'Pemain Lapangan',
        clubOrigin: activeUserEdit.clubOrigin || 'Komunitas MATE CLUB',
        jerseyNumber: activeUserEdit.jerseyNumber || '10',
        status: activeUserEdit.status || 'active',
        balance: activeUserEdit.balance || 0,
        caps: activeUserEdit.caps || 0,
        goals: activeUserEdit.goals || 0,
        mvpCount: activeUserEdit.mvpCount || 0
      });
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        role: 'player',
        preferredPosition: 'Pemain Lapangan',
        clubOrigin: 'Komunitas MATE CLUB',
        jerseyNumber: '10',
        status: 'active',
        balance: 0,
        caps: 0,
        goals: 0,
        mvpCount: 0
      });
    }
  }, [activeUserEdit]);

  if (!activeUserEdit) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      showToast('Harap lengkapi nama dan nomor WhatsApp!', 'error');
      return;
    }

    if (isNew) {
      addUser(formData);
      showToast(`Pengguna baru "${formData.name}" berhasil dibuat!`);
    } else {
      updateUser(activeUserEdit.id, formData);
      showToast(`Data pengguna "${formData.name}" berhasil diperbarui!`);
    }
    setActiveUserEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
        {/* Modal Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-palette-subtle uppercase tracking-wider">Superadmin User Access</div>
              <h3 className="text-base font-extrabold text-white">
                {isNew ? 'Tambah Pengguna Baru' : `Edit Pengguna: ${formData.name}`}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setActiveUserEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">Nama Lengkap *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Denny Firmansyah"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Nomor WhatsApp *</label>
              <input
                type="text"
                required
                placeholder="081234567890"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Alamat Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">
              Password Login {isNew ? '*' : '(Biarkan kosong jika tidak diubah)'}
            </label>
            <input
              type="text"
              placeholder={isNew ? 'Masukkan password akun' : 'Password tersimpan (isi untuk reset)'}
              value={formData.password || ''}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
            />
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-200">
            <div>
              <label className="block text-xs font-bold text-purple-900 mb-1">Tingkat Peran (Role)</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-purple-300 bg-white font-bold outline-none"
              >
                <option value="player">🏃 Player (Pemain Komunitas)</option>
                <option value="admin">🛠️ Admin (Operasional Match)</option>
                <option value="superadmin">👑 Superadmin (Akses Penuh)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-purple-900 mb-1">Status Akun</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-purple-300 bg-white font-bold outline-none"
              >
                <option value="active">Aktif Normal</option>
                <option value="suspended">Suspended / Blokir</option>
              </select>
            </div>
          </div>

          {/* Superadmin Exclusive Balance Control */}
          {isUserSuperAdmin && (
            <div className="p-3.5 bg-gradient-to-r from-purple-50 via-emerald-50/50 to-purple-50 rounded-xl border-2 border-purple-300/80 space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Saldo Dompet Pengguna (Superadmin Privilege)</span>
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                  Superadmin Only
                </span>
              </div>
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="0"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: Number(e.target.value) || 0 })}
                className="w-full text-xs p-2.5 rounded-lg border border-purple-300 bg-white font-mono font-bold text-emerald-900 focus:border-purple-600 outline-none"
              />
              <p className="text-[10px] text-gray-500">
                * Superadmin dapat menetapkan atau menyesuaikan saldo dompet user secara langsung.
              </p>
            </div>
          )}

          {/* Player Profiling */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Posisi Favorit</label>
              <select
                value={formData.preferredPosition}
                onChange={(e) => setFormData({ ...formData, preferredPosition: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
              >
                <option value="Pemain Lapangan">🏃 Pemain Lapangan</option>
                <option value="Penjaga Gawang">🧤 Penjaga Gawang</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Klub Asal / Komunitas</label>
              <input
                type="text"
                value={formData.clubOrigin}
                onChange={(e) => setFormData({ ...formData, clubOrigin: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Match Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Caps (Game)</label>
              <input
                type="number"
                min="0"
                value={formData.caps}
                onChange={(e) => setFormData({ ...formData, caps: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-palette-subtle outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Total Gol</label>
              <input
                type="number"
                min="0"
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-palette-subtle outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">MVP Count</label>
              <input
                type="number"
                min="0"
                value={formData.mvpCount}
                onChange={(e) => setFormData({ ...formData, mvpCount: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-palette-subtle outline-none font-mono"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4 border-t border-palette-subtle">
            <button
              type="button"
              onClick={() => setActiveUserEdit(null)}
              className="w-1/3 py-2.5 bg-palette-bg text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Simpan Data Pengguna
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
