import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Phone, 
  Lock, 
  User, 
  Shield, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  HelpCircle, 
  ArrowLeft,
  Mail,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    authMode, 
    setAuthMode, 
    closeAuthModal, 
    login, 
    register, 
    requestPasswordResetOTP,
    verifyAndResetPassword,
    fillCredentials,
    prefilledIdentifier 
  } = useAuth();

  const { showToast, setRole } = useApp();

  // Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register Form States
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPosition, setRegPosition] = useState('Pemain Lapangan');
  const [regClub, setRegClub] = useState('');
  const [regJersey, setRegJersey] = useState('10');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot Password Form States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotStep, setForgotStep] = useState(1); // 1: input identifier, 2: input OTP & new pass
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [maskedPhoneTarget, setMaskedPhoneTarget] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setErrorMessage('');
      if (typeof prefilledIdentifier === 'string' && prefilledIdentifier.trim() !== '') {
        setIdentifier(prefilledIdentifier.trim());
      } else {
        setIdentifier('');
      }
    }
  }, [isAuthModalOpen, prefilledIdentifier]);

  // Resend OTP Cooldown timer
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Harap masukkan nomor WhatsApp atau email!');
      return;
    }
    if (!password) {
      setErrorMessage('Harap masukkan password akun Anda!');
      return;
    }

    setLoading(true);
    const res = await login(identifier, password, rememberMe);
    setLoading(false);

    if (res.success) {
      showToast(res.message);
      // If admin or superadmin logged in, switch mode
      if (res.user.role === 'superadmin' || res.user.role === 'admin') {
        setRole('admin');
      }
    } else {
      setErrorMessage(res.message);
      showToast(res.message, 'error');
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regPhone.trim()) {
      setErrorMessage('Harap lengkapi nama dan nomor WhatsApp!');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('Password minimal 6 karakter demi keamanan akun!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok dengan password baru!');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Anda harus menyetujui ketentuan komunitas MATE CLUB!');
      return;
    }

    setLoading(true);
    const res = await register({
      name: regName,
      phone: regPhone,
      email: regEmail,
      password: regPassword,
      preferredPosition: regPosition,
      clubOrigin: regClub,
      jerseyNumber: regJersey
    });
    setLoading(false);

    if (res.success) {
      showToast(res.message);
    } else {
      setErrorMessage(res.message);
      showToast(res.message, 'error');
    }
  };

  // 1. Request OTP via WhatsApp
  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!forgotIdentifier.trim()) {
      setErrorMessage('Masukkan nomor WhatsApp atau email akun Anda!');
      return;
    }

    setLoading(true);
    const res = await requestPasswordResetOTP(forgotIdentifier);
    setLoading(false);

    if (res.success) {
      setForgotStep(2);
      setMaskedPhoneTarget(res.maskedPhone);
      setResendCooldown(60);
      showToast(res.message, 'success');
    } else {
      setErrorMessage(res.message);
      showToast(res.message, 'error');
    }
  };

  // 2. Verify OTP & Submit New Password
  const handleVerifyOtpAndReset = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setErrorMessage('Harap masukkan 6-digit kode OTP dari pesan WhatsApp Anda!');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password baru minimal 6 karakter!');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Konfirmasi password baru tidak cocok!');
      return;
    }

    setLoading(true);
    const res = await verifyAndResetPassword(forgotIdentifier, otpCode.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      showToast(res.message, 'success');
      setAuthMode('login');
      setIdentifier(forgotIdentifier);
      setPassword(newPassword);
      setForgotStep(1);
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } else {
      setErrorMessage(res.message);
      showToast(res.message, 'error');
    }
  };

  // Quick fill helper for testing
  const handleQuickFill = (roleKey) => {
    const creds = fillCredentials(roleKey);
    setIdentifier(creds.identifier);
    setPassword(creds.password);
    setErrorMessage('');
    showToast(`Kredensial ${roleKey.toUpperCase()} terisi otomatis! Silakan klik Masuk.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-6 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-palette-dark text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div>
            <div className="text-[11px] font-mono font-bold text-palette-primary uppercase tracking-widest flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURE AUTHENTICATION
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
              {authMode === 'login' && 'Masuk ke Akun MATE CLUB'}
              {authMode === 'register' && 'Daftar Member Pemain'}
              {authMode === 'forgot' && 'Reset Password Akun'}
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              {authMode === 'login' && 'Gunakan nomor WhatsApp / Email dan password terdaftar.'}
              {authMode === 'register' && 'Dapatkan passport digital, e-ticket & statistik gol.'}
              {authMode === 'forgot' && 'Verifikasi WhatsApp untuk memperbarui password Anda.'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher (Login / Register) */}
        {authMode !== 'forgot' && (
          <div className="flex border-b border-palette-subtle text-xs font-black bg-palette-bg shrink-0">
            <button
              onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-white text-palette-primary border-b-2 border-palette-primary shadow-2xs'
                  : 'text-gray-500 hover:text-palette-dark'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" /> Masuk Akun
            </button>
            <button
              onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-center transition-all flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-white text-palette-primary border-b-2 border-palette-primary shadow-2xs'
                  : 'text-gray-500 hover:text-palette-dark'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Registrasi Baru
            </button>
          </div>
        )}

        {/* Scrollable Form Container */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Error Alert Box */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="font-semibold leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FORM 1: LOGIN */}
          {/* ========================================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-palette-dark mb-1">
                  Nomor WhatsApp atau Email *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 081234567890 / admin@mateclub.id"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-palette-dark">Password *</label>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('forgot'); setForgotIdentifier(identifier); setErrorMessage(''); }}
                    className="text-[11px] font-bold text-palette-primary hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="accent-palette-primary w-3.5 h-3.5 rounded"
                  />
                  <span className="text-[11px] text-gray-600 font-semibold">Ingat saya di perangkat ini</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-palette-primary text-white rounded-xl text-xs font-extrabold hover:bg-palette-primaryDark transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                {loading ? 'Memverifikasi Kredensial...' : 'Masuk Sekarang'}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* FORM 2: REGISTER */}
          {/* ========================================================================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-palette-dark mb-1">Nama Lengkap *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rizky Pratama"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-palette-dark mb-1">WhatsApp Aktif *</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-palette-dark mb-1">Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="player@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-palette-dark mb-1">Posisi Utama</label>
                  <select
                    value={regPosition}
                    onChange={(e) => setRegPosition(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                  >
                    <option value="Pemain Lapangan">Pemain Lapangan</option>
                    <option value="Penjaga Gawang">Penjaga Gawang (Kiper)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-palette-dark mb-1">No. Punggung Favorit</label>
                  <input
                    type="text"
                    placeholder="10"
                    value={regJersey}
                    onChange={(e) => setRegJersey(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-palette-dark mb-1">Klub / Komunitas Asal</label>
                <input
                  type="text"
                  placeholder="Contoh: Persiba Fans Club / Komunitas Bebas"
                  value={regClub}
                  onChange={(e) => setRegClub(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                />
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block font-bold text-palette-dark mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 6 Karakter"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs pl-8 pr-8 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-gray-400"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-palette-dark mb-1">Konfirmasi Password *</label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Ulangi password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="accent-palette-primary w-3.5 h-3.5 rounded mt-0.5"
                  />
                  <span className="text-[11px] text-gray-600 leading-snug">
                    Saya menyetujui aturan permainan fair-play dan verifikasi booking otomatis MATE CLUB.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-palette-primary text-white rounded-xl text-xs font-extrabold hover:bg-palette-primaryDark transition-all shadow-md flex items-center justify-center gap-1.5 mt-3"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Mendaftarkan Akun...' : 'Daftar & Langsung Masuk'}
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* FORM 3: FORGOT PASSWORD (LIVE WHATSAPP OTP) */}
          {/* ========================================================================= */}
          {authMode === 'forgot' && (
            <div className="space-y-4 text-xs">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); setForgotStep(1); }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-palette-primary hover:underline mb-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Halaman Login
              </button>

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="bg-palette-bg/70 p-3.5 rounded-2xl border border-palette-subtle text-xs space-y-1">
                    <div className="font-extrabold text-palette-dark flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-palette-primary" />
                      <span>Verifikasi Reset Password Akun</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                      Sistem akan mengirimkan <strong>6-digit Kode OTP</strong> resmi langsung ke nomor WhatsApp yang terdaftar pada akun Anda.
                    </p>
                  </div>

                  <div>
                    <label className="block font-bold text-palette-dark mb-1">
                      Nomor WhatsApp atau Email Terdaftar *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Contoh: 081234567890 / player@gmail.com"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-palette-primary text-white rounded-xl text-xs font-extrabold hover:bg-palette-primaryDark transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    <Phone className="w-4 h-4" />
                    {loading ? 'Mengirimkan Kode via WhatsApp...' : 'Kirim Kode OTP via WhatsApp'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtpAndReset} className="space-y-3.5">
                  {/* OTP Notification Banner */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                    <div className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Kode OTP Terkirim ke WhatsApp!</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 leading-relaxed">
                      Periksa pesan masuk di WhatsApp <strong>{maskedPhoneTarget || forgotIdentifier}</strong> dan masukkan 6-digit kode OTP di bawah ini.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-palette-dark">Kode OTP (6 Digit) *</label>
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || loading}
                        onClick={handleRequestOtp}
                        className="text-[10px] font-bold text-palette-primary hover:underline disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {resendCooldown > 0 ? `Kirim Ulang (${resendCooldown}s)` : 'Kirim Ulang OTP'}
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      placeholder="• • • • • •"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-center font-mono font-black text-xl py-2.5 rounded-xl border-2 border-palette-primary bg-palette-bg focus:bg-white focus:border-palette-primary outline-none tracking-[0.4em]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-palette-dark mb-1">Password Baru (Min. 6 Karakter) *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        placeholder="Masukkan password baru"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs pl-3 pr-9 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-palette-dark mb-1">Konfirmasi Password Baru *</label>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Ulangi password baru"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                    />
                  </div>

                  <div className="pt-1 space-y-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-70"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {loading ? 'Memverifikasi & Menyimpan...' : 'Verifikasi OTP & Reset Password'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setForgotStep(1); setOtpCode(''); setErrorMessage(''); }}
                      className="w-full py-2 bg-palette-bg text-gray-600 rounded-xl text-[11px] font-bold hover:bg-palette-subtle/50 transition-all cursor-pointer"
                    >
                      Ganti Nomor WhatsApp / Email
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
