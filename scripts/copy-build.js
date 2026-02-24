#!/usr/bin/env node
/**
 * scripts/copy-build.js
 * =============================================================
 * Setelah `vite build`, file HTML tunggal (dist/index.html) perlu
 * disalin ke folder gas/ agar bisa di-push ke Google Apps Script
 * sebagai HtmlService template.
 *
 * GAS hanya bisa melayani satu file HTML (index.html) sehingga
 * Vite dikonfigurasi dengan vite-plugin-singlefile agar seluruh
 * JS + CSS masuk ke dalam satu file HTML.
 * =============================================================
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const root       = resolve(__dirname, '..');

const distIndex = resolve(root, 'dist', 'index.html');
const gasIndex  = resolve(root, 'gas',  'index.html');

// Periksa dist/index.html ada
if (!existsSync(distIndex)) {
  console.error('❌  dist/index.html tidak ditemukan. Jalankan `npm run build` terlebih dahulu.');
  process.exit(1);
}

// Baca hasil build
let html = readFileSync(distIndex, 'utf-8');

// Tambah meta tag GAS (opsional — membantu debugging)
const gasComment = `<!-- Deployed via clasp on ${new Date().toISOString()} -->\n`;
html = html.replace('<html', gasComment + '<html');

// Tulis ke gas/index.html
writeFileSync(gasIndex, html, 'utf-8');

const sizeKB = (Buffer.byteLength(html, 'utf-8') / 1024).toFixed(1);
console.log(`✅  gas/index.html berhasil dibuat (${sizeKB} KB)`);
