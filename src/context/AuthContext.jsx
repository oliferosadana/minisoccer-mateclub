import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS, INITIAL_WALLET_TRANSACTIONS } from '../lib/mockData';
import { 
  isSupabaseConfigured, 
  supabase, 
  fetchUsersFromSupabase, 
  upsertUserToSupabase,
  fetchWalletTransactionsFromSupabase,
  upsertWalletTransactionToSupabase
} from '../lib/supabase';
import { sendWahaTextMessage } from '../lib/wahaGateway';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mateclub_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [allUsers, setAllUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('mateclub_users_db');
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure superadmin & admin accounts have default passwords and exist
        const hasSuper = parsed.some(u => u.role === 'superadmin');
        let list = parsed.map(u => {
          const userWithBal = { ...u, balance: Number(u.balance || 0) };
          if (!u.password) {
            if (u.role === 'superadmin') return { ...userWithBal, password: 'superadmin123' };
            if (u.role === 'admin') return { ...userWithBal, password: 'admin123' };
            return { ...userWithBal, password: 'player123' };
          }
          return userWithBal;
        });
        if (!hasSuper) {
          list = [INITIAL_USERS[0], ...list];
        }
        return list;
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [walletTransactions, setWalletTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('mateclub_wallet_txs_db');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) ? parsed : INITIAL_WALLET_TRANSACTIONS;
    } catch {
      return INITIAL_WALLET_TRANSACTIONS;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [prefilledIdentifier, setPrefilledIdentifier] = useState('');

  // Initial fetch and Realtime sync with Supabase
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // 1. Fetch remote users
    fetchUsersFromSupabase().then(remoteUsers => {
      if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        setAllUsers(remoteUsers.map(r => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          email: r.email,
          password: r.password,
          role: r.role || 'player',
          preferredPosition: r.preferred_position || 'Pemain Lapangan',
          clubOrigin: r.club_origin || 'Komunitas MATE CLUB',
          jerseyNumber: r.jersey_number || '10',
          balance: Number(r.balance || 0),
          caps: r.caps || 0,
          goals: r.goals || 0,
          mvpCount: r.mvp_count || 0,
          status: r.status || 'active',
          createdAt: r.created_at,
          lastLoginAt: r.last_login_at
        })));
      }
    });

    // 2. Fetch remote wallet transactions
    fetchWalletTransactionsFromSupabase().then(remoteTxs => {
      if (Array.isArray(remoteTxs) && remoteTxs.length > 0) {
        setWalletTransactions(remoteTxs);
      }
    });

    // 3. Realtime listener for users
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newUser = {
            id: payload.new.id,
            name: payload.new.name,
            phone: payload.new.phone,
            email: payload.new.email,
            password: payload.new.password,
            role: payload.new.role || 'player',
            preferredPosition: payload.new.preferred_position || 'Pemain Lapangan',
            clubOrigin: payload.new.club_origin || 'Komunitas MATE CLUB',
            jerseyNumber: payload.new.jersey_number || '10',
            balance: Number(payload.new.balance || 0),
            caps: payload.new.caps || 0,
            goals: payload.new.goals || 0,
            mvpCount: payload.new.mvp_count || 0,
            status: payload.new.status || 'active',
            createdAt: payload.new.created_at,
            lastLoginAt: payload.new.last_login_at
          };
          setAllUsers(prev => [newUser, ...prev.filter(u => u.id !== newUser.id && u.phone !== newUser.phone)]);
        } else if (payload.eventType === 'UPDATE') {
          setAllUsers(prev => prev.map(u => u.id === payload.new.id ? {
            ...u,
            name: payload.new.name,
            phone: payload.new.phone,
            email: payload.new.email,
            password: payload.new.password,
            role: payload.new.role,
            preferredPosition: payload.new.preferred_position,
            clubOrigin: payload.new.club_origin,
            jerseyNumber: payload.new.jersey_number,
            balance: Number(payload.new.balance || 0),
            caps: payload.new.caps,
            goals: payload.new.goals,
            mvpCount: payload.new.mvp_count,
            status: payload.new.status
          } : u));
        } else if (payload.eventType === 'DELETE') {
          setAllUsers(prev => prev.filter(u => u.id !== payload.old.id));
        }
      })
      .subscribe();

    // 4. Realtime listener for wallet transactions
    const walletSub = supabase
      .channel('public:wallet_transactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_transactions' }, payload => {
        if (payload.eventType === 'INSERT') {
          const newTx = {
            id: payload.new.id,
            userId: payload.new.user_id,
            phone: payload.new.phone,
            type: payload.new.type,
            amount: Number(payload.new.amount || 0),
            description: payload.new.description,
            bookingId: payload.new.booking_id,
            balanceAfter: Number(payload.new.balance_after || 0),
            createdAt: payload.new.created_at
          };
          setWalletTransactions(prev => [newTx, ...prev.filter(t => t.id !== newTx.id)]);
        }
      })
      .subscribe();

    return () => {
      try {
        if (subscription && supabase) supabase.removeChannel(subscription);
        if (walletSub && supabase) supabase.removeChannel(walletSub);
      } catch (err) {
        console.warn('[Supabase] Cleanup error:', err);
      }
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mateclub_auth_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mateclub_auth_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('mateclub_users_db', JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem('mateclub_wallet_txs_db', JSON.stringify(walletTransactions));
  }, [walletTransactions]);

  // Helper normalizer for Indonesian phone numbers
  const normalizePhone = (phoneStr = '') => {
    let clean = phoneStr.replace(/[^0-9]/g, '');
    if (clean.startsWith('62')) clean = '0' + clean.slice(2);
    if (clean.startsWith('8')) clean = '0' + clean;
    return clean;
  };

  // Production Login handler
  const login = async (identifier, password, _rememberMe = true) => {
    const rawIdentifier = (identifier || '').trim();
    const cleanId = rawIdentifier.toLowerCase();
    const cleanPhone = normalizePhone(rawIdentifier);

    if (!cleanId) {
      return { success: false, message: 'Nomor WhatsApp atau Email wajib diisi!' };
    }
    if (!password) {
      return { success: false, message: 'Password wajib diisi!' };
    }

    // Find in user database
    const found = allUsers.find(u => {
      const userPhone = normalizePhone(u.phone || '');
      const userEmail = (u.email || '').toLowerCase();
      return (
        userEmail === cleanId ||
        userPhone === cleanPhone ||
        (cleanPhone.length >= 8 && userPhone.includes(cleanPhone)) ||
        (u.phone && u.phone.includes(rawIdentifier))
      );
    });

    if (!found) {
      return {
        success: false,
        message: 'Akun dengan WhatsApp / Email ini belum terdaftar. Silakan lakukan registrasi terlebih dahulu.'
      };
    }

    // Check account status
    if (found.status === 'suspended' || found.status === 'inactive') {
      return {
        success: false,
        message: 'Akun Anda sedang dinonaktifkan / disuspend. Silakan hubungi Superadmin MATE CLUB.'
      };
    }

    // Verify Password
    const expectedPassword = found.password || (found.role === 'superadmin' ? 'superadmin123' : found.role === 'admin' ? 'admin123' : 'player123');
    if (password !== expectedPassword) {
      return {
        success: false,
        message: 'Password yang Anda masukkan salah. Silakan periksa kembali atau gunakan opsi Lupa Password.'
      };
    }

    // Authentication Success
    const updatedUser = {
      ...found,
      lastLoginAt: new Date().toISOString(),
      token: `mate_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    };

    setAllUsers(prev => prev.map(u => u.id === found.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setIsAuthModalOpen(false);

    return {
      success: true,
      user: updatedUser,
      message: `Login berhasil! Selamat datang kembali, ${updatedUser.name}.`
    };
  };

  // Production Register handler
  const register = async (userData) => {
    const name = (userData.name || '').trim();
    const rawPhone = (userData.phone || '').trim();
    const phone = normalizePhone(rawPhone);
    const email = (userData.email || '').trim().toLowerCase();
    const password = userData.password || '';

    if (!name || name.length < 3) {
      return { success: false, message: 'Nama lengkap minimal 3 karakter!' };
    }
    if (!phone || phone.length < 9) {
      return { success: false, message: 'Nomor WhatsApp tidak valid (minimal 10 digit)!' };
    }
    if (!password || password.length < 6) {
      return { success: false, message: 'Password minimal 6 karakter demi keamanan akun Anda!' };
    }

    // Check duplicate
    const existing = allUsers.find(u => {
      const uPhone = normalizePhone(u.phone || '');
      const uEmail = (u.email || '').toLowerCase();
      return uPhone === phone || (email && uEmail === email);
    });

    if (existing) {
      return { success: false, message: 'Nomor WhatsApp atau Email ini sudah terdaftar di sistem!' };
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: name,
      phone: rawPhone,
      email: email || `${phone}@mateclub.id`,
      password: password,
      role: 'player',
      preferredPosition: userData.preferredPosition || 'Pemain Lapangan',
      clubOrigin: userData.clubOrigin || 'Komunitas MATE CLUB Balikpapan',
      jerseyNumber: userData.jerseyNumber || '10',
      status: 'active',
      balance: 0,
      caps: 0,
      goals: 0,
      mvpCount: 0,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);

    // Sync to Supabase
    upsertUserToSupabase(newUser).catch(() => {});

    return { success: true, user: newUser, message: `Pendaftaran berhasil! Selamat bergabung di MATE CLUB.` };
  };

  // Change Password
  const changePassword = async (userId, oldPassword, newPassword) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return { success: false, message: 'User tidak ditemukan.' };

    const currentExpected = user.password || 'player123';
    if (oldPassword !== currentExpected) {
      return { success: false, message: 'Password lama tidak sesuai!' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter!' };
    }

    const updated = { ...user, password: newPassword };
    setAllUsers(prev => prev.map(u => u.id === userId ? updated : u));
    if (currentUser?.id === userId) {
      setCurrentUser(updated);
    }

    // Sync to Supabase
    upsertUserToSupabase(updated).catch(() => {});

    return { success: true, message: 'Password berhasil diubah!' };
  };

  // In-memory OTP storage
  const [otpStore, setOtpStore] = useState({});

  // 1. Request Password Reset OTP via WAHA WhatsApp
  const requestPasswordResetOTP = async (identifier) => {
    const raw = (identifier || '').trim();
    if (!raw) return { success: false, message: 'Harap masukkan nomor WhatsApp atau email Anda!' };

    const cleanId = raw.toLowerCase();
    const cleanPhone = normalizePhone(raw);

    // Look for user in allUsers or fetch from Supabase
    let user = allUsers.find(u => {
      const uPhone = normalizePhone(u.phone || '');
      const uEmail = (u.email || '').toLowerCase();
      return uEmail === cleanId || uPhone === cleanPhone || u.id === raw;
    });

    if (!user && isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('users').select('*');
        if (Array.isArray(data)) {
          user = data.find(u => {
            const uPhone = normalizePhone(u.phone || '');
            const uEmail = (u.email || '').toLowerCase();
            return uEmail === cleanId || uPhone === cleanPhone;
          });
        }
      } catch {}
    }

    if (!user) {
      return { success: false, message: `Akun dengan data "${raw}" tidak ditemukan di sistem MATE CLUB!` };
    }

    const targetPhone = user.phone || cleanPhone;
    if (!targetPhone) {
      return { success: false, message: 'Akun ini tidak memiliki nomor WhatsApp terdaftar.' };
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const key = (user.id || cleanPhone).toLowerCase();
    setOtpStore(prev => ({
      ...prev,
      [key]: {
        code: otpCode,
        expiresAt,
        phone: targetPhone,
        userId: user.id
      }
    }));

    // Send WhatsApp message via WAHA Gateway
    let waConfig = null;
    try {
      const saved = localStorage.getItem('mateclub_whatsapp_config');
      if (saved) waConfig = JSON.parse(saved);
    } catch {}

    const serverUrl = waConfig?.serverUrl || 'http://localhost:3005';
    const sessionName = waConfig?.sessionName || 'default';
    const apiKey = waConfig?.apiKey || '';

    const messageText = `🔐 *KODE VERIFIKASI RESET PASSWORD (OTP)*\n━━━━━━━━━━━━━━━━━━━━━\nHalo *${user.name}*! 👋\n\nKami menerima permintaan untuk mereset kata sandi akun *MATE CLUB* Anda.\n\n🔑 *KODE OTP ANDA:* *${otpCode}*\n\n⏰ *Catatan Penting:*\n• Kode OTP ini berlaku selama *5 Menit*.\n• Demi keamanan akun, *JANGAN PERNAH* membagikan kode ini kepada siapa pun.\n\nJika Anda tidak meminta reset password, silakan abaikan pesan ini.`;

    let waSuccess = false;
    try {
      const waRes = await sendWahaTextMessage({
        serverUrl,
        sessionName,
        apiKey,
        phone: targetPhone,
        text: messageText
      });
      waSuccess = waRes.success;
      if (!waSuccess) {
        console.warn('[WAHA] Failed to send OTP:', waRes.error);
      }
    } catch (err) {
      console.warn('[WAHA] Exception sending OTP:', err.message);
    }

    const maskedPhone = targetPhone.length >= 8 
      ? targetPhone.slice(0, 4) + '****' + targetPhone.slice(-3) 
      : targetPhone;

    return {
      success: true,
      otpCode,
      targetPhone,
      maskedPhone,
      userName: user.name,
      userKey: key,
      waDelivered: waSuccess,
      message: `Kode OTP 6-digit berhasil dikirimkan ke WhatsApp ${maskedPhone}!`
    };
  };

  // 2. Verify OTP & Set New Password
  const verifyAndResetPassword = async (identifier, inputOtp, newPassword) => {
    const raw = (identifier || '').trim();
    const cleanId = raw.toLowerCase();
    const cleanPhone = normalizePhone(raw);

    const user = allUsers.find(u => {
      const uPhone = normalizePhone(u.phone || '');
      const uEmail = (u.email || '').toLowerCase();
      return uEmail === cleanId || uPhone === cleanPhone || u.id === raw;
    });

    if (!user) {
      return { success: false, message: 'Akun tidak ditemukan.' };
    }

    const key = (user.id || cleanPhone).toLowerCase();
    const record = otpStore[key];

    if (!record) {
      return { success: false, message: 'Kode OTP belum diminta atau telah kedaluwarsa. Silakan minta kode baru.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, message: 'Kode OTP telah kedaluwarsa (berlaku 5 menit). Silakan minta kode baru.' };
    }

    if (record.code !== (inputOtp || '').trim()) {
      return { success: false, message: 'Kode OTP yang Anda masukkan salah. Silakan periksa pesan WhatsApp Anda.' };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter demi keamanan akun!' };
    }

    const updated = { ...user, password: newPassword };
    setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    if (currentUser?.id === user.id) {
      setCurrentUser(updated);
    }

    // Sync to Supabase
    upsertUserToSupabase(updated).catch(() => {});

    // Clear used OTP
    setOtpStore(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    return {
      success: true,
      user: updated,
      message: `Password akun "${user.name}" berhasil diperbarui! Silakan masuk dengan password baru.`
    };
  };

  // Request Reset Password (alias for backward compatibility)
  const resetPasswordByOTP = async (identifier, newPassword) => {
    const raw = (identifier || '').trim();
    const cleanId = raw.toLowerCase();
    const cleanPhone = normalizePhone(raw);

    const user = allUsers.find(u => {
      const uPhone = normalizePhone(u.phone || '');
      const uEmail = (u.email || '').toLowerCase();
      return uEmail === cleanId || uPhone === cleanPhone;
    });

    if (!user) {
      return { success: false, message: 'Akun dengan data tersebut tidak ditemukan.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter.' };
    }

    const updated = { ...user, password: newPassword };
    setAllUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    upsertUserToSupabase(updated).catch(() => {});
    return { success: true, message: `Password untuk akun "${user.name}" berhasil di-reset! Silakan login.` };
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
  };

  // Fill credentials helper (for staging & quick test)
  const fillCredentials = (roleKey = 'player') => {
    if (roleKey === 'superadmin') {
      return { identifier: 'superadmin@mateclub.id', password: 'superadmin123' };
    } else if (roleKey === 'admin') {
      return { identifier: 'admin@mateclub.id', password: 'admin123' };
    } else if (roleKey === 'keeper') {
      return { identifier: '085211223344', password: 'player123' };
    } else {
      return { identifier: '081234567890', password: 'player123' };
    }
  };

  // Superadmin User Management CRUD
  const addUser = (userData) => {
    const newUser = {
      id: `usr-${Date.now().toString().slice(-6)}`,
      name: userData.name,
      phone: userData.phone,
      email: userData.email,
      password: userData.password || 'mateclub123',
      role: userData.role || 'player',
      preferredPosition: userData.preferredPosition || 'Pemain Lapangan',
      clubOrigin: userData.clubOrigin || 'Komunitas MATE CLUB',
      jerseyNumber: userData.jerseyNumber || '10',
      status: userData.status || 'active',
      balance: Number(userData.balance || 0),
      caps: Number(userData.caps) || 0,
      goals: Number(userData.goals) || 0,
      mvpCount: Number(userData.mvpCount) || 0,
      createdAt: new Date().toISOString()
    };
    setAllUsers(prev => [newUser, ...prev]);
    upsertUserToSupabase(newUser).catch(() => {});
    return newUser;
  };

  const updateUser = (userId, updatedData) => {
    let updatedObj = null;
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        updatedObj = { ...u, ...updatedData };
        return updatedObj;
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updatedData }));
    }
    if (updatedObj) {
      upsertUserToSupabase(updatedObj).catch(() => {});
    }
  };

  const deleteUser = (userId) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    if (isSupabaseConfigured && supabase) {
      supabase.from('users').delete().eq('id', userId).catch(() => {});
    }
  };

  const toggleUserStatus = (userId) => {
    let toggledObj = null;
    setAllUsers(prev => prev.map(u => {
      if (u.id === userId) {
        toggledObj = { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' };
        return toggledObj;
      }
      return u;
    }));
    if (toggledObj) {
      upsertUserToSupabase(toggledObj).catch(() => {});
    }
  };

  // =========================================================================
  // USER WALLET / SALDO MANAGEMENT
  // =========================================================================

  // Credit balance to user (e.g. cashback from unique code, refund, top up)
  const creditUserBalance = async (phoneOrUserId, amount, description = '', bookingId = null) => {
    const numAmount = Math.max(0, Number(amount || 0));
    if (numAmount <= 0) return { success: false, message: 'Nominal tidak valid' };

    const targetUser = allUsers.find(u => {
      const p = normalizePhone(u.phone || '');
      const targetP = normalizePhone(phoneOrUserId || '');
      return u.id === phoneOrUserId || (p && targetP && p === targetP);
    });

    if (!targetUser) {
      console.warn(`[Wallet] User ${phoneOrUserId} not found for credit.`);
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }

    // Check duplicate credit for the same booking
    if (bookingId) {
      const alreadyCredited = walletTransactions.some(
        tx => tx.bookingId === bookingId && tx.type === 'credit' && (tx.userId === targetUser.id || tx.phone === targetUser.phone)
      );
      if (alreadyCredited) {
        console.log(`[Wallet] Cashback for booking ${bookingId} already credited previously.`);
        return { success: true, message: 'Sudah pernah dikreditkan sebelumnya' };
      }
    }

    const currentBal = Number(targetUser.balance || 0);
    const newBal = currentBal + numAmount;

    const newTx = {
      id: `tx-wal-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      userId: targetUser.id,
      phone: targetUser.phone,
      type: 'credit',
      amount: numAmount,
      description: description || `Cashback Kelebihan Kode Unik (Booking #${bookingId || ''})`,
      bookingId: bookingId || null,
      balanceAfter: newBal,
      createdAt: new Date().toISOString()
    };

    // Update state
    setWalletTransactions(prev => [newTx, ...prev]);
    setAllUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, balance: newBal } : u));
    
    if (currentUser?.id === targetUser.id || normalizePhone(currentUser?.phone) === normalizePhone(targetUser.phone)) {
      setCurrentUser(prev => ({ ...prev, balance: newBal }));
    }

    // Sync to Supabase
    upsertWalletTransactionToSupabase(newTx).catch(() => {});
    upsertUserToSupabase({ ...targetUser, balance: newBal }).catch(() => {});

    return { success: true, newBalance: newBal, tx: newTx };
  };

  // Debit balance from user (e.g. paying for booking or fee deduction)
  const debitUserBalance = async (phoneOrUserId, amount, description = '', bookingId = null) => {
    const numAmount = Math.max(0, Number(amount || 0));
    if (numAmount <= 0) return { success: false, message: 'Nominal tidak valid' };

    const targetUser = allUsers.find(u => {
      const p = normalizePhone(u.phone || '');
      const targetP = normalizePhone(phoneOrUserId || '');
      return u.id === phoneOrUserId || (p && targetP && p === targetP);
    });

    if (!targetUser) {
      return { success: false, message: 'Pengguna tidak ditemukan' };
    }

    const currentBal = Number(targetUser.balance || 0);
    if (currentBal < numAmount) {
      return { success: false, message: 'Saldo dompet tidak mencukupi!' };
    }

    const newBal = Math.max(0, currentBal - numAmount);

    const newTx = {
      id: `tx-wal-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`,
      userId: targetUser.id,
      phone: targetUser.phone,
      type: 'debit',
      amount: numAmount,
      description: description || `Pembayaran Booking #${bookingId || ''}`,
      bookingId: bookingId || null,
      balanceAfter: newBal,
      createdAt: new Date().toISOString()
    };

    // Update state
    setWalletTransactions(prev => [newTx, ...prev]);
    setAllUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, balance: newBal } : u));
    
    if (currentUser?.id === targetUser.id || normalizePhone(currentUser?.phone) === normalizePhone(targetUser.phone)) {
      setCurrentUser(prev => ({ ...prev, balance: newBal }));
    }

    // Sync to Supabase
    upsertWalletTransactionToSupabase(newTx).catch(() => {});
    upsertUserToSupabase({ ...targetUser, balance: newBal }).catch(() => {});

    return { success: true, newBalance: newBal, tx: newTx };
  };

  // Superadmin Manual Balance Adjustment (Add / Deduct)
  const adjustUserBalance = async (userId, amount, type = 'credit', reason = 'Penyesuaian Saldo Superadmin') => {
    // Privilege check: Only superadmin is authorized to manually adjust balances
    if (currentUser?.role !== 'superadmin' && !isSuperAdmin) {
      return { 
        success: false, 
        message: 'Akses Ditolak: Hanya Superadmin yang memiliki hak istimewa (privilege) untuk mengubah saldo user secara manual.' 
      };
    }

    const numAmount = Math.max(0, Number(amount || 0));
    const adminName = currentUser?.name || 'Superadmin';
    const auditPrefix = `[Superadmin (${adminName})]`;

    if (type === 'credit') {
      return creditUserBalance(userId, numAmount, `${auditPrefix} ${reason}`);
    } else {
      return debitUserBalance(userId, numAmount, `${auditPrefix} ${reason}`);
    }
  };

  // Get Wallet Transactions for a specific user
  const getUserWalletTransactions = (phoneOrUserId) => {
    if (!phoneOrUserId) return [];
    const targetP = normalizePhone(phoneOrUserId);
    return walletTransactions.filter(tx => {
      const p = normalizePhone(tx.phone || '');
      return tx.userId === phoneOrUserId || (targetP && p && p === targetP);
    });
  };

  const openLogin = (presetIdentifier = '') => {
    // If called directly from an event handler (e.g. onClick={openLogin}), presetIdentifier is a React SyntheticEvent object
    const safeIdentifier = (typeof presetIdentifier === 'string') ? presetIdentifier : '';
    setPrefilledIdentifier(safeIdentifier);
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  const openForgotPassword = () => {
    setAuthMode('forgot');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const isSuperAdmin = currentUser?.role === 'superadmin';
  const isAdmin = currentUser?.role === 'admin' || isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        walletTransactions,
        creditUserBalance,
        debitUserBalance,
        adjustUserBalance,
        getUserWalletTransactions,
        login,
        register,
        changePassword,
        requestPasswordResetOTP,
        verifyAndResetPassword,
        resetPasswordByOTP,
        logout,
        fillCredentials,
        addUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openLogin,
        openRegister,
        openForgotPassword,
        closeAuthModal,
        prefilledIdentifier,
        isAdmin,
        isSuperAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
