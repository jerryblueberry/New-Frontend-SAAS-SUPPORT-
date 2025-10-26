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
