// Simple vite config without imports to avoid module resolution issues
export default {
  server: {
    port: 5173,
    host: true
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['fs', 'path', 'os', 'crypto'],
    },
  },
  resolve: {
    alias: {
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
}