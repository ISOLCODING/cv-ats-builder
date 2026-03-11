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

  return {
    // Base path: /cv-ats-builder/ hanya untuk GitHub Pages, lainnya /
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