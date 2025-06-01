import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { componentTagger } from 'lovable-tagger';
import Terminal from 'vite-plugin-terminal';
import dotenv from 'dotenv';

// Load environment variables from .env.development
dotenv.config({ path: '.env' });

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
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:5000',
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
