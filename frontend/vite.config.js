import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Proxy API to Express. Use 127.0.0.1 so Windows does not resolve "localhost" to IPv6 ::1 and miss Node on IPv4.
const apiProxy = {
  '/api': { target: 'http://127.0.0.1:5050', changeOrigin: true },
  '/uploads': { target: 'http://127.0.0.1:5050', changeOrigin: true },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    proxy: apiProxy,
  },
  /** `npm run preview` also proxies /api — without this, /api calls fail (Failed to fetch / wrong response). */
  preview: {
    port: 4173,
    proxy: apiProxy,
  },
})
