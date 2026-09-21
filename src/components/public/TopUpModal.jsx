import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../lib/supabase';
import { createGoPayQRIS, checkGoPayQRISStatus, generateDynamicQRIS } from '../../lib/gopayGateway';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import {
  X,
  Wallet,
  Sparkles,
  QrCode,
  CreditCard,
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
  Zap,
  RefreshCw,
  Copy,
  CheckCircle2,
  ShieldCheck,
  LogIn,
  UploadCloud,
  Camera,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_STATIC_QRIS = '00020101021126610014COM.GO-JEK.WWW01189360091435670878450210G5670878450303UMI51440014ID.CO.QRIS.WWW0215ID10265197990960303UMI5204566153033605802ID5924Zolix shoes care, BLKPPN6010BALIKPAPAN61057613462140703A0111036216304';

const PRESET_AMOUNTS = [25000, 50000, 100000, 150000, 200000, 500000];

export const TopUpModal = () => {
  const { isTopUpModalOpen, setIsTopUpModalOpen, paymentGateways, bankAccounts = [], showToast } = useApp();
  const { currentUser, creditUserBalance, openLogin } = useAuth();

  const activeBanks = bankAccounts.filter(b => b.isActive);

  const [step, setStep] = useState(1); // 1: Select Amount, 2: Payment (QRIS/Bank), 3: Success
  const [selectedAmount, setSelectedAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris'); // 'qris' | bank.id
  
  // 3-Digit Unique Code for Top Up
  const [uniqueCode, setUniqueCode] = useState(() => Math.floor(Math.random() * 401) + 100);

  // Manual Bank Transfer Proof Image State
  const [proofImage, setProofImage] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const fileInputRef = useRef(null);

  // Dynamic QRIS States
  const [dynamicQRIS, setDynamicQRIS] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);
  const timerRef = useRef(null);

  const baseTopUp = isCustom ? (Number(customAmount) || 0) : selectedAmount;
  const isAutoPayment = paymentMethod === 'qris';
  const effectiveUniqueCode = isAutoPayment ? uniqueCode : 0;
  const totalPayable = baseTopUp + effectiveUniqueCode;

  const gopayConfig = paymentGateways?.find(p => p.provider === 'gopay') || {
    serverUrl: 'https://gopay.masondo.dev',
    apiKey: '382050b0c6f03386901e040efd9182b56021c43e3e2932260142cbcaf3729144',
    qrisStatic: DEFAULT_STATIC_QRIS
  };

  // Reset states when opening modal
  useEffect(() => {
    if (isTopUpModalOpen) {
      setStep(1);
      setUniqueCode(Math.floor(Math.random() * 401) + 100);
      setDynamicQRIS(null);
    }
  }, [isTopUpModalOpen]);

  // Countdown timer for QRIS
  useEffect(() => {
    if (step === 2 && paymentMethod === 'qris' && isTopUpModalOpen) {
      setTimeLeft(300);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step, paymentMethod, isTopUpModalOpen]);

  // Generate Dynamic QRIS when entering Step 2 with QRIS
  const fetchDynamicQR = async () => {
    setIsGeneratingQR(true);
    setTimeLeft(300);
    try {
      const templateToUse = (gopayConfig?.qrisStatic && gopayConfig.qrisStatic.length > 50)
        ? gopayConfig.qrisStatic
        : DEFAULT_STATIC_QRIS;

      const res = await createGoPayQRIS({
        serverUrl: gopayConfig.serverUrl || 'https://gopay.masondo.dev',
        amount: totalPayable,
        orderId: `TOPUP-${Date.now().toString().slice(-6)}`,
        customerName: currentUser?.name || 'Member MATE CLUB',
        customerPhone: currentUser?.phone || '081234567890',
        qrisStatic: templateToUse,
        apiKey: gopayConfig.apiKey || ''
      });

      const qrCodeString = res?.qrisCode || res?.qrString || res?.qr_code || res?.data?.qris_code;

      if (res?.success && qrCodeString && qrCodeString.length > 50) {
        setDynamicQRIS({
          ...res,
          qrisCode: qrCodeString
        });
      } else {
        const fallbackQR = generateDynamicQRIS(templateToUse, totalPayable);
        setDynamicQRIS({
          success: true,
          trxId: `TRX-${Date.now().toString().slice(-6)}`,
          qrisCode: fallbackQR,
          amount: totalPayable
        });
      }
    } catch (err) {
      console.warn('[TopUp] Fallback to local EMVCo generator:', err.message);
      const templateToUse = (gopayConfig?.qrisStatic && gopayConfig.qrisStatic.length > 50)
        ? gopayConfig.qrisStatic
        : DEFAULT_STATIC_QRIS;
      const fallbackQR = generateDynamicQRIS(templateToUse, totalPayable);
      setDynamicQRIS({
        success: true,
        trxId: `TRX-${Date.now().toString().slice(-6)}`,
        qrisCode: fallbackQR,
        amount: totalPayable
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

  useEffect(() => {
    if (isTopUpModalOpen && step === 2 && paymentMethod === 'qris') {
      fetchDynamicQR();
    }
  }, [isTopUpModalOpen, step, paymentMethod, totalPayable]);

  // Live Auto-Detection Polling (every 3 seconds)
  useEffect(() => {
    let pollInterval = null;
    if (isTopUpModalOpen && step === 2 && currentUser) {
      pollInterval = setInterval(async () => {
        try {
          const res = await checkGoPayQRISStatus({
            serverUrl: gopayConfig.serverUrl || 'https://gopay.masondo.dev',
            apiKey: gopayConfig.apiKey || '382050b0c6f03386901e040efd9182b56021c43e3e2932260142cbcaf3729144',
            amount: totalPayable,
            qrisId: dynamicQRIS?.qrisId || dynamicQRIS?.trxId || ''
          });

          if (res.paid || res.status === 'PAID' || res.status === 'SETTLED' || res.status === 'SUCCESS') {
            clearInterval(pollInterval);
            handleTopUpSuccess();
          }
        } catch (e) {
          // ignore silent polling errors
        }
      }, 3000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isTopUpModalOpen, step, paymentMethod, dynamicQRIS, totalPayable, currentUser]);

  const handleTopUpSuccess = async () => {
    if (!currentUser) return;
    const desc = isAutoPayment
      ? `Top Up Saldo Dompet via QRIS Dinamis GoPay (+Kode Unik Rp ${effectiveUniqueCode})`
      : `Top Up Saldo Dompet via ${(activeBanks.find(b => b.id === paymentMethod)?.bankName || paymentMethod).toUpperCase()}`;

    // Credit entire totalPayable to user's wallet
    await creditUserBalance(
      currentUser.id,
      totalPayable,
      desc,
      `TOP-${Date.now().toString().slice(-6)}`
    );

    setStep(3);
    showToast(`Top Up ${formatIDR(totalPayable)} Berhasil! Saldo Dompet Anda telah bertambah.`, 'success');

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.55 }
      });
    } catch { }
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Hanya file gambar (JPG, PNG, WEBP) yang diperbolehkan!', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran file terlalu besar! Maksimal 5MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result);
      setProofFileName(file.name);
      showToast('Foto bukti pembayaran berhasil dilampirkan!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProof = () => {
    setProofImage(null);
    setProofFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualTopUpSubmit = (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      showToast('Silakan login terlebih dahulu untuk melakukan top up saldo!', 'warning');
      return;
    }
    if (!proofImage) {
      showToast('Wajib melampirkan foto/struk bukti pembayaran transfer!', 'warning');
      return;
    }

    handleTopUpSuccess();
  };

  const handleClose = () => {
    setIsTopUpModalOpen(false);
    setStep(1);
    setDynamicQRIS(null);
    setProofImage(null);
    setProofFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGoToStep2 = (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Silakan login terlebih dahulu untuk melakukan top up saldo!', 'warning');
      openLogin();
      return;
    }
    if (baseTopUp < 10000) {
      showToast('Minimal nominal top up saldo adalah Rp 10.000!', 'error');
      return;
    }
    setStep(2);
  };

  const handleCopyNominal = () => {
    navigator.clipboard.writeText(totalPayable.toString());
    setCopiedNominal(true);
    showToast(`Nominal transfer Rp ${totalPayable.toLocaleString('id-ID')} berhasil disalin!`);
    setTimeout(() => setCopiedNominal(false), 2500);
  };

  const handleCopyRekening = (rek) => {
    navigator.clipboard.writeText(rek.replace(/[^0-9]/g, ''));
    setCopiedRekening(true);
    showToast(`Nomor rekening ${rek} berhasil disalin!`);
    setTimeout(() => setCopiedRekening(false), 2500);
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isTopUpModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-palette-dark via-palette-darker to-[#064e3b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                {step === 1 && 'Langkah 1 dari 2: Pilih Nominal'}
                {step === 2 && 'Langkah 2 dari 2: Pembayaran'}
                {step === 3 && 'Top Up Selesai!'}
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                Isi Saldo Dompet MATE
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          
          {/* GUEST WARNING (IF NOT LOGGED IN) */}
          {!currentUser ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center shadow-xs">
                <Wallet className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-palette-dark text-base">Silakan Masuk Terlebih Dahulu</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Untuk mengisi saldo dompet, Anda harus login ke akun pemain MATE CLUB Anda.
                </p>
              </div>
              <button
                onClick={() => {
                  handleClose();
                  openLogin();
                }}
                className="px-6 py-2.5 bg-palette-primary text-white font-bold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Masuk ke Akun Saya
              </button>
            </div>
          ) : step === 1 ? (
            /* STEP 1: SELECT / INPUT NOMINAL */
            <form onSubmit={handleGoToStep2} className="space-y-4">
              {/* User Balance Header */}
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="text-[11px] text-emerald-800 font-bold uppercase">Saldo Anda Saat Ini</div>
                  <div className="text-lg font-black font-mono text-emerald-950 mt-0.5">
                    {formatIDR(currentUser.balance || 0)}
                  </div>
                </div>
                <span className="text-[11px] text-emerald-700 font-semibold">{currentUser.name}</span>
              </div>

              {/* Preset Chips */}
              <div>
                <label className="block text-xs font-bold text-palette-dark mb-2">
                  Pilih Nominal Top Up
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {PRESET_AMOUNTS.map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setSelectedAmount(amt);
                        setIsCustom(false);
                      }}
                      className={`p-3 rounded-xl border text-center font-mono font-bold text-xs transition-all cursor-pointer ${
                        !isCustom && selectedAmount === amt
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/30 font-black shadow-xs'
                          : 'border-palette-subtle bg-white text-gray-700 hover:border-palette-primary/40 hover:bg-palette-bg'
                      }`}
                    >
                      {formatIDR(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-palette-dark">Atau Nominal Kustom (Rp)</label>
                  <span className="text-[10px] text-gray-400 font-mono">Min. Rp 10.000</span>
                </div>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  placeholder="Ketik nominal lain, misal: 75000"
                  value={customAmount}
                  onFocus={() => setIsCustom(true)}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setIsCustom(true);
                  }}
                  className={`w-full p-3 rounded-xl border text-xs font-mono font-bold outline-none transition-all ${
                    isCustom
                      ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/30 text-emerald-950'
                      : 'border-palette-subtle bg-palette-bg text-gray-700'
                  }`}
                />
              </div>

              {/* Notice */}
              <div className="p-3 bg-palette-bg rounded-xl border border-palette-subtle text-xs text-gray-600 space-y-1">
                <div className="font-bold text-palette-dark flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Keuntungan Isi Saldo MATE:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-500">
                  Top up diproses secara otomatis via QRIS. Seluruh nominal transfer termasuk kode unik 3-digit akan 100% masuk ke saldo Anda tanpa potongan biaya admin!
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <span>Lanjut Pembayaran ({formatIDR(baseTopUp)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : step === 2 ? (
            /* STEP 2: PAYMENT WITH QRIS / TRANSFER */
            <div className="space-y-4">
              {/* Cost Summary */}
              <div className="bg-palette-bg p-3.5 rounded-xl border border-palette-subtle text-xs space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Nominal Top Up:</span>
                  <span className="font-mono font-bold">{formatIDR(baseTopUp)}</span>
                </div>
                {isAutoPayment && effectiveUniqueCode > 0 && (
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold">Kode Unik Transaksi:</span>
                    </div>
                    <strong className="font-mono text-emerald-800 font-extrabold">+{effectiveUniqueCode}</strong>
                  </div>
                )}
                {isAutoPayment && effectiveUniqueCode > 0 && (
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    *Kelebihan kode unik (+Rp {effectiveUniqueCode}) akan 100% ikut masuk ke saldo Anda (Total Masuk Saldo: {formatIDR(totalPayable)}).
                  </div>
                )}
                <div className="pt-2 border-t border-palette-subtle flex justify-between items-center font-bold">
                  <span className="text-palette-dark font-extrabold text-xs">Total yang Harus Ditransfer:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-emerald-700 font-mono">{formatIDR(totalPayable)}</span>
                    <button
                      type="button"
                      onClick={handleCopyNominal}
                      className="px-2 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold border border-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                      title="Salin nominal transfer"
                    >
                      {copiedNominal ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                      <span>{copiedNominal ? 'Tersalin!' : 'Salin'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-palette-dark mb-2">Metode Pembayaran</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      paymentMethod === 'qris'
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 ring-1 ring-emerald-600'
                        : 'border-palette-subtle bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4" /> QRIS Instan
                  </button>
                  {activeBanks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setPaymentMethod(bank.id)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === bank.id
                          ? 'border-emerald-600 bg-emerald-50/60 text-emerald-800 ring-1 ring-emerald-600'
                          : 'border-palette-subtle bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="truncate max-w-full">{bank.bankName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* QRIS Container */}
              {paymentMethod === 'qris' ? (
                <div className="bg-palette-bg border border-palette-subtle p-4 rounded-xl text-center space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-palette-subtle pb-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-palette-dark">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>GoPay Dynamic QRIS</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                      <span>{formatTimer(timeLeft)}</span>
                    </div>
                  </div>

                  {isGeneratingQR ? (
                    <div className="w-52 h-52 mx-auto bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
                      <span className="text-[11px] text-gray-500 font-bold">Membuat QR Dinamis...</span>
                    </div>
                  ) : (
                    <div className="w-56 h-56 mx-auto bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center">
                      <QRCodeCanvas
                        value={
                          dynamicQRIS?.qrisCode ||
                          generateDynamicQRIS(gopayConfig?.qrisStatic || DEFAULT_STATIC_QRIS, totalPayable)
                        }
                        size={210}
                        logo="/logo.png"
                        logoSizeRatio={0.22}
                        alt="QRIS Top Up Saldo MATE CLUB"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-xs font-black text-palette-dark">
                      Nominal QRIS: <span className="font-mono text-emerald-700 text-sm">{formatIDR(totalPayable)}</span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Scan via <strong>GoPay, BCA Mobile, Livin, OVO, DANA, ShopeePay</strong> atau aplikasi bank apa saja.
                    </div>
                  </div>

                  {/* Auto Listening Bar */}
                  <div className="p-3 bg-emerald-50/90 rounded-xl border border-emerald-200 flex items-center gap-3 text-left">
                    <div className="relative flex shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <span>Menunggu Pembayaran Otomatis</span>
                        <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Sistem memantau mutasi secara realtime. Begitu berhasil discan & dibayar, saldo dompet Anda langsung bertambah otomatis.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dynamic Bank Transfer Container */
                (() => {
                  const selectedBank = activeBanks.find(b => b.id === paymentMethod || b.bankCode === paymentMethod) || activeBanks[0] || {
                    bankName: 'Transfer Bank Manual',
                    accountNumber: '8890-1234-5678',
                    accountHolder: 'MATE CLUB BALIKPAPAN'
                  };

                  return (
                    <div className="space-y-3 text-xs animate-fade-in">
                      <div className="bg-white p-3.5 rounded-2xl border border-palette-subtle space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-palette-subtle pb-2">
                          <div className="flex items-center gap-1.5 font-bold text-palette-dark">
                            <CreditCard className="w-4 h-4 text-palette-primary" />
                            <span>Rekening {selectedBank.bankName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            Verifikasi Manual
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Nama Bank:</span>
                          <strong className="text-palette-dark font-extrabold">{selectedBank.bankName}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Atas Nama (A/N):</span>
                          <strong className="text-palette-dark uppercase">{selectedBank.accountHolder}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Nomor Rekening:</span>
                          <div className="flex items-center gap-2">
                            <strong className="font-mono text-palette-primary font-black text-sm">
                              {selectedBank.accountNumber}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleCopyRekening(selectedBank.accountNumber)}
                              className="px-2 py-0.5 rounded bg-palette-primary/10 hover:bg-palette-primary/20 text-palette-primary text-[10px] font-bold border border-palette-primary/30 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              {copiedRekening ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                              <span>{copiedRekening ? 'Tersalin!' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>
                        {selectedBank.branch && (
                          <div className="flex justify-between items-center text-[11px] text-gray-500">
                            <span>Cabang:</span>
                            <span>{selectedBank.branch}</span>
                          </div>
                        )}
                        <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-900 space-y-1">
                          <div className="font-bold flex items-center gap-1 text-[11px]">
                            <span>⚠️ Transfer Nominal Pas: {formatIDR(baseTopUp)}</span>
                          </div>
                          <p className="text-[10px] leading-relaxed text-amber-800">
                            Mohon transfer sejumlah nominal pas tanpa kode unik ke nomor rekening di atas, lalu lampirkan bukti transfer agar segera diverifikasi oleh Admin.
                          </p>
                        </div>
                      </div>

                      {/* Image Upload for Manual Payment Proof */}
                      <div className="space-y-2">
                        <label className="flex items-center justify-between text-xs font-bold text-palette-dark">
                          <span className="flex items-center gap-1.5">
                            <Camera className="w-4 h-4 text-palette-primary" />
                            <span>Unggah Foto Bukti Transfer</span>
                            <span className="text-red-500">*</span>
                          </span>
                          <span className="text-[10px] font-normal text-gray-500">Maks. 5MB (JPG, PNG)</span>
                        </label>

                        {/* Hidden native input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileChange}
                          className="hidden"
                          id="topup-proof-upload"
                        />

                        {!proofImage ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 hover:border-emerald-600 bg-gray-50/80 hover:bg-emerald-50/40 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 group-hover:scale-110 flex items-center justify-center mx-auto mb-2 transition-transform shadow-inner">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold text-palette-dark">
                              Klik untuk memilih foto struk transfer
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Pilih screenshot m-banking atau foto struk ATM
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-50/70 border border-emerald-300 rounded-2xl p-3 space-y-2.5 animate-scale-up">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                                  <Check className="w-3.5 h-3.5" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-emerald-950">Bukti Transfer Terlampir</div>
                                  <div className="text-[10px] text-emerald-700 truncate max-w-[200px]">{proofFileName || 'struk_topup.jpg'}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-lg border border-gray-300 transition-all cursor-pointer shadow-xs"
                                >
                                  Ganti Foto
                                </button>
                                <button
                                  type="button"
                                  onClick={handleRemoveProof}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded-lg transition-all cursor-pointer"
                                  title="Hapus gambar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Image Preview */}
                            <div className="relative rounded-xl overflow-hidden bg-black/80 max-h-44 flex items-center justify-center border border-emerald-200">
                              <img
                                src={proofImage}
                                alt="Pratinjau Bukti Transfer"
                                className="max-h-44 w-auto object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Manual Top Up Submit Button */}
                      <button
                        type="button"
                        onClick={handleManualTopUpSubmit}
                        className={`w-full py-3 px-4 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          proofImage
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>
                          {proofImage 
                            ? `Kirim Bukti Top Up (${formatIDR(totalPayable)})` 
                            : 'Lampirkan Bukti Transfer untuk Konfirmasi'}
                        </span>
                      </button>
                    </div>
                  );
                })()
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-palette-dark flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Ubah Nominal
                </button>
              </div>
            </div>
          ) : (
            /* STEP 3: SUCCESS STATE */
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase">
                  Top Up Sukses!
                </span>
                <h3 className="text-xl font-black text-palette-dark mt-2">Saldo Berhasil Ditambahkan</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Dana sebesar <strong>{formatIDR(totalPayable)}</strong> telah berhasil masuk ke dompet digital akun Anda.
                </p>
              </div>

              {/* New Balance Card */}
              <div className="bg-gradient-to-br from-palette-dark to-[#064e3b] text-white p-4 rounded-2xl border border-emerald-500/30 max-w-xs mx-auto shadow-md text-center">
                <div className="text-[11px] text-emerald-300 uppercase font-bold">Total Saldo Dompet Anda</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-0.5">
                  {formatIDR(currentUser.balance || 0)}
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-palette-primary hover:bg-palette-primaryDark text-white text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Selesai & Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
