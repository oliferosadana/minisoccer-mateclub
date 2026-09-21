import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Landmark, Check, CreditCard, Building2, ShieldCheck, AlertCircle } from 'lucide-react';

const PRESET_BANKS = [
  { name: 'Bank BCA', code: 'bca', color: '#005baa' },
  { name: 'Bank Mandiri', code: 'mandiri', color: '#003366' },
  { name: 'Bank BRI', code: 'bri', color: '#00529b' },
  { name: 'Bank BNI', code: 'bni', color: '#f15a24' },
  { name: 'Bank BSI (Syariah)', code: 'bsi', color: '#00a39d' },
  { name: 'Bank CIMB Niaga', code: 'cimb', color: '#8b0000' },
  { name: 'Bank Permata', code: 'permata', color: '#008542' },
  { name: 'Bank Jago', code: 'jago', color: '#ff6600' },
  { name: 'Seabank', code: 'seabank', color: '#ff5722' },
  { name: 'Lainnya (Kustom)', code: 'custom', color: '#3f72af' }
];

export const BankEditModal = () => {
  const { activeBankEdit, setActiveBankEdit, addBankAccount, updateBankAccount, showToast } = useApp();

  const [bankName, setBankName] = useState('Bank BCA');
  const [customBankName, setCustomBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('MATE CLUB BALIKPAPAN');
  const [branch, setBranch] = useState('');
  const [color, setColor] = useState('#005baa');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (activeBankEdit && !activeBankEdit.isNew) {
      const isKnown = PRESET_BANKS.some(p => p.name.toLowerCase() === (activeBankEdit.bankName || '').toLowerCase());
      if (isKnown) {
        setBankName(activeBankEdit.bankName);
        setCustomBankName('');
      } else {
        setBankName('Lainnya (Kustom)');
        setCustomBankName(activeBankEdit.bankName || '');
      }
      setAccountNumber(activeBankEdit.accountNumber || '');
      setAccountHolder(activeBankEdit.accountHolder || 'MATE CLUB BALIKPAPAN');
      setBranch(activeBankEdit.branch || '');
      setColor(activeBankEdit.color || '#005baa');
      setNotes(activeBankEdit.notes || '');
      setIsActive(activeBankEdit.isActive !== false);
    } else {
      setBankName('Bank BCA');
      setCustomBankName('');
      setAccountNumber('');
      setAccountHolder('MATE CLUB BALIKPAPAN');
      setBranch('');
      setColor('#005baa');
      setNotes('Transfer manual / ATM / Mobile Banking');
      setIsActive(true);
    }
  }, [activeBankEdit]);

  if (!activeBankEdit) return null;

  const isEdit = !activeBankEdit.isNew;

  const handlePresetChange = (presetName) => {
    setBankName(presetName);
    const found = PRESET_BANKS.find(p => p.name === presetName);
    if (found && found.code !== 'custom') {
      setColor(found.color);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalBankName = bankName === 'Lainnya (Kustom)' ? customBankName.trim() : bankName;

    if (!finalBankName) {
      showToast('Harap isi nama bank!', 'error');
      return;
    }
    if (!accountNumber.trim()) {
      showToast('Harap isi nomor rekening!', 'error');
      return;
    }
    if (!accountHolder.trim()) {
      showToast('Harap isi atas nama pemilik rekening!', 'error');
      return;
    }

    const payload = {
      bankName: finalBankName,
      bankCode: finalBankName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      accountNumber: accountNumber.trim(),
      accountHolder: accountHolder.trim(),
      branch: branch.trim(),
      color: color || '#005baa',
      notes: notes.trim(),
      isActive: Boolean(isActive)
    };

    if (isEdit) {
      updateBankAccount(activeBankEdit.id, payload);
    } else {
      addBankAccount(payload);
    }

    setActiveBankEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
        
        {/* Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-palette-primary/20 text-palette-subtle flex items-center justify-center">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-palette-subtle font-bold">
                {isEdit ? 'Mode Pengeditan Rekening' : 'Tambah Rekening Baru'}
              </div>
              <h3 className="font-extrabold text-sm text-white">
                {isEdit ? `Edit ${activeBankEdit.bankName}` : 'Rekening Bank Verifikasi Manual'}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setActiveBankEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Bank Selector */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1.5">
              Pilih Bank *
            </label>
            <select
              value={bankName}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-palette-subtle bg-white text-xs font-bold text-palette-dark focus:ring-2 focus:ring-palette-primary/30 focus:outline-none"
            >
              {PRESET_BANKS.map((bank) => (
                <option key={bank.code} value={bank.name}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Bank Name if selected */}
          {bankName === 'Lainnya (Kustom)' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-palette-dark mb-1.5">
                Nama Bank Kustom *
              </label>
              <input
                type="text"
                placeholder="Contoh: Bank Kaltimtara / Bank Nagari"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-palette-subtle text-xs font-semibold text-palette-dark focus:ring-2 focus:ring-palette-primary/30 focus:outline-none"
                required
              />
            </div>
          )}

          {/* Account Number & Account Holder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-palette-primary" />
                <span>Nomor Rekening *</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 8890-1234-5678"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-palette-subtle font-mono text-xs font-black text-palette-primary focus:ring-2 focus:ring-palette-primary/30 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1.5">
                Atas Nama Pemilik (A/N) *
              </label>
              <input
                type="text"
                placeholder="Contoh: MATE CLUB BALIKPAPAN"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-palette-subtle text-xs font-bold text-palette-dark focus:ring-2 focus:ring-palette-primary/30 focus:outline-none uppercase"
                required
              />
            </div>
          </div>

          {/* Branch & Color Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Kantor Cabang (Opsional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: KCU Balikpapan Sudirman"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-palette-subtle text-xs font-medium text-palette-dark focus:ring-2 focus:ring-palette-primary/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1.5">
                Warna Identitas Bank
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-palette-subtle cursor-pointer p-1 bg-white"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-palette-subtle font-mono text-xs text-palette-dark uppercase"
                />
              </div>
            </div>
          </div>

          {/* Notes / Instructions */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1.5">
              Petunjuk Transfer / Catatan untuk Pemain
            </label>
            <input
              type="text"
              placeholder="Contoh: Transfer manual ATM / Livin / BCA Mobile"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-palette-subtle text-xs font-medium text-gray-700 focus:ring-2 focus:ring-palette-primary/30 focus:outline-none"
            />
          </div>

          {/* Status Toggle */}
          <div className="p-3.5 bg-palette-bg rounded-2xl border border-palette-subtle flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
              }`}>
                {isActive ? '✓' : '✕'}
              </div>
              <div>
                <div className="font-bold text-xs text-palette-dark">
                  Status Rekening Bank
                </div>
                <div className="text-[10px] text-gray-500">
                  {isActive 
                    ? 'Aktif: Rekening ini akan tampil di form booking & top up publik' 
                    : 'Nonaktif: Rekening ini disembunyikan dari pilihan pembayaran'}
                </div>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Alert Info Manual */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <strong>Metode Verifikasi Manual:</strong> Transfer antarbank diverifikasi oleh admin via pencocokan mutasi rekening atau kode unik 3-digit.
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-palette-subtle">
            <button
              type="button"
              onClick={() => setActiveBankEdit(null)}
              className="py-2.5 px-4 rounded-xl border border-palette-subtle text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-palette-primary hover:bg-palette-primaryDark text-white text-xs font-extrabold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isEdit ? 'Simpan Perubahan' : 'Tambahkan Rekening'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
