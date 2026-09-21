import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { pingGoPayServer, generateDynamicQRIS, parseQRISDetails, decodeQRISFromImage } from '../../lib/gopayGateway';
import { QRCodeCanvas } from '../common/QRCodeCanvas';
import { 
  CreditCard, 
  QrCode, 
  ShieldCheck, 
  Settings, 
  Copy, 
  Check, 
  AlertCircle, 
  Power, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Sliders,
  DollarSign,
  Server,
  Activity,
  Zap,
  ExternalLink,
  Smartphone,
  UploadCloud,
  CheckCircle2,
  Info
} from 'lucide-react';

export const PaymentGatewaySection = () => {
  const { paymentGateways, toggleGatewayStatus, toggleGatewayChannel, setActiveGatewayEdit, updatePaymentGateway, showToast } = useApp();
  const { isSuperAdmin } = useAuth();

  const [copiedKey, setCopiedKey] = useState('');
  const [showSecrets, setShowSecrets] = useState({});
  const [serverHealth, setServerHealth] = useState({ status: 'checking', message: '' });
  const [testAmount, setTestAmount] = useState('50000');
  const [testQRResult, setTestQRResult] = useState('');
  const [qrisInspection, setQrisInspection] = useState(null);
  const [isDecodingImage, setIsDecodingImage] = useState(false);

  const gopayGateway = paymentGateways.find(p => p.provider === 'gopay') || paymentGateways[0];

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setServerHealth({ status: 'checking', message: 'Memeriksa koneksi...' });
    const targetUrl = gopayGateway?.serverUrl || 'https://gopay.masondo.dev';
    const res = await pingGoPayServer(targetUrl);
    if (res.success) {
      setServerHealth({ status: 'online', message: `200 OK — ${res.data?.service || 'GoPay Partner API Gateway'}` });
    } else {
      setServerHealth({ status: 'offline', message: res.message || 'Tidak dapat terhubung' });
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`${label} berhasil disalin ke clipboard!`);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  const toggleShowSecret = (id) => {
    setShowSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleInspectCurrentQRIS = () => {
    const template = gopayGateway?.qrisStatic || '';
    const details = parseQRISDetails(template);
    setQrisInspection(details);
  };

  useEffect(() => {
    if (gopayGateway?.qrisStatic) {
      handleInspectCurrentQRIS();
    }
  }, [gopayGateway?.qrisStatic]);

  const handleUploadAndDecodeQR = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingImage(true);
    try {
      const decodedString = await decodeQRISFromImage(file);
      const details = parseQRISDetails(decodedString);
      
      // Auto-update gateway config in AppContext
      updatePaymentGateway(gopayGateway.id, {
        ...gopayGateway,
        qrisStatic: decodedString,
        merchantId: details.nmid !== '-' ? details.nmid : gopayGateway.merchantId
      });

      setQrisInspection(details);
      showToast(`QRIS ${details.merchantName || ''} berhasil dibaca & disimpan!`, 'success');
    } catch (err) {
      showToast(err.message || 'Gagal membaca QR Code dari file gambar', 'error');
    } finally {
      setIsDecodingImage(false);
    }
  };

  const handleTestQRIS = () => {
    if (!testAmount || isNaN(testAmount) || Number(testAmount) <= 0) {
      showToast('Masukkan nominal valid!', 'error');
      return;
    }
    const template = gopayGateway?.qrisStatic || '00020101021126570011ID.GO-JEK.WWW01189360091438890123450210G8890123450303UME51440014ID.CO.QRIS.WWW0215ID10203040506070303UME5204581253033605802ID5918MATE CLUB SOCCER6011BALIKPAPAN62070703A016304';
    const code = generateDynamicQRIS(template, testAmount);
    setTestQRResult(code);
    showToast(`QRIS Dinamis EMVCo Rp ${Number(testAmount).toLocaleString('id-ID')} berhasil dibuat!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-palette-dark text-white p-6 sm:p-7 rounded-2xl border border-palette-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30 uppercase tracking-wider">
              GOPAY AUTONOMOUS GATEWAY
            </span>
            <span className="text-gray-400 text-xs">•</span>
            <span className="text-gray-300 text-xs font-semibold">EMVCo QRIS Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white">
            Payment Gateway & QRIS Dinamis Otomatis
          </h2>
          <p className="text-xs text-gray-300 mt-1 max-w-2xl">
            Terkoneksi langsung ke server gateway <strong>https://gopay.masondo.dev</strong> untuk verifikasi mutasi otomatis dan pencetakan QRIS dinamis berstandar EMVCo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkHealth}
            className="px-3 py-2 rounded-xl bg-palette-darker hover:bg-black/60 text-white font-bold text-xs border border-gray-700 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Activity className={`w-3.5 h-3.5 ${serverHealth.status === 'online' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>{serverHealth.status === 'online' ? 'Gateway Online' : 'Cek Status Server'}</span>
          </button>
          <a
            href="https://github.com/ahmadzakiyox/gopay-api-gateaway"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 rounded-xl bg-palette-primary hover:bg-palette-primaryDark text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Repo Gateway
          </a>
        </div>
      </div>

      {/* Live Server Health Strip */}
      <div className="bg-white p-4 rounded-xl border border-palette-subtle shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${
            serverHealth.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}></span>
          <span className="text-gray-500 font-medium">Server API URL:</span>
          <strong className="text-palette-dark font-mono bg-palette-bg px-2 py-0.5 rounded border border-palette-subtle">
            {gopayGateway?.serverUrl || 'https://gopay.masondo.dev'}
          </strong>
        </div>
        <div className="text-gray-500 font-mono text-[11px] flex items-center gap-2">
          <span>Status:</span>
          <span className={`font-bold ${serverHealth.status === 'online' ? 'text-emerald-700' : 'text-amber-700'}`}>
            {serverHealth.message}
          </span>
        </div>
      </div>

      {/* Gateway Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paymentGateways.map(gateway => {
          const isGoPay = gateway.provider === 'gopay';
          const isManual = gateway.provider === 'manual';
          const isVisible = showSecrets[gateway.id];

          return (
            <div
              key={gateway.id}
              className={`bg-white rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-card ${
                gateway.status === 'active' ? 'border-palette-primary/40' : 'border-gray-200 opacity-80'
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="p-5 border-b border-palette-subtle/60 flex items-start justify-between bg-palette-bg/40">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ${
                      isGoPay
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isManual
                        ? 'bg-palette-dark text-white shadow-xs'
                        : 'bg-blue-600 text-white shadow-xs'
                    }`}>
                      {isGoPay ? <Zap className="w-6 h-6" /> : isManual ? <CreditCard className="w-6 h-6" /> : <QrCode className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-palette-dark">{gateway.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                          {gateway.mode || 'PRODUCTION'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                        Merchant: <span className="font-bold text-palette-dark">{gateway.merchantId}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleGatewayStatus(gateway.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        gateway.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      {gateway.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </button>
                  </div>
                </div>

                {/* Card Body Credentials */}
                <div className="p-5 space-y-3 text-xs">
                  {isGoPay ? (
                    <>
                      {/* Server URL */}
                      <div>
                        <div className="text-gray-500 font-medium mb-1 flex items-center justify-between">
                          <span>Endpoint Gateway URL:</span>
                          <button
                            onClick={() => handleCopy(gateway.serverUrl, 'GoPay Server URL')}
                            className="text-palette-primary hover:underline flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedKey === 'GoPay Server URL' ? 'Disalin!' : 'Salin'}
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-palette-bg border border-palette-subtle font-mono text-[11px] text-palette-dark truncate">
                          {gateway.serverUrl}
                        </div>
                      </div>

                      {/* API Key */}
                      <div>
                        <div className="text-gray-500 font-medium mb-1 flex items-center justify-between">
                          <span>X-Api-Key Header:</span>
                          <button
                            onClick={() => toggleShowSecret(gateway.id)}
                            className="text-gray-500 hover:text-palette-dark flex items-center gap-1 text-[11px]"
                          >
                            {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {isVisible ? 'Sembunyikan' : 'Lihat'}
                          </button>
                        </div>
                        <div className="p-2.5 rounded-lg bg-palette-bg border border-palette-subtle font-mono text-[11px] text-palette-dark truncate">
                          {isVisible ? gateway.apiKey : '••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>

                      {/* QRIS Static Template */}
                      <div>
                        <div className="text-gray-500 font-medium mb-1 flex items-center justify-between">
                          <span>Template QRIS Statis (EMVCo Source):</span>
                          <span className="text-[10px] text-emerald-700 font-bold">GoBiz Merchant Verified</span>
                        </div>
                        <div className="p-2 rounded-lg bg-gray-50 border border-palette-subtle font-mono text-[10px] text-gray-600 truncate">
                          {gateway.qrisStatic || '00020101021126570011ID.GO-JEK.WWW...'}
                        </div>
                      </div>

                      {/* Channels */}
                      <div className="pt-2">
                        <div className="text-gray-600 font-bold mb-2">Metode Pembayaran Aktif:</div>
                        <div className="space-y-1.5">
                          {gateway.channels?.map(ch => (
                            <div
                              key={ch.id}
                              className="p-2 rounded-lg bg-palette-bg/60 border border-palette-subtle flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={ch.enabled}
                                  onChange={() => toggleGatewayChannel(gateway.id, ch.id)}
                                  className="accent-palette-primary rounded"
                                />
                                <span className={`text-xs ${ch.enabled ? 'font-bold text-palette-dark' : 'text-gray-400'}`}>
                                  {ch.name}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono font-semibold text-emerald-700">
                                {ch.feePercent ? `${ch.feePercent}% MDR` : `Rp ${ch.fixedFee?.toLocaleString('id-ID')}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    /* Manual Bank Accounts */
                    <div className="space-y-3">
                      <div className="text-gray-600 font-bold">Rekening Bank Rekanan:</div>
                      {gateway.bankAccounts?.map((acc, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-palette-bg border border-palette-subtle flex justify-between items-center">
                          <div>
                            <div className="font-extrabold text-palette-dark text-xs">{acc.bank}</div>
                            <div className="font-mono text-sm font-black text-palette-primary">{acc.accountNumber}</div>
                            <div className="text-[10px] text-gray-500">a.n. {acc.accountName}</div>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Aktif
                          </span>
                        </div>
                      ))}

                      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                        <div className="font-bold text-palette-dark">NMID QRIS Nasional:</div>
                        <div className="font-mono font-bold text-gray-700">{gateway.qrisNmid}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-palette-bg/30 border-t border-palette-subtle flex items-center justify-between">
                <div className="text-[11px] text-gray-500 font-medium">
                  {gateway.autoSettlement ? '⚡ Auto Instant Settlement (Polling 6s)' : '🛡️ Manual Verification Flow'}
                </div>
                <button
                  onClick={() => setActiveGatewayEdit(gateway)}
                  className="px-3 py-1.5 rounded-lg bg-palette-primary text-white text-xs font-bold hover:bg-palette-primaryDark transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" /> Edit Konfigurasi
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive EMVCo Dynamic QRIS Test & Merchant Inspector */}
      <div className="bg-white p-6 rounded-2xl border border-palette-subtle shadow-card space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-palette-subtle pb-4">
          <div>
            <h3 className="text-sm font-extrabold text-palette-dark flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600" /> Inspektur & Pengujian QRIS Dinamis (EMVCo)
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload gambar QRIS GoBiz Anda atau masukkan nominal untuk menguji generate QRIS dinamis.
            </p>
          </div>

          <label className="cursor-pointer px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 transition-all flex items-center gap-2 shadow-xs shrink-0">
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>{isDecodingImage ? 'Membaca Foto...' : '📷 Upload Gambar QRIS GoBiz'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadAndDecodeQR}
              disabled={isDecodingImage}
            />
          </label>
        </div>

        {/* Merchant Data Preview Card */}
        {qrisInspection && (
          <div className="p-4 rounded-xl bg-palette-bg border border-palette-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-palette-dark flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Data Merchant Terdeteksi dari QRIS:
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                qrisInspection.isCrcValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {qrisInspection.isCrcValid ? '✓ CRC16 VALID' : '⚠ CRC16 TIDAK VALID'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-white border border-palette-subtle">
                <div className="text-[10px] text-gray-500 font-medium">Nama Merchant</div>
                <div className="font-extrabold text-palette-dark truncate">{qrisInspection.merchantName || '-'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-palette-subtle">
                <div className="text-[10px] text-gray-500 font-medium">NMID Nasional</div>
                <div className="font-mono font-bold text-palette-primary truncate">{qrisInspection.nmid || '-'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-palette-subtle">
                <div className="text-[10px] text-gray-500 font-medium">Kota / Domisili</div>
                <div className="font-bold text-gray-700 truncate">{qrisInspection.city || '-'}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-palette-subtle">
                <div className="text-[10px] text-gray-500 font-medium">Tipe Template</div>
                <div className="font-mono font-bold text-emerald-700">{qrisInspection.type}</div>
              </div>
            </div>
          </div>
        )}

        {/* Testing Generator Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-end pt-2">
          <div className="w-full sm:w-64">
            <label className="block text-xs font-bold text-gray-700 mb-1">Uji Cetak Nominal (Rp)</label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              placeholder="50000"
              className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle outline-none font-mono"
            />
          </div>
          <button
            onClick={handleTestQRIS}
            className="w-full sm:w-auto px-4 py-2.5 bg-palette-primary hover:bg-palette-primaryDark text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" /> Cetak QRIS Dinamis
          </button>
        </div>

        {testQRResult && (
          <div className="p-4 bg-palette-bg rounded-xl border border-palette-subtle flex flex-col md:flex-row items-center gap-4 animate-fade-in">
            <div className="w-40 h-40 bg-white p-2 rounded-xl border border-gray-200 shadow-xs shrink-0 flex items-center justify-center">
              <QRCodeCanvas
                value={testQRResult}
                size={150}
                logo="/logo.png"
                alt="QRIS EMVCo Generated"
              />
            </div>
            <div className="space-y-2 overflow-hidden w-full text-xs">
              <div className="font-extrabold text-palette-dark">String EMVCo QRIS Dinamis:</div>
              <div className="p-2.5 rounded-lg bg-white border border-palette-subtle font-mono text-[10px] text-gray-700 break-all select-all max-h-24 overflow-y-auto">
                {testQRResult}
              </div>
              <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>CRC16 Valid • Tag 01: 12 (Dynamic) • Tag 54: Rp {Number(testAmount).toLocaleString('id-ID')}</span>
              </div>
              <div className="text-[11px] text-gray-500">
                💡 Dapat discan oleh aplikasi <strong>BCA Mobile, Livin Mandiri, BRImo, GoPay, OVO, DANA, ShopeePay</strong> jika template merupakan QRIS asli dari merchant GoBiz terdaftar.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
