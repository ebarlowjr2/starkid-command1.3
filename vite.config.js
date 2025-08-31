import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite dev proxy so /api/astros works locally without CORS.
// In production, Vercel serves /api/astros from the serverless function.
export default defineConfig({
  plugins: [react()],
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
