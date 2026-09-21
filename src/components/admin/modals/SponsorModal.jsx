import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { 
  X, 
  Handshake, 
  Tag, 
  Percent, 
  Link as LinkIcon, 
  Phone, 
  Calendar, 
  Image as ImageIcon, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SponsorModal = () => {
  const { 
    activeSponsorEdit, 
    setActiveSponsorEdit, 
    addSponsor, 
    updateSponsor 
  } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    tier: 'Official Partner',
    category: 'Apparel & Equipment',
    logo: '',
    offer: '',
    promoCode: '',
    discountPercent: 20,
    websiteUrl: '',
    contactPhone: '',
    validUntil: '31 Desember 2026',
    status: 'active',
    isFeatured: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeSponsorEdit) {
      if (activeSponsorEdit.isNew) {
        setFormData({
          name: '',
          tier: 'Official Partner',
          category: 'Apparel & Equipment',
          logo: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=300&q=80',
          offer: '',
          promoCode: 'MATE-' + Math.floor(100 + Math.random() * 900),
          discountPercent: 20,
          websiteUrl: '',
          contactPhone: '0812-',
          validUntil: '31 Desember 2026',
          status: 'active',
          isFeatured: true
        });
      } else {
        setFormData({
          name: activeSponsorEdit.name || '',
          tier: activeSponsorEdit.tier || 'Official Partner',
          category: activeSponsorEdit.category || 'Apparel & Equipment',
          logo: activeSponsorEdit.logo || '',
          offer: activeSponsorEdit.offer || '',
          promoCode: activeSponsorEdit.promoCode || '',
          discountPercent: activeSponsorEdit.discountPercent !== undefined ? activeSponsorEdit.discountPercent : 20,
          websiteUrl: activeSponsorEdit.websiteUrl || '',
          contactPhone: activeSponsorEdit.contactPhone || '',
          validUntil: activeSponsorEdit.validUntil || '31 Desember 2026',
          status: activeSponsorEdit.status || 'active',
          isFeatured: activeSponsorEdit.isFeatured !== undefined ? activeSponsorEdit.isFeatured : true
        });
      }
      setErrors({});
    }
  }, [activeSponsorEdit]);

  if (!activeSponsorEdit) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Nama Mitra / Sponsor wajib diisi';
    if (!formData.offer.trim()) errs.offer = 'Deskripsi benefit / penawaran wajib diisi';
    if (!formData.promoCode.trim()) errs.promoCode = 'Kode promo wajib diisi';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (activeSponsorEdit.isNew) {
      addSponsor({
        ...formData,
        discountPercent: Number(formData.discountPercent) || 0
      });
    } else {
      updateSponsor(activeSponsorEdit.id, {
        ...formData,
        discountPercent: Number(formData.discountPercent) || 0
      });
    }

    setActiveSponsorEdit(null);
  };

  const sampleLogoOptions = [
    { label: 'Specs Apparel', url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=300&q=80' },
    { label: 'Hydro Drink', url: 'https://images.unsplash.com/photo-1550572017-edb79a1f26e2?auto=format&fit=crop&w=300&q=80' },
    { label: 'Physio Rehab', url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80' },
    { label: 'Energy Bar', url: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=300&q=80' },
    { label: 'Sports Arena', url: 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=300&q=80' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-palette-subtle shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-palette-dark text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-palette-primary/20 text-palette-primary border border-palette-primary/30 flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-white">
                {activeSponsorEdit.isNew ? 'Tambah Mitra Sponsor Baru' : `Edit Mitra: ${activeSponsorEdit.name}`}
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Kelola data brand partner, benefit eksklusif, diskon member, dan kode promo.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveSponsorEdit(null)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Nama & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">
                Nama Mitra / Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Specs Indonesia, HydroCoco"
                className={`w-full text-xs p-2.5 rounded-xl border ${errors.name ? 'border-red-500' : 'border-palette-subtle'} bg-palette-bg focus:bg-white focus:border-palette-primary outline-none`}
              />
              {errors.name && <p className="text-[11px] text-red-500 font-bold">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">Kategori Sponsor</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              >
                <option value="Apparel & Equipment">Apparel & Equipment</option>
                <option value="Food & Beverage">Food & Beverage (Hidrasi/Nutrisi)</option>
                <option value="Health & Recovery">Health & Recovery (Fisioterapi/Medis)</option>
                <option value="Venue & Facilities">Venue & Facilities</option>
                <option value="Media & Broadcast">Media & Broadcast</option>
                <option value="Merchant & Retail">Merchant & Retail</option>
              </select>
            </div>
          </div>

          {/* Row 2: Tier & Logo Image */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">Tier / Gelar Kemitraan</label>
              <input
                type="text"
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                placeholder="Contoh: Official Apparel Partner, Official Hydration"
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark flex items-center justify-between">
                <span>URL Logo / Foto Brand</span>
                <span className="text-[10px] text-gray-400 font-normal">Resolusi persegi/landscape</span>
              </label>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Preset Logo Selection */}
          <div className="p-2.5 rounded-2xl bg-palette-bg border border-palette-subtle space-y-1.5">
            <div className="text-[10px] font-bold text-gray-500 uppercase">Pilih Contoh Logo Siap Pakai:</div>
            <div className="flex flex-wrap gap-2">
              {sampleLogoOptions.map((opt, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, logo: opt.url })}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-palette-primary hover:text-white text-gray-700 text-[11px] font-bold border border-palette-subtle transition-all"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Penawaran / Benefit Eksklusif */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-palette-dark">
              Deskripsi Penawaran / Benefit Eksklusif <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={formData.offer}
              onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
              placeholder="Contoh: Diskon 25% Sepatu Mini Soccer & Apparel untuk seluruh roster member terdaftar MATE CLUB."
              className={`w-full text-xs p-3 rounded-xl border ${errors.offer ? 'border-red-500' : 'border-palette-subtle'} bg-palette-bg focus:bg-white focus:border-palette-primary outline-none leading-relaxed`}
            ></textarea>
            {errors.offer && <p className="text-[11px] text-red-500 font-bold">{errors.offer}</p>}
          </div>

          {/* Row 4: Kode Promo, Diskon (%), & Masa Berlaku */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">
                Kode Promo / Voucher <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.promoCode}
                  onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                  placeholder="MATECLUB25"
                  className={`w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border ${errors.promoCode ? 'border-red-500' : 'border-palette-subtle'} bg-palette-bg focus:bg-white focus:border-palette-primary outline-none font-mono font-bold`}
                />
              </div>
              {errors.promoCode && <p className="text-[11px] text-red-500 font-bold">{errors.promoCode}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">Besaran Diskon (%)</label>
              <div className="relative">
                <Percent className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.discountPercent}
                  onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">Masa Berlaku</label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  placeholder="31 Desember 2026"
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Website URL & Kontak */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">Link Website / Instagram / Toko</label>
              <div className="relative">
                <LinkIcon className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://specs.id atau https://instagram.com/..."
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-palette-dark">No. WhatsApp / Kontak PIC</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="0812-3456-7890"
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none font-mono"
                />
              </div>
            </div>
          </div>

          {/* Row 6: Status & Featured Switches */}
          <div className="p-4 rounded-2xl bg-palette-bg border border-palette-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sponsorStatus"
                checked={formData.status === 'active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                className="w-4 h-4 text-palette-primary rounded border-gray-300 focus:ring-palette-primary"
              />
              <label htmlFor="sponsorStatus" className="text-xs font-bold text-palette-dark cursor-pointer">
                Publikasikan di Website (Status Aktif)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="sponsorFeatured"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-amber-500 rounded border-gray-300 focus:ring-amber-500"
              />
              <label htmlFor="sponsorFeatured" className="text-xs font-bold text-palette-dark cursor-pointer flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tampilkan sebagai Mitra Utama
              </label>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-palette-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveSponsorEdit(null)}
              className="px-4 py-2.5 rounded-xl bg-palette-bg hover:bg-gray-200 text-palette-dark font-bold text-xs transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-palette-primary hover:bg-palette-primaryDark text-white font-extrabold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{activeSponsorEdit.isNew ? 'Tambah Mitra Sponsor' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
