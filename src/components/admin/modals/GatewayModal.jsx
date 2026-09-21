import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { decodeQRISFromImage } from '../../../lib/gopayGateway';
import { X, Save, ShieldCheck, Key, CreditCard } from 'lucide-react';

export const GatewayModal = () => {
  const { activeGatewayEdit, setActiveGatewayEdit, updatePaymentGateway } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    merchantId: '',
    serverUrl: '',
    apiKey: '',
    qrisStatic: '',
    clientKey: '',
    serverKey: '',
    mode: 'production',
    webhookUrl: '',
    feeBearer: 'merchant',
    autoSettlement: true
  });

  useEffect(() => {
    if (activeGatewayEdit) {
      setFormData({
        name: activeGatewayEdit.name || '',
        merchantId: activeGatewayEdit.merchantId || '',
        serverUrl: activeGatewayEdit.serverUrl || 'https://gopay.masondo.dev',
        apiKey: activeGatewayEdit.apiKey || '',
        qrisStatic: activeGatewayEdit.qrisStatic || '',
        clientKey: activeGatewayEdit.clientKey || '',
        serverKey: activeGatewayEdit.serverKey || '',
        mode: activeGatewayEdit.mode || 'production',
        webhookUrl: activeGatewayEdit.webhookUrl || '',
        feeBearer: activeGatewayEdit.feeBearer || 'merchant',
        autoSettlement: activeGatewayEdit.autoSettlement !== undefined ? activeGatewayEdit.autoSettlement : true
      });
    }
  }, [activeGatewayEdit]);

  if (!activeGatewayEdit) return null;

  const isGoPay = activeGatewayEdit.provider === 'gopay';

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePaymentGateway(activeGatewayEdit.id, formData);
    setActiveGatewayEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
        {/* Modal Header */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-palette-primary text-white flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-palette-subtle uppercase tracking-wider">Superadmin Gateway Settings</div>
              <h3 className="text-base font-extrabold text-white">{activeGatewayEdit.name}</h3>
            </div>
          </div>
          <button
            onClick={() => setActiveGatewayEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Nama Gateway</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Mode Operasi</label>
              <select
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-bold"
              >
                <option value="production">Live Production</option>
                <option value="sandbox">Sandbox / Testing</option>
              </select>
            </div>
          </div>

          {isGoPay ? (
            <>
              <div>
                <label className="block text-xs font-bold text-palette-dark mb-1">Server Gateway Endpoint *</label>
                <input
                  type="url"
                  required
                  placeholder="https://gopay.masondo.dev"
                  value={formData.serverUrl}
                  onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-palette-dark mb-1">X-Api-Key Header</label>
                  <input
                    type="text"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-palette-dark mb-1">Merchant ID</label>
                  <input
                    type="text"
                    value={formData.merchantId}
                    onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-palette-dark">
                    Template QRIS Statis (GoBiz EMVCo) *
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <span>📷 Upload Foto QRIS GoBiz</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const decoded = await decodeQRISFromImage(file);
                            setFormData(prev => ({ ...prev, qrisStatic: decoded }));
                          } catch (err) {
                            alert(err.message || 'Gagal membaca QR Code dari foto');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={formData.qrisStatic}
                  onChange={(e) => setFormData({ ...formData, qrisStatic: e.target.value })}
                  placeholder="00020101021126570011ID.GO-JEK.WWW..."
                  className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono text-[11px]"
                />
                <div className="text-[10px] text-gray-500 mt-1">
                  💡 <strong>Wajib QRIS Asli GoBiz:</strong> Paste string QRIS atau upload foto QRIS dari aplikasi GoBiz merchant Anda agar dapat discan oleh BCA, Mandiri, BRI, GoPay, OVO, & DANA.
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-palette-dark mb-1">Merchant ID</label>
                <input
                  type="text"
                  required
                  value={formData.merchantId}
                  onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-palette-dark mb-1">Client Public Key</label>
                <input
                  type="text"
                  value={formData.clientKey}
                  onChange={(e) => setFormData({ ...formData, clientKey: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-palette-dark mb-1">Server Secret Key</label>
                <input
                  type="text"
                  value={formData.serverKey}
                  onChange={(e) => setFormData({ ...formData, serverKey: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Beban Biaya MDR (Fee Bearer)</label>
              <select
                value={formData.feeBearer}
                onChange={(e) => setFormData({ ...formData, feeBearer: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
              >
                <option value="merchant">Ditanggung Penyelenggara (Merchant)</option>
                <option value="player">Ditanggung Pemain (Player)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Settlement Status</label>
              <select
                value={formData.autoSettlement ? 'auto' : 'manual'}
                onChange={(e) => setFormData({ ...formData, autoSettlement: e.target.value === 'auto' })}
                className="w-full text-xs p-2.5 rounded-lg border border-palette-subtle focus:border-palette-primary outline-none"
              >
                <option value="auto">Otomatis Terverifikasi (Auto Lunas)</option>
                <option value="manual">Validasi Manual oleh Admin</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-palette-subtle">
            <button
              type="button"
              onClick={() => setActiveGatewayEdit(null)}
              className="w-1/3 py-2.5 bg-palette-bg text-palette-dark font-bold text-xs rounded-xl border border-palette-subtle hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Simpan Konfigurasi Gateway
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
