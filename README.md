# MATE CLUB Mini Soccer — Vite + React + Tailwind + Supabase

Aplikasi modern manajemen mini soccer, reservasi slot pertandingan, verifikasi pembayaran, E-Ticket pass, dan konfigurasi fasilitas berbasis **Vite + React + Tailwind CSS + Supabase**.

## 🚀 Fitur Utama

1. **Authentication & User Management**:
   - Registrasi Pemain (Nama, WhatsApp, Email, Posisi Utama, No. Punggung, Klub).
   - Login via WhatsApp / Email & Password.
   - Quick 1-Click Demo Login (Pemain & Admin).
   - Role-Based Access Control (`player` & `admin`).
2. **Matchday Discovery & Booking Flow**:
   - Filter format game (*Open Play Solo*, *Sparring 2 Tim*, *Trofeo*).
   - Filter venue rekanan dan ketersediaan kuota roster.
   - Pilihan 2 jenis slot: **Pemain Lapangan** vs **Penjaga Gawang (Kiper)** dengan tarif dinamis otomatis.
   - Checkout 3-Langkah (Data Roster $\rightarrow$ Pembayaran QRIS/BCA/Mandiri $\rightarrow$ E-Ticket Pass instan).
   - Self-service ticket tracker & pelacakan status pembayaran.
   - Digital Member Card (Caps, Gol, MVP, riwayat tiket).
3. **Admin Control Hub**:
   - Executive Dashboard Overview (omset lunas, pending validasi, okupansi).
   - Validasi Bukti Transfer & Struk Pembayaran.
   - Manajemen Jadwal Game & Pengaturan Kuota Roster.
   - Master Data Venue Lapangan & Pengaturan Tarif.
   - Penugasan Wasit Lisensi PSSI & Fotografer Matchday.
   - **Manajemen Fasilitas & Layanan** (CRUD lengkap dengan kategori matchday vs venue, toggle status aktif, dan default game).
   - WhatsApp Bot Notification Simulator (Pengingat H-1, Tiket Lunas, Foto HD).
   - Export CSV Laporan Keuangan.

## 🛠️ Cara Menjalankan Aplikasi

### 1. Jalankan Server Development:
```bash
cd minisoccer-vite-app
npm run dev
```

### 2. Build Production:
```bash
npm run build
```

### 3. Setup Supabase (Opsional):
Aplikasi sudah langsung dapat digunakan 100% menggunakan data mock bawaan. Untuk mengaktifkan sinkronisasi database PostgreSQL Supabase:
1. Jalankan query SQL di `supabase/schema.sql` pada SQL Editor Supabase.
2. Buat file `.env` dan masukkan:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
