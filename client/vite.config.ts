import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // sql.js's browser build is UMD (module.exports = ...), not real ESM —
    // it needs esbuild's pre-bundling step to get CJS/UMD→ESM interop.
    // @queryquest/shared is a linked workspace package (CommonJS build) —
    // without this, Vite serves its dist/*.js raw via /@fs/ and the
    // browser's native ESM loader can't see its named CJS exports.
    include: ['sql.js', '@queryquest/shared'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})