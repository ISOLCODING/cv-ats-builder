#!/usr/bin/env node
// scripts/get-clasp-token.js
// ============================================================
// Script helper untuk mengambil isi ~/.clasprc.json
// isinya perlu di-copy ke GitHub Secret: CLASPRC_JSON
// ============================================================
// Cara pakai:
//   node scripts/get-clasp-token.js
// ============================================================

import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

const clasprcPath = join(homedir(), '.clasprc.json');

console.log('\n📋 CLASP Token Reader');
console.log('═'.repeat(60));

if (!existsSync(clasprcPath)) {
  console.error('❌ File ~/.clasprc.json tidak ditemukan!');
  console.error('');
  console.error('Jalankan dulu:');
  console.error('  clasp login');
  console.error('');
  console.error('Lalu coba lagi script ini.');
  process.exit(1);
}

const content = readFileSync(clasprcPath, 'utf-8');

console.log('✅ File ~/.clasprc.json ditemukan!\n');
console.log('Salin teks di bawah ini ke GitHub Secret:');
console.log('  Setting → Secrets → Actions → New secret');
console.log('  Name  : CLASPRC_JSON');
console.log('  Value : (paste isi di bawah)\n');
console.log('─'.repeat(60));
console.log(content);
console.log('─'.repeat(60));
console.log('\n✅ Selesai! Paste nilai di atas ke GitHub Secret CLASPRC_JSON');
