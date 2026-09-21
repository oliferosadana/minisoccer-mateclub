import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  checkWahaHealth, 
  getWahaSession, 
  startWahaSession, 
  stopWahaSession, 
  restartWahaSession, 
  fetchLiveWahaQR, 
  requestWahaPairingCode, 
  sendWahaTextMessage,
  sendWahaBulkMessages,
  fetchWahaMessageLogs
} from '../../lib/wahaGateway';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { 
  MessageSquare, 
  Send, 
  QrCode, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Key, 
  Smartphone, 
  Zap, 
  Sliders, 
  Check, 
  Copy,
  Edit,
  Save,
  Play,
  Square,
  Activity,
  Server,
  Code2,
  Terminal,
  ExternalLink,
  Layers,
  X,
  Radio,
  PhoneCall,
  ShieldCheck,
  Info,
  Megaphone,
  History,
  Users
} from 'lucide-react';

export const WhatsAppGatewaySection = () => {
  const { 
    whatsappConfig, 
    updateWhatsAppConfig, 
    updateWhatsAppTemplate, 
    toggleWhatsAppTemplate, 
    matches,
    broadcastMatchNotification,
    showToast 
  } = useApp();
  const { isSuperAdmin } = useAuth();

  const currentConfig = whatsappConfig || {
    provider: 'waha',
    serverUrl: 'http://localhost:3005',
    sessionName: 'default',
    engine: 'NOWEB',
    apiKey: '',
    status: 'STOPPED',
    deviceNumber: '6281251234567',
    deviceName: 'WAHA Core Server',
    webhookUrl: 'http://localhost:5173/api/webhooks/waha',
    autoReplyEnabled: true
  };

  // Health & Session state
  const [serverHealth, setServerHealth] = useState({ checked: false, isOnline: false, latency: null, error: null });
  const [isPinging, setIsPinging] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isStoppingSession, setIsStoppingSession] = useState(false);

  // Modal QR & Pairing State
  const [showQRModal, setShowQRModal] = useState(false);
  const [pairingTab, setPairingTab] = useState('qr'); // 'qr' | 'code'
  const [liveQRData, setLiveQRData] = useState(null);
  const [isFetchingQR, setIsFetchingQR] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(20);
  const [qrError, setQrError] = useState(null);

  // Phone Pairing Code State
  const [pairingPhone, setPairingPhone] = useState(currentConfig.deviceNumber || '081234567890');
  const [pairingCodeResult, setPairingCodeResult] = useState(null);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Test message dispatcher state
  const [testPhone, setTestPhone] = useState('081234567890');
  const [testMsg, setTestMsg] = useState('Halo Rizky! Ini adalah pesan pengujian resmi via WAHA (WhatsApp HTTP API) MATE CLUB ⚽.');
  const [isSending, setIsSending] = useState(false);
  const [lastDispatchLog, setLastDispatchLog] = useState(null);

  // Transmission Logs State
  const [transmissionLogs, setTransmissionLogs] = useState([]);
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);

  // Match Broadcast / Blast State
  const [selectedBlastMatchId, setSelectedBlastMatchId] = useState(matches?.[0]?.id || '');
  const [blastCustomText, setBlastCustomText] = useState('');
  const [isBlasting, setIsBlasting] = useState(false);

  // Template edit states
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateDraft, setTemplateDraft] = useState('');

  // WAHA API Config edit state
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [serverUrlDraft, setServerUrlDraft] = useState(currentConfig.serverUrl || 'http://localhost:3005');
  const [sessionNameDraft, setSessionNameDraft] = useState(currentConfig.sessionName || 'default');
  const [engineDraft, setEngineDraft] = useState(currentConfig.engine || 'NOWEB');
  const [apiKeyDraft, setApiKeyDraft] = useState(currentConfig.apiKey || '');
  const [adminPhoneDraft, setAdminPhoneDraft] = useState(currentConfig.adminPhone || '081251234567');
  const [adminNotifyEnabled, setAdminNotifyEnabled] = useState(currentConfig.adminNotifyEnabled !== false);
  const [playerNotifyEnabled, setPlayerNotifyEnabled] = useState(currentConfig.playerNotifyEnabled !== false);

  const pollIntervalRef = useRef(null);
  const qrTimerRef = useRef(null);

  // Check health on mount or when serverUrl/apiKey changes
  const runHealthCheck = async (silent = false) => {
    setIsPinging(true);
    const health = await checkWahaHealth({
      serverUrl: currentConfig.serverUrl,
      apiKey: currentConfig.apiKey
    });
    setServerHealth({
      checked: true,
      isOnline: health.success,
      latency: health.latency,
      error: health.error
    });
    setIsPinging(false);

    if (health.success) {
      // Also fetch session status
      const sessionRes = await getWahaSession({
        serverUrl: currentConfig.serverUrl,
        sessionName: currentConfig.sessionName,
        apiKey: currentConfig.apiKey
      });

      if (sessionRes.success && sessionRes.status) {
        updateWhatsAppConfig({
          status: sessionRes.status,
          deviceNumber: sessionRes.me?.id ? sessionRes.me.id.split('@')[0] : currentConfig.deviceNumber,
          deviceName: sessionRes.me?.pushName || currentConfig.deviceName
        });
      }
      if (!silent) {
        showToast(`[WAHA 200 OK] Server ${currentConfig.serverUrl} aktif (${health.latency}ms)!`);
      }
    } else {
      if (!silent) {
        showToast(`Server WAHA tidak dapat dihubungi di ${currentConfig.serverUrl}`, 'error');
      }
    }
  };

  useEffect(() => {
    runHealthCheck(true);
    const healthInterval = setInterval(() => {
      runHealthCheck(true);
    }, 4000);
    return () => clearInterval(healthInterval);
  }, [currentConfig.serverUrl, currentConfig.apiKey, currentConfig.sessionName]);

  // Load Live QR when modal opens
  const fetchQR = async () => {
    setIsFetchingQR(true);
    setQrError(null);
    setQrCountdown(20);

    const sessionRes = await getWahaSession({
      serverUrl: currentConfig.serverUrl,
      sessionName: currentConfig.sessionName,
      apiKey: currentConfig.apiKey
    });

    if (sessionRes.success && sessionRes.status === 'WORKING') {
      updateWhatsAppConfig({
        status: 'WORKING',
        deviceNumber: sessionRes.me?.id ? sessionRes.me.id.split('@')[0] : currentConfig.deviceNumber,
        deviceName: sessionRes.me?.pushName || currentConfig.deviceName
      });
      setIsFetchingQR(false);
      return;
    }

    const res = await fetchLiveWahaQR({
      serverUrl: currentConfig.serverUrl,
      sessionName: currentConfig.sessionName,
      apiKey: currentConfig.apiKey
    });

    if (res.success) {
      setLiveQRData(res.imageUrl || res.rawQR);
    } else {
      setQrError(res.error || 'Gagal memuat QR dari server WAHA.');
    }
    setIsFetchingQR(false);
  };


  useEffect(() => {
    if (showQRModal) {
      fetchQR();

      // Countdown timer for QR refresh
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
      qrTimerRef.current = setInterval(() => {
        setQrCountdown(prev => {
          if (prev <= 1) {
            fetchQR();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);

      // Status polling interval to auto-detect scan
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = setInterval(async () => {
        const sessionRes = await getWahaSession({
          serverUrl: currentConfig.serverUrl,
          sessionName: currentConfig.sessionName,
          apiKey: currentConfig.apiKey
        });

        if (sessionRes.success && sessionRes.status === 'WORKING') {
          clearInterval(pollIntervalRef.current);
          clearInterval(qrTimerRef.current);
          updateWhatsAppConfig({
            status: 'WORKING',
            deviceNumber: sessionRes.me?.id ? sessionRes.me.id.split('@')[0] : currentConfig.deviceNumber,
            deviceName: sessionRes.me?.pushName || currentConfig.deviceName
          });
          setShowQRModal(false);
          showToast('🎉 Berhasil Login! WhatsApp Anda telah terhubung ke server WAHA.', 'success');
        }
      }, 3000);
    } else {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
    };
  }, [showQRModal]);

  // Request Pairing Code
  const handleRequestPairingCode = async (e) => {
    e.preventDefault();
    if (!pairingPhone.trim()) {
      showToast('Masukkan nomor WhatsApp yang valid!', 'error');
      return;
    }
    setIsRequestingCode(true);
    setPairingCodeResult(null);

    const res = await requestWahaPairingCode({
      serverUrl: currentConfig.serverUrl,
      sessionName: currentConfig.sessionName,
      phoneNumber: pairingPhone,
      apiKey: currentConfig.apiKey
    });

    setIsRequestingCode(false);

    if (res.success && res.code) {
      setPairingCodeResult(res.code);
      showToast('Kode pairing berhasil digenerate dari server WAHA!', 'success');
    } else {
      showToast(res.error || 'Gagal meminta kode pairing dari server WAHA.', 'error');
    }
  };

  // Start Session
  const handleStartSession = async () => {
    setIsStartingSession(true);
    const res = await startWahaSession({
      serverUrl: currentConfig.serverUrl,
      sessionName: currentConfig.sessionName,
      apiKey: currentConfig.apiKey,
      engine: currentConfig.engine || 'NOWEB'
    });
    setIsStartingSession(false);

    if (res.success) {
      updateWhatsAppConfig({ status: res.session?.status || 'SCAN_QR_CODE' });
      showToast(`Session "${currentConfig.sessionName}" berhasil dijalankan! Silakan scan QR code.`);
      setShowQRModal(true);
    } else {
      showToast(res.error || 'Gagal memulai session WAHA', 'error');
    }
  };

  // Stop Session
  const handleStopSession = async () => {
    setIsStoppingSession(true);
    const res = await stopWahaSession({
      serverUrl: currentConfig.serverUrl,
      sessionName: currentConfig.sessionName,
      apiKey: currentConfig.apiKey
    });
    setIsStoppingSession(false);

    if (res.success) {
      updateWhatsAppConfig({ status: 'STOPPED' });
      showToast(`Session "${currentConfig.sessionName}" dihentikan.`);
    } else {
      showToast(res.error || 'Gagal menghentikan session', 'error');
    }
  };

  // Save Config
  const handleSaveConfig = (e) => {
    e.preventDefault();
    updateWhatsAppConfig({
      serverUrl: serverUrlDraft,
      sessionName: sessionNameDraft,
      engine: engineDraft,
      apiKey: apiKeyDraft,
      adminPhone: adminPhoneDraft,
      adminNotifyEnabled: adminNotifyEnabled,
      playerNotifyEnabled: playerNotifyEnabled,
      provider: 'waha'
    });
    setIsEditingConfig(false);
    showToast('Konfigurasi WAHA & Notifikasi berhasil disimpan!');
    setTimeout(() => runHealthCheck(false), 500);
  };

  // Dispatch real test message
  const handleSendTest = async (e, customTarget = null, customContent = null) => {
    if (e) e.preventDefault();
    const target = customTarget || testPhone;
    const content = customContent || testMsg;

    if (!target.trim() || !content.trim()) {
      showToast('Harap isi nomor telepon dan isi pesan!', 'error');
      return;
    }
    setIsSending(true);
    setLastDispatchLog(null);

    const res = await sendWahaTextMessage({
      serverUrl: currentConfig.serverUrl,
      sessionName: currentConfig.sessionName,
      phone: target,
      text: content,
      apiKey: currentConfig.apiKey
    });

    setIsSending(false);
    setLastDispatchLog({
      timestamp: new Date().toLocaleTimeString(),
      success: res.success,
      phone: target,
      text: content,
      response: res
    });

    if (res.success) {
      showToast(`Pesan WAHA berhasil dikirimkan ke ${target}!`, 'success');
    } else {
      showToast(`Gagal mengirim via WAHA: ${res.error}`, 'error');
    }
    loadTransmissionLogs();
  };

  // Load Transmission Logs from WAHA Server
  const loadTransmissionLogs = async () => {
    setIsFetchingLogs(true);
    const res = await fetchWahaMessageLogs({
      serverUrl: currentConfig.serverUrl,
      apiKey: currentConfig.apiKey
    });
    if (res.success) {
      setTransmissionLogs(res.logs || []);
    }
    setIsFetchingLogs(false);
  };

  useEffect(() => {
    loadTransmissionLogs();
    const interval = setInterval(loadTransmissionLogs, 6000);
    return () => clearInterval(interval);
  }, [currentConfig.serverUrl]);

  // Handle Match Broadcast
  const handleBroadcastMatch = async (e) => {
    e.preventDefault();
    if (!selectedBlastMatchId) {
      showToast('Pilih pertandingan terlebih dahulu!', 'warning');
      return;
    }
    setIsBlasting(true);
    const res = await broadcastMatchNotification(selectedBlastMatchId, blastCustomText);
    setIsBlasting(false);
    loadTransmissionLogs();
  };


  const handleStartEditTemplate = (tpl) => {
    setEditingTemplateId(tpl.id);
    setTemplateDraft(tpl.content);
  };

  const handleSaveTemplate = (templateId) => {
    updateWhatsAppTemplate(templateId, templateDraft);
    setEditingTemplateId(null);
  };

  const insertVariable = (variableKey) => {
    setTemplateDraft(prev => prev + variableKey);
  };

  const isWorking = currentConfig.status === 'WORKING';
  const isScanQR = currentConfig.status === 'SCAN_QR_CODE';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-palette-dark text-white p-6 sm:p-7 rounded-2xl border border-palette-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider">
              WAHA (WHATSAPP HTTP API) GATEWAY
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-300 text-xs font-semibold">Self-Hosted REST Gateway Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Integrasi WhatsApp Gateway & Notifikasi Otomatis
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Sistem pengiriman pesan konfirmasi booking, E-Ticket pemain, dan notifikasi real-time ke Admin via <strong>WAHA REST API</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => runHealthCheck(false)}
            disabled={isPinging}
            className="px-3.5 py-2 rounded-xl bg-palette-darker hover:bg-black/60 text-white font-bold text-xs border border-gray-700 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Activity className={`w-3.5 h-3.5 ${serverHealth.isOnline ? 'text-emerald-400' : 'text-red-400'} ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Memeriksa...' : 'Cek Status Server'}</span>
          </button>
          <a
            href="https://waha.devlike.pro"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Dokumentasi WAHA
          </a>
        </div>
      </div>

      {/* Server Health Diagnostic Bar */}
      {serverHealth.checked && !serverHealth.isOnline && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl text-xs space-y-2 text-amber-900 animate-fade-in">
          <div className="flex items-center gap-2 font-black text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Server WAHA Belum Terhubung di <code>{currentConfig.serverUrl}</code></span>
          </div>
          <p className="text-[11px] text-amber-700 leading-relaxed">
            Scan login WhatsApp membutuhkan instance WAHA aktif yang berjalan. Jika Anda menjalankan WAHA di komputer lokal melalui Docker, jalankan perintah berikut di terminal:
          </p>
          <div className="bg-palette-dark text-white p-3 rounded-xl font-mono text-[11px] flex items-center justify-between gap-2 overflow-x-auto">
            <code className="text-emerald-400 select-all">
              docker run -d -p 3000:3000 --name waha -e WHATSAPP_DEFAULT_ENGINE=NOWEB -e WAHA_CORS_ORIGIN=* devlikeapp/waha
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText('docker run -d -p 3000:3000 --name waha -e WHATSAPP_DEFAULT_ENGINE=NOWEB -e WAHA_CORS_ORIGIN=* devlikeapp/waha');
                showToast('Perintah Docker WAHA berhasil disalin!');
              }}
              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-bold shrink-0 transition-colors"
            >
              Salin Command
            </button>
          </div>
        </div>
      )}

      {/* WAHA Server & Session Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Card */}
        <div className="bg-white p-5 rounded-2xl border border-palette-subtle shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-palette-dark flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-600" /> Session: [{currentConfig.sessionName || 'default'}]
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 ${
                isWorking
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isScanQR
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isWorking ? 'bg-emerald-600 animate-pulse' : isScanQR ? 'bg-amber-500 animate-ping' : 'bg-red-600'}`}></span>
                {currentConfig.status || 'STOPPED'}
              </span>
            </div>

            <div className="bg-palette-bg p-3.5 rounded-xl border border-palette-subtle text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-gray-500">WAHA Endpoint:</span>
                <strong className="text-palette-dark truncate max-w-[150px]">{currentConfig.serverUrl}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Engine Type:</span>
                <strong className="text-palette-primary">{currentConfig.engine || 'NOWEB'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Device Number:</span>
                <strong className="text-palette-dark">{currentConfig.deviceNumber || 'Belum Tertaut'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">WA Admin Notif:</span>
                <strong className="text-emerald-700 font-bold">{currentConfig.adminPhone || '081251234567'}</strong>
              </div>
            </div>
          </div>

          {/* Session Controller Buttons */}
          <div className="pt-2 border-t border-palette-subtle/70 space-y-2">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              KONTROL SESSION WAHA
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleStartSession}
                disabled={isStartingSession}
                className="py-2 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
              >
                <Play className={`w-3 h-3 ${isStartingSession ? 'animate-spin' : ''}`} />
                <span>{isStartingSession ? 'Memulai...' : 'Start Session'}</span>
              </button>
              <button
                onClick={handleStopSession}
                disabled={isStoppingSession}
                className="py-2 px-2 bg-red-50 hover:bg-red-100 text-red-800 border border-red-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all"
              >
                <Square className={`w-3 h-3 ${isStoppingSession ? 'animate-spin' : ''}`} />
                <span>{isStoppingSession ? 'Menyetop...' : 'Stop Session'}</span>
              </button>
            </div>
            <button
              onClick={() => runHealthCheck(false)}
              disabled={isPinging}
              className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? 'Sinkronisasi Sesi...' : 'Sinkronkan Status dari WAHA'}</span>
            </button>
            <button
              onClick={() => setShowQRModal(true)}
              className="w-full py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <QrCode className="w-4 h-4" /> Buka QR Code &amp; Pairing WhatsApp
            </button>
          </div>
        </div>

        {/* WAHA REST API Configuration Card */}
        <div className="bg-white p-5 rounded-2xl border border-palette-subtle shadow-card lg:col-span-2 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold text-palette-dark flex items-center gap-2">
                <Code2 className="w-4 h-4 text-palette-primary" /> Konfigurasi Notifikasi & Endpoint WAHA REST
              </span>
              {!isEditingConfig ? (
                <button
                  onClick={() => setIsEditingConfig(true)}
                  className="text-palette-primary font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Konfigurasi
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingConfig(false)}
                  className="text-gray-500 text-xs hover:underline"
                >
                  Batal
                </button>
              )}
            </div>

            {!isEditingConfig ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-palette-bg border border-palette-subtle">
                  <div className="text-gray-500 text-[11px] mb-1">WAHA Server URL:</div>
                  <div className="font-mono font-bold text-palette-dark truncate">{currentConfig.serverUrl}</div>
                </div>
                <div className="p-3 rounded-xl bg-palette-bg border border-palette-subtle">
                  <div className="text-gray-500 text-[11px] mb-1">Nomor WhatsApp Admin Penerima Notifikasi:</div>
                  <div className="font-mono font-bold text-emerald-700">{currentConfig.adminPhone || '081251234567'}</div>
                </div>
                <div className="p-3 rounded-xl bg-palette-bg border border-palette-subtle">
                  <div className="text-gray-500 text-[11px] mb-1">Notifikasi Transaksi ke Admin:</div>
                  <div className="font-mono font-bold text-palette-dark flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${currentConfig.adminNotifyEnabled !== false ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    <span>{currentConfig.adminNotifyEnabled !== false ? 'Aktif (Otomatis Kirim)' : 'Non-Aktif'}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-palette-bg border border-palette-subtle">
                  <div className="text-gray-500 text-[11px] mb-1">Notifikasi Tagihan & E-Ticket ke Pemain:</div>
                  <div className="font-mono font-bold text-palette-dark flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${currentConfig.playerNotifyEnabled !== false ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                    <span>{currentConfig.playerNotifyEnabled !== false ? 'Aktif (Otomatis Kirim)' : 'Non-Aktif'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveConfig} className="space-y-4">
                {/* Preset Quick Select */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1.5 uppercase">Pilihan Cepat Server WAHA:</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setServerUrlDraft('http://localhost:3005');
                        setSessionNameDraft('default');
                      }}
                      className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-palette-subtle bg-palette-bg hover:bg-palette-subtle text-palette-dark transition-colors"
                    >
                      🚀 Port 3005 (Embedded Local)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServerUrlDraft('http://localhost:3000');
                        setSessionNameDraft('default');
                      }}
                      className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-palette-subtle bg-palette-bg hover:bg-palette-subtle text-palette-dark transition-colors"
                    >
                      🐳 Port 3000 (Docker WAHA)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setServerUrlDraft('https://waha.masondo.dev');
                        setSessionNameDraft('default');
                      }}
                      className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-palette-subtle bg-palette-bg hover:bg-palette-subtle text-palette-dark transition-colors"
                    >
                      ☁️ Cloud WAHA VPS
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">WAHA Server URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="http://localhost:3005 atau http://localhost:3000"
                      value={serverUrlDraft}
                      onChange={(e) => setServerUrlDraft(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">Session Name WAHA *</label>
                    <input
                      type="text"
                      required
                      placeholder="default"
                      value={sessionNameDraft}
                      onChange={(e) => setSessionNameDraft(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      X-Api-Key (Opsional - Kosongkan jika tanpa API Key)
                    </label>
                    <input
                      type="text"
                      placeholder="waha_secret_api_key..."
                      value={apiKeyDraft}
                      onChange={(e) => setApiKeyDraft(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 mb-1">
                      Nomor WhatsApp Admin (Penerima Notifikasi) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Contoh: 081251234567"
                      value={adminPhoneDraft}
                      onChange={(e) => setAdminPhoneDraft(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-palette-subtle bg-palette-bg text-xs cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={adminNotifyEnabled}
                      onChange={(e) => setAdminNotifyEnabled(e.target.checked)}
                      className="accent-palette-primary"
                    />
                    <span>Notifikasi Transaksi Baru ke WhatsApp Admin</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-palette-subtle bg-palette-bg text-xs cursor-pointer font-bold">
                    <input
                      type="checkbox"
                      checked={playerNotifyEnabled}
                      onChange={(e) => setPlayerNotifyEnabled(e.target.checked)}
                      className="accent-palette-primary"
                    />
                    <span>Notifikasi Tagihan &amp; E-Ticket ke WhatsApp Pemain</span>
                  </label>
                </div>

                <div className="flex flex-wrap gap-2 pt-1 items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="py-2.5 px-4 bg-palette-primary text-white text-xs font-extrabold rounded-xl hover:bg-palette-primaryDark transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" /> Simpan Konfigurasi WAHA
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingConfig(false)}
                      className="py-2.5 px-3 bg-palette-bg text-gray-600 text-xs font-bold rounded-xl border border-palette-subtle"
                    >
                      Batal
                    </button>
                  </div>

                  {/* Manual Status Force to WORKING */}
                  <button
                    type="button"
                    onClick={() => {
                      updateWhatsAppConfig({
                        serverUrl: serverUrlDraft,
                        sessionName: sessionNameDraft,
                        apiKey: apiKeyDraft,
                        adminPhone: adminPhoneDraft,
                        adminNotifyEnabled: adminNotifyEnabled,
                        playerNotifyEnabled: playerNotifyEnabled,
                        status: 'WORKING',
                        provider: 'waha'
                      });
                      setIsEditingConfig(false);
                      showToast('✅ Status WAHA berhasil disetel menjadi WORKING (Terhubung)!', 'success');
                    }}
                    className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                    title="Gunakan jika WhatsApp Anda sudah login di Dashboard WAHA"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Set Langsung ke "WORKING"</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs flex items-center justify-between text-emerald-900">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Notifikasi Transaksi: Pemain (Invoice/Tiket) & Admin (Info Booking) Otomatis Terkirim!</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-800">WAHA Ready</span>
          </div>
        </div>
      </div>

      {/* WAHA Trigger Templates Manager */}
      <div className="bg-white p-6 rounded-2xl border border-palette-subtle shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-palette-dark flex items-center gap-2">
            <Layers className="w-4 h-4 text-palette-primary" /> Template Pesan Otomatis WAHA (Triggers)
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Format pesan WAHA yang akan dikirimkan otomatis ke nomor WhatsApp peserta pada setiap event pertandingan.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(currentConfig.templates || []).map(tpl => {
            const isEditing = editingTemplateId === tpl.id;

            return (
              <div
                key={tpl.id}
                className="bg-palette-bg/60 p-4 rounded-xl border border-palette-subtle flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-extrabold text-xs text-palette-dark">{tpl.name}</div>
                      <div className="text-[10px] text-emerald-700 font-mono font-bold">
                        WAHA Endpoint: {tpl.endpoint || '/api/sendText'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleWhatsAppTemplate(tpl.id)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tpl.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {tpl.enabled ? 'Aktif' : 'Mati'}
                      </button>
                      {!isEditing && (
                        <button
                          onClick={() => handleStartEditTemplate(tpl)}
                          className="p-1 text-palette-primary hover:bg-white rounded transition-all"
                          title="Edit Template"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {!isEditing ? (
                    <div className="p-3 bg-white rounded-lg border border-palette-subtle text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto">
                      {tpl.content}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Dynamic Variable Chips */}
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {['{nama_pemain}', '{kode_booking}', '{kode_tiket}', '{no_wa}', '{posisi}', '{ukuran_baju}', '{biaya_slot}', '{kode_unik}', '{total_bayar}', '{judul_game}', '{tanggal}', '{jam}', '{nama_lapangan}', '{link_tiket}'].map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => insertVariable(v)}
                            className="px-1.5 py-0.5 rounded bg-palette-subtle text-palette-dark font-mono hover:bg-palette-primary hover:text-white transition-colors"
                          >
                            + {v}
                          </button>
                        ))}
                      </div>

                      <textarea
                        rows={6}
                        value={templateDraft}
                        onChange={(e) => setTemplateDraft(e.target.value)}
                        className="w-full text-xs p-3 rounded-lg border border-palette-primary outline-none focus:ring-1 focus:ring-palette-primary font-mono"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveTemplate(tpl.id)}
                          className="px-3 py-1.5 bg-palette-primary text-white text-xs font-bold rounded-lg hover:bg-palette-primaryDark transition-all flex items-center gap-1"
                        >
                          <Save className="w-3.5 h-3.5" /> Simpan Template
                        </button>
                        <button
                          onClick={() => setEditingTemplateId(null)}
                          className="px-3 py-1.5 bg-palette-bg text-gray-600 text-xs font-bold rounded-lg border border-palette-subtle"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WAHA Payload Dispatcher & Tester */}
      <div className="bg-white p-6 rounded-2xl border border-palette-subtle shadow-card space-y-4">
        <div>
          <h3 className="text-sm font-extrabold text-palette-dark flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" /> WAHA POST /api/sendText Payload Dispatcher
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Kirimkan pesan uji coba langsung ke server WAHA menggunakan JSON payload resmi.
          </p>
        </div>

        <form onSubmit={handleSendTest} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nomor WhatsApp Tujuan (chatId) *</label>
              <input
                type="text"
                required
                placeholder="Contoh: 081234567890"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Isi Pesan WAHA (text) *</label>
              <input
                type="text"
                required
                placeholder="Tulis pesan pengujian..."
                value={testMsg}
                onChange={(e) => setTestMsg(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* JSON Payload Preview */}
          <div className="p-3 bg-palette-bg rounded-xl border border-palette-subtle text-[11px] font-mono text-gray-600">
            <div className="font-bold text-palette-dark text-[10px] uppercase mb-1">Payload JSON yang dikirimkan:</div>
            <pre className="text-palette-primary truncate">
              {JSON.stringify({
                session: currentConfig.sessionName || 'default',
                chatId: `${testPhone.replace(/^0/, '62')}@c.us`,
                text: testMsg
              }, null, 2)}
            </pre>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSending}
              className="px-4 py-2.5 bg-emerald-600 text-white font-extrabold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Mengirim via WAHA...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Kirim Request ke Server WAHA
                </>
              )}
            </button>
          </div>

          {/* Dispatch Log Result */}
          {lastDispatchLog && (
            <div className={`p-3 rounded-xl border text-xs font-mono mt-2 ${
              lastDispatchLog.success 
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                : 'bg-red-50 text-red-900 border-red-300'
            }`}>
              <div className="font-bold flex items-center gap-1 mb-1">
                {lastDispatchLog.success ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-600" />}
                <span>Log Pengiriman ({lastDispatchLog.timestamp}): {lastDispatchLog.success ? '200 OK' : 'Gagal'}</span>
              </div>
              <pre className="text-[11px] overflow-x-auto">
                {JSON.stringify(lastDispatchLog.response, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </div>

      {/* Match Announcement / Broadcast Section */}
      <div className="bg-white p-6 rounded-2xl border border-palette-subtle shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-palette-dark flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-palette-primary" /> Broadcast &amp; Pengumuman Matchday
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Kirimkan pesan serentak ke seluruh nomor WhatsApp pemain terdaftar pada pertandingan tertentu via WAHA bulk engine.
            </p>
          </div>
          <span className="px-2.5 py-1 bg-palette-bg rounded-xl border border-palette-subtle text-[11px] font-mono text-gray-600 self-start sm:self-auto">
            ⚡ WAHA POST /api/sendBulk
          </span>
        </div>

        <form onSubmit={handleBroadcastMatch} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Pertandingan Sasaran *</label>
              <select
                value={selectedBlastMatchId}
                onChange={(e) => setSelectedBlastMatchId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-white text-palette-dark font-medium outline-none focus:border-palette-primary"
              >
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.dateLabel || m.date}) - {(m.registeredPlayers || []).length} Peserta
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Pesan Kustom (Opsional - Kosongkan untuk pesan standar)
              </label>
              <input
                type="text"
                placeholder="Contoh: Info Jersey: Gunakan baju warna gelap ya teman-teman!"
                value={blastCustomText}
                onChange={(e) => setBlastCustomText(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-palette-primary" />
              <span>
                Target penerima: <strong>
                  {(matches.find(m => m.id === selectedBlastMatchId)?.registeredPlayers || []).filter(p => p.phone).length} Nomor WhatsApp Terdaftar
                </strong>
              </span>
            </div>
            <button
              type="submit"
              disabled={isBlasting || !isWorking}
              className="px-4 py-2.5 bg-palette-primary hover:bg-palette-primaryDark text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBlasting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Mengirim Broadcast...
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" /> Kirim Broadcast Sekarang
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live WAHA Transmission Logs Table */}
      <div className="bg-white p-6 rounded-2xl border border-palette-subtle shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-palette-dark flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" /> Riwayat Transmisi Pesan Real-time
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Daftar transmisi pengiriman WhatsApp terbaru yang diproses oleh gateway server.
            </p>
          </div>
          <button
            onClick={loadTransmissionLogs}
            disabled={isFetchingLogs}
            className="px-3 py-1.5 bg-palette-bg hover:bg-palette-subtle text-gray-700 font-bold text-xs rounded-xl border border-palette-subtle flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingLogs ? 'animate-spin' : ''}`} />
            <span>Segarkan Log</span>
          </button>
        </div>

        {transmissionLogs.length === 0 ? (
          <div className="p-8 text-center bg-palette-bg rounded-2xl border border-palette-subtle text-gray-400 text-xs">
            Belum ada riwayat transmisi pesan keluar. Pesan yang dikirim saat booking, verifikasi tiket, atau broadcast akan tercatat di sini secara otomatis.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-palette-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-palette-bg border-b border-palette-subtle text-gray-500 font-bold text-[11px] uppercase">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Nomor Tujuan</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Cuplikan Pesan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-palette-subtle">
                {transmissionLogs.slice(0, 15).map((log) => (
                  <tr key={log.id} className="hover:bg-palette-bg/50 transition-colors">
                    <td className="p-3 whitespace-nowrap font-mono text-[11px] text-gray-500">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono font-bold text-palette-dark whitespace-nowrap">
                      {log.to.replace('@s.whatsapp.net', '').replace('@c.us', '')}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                        log.status === 'SENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'SENT' ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-[11px] max-w-xs truncate" title={log.text}>
                      {log.text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Code & Pairing Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 text-center shadow-2xl border border-palette-subtle space-y-4 animate-scale-up relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-palette-bg hover:bg-palette-subtle flex items-center justify-center text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="text-[11px] font-bold text-palette-primary font-mono uppercase">
                WAHA Device Linking
              </div>
              <h3 className="text-base sm:text-lg font-black text-palette-dark mt-0.5">
                Tautkan WhatsApp ke Server WAHA
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Session: <strong className="font-mono text-palette-dark">[{currentConfig.sessionName}]</strong> • Engine: <strong className="font-mono text-emerald-700">{currentConfig.engine || 'NOWEB'}</strong>
              </p>
            </div>

            {/* Connected State Screen */}
            {isWorking ? (
              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-900">WhatsApp Berhasil Terhubung!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Nomor: <strong className="font-mono text-emerald-950">{currentConfig.deviceNumber || 'Aktif'}</strong> ({currentConfig.deviceName || 'WAHA Core'})
                  </p>
                </div>
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 text-left font-mono">
                  <div>• Status Session: <strong className="text-emerald-700">WORKING (ONLINE)</strong></div>
                  <div>• Endpoint: <strong>{currentConfig.serverUrl}</strong></div>
                  <div>• Otomatisasi Invoice: <strong>AKTIF</strong></div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setShowQRModal(false);
                      const el = document.getElementById('testPhoneInput');
                      if (el) el.focus();
                    }}
                    className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Uji Kirim Pesan Sekarang
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Mode Switch Tabs */}
                <div className="flex items-center gap-1 bg-palette-bg p-1 rounded-xl border border-palette-subtle text-xs font-bold">
                  <button
                    onClick={() => setPairingTab('qr')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      pairingTab === 'qr' ? 'bg-white text-palette-primary shadow-xs font-extrabold' : 'text-gray-500'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" /> Scan QR Code
                  </button>
                  <button
                    onClick={() => setPairingTab('code')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                      pairingTab === 'code' ? 'bg-white text-palette-primary shadow-xs font-extrabold' : 'text-gray-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Kode Pairing (Nomor HP)
                  </button>
                </div>

                {/* TAB 1: QR CODE */}
                {pairingTab === 'qr' && (
                  <div className="space-y-3">
                    <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl border-2 border-palette-primary/30 shadow-md flex items-center justify-center relative group">
                      {isFetchingQR ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400 text-xs">
                          <RefreshCw className="w-6 h-6 animate-spin text-palette-primary" />
                          <span>Memuat Live QR WAHA...</span>
                        </div>
                      ) : liveQRData ? (
                        liveQRData.startsWith('http') || liveQRData.startsWith('blob:') ? (
                          <img
                            src={liveQRData}
                            alt="Live QR WAHA"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <QRCodeCanvas
                            value={liveQRData}
                            size={210}
                            alt="Live QR WAHA"
                          />
                        )
                      ) : (
                        <div className="p-3 text-center text-xs text-gray-500 space-y-2">
                          <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto" />
                          <div className="font-bold text-gray-700">QR Code Tidak Tersedia</div>
                          <div className="text-[10px] text-gray-400">
                            {qrError || 'Server WAHA belum mengembalikan stream QR. Klik "Segarkan QR" untuk mencoba lagi.'}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Auto Refresh Countdown */}
                    <div className="flex items-center justify-between text-xs text-gray-500 bg-palette-bg p-2.5 rounded-xl border border-palette-subtle">
                      <div className="flex items-center gap-1.5">
                        <RefreshCw className={`w-3.5 h-3.5 text-palette-primary ${isFetchingQR ? 'animate-spin' : ''}`} />
                        <span>Auto-refresh dalam <strong className="font-mono text-palette-dark">{qrCountdown}s</strong></span>
                      </div>
                      <button
                        onClick={fetchQR}
                        disabled={isFetchingQR}
                        className="px-2 py-1 rounded bg-white hover:bg-gray-100 border border-palette-subtle text-palette-dark font-bold text-[11px] transition-colors"
                      >
                        Segarkan Sekarang
                      </button>
                    </div>

                    <div className="text-[11px] text-gray-500 text-left bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                      <div className="font-bold text-gray-700">Langkah Login di HP:</div>
                      <ol className="list-decimal list-inside space-y-0.5 text-gray-600">
                        <li>Buka WhatsApp di ponsel Anda</li>
                        <li>Ketuk <strong>Menu (titik 3)</strong> atau <strong>Pengaturan</strong> &gt; <strong>Perangkat Tertaut</strong></li>
                        <li>Ketuk <strong>Tautkan Perangkat</strong> dan arahkan kamera ke QR di atas</li>
                      </ol>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: PAIRING CODE (LOGIN VIA PHONE NUMBER) */}
            {pairingTab === 'code' && (
              <div className="space-y-3 text-left">
                <form onSubmit={handleRequestPairingCode} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-palette-dark mb-1">
                      Nomor WhatsApp Anda (dengan kode negara) *
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="Contoh: 081234567890 atau 6281234567890"
                        value={pairingPhone}
                        onChange={(e) => setPairingPhone(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRequestingCode}
                    className="w-full py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isRequestingCode ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Meminta Kode Pairing...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" /> Dapatkan 8-Digit Kode Pairing
                      </>
                    )}
                  </button>
                </form>

                {pairingCodeResult && (
                  <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-2xl text-center space-y-2 animate-scale-up">
                    <div className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                      Kode Pairing WhatsApp Anda
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-emerald-700 bg-white py-2 px-3 rounded-xl border border-emerald-200 select-all">
                      {pairingCodeResult}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(pairingCodeResult);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2500);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Tersalin!' : 'Salin Kode'}</span>
                    </button>
                    <div className="text-[11px] text-emerald-800 text-left pt-1">
                      Buka WhatsApp &gt; Perangkat Tertaut &gt; Tautkan Perangkat &gt; <strong>Tautkan dengan nomor telepon saja</strong> &gt; Masukkan kode di atas.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-palette-subtle flex gap-2">
              <button
                onClick={() => setShowQRModal(false)}
                className="w-full py-2.5 bg-palette-bg text-palette-dark font-extrabold text-xs rounded-xl border border-palette-subtle hover:bg-palette-subtle transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
