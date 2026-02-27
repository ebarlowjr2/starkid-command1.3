import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const workspaceRoot = path.resolve(__dirname, '../..');

// Vite dev proxy so /api/astros works locally without CORS.
// In production, Vercel serves /api/astros from the serverless function.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@starkid/core': path.resolve(workspaceRoot, 'packages/core/src/index.ts'),
      '@starkid/types': path.resolve(workspaceRoot, 'packages/types/src/index.ts'),
    },
  },
  server: {
    proxy: {
      '/api/astros': {
        target: 'http://api.open-notify.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/astros$/, '/astros.json'),
      },
    },
  },
});
