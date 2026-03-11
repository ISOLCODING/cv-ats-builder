import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const isPages = process.env.VITE_BUILD_TARGET === 'pages';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gasEndpoint = env.VITE_GAS_ENDPOINT || '';

  return {
    base: isPages ? '/cv-ats-builder/' : '/',

    server: {
      proxy: {
        '/api/gas': {
          target: gasEndpoint,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gas/, ''),
          followRedirects: true,
        },
      },
    },

    plugins: [
      react(),
      ...(!isPages ? [viteSingleFile()] : []),
    ],

    define: {
      global: 'window',
      // FIX: define __VITE_PRELOAD__ agar tidak error saat runtime
      __VITE_PRELOAD__: 'undefined',
    },

    build: {
      outDir: isPages ? 'dist-pages' : 'dist',
      target: 'es2017',
      rollupOptions: isPages
        ? {
            output: {
              // FIX: matikan manual chunk splitting agar tidak ada
              // dynamic import yang referensikan __VITE_PRELOAD__
              manualChunks: undefined,
            },
          }
        : {
            output: {
              inlineDynamicImports: true,
            },
          },
      assetsInlineLimit: isPages ? 4096 : 100000000,
      cssCodeSplit: isPages,
      // FIX: gunakan object form, bukan boolean false
      // polyfill: false → browser handle sendiri, tidak inject variabel
      modulePreload: isPages
        ? { polyfill: false }
        : false,
    },

    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});