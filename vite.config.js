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
  }
})
