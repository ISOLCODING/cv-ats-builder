import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const buildTarget = process.env.VITE_BUILD_TARGET || 'gas';
const isPages = buildTarget === 'pages';
const isVercel = buildTarget === 'vercel';
const isGas = buildTarget === 'gas';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gasEndpoint = env.VITE_GAS_ENDPOINT || '';
  
  if (gasEndpoint) {
    console.log('\x1b[36m%s\x1b[0m', '📡 GAS Endpoint:', gasEndpoint);
  } else {
    console.log('\x1b[31m%s\x1b[0m', '❌ GAS Endpoint not found in .env!');
  }

  return {
    // Base path: /cv-ats-builder/ hanya untuk GitHub Pages, lainnya /
    base: isPages ? '/cv-ats-builder/' : '/',

    server: {
      proxy: {
        '/api/gas': {
          target: 'https://script.google.com',
          changeOrigin: true,
          secure: false,
          followRedirects: true,
          rewrite: (path) => {
            // Kita ambil bagian path dari endpoint asli (mulai dari /macros/s/...)
            const gasPath = gasEndpoint.replace('https://script.google.com', '');
            return gasPath;
          },
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('📡 Proxying:', req.method, req.url, '→ GOOGLE SCRIPT');
            });
          },
        },
      },
    },

    plugins: [
      react(),
      // viteSingleFile hanya untuk mode GAS (build default)
      ...(isGas ? [viteSingleFile()] : []),
    ],
    define: {
      global: 'window',
    },
    build: {
      outDir: isPages ? 'dist-pages' : 'dist',
      target: 'es2017',
      rollupOptions: (isPages || isVercel)
        ? {}
        : {
            output: {
              inlineDynamicImports: true,
            },
          },
      assetsInlineLimit: (isPages || isVercel) ? 4096 : 100 * 1024 * 1024,
      cssCodeSplit: (isPages || isVercel) ? true : false,
      modulePreload: {
        polyfill: false,
      },
    },

    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});