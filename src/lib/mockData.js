export const INITIAL_VENUES = [
  {
    id: 'f1',
    name: 'Balikpapan Soccer Field (BSF)',
    location: 'MT Haryono, Balikpapan Selatan',
    ratePerHour: 350000,
    playerSlotFee: 55000,
    keeperSlotFee: 25000,
    image: 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80',
    specs: 'Rumput Sintetis Monofilament Pro 5cm FIFA Certified Grade, Lampu Sorot LED 1000 Lux, Tribun Penonton 150 Orang, Shower & Locker Room, Area Parkir Luas.',
    facilities: ['Rumput Sintetis Standar FIFA', 'Lampu Sorot LED 1000 Lux', 'Tribun Penonton', 'Locker & Shower Room', 'Area Parkir Luas', 'Mushola & Cafe Mini'],
    status: 'active'
  },
  {
    id: 'f2',
    name: 'Borneo Mini Stadium Ringroad',
    location: 'Jl. Ringroad III, Balikpapan Utara',
    ratePerHour: 320000,
    playerSlotFee: 50000,
    keeperSlotFee: 20000,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    specs: 'Rumput Sintetis Rubber Infill Pro Grade, Bench Pemain Standar Liga, Area Cafe, Free Wi-Fi 100 Mbps.',
    facilities: ['Rumput Sintetis Standar FIFA', 'Lampu Sorot LED 1000 Lux', 'Mushola & Cafe Mini', 'Area Parkir Luas'],
    status: 'active'
  },
  {
    id: 'f3',
    name: 'Batakan Mini Soccer Arena',
    location: 'Manggar, Balikpapan Timur',
    ratePerHour: 300000,
    playerSlotFee: 45000,
    keeperSlotFee: 20000,
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    specs: 'Rumput Swiss Hybrid 6cm, View Pantai Sunset, Cafe Santai & Mushola.',
    facilities: ['Rumput Sintetis Standar FIFA', 'Lampu Sorot LED 1000 Lux', 'Tribun Penonton', 'Mushola & Cafe Mini'],
    status: 'active'
  },
  {
    id: 'f4',
    name: 'Sepinggan Pratama Mini Stadium',
    location: 'Sepinggan Pratama, Balikpapan Selatan',
    ratePerHour: 375000,
    playerSlotFee: 60000,
    keeperSlotFee: 30000,
    image: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?auto=format&fit=crop&w=800&q=80',
    specs: 'Rumput Diamond Blade Grade A+, Ruang Ganti Ber-AC, VIP Player Lounge.',
    facilities: ['Rumput Sintetis Standar FIFA', 'Lampu Sorot LED 1000 Lux', 'Locker & Shower Room', 'Area Parkir Luas'],
    status: 'active'
  }
];

export const INITIAL_REFEREES = [
  {
    id: 'r1',
    name: 'Wasit Hendra Saputra',
    license: 'Lisensi C2 PSSI Balikpapan',
    phone: '0812-5123-4567',
    rate: 150000,
    status: 'active',
    rating: 4.9
  },
  {
    id: 'r2',
    name: 'Wasit Budi Gunawan',
    license: 'Lisensi C3 Asprov Kaltim',
    phone: '0813-9876-5432',
    rate: 125000,
    status: 'active',
    rating: 4.8
  },
  {
    id: 'r3',
    name: 'Wasit Fajar Ramadhan',
    license: 'Lisensi Nasional C1 (Ex-Liga 2)',
    phone: '0852-3344-5566',
    rate: 200000,
    status: 'active',
    rating: 5.0
  }
];

export const INITIAL_PHOTOGRAPHERS = [
  {
    id: 'p1',
    name: 'ActionShots BPP Matchday',
    category: 'Vendor Resmi MATE CLUB',
    phone: '0812-9988-7766',
    rate: 100000,
    portfolioUrl: 'https://instagram.com/actionshots.bpp',
    status: 'active',
    rating: 4.9
  },
  {
    id: 'p2',
    name: 'Lensa Balikpapan Sport Pro',
    category: 'Freelance Matchday Pro',
    phone: '0821-4455-6677',
    rate: 120000,
    portfolioUrl: 'https://instagram.com/lensabalikpapan',
    status: 'active',
    rating: 5.0
  }
];

export const INITIAL_FACILITIES = [
  {
    id: 'fac-1',
    name: 'Wasit Berlisensi',
    icon: 'fa-user-tie',
    category: 'match',
    badgeColor: '#3f72af',
    description: 'Pertandingan dipimpin langsung oleh wasit bersertifikat PSSI resmi.',
    status: 'active',
    isDefaultMatch: true
  },
  {
    id: 'fac-2',
    name: 'Dokumentasi Foto HD',
    icon: 'fa-camera',
    category: 'match',
    badgeColor: '#16a34a',
    description: 'Dokumentasi aksi pemain resolusi tinggi gratis diakses via cloud drive.',
    status: 'active',
    isDefaultMatch: true
  },
  {
    id: 'fac-3',
    name: 'Rompi Bersih & Higienis',
    icon: 'fa-shirt',
    category: 'match',
    badgeColor: '#ea580c',
    description: 'Rompi pembagi tim wangi dan bersih dicuci setiap sebelum matchday.',
    status: 'active',
    isDefaultMatch: true
  },
  {
    id: 'fac-4',
    name: 'Air Mineral & Hidrasi',
    icon: 'fa-bottle-water',
    category: 'match',
    badgeColor: '#0284c7',
    description: 'Free flow air mineral botol dingin untuk seluruh peserta.',
    status: 'active',
    isDefaultMatch: true
  },
  {
    id: 'fac-5',
    name: 'P3K & Medis Pertolongan Pertama',
    icon: 'fa-kit-medical',
    category: 'match',
    badgeColor: '#dc2626',
    description: 'Peralatan pertolongan pertama kram, ankle spray, perban dan es batu.',
    status: 'active',
    isDefaultMatch: true
  },
  {
    id: 'fac-6',
    name: 'Rumput Sintetis Standar FIFA',
    icon: 'fa-seedling',
    category: 'venue',
    badgeColor: '#16a34a',
    description: 'Karpet rumput sintetis monofilament tebal 5cm empuk dan aman untuk lutut.',
    status: 'active',
    isDefaultMatch: false
  },
  {
    id: 'fac-7',
    name: 'Lampu Sorot LED 1000 Lux',
    icon: 'fa-lightbulb',
    category: 'venue',
    badgeColor: '#eab308',
    description: 'Pencahayaan terang merata standar siaran malam hari tanpa blindspot.',
    status: 'active',
    isDefaultMatch: false
  },
  {
    id: 'fac-8',
    name: 'Tribun Penonton',
    icon: 'fa-users',
    category: 'venue',
    badgeColor: '#8b5cf6',
    description: 'Kapasitas tempat duduk nyaman untuk suporter dan rekan tim yang istirahat.',
    status: 'active',
    isDefaultMatch: false
  },
  {
    id: 'fac-9',
    name: 'Locker & Shower Room',
    icon: 'fa-shower',
    category: 'venue',
    badgeColor: '#06b6d4',
    description: 'Kamar mandi bersih dengan shower air tawar serta loker ganti pakaian.',
    status: 'active',
    isDefaultMatch: false
  },
  {
    id: 'fac-10',
    name: 'Mushola & Cafe Mini',
    icon: 'fa-mosque',
    category: 'venue',
    badgeColor: '#10b981',
    description: 'Tempat ibadah sholat nyaman dan spot santai minuman dingin.',
    status: 'active',
    isDefaultMatch: false
  },
  {
    id: 'fac-11',
    name: 'Area Parkir Luas',
    icon: 'fa-square-parking',
    category: 'venue',
    badgeColor: '#64748b',
    description: 'Kapasitas parkir motor dan mobil aman berpenjaga.',
    status: 'active',
    isDefaultMatch: false
  }
];

export const INITIAL_MATCHES = [
  {
    id: 'M-BPP-101',
    type: 'fun_football',
    title: 'Sunset Weekend Fun Football (Solo Player)',
    date: '2026-09-20',
    dateLabel: 'Minggu, 20 September 2026',
    timeSlot: '16:30 - 18:30 WITA',
    fieldId: 'f1',
    refereeId: 'r1',
    photographerId: 'p1',
    slotFee: 55000,
    playerFee: 55000,
    keeperFee: 25000,
    positionPricing: { 'GK': 25000, 'DEF': 55000, 'MID': 55000, 'FWD': 55000, 'ALL': 55000 },
    dpRequired: 55000,
    status: 'open',
    level: 'Casual / Santai / Open',
    levelBadge: '🌟 Fun & Friendly',
    facilities: ['Wasit Berlisensi', 'Dokumentasi Foto HD', 'Rompi Bersih & Higienis', 'Air Mineral & Hidrasi', 'P3K & Medis Pertolongan Pertama'],
    totalSlots: 24,
    playerSlots: 22,
    gkSlots: 2,
    maxRosterPerTeam: 14,
    registeredPlayers: [
      { id: 'u1', name: 'Rizky Pratama', phone: '081234567890', pos: 'Pemain Lapangan', jerseySize: 'L', fee: 55000, status: 'paid' },
      { id: 'u2', name: 'Dimas Anggara', phone: '081399887766', pos: 'Pemain Lapangan', jerseySize: 'XL', fee: 55000, status: 'paid' },
      { id: 'u3', name: 'Ahmad Fauzi', phone: '085211223344', pos: 'Penjaga Gawang', jerseySize: 'L', fee: 25000, status: 'paid' },
      { id: 'u4', name: 'Bagas Aditya', phone: '082144332211', pos: 'Pemain Lapangan', jerseySize: 'M', fee: 55000, status: 'paid' },
      { id: 'u5', name: 'Fikri Rahman', phone: '087812345678', pos: 'Pemain Lapangan', jerseySize: 'L', fee: 55000, status: 'waiting_verification' },
      { id: 'u6', name: 'Wahyu Hidayat', phone: '089612341234', pos: 'Pemain Lapangan', jerseySize: 'M', fee: 55000, status: 'paid' },
      { id: 'u7', name: 'Bayu Saputra', phone: '081298765432', pos: 'Pemain Lapangan', jerseySize: 'XL', fee: 55000, status: 'paid' },
      { id: 'u8', name: 'Kevin Sanjaya', phone: '081377889900', pos: 'Penjaga Gawang', jerseySize: 'XXL', fee: 25000, status: 'paid' }
    ],
    teamA: null,
    teamB: null,
    summary: 'Sesi santai sore minggu, rolling 3 tim 7v7 dengan pembagian waktu adil.'
  },
  {
    id: 'M-BPP-102',
    type: 'sparring',
    title: 'Prime Night Sparring Challenge (2 Tim Resmi)',
    date: '2026-09-22',
    dateLabel: 'Selasa, 22 September 2026',
    timeSlot: '19:30 - 21:30 WITA',
    fieldId: 'f2',
    refereeId: 'r2',
    photographerId: 'p1',
    slotFee: 350000,
    playerFee: 350000,
    keeperFee: 350000,
    positionPricing: { 'GK': 350000, 'DEF': 350000, 'MID': 350000, 'FWD': 350000, 'ALL': 350000 },
    dpRequired: 200000,
    status: 'open',
    level: 'Medium / Menengah',
    levelBadge: '⚡ Medium Pro',
    facilities: ['Wasit Berlisensi', 'Dokumentasi Foto HD', 'Air Mineral & Hidrasi', 'P3K & Medis Pertolongan Pertama'],
    totalSlots: 2,
    playerSlots: 2,
    gkSlots: 0,
    maxRosterPerTeam: 14,
    registeredPlayers: [],
    teamA: {
      name: 'Garuda Muda BPP FC',
      captain: 'Capt. Rian Santoso',
      phone: '0812-7788-9900',
      jerseyColor: 'Merah Putih',
      dpStatus: 'Lunas DP'
    },
    teamB: null,
    summary: 'Sparring 2x45 menit format 7v7 kompetitif sehat dengan perangkat wasit profesional.'
  },
  {
    id: 'M-BPP-103',
    type: 'fun_football',
    title: 'Wednesday Night Lights Open Play',
    date: '2026-09-23',
    dateLabel: 'Rabu, 23 September 2026',
    timeSlot: '20:00 - 22:00 WITA',
    fieldId: 'f4',
    refereeId: 'r3',
    photographerId: 'p2',
    slotFee: 60000,
    playerFee: 60000,
    keeperFee: 25000,
    positionPricing: { 'GK': 25000, 'DEF': 60000, 'MID': 60000, 'FWD': 60000, 'ALL': 60000 },
    dpRequired: 60000,
    status: 'open',
    level: 'Casual / Rekreasi',
    levelBadge: '🌙 Night Lights',
    facilities: ['Wasit Berlisensi', 'Dokumentasi Foto HD', 'Rompi Bersih', 'Air Mineral'],
    totalSlots: 24,
    playerSlots: 22,
    gkSlots: 2,
    maxRosterPerTeam: 14,
    registeredPlayers: [
      { id: 'u9', name: 'Hendri Kurniawan', phone: '082199881122', pos: 'Pemain Lapangan', jerseySize: 'L', fee: 60000, status: 'paid' },
      { id: 'u10', name: 'Zulham Malik', phone: '085733221100', pos: 'Penjaga Gawang', jerseySize: 'XL', fee: 25000, status: 'paid' }
    ],
    teamA: null,
    teamB: null,
    summary: 'Match malam hari di bawah lampu sorot terang, format 3 tim.'
  }
];

export const INITIAL_BOOKINGS = [
  {
    id: 'BK-260920-001',
    matchId: 'M-BPP-101',
    playerName: 'Rizky Pratama',
    phone: '081234567890',
    bookingType: 'solo',
    position: 'Pemain Lapangan',
    jerseySize: 'L',
    baseAmount: 55000,
    uniqueCode: 312,
    amount: 55312,
    paymentMethod: 'qris',
    paymentStatus: 'paid',
    proofImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    ticketCode: 'TK-8891-RZ',
    createdAt: '2026-09-18T14:30:00Z'
  },
  {
    id: 'BK-260920-002',
    matchId: 'M-BPP-101',
    playerName: 'Ahmad Fauzi',
    phone: '085211223344',
    bookingType: 'solo',
    position: 'Penjaga Gawang',
    jerseySize: 'L',
    baseAmount: 25000,
    uniqueCode: 108,
    amount: 25108,
    paymentMethod: 'bca',
    paymentStatus: 'paid',
    proofImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    ticketCode: 'TK-4412-AF',
    createdAt: '2026-09-18T15:10:00Z'
  },
  {
    id: 'BK-260920-003',
    matchId: 'M-BPP-101',
    playerName: 'Fikri Rahman',
    phone: '087812345678',
    bookingType: 'solo',
    position: 'Pemain Lapangan',
    jerseySize: 'L',
    baseAmount: 55000,
    uniqueCode: 574,
    amount: 55574,
    paymentMethod: 'qris',
    paymentStatus: 'waiting_verification',
    proofImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
    ticketCode: 'TK-9921-FR',
    createdAt: '2026-09-19T08:15:00Z'
  }
];

export const INITIAL_USERS = [
  {
    id: 'usr-superadmin-01',
    name: 'Superadmin MATE CLUB',
    phone: '081199998888',
    email: 'superadmin@mateclub.id',
    role: 'superadmin',
    preferredPosition: 'Pemain Lapangan',
    clubOrigin: 'MATE CLUB Headquarter',
    status: 'active',
    balance: 50000,
    caps: 60,
    goals: 32,
    mvpCount: 12
  },
  {
    id: 'usr-admin-01',
    name: 'Admin MATE CLUB',
    phone: '081200001111',
    email: 'admin@mateclub.id',
    role: 'admin',
    preferredPosition: 'Pemain Lapangan',
    clubOrigin: 'MATE CLUB Central Office',
    status: 'active',
    balance: 25000,
    caps: 45,
    goals: 18,
    mvpCount: 5
  },
  {
    id: 'usr-player-01',
    name: 'Rizky Pratama',
    phone: '081234567890',
    email: 'rizky@gmail.com',
    role: 'player',
    preferredPosition: 'Pemain Lapangan',
    clubOrigin: 'Persiba Fans Club BPP',
    status: 'active',
    jerseyNumber: '10',
    balance: 1420,
    caps: 14,
    goals: 9,
    mvpCount: 2
  },
  {
    id: 'usr-player-02',
    name: 'Ahmad Fauzi (Kiper)',
    phone: '085211223344',
    email: 'fauzi.gk@gmail.com',
    role: 'player',
    preferredPosition: 'Penjaga Gawang',
    clubOrigin: 'Balikpapan Goalkeeper Academy',
    status: 'active',
    jerseyNumber: '1',
    balance: 850,
    caps: 19,
    goals: 0,
    mvpCount: 4
  }
];

export const INITIAL_WALLET_TRANSACTIONS = [
  {
    id: 'tx-wal-001',
    userId: 'usr-player-01',
    phone: '081234567890',
    type: 'credit',
    amount: 312,
    description: 'Cashback Kelebihan Kode Unik (Booking #BK-260920-801)',
    bookingId: 'BK-260920-801',
    createdAt: '2026-09-20T17:10:00.000Z',
    balanceAfter: 312
  },
  {
    id: 'tx-wal-002',
    userId: 'usr-player-01',
    phone: '081234567890',
    type: 'credit',
    amount: 1108,
    description: 'Cashback Kelebihan Kode Unik (Booking #BK-260920-802)',
    bookingId: 'BK-260920-802',
    createdAt: '2026-09-20T17:35:00.000Z',
    balanceAfter: 1420
  }
];

export const INITIAL_PAYMENT_GATEWAYS = [
  {
    id: 'gw-gopay-01',
    name: 'GoPay Merchant API Gateway (Autonomous)',
    provider: 'gopay',
    status: 'active',
    mode: 'production',
    serverUrl: 'https://gopay.masondo.dev',
    merchantId: 'ID1026519799000',
    apiKey: '',
    qrisStatic: '00020101021126610014COM.GO-JEK.WWW01189360091435670878450210G5670878450303UMI51440014ID.CO.QRIS.WWW0215ID10265197990000303UMI5204566153033605802ID5920MATE CLUB BALIKPAPAN6010BALIKPAPAN61057613462140703A0111036216304',
    webhookUrl: 'https://api.mateclub.id/v1/payments/gopay/callback',
    feeBearer: 'merchant',
    autoSettlement: true,
    pollingIntervalSeconds: 5,
    channels: [
      { id: 'qris_gopay_dynamic', name: 'QRIS Dinamis EMVCo (GoPay, BCA, Dana, OVO, ShopeePay)', enabled: true, feePercent: 0.7 },
      { id: 'gopay_wallet', name: 'GoPay Merchant Direct', enabled: true, feePercent: 1.5 }
    ]
  }
];

export const INITIAL_BANK_ACCOUNTS = [
  {
    id: 'bank-bca-01',
    bankName: 'Bank BCA',
    bankCode: 'bca',
    accountNumber: '8890-1234-5678',
    accountHolder: 'MATE CLUB BALIKPAPAN',
    branch: 'KCU Balikpapan Sudirman',
    isActive: true,
    color: '#005baa',
    notes: 'Transfer manual BCA Mobile / myBCA / ATM'
  },
  {
    id: 'bank-mandiri-01',
    bankName: 'Bank Mandiri',
    bankCode: 'mandiri',
    accountNumber: '149-00-9876543-2',
    accountHolder: 'MATE CLUB BALIKPAPAN',
    branch: 'KC Balikpapan Ahmad Yani',
    isActive: true,
    color: '#003366',
    notes: 'Transfer Livin by Mandiri / ATM'
  }
];


export const INITIAL_WHATSAPP_CONFIG = {
  provider: 'waha', // Exclusively WAHA (WhatsApp HTTP API)
  serverUrl: 'http://localhost:3005',
  sessionName: 'default',
  engine: 'NOWEB', // 'NOWEB' | 'WEBJS' | 'GOWS'
  apiKey: '',
  status: 'SCAN_QR_CODE', // 'WORKING' | 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'FAILED'
  deviceNumber: '',
  deviceName: 'WAHA Core Server',
  adminPhone: '081251234567',
  adminNotifyEnabled: true,
  playerNotifyEnabled: true,
  webhookUrl: 'http://localhost:5173/api/webhooks/waha',
  autoReplyEnabled: true,
  qrCodeData: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=2@waha_pairing_session_mateclub_bpp',
  templates: [
    {
      id: 'tpl_invoice',
      name: 'Invoice Tagihan Booking (Pemain)',
      trigger: 'booking_created',
      endpoint: '/api/sendText',
      enabled: true,
      content: `Halo {nama_pemain}! 👋\n\nBooking kamu untuk *{judul_game}* pada *{tanggal} ({jam})* di *{nama_lapangan}* berhasil dibuat.\n\n📋 *Rincian Tagihan:*\n- Kode Booking: *{kode_booking}*\n- Posisi: *{posisi}* ({ukuran_baju})\n- Biaya Slot: *{biaya_slot}*\n- Kode Unik Transaksi: *+{kode_unik}*\n- *TOTAL TRANSFER:* *{total_bayar}*\n\n⚠️ *PENTING:* Mohon transfer *TEPAT* sesuai total *{total_bayar}* (termasuk 3 digit kode unik) agar sistem otomatis mengenali & memverifikasi transaksi kamu! ⚽`
    },
    {
      id: 'tpl_approved',
      name: 'E-Ticket Konfirmasi Lunas (Pemain)',
      trigger: 'booking_approved',
      endpoint: '/api/sendText',
      enabled: true,
      content: `HORE! Pembayaran Berhasil Terverifikasi! 🎟️\n\nHalo {nama_pemain}, slot kamu untuk *{judul_game}* SUDAH AMAN!\n\n🎫 *E-Ticket Pass:*\n- Kode Tiket: *{kode_tiket}*\n- Posisi: *{posisi}* ({ukuran_baju})\n- Venue: *{nama_lapangan}*\n- Waktu: *{tanggal} ({jam})*\n- Status: *LUNAS ({total_bayar})*\n\n📲 Buka Tiket: {link_tiket}\n\nHarap hadir 15 menit sebelum kick-off. Rompi & bola resmi sudah disiapkan!`
    },
    {
      id: 'tpl_admin_notify',
      name: 'Notifikasi Transaksi Booking Baru (Admin)',
      trigger: 'admin_booking_notify',
      endpoint: '/api/sendText',
      enabled: true,
      content: `⚽ *NOTIFIKASI TRANSAKSI BOOKING BARU (ADMIN)*\n━━━━━━━━━━━━━━━━━━━━━\nAda pemain baru yang melakukan booking slot pertandingan!\n\n📋 *Data Peserta & Transaksi:*\n• ID Booking: *{kode_booking}*\n• Kode Tiket: *{kode_tiket}*\n• Nama Pemain: *{nama_pemain}*\n• WhatsApp: *{no_wa}*\n• Posisi: *{posisi}* ({ukuran_baju})\n• Sesi: *{judul_game}*\n• Jadwal: *{tanggal} ({jam})*\n• Venue: *{nama_lapangan}*\n• Biaya Slot: *{biaya_slot}*\n• Kode Unik: *{kode_unik}*\n• Total Transfer: *{total_bayar}*\n• Status Pembayaran: *{status_pembayaran}*\n\nSilakan pantau keterisian slot di Manajemen Jadwal Dashboard Admin.`
    },
    {
      id: 'tpl_reminder',
      name: 'Pengingat Matchday (H-2 Jam)',
      trigger: 'match_reminder_2h',
      endpoint: '/api/sendText',
      enabled: true,
      content: `⏰ *PENGINGAT MATCHDAY MATE CLUB*\n\nHalo {nama_pemain}! Pertandingan *{judul_game}* akan dimulai 2 jam lagi di *{nama_lapangan}* pukul *{jam}*.\n\nJangan lupa bawa sepatu dan perlengkapan pribadimu. Sampai jumpa di lapangan! 🏃⚽`
    },
    {
      id: 'tpl_rejected',
      name: 'Notifikasi Pembayaran Ditolak',
      trigger: 'booking_rejected',
      endpoint: '/api/sendText',
      enabled: true,
      content: `Halo {nama_pemain}, mohon maaf bukti pembayaran untuk booking *{kode_booking}* belum dapat kami verifikasi karena: *{alasan_penolakan}*.\n\nSilakan hubungi admin kami untuk bantuan lebih lanjut via WhatsApp ini.`
    }
  ]
};

export const INITIAL_SPONSORS = [
  {
    id: 'sp-1',
    name: 'Specs Indonesia Official',
    tier: 'Official Apparel & Matchball Partner',
    category: 'Apparel & Equipment',
    logo: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=300&q=80',
    offer: 'Diskon 25% Sepatu Mini Soccer & Apparel resmi untuk seluruh member terdaftar MATE CLUB.',
    promoCode: 'MATECLUB25',
    discountPercent: 25,
    websiteUrl: 'https://specs.id',
    contactPhone: '0812-3456-7890',
    validUntil: '31 Desember 2026',
    status: 'active',
    isFeatured: true
  },
  {
    id: 'sp-2',
    name: 'HydroCoco Balikpapan',
    tier: 'Official Hydration Partner',
    category: 'Food & Beverage',
    logo: 'https://images.unsplash.com/photo-1550572017-edb79a1f26e2?auto=format&fit=crop&w=300&q=80',
    offer: 'Free 2 Karton Air Kelapa Alami dingin di setiap sesi matchday akhir pekan.',
    promoCode: 'HYDRO-MATE',
    discountPercent: 100,
    websiteUrl: 'https://hydrococo.com',
    contactPhone: '0813-8899-7711',
    validUntil: '31 Desember 2026',
    status: 'active',
    isFeatured: true
  },
  {
    id: 'sp-3',
    name: 'PhysioPro Sport Recovery BPP',
    tier: 'Official Sports Physio & Rehab',
    category: 'Health & Recovery',
    logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=300&q=80',
    offer: 'Free Screening Cedera Otot & Ankle serta diskon 30% terapi fisioterapi.',
    promoCode: 'PHYSIO-MATE',
    discountPercent: 30,
    websiteUrl: 'https://physiopro.id',
    contactPhone: '0852-4455-6677',
    validUntil: '31 Desember 2026',
    status: 'active',
    isFeatured: true
  }
];

export const INITIAL_TOURNAMENTS = [
  {
    id: 'trn-1',
    name: 'MATE CLUB Premier League 2026 - Season 1',
    season: '2026',
    type: 'league',
    status: 'active',
    description: 'Kompetisi Liga Resmi format 7v7 antar Komunitas & Klub Mini Soccer Balikpapan.'
  },
  {
    id: 'trn-2',
    name: 'Weekend Sparring & Trofeo Cup',
    season: '2026',
    type: 'cup',
    status: 'active',
    description: 'Turnamen Trofeo dan Sparring mingguan open level.'
  }
];

export const INITIAL_STANDINGS_CLUBS = [
  {
    id: 'club-1',
    tournamentId: 'trn-1',
    rank: 1,
    name: 'Garuda Muda BPP FC',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 8,
    drawn: 1,
    lost: 1,
    goalsFor: 32,
    goalsAgainst: 14,
    status: 'active'
  },
  {
    id: 'club-2',
    tournamentId: 'trn-1',
    rank: 2,
    name: 'Persiba Fans Club BPP',
    logo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 7,
    drawn: 2,
    lost: 1,
    goalsFor: 28,
    goalsAgainst: 12,
    status: 'active'
  },
  {
    id: 'club-3',
    tournamentId: 'trn-1',
    rank: 3,
    name: 'Borneo Fun Ballers',
    logo: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 6,
    drawn: 2,
    lost: 2,
    goalsFor: 24,
    goalsAgainst: 16,
    status: 'active'
  },
  {
    id: 'club-4',
    tournamentId: 'trn-1',
    rank: 4,
    name: 'Red Hawks Balikpapan',
    logo: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 5,
    drawn: 1,
    lost: 4,
    goalsFor: 21,
    goalsAgainst: 19,
    status: 'active'
  },
  {
    id: 'club-5',
    tournamentId: 'trn-1',
    rank: 5,
    name: 'Balikpapan All-Stars',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 4,
    drawn: 1,
    lost: 5,
    goalsFor: 18,
    goalsAgainst: 22,
    status: 'active'
  },
  {
    id: 'club-6',
    tournamentId: 'trn-1',
    rank: 6,
    name: 'MATE CLUB Squad',
    logo: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 3,
    drawn: 2,
    lost: 5,
    goalsFor: 15,
    goalsAgainst: 20,
    status: 'active'
  },
  {
    id: 'club-7',
    tournamentId: 'trn-1',
    rank: 7,
    name: 'Mahakam United Mini Soccer',
    logo: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 2,
    drawn: 1,
    lost: 7,
    goalsFor: 12,
    goalsAgainst: 27,
    status: 'active'
  },
  {
    id: 'club-8',
    tournamentId: 'trn-1',
    rank: 8,
    name: 'Kaltim Rangers FC',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=120&q=80',
    played: 10,
    won: 0,
    drawn: 2,
    lost: 8,
    goalsFor: 9,
    goalsAgainst: 29,
    status: 'active'
  }
];

export const INITIAL_TOP_PERFORMERS = [
  {
    id: 'top-1',
    tournamentId: 'trn-1',
    name: 'Rifki Pratama',
    club: 'Persiba Fans Club BPP',
    category: 'goal',
    caps: 18,
    goals: 16,
    assists: 7,
    cleanSheet: 0,
    mvpCount: 4,
    status: 'active'
  },
  {
    id: 'top-2',
    tournamentId: 'trn-1',
    name: 'Bagas Aditya',
    club: 'Balikpapan All-Stars',
    category: 'goal',
    caps: 15,
    goals: 13,
    assists: 4,
    cleanSheet: 0,
    mvpCount: 3,
    status: 'active'
  },
  {
    id: 'top-3',
    tournamentId: 'trn-1',
    name: 'Dimas Anggara',
    club: 'Borneo Fun Ballers',
    category: 'goal',
    caps: 14,
    goals: 11,
    assists: 6,
    cleanSheet: 0,
    mvpCount: 2,
    status: 'active'
  },
  {
    id: 'top-4',
    tournamentId: 'trn-1',
    name: 'Ahmad Fauzi (GK)',
    club: 'Goalkeeper Academy',
    category: 'cleansheet',
    caps: 19,
    goals: 0,
    assists: 1,
    cleanSheet: 8,
    mvpCount: 4,
    status: 'active'
  },
  {
    id: 'top-5',
    tournamentId: 'trn-1',
    name: 'Wahyu Hidayat',
    club: 'Garuda Muda BPP FC',
    category: 'goal',
    caps: 12,
    goals: 9,
    assists: 5,
    cleanSheet: 0,
    mvpCount: 1,
    status: 'active'
  }
];

export const INITIAL_COMMUNITY_POSTS = [
  {
    id: 'post-1',
    type: 'gallery',
    title: 'Sunset Fun Football Matchday #42 - Highlights & Galeri Foto',
    category: 'Dokumentasi Match',
    author: 'Media Team MATE CLUB',
    date: '2026-09-14',
    dateLabel: '14 September 2026',
    venue: 'Balikpapan Soccer Field (BSF)',
    photosCount: 84,
    coverImage: 'https://images.unsplash.com/photo-1529900245534-47fbf7de7f95?auto=format&fit=crop&w=800&q=80',
    summary: 'Dokumentasi foto aksi laga sore hari, rolling 3 tim dengan wasit resmi PSSI.',
    content: 'Terima kasih untuk seluruh 24 pemain yang hadir pada matchday sunset minggu ini. Seluruh foto hi-res dapat diunduh tanpa kompresi.',
    externalUrl: 'https://photos.google.com',
    status: 'active',
    isPinned: true,
    tags: ['Fun Football', 'Gallery HD', 'Sunset Match']
  },
  {
    id: 'post-2',
    type: 'gallery',
    title: 'Night Sparring Challenge Garuda Muda vs Red Hawks',
    category: 'Dokumentasi Match',
    author: 'Media Team MATE CLUB',
    date: '2026-09-10',
    dateLabel: '10 September 2026',
    venue: 'Borneo Mini Stadium Ringroad',
    photosCount: 112,
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
    summary: 'Pertandingan sengit 2x45 menit tensi tinggi dengan kemenangan tipis Garuda Muda.',
    content: 'Highlight match foto under the floodlights. Pertandingan berjalan sportif dan intens.',
    externalUrl: 'https://photos.google.com',
    status: 'active',
    isPinned: false,
    tags: ['Sparring 7v7', 'Night Lights', 'High Res']
  },
  {
    id: 'post-3',
    type: 'article',
    title: 'Tips Taktik Transisi Cepat & Rotasi Posisi 7v7 di Mini Soccer',
    category: 'Tips & Trik',
    author: 'Coach Irfan (Lisensi C PSSI)',
    date: '2026-09-18',
    dateLabel: '18 September 2026',
    venue: 'MATE CLUB Academy',
    photosCount: 0,
    coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=800&q=80',
    summary: 'Panduan menjaga stamina, compact defense, dan skema serangan balik cepat format 7v7.',
    content: 'Format 7v7 menuntut mobilitas tinggi. Kunci kemenangan bukan hanya skill individu, melainkan komunikasi saat transisi dari menyerang ke bertahan.',
    externalUrl: '',
    status: 'active',
    isPinned: false,
    tags: ['Tactics', 'Coaching', 'Mini Soccer']
  },
  {
    id: 'post-4',
    type: 'announcement',
    title: 'Pendaftaran Open Trofeo Weekend MATE CLUB Cup 2026 Resmi Dibuka',
    category: 'Pengumuman Event',
    author: 'Panitia Turnamen MATE CLUB',
    date: '2026-09-19',
    dateLabel: '19 September 2026',
    venue: 'Balikpapan Soccer Arena',
    photosCount: 0,
    coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
    summary: 'Slot terbatas untuk 6 tim komunitas. Hadiah total jutaan rupiah, trofi eksklusif, dan medali.',
    content: 'Pendaftaran trofeo dibuka sampai tanggal 25 September 2026. Setiap tim mendapatkan dokumentasi full match dan wasit berlisensi.',
    externalUrl: 'https://wa.me/6281251234567',
    status: 'active',
    isPinned: true,
    tags: ['Trofeo Cup', 'Turnamen', 'Pendaftaran']
  }
];

export const INITIAL_COMMUNITY_MENU_CONFIG = {
  showStandings: true,
  showTopPerformers: true,
  showArticles: true,
  showGallery: true,
  showSponsors: true
};
