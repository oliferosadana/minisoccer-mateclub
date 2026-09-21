import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Landmark,
  PlusCircle,
  Search,
  Filter,
  Check,
  CreditCard,
  Building2,
  Trash2,
  Edit2,
  Copy,
  AlertTriangle,
  ShieldCheck,
  Power,
  RefreshCw,
  ExternalLink,
  Info
} from 'lucide-react';

export const BankManagementSection = () => {
  const {
    bankAccounts = [],
    setActiveBankEdit,
    deleteBankAccount,
    toggleBankAccountStatus,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const totalCount = bankAccounts.length;
  const activeCount = bankAccounts.filter(b => b.isActive).length;
  const inactiveCount = bankAccounts.filter(b => !b.isActive).length;

  const filteredAccounts = bankAccounts.filter(b => {
    const matchesSearch =
      (b.bankName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.accountNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.accountHolder || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.branch || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && b.isActive) ||
      (statusFilter === 'inactive' && !b.isActive);

    return matchesSearch && matchesStatus;
  });

  const handleCopyAccount = (id, accNumber) => {
    navigator.clipboard.writeText(accNumber.replace(/[^0-9]/g, ''));
    setCopiedId(id);
    showToast(`Nomor rekening ${accNumber} disalin!`, 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id) => {
    deleteBankAccount(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Header */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-palette-subtle shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-palette-primary/10 text-palette-primary flex items-center justify-center shadow-inner shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-palette-dark">
                Manajemen Rekening Bank
              </h2>
              <span className="bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Verifikasi Manual
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 max-w-xl">
              Kelola daftar rekening bank manual untuk transfer pembayaran pemain. Rekening dengan status <strong>Aktif</strong> otomatis tampil pada opsi pembayaran booking pertandingan & top up saldo.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveBankEdit({ isNew: true })}
          className="w-full md:w-auto py-2.5 px-5 bg-palette-primary hover:bg-palette-primaryDark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tambah Rekening Bank</span>
        </button>
      </div>

      {/* Stats Counter Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-palette-subtle shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Rekening</div>
            <div className="text-2xl font-black text-palette-dark mt-0.5">{totalCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-palette-primary flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-palette-subtle shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rekening Aktif</div>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">{activeCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-palette-subtle shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rekening Nonaktif</div>
            <div className="text-2xl font-black text-gray-500 mt-0.5">{inactiveCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center font-bold">
            <Power className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Metode Verifikasi</div>
            <div className="text-xs font-black text-amber-950 mt-1">Kode Unik & Bukti Transfer</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-200/60 text-amber-800 flex items-center justify-center font-bold">
            <Info className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-palette-subtle shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari bank, nomor rekening, pemilik..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-palette-bg rounded-xl text-xs font-medium border border-palette-subtle focus:ring-2 focus:ring-palette-primary/30 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <div className="flex bg-palette-bg p-1 rounded-xl border border-palette-subtle text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white shadow-xs text-palette-dark' : 'text-gray-500 hover:text-palette-dark'
              }`}
            >
              Semua ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-500 hover:text-palette-dark'
              }`}
            >
              Aktif ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'inactive' ? 'bg-gray-700 text-white shadow-xs' : 'text-gray-500 hover:text-palette-dark'
              }`}
            >
              Nonaktif ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Bank Account Cards Grid */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl border border-palette-subtle shadow-card text-center space-y-3">
          <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center mx-auto">
            <Landmark className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-palette-dark">Tidak ada rekening bank ditemukan</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all'
              ? 'Coba sesuaikan kata kunci pencarian atau filter status Anda.'
              : 'Belum ada rekening bank yang dikonfigurasi. Klik tombol tambah rekening di atas.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredAccounts.map((account) => {
            const isDeleting = deleteConfirmId === account.id;

            return (
              <div
                key={account.id}
                className={`bg-white rounded-3xl border transition-all duration-200 shadow-card overflow-hidden flex flex-col justify-between ${
                  account.isActive ? 'border-palette-subtle hover:border-palette-primary/50' : 'border-gray-200 opacity-80 bg-gray-50/50'
                }`}
              >
                {/* Card Top Header */}
                <div className="p-5 sm:p-6 pb-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-md"
                        style={{ backgroundColor: account.color || '#005baa' }}
                      >
                        {account.bankName.slice(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-palette-dark">
                            {account.bankName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              account.isActive
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : 'bg-gray-200 text-gray-700 border border-gray-300'
                            }`}
                          >
                            {account.isActive ? '✓ Aktif' : '✕ Nonaktif'}
                          </span>
                        </div>
                        {account.branch && (
                          <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            <span>{account.branch}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Active / Inactive Switch */}
                    <div className="flex flex-col items-end">
                      <label className="relative inline-flex items-center cursor-pointer" title="Aktifkan / Nonaktifkan Rekening">
                        <input
                          type="checkbox"
                          checked={account.isActive}
                          onChange={() => toggleBankAccountStatus(account.id)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-emerald-600"></div>
                      </label>
                      <span className="text-[9px] font-bold text-gray-400 mt-1">
                        {account.isActive ? 'Tampil di Form' : 'Disembunyikan'}
                      </span>
                    </div>
                  </div>

                  {/* Account Number Display Box */}
                  <div className="p-3.5 bg-palette-bg rounded-2xl border border-palette-subtle flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-gray-400">Nomor Rekening</div>
                      <div className="font-mono text-base font-black text-palette-primary tracking-wider mt-0.5">
                        {account.accountNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAccount(account.id, account.accountNumber)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-palette-subtle text-palette-dark text-xs font-bold border border-palette-subtle flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                      title="Salin Nomor Rekening"
                    >
                      {copiedId === account.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                      <span className="text-[10px] font-bold">{copiedId === account.id ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  {/* Account Details */}
                  <div className="mt-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Atas Nama (A/N):</span>
                      <strong className="text-palette-dark font-extrabold uppercase">{account.accountHolder}</strong>
                    </div>
                    {account.notes && (
                      <div className="flex justify-between items-center text-gray-500 text-[11px] pt-1 border-t border-gray-100">
                        <span>Catatan:</span>
                        <span className="text-gray-700 font-medium truncate max-w-[200px]">{account.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-4 pt-3 bg-palette-bg/40 border-t border-palette-subtle flex items-center justify-between">
                  <div className="text-[10px] font-mono text-gray-400">
                    ID: {account.id}
                  </div>

                  {isDeleting ? (
                    <div className="flex items-center gap-1.5 animate-fade-in">
                      <span className="text-[11px] text-red-600 font-bold">Hapus rekening ini?</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(account.id)}
                        className="px-2.5 py-1 bg-red-600 text-white rounded-lg text-[10px] font-extrabold shadow-xs hover:bg-red-700 transition-all cursor-pointer"
                      >
                        Ya, Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 bg-white border border-gray-300 text-gray-700 rounded-lg text-[10px] font-bold hover:bg-gray-100 transition-all cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActiveBankEdit(account)}
                        className="py-1.5 px-3 bg-palette-bg hover:bg-white text-palette-dark rounded-xl text-xs font-bold border border-palette-subtle transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-palette-primary" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(account.id)}
                        className="py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        title="Hapus Rekening"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guide Banner for Admin */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-palette-bg to-emerald-50/70 rounded-3xl border border-palette-subtle text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold text-palette-dark">
          <Info className="w-4 h-4 text-palette-primary" />
          <span>Cara Kerja Verifikasi Pembayaran Transfer Bank Manual</span>
        </div>
        <p className="text-gray-600 leading-relaxed text-[11px]">
          1. Ketika pemain memilih metode Transfer Bank, sistem menghasilkan <strong>3-digit kode unik</strong> untuk membedakan mutasi antar pemain.<br />
          2. Rekening yang berstatus <strong>Aktif</strong> otomatis ditampilkan pada dropdown / pilihan pembayaran di modal booking publik.<br />
          3. Admin dapat memeriksa mutasi masuk pada internet banking dan mengonfirmasi lunas di menu <strong>Validasi Transaksi</strong>.
        </p>
      </div>
    </div>
  );
};
