// vite.config.js
// Build konfigurasi untuk menghasilkan single-file HTML (inline JS + CSS)
// agar bisa diinjeksi ke gas/index.html untuk deployment Google Apps Script

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile(), // Inline semua JS & CSS ke satu file HTML
  ],
  build: {
    outDir: 'dist',
    // Target: ES2017 untuk kompatibilitas browser modern
    target: 'es2017',
    // Disable chunk splitting — semua jadi satu bundle
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    // Pastikan assets di-inline, bukan di-copy
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
  // Resolve alias untuk import lebih bersih
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
