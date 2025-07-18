// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext', // Ensures modern browser compatibility
    rollupOptions: {
      external: ['fs', 'path', 'os', 'crypto'], // Prevent bundling Node-only modules
    },
  },
  resolve: {
    alias: {
      // Prevent accidental backend imports (optional)
      fs: false,
      path: false,
      os: false,
      crypto: false,
    },
  },
})
