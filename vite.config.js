import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

const isPages = process.env.VITE_BUILD_TARGET === 'pages';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gasEndpoint = env.VITE_GAS_ENDPOINT || '';

  return {
    // Base path untuk GitHub Pages: /cv-ats-builder/
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
      // viteSingleFile hanya untuk mode GAS
      ...(!isPages ? [viteSingleFile()] : []),
    ],
    define: {
      global: 'window',
    },
    build: {
      outDir: isPages ? 'dist-pages' : 'dist',
      target: 'es2017',
      rollupOptions: isPages
        ? {}
        : {
            output: {
              inlineDynamicImports: true,
            },
          },
      assetsInlineLimit: isPages ? 4096 : 100000000,
      cssCodeSplit: !isPages ? false : true,
    },

    resolve: {
      alias: {
        '@': '/src',
      },
    },
  };
});
