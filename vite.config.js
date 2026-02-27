// vite.config.js
// Dual build mode:
//   VITE_BUILD_TARGET=pages  → build normal (GitHub Pages)
//   default                  → single-file bundle (Google Apps Script)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const isPages = process.env.VITE_BUILD_TARGET === 'pages';

export default defineConfig({
  // Base path untuk GitHub Pages: /cv-ats-builder/
  // Mode GAS tidak butuh base path
  base: isPages ? '/cv-ats-builder/' : '/',

  plugins: [
    react(),
    // viteSingleFile hanya untuk mode GAS
    ...(!isPages ? [viteSingleFile()] : []),
  ],
  define: {
    global: 'window',
  },
  build: {
    outDir: isPages ? 'dist-pages' : 'dist',
    target: 'es2017',
    // Mode GAS: semua inline jadi 1 file
    // Mode Pages: build normal dengan chunk splitting
    rollupOptions: isPages
      ? {}
      : {
          output: {
            inlineDynamicImports: true,
          },
        },
    assetsInlineLimit: isPages ? 4096 : 100000000,
    cssCodeSplit: isPages ? true : false,
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
