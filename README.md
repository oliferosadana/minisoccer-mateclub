# MATE CLUB Mini Soccer — Vite + React + Tailwind + Supabase

[![CI - Lint & Build](https://github.com/oliferosadana/minisoccer-mateclub/actions/workflows/ci.yml/badge.svg)](https://github.com/oliferosadana/minisoccer-mateclub/actions/workflows/ci.yml)
[![Deploy to GitHub Pages](https://github.com/oliferosadana/minisoccer-mateclub/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/oliferosadana/minisoccer-mateclub/actions/workflows/deploy-pages.yml)

Aplikasi modern manajemen mini soccer, reservasi slot pertandingan, verifikasi pembayaran mandiri/otomatis, saldo dompet member, E-Ticket pass digital, dan sistem kontrol superadmin berbasis **Vite + React 19 + Tailwind CSS + Supabase**.

---

## 🚀 Fitur Utama

1. **Authentication, Saldo Dompet, & Hak Akses Superadmin**:
   - Registrasi & Login Pemain (WhatsApp / Email & Password).
   - **Sistem Saldo Dompet Digital**: Top Up saldo mandiri & pembayaran tiket slot menggunakan saldo.
   - **Otomatisasi Cashback Kode Unik**: Kelebihan 3-digit kode unik transaksi otomatis 100% masuk ke Saldo Dompet akun pemain.
   - **Superadmin Privilege**: Hak istimewa Superadmin untuk menambah, mengurangi, dan mengoreksi saldo pemain secara manual dengan pencatatan audit log mutasi.
   - Role-Based Access Control (`player`, `admin`, `superadmin`).

2. **Matchday Booking & Pembayaran Dinamis**:
   - Filter format game (*Open Play Solo*, *Sparring 2 Tim*, *Trofeo*).
   - Checkout 3-Langkah (Data Roster & Jersey Size $\rightarrow$ Pembayaran $\rightarrow$ E-Ticket Pass instan).
   - **GoPay Dynamic QRIS (Autonomous)**: Generator QR dinamis otomatis + live background auto-polling settlement.
   - **Metode Transfer Bank Manual**: Pilihan rekening perbankan aktif (BCA, Mandiri, BRI, BSI, dll) dengan fitur **Lampirkan Foto/Struk Bukti Transfer**.
   - E-Ticket Pass interaktif dengan barcode QR & detail jadwal.

3. **Admin & Superadmin Dashboard**:
   - Executive Dashboard Overview (omset lunas, pending validasi, okupansi slot).
   - **Manajemen Rekening Bank Admin**: CRUD Rekening Bank Transfer Manual dengan switch instan Aktif / Nonaktif.
   - Validasi Bukti Transfer & Struk Pembayaran Pemain (Approve / Reject).
   - Manajemen Jadwal Game, Venue Lapangan, Lisensi Wasit & Fotografer.
   - WAHA WhatsApp Gateway Engine & Template Notifikasi Otomatis.
   - Export CSV Laporan Keuangan.

---

## 🛠️ CI/CD Pipeline & Deployment

Project ini sudah dilengkapi alur **CI/CD (Continuous Integration & Continuous Deployment)** otomatis via **GitHub Actions** dan **Docker Container**:

### 1. GitHub Actions Workflows:
- **`ci.yml`**: Dijalankan otomatis di setiap `push` dan `pull_request` ke branch `main`. Memvalidasi instalasi dependensi, menjalankan Linter (Oxlint), dan memverifikasi build bundle Vite pada Node 20 & 22.
- **`deploy-pages.yml`**: Deployment otomatis ke **GitHub Pages** setiap ada perubahan baru di branch `main`.

### 2. Docker & Container Deployment:
Jalankan aplikasi dalam container NGINX production-ready:
```bash
# Build dan jalankan via Docker Compose
docker compose up -d --build

# Akses aplikasi di browser
http://localhost:8080
```

---

## 💻 Pengembangan Lokal (Local Development)

### 1. Instalasi Dependensi:
```bash
npm install
```

### 2. Jalankan Server Development:
```bash
npm run dev
```

### 3. Jalankan Linter & Validasi Build CI:
```bash
npm run test:ci
```

### 4. Build Bundle Production:
```bash
npm run build
```

---

## ⚙️ Konfigurasi Environment (`.env`)

Salin file `.env.example` menjadi `.env`:
```env
# Supabase Database (Opsional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# WAHA WhatsApp Gateway
WAHA_SERVER_URL=http://localhost:3005
WAHA_API_KEY=
```
