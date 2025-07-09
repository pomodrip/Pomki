import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      tsconfigPaths(),
      svgr(),
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        injectRegister: 'auto',
        devOptions: {
          enabled: false,
        },
        workbox: {
        importScripts: ['firebase-messaging-sw.js'],
        globPatterns: ['**/*.{js,css,svg}'], // html 제외
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
            },
          },
        ],
        },
        manifest: {
          name: 'Pomkist - 효율적인 공부복습',
          short_name: 'Pomkist',
          description: '효율적인 학습을 위한 서비스.',
          theme_color: '#2979FF',
          background_color: '#F5F5F7',
          display: "standalone",
          orientation: "portrait-primary",
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'icon-144x144.png',
              sizes: '144x144',
              type: 'image/png',
            },
            {
              src: 'icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'icon-180x180.png',
              sizes: '180x180',
              type: 'image/png',
            },
            {
              src: 'icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
          ],
          categories:[
            "education"
          ]
        },
      }),
    ],
    define: {
      '__VITE_FIREBASE_API_KEY__': JSON.stringify(env.VITE_FIREBASE_API_KEY),
      '__VITE_FIREBASE_AUTH_DOMAIN__': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
      '__VITE_FIREBASE_PROJECT_ID__': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
      '__VITE_FIREBASE_STORAGE_BUCKET__': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
      '__VITE_FIREBASE_MESSAGING_SENDER_ID__': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      '__VITE_FIREBASE_APP_ID__': JSON.stringify(env.VITE_FIREBASE_APP_ID),
    },
    optimizeDeps: {
    include: ['react-quill'],
  },
  server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8088',
          changeOrigin: true,
          secure: false,
        },
        '/oauth2': {
          target: 'http://localhost:8088',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    envPrefix: ['VITE_', 'CI'],
  };
});
