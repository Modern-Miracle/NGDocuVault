import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { componentTagger } from 'lovable-tagger';
import Terminal from 'vite-plugin-terminal';
import dotenv from 'dotenv';

// Load environment variables from .env.development
dotenv.config({ path: '.env' });

const isDevelopment = process.env.NODE_ENV === 'development';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    mode === 'development' && componentTagger(),
    mode === 'development' &&
      Terminal({
        console: 'terminal',
        output: ['terminal', 'console'],
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      external: [],
      onwarn(warning, warn) {
        // Suppress circular dependency warnings and external module warnings
        if (warning.code === 'CIRCULAR_DEPENDENCY' || warning.code === 'UNRESOLVED_IMPORT') {
          return;
        }
        warn(warning);
      },
    },
  },
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api/v1': {
        target: isDevelopment ? 'http://localhost:5000' : '',
        changeOrigin: true,
        secure: false,
      },
      '/api/eth-merkle': {
        target: 'https://eth.merkle.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/eth-merkle/, ''),
        secure: false,
      },
    },
  },
}));
