import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { formatIDR } from '../../lib/supabase';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  Edit, 
  Trash2, 
  Ban, 
  CheckCircle, 
  Phone, 
  Mail, 
  Trophy, 
  Filter, 
  User,
  Wallet,
  ArrowUpDown,
  PlusCircle,
  MinusCircle,
  X,
  Sparkles,
  History,
  Crown
} from 'lucide-react';

export const UsersSection = () => {
  const { allUsers, currentUser, toggleUserStatus, deleteUser, isSuperAdmin, adjustUserBalance, getUserWalletTransactions } = useAuth();
  const { setActiveUserEdit, showToast } = useApp();

  const isUserSuperAdmin = isSuperAdmin || currentUser?.role === 'superadmin';

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'player' | 'admin' | 'superadmin'

  // Wallet adjustment modal state
  const [walletModalUser, setWalletModalUser] = useState(null);
  const [adjustType, setAdjustType] = useState('credit'); // 'credit' | 'debit'
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const handleOpenWalletModal = (user) => {
    if (!isUserSuperAdmin) {
      showToast('Akses Ditolak: Hanya Superadmin yang memiliki izin menambah atau mengurangi saldo user secara manual!', 'error');
      return;
    }
    setWalletModalUser(user);
    setAdjustAmount('');
    setAdjustReason('');
    setAdjustType('credit');
  };

  const filteredUsers = allUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchPhone = (u.phone || '').includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  const countSuperadmins = allUsers.filter(u => u.role === 'superadmin').length;
  const countAdmins = allUsers.filter(u => u.role === 'admin').length;
  const countPlayers = allUsers.filter(u => u.role === 'player').length;

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) {
      showToast('Anda tidak dapat menghapus akun Anda sendiri!', 'error');
      return;
    }
    if (user.role === 'superadmin' && countSuperadmins <= 1) {
      showToast('Tidak bisa menghapus superadmin terakhir!', 'error');
      return;
    }
    if (confirm(`Yakin ingin menghapus akun pengguna "${user.name}"?`)) {
      deleteUser(user.id);
      showToast(`Pengguna "${user.name}" berhasil dihapus.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-palette-dark text-white p-6 sm:p-7 rounded-2xl border border-palette-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[11px] font-bold border border-purple-500/30 uppercase tracking-wider">
              SUPERADMIN PRIVILEGE
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-300 text-xs font-semibold">User Access Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Kelola Pengguna, Peran, & Hak Akses
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Atur seluruh akun pemain, admin matchday, dan hak istimewa superadmin. Kelola status akun, reset peran, dan pantau aktivitas pemain.
          </p>
        </div>

        <button
          onClick={() => setActiveUserEdit({ isNew: true })}
          className="px-4 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Tambah Pengguna Baru
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-palette-subtle shadow-xs">
          <div className="text-[11px] text-gray-500 font-bold uppercase">Total Terdaftar</div>
          <div className="text-2xl font-black text-palette-dark font-mono mt-0.5">{allUsers.length}</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Semua akun sistem</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs bg-purple-50/20">
          <div className="text-[11px] text-purple-800 font-bold uppercase">Superadmin</div>
          <div className="text-2xl font-black text-purple-900 font-mono mt-0.5">{countSuperadmins}</div>
          <div className="text-[10px] text-purple-600 mt-0.5">Akses penuh sistem</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/20">
          <div className="text-[11px] text-blue-800 font-bold uppercase">Admin Operasional</div>
          <div className="text-2xl font-black text-palette-primary font-mono mt-0.5">{countAdmins}</div>
          <div className="text-[10px] text-blue-600 mt-0.5">Kelola match & booking</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <div className="text-[11px] text-emerald-800 font-bold uppercase">Pemain Aktif</div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">{countPlayers}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Member komunitas</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-palette-subtle shadow-card flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama, nomor WhatsApp, atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              roleFilter === 'all'
                ? 'bg-palette-dark text-white'
                : 'bg-palette-bg text-gray-600 hover:bg-palette-subtle'
            }`}
          >
            Semua ({allUsers.length})
          </button>
          <button
            onClick={() => setRoleFilter('superadmin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              roleFilter === 'superadmin'
                ? 'bg-purple-700 text-white'
                : 'bg-palette-bg text-gray-600 hover:bg-purple-50'
            }`}
          >
            Superadmin ({countSuperadmins})
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              roleFilter === 'admin'
                ? 'bg-palette-primary text-white'
                : 'bg-palette-bg text-gray-600 hover:bg-blue-50'
            }`}
          >
            Admin ({countAdmins})
          </button>
          <button
            onClick={() => setRoleFilter('player')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-all ${
              roleFilter === 'player'
                ? 'bg-emerald-700 text-white'
                : 'bg-palette-bg text-gray-600 hover:bg-emerald-50'
            }`}
          >
            Player ({countPlayers})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-palette-subtle overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-palette-dark text-white font-bold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Pengguna</th>
                <th className="py-3 px-4">Kontak</th>
                <th className="py-3 px-4">Peran (Role)</th>
                <th className="py-3 px-4">Posisi & Klub</th>
                <th className="py-3 px-4">Saldo Dompet</th>
                <th className="py-3 px-4">Match Stats</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-palette-subtle">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    Tidak ada pengguna yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrent = user.id === currentUser?.id;

                  return (
                    <tr key={user.id} className="hover:bg-palette-bg/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                            user.role === 'superadmin'
                              ? 'bg-purple-700'
                              : user.role === 'admin'
                              ? 'bg-palette-primary'
                              : 'bg-emerald-600'
                          }`}>
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-extrabold text-palette-dark flex items-center gap-1.5">
                              {user.name}
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-gray-400 font-mono">{user.id}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-gray-700">
                          <Phone className="w-3 h-3 text-emerald-600" /> {user.phone}
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold inline-flex items-center gap-1 ${
                          user.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : user.role === 'admin'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}>
                          {user.role === 'superadmin' && <ShieldAlert className="w-3 h-3 text-purple-700" />}
                          {user.role === 'admin' && <ShieldCheck className="w-3 h-3 text-palette-primary" />}
                          {user.role === 'player' && <User className="w-3 h-3 text-emerald-600" />}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-palette-dark">{user.preferredPosition || 'Pemain Lapangan'}</div>
                        <div className="text-[10px] text-gray-500 truncate max-w-[140px]">{user.clubOrigin || 'Komunitas MATE CLUB'}</div>
                      </td>

                      {/* Saldo Dompet */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenWalletModal(user)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                            title={isUserSuperAdmin ? "Kelola Saldo (Superadmin Privilege)" : "Saldo Dompet"}
                          >
                            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{formatIDR(user.balance || 0)}</span>
                          </button>
                          {isUserSuperAdmin && (
                            <button
                              onClick={() => handleOpenWalletModal(user)}
                              className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 text-[10px] font-bold border border-purple-300 transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Tambah Saldo Manual (Superadmin Privilege)"
                            >
                              <PlusCircle className="w-3 h-3 text-purple-700" />
                              <span>+ Top Up</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span title="Caps / Penampilan">🏟️ {user.caps || 0}</span>
                          <span title="Gol Dicetak">⚽ {user.goals || 0}</span>
                          <span title="Player of the Match">⭐ {user.mvpCount || 0}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          user.status === 'suspended'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {user.status === 'suspended' ? 'Suspended' : 'Aktif'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isUserSuperAdmin && (
                            <button
                              onClick={() => handleOpenWalletModal(user)}
                              className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                              title="Superadmin: Tambah / Atur Saldo Manual"
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setActiveUserEdit(user)}
                            className="p-1.5 text-palette-primary hover:bg-palette-subtle rounded-lg transition-all cursor-pointer"
                            title="Edit Data & Hak Akses"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                              user.status === 'suspended'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={user.status === 'suspended' ? 'Aktifkan Akun' : 'Suspend Akun'}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                            title="Hapus Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL KELOLA SALDO & MUTASI PENGGUNA (SUPERADMIN PRIVILEGE) */}
      {walletModalUser && (() => {
        const userTxs = getUserWalletTransactions ? getUserWalletTransactions(walletModalUser.id || walletModalUser.phone) : [];
        const currentTargetBal = allUsers.find(u => u.id === walletModalUser.id)?.balance ?? walletModalUser.balance ?? 0;
        const amountNum = Number(adjustAmount) || 0;
        const calculatedNewBal = adjustType === 'credit' 
          ? (currentTargetBal + amountNum) 
          : Math.max(0, currentTargetBal - amountNum);

        const PRESET_TOPUP_AMOUNTS = [25000, 50000, 100000, 150000, 200000, 500000];
        const PRESET_REASONS = [
          'Top Up Tunai Kasir Lapangan',
          'Cashback / Kompensasi Match',
          'Bonus Event Komunitas',
          'Koreksi Saldo Manual Superadmin'
        ];

        const handleAdjustSubmit = async (e) => {
          e.preventDefault();
          if (!amountNum || amountNum <= 0) {
            showToast('Nominal saldo harus lebih dari 0!', 'error');
            return;
          }
          if (adjustType === 'debit' && currentTargetBal < amountNum) {
            showToast('Saldo user tidak mencukupi untuk pengurangan nominal ini!', 'error');
            return;
          }

          const res = await adjustUserBalance(
            walletModalUser.id,
            amountNum,
            adjustType,
            adjustReason || (adjustType === 'credit' ? 'Top up Manual Superadmin' : 'Penarikan Manual Superadmin')
          );

          if (res.success) {
            showToast(`Saldo ${walletModalUser.name} berhasil diperbarui menjadi ${formatIDR(res.newBalance)}!`, 'success');
            setAdjustAmount('');
            setAdjustReason('');
          } else {
            showToast(res.message || 'Gagal mengubah saldo', 'error');
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
              {/* Superadmin Header */}
              <div className="bg-gradient-to-r from-purple-950 via-palette-dark to-[#064e3b] text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded border border-purple-400/30">
                        SUPERADMIN PRIVILEGE
                      </span>
                    </div>
                    <h3 className="font-extrabold text-base text-white mt-0.5">
                      Tambah / Atur Saldo User Manual
                    </h3>
                    <div className="text-xs text-purple-200">
                      Member: <strong>{walletModalUser.name}</strong> ({walletModalUser.phone})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setWalletModalUser(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 space-y-5">
                {/* Balance Display & Realtime Calculation */}
                <div className="bg-gradient-to-br from-emerald-50 to-purple-50/40 border border-emerald-200 p-4 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-emerald-800 font-bold uppercase">Saldo Dompet Saat Ini</div>
                      <div className="text-2xl font-black font-mono text-emerald-950 mt-0.5">
                        {formatIDR(currentTargetBal)}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-950 text-xs font-bold font-mono">
                      ID: {walletModalUser.id}
                    </span>
                  </div>

                  {amountNum > 0 && (
                    <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-mono">
                      <span className="text-gray-600 font-bold">
                        {adjustType === 'credit' ? '🟢 Ditambahkan:' : '🔴 Dikurangkan:'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${adjustType === 'credit' ? 'text-emerald-700' : 'text-red-600'}`}>
                          {adjustType === 'credit' ? `+${formatIDR(amountNum)}` : `-${formatIDR(amountNum)}`}
                        </span>
                        <span className="text-gray-400">➔</span>
                        <span className="font-black text-palette-dark bg-white px-2 py-0.5 rounded border border-gray-300">
                          Saldo Akhir: {formatIDR(calculatedNewBal)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Superadmin Adjustment Form */}
                <form onSubmit={handleAdjustSubmit} className="bg-palette-bg p-4 rounded-xl border border-palette-subtle space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-xs text-palette-dark flex items-center gap-1.5">
                      <ArrowUpDown className="w-3.5 h-3.5 text-palette-primary" /> Formulir Penyesuaian Saldo
                    </h4>
                    <span className="text-[10px] text-purple-700 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-amber-500" /> Hanya Superadmin
                    </span>
                  </div>

                  {/* Mode Selector */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustType('credit')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        adjustType === 'credit'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-palette-subtle hover:bg-gray-50'
                      }`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> + Tambah Saldo (Credit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustType('debit')}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        adjustType === 'debit'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-white text-gray-700 border border-palette-subtle hover:bg-gray-50'
                      }`}
                    >
                      <MinusCircle className="w-3.5 h-3.5" /> - Kurangi Saldo (Debit)
                    </button>
                  </div>

                  {/* Quick Preset Nominal Buttons */}
                  <div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mb-1.5">Pilihan Cepat Nominal:</div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                      {PRESET_TOPUP_AMOUNTS.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setAdjustAmount(amt.toString())}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-mono font-bold border transition-all cursor-pointer ${
                            Number(adjustAmount) === amt
                              ? 'border-emerald-600 bg-emerald-100 text-emerald-900 ring-1 ring-emerald-600'
                              : 'border-palette-subtle bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {amt >= 1000 ? `${amt / 1000}k` : amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Nominal & Reason Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-palette-dark mb-1">Nominal Saldo (Rp) *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Contoh: 50000"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-palette-subtle bg-white text-xs font-mono outline-none focus:border-palette-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-palette-dark mb-1">Keterangan / Alasan *</label>
                      <input
                        type="text"
                        placeholder="Pilih di bawah atau ketik kustom..."
                        value={adjustReason}
                        onChange={(e) => setAdjustReason(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-palette-subtle bg-white text-xs outline-none focus:border-palette-primary"
                      />
                    </div>
                  </div>

                  {/* Quick Preset Reasons */}
                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Template Alasan:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_REASONS.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setAdjustReason(r)}
                          className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                            adjustReason === r
                              ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-purple-700 to-palette-primary text-white text-xs font-black rounded-xl hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 mt-3"
                  >
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>Konfirmasi Simpan Saldo (Superadmin)</span>
                  </button>
                </form>

                {/* Mutation History for This User */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-palette-dark flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-palette-primary" /> Riwayat Mutasi Dompet User
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">{userTxs.length} Catatan</span>
                  </div>

                  {userTxs.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400 border border-dashed border-palette-subtle rounded-xl bg-gray-50/50">
                      Belum ada catatan mutasi untuk user ini.
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto divide-y divide-palette-subtle border border-palette-subtle rounded-xl text-xs bg-white">
                      {userTxs.map(tx => {
                        const isCredit = tx.type === 'credit';
                        return (
                          <div key={tx.id} className="p-2.5 hover:bg-palette-bg/40 flex items-center justify-between">
                            <div>
                              <div className="font-bold text-palette-dark text-[11px]">{tx.description}</div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                {new Date(tx.createdAt).toLocaleString('id-ID')} {tx.bookingId ? `• ${tx.bookingId}` : ''}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-mono font-black text-xs ${isCredit ? 'text-emerald-600' : 'text-red-600'}`}>
                                {isCredit ? `+${formatIDR(tx.amount)}` : `-${formatIDR(tx.amount)}`}
                              </div>
                              <div className="text-[9px] text-gray-400 font-mono">
                                Sisa: {formatIDR(tx.balanceAfter)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
