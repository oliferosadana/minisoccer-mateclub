import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatIDR } from '../../lib/supabase';
import { createGoPayQRIS, checkGoPayQRISStatus, generateDynamicQRIS } from '../../lib/gopayGateway';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import {
  X,
  User,
  Phone,
  ShieldCheck,
  QrCode,
  CreditCard,
  Check,
  Ticket,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Share2,
  RefreshCw,
  Clock,
  Zap,
  Shirt,
  UserPlus,
  LogIn,
  AlertCircle,
  Wallet,
  PlusCircle,
  UploadCloud,
  Trash2,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEFAULT_STATIC_QRIS = '00020101021126610014COM.GO-JEK.WWW01189360091435670878450210G5670878450303UMI51440014ID.CO.QRIS.WWW0215ID10265197990960303UMI5204566153033605802ID5924Zolix shoes care, BLKPPN6010BALIKPAPAN61057613462140703A0111036216304';

export const BookingModal = () => {
  const {
    activeBookingMatch,
    setActiveBookingMatch,
    createBooking,
    getVenueById,
    setActiveTicketBooking,
    paymentGateways,
    bankAccounts = [],
    showToast,
    setIsTopUpModalOpen
  } = useApp();
  const { currentUser, openLogin, openRegister } = useAuth();

  const activeBanks = bankAccounts.filter(b => b.isActive);

  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: Success

  // Form Inputs
  const [playerName, setPlayerName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('Pemain Lapangan'); // 'Pemain Lapangan' | 'Penjaga Gawang'
  const [jerseySize, setJerseySize] = useState('L'); // 'S' | 'M' | 'L' | 'XL' | 'XXL'
  const [paymentMethod, setPaymentMethod] = useState('qris'); // 'wallet' | 'qris' | bank.id
  const [useWallet, setUseWallet] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [copiedNominal, setCopiedNominal] = useState(false);
  const [copiedRekening, setCopiedRekening] = useState(false);

  // Manual Bank Transfer Proof Image State
  const [proofImage, setProofImage] = useState(null);
  const [proofFileName, setProofFileName] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const fileInputRef = useRef(null);

  // 3-Digit Unique Code for differentiating each player's transaction (100 - 500, max 500)
  const [uniqueCode, setUniqueCode] = useState(() => Math.floor(Math.random() * 401) + 100);

  // Dynamic QRIS State
  const [dynamicQRIS, setDynamicQRIS] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const timerRef = useRef(null);

  const gopayConfig = paymentGateways?.find(p => p.provider === 'gopay') || {
    serverUrl: 'https://gopay.masondo.dev',
    apiKey: '382050b0c6f03386901e040efd9182b56021c43e3e2932260142cbcaf3729144',
    qrisStatic: DEFAULT_STATIC_QRIS
  };

  const venue = activeBookingMatch ? getVenueById(activeBookingMatch.fieldId) : null;
  const isKeeper = position === 'Penjaga Gawang';
  const baseFee = activeBookingMatch
    ? (isKeeper
      ? (activeBookingMatch.keeperFee != null ? Number(activeBookingMatch.keeperFee) : 25000)
      : (activeBookingMatch.playerFee != null ? Number(activeBookingMatch.playerFee) : Number(activeBookingMatch.slotFee || 50000)))
    : 50000;

  // Wallet deduction calculation
  const userBalance = Number(currentUser?.balance || 0);
  const isWalletPaymentMode = paymentMethod === 'wallet';
  const walletDeduction = isWalletPaymentMode
    ? Math.min(userBalance, baseFee)
    : (useWallet ? Math.min(userBalance, baseFee) : 0);
  const remainingBaseFee = Math.max(0, baseFee - walletDeduction);
  const isFullWalletPay = isWalletPaymentMode && userBalance >= baseFee;

  // Total payable with unique transaction code (0 if fully paid by wallet)
  const totalPayable = isFullWalletPay ? 0 : (remainingBaseFee + uniqueCode);

  // Sync with current user & generate new 3-digit unique code (max 500)
  useEffect(() => {
    if (activeBookingMatch) {
      setUniqueCode(Math.floor(Math.random() * 401) + 100); // 100 to 500
    }
    if (currentUser) {
      setPlayerName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      if (currentUser.preferredPosition) {
        setPosition(currentUser.preferredPosition);
      }
      const bal = Number(currentUser.balance || 0);
      if (bal >= baseFee) {
        setPaymentMethod('wallet');
        setUseWallet(true);
      } else if (bal > 0) {
        setUseWallet(true);
        setPaymentMethod('qris');
      } else {
        setPaymentMethod('qris');
      }
    }
  }, [currentUser, activeBookingMatch]);

  // Generate Dynamic QRIS when switching to QRIS or entering Step 2
  const fetchDynamicQR = async () => {
    if (!activeBookingMatch || totalPayable <= 0) return;
    setIsGeneratingQR(true);
    setTimeLeft(300); // 5 minutes
    try {
      const templateToUse = (gopayConfig?.qrisStatic && gopayConfig.qrisStatic.length > 50)
        ? gopayConfig.qrisStatic
        : DEFAULT_STATIC_QRIS;

      const res = await createGoPayQRIS({
        serverUrl: gopayConfig.serverUrl || 'https://gopay.masondo.dev',
        amount: totalPayable,
        orderId: `BOOK-${Date.now().toString().slice(-6)}`,
        customerName: playerName || 'Player MATE CLUB',
        customerPhone: phone || '081234567890',
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
      console.warn('[GoPay Gateway] Gagal generate Dynamic QRIS:', err.message);
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
    if (activeBookingMatch && step === 2 && paymentMethod === 'qris' && totalPayable > 0) {
      fetchDynamicQR();
    }
  }, [activeBookingMatch, step, paymentMethod, totalPayable]);

  // Timer countdown for Dynamic QRIS
  useEffect(() => {
    if (activeBookingMatch && step === 2 && paymentMethod === 'qris' && totalPayable > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeBookingMatch, step, paymentMethod, totalPayable]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAutoVerifySuccess = (method = paymentMethod) => {
    const booking = createBooking({
      matchId: activeBookingMatch.id,
      playerName: playerName.trim(),
      phone: phone.trim(),
      bookingType: 'solo',
      position,
      jerseySize,
      baseAmount: baseFee,
      uniqueCode: uniqueCode,
      amount: totalPayable,
      usedWalletBalance: walletDeduction,
      paymentMethod: method === 'qris' ? 'qris_gopay' : method,
      paymentStatus: 'paid',
      proofImage: null,
      isAutoVerified: true
    });

    setCreatedBooking(booking);
    setStep(3);
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch { }
  };

  // Auto-polling verification in background every 3 seconds while in Step 2
  useEffect(() => {
    let pollInterval = null;
    if (activeBookingMatch && step === 2 && paymentMethod === 'qris' && totalPayable > 0) {
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
            showToast('Pembayaran Terverifikasi Lunas Otomatis!', 'success');
            handleAutoVerifySuccess(paymentMethod === 'qris' ? 'qris_gopay' : paymentMethod);
          }
        } catch {
          // ignore silent polling errors
        }
      }, 3000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [activeBookingMatch, step, paymentMethod, dynamicQRIS, totalPayable, gopayConfig]);

  const handleWalletDirectPay = (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      showToast('Wajib registrasi / login akun sebelum melakukan booking!', 'warning');
      return;
    }
    if (!playerName.trim() || !phone.trim()) {
      showToast('Harap lengkapi nama dan nomor WhatsApp!', 'error');
      return;
    }
    if (userBalance < baseFee) {
      showToast(`Saldo Dompet Anda (${formatIDR(userBalance)}) kurang ${formatIDR(baseFee - userBalance)}! Silakan Top Up terlebih dahulu.`, 'warning');
      setIsTopUpModalOpen(true);
      return;
    }

    const booking = createBooking({
      matchId: activeBookingMatch.id,
      playerName: playerName.trim(),
      phone: phone.trim(),
      bookingType: 'solo',
      position,
      jerseySize,
      baseAmount: baseFee,
      uniqueCode: 0,
      amount: baseFee,
      usedWalletBalance: baseFee,
      paymentMethod: 'wallet',
      paymentStatus: 'paid',
      proofImage: null,
      isAutoVerified: true
    });

    setCreatedBooking(booking);
    setStep(3);
    showToast(`Pembayaran Rp ${baseFee.toLocaleString('id-ID')} via Saldo Dompet Berhasil Lunas!`, 'success');
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
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

  const handleManualBankSubmit = (e) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      showToast('Wajib registrasi / login akun sebelum melakukan booking!', 'warning');
      return;
    }
    if (!playerName.trim() || !phone.trim()) {
      showToast('Harap lengkapi nama dan nomor WhatsApp!', 'error');
      return;
    }
    if (!proofImage) {
      showToast('Wajib melampirkan foto/struk bukti pembayaran transfer!', 'warning');
      return;
    }

    setIsSubmittingProof(true);

    const selectedBank = activeBanks.find(b => b.id === paymentMethod || b.bankCode === paymentMethod) || activeBanks[0] || {
      bankName: 'Transfer Bank Manual'
    };

    const booking = createBooking({
      matchId: activeBookingMatch.id,
      playerName: playerName.trim(),
      phone: phone.trim(),
      bookingType: 'solo',
      position,
      jerseySize,
      baseAmount: baseFee,
      uniqueCode: uniqueCode,
      amount: totalPayable,
      usedWalletBalance: walletDeduction,
      paymentMethod: selectedBank.bankName,
      paymentStatus: 'waiting_verification',
      proofImage: proofImage,
      isAutoVerified: false
    });

    setIsSubmittingProof(false);
    setCreatedBooking(booking);
    setStep(3);
    showToast('Bukti transfer berhasil dilampirkan! Menunggu verifikasi admin.', 'success');
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch { }
  };

  const handleClose = () => {
    setActiveBookingMatch(null);
    setStep(1);
    setCreatedBooking(null);
    setDynamicQRIS(null);
    setProofImage(null);
    setProofFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGoToStep2 = (e) => {
    e.preventDefault();
    if (!currentUser) {
      showToast('Wajib registrasi / login akun sebelum melakukan booking!', 'warning');
      return;
    }
    if (!playerName.trim() || !phone.trim()) {
      showToast('Harap lengkapi nama dan nomor WhatsApp!', 'error');
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

  // Safe early return AFTER all hooks
  if (!activeBookingMatch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">

        {/* Modal Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-palette-subtle uppercase tracking-wider">
              {step === 1 && (currentUser ? 'Langkah 1 dari 3: Data Peserta' : 'Otentikasi Akun Pemain')}
              {step === 2 && 'Langkah 2 dari 3: Pilih Metode & Konfirmasi Pembayaran'}
              {step === 3 && 'Langkah 3 dari 3: Booking Berhasil!'}
            </div>
            <h3 className="text-base font-extrabold text-white mt-0.5 truncate max-w-xs sm:max-w-md">
              {activeBookingMatch.title}
            </h3>
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
          {/* STEP 1: AUTH GATE OR PLAYER DETAILS */}
          {step === 1 && (
            !currentUser ? (
              /* --- MANDATORY REGISTRATION VIEW --- */
              <div className="text-center py-4 px-1 space-y-4 animate-fade-in">
                {/* Match Mini Snapshot */}
                <div className="bg-palette-bg p-3.5 rounded-2xl border border-palette-subtle text-xs flex items-center justify-between text-left">
                  <div>
                    <div className="font-extrabold text-palette-dark">{activeBookingMatch.title}</div>
                    <div className="text-gray-500">{activeBookingMatch.dateLabel || activeBookingMatch.date} • {activeBookingMatch.timeSlot}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-gray-500 font-bold uppercase">Tarif Slot</div>
                    <div className="text-sm font-black text-palette-primary font-mono">{formatIDR(baseFee)}</div>
                  </div>
                </div>

                <div className="w-16 h-16 rounded-3xl bg-palette-primary/10 text-palette-primary flex items-center justify-center mx-auto shadow-inner ring-8 ring-palette-primary/5">
                  <UserPlus className="w-8 h-8" />
                </div>

                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h4 className="text-base font-black text-palette-dark">
                    Wajib Registrasi / Masuk Akun
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Untuk mengamankan slot bermain, menerbitkan <strong>E-Ticket Resmi</strong>, dan menggunakan <strong>Saldo Dompet</strong>, pemain wajib memiliki akun terdaftar di <strong>MATE CLUB</strong>.
                  </p>
                </div>

                {/* Value Points */}
                <div className="grid grid-cols-1 gap-2 text-left bg-palette-bg/60 p-3.5 rounded-2xl border border-palette-subtle text-xs max-w-sm mx-auto">
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dapat membayar instan 1-klik menggunakan <strong>Saldo Dompet</strong></span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-palette-primary shrink-0" />
                    <span>E-Ticket QR Code unik otomatis tersimpan di profil akun</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-gray-700">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Tercatat resmi di Roster Match & Statistik Pemain</span>
                  </div>
                </div>

                {/* Auth Trigger Buttons */}
                <div className="space-y-2.5 max-w-sm mx-auto pt-2">
                  <button
                    type="button"
                    onClick={() => openRegister()}
                    className="w-full py-3 bg-palette-primary hover:bg-palette-primaryDark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" /> Buat Akun Pemain Baru (Gratis)
                  </button>

                  <button
                    type="button"
                    onClick={() => openLogin()}
                    className="w-full py-2.5 bg-palette-bg hover:bg-palette-subtle text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4 text-palette-primary" /> Sudah Punya Akun? Masuk Disini
                  </button>
                </div>
              </div>
            ) : (
              /* --- LOGGED-IN PLAYER DETAILS FORM --- */
              <form onSubmit={handleGoToStep2} className="space-y-4">
                {/* Match Snapshot */}
                <div className="bg-palette-bg p-3.5 rounded-xl border border-palette-subtle text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-palette-dark">{activeBookingMatch.dateLabel || activeBookingMatch.date}</div>
                    <div className="text-gray-500">{activeBookingMatch.timeSlot} • {venue?.name || 'Venue'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-gray-500 uppercase font-bold">Biaya Slot Dasar</div>
                    <div className="text-sm font-black text-palette-primary font-mono">{formatIDR(baseFee)}</div>
                  </div>
                </div>

                {/* Verified User Profile Card */}
                <div className="bg-gradient-to-r from-palette-primary/10 via-emerald-50 to-palette-bg border border-palette-primary/20 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-palette-primary text-white font-black text-xs flex items-center justify-center shadow-xs">
                      {currentUser.name ? currentUser.name.slice(0, 2).toUpperCase() : 'MC'}
                    </div>
                    <div>
                      <div className="font-extrabold text-palette-dark text-xs flex items-center gap-1.5">
                        <span>{currentUser.name}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-extrabold flex items-center gap-0.5 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Akun Terverifikasi
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        {currentUser.phone} • {currentUser.clubOrigin || 'Komunitas MATE CLUB'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2-SLOT CHOICE: PLAYER VS KEEPER */}
                <div>
                  <label className="block text-xs font-bold text-palette-dark mb-2">
                    Pilih Posisi Slot & Tarif *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Pemain Lapangan */}
                    <label
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${position === 'Pemain Lapangan'
                          ? 'border-palette-primary bg-palette-primary/5 text-palette-dark shadow-xs'
                          : 'border-palette-subtle bg-white text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          🏃 Pemain Lapangan
                        </span>
                        <input
                          type="radio"
                          name="booking_pos"
                          value="Pemain Lapangan"
                          checked={position === 'Pemain Lapangan'}
                          onChange={() => setPosition('Pemain Lapangan')}
                          className="accent-palette-primary"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-black font-mono text-palette-primary">
                          {formatIDR(activeBookingMatch.playerFee != null ? activeBookingMatch.playerFee : (activeBookingMatch.slotFee || 50000))}
                        </div>
                        <div className="text-[10px] text-gray-500 mt-0.5">Posisi bebas (DEF / MID / FWD)</div>
                      </div>
                    </label>

                    {/* Penjaga Gawang (Kiper) */}
                    <label
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${position === 'Penjaga Gawang'
                          ? 'border-emerald-600 bg-emerald-50/50 text-palette-dark shadow-xs'
                          : 'border-palette-subtle bg-white text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-800">
                          🧤 Penjaga Gawang
                        </span>
                        <input
                          type="radio"
                          name="booking_pos"
                          value="Penjaga Gawang"
                          checked={position === 'Penjaga Gawang'}
                          onChange={() => setPosition('Penjaga Gawang')}
                          className="accent-emerald-600"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-black font-mono text-emerald-700">
                          {formatIDR(activeBookingMatch.keeperFee != null ? activeBookingMatch.keeperFee : 25000)}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold mt-0.5">Diskon Khusus Kiper</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* JERSEY / SHIRT SIZE SELECTOR */}
                <div>
                  <label className="block text-xs font-bold text-palette-dark mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shirt className="w-3.5 h-3.5 text-palette-primary" />
                      <span>Ukuran Baju / Jersey Rompi *</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-palette-primary font-mono bg-palette-bg px-2 py-0.5 rounded border border-palette-subtle">
                      Size: {jerseySize}
                    </span>
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setJerseySize(size)}
                        className={`py-2 px-1 text-center font-black text-xs rounded-xl border transition-all cursor-pointer ${jerseySize === size
                            ? 'bg-palette-primary text-white border-palette-primary shadow-xs ring-2 ring-palette-primary/30'
                            : 'bg-palette-bg/60 text-palette-dark border-palette-subtle hover:bg-white hover:border-palette-primary/50'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                    <span>Panitia akan menyiapkan rompi/jersey ukuran ini di lapangan sebelum kick-off.</span>
                  </div>
                </div>

                {/* ACTION SUBMIT BUTTON TO STEP 2 */}
                <button
                  type="submit"
                  className="w-full py-3 bg-palette-primary hover:bg-palette-primaryDark text-white rounded-xl text-xs font-extrabold transition-all shadow-md flex items-center justify-center gap-2 mt-4 cursor-pointer"
                >
                  <span>Lanjut ke Pembayaran ({formatIDR(baseFee)})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )
          )}

          {/* STEP 2: PAYMENT METHOD & PROOF */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Transparent Cost Breakdown with Unique Code and Wallet Deduction */}
              <div className="bg-palette-bg p-3.5 rounded-xl border border-palette-subtle text-xs space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Nama Peserta:</span>
                  <strong className="text-palette-dark">{playerName} ({position} • Size {jerseySize})</strong>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Biaya Slot ({position}):</span>
                  <span className="font-mono">{formatIDR(baseFee)}</span>
                </div>

                {walletDeduction > 0 && (
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-100/60 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="font-bold">Potongan Saldo Dompet:</span>
                    </div>
                    <strong className="font-mono text-emerald-900 font-extrabold">- {formatIDR(walletDeduction)}</strong>
                  </div>
                )}

                {paymentMethod !== 'wallet' && (
                  <div className="flex justify-between items-center text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-bold">Kode Unik Transaksi:</span>
                    </div>
                    <strong className="font-mono text-emerald-800 font-extrabold">+{uniqueCode}</strong>
                  </div>
                )}

                {/* Cashback to wallet explanation */}
                {paymentMethod !== 'wallet' && (
                  <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200/80 text-[11px] text-emerald-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="leading-tight">
                      <strong>Otomatis Masuk Saldo:</strong> Kelebihan kode unik (<strong>+{uniqueCode}</strong>) akan otomatis <strong>100% masuk ke Saldo Dompet</strong> akun Anda setelah pembayaran lunas!
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-palette-subtle flex justify-between items-center font-bold">
                  <span className="text-palette-dark font-extrabold text-xs">Total Pembayaran:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-palette-primary font-mono">{formatIDR(totalPayable)}</span>
                    {totalPayable > 0 && (
                      <button
                        type="button"
                        onClick={handleCopyNominal}
                        className="px-2 py-0.5 rounded bg-palette-primary/10 hover:bg-palette-primary/20 text-palette-primary text-[10px] font-bold border border-palette-primary/30 transition-all flex items-center gap-1 cursor-pointer"
                        title="Salin nominal transfer"
                      >
                        {copiedNominal ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                        <span>{copiedNominal ? 'Tersalin!' : 'Salin'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Methods Tabs */}
              <div>
                <label className="block text-xs font-bold text-palette-dark mb-2">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('wallet');
                      setUseWallet(true);
                    }}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'wallet'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                        : 'border-palette-subtle bg-white text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>Saldo Dompet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qris')}
                    className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === 'qris'
                        ? 'border-palette-primary bg-palette-primary/5 text-palette-primary ring-1 ring-palette-primary'
                        : 'border-palette-subtle bg-white text-gray-600 hover:border-gray-300'
                      }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>QRIS Instan</span>
                  </button>
                  {activeBanks.map((bank) => (
                    <button
                      key={bank.id}
                      type="button"
                      onClick={() => setPaymentMethod(bank.id)}
                      className={`p-2 rounded-xl border text-center font-bold text-[11px] transition-all flex flex-col items-center gap-1 cursor-pointer ${paymentMethod === bank.id
                          ? 'border-palette-primary bg-palette-primary/5 text-palette-primary ring-1 ring-palette-primary'
                          : 'border-palette-subtle bg-white text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span className="truncate max-w-full">{bank.bankName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Content */}
              {paymentMethod === 'wallet' ? (
                <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-emerald-950">Pembayaran Saldo Dompet</div>
                        <div className="text-[11px] text-emerald-700">Saldo Akun: <strong className="font-mono">{formatIDR(userBalance)}</strong></div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsTopUpModalOpen(true)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                    >
                      <PlusCircle className="w-3 h-3" /> + Top Up
                    </button>
                  </div>

                  {userBalance >= baseFee ? (
                    <div className="space-y-3">
                      <div className="bg-white/80 p-3 rounded-xl border border-emerald-200 text-xs space-y-1.5">
                        <div className="flex justify-between text-gray-600">
                          <span>Biaya Booking Slot:</span>
                          <strong className="text-gray-900 font-mono">{formatIDR(baseFee)}</strong>
                        </div>
                        <div className="flex justify-between text-emerald-700">
                          <span>Dipotong dari Saldo:</span>
                          <strong className="font-mono">- {formatIDR(baseFee)}</strong>
                        </div>
                        <div className="flex justify-between text-gray-500 pt-1 border-t border-gray-200 text-[11px]">
                          <span>Sisa Saldo Setelah Transaksi:</span>
                          <strong className="text-emerald-800 font-mono font-bold">{formatIDR(userBalance - baseFee)}</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleWalletDirectPay}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4" />
                        <span>⚡ Konfirmasi Bayar Pakai Saldo ({formatIDR(baseFee)})</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs leading-relaxed">
                        ⚠️ Saldo Dompet Anda (<strong>{formatIDR(userBalance)}</strong>) kurang <strong>{formatIDR(baseFee - userBalance)}</strong> untuk melunasi booking slot ini.
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setIsTopUpModalOpen(true)}
                          className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5" /> Top Up Saldo Sekarang
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('qris')}
                          className="py-2.5 bg-white hover:bg-gray-100 text-palette-dark border border-gray-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5 text-palette-primary" /> Bayar via QRIS Saja
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : paymentMethod === 'qris' ? (
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
                      <RefreshCw className="w-6 h-6 text-palette-primary animate-spin" />
                      <span className="text-[11px] text-gray-500 font-bold">Membuat QR Dinamis...</span>
                    </div>
                  ) : (
                    <div className="w-56 h-56 mx-auto bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-center relative group">
                      <QRCodeCanvas
                        value={
                          dynamicQRIS?.qrisCode ||
                          generateDynamicQRIS(gopayConfig?.qrisStatic || DEFAULT_STATIC_QRIS, totalPayable)
                        }
                        size={210}
                        logo="/logo.png"
                        logoSizeRatio={0.22}
                        alt="QRIS Dinamis GoPay MATE CLUB"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="text-xs font-black text-palette-dark">
                      Nominal QRIS: <span className="font-mono text-palette-primary text-sm">{formatIDR(totalPayable)}</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                      (Biaya Slot {formatIDR(baseFee)} {walletDeduction > 0 ? `- Potongan Saldo ${formatIDR(walletDeduction)} ` : ''}+ Kode Unik +{uniqueCode})
                    </div>
                    <div className="text-[10px] text-gray-500">
                      Trx ID: <strong className="font-mono text-gray-700">{dynamicQRIS?.trxId || 'TRX-GOPAY-AUTO'}</strong>
                    </div>
                    <div className="text-[11px] text-gray-500 pt-1">
                      Scan via <strong>GoPay, BCA Mobile, Livin, OVO, DANA, ShopeePay</strong> atau bank apa saja.
                    </div>
                  </div>

                  {/* Dynamic Auto Detection Listening Banner */}
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
                        Sistem mendeteksi transaksi secara realtime. Begitu pembayaran selesai, E-Ticket resmi Anda akan langsung terbit otomatis.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                (() => {
                  const selectedBank = activeBanks.find(b => b.id === paymentMethod || b.bankCode === paymentMethod) || activeBanks[0] || {
                    bankName: 'Transfer Bank Manual',
                    accountNumber: '8890-1234-5678',
                    accountHolder: 'MATE CLUB BALIKPAPAN',
                    branch: 'Balikpapan'
                  };

                  return (
                    <div className="space-y-3.5 animate-fade-in">
                      {/* Bank Details Card */}
                      <div className="bg-gradient-to-br from-gray-50 to-palette-bg border border-palette-subtle p-4 rounded-2xl text-xs space-y-2.5 shadow-xs">
                        <div className="flex items-center justify-between border-b border-palette-subtle/80 pb-2">
                          <div className="flex items-center gap-1.5 font-bold text-palette-dark">
                            <CreditCard className="w-4 h-4 text-palette-primary" />
                            <span>Rekening {selectedBank.bankName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
                            Verifikasi Manual
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Nama Bank:</span>
                          <strong className="text-palette-dark font-extrabold">{selectedBank.bankName}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Nomor Rekening:</span>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-palette-primary font-mono text-sm font-black">
                              {selectedBank.accountNumber}
                            </strong>
                            <button
                              type="button"
                              onClick={() => handleCopyRekening(selectedBank.accountNumber)}
                              className="px-2 py-0.5 rounded bg-white hover:bg-gray-100 text-gray-700 text-[10px] font-bold border border-gray-300 cursor-pointer shadow-xs transition-all"
                            >
                              {copiedRekening ? 'Tersalin' : 'Salin'}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Atas Nama:</span>
                          <strong className="text-palette-dark uppercase">{selectedBank.accountHolder}</strong>
                        </div>
                        {selectedBank.branch && (
                          <div className="flex justify-between items-center text-[11px] text-gray-500">
                            <span>Kantor Cabang:</span>
                            <span>{selectedBank.branch}</span>
                          </div>
                        )}
                        <div className="p-2.5 bg-amber-50/90 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                          ⚠️ <strong>PENTING:</strong> Mohon transfer sebesar <strong>{formatIDR(totalPayable)}</strong> (termasuk 3-digit kode unik <strong>+{uniqueCode}</strong>), lalu lampirkan bukti transfer di bawah ini agar diverifikasi oleh Admin.
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
                          <span className="text-[10px] font-normal text-gray-500">Maks. 5MB (JPG, PNG, WEBP)</span>
                        </label>

                        {/* Hidden native input */}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileChange}
                          className="hidden"
                          id="booking-proof-upload"
                        />

                        {!proofImage ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-300 hover:border-palette-primary bg-gray-50/80 hover:bg-palette-primary/5 rounded-2xl p-4 text-center cursor-pointer transition-all group"
                          >
                            <div className="w-10 h-10 rounded-xl bg-palette-primary/10 text-palette-primary group-hover:scale-110 flex items-center justify-center mx-auto mb-2 transition-transform shadow-inner">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold text-palette-dark">
                              Klik untuk memilih foto / struk transfer
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              Ambil foto langsung atau pilih dari galeri HP / file laptop
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
                                  <div className="text-[10px] text-emerald-700 truncate max-w-[200px]">{proofFileName || 'struk_transfer.jpg'}</div>
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
                            <div className="relative rounded-xl overflow-hidden bg-black/80 max-h-48 flex items-center justify-center border border-emerald-200">
                              <img
                                src={proofImage}
                                alt="Pratinjau Bukti Transfer"
                                className="max-h-48 w-auto object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Manual Confirmation Submit Button */}
                      <button
                        type="button"
                        onClick={handleManualBankSubmit}
                        disabled={isSubmittingProof}
                        className={`w-full py-3 px-4 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          proofImage
                            ? 'bg-palette-primary hover:bg-palette-primaryDark text-white shadow-palette-primary/20'
                            : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>
                          {proofImage 
                            ? `Kirim Bukti Pembayaran (${formatIDR(totalPayable)})` 
                            : 'Lampirkan Bukti Transfer untuk Melanjutkan'}
                        </span>
                      </button>
                    </div>
                  );
                })()
              )}

              {/* Navigation Back */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2.5 px-4 bg-palette-bg text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle hover:bg-palette-subtle/50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Kembali / Ubah Data Peserta
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION & TICKET PASS */}
          {step === 3 && createdBooking && (
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
                <Check className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-black text-palette-dark">
                  {createdBooking.paymentStatus === 'paid' ? 'Booking & Pembayaran Berhasil Lunas!' : 'Booking Berhasil Dibuat!'}
                </h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                  {createdBooking.paymentMethod === 'wallet'
                    ? 'Pembayaran berhasil dipotong langsung dari Saldo Dompet MATE CLUB.'
                    : createdBooking.paymentStatus === 'paid'
                    ? 'Status pemain Anda telah resmi terverifikasi LUNAS otomatis.'
                    : 'Slot Anda telah diamankan. Pembayaran sedang diverifikasi oleh sistem.'}
                </p>
              </div>

              {/* Ticket Snapshot Card */}
              <div className="bg-palette-bg border border-palette-subtle p-4 rounded-2xl text-left text-xs space-y-2 shadow-inner">
                <div className="flex justify-between items-center border-b border-palette-subtle pb-2">
                  <span className="font-bold text-palette-dark">E-Ticket MATE CLUB</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${createdBooking.paymentStatus === 'paid'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                    }`}>
                    {createdBooking.paymentStatus === 'paid' ? '✓ Lunas & Terverifikasi' : 'Menunggu Verifikasi'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>Booking ID: <strong className="font-mono text-palette-primary block">{createdBooking.id}</strong></div>
                  <div>Kode Tiket: <strong className="font-mono text-palette-dark block">{createdBooking.ticketCode}</strong></div>
                  <div>Pemain: <strong className="block">{createdBooking.playerName} ({createdBooking.position})</strong></div>
                  <div>Jersey: <strong className="block font-mono text-palette-primary font-bold">Size {createdBooking.jerseySize || jerseySize}</strong></div>
                  <div>Metode: <strong className="block text-palette-dark font-bold capitalize">
                    {createdBooking.paymentMethod === 'wallet' ? '🪙 Saldo Dompet' : createdBooking.paymentMethod === 'qris_gopay' ? '📱 GoPay QRIS' : createdBooking.paymentMethod}
                  </strong></div>
                  <div>Total Biaya: <strong className="block text-emerald-700 font-mono font-black">{formatIDR(createdBooking.amount)}</strong></div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    handleClose();
                    setActiveTicketBooking(createdBooking);
                  }}
                  className="w-full py-2.5 px-4 bg-palette-primary hover:bg-palette-primaryDark text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4" /> Buka Tampilan Tiket Lengkap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
