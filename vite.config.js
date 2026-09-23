import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: [
      'mate-club.masondo.dev',
      '.masondo.dev',
      'localhost',
      '127.0.0.1'
    ],
    cors: true
  },
  preview: {
    host: true,
    allowedHosts: [
      'mate-club.masondo.dev',
      '.masondo.dev',
      'localhost',
      '127.0.0.1'
    ],
    cors: true
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/canvas-confetti') || id.includes('node_modules/jsqr')) {
            return 'vendor-utils';
          }
        }
      }
    }
  }
})
