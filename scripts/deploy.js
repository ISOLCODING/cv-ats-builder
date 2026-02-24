#!/usr/bin/env node
/**
 * scripts/deploy.js
 * =============================================================
 * Deploy otomatis: Build → Copy → Clasp Push
 * Jalankan: npm run deploy
 * =============================================================
 */

import { execSync } from 'child_process';

const run = (cmd, label) => {
  console.log(`\n🔄  ${label}...`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅  ${label} selesai`);
  } catch (err) {
    console.error(`❌  Gagal: ${label}`);
    process.exit(1);
  }
};

console.log('🚀  CV ATS Builder — Deploy ke Google Apps Script');
console.log('═'.repeat(52));

run('npm run build',                  'Vite Build (React → single HTML)');
run('node scripts/copy-build.js',     'Copy dist → gas/index.html');
run('clasp push --force',             'CLASP Push → Google Apps Script');

console.log('\n🎉  Deploy berhasil!');
console.log('👉  Buka: https://script.google.com');
