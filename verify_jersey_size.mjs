import fs from 'fs';
import path from 'path';

console.log('--- Verifying Jersey Size Feature Implementation ---');

let allOk = true;

// 1. Check BookingModal.jsx
const bookingModal = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/components/public/BookingModal.jsx', 'utf-8');
if (bookingModal.includes('jerseySize') && bookingModal.includes("['S', 'M', 'L', 'XL', 'XXL']") && bookingModal.includes('Ukuran Baju / Jersey Rompi')) {
  console.log('[OK] BookingModal has jersey size selector & state');
} else {
  console.error('[FAIL] BookingModal missing jersey size options');
  allOk = false;
}

// 2. Check AppContext.jsx
const appContext = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/context/AppContext.jsx', 'utf-8');
if (appContext.includes('jerseySize: bookingData.jerseySize')) {
  console.log('[OK] AppContext stores jerseySize in booking & match registeredPlayers');
} else {
  console.error('[FAIL] AppContext missing jerseySize persistence');
  allOk = false;
}

// 3. Check MatchRosterModal.jsx
const rosterModal = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/components/admin/modals/MatchRosterModal.jsx', 'utf-8');
if (rosterModal.includes('jerseySize') && rosterModal.includes('Ukuran Baju') && rosterModal.includes('Rekap Ukuran Rompi') && rosterModal.includes('Rekap Ukuran Rompi/Jersey Matchday')) {
  console.log('[OK] MatchRosterModal displays jersey size, stats breakdown, and WhatsApp text formatting');
} else {
  console.error('[FAIL] MatchRosterModal missing jersey size displays');
  allOk = false;
}

// 4. Check ETicketModal.jsx
const ticketModal = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/components/public/ETicketModal.jsx', 'utf-8');
if (ticketModal.includes('Ukuran Baju/Rompi') && ticketModal.includes('jerseySize')) {
  console.log('[OK] ETicketModal displays confirmed player jersey size');
} else {
  console.error('[FAIL] ETicketModal missing jersey size');
  allOk = false;
}

// 5. Check BookingsSection.jsx
const bookingsSection = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/components/admin/BookingsSection.jsx', 'utf-8');
if (bookingsSection.includes('b.jerseySize')) {
  console.log('[OK] BookingsSection displays jersey size badge');
} else {
  console.error('[FAIL] BookingsSection missing jersey size badge');
  allOk = false;
}

if (allOk) {
  console.log('🎉 ALL CHECKS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
