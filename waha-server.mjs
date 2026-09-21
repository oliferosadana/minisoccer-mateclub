import express from 'express';
import cors from 'cors';
import pino from 'pino';
import qrcode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Baileys import
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.WAHA_PORT || 3005;
const SESSIONS_DIR = path.join(__dirname, 'waha_sessions');
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const logger = pino({ level: 'silent' });

// Global session & history state
let sock = null;
let currentQR = null;
let currentQRRaw = null;
let currentStatus = 'STOPPED'; // 'STOPPED' | 'STARTING' | 'SCAN_QR_CODE' | 'WORKING'
let qrImageBuffer = null;
let isStarting = false;
let qrGeneratedAt = null;
let messageLogs = []; // Array of { id, to, text, status, timestamp, error }
let reconnectTimeout = null;

function addMessageLog(entry) {
  messageLogs.unshift({
    id: entry.id || `LOG-${Date.now()}`,
    to: entry.to,
    text: entry.text,
    status: entry.status || 'SENT',
    timestamp: new Date().toISOString(),
    error: entry.error || null
  });
  if (messageLogs.length > 100) {
    messageLogs = messageLogs.slice(0, 100);
  }
}

async function initSession(sessionName = 'default') {
  if (isStarting) return sock;
  isStarting = true;
  currentStatus = 'STARTING';
  currentQR = null;
  qrImageBuffer = null;

  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  const sessionPath = path.join(SESSIONS_DIR, sessionName);
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

  console.log(`[WAHA Server] Starting session "${sessionName}" (Baileys v${version.join('.')})...`);

  try {
    if (sock) {
      try { sock.ev.removeAllListeners(); } catch {}
      try { sock.end(); } catch {}
    }

    sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger)
      },
      browser: ['MateClub MiniSoccer', 'Chrome', '124.0.0'],
      generateHighQualityLinkPreview: true,
      syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQRRaw = qr;
        currentStatus = 'SCAN_QR_CODE';
        qrGeneratedAt = Date.now();
        try {
          qrImageBuffer = await qrcode.toBuffer(qr, {
            errorCorrectionLevel: 'M',
            margin: 2,
            scale: 8
          });
          currentQR = `data:image/png;base64,${qrImageBuffer.toString('base64')}`;
          console.log(`[WAHA Server] [${new Date().toLocaleTimeString()}] Live WhatsApp QR generated.`);
        } catch (e) {
          console.error('[WAHA Server] Error generating QR buffer:', e);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;
        console.log(`[WAHA Server] Connection closed (${statusCode || 'Unknown'}). Reconnecting in 5s...`);
        
        currentStatus = 'STOPPED';
        currentQR = null;
        qrImageBuffer = null;
        isStarting = false;

        if (!isLoggedOut) {
          reconnectTimeout = setTimeout(() => {
            initSession(sessionName);
          }, 5000);
        }
      } else if (connection === 'open') {
        currentStatus = 'WORKING';
        currentQR = null;
        qrImageBuffer = null;
        isStarting = false;
        console.log(`[WAHA Server] WhatsApp CONNECTED! Phone: ${sock?.user?.id || 'Active'}`);
      }
    });

    isStarting = false;
    return sock;
  } catch (err) {
    console.error('[WAHA Server] Socket error:', err.message);
    currentStatus = 'STOPPED';
    isStarting = false;
    reconnectTimeout = setTimeout(() => initSession(sessionName), 6000);
  }
}

// Start default session on server boot
initSession('default');

// --- REST API ROUTES ---

// 1. Health & Status
app.get(['/api/server/status', '/ping', '/'], (req, res) => {
  res.json({
    status: 'OK',
    engine: 'NOWEB',
    version: '2026.3.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    session: {
      name: 'default',
      status: currentStatus,
      qrAgeSeconds: qrGeneratedAt ? Math.floor((Date.now() - qrGeneratedAt) / 1000) : null,
      me: sock?.user || null
    }
  });
});

// 2. Sessions List & Detail
app.get('/api/sessions', (req, res) => {
  res.json([
    {
      name: 'default',
      status: currentStatus,
      engine: 'NOWEB',
      me: sock?.user || null
    }
  ]);
});

app.get('/api/sessions/:session', (req, res) => {
  res.json({
    name: req.params.session || 'default',
    status: currentStatus,
    engine: 'NOWEB',
    me: sock?.user || null
  });
});

// 3. Start Session
app.post(['/api/sessions/start', '/api/sessions'], async (req, res) => {
  const session = req.body?.name || 'default';
  if (currentStatus !== 'WORKING') {
    await initSession(session);
  }
  res.json({
    name: session,
    status: currentStatus,
    engine: 'NOWEB'
  });
});

// 4. Stop Session
app.post('/api/sessions/stop', async (req, res) => {
  if (sock) {
    try { await sock.logout(); } catch {}
    try { sock.end(); } catch {}
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  currentStatus = 'STOPPED';
  currentQR = null;
  qrImageBuffer = null;
  res.json({ success: true, status: 'STOPPED' });
});

// 5. Restart Session
app.post('/api/sessions/restart', async (req, res) => {
  if (sock) {
    try { sock.end(); } catch {}
  }
  currentStatus = 'STARTING';
  setTimeout(() => initSession(req.body?.name || 'default'), 1000);
  res.json({ success: true, status: 'STARTING' });
});

// 6. QR Code Endpoints
app.get(['/api/:session/auth/qr', '/api/sessions/:session/auth/qr', '/api/screenshot'], (req, res) => {
  if (currentStatus === 'WORKING') {
    return res.status(200).json({ status: 'WORKING', message: 'WhatsApp session is already connected.' });
  }

  const format = req.query.format;
  if (format === 'raw' || format === 'json') {
    return res.json({
      status: currentStatus,
      qr: currentQRRaw,
      dataUrl: currentQR,
      generatedAt: qrGeneratedAt
    });
  }

  if (qrImageBuffer) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(qrImageBuffer);
  }

  res.status(404).json({
    status: currentStatus,
    error: 'QR Code is generating or session is restarting. Please retry in a few seconds.'
  });
});

// 7. Pairing Code Request (Phone Login)
app.post(['/api/:session/auth/request-code', '/api/sessions/:session/auth/request-code'], async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ error: 'phoneNumber is required' });
  }

  let clean = phoneNumber.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) clean = '62' + clean.slice(1);

  if (!sock) {
    await initSession(req.params.session || 'default');
    await new Promise(r => setTimeout(r, 2000));
  }

  try {
    const code = await sock.requestPairingCode(clean);
    console.log(`[WAHA Server] Pairing code for ${clean}: ${code}`);
    res.json({
      success: true,
      code: code,
      phoneNumber: clean
    });
  } catch (err) {
    console.error('[WAHA Server] Pairing code error:', err.message);
    res.status(500).json({
      success: false,
      error: err.message || 'Gagal meminta pairing code'
    });
  }
});

// 8. Send Single Message (POST /api/sendText)
app.post('/api/sendText', async (req, res) => {
  const { chatId, text } = req.body;

  if (!chatId || !text) {
    return res.status(400).json({ error: 'chatId and text are required' });
  }

  let target = chatId;
  if (!target.includes('@')) {
    let clean = target.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    target = `${clean}@s.whatsapp.net`;
  } else if (target.endsWith('@c.us')) {
    target = target.replace('@c.us', '@s.whatsapp.net');
  }

  if (currentStatus !== 'WORKING' || !sock) {
    const errorMsg = `WhatsApp belum terhubung (Status: ${currentStatus}). Silakan hubungkan WhatsApp via QR Code atau Pairing Code di Dashboard.`;
    addMessageLog({ to: target, text, status: 'FAILED', error: errorMsg });
    return res.status(503).json({
      success: false,
      error: errorMsg,
      status: currentStatus
    });
  }

  try {
    const result = await sock.sendMessage(target, { text });
    const msgId = result.key.id || `MSG-${Date.now()}`;
    console.log(`[WAHA Server] Message dispatched to ${target} (ID: ${msgId})`);
    
    addMessageLog({ id: msgId, to: target, text, status: 'SENT' });
    res.json({
      success: true,
      id: msgId,
      timestamp: new Date().toISOString(),
      status: 'SENT',
      to: target,
      text
    });
  } catch (err) {
    console.error('[WAHA Server] Send message error:', err.message);
    addMessageLog({ to: target, text, status: 'FAILED', error: err.message });
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to send message'
    });
  }
});

// 9. Send Bulk / Broadcast (POST /api/sendBulk)
app.post('/api/sendBulk', async (req, res) => {
  const { recipients, text, delayMs = 1500 } = req.body;

  if (!Array.isArray(recipients) || recipients.length === 0 || !text) {
    return res.status(400).json({ error: 'recipients (array) and text are required' });
  }

  if (currentStatus !== 'WORKING' || !sock) {
    return res.status(503).json({
      success: false,
      error: `WhatsApp belum terhubung (Status: ${currentStatus}).`
    });
  }

  const results = [];
  for (const phone of recipients) {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    const target = `${clean}@s.whatsapp.net`;

    try {
      const sent = await sock.sendMessage(target, { text });
      results.push({ to: phone, success: true, id: sent.key.id });
      addMessageLog({ id: sent.key.id, to: target, text, status: 'SENT' });
    } catch (e) {
      results.push({ to: phone, success: false, error: e.message });
      addMessageLog({ to: target, text, status: 'FAILED', error: e.message });
    }

    if (delayMs > 0) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }

  res.json({
    success: true,
    total: recipients.length,
    sentCount: results.filter(r => r.success).length,
    failedCount: results.filter(r => !r.success).length,
    results
  });
});

// 10. Message Transmission Logs & History
app.get('/api/messages/logs', (req, res) => {
  res.json({
    success: true,
    total: messageLogs.length,
    logs: messageLogs
  });
});

// Start listening
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=================================================`);
  console.log(`🚀 WAHA Core Local Gateway Server ACTIVE on http://localhost:${PORT}`);
  console.log(`📡 REST API Endpoints:`);
  console.log(`   - GET  /api/server/status`);
  console.log(`   - GET  /api/default/auth/qr`);
  console.log(`   - POST /api/default/auth/request-code`);
  console.log(`   - POST /api/sendText`);
  console.log(`   - POST /api/sendBulk`);
  console.log(`   - GET  /api/messages/logs`);
  console.log(`=================================================`);
});
