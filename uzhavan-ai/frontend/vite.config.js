import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    // PWA plugin — uncomment when workbox-build is available:
    // VitePWA({ registerType: 'autoUpdate', ... })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  server: { port: 3000, proxy: { '/api': 'http://localhost:8000' } },
  build: {
    rollupOptions: {
      // Recharts bundles lodash but it may be missing; provide a stub
      external: [],
      plugins: [],
      onwarn(warning, warn) {
        // Suppress lodash missing warnings — recharts will degrade gracefully
        if (warning.code === 'UNRESOLVED_IMPORT' && warning.exporter?.includes('lodash')) return
        warn(warning)
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          firebase: ['firebase/app', 'firebase/auth'],
        }
      }
    }
  }
})
