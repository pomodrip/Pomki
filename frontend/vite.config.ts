import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
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
        name: 'Pomki - Smart Study Companion',
        short_name: 'Pomki',
        description: 'An intelligent PWA for enhancing your learning process.',
        theme_color: '#2979FF',
        background_color: '#F5F5F7',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png', 
          },
          {
            src: 'logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
  optimizeDeps: {
    include: [
      'react-quill',
      'dayjs',
      '@mui/material',
      '@mui/icons-material',
      'react-redux',
      '@reduxjs/toolkit'
    ],
    exclude: [
      // 개발 환경에서만 사용되는 라이브러리들 제외
      '@vitejs/plugin-react'
    ]
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
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info']
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // node_modules 의존성 분할
          if (id.includes('node_modules')) {
            // React 코어 라이브러리
            if (id.includes('react') && !id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // React Router
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            
            // MUI 코어 (아이콘 제외)
            if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@emotion')) {
              return 'mui-core';
            }
            
            // MUI 아이콘 (별도 분리)
            if (id.includes('@mui/icons-material')) {
              return 'mui-icons';
            }
            
            // Redux 관련
            if (id.includes('redux') || id.includes('@reduxjs/toolkit')) {
              return 'redux-vendor';
            }
            
            // 리치 텍스트 에디터 (무거운 라이브러리)
            if (id.includes('react-quill') || id.includes('quill')) {
              return 'editor-vendor';
            }
            
            // 유틸리티 라이브러리
            if (id.includes('dayjs') || id.includes('axios') || id.includes('dompurify')) {
              return 'utility-vendor';
            }
            
            // 애니메이션 라이브러리
            if (id.includes('framer-motion')) {
              return 'animation-vendor';
            }
            
            // 기타 node_modules
            return 'vendor';
          }
          
          // 프로젝트 내부 코드 분할
          // 페이지별 청크 분할
          if (id.includes('src/pages/')) {
            if (id.includes('pages/Study/')) return 'pages-study';
            if (id.includes('pages/Timer/')) return 'pages-timer';
            if (id.includes('pages/Note/')) return 'pages-note';
            if (id.includes('pages/Auth/')) return 'pages-auth';
            if (id.includes('pages/Profile/')) return 'pages-profile';
            return 'pages-other';
          }
          
          // 컴포넌트별 청크 분할
          if (id.includes('src/components/')) {
            if (id.includes('components/common/')) return 'components-common';
            if (id.includes('components/ui/')) return 'components-ui';
            return 'components-other';
          }
          
          // API 관련
          if (id.includes('src/api/')) {
            return 'api';
          }
          
          // 스토어 관련
          if (id.includes('src/store/')) {
            return 'store';
          }
          
          // 기타 유틸리티
          if (id.includes('src/utils/') || id.includes('src/hooks/')) {
            return 'utils';
          }
        },
        // 청크 크기 최적화
        chunkFileNames: () => {
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return 'assets/[name]-[hash][extname]';
          
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            return `media/[name]-[hash][extname]`;
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(assetInfo.name)) {
            return `img/[name]-[hash][extname]`;
          }
          if (ext === 'css') {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // 청크 크기 경고 임계값 조정
    chunkSizeWarningLimit: 1000
  },
  envPrefix: ['VITE_', 'CI'],
});

