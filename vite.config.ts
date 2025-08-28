import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import * as path from 'node:path';
import * as cp from 'node:child_process';

// * https://stackoverflow.com/questions/70436753/how-to-add-commit-hash-into-reactjs-vite-config-js
process.env.VITE_COMMIT_SHA = cp.execSync('git rev-parse HEAD').toString();
process.env.VITE_COMMIT_SHA_SHORT = cp.execSync('git rev-parse --short HEAD').toString();
process.env.VITE_BUILD_TIME = new Date().toISOString();

const plugin_pwa = () => VitePWA({
  strategies: 'injectManifest',
  srcDir: 'src/service-worker',
  filename: 'sw.ts',
  registerType: 'autoUpdate',
  injectRegister: false,

  pwaAssets: {
    disabled: false,
    config: true,
  },

  manifest: {
    name: 'todoapp-pwa',
    short_name: 'todoapp-pwa',
    description: 'todoapp-pwa',
    theme_color: '#ffffff',
  },

  injectManifest: {
    globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
  },

  devOptions: {
    enabled: true,
    navigateFallback: 'index.html',
    suppressWarnings: true,
    type: 'module',
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), plugin_pwa()],
  server: {
    port: 6789,
  },
  preview: {
    port: 6987,
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use 'src/scss/common.scss' as *;`,
      },
    },
  },
  resolve: {
    alias: {
      'src': path.resolve(__dirname, './src'),
    },
  },
  base: '/todoapp-pwa', // * https://vite.dev/guide/build.html#public-base-path
})
