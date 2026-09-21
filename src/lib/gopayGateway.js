/**
 * GoPay API Gateway Client & EMVCo Dynamic QRIS Engine
 * Compatible with https://github.com/ahmadzakiyox/gopay-api-gateaway
 * Live Server: https://gopay.masondo.dev
 * Compliant with Bank Indonesia QRIS & EMVCo Merchant-Presented Mode
 */

import jsQR from 'jsqr';

// EMVCo Checksum CRC16 (CCITT-FALSE: poly 0x1021, init 0xFFFF)
export function calculateCRC16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generate Dynamic QRIS EMVCo from Static QRIS String
 * Converts Tag 01 (11 -> 12), sets Tag 54 (Amount), recalculates Tag 63 (CRC16)
 * Preserves 100% of Merchant data (Tag 26 GoPay, Tag 51 NMID, Tag 59 Name, etc.)
 */
export function generateDynamicQRIS(staticTemplate, amount) {
  if (!staticTemplate || typeof staticTemplate !== 'string') return null;
  let qris = staticTemplate.trim();

  // Strip trailing CRC16 Tag 63 if present (e.g. 6304XXXX)
  if (qris.includes('6304')) {
    qris = qris.substring(0, qris.lastIndexOf('6304'));
  }

  // Change Tag 01 from 11 (Static) to 12 (Dynamic)
  if (qris.startsWith('000201010211')) {
    qris = '000201010212' + qris.substring(12);
  } else if (qris.startsWith('000201')) {
    qris = qris.replace(/^000201010211/, '000201010212');
  }

  const numericAmount = parseInt(amount, 10) || 0;
  const amountStr = numericAmount.toString();
  const amountTag = '54' + amountStr.length.toString().padStart(2, '0') + amountStr;

  // Check if Tag 54 already exists in the template
  const tag54Match = qris.match(/54(\d{2})(\d+)/);
  if (tag54Match) {
    const oldTag54 = tag54Match[0];
    qris = qris.replace(oldTag54, amountTag);
  } else {
    // Standard EMVCo location: Insert Tag 54 right before Tag 58 (Country Code: 5802ID) or Tag 59
    const pos58 = qris.indexOf('5802ID');
    if (pos58 !== -1) {
      qris = qris.substring(0, pos58) + amountTag + qris.substring(pos58);
    } else {
      const pos59 = qris.indexOf('59');
      if (pos59 !== -1) {
        qris = qris.substring(0, pos59) + amountTag + qris.substring(pos59);
      } else {
        qris = qris + amountTag;
      }
    }
  }

  // Append Tag 63 with length 04
  const payloadToHash = qris + '6304';
  const checksum = calculateCRC16(payloadToHash);
  return payloadToHash + checksum;
}

/**
 * Parse and validate QRIS string to inspect Merchant Name, NMID, Type, etc.
 */
export function parseQRISDetails(qrisString) {
  if (!qrisString || typeof qrisString !== 'string') {
    return { valid: false, error: 'String QRIS kosong' };
  }

  const clean = qrisString.trim();
  if (!clean.startsWith('000201')) {
    return { valid: false, error: 'Format QRIS tidak valid (harus diawali 000201)' };
  }

  const isDynamic = clean.includes('010212');
  const isStatic = clean.includes('010211');

  // Extract Merchant Name (Tag 59)
  let merchantName = 'Tidak Diketahui';
  const match59 = clean.match(/59(\d{2})([^0-9]{1,25}|[A-Za-z0-9\s._\-]{1,25})/);
  if (match59) {
    const len = parseInt(match59[1], 10);
    const startIndex = clean.indexOf(match59[0]) + 4;
    merchantName = clean.substring(startIndex, startIndex + len);
  }

  // Extract NMID (from Tag 51)
  let nmid = '-';
  const matchNmid = clean.match(/ID[0-9]{11,15}/);
  if (matchNmid) {
    nmid = matchNmid[0];
  }

  // Extract City (Tag 60)
  let city = '-';
  const match60 = clean.match(/60(\d{2})([A-Za-z\s]+)/);
  if (match60) {
    const len = parseInt(match60[1], 10);
    const startIndex = clean.indexOf(match60[0]) + 4;
    city = clean.substring(startIndex, startIndex + len);
  }

  // Extract Amount (Tag 54)
  let amount = null;
  const match54 = clean.match(/54(\d{2})(\d+)/);
  if (match54) {
    const len = parseInt(match54[1], 10);
    const startIndex = clean.indexOf(match54[0]) + 4;
    amount = parseInt(clean.substring(startIndex, startIndex + len), 10);
  }

  // Verify CRC
  let isCrcValid = false;
  if (clean.includes('6304')) {
    const idx63 = clean.lastIndexOf('6304');
    const givenCrc = clean.substring(idx63 + 4, idx63 + 8).toUpperCase();
    const payload = clean.substring(0, idx63 + 4);
    const calculated = calculateCRC16(payload);
    isCrcValid = givenCrc === calculated;
  }

  return {
    valid: true,
    type: isDynamic ? 'DYNAMIC' : isStatic ? 'STATIC' : 'UNKNOWN',
    merchantName: merchantName.trim(),
    nmid,
    city: city.trim(),
    amount,
    isCrcValid,
    rawLength: clean.length
  };
}

/**
 * Decode QR Code from an uploaded Image File (PNG/JPEG)
 */
export async function decodeQRISFromImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          resolve(code.data);
        } else {
          reject(new Error('Tidak dapat membaca QR Code dari gambar. Pastikan gambar jelas dan tidak blur.'));
        }
      };
      img.onerror = () => reject(new Error('Gagal memuat file gambar'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

// Ping Server Health
export async function pingGoPayServer(serverUrl = 'https://gopay.masondo.dev') {
  try {
    const res = await fetch(`${serverUrl.replace(/\/$/, '')}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data };
    }
    return { success: false, message: `Server HTTP ${res.status}` };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// Create Dynamic QRIS via GoPay Gateway Server
export async function createGoPayQRIS({
  serverUrl = 'https://gopay.masondo.dev',
  apiKey = '',
  amount = 50000,
  qrisStatic = ''
}) {
  const numericAmount = parseInt(amount, 10);
  const fallbackQrisId = Math.random().toString(36).substring(2, 10);
  const fallbackTrxId = 'TRX-' + Math.random().toString(36).substring(2, 10).toUpperCase();

  // 1. First attempt calling the backend server API
  if (serverUrl && apiKey) {
    try {
      const cleanUrl = serverUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/create-qris`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({ amount: numericAmount })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return {
            success: true,
            qrisId: json.data.qris_id,
            trxId: json.data.trx_id,
            qrisCode: json.data.qris_code,
            qrisUrl: json.data.qris_url,
            amount: json.data.amount,
            expiresAt: json.data.expires_at || new Date(Date.now() + 5 * 60 * 1000).toISOString()
          };
        }
      }
    } catch (err) {
      console.warn('GoPay Gateway API request failed, using client-side generator:', err);
    }
  }

  // 2. Client-side EMVCo Dynamic QRIS generation from configured static QRIS
  const localQRIS = generateDynamicQRIS(qrisStatic, numericAmount);

  return {
    success: true,
    qrisId: fallbackQrisId,
    trxId: fallbackTrxId,
    qrisCode: localQRIS,
    qrisUrl: `${serverUrl.replace(/\/$/, '')}/qr/${fallbackQrisId}`,
    amount: numericAmount,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
  };
}

// Check QRIS Settlement Status (Supports Rupiah & Gojek API Cents Conversion)
export async function checkGoPayQRISStatus({
  serverUrl = 'https://gopay.masondo.dev',
  apiKey = '382050b0c6f03386901e040efd9182b56021c43e3e2932260142cbcaf3729144',
  qrisId = '',
  amount = null,
  startTime = null
}) {
  const cleanUrl = (serverUrl || 'https://gopay.masondo.dev').replace(/\/$/, '');
  const keyToUse = apiKey || '382050b0c6f03386901e040efd9182b56021c43e3e2932260142cbcaf3729144';
  const targetNominal = amount ? parseInt(amount, 10) : null;

  // 1. Direct query via /transactions (primary inspection for incoming settlement mutations)
  if (targetNominal && keyToUse) {
    try {
      const txRes = await fetch(`${cleanUrl}/transactions?pageSize=50`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'x-api-key': keyToUse
        }
      });

      if (txRes.ok) {
        const txJson = await txRes.json();
        const txs = txJson?.data?.transactions || [];

        const matched = txs.find(tx => {
          const rawAmount = parseInt(tx.amount, 10);
          // Match standard Rupiah (50235), Gojek Cents x100 (5023500), or float /100
          const matchesNominal = rawAmount === targetNominal || rawAmount === (targetNominal * 100) || (rawAmount / 100) === targetNominal;
          const statusOk = !tx.status || tx.status.toLowerCase() === 'settlement' || tx.status.toLowerCase() === 'success' || tx.status.toLowerCase() === 'capture' || tx.status.toLowerCase() === 'paid';
          return matchesNominal && statusOk;
        });

        if (matched) {
          return {
            success: true,
            status: 'PAID',
            paid: true,
            transaction: {
              transaction_id: matched.transaction_id || matched.id,
              order_id: matched.order_id,
              amount: targetNominal,
              payer_issuer: matched.issuer || 'DANA / GoPay / Bank',
              payment_type: 'QRIS',
              transaction_time: matched.time
            },
            message: 'Pembayaran mutasi terverifikasi lunas!'
          };
        }
      }
    } catch (err) {
      console.warn('GoPay /transactions verification error:', err.message);
    }
  }

  // 2. Check via public QR status endpoint (/api/qr-status/:id)
  if (qrisId) {
    try {
      const res = await fetch(`${cleanUrl}/api/qr-status/${encodeURIComponent(qrisId)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        const json = await res.json();
        if (json.paid || json.status === 'PAID') {
          return {
            success: true,
            status: 'PAID',
            paid: true,
            transaction: json.transaction || null,
            message: 'Pembayaran berhasil terverifikasi lunas!'
          };
        }
      }
    } catch (err) {
      console.warn('GoPay /api/qr-status error:', err.message);
    }
  }

  // 3. Fallback check via /check-payment endpoint
  if (targetNominal && keyToUse) {
    try {
      const checkRes = await fetch(`${cleanUrl}/check-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': keyToUse
        },
        body: JSON.stringify({
          amount: targetNominal,
          startTime: startTime || new Date(Date.now() - 60 * 60 * 1000).toISOString()
        })
      });

      if (checkRes.ok) {
        const checkJson = await checkRes.json();
        if (checkJson.paid || (checkJson.success && checkJson.transaction)) {
          return {
            success: true,
            status: 'PAID',
            paid: true,
            transaction: checkJson.transaction,
            message: 'Pembayaran mutasi terverifikasi lunas!'
          };
        }
      }
    } catch (err) {
      console.warn('GoPay /check-payment fallback error:', err.message);
    }
  }

  return {
    success: false,
    status: 'UNPAID',
    paid: false,
    message: 'Belum terdeteksi atau mutasi sedang diproses'
  };
}
