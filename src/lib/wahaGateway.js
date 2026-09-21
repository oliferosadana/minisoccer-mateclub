/**
 * WAHA (WhatsApp HTTP API) Client & REST Gateway Integration
 * Compatible with WAHA Core & WAHA Plus (https://waha.devlike.pro)
 * Supported Engines: NOWEB (Baileys), WEBJS (Puppeteer), GOWS
 */

/**
 * Format headers with optional X-Api-Key
 */
function getHeaders(apiKey, isJson = true) {
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  }
  if (apiKey && apiKey.trim()) {
    headers['X-Api-Key'] = apiKey.trim();
  }
  return headers;
}

/**
 * Clean base URL (strip trailing slashes)
 */
function cleanUrl(url) {
  if (!url) return 'http://localhost:3000';
  return url.trim().replace(/\/+$/, '');
}

/**
 * 1. Health Check Ping to WAHA Server
 */
export async function checkWahaHealth({ serverUrl, apiKey }) {
  const base = cleanUrl(serverUrl);
  const startTime = Date.now();

  // Try /api/server/status, then /api/sessions, then /ping
  const endpoints = ['/api/server/status', '/api/sessions', '/ping', '/'];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${base}${ep}`, {
        method: 'GET',
        headers: getHeaders(apiKey),
        signal: AbortSignal.timeout(3500)
      });

      const elapsed = Date.now() - startTime;

      if (res.ok) {
        let json = null;
        try { json = await res.json(); } catch {}
        return {
          success: true,
          status: res.status,
          latency: elapsed,
          data: json,
          serverUrl: base
        };
      }
    } catch (err) {
      // try next endpoint
    }
  }

  return {
    success: false,
    error: `Server WAHA pada ${base} tidak dapat dijangkau. Pastikan service WAHA sudah aktif.`,
    serverUrl: base
  };
}

/**
 * 2. Get Details of a WAHA Session (Multi-endpoint fallback & status normalization)
 */
export async function getWahaSession({ serverUrl, sessionName = 'default', apiKey }) {
  const base = cleanUrl(serverUrl);
  const targetSession = sessionName.trim() || 'default';

  const endpoints = [
    `${base}/api/sessions/${encodeURIComponent(targetSession)}`,
    `${base}/api/sessions`,
    `${base}/api/server/status`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'GET',
        headers: getHeaders(apiKey),
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        let foundSession = null;

        if (Array.isArray(data)) {
          // If /api/sessions returned an array of sessions
          foundSession = data.find(s => s.name === targetSession) || data[0] || null;
        } else if (data.session && typeof data.session === 'object') {
          // If /api/server/status returned { session: { status, me } }
          foundSession = data.session;
        } else if (data.name || data.status) {
          foundSession = data;
        }

        if (foundSession) {
          let rawStatus = (foundSession.status || '').toUpperCase();
          let normalizedStatus = 'STOPPED';

          if (['WORKING', 'CONNECTED', 'PAIRED', 'AUTHENTICATED', 'ONLINE'].includes(rawStatus)) {
            normalizedStatus = 'WORKING';
          } else if (['SCAN_QR_CODE', 'QR', 'SCAN', 'WAITING_FOR_SCAN'].includes(rawStatus)) {
            normalizedStatus = 'SCAN_QR_CODE';
          } else if (['STARTING', 'INITIALIZING'].includes(rawStatus)) {
            normalizedStatus = 'STARTING';
          } else {
            normalizedStatus = rawStatus || 'STOPPED';
          }

          const meObj = foundSession.me || null;
          return {
            success: true,
            session: foundSession,
            status: normalizedStatus,
            me: meObj
          };
        }
      }
    } catch (err) {
      // try next endpoint
    }
  }

  return { success: false, status: 'OFFLINE', error: 'Tidak dapat mengambil status sesi dari server WAHA.' };
}


/**
 * 3. Start or Create a WAHA Session
 */
export async function startWahaSession({ serverUrl, sessionName = 'default', apiKey, engine = 'NOWEB' }) {
  const base = cleanUrl(serverUrl);
  const name = sessionName.trim() || 'default';

  try {
    // Try POST /api/sessions/start first
    const startRes = await fetch(`${base}/api/sessions/start`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({ name }),
      signal: AbortSignal.timeout(5000)
    });

    if (startRes.ok) {
      const data = await startRes.json();
      return { success: true, session: data };
    }

    // If start failed (e.g. session not found), try creating it via POST /api/sessions/
    const createRes = await fetch(`${base}/api/sessions/`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        name,
        config: {
          noweb: { store: { enabled: true } }
        }
      }),
      signal: AbortSignal.timeout(5000)
    });

    if (createRes.ok) {
      const data = await createRes.json();
      return { success: true, session: data };
    }

    const errData = await createRes.json().catch(() => ({}));
    return { success: false, error: errData.message || 'Gagal memulai session WAHA' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 4. Stop a WAHA Session
 */
export async function stopWahaSession({ serverUrl, sessionName = 'default', apiKey }) {
  const base = cleanUrl(serverUrl);
  const name = sessionName.trim() || 'default';

  try {
    const res = await fetch(`${base}/api/sessions/stop`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({ name }),
      signal: AbortSignal.timeout(5000)
    });

    if (res.ok) {
      return { success: true };
    }
    return { success: false, error: 'Gagal menghentikan session' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 4b. Restart a WAHA Session
 */
export async function restartWahaSession({ serverUrl, sessionName = 'default', apiKey }) {
  const base = cleanUrl(serverUrl);
  const name = sessionName.trim() || 'default';

  try {
    const res = await fetch(`${base}/api/sessions/restart`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({ name }),
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      return { success: true };
    }
    return { success: false, error: 'Gagal merestart session' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 5. Fetch Live QR Code from WAHA (as Blob / Image URL)
 */
export async function fetchLiveWahaQR({ serverUrl, sessionName = 'default', apiKey }) {
  const base = cleanUrl(serverUrl);
  const session = encodeURIComponent(sessionName.trim() || 'default');

  // Candidate endpoints for QR in WAHA
  const endpoints = [
    `${base}/api/${session}/auth/qr`,
    `${base}/api/sessions/${session}/auth/qr`,
    `${base}/api/screenshot?session=${session}`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'GET',
        headers: {
          ...(apiKey && apiKey.trim() ? { 'X-Api-Key': apiKey.trim() } : {}),
          'Accept': 'image/png, image/jpeg, */*'
        },
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('image')) {
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          return {
            success: true,
            isLive: true,
            imageUrl: objectUrl,
            rawBlob: blob,
            timestamp: Date.now()
          };
        } else {
          // If JSON returned (e.g. raw qr string or status)
          const json = await res.json();
          if (json.qr || json.code) {
            return {
              success: true,
              isLive: true,
              rawQR: json.qr || json.code,
              timestamp: Date.now()
            };
          }
        }
      }
    } catch (e) {
      // try next endpoint
    }
  }

  return {
    success: false,
    error: 'Tidak dapat mengambil QR code dari server WAHA. Pastikan session sedang dalam status SCAN_QR_CODE.'
  };
}

/**
 * 6. Request Pairing Code (Alternative Phone-Based Login without Camera)
 * WAHA endpoint: POST /api/{session}/auth/request-code
 */
export async function requestWahaPairingCode({ serverUrl, sessionName = 'default', phoneNumber, apiKey }) {
  const base = cleanUrl(serverUrl);
  const session = encodeURIComponent(sessionName.trim() || 'default');
  let cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);

  if (!cleanPhone || cleanPhone.length < 9) {
    return { success: false, error: 'Nomor WhatsApp tidak valid untuk pairing code (contoh: 081234567890).' };
  }

  const endpoints = [
    `${base}/api/${session}/auth/request-code`,
    `${base}/api/sessions/${session}/auth/request-code`
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: getHeaders(apiKey),
        body: JSON.stringify({ phoneNumber: cleanPhone }),
        signal: AbortSignal.timeout(6000)
      });

      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          code: data.code || data.pairingCode || data,
          phoneNumber: cleanPhone
        };
      }
    } catch (e) {}
  }

  return {
    success: false,
    error: 'Gagal meminta pairing code dari server WAHA. Pastikan WAHA mendukung NOWEB / Pairing Code.'
  };
}

/**
 * 7. Send Real Text Message via WAHA REST API
 * WAHA endpoint: POST /api/sendText
 */
export async function sendWahaTextMessage({ serverUrl, sessionName = 'default', phone, text, apiKey }) {
  const base = cleanUrl(serverUrl);
  const session = sessionName.trim() || 'default';

  let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
  const chatId = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@c.us`;

  try {
    const res = await fetch(`${base}/api/sendText`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        session,
        chatId,
        text
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        messageId: data.id || data.messageId || `MSG-${Date.now()}`,
        data,
        timestamp: new Date().toISOString()
      };
    }

    const errData = await res.json().catch(() => ({}));
    return {
      success: false,
      error: errData.message || `Server WAHA mengembalikan error HTTP ${res.status}`
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || 'Gagal menghubungi server WAHA'
    };
  }
}

/**
 * 8. Parse Template with Dynamic Placeholders
 */
export function parseWhatsAppTemplate(templateContent, data = {}) {
  if (!templateContent) return '';
  let text = templateContent;
  const replacements = {
    '{nama_pemain}': data.playerName || 'Pemain',
    '{kode_booking}': data.bookingId || data.id || '-',
    '{kode_tiket}': data.ticketCode || data.bookingId || '-',
    '{no_wa}': data.phone || '-',
    '{posisi}': data.position || 'Pemain Lapangan',
    '{ukuran_baju}': data.jerseySize ? `Size ${data.jerseySize}` : 'Size L',
    '{judul_game}': data.matchTitle || data.match?.title || 'Mini Soccer Match',
    '{tanggal}': data.dateLabel || data.match?.dateLabel || data.match?.date || '-',
    '{jam}': data.timeSlot || data.match?.timeSlot || '-',
    '{nama_lapangan}': data.venueName || data.venue?.name || 'Lapangan Mini Soccer',
    '{kode_unik}': data.uniqueCode ? `${data.uniqueCode}` : '-',
    '{biaya_slot}': typeof data.baseAmount === 'number' ? `Rp ${data.baseAmount.toLocaleString('id-ID')}` : (data.baseAmount ? `Rp ${Number(data.baseAmount).toLocaleString('id-ID')}` : (typeof data.amount === 'number' ? `Rp ${data.amount.toLocaleString('id-ID')}` : 'Rp 0')),
    '{total_bayar}': typeof data.amount === 'number' ? `Rp ${data.amount.toLocaleString('id-ID')}` : (data.amount ? `Rp ${Number(data.amount).toLocaleString('id-ID')}` : 'Rp 0'),
    '{status_pembayaran}': data.status === 'paid' || data.paymentStatus === 'paid' ? 'LUNAS (Terverifikasi Sistem)' : 'MENUNGGU VERIFIKASI',
    '{link_tiket}': data.ticketUrl || (typeof window !== 'undefined' ? `${window.location.origin}` : 'https://mate-club.masondo.dev'),
    '{alasan_penolakan}': data.rejectionReason || 'Bukti transfer tidak terbaca / nominal tidak sesuai'
  };

  for (const [key, val] of Object.entries(replacements)) {
    text = text.replaceAll(key, val);
  }
  return text;
}

/**
 * 9. Send Bulk / Broadcast Messages
 * WAHA endpoint: POST /api/sendBulk
 */
export async function sendWahaBulkMessages({ serverUrl, recipients, text, apiKey }) {
  const base = cleanUrl(serverUrl);
  try {
    const res = await fetch(`${base}/api/sendBulk`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify({
        recipients,
        text,
        delayMs: 1200
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, ...data };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || errData.message || 'Gagal broadcast pesan' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * 10. Fetch Live Transmission Logs from WAHA Gateway
 * WAHA endpoint: GET /api/messages/logs
 */
export async function fetchWahaMessageLogs({ serverUrl, apiKey }) {
  const base = cleanUrl(serverUrl);
  try {
    const res = await fetch(`${base}/api/messages/logs`, {
      method: 'GET',
      headers: getHeaders(apiKey),
      signal: AbortSignal.timeout(4000)
    });

    if (res.ok) {
      const data = await res.json();
      return { success: true, logs: data.logs || [] };
    }
    return { success: false, logs: [] };
  } catch (err) {
    return { success: false, logs: [], error: err.message };
  }
}

