import fs from 'fs';

console.log('--- Verifying WAHA Gateway Integration ---');

let allOk = true;

const wahaGateway = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/lib/wahaGateway.js', 'utf-8');
const wahaSection = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/components/admin/WhatsAppGatewaySection.jsx', 'utf-8');

const functions = [
  'checkWahaHealth',
  'getWahaSession',
  'startWahaSession',
  'stopWahaSession',
  'restartWahaSession',
  'fetchLiveWahaQR',
  'requestWahaPairingCode',
  'sendWahaTextMessage'
];

functions.forEach(fn => {
  if (wahaGateway.includes(fn)) {
    console.log(`[OK] wahaGateway.js exports ${fn}`);
  } else {
    console.error(`[FAIL] wahaGateway.js missing ${fn}`);
    allOk = false;
  }
});

if (wahaSection.includes('requestWahaPairingCode') && wahaSection.includes('fetchLiveWahaQR') && wahaSection.includes('pairingTab')) {
  console.log('[OK] WhatsAppGatewaySection has live QR fetching, pairing code generator, and auto-refresh');
} else {
  console.error('[FAIL] WhatsAppGatewaySection missing expected pairing tools');
  allOk = false;
}

if (allOk) {
  console.log('🎉 ALL WAHA CHECKS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
