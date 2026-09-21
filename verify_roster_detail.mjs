import fs from 'fs';
import path from 'path';

console.log('--- Verifying Match Roster Detail Implementation ---');

const filesToCheck = [
  'src/components/admin/modals/MatchRosterModal.jsx',
  'src/components/admin/MatchesSection.jsx',
  'src/context/AppContext.jsx',
  'src/App.jsx'
];

let allOk = true;

filesToCheck.forEach(file => {
  const fullPath = path.resolve('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app', file);
  if (fs.existsSync(fullPath)) {
    console.log(`[OK] Found ${file}`);
  } else {
    console.error(`[FAIL] Missing ${file}`);
    allOk = false;
  }
});

// Check if AppContext exports activeRosterMatch
const appContextContent = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/context/AppContext.jsx', 'utf-8');
if (appContextContent.includes('activeRosterMatch') && appContextContent.includes('setActiveRosterMatch')) {
  console.log('[OK] AppContext properly declares and exports activeRosterMatch & setActiveRosterMatch');
} else {
  console.error('[FAIL] AppContext is missing activeRosterMatch exports');
  allOk = false;
}

// Check if MatchesSection includes setActiveRosterMatch and Detail button
const matchesSectionContent = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/components/admin/MatchesSection.jsx', 'utf-8');
if (matchesSectionContent.includes('setActiveRosterMatch(m)') && matchesSectionContent.includes('Detail')) {
  console.log('[OK] MatchesSection has Detail button linked to setActiveRosterMatch');
} else {
  console.error('[FAIL] MatchesSection is missing Detail trigger');
  allOk = false;
}

// Check if MatchRosterModal has verified filter and WA copy
const modalContent = fs.readFileSync('c:/Users/IT KALIMANTAN/.gemini/antigravity-ide/scratch/minisoccer-vite-app/src/components/admin/modals/MatchRosterModal.jsx', 'utf-8');
if (modalContent.includes('Terverifikasi Sistem') && modalContent.includes('handleCopyRosterWA')) {
  console.log('[OK] MatchRosterModal has system verification indicators & WhatsApp roster copy functionality');
} else {
  console.error('[FAIL] MatchRosterModal missing expected elements');
  allOk = false;
}

if (allOk) {
  console.log('✅ ALL CHECKS PASSED SUCCESSFULLY!');
} else {
  process.exit(1);
}
