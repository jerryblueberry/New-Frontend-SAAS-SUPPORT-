// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // Use built-in React support without external plugin
    {
      name: 'react',
      transform(code, id) {
        if (id.endsWith('.jsx') || id.endsWith('.tsx')) {
          return {
            code: code,
            map: null
          }
        }
      }
    }
  ],
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    hmr: {
      overlay: true
    }
  },
  optimizeDeps: {
    force: true,
    exclude: [], // Don't exclude anything
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@mui/lab',
      '@mui/x-date-pickers',
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query'
    ]
  },
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
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react'
  }
})
