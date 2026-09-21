import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { X, Image, FileText, Camera, Tag, Calendar, MapPin, User, Link as LinkIcon, Check, Eye } from 'lucide-react';

export const CommunityContentModal = () => {
  const { activeCommunityEdit, setActiveCommunityEdit, addCommunityPost, updateCommunityPost, showToast } = useApp();

  const [title, setTitle] = useState('');
  const [type, setType] = useState('article'); // 'article' | 'gallery' | 'announcement'
  const [category, setCategory] = useState('Dokumentasi Match');
  const [author, setAuthor] = useState('Media Team MATE CLUB');
  const [venue, setVenue] = useState('Balikpapan Soccer Arena');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [coverImage, setCoverImage] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [photosCount, setPhotosCount] = useState(0);
  const [externalUrl, setExternalUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [isPinned, setIsPinned] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (activeCommunityEdit) {
      if (activeCommunityEdit.isNew) {
        setTitle('');
        setType('article');
        setCategory('Dokumentasi Match');
        setAuthor('Media Team MATE CLUB');
        setVenue('Balikpapan Soccer Arena');
        setDate(new Date().toISOString().split('T')[0]);
        setCoverImage('https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80');
        setSummary('');
        setContent('');
        setPhotosCount(0);
        setExternalUrl('');
        setStatus('active');
        setIsPinned(false);
        setTags(['Komunitas', 'Mini Soccer']);
      } else {
        setTitle(activeCommunityEdit.title || '');
        setType(activeCommunityEdit.type || 'article');
        setCategory(activeCommunityEdit.category || 'Dokumentasi Match');
        setAuthor(activeCommunityEdit.author || 'Media Team MATE CLUB');
        setVenue(activeCommunityEdit.venue || 'Balikpapan Soccer Arena');
        setDate(activeCommunityEdit.date || new Date().toISOString().split('T')[0]);
        setCoverImage(activeCommunityEdit.coverImage || '');
        setSummary(activeCommunityEdit.summary || '');
        setContent(activeCommunityEdit.content || '');
        setPhotosCount(activeCommunityEdit.photosCount || 0);
        setExternalUrl(activeCommunityEdit.externalUrl || '');
        setStatus(activeCommunityEdit.status || 'active');
        setIsPinned(!!activeCommunityEdit.isPinned);
        setTags(activeCommunityEdit.tags || []);
      }
    }
  }, [activeCommunityEdit]);

  if (!activeCommunityEdit) return null;

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Judul konten wajib diisi!', 'error');
      return;
    }

    const payload = {
      title: title.trim(),
      type,
      category,
      author: author.trim(),
      venue: venue.trim(),
      date,
      dateLabel: new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      coverImage: coverImage.trim() || 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80',
      summary: summary.trim(),
      content: content.trim(),
      photosCount: Number(photosCount) || 0,
      externalUrl: externalUrl.trim(),
      status,
      isPinned,
      tags
    };

    if (activeCommunityEdit.isNew) {
      addCommunityPost(payload);
    } else {
      updateCommunityPost(activeCommunityEdit.id, payload);
    }

    setActiveCommunityEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-palette-subtle overflow-hidden relative animate-scale-up my-8">
        
        {/* Header Modal */}
        <div className="bg-palette-dark text-white p-5 flex items-center justify-between border-b border-palette-primaryDark">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
              MANAJEMEN KONTEN KOMUNITAS
            </span>
            <h3 className="text-base font-black text-white mt-0.5">
              {activeCommunityEdit.isNew ? 'Tambah Konten / Artikel Baru' : `Edit Konten: ${title || activeCommunityEdit.id}`}
            </h3>
          </div>
          <button
            onClick={() => setActiveCommunityEdit(null)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Status & Pinned Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-palette-bg rounded-2xl border border-palette-subtle">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-extrabold text-palette-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={status === 'active'}
                  onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
                <span className={status === 'active' ? 'text-emerald-700' : 'text-gray-500'}>
                  {status === 'active' ? '✓ Status: AKTIF (Tayang di Publik)' : '✗ Status: NON-AKTIF (Draft/Disembunyikan)'}
                </span>
              </label>
            </div>

            <label className="flex items-center gap-1.5 text-xs font-bold text-amber-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded"
              />
              <span>📌 Sematkan / Pinned di Atas</span>
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">Judul Konten / Artikel *</label>
            <input
              type="text"
              required
              placeholder="Contoh: Highlight Matchday #42 & Galeri Foto HD"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          {/* Type & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Tipe Format Konten *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-white focus:border-palette-primary outline-none font-bold"
              >
                <option value="article">📰 Artikel / Berita Komunitas</option>
                <option value="gallery">📸 Galeri Foto / Album Matchday</option>
                <option value="announcement">📢 Pengumuman & Info Event</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Kategori Tagar *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle bg-white focus:border-palette-primary outline-none"
              >
                <option value="Dokumentasi Match">Dokumentasi Match</option>
                <option value="Tips & Trik">Tips & Trik</option>
                <option value="Pengumuman Event">Pengumuman Event</option>
                <option value="Highlight Pertandingan">Highlight Pertandingan</option>
                <option value="Berita Komunitas">Berita Komunitas</option>
              </select>
            </div>
          </div>

          {/* Author, Venue, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Penulis / Author</label>
              <input
                type="text"
                placeholder="Media Team MATE CLUB"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Venue / Lokasi</label>
              <input
                type="text"
                placeholder="Balikpapan Soccer Arena"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-palette-dark mb-1">Tanggal Publikasi</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
              />
            </div>
          </div>

          {/* Cover Image & Photo Count */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-palette-dark mb-1">URL Gambar Sampul (Cover Image) *</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono"
              />
            </div>
            {type === 'gallery' && (
              <div>
                <label className="block text-xs font-bold text-palette-dark mb-1">Jumlah Foto Album</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Contoh: 84"
                  value={photosCount}
                  onChange={(e) => setPhotosCount(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono"
                />
              </div>
            )}
          </div>

          {/* External URL (Google Photos / Drive / WhatsApp link) */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">
              Tautan Eksternal (Link Album Google Photos / WhatsApp / Drive)
            </label>
            <input
              type="url"
              placeholder="https://photos.google.com/... atau https://drive.google.com/..."
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-mono"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">Ringkasan / Sinopsis Singkat *</label>
            <textarea
              rows={2}
              placeholder="Deskripsi singkat yang tampil pada preview card..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none"
            />
          </div>

          {/* Content Body */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">Isi Lengkap Konten</label>
            <textarea
              rows={4}
              placeholder="Tuliskan berita, taktik, highlight, atau pengumuman lengkap di sini..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-palette-subtle focus:border-palette-primary outline-none font-sans"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-palette-dark mb-1">
              Tagar Konten (Ketik lalu tekan Enter)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-palette-primary/10 text-palette-primary font-bold text-xs border border-palette-primary/20"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-red-500 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Tambah tagar baru (contoh: Sparring, Trofeo, Tips)..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full text-xs p-2 rounded-xl border border-palette-subtle bg-palette-bg focus:bg-white focus:border-palette-primary outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-palette-subtle flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveCommunityEdit(null)}
              className="px-4 py-2 bg-palette-bg text-gray-700 font-bold text-xs rounded-xl border border-palette-subtle hover:bg-gray-100 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-palette-primary text-white font-extrabold text-xs rounded-xl hover:bg-palette-primaryDark transition-all shadow-md flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{activeCommunityEdit.isNew ? 'Terbitkan Konten' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
